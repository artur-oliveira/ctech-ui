import {act, render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {describe, expect, it, vi} from "vitest"

import {NetworkProvider, OfflineBanner, UnavailableScreen} from "./network"

describe("OfflineBanner", () => {
  it("is a polite live region that stays mounted and is empty when online", () => {
    const {rerender} = render(<OfflineBanner status="online"/>)
    const region = screen.getByRole("status")
    expect(region.getAttribute("aria-live")).toBe("polite")
    expect(region.textContent).toBe("")
    rerender(<OfflineBanner status="offline" onRetry={() => {}}/>)
    expect(screen.getByRole("status").textContent).toContain("Você está sem internet")
    rerender(<OfflineBanner status="degraded" locale="en" labels={{degraded: "Flaky"}}/>)
    expect(screen.getByRole("status").textContent).toContain("Flaky")
  })

  it("retry is a real button with the localized name", async () => {
    const onRetry = vi.fn()
    render(<OfflineBanner status="offline" locale="en" onRetry={onRetry}/>)
    await userEvent.click(screen.getByRole("button", {name: "Try again"}))
    expect(onRetry).toHaveBeenCalled()
  })
})

describe("NetworkProvider + UnavailableScreen", () => {
  it("shows the 503 screen, retries on click and returns once the API answers", async () => {
    let up = false
    const fetch = vi.fn(async () => ({ok: up}) as Response)
    const onRecovered = vi.fn()
    const onReconnect = vi.fn()
    const onUnavailable = vi.fn()
    render(
      <NetworkProvider url="/h" fetch={fetch as never} failuresToUnavailable={1} banner={false} onReconnect={onReconnect} onUnavailable={onUnavailable}>
        <UnavailableScreen onRecovered={onRecovered}/>
      </NetworkProvider>
    )
    await act(async () => {})
    expect(screen.getByRole("alert").textContent).toContain("Serviço temporariamente indisponível")
    expect(onUnavailable).toHaveBeenCalled()
    expect(onRecovered).not.toHaveBeenCalled()
    up = true
    await userEvent.click(screen.getByRole("button", {name: "Tentar de novo"}))
    expect(onRecovered).toHaveBeenCalledTimes(1)
    expect(onReconnect).toHaveBeenCalledTimes(1)
  })
})
