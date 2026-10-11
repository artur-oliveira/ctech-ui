import {render, screen} from "@testing-library/react"
import {describe, expect, it} from "vitest"

import {Steps} from "./steps"

describe("Steps", () => {
  it("is an ordered list whose current step is aria-current and whose state is spoken", () => {
    render(<Steps label="Conectar" items={[
      {id: "a", title: "Requisitos", state: "done", stateLabel: "Concluído"},
      {id: "b", title: "Criar a integração", state: "current", stateLabel: "Agora", content: <p>faça isto</p>},
      {id: "c", title: "Enviar", state: "upcoming", stateLabel: "Depois"},
    ]}/>)
    const list = screen.getByRole("list", {name: "Conectar"})
    expect(list.tagName).toBe("OL")
    const current = screen.getByText("Criar a integração").closest("li")!
    expect(current.getAttribute("aria-current")).toBe("step")
    expect(screen.getByText("faça isto")).toBeTruthy()
    expect(screen.getByText("Concluído")).toBeTruthy()
    expect(screen.queryByText("depois", {exact: false})).toBeTruthy()
  })

  it("draws the current step's number in white on the brand fill, as Button's brand variant", () => {
    render(<Steps label="L" items={[{id: "a", title: "A", state: "current", stateLabel: "Agora"}]}/>)
    const marker = screen.getByText("1")
    expect(marker.className).toContain("text-white")
    expect(marker.className).not.toContain("text-background")
  })
})

