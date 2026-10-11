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
})
