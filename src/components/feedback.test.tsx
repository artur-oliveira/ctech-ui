import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {describe, expect, it, vi} from "vitest"

import {Alert, AlertDescription, AlertTitle} from "./alert"
import {Checkbox} from "./checkbox"
import {LoadingRegion, Skeleton, SkeletonList, StatCardsSkeleton} from "./skeleton"
import {UserMenu} from "./user-menu"

describe("Alert", () => {
  it("renders a body-only alert without an empty title", () => {
    render(<Alert tone="danger">Não foi possível salvar.</Alert>)
    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("Não foi possível salvar.")
    expect(alert.querySelector("p")).toBeNull()
  })

  it("still renders the title, and the composed parts, and a decorative icon", () => {
    render(
      <Alert tone="info" title="Aviso" icon={<svg data-testid="i" />}>
        <AlertTitle>Sub</AlertTitle>
        <AlertDescription>Detalhe</AlertDescription>
      </Alert>
    )
    expect(screen.getByRole("status")).toHaveTextContent("AvisoSubDetalhe")
    expect(screen.getByTestId("i").closest("[aria-hidden]")).not.toBeNull()
  })
})

describe("Checkbox", () => {
  it("draws a dash for indeterminate and a check otherwise, both driven by data attributes", () => {
    const {container, rerender} = render(<Checkbox indeterminate aria-label="todos" />)
    const box = screen.getByRole("checkbox")
    expect(box).toHaveAttribute("aria-checked", "mixed")
    const indicator = container.querySelector("[data-slot=checkbox] > span")!
    expect(indicator).toHaveAttribute("data-indeterminate")
    expect(indicator.querySelector("path[d='M3.75 8h8.5']")).not.toBeNull()
    // The check is hidden by the group variant while indeterminate.
    expect(indicator.querySelector("svg.group-data-\\[indeterminate\\]\\/ind\\:hidden")).not.toBeNull()
    rerender(<Checkbox checked aria-label="todos" />)
    expect(container.querySelector("[data-slot=checkbox] > span")).not.toHaveAttribute("data-indeterminate")
  })
})

describe("Skeleton helpers", () => {
  it("announces one status label and keeps the blocks silent", () => {
    render(<SkeletonList label="Carregando lista" count={4} />)
    const region = screen.getByRole("status")
    expect(region).toHaveAttribute("aria-busy", "true")
    expect(region).toHaveTextContent("Carregando lista")
    expect(region.querySelectorAll("[data-slot=skeleton][aria-hidden=true]")).toHaveLength(4)
  })

  it("stat cards and shimmer", () => {
    render(<StatCardsSkeleton label="Carregando números" count={2} shimmer />)
    expect(screen.getByRole("status", {name: ""})).toHaveTextContent("Carregando números")
    expect(document.querySelectorAll("[data-shimmer]")).toHaveLength(4)
  })

  it("LoadingRegion and a plain pulsing Skeleton", () => {
    const {container} = render(<LoadingRegion label="Carregando"><Skeleton /></LoadingRegion>)
    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(container.querySelector("[data-slot=skeleton]")!.className).toContain("animate-pulse")
  })
})

describe("UserMenu sign-out state", () => {
  async function open(props: Partial<Parameters<typeof UserMenu>[0]>) {
    const user = userEvent.setup()
    render(<UserMenu name="Maria" onSignOut={props.onSignOut ?? vi.fn()} {...props} />)
    await user.click(screen.getByRole("button", {name: /Menu da conta|Account menu/}))
    return user
  }

  it("shows the pending label and does not fire while pending", async () => {
    const onSignOut = vi.fn()
    const user = await open({onSignOut, signOutPending: true})
    const item = await screen.findByRole("menuitem", {name: "Saindo…"})
    expect(item).toHaveAttribute("aria-busy", "true")
    expect(item).toHaveAttribute("aria-disabled", "true")
    await user.click(item)
    expect(onSignOut).not.toHaveBeenCalled()
  })

  it("disabled keeps the label; English catalog", async () => {
    await open({signOutDisabled: true, locale: "en"})
    const item = await screen.findByRole("menuitem", {name: "Sign out"})
    expect(item).toHaveAttribute("aria-disabled", "true")
    expect(item).not.toHaveAttribute("aria-busy")
  })
})
