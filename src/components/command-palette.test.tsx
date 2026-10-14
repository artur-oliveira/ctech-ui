import {fireEvent, render, screen, within} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {useState} from "react"
import {describe, expect, it, vi} from "vitest"

import {CommandPalette, CommandPaletteTrigger, useCommandPaletteShortcut, type CommandEntry} from "./command-palette"

const onNew = vi.fn()
const ENTRIES: CommandEntry[] = [
  {id: "bills", label: "Agenda", group: "Finanças", kind: "page", href: "/finance/bills", keywords: ["boletos"]},
  {id: "rec", label: "Recorrências", group: "Finanças", kind: "page", href: "/finance/recurrences"},
  {id: "rec-new", label: "Nova recorrência", group: "Finanças", kind: "action", onSelect: onNew},
  {id: "inv", label: "Faturas", group: "Portal", kind: "page", href: "/invoices"},
]

function Harness({entries = ENTRIES}: {entries?: CommandEntry[]}) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button onClick={() => setOpen(true)}>abrir</button>
      <CommandPalette entries={entries} open={open} onOpenChange={setOpen} />
    </>
  )
}

const options = () => within(screen.getByRole("listbox")).getAllByRole("option").map(o => o.textContent)

describe("CommandPalette", () => {
  it("opens with the input focused, grouped by subproduct, as a combobox over a listbox", async () => {
    render(<Harness />)
    const input = await screen.findByRole("combobox", {name: "Buscar no aplicativo"})
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Portal")).toBeInTheDocument()
    expect(options()).toHaveLength(4)
  })

  it("filters as you type and ignores accents", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(await screen.findByRole("combobox"), "recorrencia")
    const names = options()
    expect(names).toHaveLength(2)
    expect(names[0]).toContain("Recorrências")
    expect(names[1]).toContain("Nova recorrência")
  })

  it("moves with the arrows, wrapping, and reports the active option", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = await screen.findByRole("combobox")
    await user.type(input, "rec")
    expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{ArrowDown}")
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true")
    expect(input).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[1].id)
    await user.keyboard("{ArrowDown}")
    expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{ArrowUp}")
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true")
  })

  it("a page is a real link and closes the dialog", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const link = await screen.findByRole("option", {name: /Faturas/})
    expect(link).toHaveAttribute("href", "/invoices")
    await user.click(link)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("an action closes the dialog and then runs onSelect, from Enter too", async () => {
    const user = userEvent.setup()
    onNew.mockClear()
    render(<Harness />)
    await user.type(await screen.findByRole("combobox"), "nova rec")
    expect(screen.getByRole("option", {name: /Ação/})).toBeInTheDocument()
    await user.keyboard("{Enter}")
    expect(onNew).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("shows the empty state for no match and Enter does nothing", async () => {
    const user = userEvent.setup()
    onNew.mockClear()
    render(<Harness />)
    await user.type(await screen.findByRole("combobox"), "zzzz{Enter}")
    expect(screen.getByText(/Nada encontrado para/)).toBeInTheDocument()
    expect(screen.queryAllByRole("option")).toHaveLength(0)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("Escape closes it, and reopening starts clean", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(await screen.findByRole("combobox"), "agenda")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await user.click(screen.getByText("abrir"))
    expect(await screen.findByRole("combobox")).toHaveValue("")
    expect(options()).toHaveLength(4)
  })

  it("speaks English for an English locale", async () => {
    render(<CommandPalette entries={ENTRIES} open onOpenChange={() => {}} locale="en" />)
    expect(await screen.findByRole("combobox", {name: "Search the app"})).toBeInTheDocument()
  })
})

function Shortcut({onToggle}: {onToggle: () => void}) {
  useCommandPaletteShortcut(onToggle)
  return <input aria-label="campo" />
}

describe("CommandPaletteTrigger", () => {
  it("is a named button announcing the shortcut", async () => {
    const onClick = vi.fn()
    render(<CommandPaletteTrigger onClick={onClick} />)
    const button = screen.getByRole("button", {name: "Buscar"})
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(button).toHaveAttribute("aria-keyshortcuts", "Control+K Meta+K")
  })
})

describe("useCommandPaletteShortcut", () => {
  it("toggles on Ctrl+K and Cmd+K, even from a field, and prevents the browser's own", () => {
    const onToggle = vi.fn()
    render(<Shortcut onToggle={onToggle} />)
    screen.getByLabelText("campo").focus()
    expect(fireEvent.keyDown(window, {key: "k", ctrlKey: true})).toBe(false)
    fireEvent.keyDown(window, {key: "K", metaKey: true})
    expect(onToggle).toHaveBeenCalledTimes(2)
  })

  it("ignores a plain k, Shift+Ctrl+K and a removed listener", () => {
    const onToggle = vi.fn()
    const {unmount} = render(<Shortcut onToggle={onToggle} />)
    fireEvent.keyDown(window, {key: "k"})
    fireEvent.keyDown(window, {key: "k", ctrlKey: true, shiftKey: true})
    unmount()
    fireEvent.keyDown(window, {key: "k", ctrlKey: true})
    expect(onToggle).not.toHaveBeenCalled()
  })
})
