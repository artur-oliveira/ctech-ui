import {afterEach, beforeEach, describe, expect, it, vi} from "vitest"

import {createLiveness, livenessDelay} from "./liveness"

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const res = (ok: boolean) => ({ok}) as Response

describe("createLiveness", () => {
  it("goes degraded, then unavailable after N server failures, then returns by itself and calls onReconnect", async () => {
    let up = false
    const fetch = vi.fn(async () => { if (!up) throw new TypeError("cors"); return res(true) })
    const onReconnect = vi.fn()
    const l = createLiveness({url: "/v1.0/health", fetch: fetch as never, failuresToUnavailable: 3, onReconnect, random: () => 1})
    const stop = l.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(l.getSnapshot().status).toBe("degraded")
    await vi.advanceTimersByTimeAsync(30_000)
    await vi.advanceTimersByTimeAsync(30_000)
    expect(l.getSnapshot().status).toBe("unavailable")
    up = true
    await vi.advanceTimersByTimeAsync(30_000)
    expect(l.getSnapshot()).toMatchObject({status: "online", failures: 0})
    expect(onReconnect).toHaveBeenCalledTimes(1)
    stop()
  })

  it("times out a hung probe and treats a non-2xx as a failure", async () => {
    const hung = vi.fn((_u: string, init?: RequestInit) => new Promise<Response>((_, reject) => init!.signal!.addEventListener("abort", () => reject(new Error("abort")))))
    const l = createLiveness({url: "/h", fetch: hung as never, timeoutMs: 1000})
    const p = l.check()
    await vi.advanceTimersByTimeAsync(1000)
    expect(await p).toBe(false)
    const l2 = createLiveness({url: "/h", fetch: (async () => res(false)) as never})
    expect(await l2.check()).toBe(false)
    expect(l2.getSnapshot().status).toBe("degraded")
  })

  it("is offline (never unavailable) when the device has no network, and shares one in-flight probe", async () => {
    const fetch = vi.fn(async () => res(true))
    const l = createLiveness({url: "/h", fetch: fetch as never, isOnline: () => false, failuresToUnavailable: 1})
    await l.check()
    expect(l.getSnapshot().status).toBe("offline")
    expect(fetch).not.toHaveBeenCalled()
    const l2 = createLiveness({url: "/h", fetch: fetch as never})
    await Promise.all([l2.check(), l2.check()])
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("backs off with equal jitter up to the ceiling", () => {
    expect(livenessDelay(0)).toBe(30_000)
    expect(livenessDelay(1, 30_000, 30_000, () => 0)).toBe(500)
    expect(livenessDelay(20, 30_000, 30_000, () => 1)).toBe(30_000)
  })
})
