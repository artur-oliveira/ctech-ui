/**
 * One health probe owns the question "is the API up". Extracted from the
 * ctech-poker/wallet/dfe `liveness.ts` modules, minus Next, env vars, module
 * singletons and mock flags: everything is injected, and every instance is
 * independent (so tests and multiple APIs need no reset hooks).
 *
 * online      last probe answered 2xx.
 * degraded    probes are failing, but fewer than `failuresToUnavailable` in a row.
 * unavailable that many consecutive server-side failures: escalate to a full screen.
 * offline     the device itself has no network (navigator.onLine === false); never escalates.
 */
type NetworkStatus = "online" | "degraded" | "offline" | "unavailable"

interface LivenessSnapshot {
  status: NetworkStatus
  /** Consecutive failed probe cycles. */
  failures: number
  checkedAt: number | null
}

interface LivenessOptions {
  /** Health endpoint, e.g. `${apiBase}/v1.0/health`. */
  url: string
  fetch?: typeof fetch
  /** Per-probe budget. Default 5s. */
  timeoutMs?: number
  /** Poll interval while healthy. Default 30s. */
  intervalMs?: number
  /** Ceiling of the backoff while failing. Default 30s. */
  maxIntervalMs?: number
  /** Consecutive failed cycles before `unavailable`. Default 3. */
  failuresToUnavailable?: number
  /** Called once when the status returns to `online` from any other state: the place to refetch/invalidate queries. */
  onReconnect?: () => void
  /** Overrides navigator.onLine (tests, React Native). */
  isOnline?: () => boolean
  random?: () => number
}

interface Liveness {
  getSnapshot(): LivenessSnapshot
  subscribe(listener: () => void): () => void
  /** Probes now (deduplicated while one is in flight). Resolves true when the API answered. */
  check(): Promise<boolean>
  /** Starts polling and listening to online/offline/visibilitychange. Returns the stop function. */
  start(): () => void
}

const INITIAL: LivenessSnapshot = {status: "online", failures: 0, checkedAt: null}

/** Equal jitter over an exponential ceiling: never a near-zero busy loop, never synchronized clients. */
function livenessDelay(failures: number, intervalMs = 30_000, maxIntervalMs = 30_000, random: () => number = Math.random): number {
  if (failures <= 0) return intervalMs
  const ceiling = Math.min(maxIntervalMs, 1_000 * 2 ** (failures - 1))
  return Math.floor(ceiling / 2 + (random() * ceiling) / 2)
}

function createLiveness(options: LivenessOptions): Liveness {
  const {url, timeoutMs = 5_000, intervalMs = 30_000, maxIntervalMs = 30_000, failuresToUnavailable = 3, random = Math.random} = options
  const isOnline = options.isOnline ?? (() => typeof navigator === "undefined" || navigator.onLine)
  const listeners = new Set<() => void>()
  let snapshot = INITIAL
  let inFlight: Promise<boolean> | null = null

  function publish(status: NetworkStatus, failures: number) {
    const previous = snapshot.status
    snapshot = {status, failures, checkedAt: Date.now()}
    listeners.forEach((l) => l())
    if (status === "online" && previous !== "online") options.onReconnect?.()
  }

  async function probe(): Promise<boolean> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      // A dead load balancer answers without CORS headers and the browser surfaces a TypeError, not a status: a rejection counts as a failed response.
      const response = await (options.fetch ?? fetch)(url, {method: "GET", cache: "no-store", credentials: "omit", headers: {Accept: "application/json"}, signal: controller.signal})
      return response.ok
    } catch {
      return false
    } finally {
      clearTimeout(timer)
    }
  }

  function check(): Promise<boolean> {
    if (!isOnline()) {
      publish("offline", snapshot.failures + 1)
      return Promise.resolve(false)
    }
    inFlight ??= probe()
      .then((ok) => {
        if (ok) publish("online", 0)
        else {
          const failures = snapshot.failures + 1
          publish(failures >= failuresToUnavailable ? "unavailable" : "degraded", failures)
        }
        return ok
      })
      .finally(() => { inFlight = null })
    return inFlight
  }

  function start() {
    let timer: ReturnType<typeof setTimeout> | undefined
    let stopped = false
    const run = async () => {
      clearTimeout(timer)
      await check()
      if (!stopped) timer = setTimeout(run, livenessDelay(snapshot.failures, intervalMs, maxIntervalMs, random))
    }
    const onOnline = () => void run()
    const onOffline = () => {
      clearTimeout(timer)
      publish("offline", snapshot.failures + 1)
      timer = setTimeout(run, livenessDelay(snapshot.failures, intervalMs, maxIntervalMs, random))
    }
    const onVisible = () => { if (document.visibilityState === "visible" && snapshot.status !== "online") void run() }
    void run()
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      stopped = true
      clearTimeout(timer)
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }

  return {getSnapshot: () => snapshot, subscribe: (l) => (listeners.add(l), () => void listeners.delete(l)), check, start}
}

export {createLiveness, livenessDelay, type Liveness, type LivenessOptions, type LivenessSnapshot, type NetworkStatus}
