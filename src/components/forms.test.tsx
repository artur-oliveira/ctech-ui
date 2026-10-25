import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {createRef} from "react"
import {describe, expect, it, vi} from "vitest"

import {Field, Label} from "./field"
import {Input} from "./input"
import {Select} from "./select"
import {Textarea} from "./textarea"

describe("Field wiring", () => {
  it("generates an id, links the label and shows hint and error together", () => {
    render(
      <Field label="E-mail" hint="Usaremos para contato." error="Formato inválido.">
        <Input />
      </Field>
    )
    const input = screen.getByLabelText("E-mail")
    expect(input).toHaveAttribute("aria-invalid", "true")
    const described = input.getAttribute("aria-describedby")!.split(" ")
    expect(described).toHaveLength(2)
    expect(screen.getByText("Usaremos para contato.").id).toBe(described[0])
    expect(screen.getByText("Formato inválido.").id).toBe(described[1])
    expect(input.getAttribute("aria-errormessage")).toBe(described[1])
  })

  it("is not invalid and has no error id without an error", () => {
    render(<Field label="Nome" hint="Como no documento."><Input /></Field>)
    const input = screen.getByLabelText("Nome")
    expect(input).not.toHaveAttribute("aria-invalid")
    expect(input).not.toHaveAttribute("aria-errormessage")
    expect(input.getAttribute("aria-describedby")).toBe(screen.getByText("Como no documento.").id)
  })

  it("keeps htmlFor and the old error id (`<id>-error`)", () => {
    render(<Field label="Código" htmlFor="code" error="Erro"><Input /></Field>)
    expect(screen.getByLabelText("Código")).toHaveAttribute("id", "code")
    expect(screen.getByText("Erro").id).toBe("code-error")
  })

  it("defaults the id from name and offers a render prop", () => {
    render(
      <Field label="Cidade" name="city" error="Obrigatório">
        {control => <input data-testid="raw" {...control} />}
      </Field>
    )
    const raw = screen.getByTestId("raw")
    expect(raw).toHaveAttribute("id", "city")
    expect(raw).toHaveAttribute("aria-invalid", "true")
    expect(raw).toHaveAttribute("aria-errormessage", "city-error")
  })

  it("renders Label with a decorative required mark", () => {
    render(<Label required htmlFor="x">Nome</Label>)
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true")
  })
})

describe("Input and Textarea", () => {
  it("id defaults from name outside a Field; own aria wins and merges", () => {
    render(<Input name="email" aria-describedby="mine" invalid />)
    const input = screen.getByRole("textbox")
    expect(input).toHaveAttribute("id", "email")
    expect(input).toHaveAttribute("aria-describedby", "mine")
    expect(input).toHaveAttribute("aria-invalid", "true")
  })

  it("an explicit aria-invalid=false beats the Field error", () => {
    render(<Field label="A" error="x"><Input aria-invalid={false} /></Field>)
    expect(screen.getByLabelText("A")).toHaveAttribute("aria-invalid", "false")
  })

  it("forwards refs (react-hook-form register)", () => {
    const ref = createRef<HTMLInputElement>()
    const area = createRef<HTMLTextAreaElement>()
    render(<><Input ref={ref} aria-label="a" /><Textarea ref={area} aria-label="b" /></>)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(area.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it("compact opts in or out of the density-driven height; surface overrides the fill", () => {
    render(<><Input aria-label="auto" /><Input aria-label="on" compact /><Input aria-label="off" compact={false} surface="surface" /></>)
    expect(screen.getByLabelText("auto").className).toContain("in-data-[density=compact]:h-8")
    expect(screen.getByLabelText("on").className).toMatch(/\bh-8\b/)
    expect(screen.getByLabelText("on").className).not.toContain("h-11")
    const off = screen.getByLabelText("off")
    expect(off.className).toMatch(/\bh-11\b/)
    expect(off.className).not.toContain("density=compact")
    expect(off.className).toContain("bg-surface")
    expect(off.className).not.toContain("bg-background")
  })

  it("styles a file input's button", () => {
    render(<Input type="file" aria-label="f" />)
    expect(screen.getByLabelText("f").className).toContain("file:font-medium")
  })

  it("Textarea takes the Field wiring", () => {
    render(<Field label="Mensagem" error="Curta demais"><Textarea /></Field>)
    const area = screen.getByLabelText("Mensagem")
    expect(area.tagName).toBe("TEXTAREA")
    expect(area).toHaveAttribute("aria-invalid", "true")
  })
})

describe("Select additions", () => {
  const options = [
    {value: "a", label: "Alfa", group: "Letras"},
    {value: "1", label: "Um", group: "Números", hint: "Plano Pro", trailing: <svg data-testid="lock" />, disabled: true},
    {value: "b", label: "Beta", group: "Letras"},
    {value: "x", label: "Ver tudo", href: "/all"},
  ]

  it("groups options under headings, merging repeated groups", async () => {
    const user = userEvent.setup()
    render(<Select aria-label="s" value="" onValueChange={() => undefined} options={options} />)
    await user.click(screen.getByRole("combobox"))
    expect(await screen.findByText("Letras")).toBeInTheDocument()
    expect(screen.getAllByText("Letras")).toHaveLength(1)
    const groups = screen.getAllByRole("group")
    expect(groups).toHaveLength(2)
    expect(groups[0]).toHaveTextContent("AlfaBeta")
  })

  it("locked option is disabled, with its trailing icon and hint", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select aria-label="s" value="" onValueChange={onChange} options={options} />)
    await user.click(screen.getByRole("combobox"))
    const locked = await screen.findByRole("option", {name: /Um/})
    expect(locked).toHaveAttribute("aria-disabled", "true")
    expect(screen.getByTestId("lock")).toBeInTheDocument()
    expect(locked).toHaveTextContent("Plano Pro")
    await user.click(locked)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("renders href options as links that do not change the value", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select aria-label="s" value="a" onValueChange={onChange} options={options} />)
    await user.click(screen.getByRole("combobox"))
    const link = (await screen.findByRole("option", {name: "Ver tudo"})) as HTMLAnchorElement
    expect(link.tagName).toBe("A")
    expect(link).toHaveAttribute("href", "/all")
    link.addEventListener("click", e => e.preventDefault())
    await user.click(link)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("takes id and invalid wiring from the Field", () => {
    render(<Field label="Conta" error="Escolha uma"><Select value="" onValueChange={() => undefined} options={options} /></Field>)
    const trigger = screen.getByRole("combobox", {name: "Conta"})
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    expect(trigger.getAttribute("aria-describedby")).toBeTruthy()
  })
})
