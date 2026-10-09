import {render, screen, waitFor, within} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {describe, expect, it, vi} from "vitest"

import {initialsOf, UserMenu} from "./user-menu"

const LONG_NAME = "Maria Aparecida dos Santos Albuquerque de Oliveira"

function setup(props: Partial<Parameters<typeof UserMenu>[0]> = {}) {
  const user = userEvent.setup()
  const onSignOut = vi.fn()
  render(<UserMenu name={LONG_NAME} email="maria@example.com" onSignOut={onSignOut} {...props} />)
  const trigger = screen.getByRole("button", {name: `Menu da conta: ${LONG_NAME}`})
  return {user, onSignOut, trigger}
}

describe("initialsOf", () => {
  it("takes the first and last initials, accents included", () => {
    expect(initialsOf("Maria Aparecida dos Santos")).toBe("MS")
    expect(initialsOf("érica ödegaard")).toBe("ÉÖ")
    expect(initialsOf("Cher")).toBe("C")
    expect(initialsOf("  ", "zed@example.com")).toBe("Z")
  })
})

describe("UserMenu", () => {
  it("shows the initials on the trigger and follows the menu-button pattern", async () => {
    const {user, trigger} = setup()
    expect(trigger).toHaveTextContent("MO")
    expect(trigger).toHaveAttribute("aria-haspopup", "menu")
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    await user.click(trigger)
    const menu = await screen.findByRole("menu")
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    // The full name, not truncated, and the e-mail.
    const name = within(menu).getByText(LONG_NAME)
    expect(name.className).not.toMatch(/truncate|line-clamp/)
    expect(within(menu).getByText("maria@example.com")).toBeInTheDocument()
  })

  it("opens from the keyboard and returns focus on Escape", async () => {
    const {user, trigger} = setup()
    trigger.focus()
    await user.keyboard("{Enter}")
    await screen.findByRole("menu")
    await waitFor(() => expect(screen.getByRole("menuitem", {name: "Sair"})).toBeInTheDocument())
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("lists the views with the current one marked", async () => {
    const onConsole = vi.fn()
    const {user, trigger} = setup({
      views: [
        {label: "Portal", href: "/dashboard", current: true},
        {label: "Console", onClick: onConsole},
      ],
    })
    await user.click(trigger)
    const group = await screen.findByRole("group", {name: "Alternar visão"})
    const portal = within(group).getByRole("menuitem", {name: "Portal"})
    expect(portal).toHaveAttribute("href", "/dashboard")
    expect(portal).toHaveAttribute("aria-current", "true")
    const consoleItem = within(group).getByRole("menuitem", {name: "Console"})
    expect(consoleItem).not.toHaveAttribute("aria-current")
    await user.click(consoleItem)
    expect(onConsole).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
  })

  it("leaves the view switcher out when there are no views", async () => {
    const {user, trigger} = setup()
    await user.click(trigger)
    await screen.findByRole("menu")
    expect(screen.queryByRole("group")).not.toBeInTheDocument()
  })

  it("renders extra items, links through renderLink", async () => {
    const onHelp = vi.fn()
    const renderLink = vi.fn(props => <a data-router {...props} />)
    const {user, trigger} = setup({
      renderLink,
      items: [
        {label: "Perfil", href: "/profile"},
        {label: "Ajuda", onClick: onHelp},
      ],
    })
    await user.click(trigger)
    const profile = await screen.findByRole("menuitem", {name: "Perfil"})
    expect(profile).toHaveAttribute("href", "/profile")
    expect(profile).toHaveAttribute("data-router")
    await user.click(screen.getByRole("menuitem", {name: "Ajuda"}))
    expect(onHelp).toHaveBeenCalledOnce()
  })

  it("calls onSignOut from the sign-out item", async () => {
    const {user, trigger, onSignOut} = setup()
    await user.click(trigger)
    await user.click(await screen.findByRole("menuitem", {name: "Sair"}))
    expect(onSignOut).toHaveBeenCalledOnce()
  })

  it("has no sign-out item without onSignOut, and speaks English when asked", async () => {
    const user = userEvent.setup()
    render(<UserMenu name="Ana Lima" locale="en" />)
    await user.click(screen.getByRole("button", {name: "Account menu: Ana Lima"}))
    await screen.findByRole("menu")
    expect(screen.queryByRole("menuitem", {name: "Sign out"})).not.toBeInTheDocument()
  })
})
