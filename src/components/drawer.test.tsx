import {render, screen} from "@testing-library/react"
import {describe, expect, it} from "vitest"

import {Drawer} from "./drawer"

describe("Drawer on a phone", () => {
  it("lets a drag on the body scroll it instead of dismissing the drawer", () => {
    render(<Drawer open onClose={() => {}} title="Novo"><input aria-label="Valor" /></Drawer>)
    expect(screen.getByLabelText("Valor").closest("[data-base-ui-swipe-ignore]")).not.toBeNull()
    expect(screen.getByRole("heading", {name: "Novo"}).closest("[data-base-ui-swipe-ignore]")).toBeNull()
  })
})
