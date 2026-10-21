import {fireEvent, render, screen, waitFor} from "@testing-library/react"
import {createRef} from "react"
import {describe, expect, it, vi} from "vitest"

import {Drawer} from "./drawer"
import {Modal} from "./modal"

// Both overlays share the same options, so one suite runs against each.
const cases = [
  ["Modal", Modal],
  ["Drawer", Drawer],
] as const

describe.each(cases)("%s sensitive-confirmation options", (_name, Overlay) => {
  it("focuses the ref given as initialFocus on open", async () => {
    const ref = createRef<HTMLButtonElement>()
    render(
      <Overlay open onClose={() => {}} title="Sacar" initialFocus={ref}>
        <button>Primeiro</button>
        <button ref={ref}>Confirmar</button>
      </Overlay>
    )
    await waitFor(() => expect(screen.getByRole("button", {name: "Confirmar"})).toHaveFocus())
  })

  it("focuses the element matching an initialFocus selector", async () => {
    render(
      <Overlay open onClose={() => {}} title="Sacar" initialFocus="#ok">
        <button>Primeiro</button>
        <button id="ok">Confirmar</button>
      </Overlay>
    )
    await waitFor(() => expect(screen.getByRole("button", {name: "Confirmar"})).toHaveFocus())
  })

  it("closes on Escape and on the X by default", () => {
    const onClose = vi.fn()
    render(<Overlay open onClose={onClose} title="Sacar" />)
    fireEvent.keyDown(document.activeElement ?? document.body, {key: "Escape"})
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", {name: /fechar/i}))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it("blocks Escape and the X while dismissible is false, keeping focus inside", async () => {
    const onClose = vi.fn()
    render(
      <Overlay open onClose={onClose} title="Sacar" dismissible={false}>
        <button>Confirmar</button>
      </Overlay>
    )
    fireEvent.keyDown(document.activeElement ?? document.body, {key: "Escape"})
    fireEvent.click(screen.getByRole("button", {name: /fechar/i}))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole("button", {name: /fechar/i})).toBeDisabled()
    await waitFor(() => expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement))
  })

  it("hides the X with hideClose", () => {
    render(<Overlay open onClose={() => {}} title="Sacar" hideClose />)
    expect(screen.queryByRole("button", {name: /fechar/i})).toBeNull()
  })

  it("supports role=alertdialog and aria-describedby", () => {
    render(
      <Overlay open onClose={() => {}} title="Excluir" aria={{role: "alertdialog", describedBy: "corpo"}}>
        <p id="corpo">Isto nao pode ser desfeito.</p>
      </Overlay>
    )
    const dialog = screen.getByRole("alertdialog", {name: "Excluir"})
    expect(dialog).toHaveAttribute("aria-describedby", "corpo")
  })

  it("keeps role=dialog by default", () => {
    render(<Overlay open onClose={() => {}} title="Novo" />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

describe("Modal footer options", () => {
  it("renders Cancel and the submit by default", () => {
    render(<Modal open onClose={() => {}} title="T" onSubmit={() => {}} />)
    expect(screen.getByRole("button", {name: "Cancelar"})).toBeInTheDocument()
  })

  it("hideCancel leaves only the action", () => {
    render(<Modal open onClose={() => {}} title="T" onSubmit={() => {}} hideCancel />)
    expect(screen.queryByRole("button", {name: "Cancelar"})).toBeNull()
    expect(screen.getByRole("button", {name: "Salvar"})).toBeInTheDocument()
  })

  it("footer replaces the default footer; null renders none", () => {
    const {rerender} = render(<Modal open onClose={() => {}} title="T" onSubmit={() => {}} footer={<button>Sacar R$ 10</button>} />)
    expect(screen.getByRole("button", {name: "Sacar R$ 10"})).toBeInTheDocument()
    expect(screen.queryByRole("button", {name: "Cancelar"})).toBeNull()
    rerender(<Modal open onClose={() => {}} title="T" onSubmit={() => {}} footer={null} />)
    expect(screen.queryByRole("button", {name: "Salvar"})).toBeNull()
  })

  it("disables Cancel while dismissible is false", () => {
    render(<Modal open onClose={() => {}} title="T" dismissible={false} />)
    expect(screen.getByRole("button", {name: "Cancelar"})).toBeDisabled()
  })
})
