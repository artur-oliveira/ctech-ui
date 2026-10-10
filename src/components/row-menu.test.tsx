import {render, screen, waitFor} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {describe, expect, it, vi} from "vitest"

import {RowMenu} from "./row-menu"
import {DensityScope, ThemeProvider} from "./theme-provider"

describe("RowMenu", () => {
  it("is named 'Mais ações' by default, 'More actions' in English, and overridable", () => {
    const {rerender} = render(<RowMenu items={[]} />)
    expect(screen.getByRole("button", {name: "Mais ações"})).toBeInTheDocument()
    rerender(<RowMenu items={[]} locale="en" />)
    expect(screen.getByRole("button", {name: "More actions"})).toBeInTheDocument()
    rerender(<RowMenu items={[]} labels={{trigger: "Ações"}} />)
    expect(screen.getByRole("button", {name: "Ações"})).toBeInTheDocument()
    rerender(<RowMenu items={[]} label="Mais ações: Aluguel" />)
    expect(screen.getByRole("button", {name: "Mais ações: Aluguel"})).toBeInTheDocument()
  })

  it("lists its items as menu items and runs the chosen one, returning focus on Escape", async () => {
    const user = userEvent.setup()
    const edit = vi.fn()
    render(<RowMenu items={[{label: "Editar", onSelect: edit}, {label: "Excluir", destructive: true, onSelect: vi.fn()}]} />)
    const trigger = screen.getByRole("button", {name: "Mais ações"})
    await user.click(trigger)
    const items = await screen.findAllByRole("menuitem")
    expect(items.map(i => i.textContent)).toEqual(["Editar", "Excluir"])
    expect(items[1]).toHaveClass("text-danger")
    await user.click(items[0])
    expect(edit).toHaveBeenCalledOnce()

    await user.click(trigger)
    await screen.findAllByRole("menuitem")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("is an icon Button, so the touch rule keeps it square", () => {
    render(<RowMenu items={[]} />)
    const trigger = screen.getByRole("button", {name: "Mais ações"})
    expect(trigger).toHaveAttribute("data-slot", "button")
    expect(trigger).toHaveAttribute("data-size", "icon")
  })

  it("opens its list in the density of the surface that opened it", async () => {
    render(
      <ThemeProvider theme="dfe">
        <DensityScope density="compact">
          <RowMenu items={[{label: "Editar", onSelect: () => {}}]} />
        </DensityScope>
      </ThemeProvider>
    )
    await userEvent.click(screen.getByRole("button", {name: "Mais ações"}))
    const item = await screen.findByRole("menuitem", {name: "Editar"})
    expect(item).toHaveAttribute("data-slot", "menu-item")
    expect(item.closest("[data-density]")).toHaveAttribute("data-density", "compact")
    expect(item.closest("[data-ctech-theme]")).toHaveAttribute("data-ctech-theme", "dfe")
  })
})
