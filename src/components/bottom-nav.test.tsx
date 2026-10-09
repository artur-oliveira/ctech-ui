import {render, screen, waitFor, within} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {describe, expect, it, vi} from "vitest"

import {BottomNav, BottomNavSpacer, type BottomNavItem} from "./bottom-nav"

const Icon = () => <svg data-testid="icon" />

function items(overrides: {moreActive?: boolean; onImport?: () => void} = {}): BottomNavItem[] {
  return [
    {label: "Resumo", icon: <Icon />, href: "/finance", active: !overrides.moreActive},
    {label: "A pagar/receber", icon: <Icon />, href: "/finance/bills"},
    {label: "Extrato", icon: <Icon />, href: "/finance/statement"},
    {
      type: "more",
      label: "Mais",
      icon: <Icon />,
      items: [
        {label: "Recorrências", href: "/finance/recurrences"},
        {label: "Cartões", href: "/finance/cards", active: overrides.moreActive},
        {label: "Importar", onClick: overrides.onImport},
        {label: "Relatórios", href: "/finance/reports", group: "Análise"},
        {label: "Configuração", href: "/finance/accounts", group: "Análise"},
      ],
    },
  ]
}

describe("BottomNav", () => {
  it("is a labelled nav landmark, hidden from md up", () => {
    render(<BottomNav items={items()} />)
    const nav = screen.getByRole("navigation", {name: "Navegação principal"})
    expect(nav).toHaveClass("md:hidden")
    expect(nav.className).toContain("pb-[env(safe-area-inset-bottom)]")
  })

  it("marks only the active item with aria-current", () => {
    render(<BottomNav items={items()} />)
    expect(screen.getByRole("link", {name: "Resumo"})).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", {name: "Extrato"})).not.toHaveAttribute("aria-current")
    expect(screen.getByRole("link", {name: "A pagar/receber"})).toHaveAttribute("href", "/finance/bills")
  })

  it("renders the central action between the tabs, as a link or a button", async () => {
    const onCreate = vi.fn()
    const {rerender} = render(<BottomNav items={items()} action={{label: "Novo", icon: <Icon />, onClick: onCreate}} />)
    const list = within(screen.getByRole("navigation")).getAllByRole("listitem")
    expect(list).toHaveLength(5)
    expect(within(list[2]).getByRole("button", {name: "Novo"})).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", {name: "Novo"}))
    expect(onCreate).toHaveBeenCalledOnce()

    rerender(<BottomNav items={items()} action={{label: "Novo", icon: <Icon />, href: "/finance/new"}} />)
    expect(screen.getByRole("link", {name: "Novo"})).toHaveAttribute("href", "/finance/new")
  })

  it("leaves the action slot out when the action is null", () => {
    render(<BottomNav items={items()} action={null} />)
    expect(within(screen.getByRole("navigation")).getAllByRole("listitem")).toHaveLength(4)
    expect(screen.queryByRole("button", {name: "Novo"})).not.toBeInTheDocument()
  })

  it("never shows more than four tabs", () => {
    const five = [...items().slice(0, 3), {label: "Cartões", icon: <Icon />, href: "/c"}, {label: "Importar", icon: <Icon />, href: "/i"}]
    render(<BottomNav items={five} />)
    expect(screen.queryByRole("link", {name: "Importar"})).not.toBeInTheDocument()
  })

  it("routes links through renderLink", () => {
    const renderLink = vi.fn(props => <a data-router {...props} />)
    render(<BottomNav items={items()} renderLink={renderLink} />)
    expect(screen.getByRole("link", {name: "Resumo"})).toHaveAttribute("data-router")
  })

  it("opens the sheet, lists the secondary items with groups, and closes on Escape returning focus", async () => {
    const user = userEvent.setup()
    render(<BottomNav items={items()} />)
    const more = screen.getByRole("button", {name: "Mais"})
    expect(more).toHaveAttribute("aria-expanded", "false")

    await user.click(more)
    const sheet = await screen.findByRole("dialog", {name: "Mais"})
    expect(more).toHaveAttribute("aria-expanded", "true")
    expect(within(sheet).getByRole("link", {name: "Recorrências"})).toHaveAttribute("href", "/finance/recurrences")
    expect(within(sheet).getByRole("region", {name: "Análise"})).toBeInTheDocument()
    await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true))

    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    await waitFor(() => expect(more).toHaveFocus())
  })

  it("closes the sheet from its close button and after choosing an item", async () => {
    const user = userEvent.setup()
    const onImport = vi.fn()
    render(<BottomNav items={items({onImport})} />)

    await user.click(screen.getByRole("button", {name: "Mais"}))
    await user.click(await screen.findByRole("button", {name: "Fechar"}))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())

    await user.click(screen.getByRole("button", {name: "Mais"}))
    await user.click(await screen.findByRole("button", {name: "Importar"}))
    expect(onImport).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("shows the more tab as active when the current page lives in the sheet", async () => {
    const user = userEvent.setup()
    render(<BottomNav items={items({moreActive: true})} />)
    expect(screen.getByRole("button", {name: "Mais"})).toHaveAttribute("data-active")
    expect(screen.getByRole("link", {name: "Resumo"})).not.toHaveAttribute("aria-current")
    await user.click(screen.getByRole("button", {name: "Mais"}))
    expect(await screen.findByRole("link", {name: "Cartões"})).toHaveAttribute("aria-current", "page")
  })

  it("gives every target at least a 44px box and honours reduced motion", () => {
    render(<BottomNav items={items()} action={{label: "Novo", icon: <Icon />, onClick: () => {}}} />)
    // The row is 4.5rem tall and every target fills its cell.
    const row = within(screen.getByRole("navigation")).getByRole("list")
    expect(row.style.height).toBe("4.5rem")
    for (const target of [screen.getByRole("link", {name: "Resumo"}), screen.getByRole("button", {name: "Mais"})]) {
      expect(target).toHaveClass("h-full", "w-full")
    }
    expect(screen.getByRole("button", {name: "Novo"}).querySelector("[aria-hidden]")).toHaveClass("size-11", "motion-reduce:transition-none")
  })

  it("speaks English when asked, and takes single-string overrides", () => {
    const {rerender} = render(<BottomNav items={items()} locale="en" />)
    expect(screen.getByRole("navigation", {name: "Main navigation"})).toBeInTheDocument()
    rerender(<BottomNav items={items()} labels={{nav: "Finanças"}} />)
    expect(screen.getByRole("navigation", {name: "Finanças"})).toBeInTheDocument()
  })

  it("offers a spacer that only exists below md", () => {
    const {container} = render(<BottomNavSpacer />)
    expect(container.firstChild).toHaveAttribute("aria-hidden")
    expect(container.firstChild).toHaveClass("md:hidden")
  })
})
