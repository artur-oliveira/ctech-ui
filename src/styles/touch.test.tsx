import {readFileSync} from "node:fs"
import {resolve} from "node:path"
import {describe, expect, it} from "vitest"

// jsdom evaluates neither media queries nor layout, so the touch rule is guarded
// by its text: each decision below was a reviewed fix.
const css = readFileSync(resolve("src/styles/touch.css"), "utf8")
const block = (selector: string) => {
  const start = css.indexOf(selector)
  expect(start, selector).toBeGreaterThan(-1)
  return css.slice(start, css.indexOf("}", start))
}

describe("touch.css", () => {
  it("applies under a coarse pointer or below sm, inside a compact surface only", () => {
    expect(css).toContain("@media (pointer: coarse), (max-width: 39.999rem)")
    expect(css.match(/^\s+\[data-density="compact"\]/gm)?.length).toBeGreaterThan(8)
  })

  it("keeps an icon button square: a fixed width, no height:auto", () => {
    expect(block('[data-slot="button"][data-size="icon"]')).toContain("width: var(--touch-visual)")
    expect(css).not.toMatch(/height:\s*auto/)
  })

  it("caps the sideways growth so neighbours keep their taps", () => {
    const after = block('.touch-target)::after')
    expect(after).toMatch(/left: max\(calc\(-1 \* var\(--touch-reach\)\)/)
    expect(after).toMatch(/right: max\(calc\(-1 \* var\(--touch-reach\)\)/)
    expect(after).toMatch(/top: min\(0px/)
    expect(css).toContain("--touch-reach: calc(0.25rem + 1px)")
  })

  it("puts a field label's target behind the field's content", () => {
    expect(block('[data-slot="field"]:has(> [data-slot="input"]) {')).toContain("isolation: isolate")
    expect(block("> label::after")).toContain("z-index: -1")
  })

  it("does not override a control the caller positions", () => {
    expect(css).toContain(":not(.absolute, .fixed, .sticky)")
  })

  it("is shipped by the package stylesheet", () => {
    const styles = readFileSync(resolve("src/styles/styles.css"), "utf8")
    expect(styles).toContain('@import "./touch.css"')
  })
})
