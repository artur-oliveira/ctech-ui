import {fireEvent, render, screen} from "@testing-library/react"
import {describe, expect, it, vi} from "vitest"

import {FileDrop} from "./file-drop"

const labels = {chooseLabel: "Escolher arquivo", replaceLabel: "Trocar", removeLabel: "Remover",
  tooLargeLabel: "Arquivo grande demais", wrongTypeLabel: "Tipo não aceito"}

describe("FileDrop", () => {
  it("accepts a dropped file of the right type and size", () => {
    const onFile = vi.fn()
    render(<FileDrop id="crt" label="Certificado" accept=".crt,.pem" maxBytes={16384} file={null} onFile={onFile} {...labels}/>)
    const f = new File(["-----BEGIN CERTIFICATE-----"], "inter.crt", {type: "application/x-x509-ca-cert"})
    fireEvent.drop(screen.getByTestId("file-drop-crt"), {dataTransfer: {files: [f]}})
    expect(onFile).toHaveBeenCalledWith(f)
  })

  it("refuses a file too large or of another extension, saying why", () => {
    const onFile = vi.fn()
    render(<FileDrop id="key" label="Chave" accept=".key,.pem" maxBytes={10} file={null} onFile={onFile} {...labels}/>)
    fireEvent.drop(screen.getByTestId("file-drop-key"), {dataTransfer: {files: [new File(["x".repeat(11)], "a.key")]}})
    expect(screen.getByRole("alert").textContent).toBe("Arquivo grande demais")
    fireEvent.drop(screen.getByTestId("file-drop-key"), {dataTransfer: {files: [new File(["x"], "a.txt")]}})
    expect(screen.getByRole("alert").textContent).toBe("Tipo não aceito")
    expect(onFile).not.toHaveBeenCalled()
  })

  it("shows the chosen file's name and lets it be removed", () => {
    const onFile = vi.fn()
    render(<FileDrop id="k" label="Chave" accept=".key" maxBytes={100} file={new File(["x"], "inter.key")} onFile={onFile} {...labels}/>)
    expect(screen.getByText("inter.key")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", {name: "Remover"}))
    expect(onFile).toHaveBeenCalledWith(null)
  })

  it("names the chosen file on the keyboard control", () => {
    render(<FileDrop id="k2" label="Chave" hint="PEM" accept=".key" maxBytes={100} file={new File(["x"], "inter.key")} onFile={() => {}} {...labels}/>)
    const ids = (screen.getByLabelText("Chave").getAttribute("aria-describedby") ?? "").split(" ")
    const named = ids.map(id => document.getElementById(id)?.textContent)
    expect(named).toContain("inter.key")
    expect(named).toContain("PEM")
  })

  it("keeps keyboard focus on the control after the file is removed", () => {
    render(<FileDrop id="k3" label="Chave" accept=".key" maxBytes={100} file={new File(["x"], "inter.key")} onFile={() => {}} {...labels}/>)
    fireEvent.click(screen.getByRole("button", {name: "Remover"}))
    expect(document.activeElement).toBe(screen.getByLabelText("Chave"))
  })

  it("matches MIME entries of accept against the file type, extensions against the name", () => {
    const onFile = vi.fn()
    render(<FileDrop id="m" label="Certificado" accept=".crt,application/x-pem-file,image/*" maxBytes={100} file={null} onFile={onFile} {...labels}/>)
    const pem = new File(["x"], "certificado", {type: "application/x-pem-file"})
    const png = new File(["x"], "scan", {type: "image/png"})
    const upper = new File(["x"], "INTER.CRT")
    for (const f of [pem, png, upper]) fireEvent.drop(screen.getByTestId("file-drop-m"), {dataTransfer: {files: [f]}})
    expect(onFile.mock.calls.map(c => c[0])).toEqual([pem, png, upper])
    fireEvent.drop(screen.getByTestId("file-drop-m"), {dataTransfer: {files: [new File(["x"], "foocrt")]}})
    expect(screen.getByRole("alert").textContent).toBe("Tipo não aceito")
  })

  it("never paints text with a fixed brand step that loses contrast on a dark theme", () => {
    render(<FileDrop id="c" label="Chave" accept=".key" maxBytes={100} file={null} onFile={() => {}} {...labels}/>)
    const html = screen.getByTestId("file-drop-c").outerHTML
    expect(html).not.toMatch(/text-brand-700|bg-brand-50\b/)
  })
})

