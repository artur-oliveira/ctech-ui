import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {useState} from "react"
import {describe, expect, it, vi} from "vitest"

import {Field} from "./field"
import {Select, type SelectAction, type SelectOption} from "./select"
import {DensityScope, ThemeProvider} from "./theme-provider"

// Ported from ctech-billing's Select suite.

const OPTIONS: SelectOption[] = [
  {value: "acc_01J9ZX", label: "Conta corrente"},
  {value: "acc_02K1AB", label: "Poupança"},
]

function Harness({initial = "", onChange = () => undefined, ...props}: {initial?: string; onChange?: (v: string) => void} & Partial<Parameters<typeof Select>[0]>) {
  const [value, setValue] = useState(initial)
  return (
    <Field label="Conta" htmlFor="acct">
      <Select id="acct" value={value} onValueChange={v => { setValue(v); onChange(v) }} options={OPTIONS} placeholder="Escolha…" {...props} />
    </Field>
  )
}

describe("Select", () => {
  // The bug this component exists to avoid: a styled select that shows the
  // option's value ("acc_01J9ZX") instead of its label once one is chosen.
  it("shows the label of the selected option, never its value", () => {
    render(<Harness initial="acc_02K1AB" />)
    const trigger = screen.getByRole("combobox", {name: "Conta"})
    expect(trigger).toHaveTextContent("Poupança")
    expect(trigger).not.toHaveTextContent("acc_02K1AB")
  })

  it("shows the placeholder until something is chosen, with a catalogue default", () => {
    const {unmount} = render(<Harness />)
    expect(screen.getByRole("combobox", {name: "Conta"})).toHaveTextContent("Escolha…")
    unmount()
    render(<Harness placeholder={undefined} locale="en" />)
    expect(screen.getByRole("combobox", {name: "Conta"})).toHaveTextContent("Select…")
  })

  it("selects by label and reports the value", async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    await userEvent.click(screen.getByRole("combobox", {name: "Conta"}))
    await userEvent.click(await screen.findByRole("option", {name: "Conta corrente"}))
    expect(onChange).toHaveBeenCalledWith("acc_01J9ZX")
    expect(screen.getByRole("combobox", {name: "Conta"})).toHaveTextContent("Conta corrente")
    expect(screen.getByRole("combobox", {name: "Conta"})).not.toHaveTextContent("acc_01J9ZX")
  })

  it("submits its value with a form when named", () => {
    const {container} = render(<Harness initial="acc_02K1AB" name="account" />)
    expect(container.querySelector("input[type=hidden][name=account]")).toHaveValue("acc_02K1AB")
  })
})

describe("Select actions", () => {
  function WithAction({onSelect, onChange = () => undefined}: {onSelect: () => void; onChange?: (v: string) => void}) {
    const [value, setValue] = useState("acc_01J9ZX")
    const actions: SelectAction[] = [{label: "Nova conta", icon: <svg data-testid="plus" />, onSelect}]
    return <Select aria-label="Conta" value={value} onValueChange={v => { setValue(v); onChange(v) }} options={OPTIONS} actions={actions} />
  }

  // Base UI types ahead on a closed, focused trigger: "n" matches "Nova conta"
  // and would run it with no list ever on screen.
  it("never runs an action from typeahead on the closed trigger", async () => {
    const onSelect = vi.fn()
    const onChange = vi.fn()
    render(<WithAction onSelect={onSelect} onChange={onChange} />)
    screen.getByRole("combobox", {name: "Conta"}).focus()
    await userEvent.keyboard("n")
    await userEvent.keyboard("p")
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole("combobox", {name: "Conta"})).not.toHaveTextContent("Nova conta")
  })

  it("runs it from a click in the open list, leaving the value where it was", async () => {
    const onSelect = vi.fn()
    const onChange = vi.fn()
    render(<WithAction onSelect={onSelect} onChange={onChange} />)
    await userEvent.click(screen.getByRole("combobox", {name: "Conta"}))
    await userEvent.click(await screen.findByRole("option", {name: "Nova conta"}))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole("combobox", {name: "Conta"})).toHaveTextContent("Conta corrente")
  })

  it("runs it from Enter in the open list", async () => {
    const onSelect = vi.fn()
    render(<WithAction onSelect={onSelect} />)
    await userEvent.click(screen.getByRole("combobox", {name: "Conta"}))
    const option = await screen.findByRole("option", {name: "Nova conta"})
    option.focus()
    await userEvent.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it("lists actions after the options, behind a separator", async () => {
    render(<WithAction onSelect={vi.fn()} />)
    await userEvent.click(screen.getByRole("combobox", {name: "Conta"}))
    const names = (await screen.findAllByRole("option")).map(o => o.textContent?.trim())
    expect(names).toEqual(["Conta corrente", "Poupança", "Nova conta"])
    const listbox = screen.getByRole("listbox")
    const separator = listbox.querySelector(".bg-border")
    expect(separator).not.toBeNull()
    expect(separator!.nextElementSibling).toHaveTextContent("Nova conta")
  })
})

