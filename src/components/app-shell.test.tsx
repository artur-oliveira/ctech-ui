import {render, screen, within} from "@testing-library/react"
import {describe, expect, it} from "vitest"

import {AppShell, SidebarNav} from "./app-shell"

describe("SidebarNav", () => {
  const groups = [
    {items: [{href: "/overview", label: "Visão geral"}, {href: "/invoices", label: "Faturas", active: true}]},
    {label: "Integrações", items: [{href: "/webhooks", label: "Webhooks"}]},
  ]

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
  it("places brand, context, sections and account in one column and the page in main", () => {
    render(
      <AppShell
        brand={<span>CTech Billing</span>}
        context={<button type="button">CTech Tecnologia</button>}
        nav={<SidebarNav label="Seções" groups={[{items: [{href: "/a", label: "A"}]}]} />}
        account={<button type="button">Conta</button>}
        banner={<p>Modo de teste</p>}
      >
        <h1>Faturas</h1>
      </AppShell>
    )
    const column = screen.getByTestId("app-shell-sidebar")
    for (const name of ["CTech Tecnologia", "Conta"]) expect(within(column).getByRole("button", {name})).toBeInTheDocument()
    expect(within(column).getByRole("navigation", {name: "Seções"})).toBeInTheDocument()
    const main = screen.getByRole("main")
    expect(within(main).getByRole("heading", {name: "Faturas"})).toBeInTheDocument()
    // The banner sits above the page, not inside the column.
    expect(within(column).queryByText("Modo de teste")).not.toBeInTheDocument()
    expect(screen.getByText("Modo de teste")).toBeInTheDocument()
  })

  it("offers a skip link to the page", () => {
    render(<AppShell brand="B" account={null}><p>x</p></AppShell>)
    expect(screen.getByRole("link", {name: "Pular para o conteúdo"})).toHaveAttribute("href", "#app-shell-main")
    expect(screen.getByRole("main")).toHaveAttribute("id", "app-shell-main")
  })
})
