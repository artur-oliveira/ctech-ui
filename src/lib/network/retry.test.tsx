import {describe, expect, it, vi} from "vitest"

import {parseRetryAfter, retryDelay, withRetry} from "./retry"

const fail = (status?: number, retryAfter?: string) => Object.assign(new Error("x"), {response: {status, headers: retryAfter ? {"retry-after": retryAfter} : {}}})
const opts = (extra = {}) => ({sleep: vi.fn(async () => {}), random: () => 0.5, ...extra})

describe("withRetry", () => {
  it("retries a safe GET twice on 503 then gives up with the last error", async () => {
    const fn = vi.fn(async () => { throw fail(503) })
    const o = opts()
    await expect(withRetry(fn, o)).rejects.toThrow("x")
    expect(fn).toHaveBeenCalledTimes(3)
    expect(o.sleep).toHaveBeenCalledTimes(2)
  })

  it("never replays a mutation without an Idempotency-Key, and does with one", async () => {
    const a = vi.fn(async () => { throw fail(503) })
    await expect(withRetry(a, opts({method: "POST"}))).rejects.toThrow()
    expect(a).toHaveBeenCalledTimes(1)
    const b = vi.fn(async (n: number) => { if (n < 2) throw fail(); return "ok" })
    await expect(withRetry(b, opts({method: "POST", idempotent: true}))).resolves.toBe("ok")
    expect(b).toHaveBeenCalledTimes(3)
  })

  it("does not retry 4xx answers, aborts, or more than 2 even if asked", async () => {
    const a = vi.fn(async () => { throw fail(404) })
    await expect(withRetry(a, opts())).rejects.toThrow()
    expect(a).toHaveBeenCalledTimes(1)
    const b = vi.fn(async () => { throw Object.assign(new Error("a"), {name: "AbortError"}) })
    await expect(withRetry(b, opts())).rejects.toThrow()
    expect(b).toHaveBeenCalledTimes(1)
    const c = vi.fn(async () => { throw fail(500) })
    await expect(withRetry(c, opts({maxRetries: 9}))).rejects.toThrow()
    expect(c).toHaveBeenCalledTimes(3)
  })

  it("waits for Retry-After (plus a nudge) instead of the backoff", async () => {
    const o = opts()
    await expect(withRetry(vi.fn(async (n: number) => { if (n === 0) throw fail(429, "2"); return 1 }), o)).resolves.toBe(1)
    expect(o.sleep).toHaveBeenCalledWith(2000 + 125)
  })
})

describe("retryDelay", () => {
  it("is full jitter under an exponential ceiling capped at 3s", () => {
    expect(retryDelay(1, undefined, () => 0.999)).toBeLessThan(250)
    expect(retryDelay(9, undefined, () => 0.999)).toBeLessThan(3000)
    expect(retryDelay(2, undefined, () => 0)).toBe(0)
  })
  it("parses seconds and HTTP dates, caps absurd values", () => {
    expect(parseRetryAfter("3")).toBe(3000)
    expect(parseRetryAfter(new Date(Date.now() + 5000).toUTCString())).toBeGreaterThan(3000)
    expect(parseRetryAfter("nope")).toBeNaN()
    expect(retryDelay(1, "99999", () => 0)).toBe(30_000)
  })
})
