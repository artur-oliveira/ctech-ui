import {render, screen, within} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {useState} from "react"
import {describe, expect, it, vi} from "vitest"

import {Segmented, type SegmentedOption} from "./segmented"

type Period = "3m" | "6m" | "12m"
const PERIODS: SegmentedOption<Period>[] = [
  {value: "3m", label: "3 m", name: "3 meses"},
  {value: "6m", label: "6 m", name: "6 meses"},
  {value: "12m", label: "12 m", name: "12 meses"},
]

function Harness({onChange = () => {}, fill}: {onChange?: (v: Period) => void; fill?: boolean}) {
  const [value, setValue] = useState<Period>("6m")
  return <Segmented label="Período" value={value} fill={fill} onValueChange={v => { setValue(v); onChange(v) }} options={PERIODS} />
}

describe("Segmented", () => {
  it("is a named group of toggle buttons, the chosen one pressed", () => {
    render(<Harness />)
    const group = screen.getByRole("group", {name: "Período"})
    const buttons = within(group).getAllByRole("button")
    expect(buttons.map(b => b.getAttribute("aria-pressed"))).toEqual(["false", "true", "false"])
  })

  it("names a shortened label in full, containing the visible text", () => {
    render(<Harness />)
    const button = screen.getByRole("button", {name: "6 meses"})
    expect(button).toHaveTextContent("6 m")
  })

  it("names an icon label by its name", () => {
    render(
      <Segmented label="Vista" value="chart" onValueChange={() => {}} options={[
        {value: "chart", label: <svg data-testid="chart" />, name: "Gráfico"},
        {value: "rows", label: <svg />, name: "Linhas"},
      ]} />
    )
    expect(screen.getByRole("button", {name: "Gráfico"})).toHaveAttribute("aria-pressed", "true")
  })

  it("chooses by click and by keyboard, and does not re-report the chosen one", async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    await userEvent.click(screen.getByRole("button", {name: "12 meses"}))
    expect(onChange).toHaveBeenLastCalledWith("12m")
    expect(screen.getByRole("button", {name: "12 meses"})).toHaveAttribute("aria-pressed", "true")
    screen.getByRole("button", {name: "3 meses"}).focus()
    await userEvent.keyboard("{Enter}")
    expect(onChange).toHaveBeenLastCalledWith("3m")
    onChange.mockClear()
    await userEvent.click(screen.getByRole("button", {name: "3 meses"}))
    expect(onChange).not.toHaveBeenCalled()
  })

  it("fills the row when asked, the options sharing it", () => {
    render(<Harness fill />)
    expect(screen.getByRole("group")).toHaveClass("w-full")
    for (const b of screen.getAllByRole("button")) expect(b).toHaveClass("flex-1")
  })

  it("lines up with the density's controls, and grows its target vertically only", () => {
    render(<Harness />)
    const item = screen.getByRole("button", {name: "3 meses"})
    expect(item).toHaveAttribute("data-slot", "segmented-item")
    // 38 + 2 + 2 padding + 2 border = 44 comfortable; 26 + 6 = 32 compact.
    expect(item).toHaveClass("h-9.5", "in-data-[density=compact]:h-6.5", "min-w-11")
    expect(item).toHaveClass("after:inset-x-0", "after:h-11")
    expect(item).toHaveClass("motion-reduce:transition-none")
  })

  it("can be disabled whole or per option", () => {
    render(<Segmented label="P" value="a" onValueChange={() => {}} options={[{value: "a", label: "A"}, {value: "b", label: "B", disabled: true}]} />)
    expect(screen.getByRole("button", {name: "B"})).toBeDisabled()
    expect(screen.getByRole("button", {name: "A"})).toBeEnabled()
  })
})
