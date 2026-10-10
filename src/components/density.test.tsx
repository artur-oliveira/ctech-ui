import {render, screen} from "@testing-library/react"
import {describe, expect, it} from "vitest"

import {Button} from "./button"
import {Drawer} from "./drawer"
import {Modal} from "./modal"
import {DensityScope, ThemeProvider} from "./theme-provider"

// Drawer and Modal render in a portal, outside the caller's [data-density]. A
// compact console must get compact overlays, on a desktop too.

const densityOf = (el: HTMLElement) => el.closest("[data-density]")?.getAttribute("data-density")

describe("Overlay density", () => {
  it("a drawer opened inside a DensityScope is compact", () => {
    render(
      <ThemeProvider theme="billing">
        <DensityScope density="compact">
          <Drawer open onClose={() => {}} title="Novo lançamento"><Button>Salvar</Button></Drawer>
        </DensityScope>
      </ThemeProvider>
    )
    const dialog = screen.getByRole("dialog", {name: "Novo lançamento"})
    expect(densityOf(dialog)).toBe("compact")
    expect(dialog.closest("[data-ctech-theme]")).toHaveAttribute("data-ctech-theme", "billing")
  })

  it("a modal opened inside a DensityScope is compact", () => {
    render(
      <ThemeProvider theme="billing">
        <DensityScope density="compact">
          <Modal open onClose={() => {}} title="Excluir?" />
        </DensityScope>
      </ThemeProvider>
    )
    expect(densityOf(screen.getByRole("dialog", {name: "Excluir?"}))).toBe("compact")
  })

  it("follows ThemeProvider outside a scope, and the density prop overrides both", () => {
    const {rerender} = render(
      <ThemeProvider theme="account" density="compact">
        <Modal open onClose={() => {}} title="A" />
      </ThemeProvider>
    )
    expect(densityOf(screen.getByRole("dialog", {name: "A"}))).toBe("compact")
    rerender(
      <ThemeProvider theme="account" density="compact">
        <Modal open onClose={() => {}} title="A" density="comfortable" />
      </ThemeProvider>
    )
    expect(densityOf(screen.getByRole("dialog", {name: "A"}))).toBe("comfortable")
    rerender(
      <ThemeProvider theme="account">
        <Drawer open onClose={() => {}} title="B" density="compact" />
      </ThemeProvider>
    )
    expect(densityOf(screen.getByRole("dialog", {name: "B"}))).toBe("compact")
  })

  it("a nested ThemeProvider resets an outer scope to its own density", () => {
    render(
      <DensityScope density="compact">
        <ThemeProvider theme="wallet">
          <Modal open onClose={() => {}} title="C" />
        </ThemeProvider>
      </DensityScope>
    )
    expect(densityOf(screen.getByRole("dialog", {name: "C"}))).toBe("comfortable")
  })

  it("DensityScope writes the attribute for the controls inside it", () => {
    const {container} = render(<DensityScope density="compact" className="console"><span /></DensityScope>)
    expect(container.firstChild).toHaveAttribute("data-density", "compact")
    expect(container.firstChild).toHaveClass("console")
  })

  it("the drawer's close button speaks the locale", () => {
    render(<Drawer open onClose={() => {}} title="D" locale="en" />)
    expect(screen.getByRole("button", {name: "Close"})).toBeInTheDocument()
  })
})
