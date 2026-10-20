/**
 * Retry policy as a pure function, independent of the HTTP library. Extracted
 * from ctech-wallet `retry.ts` (the decision rules and jitter) and the
 * ctech-billing client (Idempotency-Key on every write).
 */

/** At most two extra attempts: beyond that an outage is hammered, and the liveness probe should wait for recovery. */
const MAX_HTTP_RETRIES = 2
const RETRYABLE_HTTP_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504])
const SAFE_HTTP_METHODS = new Set(["get", "head", "options"])
/** A hostile or buggy Retry-After must not park a request for minutes. */
const MAX_RETRY_DELAY_MS = 30_000

interface RetryFailure {
  /** HTTP status, or undefined for a timeout, DNS failure or a proxy answering without CORS headers. */
  status?: number
  /** Raw Retry-After header: delta-seconds or an HTTP date. */
  retryAfter?: string | null
  /** The caller cancelled; never retried. */
  aborted?: boolean
}

interface RetryOptions {
  /** HTTP method of the call. Default "GET". */
  method?: string
  /** True when the call carries an Idempotency-Key, which makes a mutation safe to replay. */
  idempotent?: boolean
  /** Extra attempts, capped at 2. */
  maxRetries?: number
  /** Maps whatever the HTTP library throws to a failure. The default reads `status`/`response.status`/`response.headers["retry-after"]` (axios, ky-style and fetch wrappers). */
  classify?: (error: unknown) => RetryFailure
  signal?: AbortSignal
  /** Injection points for tests. */
  random?: () => number
  sleep?: (ms: number) => Promise<void>
}

function defaultClassify(error: unknown): RetryFailure {
  const e = error as {
    name?: string
    status?: number
    code?: string
    response?: {status?: number; headers?: {get?: (n: string) => string | null} & Record<string, unknown>}
  }
  const headers = e?.response?.headers
  const raw = typeof headers?.get === "function" ? headers.get("retry-after") : (headers?.["retry-after"] as string | undefined)
  return {
    status: e?.response?.status ?? e?.status,
    retryAfter: raw == null ? undefined : String(raw),
    aborted: e?.name === "AbortError" || e?.code === "ERR_CANCELED",
  }
}

/** Retry-After as milliseconds (seconds or HTTP date), or NaN when absent/invalid. */
function parseRetryAfter(value: string | null | undefined, now = Date.now()): number {
  if (value == null || value === "") return Number.NaN
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return seconds * 1000
  const date = Date.parse(value)
  return Number.isNaN(date) ? Number.NaN : date - now
}

/**
 * Delay before retry number `attempt` (1-based). Retry-After wins, plus a
 * small random nudge: every rate-limited client gets the same header, so
 * obeying it to the millisecond brings them back in lockstep. Otherwise full
 * jitter over an exponential ceiling (250ms, 500ms, ... capped at 3s).
 */
function retryDelay(attempt: number, retryAfter?: string | null, random: () => number = Math.random): number {
  const afterMs = parseRetryAfter(retryAfter)
  if (Number.isFinite(afterMs)) return Math.min(MAX_RETRY_DELAY_MS, Math.max(0, afterMs) + Math.floor(random() * 250))
  const ceiling = Math.min(3_000, 250 * 2 ** Math.max(0, attempt - 1))
  return Math.floor(random() * ceiling)
}

/** Safe methods always may be replayed; a mutation only with an Idempotency-Key (the server collapses the replay). */
function retryAllowed(method = "GET", idempotent = false): boolean {
  return SAFE_HTTP_METHODS.has(method.toLowerCase()) || idempotent
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Runs `fn`, retrying a retryable failure (no status, or 408/425/429/5xx) at
 * most twice, with jitter and Retry-After. Rethrows the last error untouched.
 */
async function withRetry<T>(fn: (attempt: number) => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {method, idempotent, signal, classify = defaultClassify, random = Math.random, sleep = defaultSleep} = options
  const max = Math.min(MAX_HTTP_RETRIES, Math.max(0, options.maxRetries ?? MAX_HTTP_RETRIES))
  const allowed = retryAllowed(method, idempotent)
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt)
    } catch (error) {
      const failure = classify(error)
      const retryable = failure.status === undefined || RETRYABLE_HTTP_STATUSES.has(failure.status)
      if (!allowed || failure.aborted || signal?.aborted || !retryable || attempt >= max) throw error
      await sleep(retryDelay(attempt + 1, failure.retryAfter, random))
    }
  }
}

export {MAX_HTTP_RETRIES, parseRetryAfter, retryAllowed, retryDelay, withRetry, type RetryFailure, type RetryOptions}
