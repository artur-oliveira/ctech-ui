import {act, renderHook} from "@testing-library/react"
import {afterEach, describe, expect, it, vi} from "vitest"

import {useOnlineStatus} from "./use-online-status"

const setOnline = (v: boolean) => {
  Object.defineProperty(navigator, "onLine", {value: v, configurable: true})
  act(() => { window.dispatchEvent(new Event(v ? "online" : "offline")) })
}
afterEach(() => setOnline(true))

describe("useOnlineStatus", () => {
  it("tracks online/offline events and calls onReconnect only on offline -> online", () => {
    const onReconnect = vi.fn()
    const {result} = renderHook(() => useOnlineStatus(onReconnect))
    expect(result.current).toBe(true)
    setOnline(false)
    expect(result.current).toBe(false)
    expect(onReconnect).not.toHaveBeenCalled()
    setOnline(true)
    expect(result.current).toBe(true)
    expect(onReconnect).toHaveBeenCalledTimes(1)
  })
})