describe("Select's none option", () => {
  function Optional({none, locale}: {none: boolean | string; locale?: string}) {
    const [v, setV] = useState("visa")
    return (
      <Field label="Bandeira" htmlFor="o">
        <Select id="o" value={v} none={none} locale={locale} onValueChange={setV} options={[{value: "visa", label: "Visa"}, {value: "elo", label: "Elo"}]} />
      </Field>
    )
  }

  // An optional choice can be undone. "Nenhuma" is an option like any other,
  // first in the list; choosing it gives back "", and the trigger then names it
  // rather than showing the placeholder.
  it("is listed first and empties the value", async () => {
    const change = vi.fn()
    function Spy() {
      const [v, setV] = useState("visa")
      return <Select aria-label="Bandeira" value={v} none="Nenhuma" onValueChange={x => { change(x); setV(x) }} options={[{value: "visa", label: "Visa"}, {value: "elo", label: "Elo"}]} />
    }
    render(<Spy />)
    const trigger = screen.getByRole("combobox", {name: "Bandeira"})
    await userEvent.click(trigger)
    const names = (await screen.findAllByRole("option")).map(o => o.textContent?.trim())
    expect(names).toEqual(["Nenhuma", "Visa", "Elo"])
    await userEvent.click(screen.getByRole("option", {name: "Nenhuma"}))
    expect(change).toHaveBeenCalledWith("")
    expect(trigger).toHaveTextContent("Nenhuma")
  })

  it("takes its label from the catalogue with none={true}", async () => {
    const {unmount} = render(<Optional none />)
    await userEvent.click(screen.getByRole("combobox", {name: "Bandeira"}))
    expect(await screen.findByRole("option", {name: "Nenhum"})).toBeInTheDocument()
    unmount()
    render(<Optional none locale="en" />)
    await userEvent.click(screen.getByRole("combobox", {name: "Bandeira"}))
    expect(await screen.findByRole("option", {name: "None"})).toBeInTheDocument()
  })
})

describe("Select option icons", () => {
  // A card brand is picked by its mark AND its name. The mark is decoration:
  // the option's accessible name stays the label alone.
  it("shows an option's icon beside its label, in the list and on the trigger, hidden from AT", async () => {
    const options = [
      {value: "visa", label: "Visa", icon: <svg data-testid="mark-visa" />},
      {value: "elo", label: "Elo", icon: <svg data-testid="mark-elo" />},
    ]
    function Brand() {
      const [v, setV] = useState("visa")
      return <Field label="Bandeira" htmlFor="b"><Select id="b" value={v} onValueChange={setV} options={options} /></Field>
    }
    render(<Brand />)
    const trigger = screen.getByRole("combobox", {name: "Bandeira"})
    expect(trigger).toHaveTextContent("Visa")
    expect(trigger.querySelector("[data-testid=mark-visa]")?.closest("[aria-hidden]")).not.toBeNull()
    await userEvent.click(trigger)
    const elo = await screen.findByRole("option", {name: "Elo"})
    expect(elo.querySelector("[data-testid=mark-elo]")?.closest("[aria-hidden]")).not.toBeNull()
    await userEvent.click(elo)
    expect(trigger.querySelector("[data-testid=mark-elo]")).not.toBeNull()
  })
})

describe("Select density", () => {
  it("is density-sized, and its list follows the surface that opened it", async () => {
    render(
      <ThemeProvider theme="billing">
        <DensityScope density="compact">
          <Select aria-label="Conta" value="" onValueChange={() => {}} options={OPTIONS} />
        </DensityScope>
      </ThemeProvider>
    )
    const trigger = screen.getByRole("combobox", {name: "Conta"})
    expect(trigger).toHaveAttribute("data-slot", "select-trigger")
    expect(trigger).toHaveClass("h-11", "in-data-[density=compact]:h-8")
    await userEvent.click(trigger)
    const listbox = await screen.findByRole("listbox")
    expect(listbox.closest("[data-density]")).toHaveAttribute("data-density", "compact")
    expect(listbox.closest("[data-ctech-theme]")).toHaveAttribute("data-ctech-theme", "billing")
  })
})
