import {render, screen, within} from "@testing-library/react"
import {describe, expect, it} from "vitest"

import {AppShell, SidebarNav} from "./app-shell"

describe("SidebarNav", () => {
  const groups = [
    {items: [{href: "/overview", label: "Visão geral"}, {href: "/invoices", label: "Faturas", active: true}]},
    {label: "Integrações", items: [{href: "/webhooks", label: "Webhooks"}]},
  ]

  it("draws the current section on the rail: its own edge, never colour alone", () => {
    render(<SidebarNav label="Seções" groups={groups} />)
    const current = screen.getByRole("link", {name: "Faturas"})
    expect(current.className).toMatch(/border-l-2/)
    expect(current.className).toMatch(/aria-\[current=page\]:font-medium/)
  })

  it("is a labelled navigation with the current section marked by aria-current", () => {
    render(<SidebarNav label="Seções" groups={groups} />)
    const nav = screen.getByRole("navigation", {name: "Seções"})
    expect(within(nav).getByRole("link", {name: "Faturas"})).toHaveAttribute("aria-current", "page")
    expect(within(nav).getByRole("link", {name: "Visão geral"})).not.toHaveAttribute("aria-current")
  })

  it("heads a labelled group and keeps an unlabelled one bare", () => {
    render(<SidebarNav label="Seções" groups={groups} />)
    expect(screen.getByText("Integrações")).toBeInTheDocument()
    expect(screen.getAllByRole("list")).toHaveLength(2)
  })

  it("navigates through the product's router", () => {
    render(<SidebarNav label="Seções" groups={groups} renderLink={props => <a {...props} data-router="next" />} />)
    expect(screen.getByRole("link", {name: "Webhooks"})).toHaveAttribute("data-router", "next")
  })
})

describe("AppShell", () => {
  it("puts the mark, whose work, the actions and the person in the top bar, the sections in the column", () => {
    render(
      <AppShell
        brand={<span>CTech Billing</span>}
        context={<button type="button">CTech Tecnologia</button>}
        actions={<button type="button">PT</button>}
        nav={<SidebarNav label="Seções" groups={[{items: [{href: "/a", label: "A"}]}]} />}
        account={<button type="button">Conta</button>}
        banner={<p>Modo de teste</p>}
      >
        <h1>Faturas</h1>
      </AppShell>
    )
    const bar = screen.getByRole("banner")
    expect(within(bar).getByText("CTech Billing")).toBeInTheDocument()
    for (const name of ["CTech Tecnologia", "PT", "Conta"]) expect(within(bar).getByRole("button", {name})).toBeInTheDocument()
    const column = screen.getByTestId("app-shell-sidebar")
    expect(within(column).getByRole("navigation", {name: "Seções"})).toBeInTheDocument()
    expect(within(column).queryByRole("button")).not.toBeInTheDocument()
    const main = screen.getByRole("main")
    expect(within(main).getByRole("heading", {name: "Faturas"})).toBeInTheDocument()
    // The banner spans the page under the bar, in neither the bar nor the column.
    expect(within(bar).queryByText("Modo de teste")).not.toBeInTheDocument()
    expect(within(column).queryByText("Modo de teste")).not.toBeInTheDocument()
    expect(screen.getByText("Modo de teste")).toBeInTheDocument()
  })

  it("has no column when there are no sections", () => {
    render(<AppShell brand="B" account={null}><p>x</p></AppShell>)
    expect(screen.queryByTestId("app-shell-sidebar")).not.toBeInTheDocument()
  })

  it("offers a skip link to the page", () => {
    render(<AppShell brand="B" account={null}><p>x</p></AppShell>)
    expect(screen.getByRole("link", {name: "Pular para o conteúdo"})).toHaveAttribute("href", "#app-shell-main")
    expect(screen.getByRole("main")).toHaveAttribute("id", "app-shell-main")
  })
})
