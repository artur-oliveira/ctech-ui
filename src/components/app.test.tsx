import {act, render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {describe, expect, it, vi} from "vitest"

import {createLiveness} from "../lib/network/liveness"
import {Button} from "./button"
import {NetworkProvider, useNetwork} from "./network"
import {Switch} from "./switch"

describe("NetworkProvider with an injected probe", () => {
  function Status() {
    return <p data-testid="s">{useNetwork().status}</p>
  }

  it("follows the given instance, does not create another, and reports reconnects", async () => {
    let up = false
    const fetch = vi.fn(async () => ({ok: up}) as Response)
    const probe = createLiveness({url: "/h", fetch: fetch as never, failuresToUnavailable: 1})
    const onReconnect = vi.fn()
    render(<NetworkProvider liveness={probe} start={false} banner={false} onReconnect={onReconnect}><Status /></NetworkProvider>)
    // `start={false}`: the provider never polls on its own.
    await act(async () => {})
    expect(fetch).not.toHaveBeenCalled()
    // The app's own client probes through the shared instance.
    await act(async () => { await probe.check() })
    expect(screen.getByTestId("s")).toHaveTextContent("unavailable")
    up = true
    await act(async () => { await probe.check() })
    expect(screen.getByTestId("s")).toHaveTextContent("online")
    expect(onReconnect).toHaveBeenCalledTimes(1)
  })

  it("starts the injected probe by default, and still needs url or liveness", async () => {
    const fetch = vi.fn(async () => ({ok: true}) as Response)
    const probe = createLiveness({url: "/h", fetch: fetch as never})
    const {unmount} = render(<NetworkProvider liveness={probe} banner={false}><Status /></NetworkProvider>)
    await act(async () => {})
    expect(fetch).toHaveBeenCalled()
    unmount()
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)
    expect(() => render(<NetworkProvider banner={false}><Status /></NetworkProvider>)).toThrow(/url.*liveness/)
    error.mockRestore()
  })
})

describe("Switch touch target", () => {
  it("has a 44px hit area when it stands alone", () => {
    render(<Switch aria-label="Notificações" />)
    expect(screen.getByRole("switch").className).toContain("after:-inset-y-2.5")
  })

  it("drops the extra hit area inside a wrapping label", () => {
    render(<label>Notificações<Switch /></label>)
    expect(screen.getByRole("switch").className).toContain("in-[label]:after:hidden")
  })
})

describe("Button", () => {
  it("loading disables, marks aria-busy and shows a hidden spinner beside the label", async () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Salvar</Button>)
    const button = screen.getByRole("button", {name: "Salvar"})
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).toHaveAttribute("disabled")
    expect(button.querySelector("svg[aria-hidden=true]")).not.toBeNull()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("is idle by default; light and lg are plain variants", () => {
    render(<Button variant="light" size="lg">Entrar</Button>)
    const button = screen.getByRole("button", {name: "Entrar"})
    expect(button).not.toHaveAttribute("aria-busy")
    expect(button).not.toBeDisabled()
    expect(button.className).toContain("bg-background")
    expect(button.className).toContain("h-12")
    expect(button.querySelector("svg")).toBeNull()
  })

  it("disabled stays disabled", () => {
    render(<Button disabled>Salvar</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })
})
