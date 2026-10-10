import {act, fireEvent, render, screen, within} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest"

import {RowMenu} from "./row-menu"
import {SwipeRow, type SwipeAction} from "./swipe-row"

// Ported from ctech-billing's LedgerRow suite (UX batch 4), made generic: a
// phone row reveals its secondary actions on a left swipe, and the same actions
// are always one press away in a visible "⋯" (the gesture is never the only way).

function phone(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: matches && q.includes("max-width"),
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as never
}

function Row({title, actions, primary}: {title: string; actions: SwipeAction[]; primary?: () => void}) {
  return (
    <li>
      <SwipeRow actions={actions}>
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {primary && <button type="button" onClick={primary}>Abrir</button>}
          <RowMenu label={`Mais ações: ${title}`} items={actions} />
        </div>
      </SwipeRow>
    </li>
  )
}

function rows(actions: (name: string) => SwipeAction[]) {
  return render(
    <ul>
      <Row title="Aluguel" actions={actions("Aluguel")} />
      <Row title="Internet" actions={actions("Internet")} />
    </ul>
  )
}

const front = (name: string) => screen.getByText(name).closest("[data-swipe-front]") as HTMLElement
const strip = (name: string) => screen.getByText(name).closest("li")!.querySelector("[data-swipe-actions]") as HTMLElement

const touch = (pointerId = 1) => ({pointerId, pointerType: "touch", isPrimary: pointerId === 1, button: 0})

function drag(el: HTMLElement, dx: number, dy = 0, {release = true, pointerId = 1} = {}) {
  fireEvent.pointerDown(el, {...touch(pointerId), clientX: 300, clientY: 100})
  const steps = 6
  for (let i = 1; i <= steps; i++) {
    fireEvent.pointerMove(el, {...touch(pointerId), clientX: 300 + (dx * i) / steps, clientY: 100 + (dy * i) / steps})
  }
  if (release) fireEvent.pointerUp(el, {...touch(pointerId), clientX: 300 + dx, clientY: 100 + dy})
}

const del = (onSelect = vi.fn()): SwipeAction => ({key: "del", label: "Excluir", destructive: true, onSelect})

beforeEach(() => phone(true))
afterEach(() => {
  // The one-open-row store is page-wide; close whatever a test left open.
  act(() => { fireEvent.pointerDown(document.body) })
  vi.restoreAllMocks()
})

describe("SwipeRow on a phone", () => {
  it("reveals the actions when swiped left past the threshold, and snaps back when not", () => {
    rows(() => [{key: "edit", label: "Editar", onSelect: vi.fn()}, del()])
    drag(front("Aluguel"), -20)
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
    expect((strip("Aluguel") as HTMLElement & {inert: boolean}).inert).toBe(true)
    expect(strip("Aluguel")).toHaveAttribute("aria-hidden", "true")
    drag(front("Aluguel"), -160)
    expect(front("Aluguel")).toHaveAttribute("data-open", "true")
    expect((strip("Aluguel") as HTMLElement & {inert: boolean}).inert).toBe(false)
    expect(within(strip("Aluguel")).getByRole("button", {name: "Excluir"})).toBeInTheDocument()
    expect(front("Aluguel").style.transform).toBe("translateX(-176px)")
  })

  it("leaves vertical scrolling to the page: touch-action pan-y, and a vertical drag reveals nothing", () => {
    rows(() => [del()])
    expect(front("Aluguel").style.touchAction).toBe("pan-y")
    drag(front("Aluguel"), -30, 120)
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
  })

  it("does not pick an axis before 8px of movement", () => {
    rows(() => [del()])
    drag(front("Aluguel"), -7, 0, {release: false})
    expect(front("Aluguel").style.transform).toBe("")
    fireEvent.pointerUp(front("Aluguel"), {...touch(), clientX: 293, clientY: 100})
  })

  it("keeps one row open at a time", () => {
    rows(() => [del()])
    drag(front("Aluguel"), -160)
    drag(front("Internet"), -160)
    expect(front("Internet")).toHaveAttribute("data-open", "true")
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
  })

  it("closes on a press outside the row, and with Escape", () => {
    rows(() => [del()])
    drag(front("Aluguel"), -160)
    act(() => { fireEvent.pointerDown(document.body) })
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")

    drag(front("Aluguel"), -160)
    act(() => { fireEvent.keyDown(front("Aluguel"), {key: "Escape"}) })
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
  })

  it("closes with Escape from a revealed action too", () => {
    rows(() => [del()])
    drag(front("Aluguel"), -160)
    act(() => { fireEvent.keyDown(within(strip("Aluguel")).getByRole("button", {name: "Excluir"}), {key: "Escape"}) })
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
  })

  it("runs a revealed action and closes", async () => {
    const onDelete = vi.fn()
    rows(() => [del(onDelete)])
    drag(front("Aluguel"), -160)
    await userEvent.click(within(strip("Aluguel")).getByRole("button", {name: "Excluir"}))
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
  })

  it("offers every action in a visible ⋯ menu, named for the row", async () => {
    const edit = vi.fn()
    rows(name => [{key: "edit", label: "Editar", onSelect: name === "Aluguel" ? edit : vi.fn()}, del()])
    await userEvent.click(screen.getByRole("button", {name: "Mais ações: Aluguel"}))
    const items = await screen.findAllByRole("menuitem")
    expect(items.map(i => i.textContent)).toEqual(["Editar", "Excluir"])
    await userEvent.click(items[0])
    expect(edit).toHaveBeenCalledTimes(1)
  })

  it("does not swipe on a laptop, and renders no strip there", () => {
    phone(false)
    rows(() => [del()])
    expect(strip("Aluguel")).toBeNull()
    expect(front("Aluguel").style.touchAction).toBe("")
    drag(front("Aluguel"), -160)
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
  })

  it("swipes everywhere with media={null}", () => {
    phone(false)
    render(<SwipeRow media={null} actions={[del()]}><span>Aluguel</span></SwipeRow>)
    drag(front("Aluguel"), -160)
    expect(front("Aluguel")).toHaveAttribute("data-open", "true")
  })

  it("never moves without actions", () => {
    render(<SwipeRow actions={[]}><span>Aluguel</span></SwipeRow>)
    drag(front("Aluguel"), -160)
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
  })
})

// ctech-billing's review fix: a real touch browser fires no click after a drag,
// so a flag set to swallow that click must not outlive the gesture and eat the
// next tap. drag() sends pointer events only, never a click, as a phone does.
describe("SwipeRow never eats the next tap", () => {
  it("after a swipe that opened the row and an action that closed it", async () => {
    const open = vi.fn()
    render(<ul><Row title="Aluguel" actions={[del()]} primary={open} /></ul>)
    drag(front("Aluguel"), -160)
    await userEvent.click(within(strip("Aluguel")).getByRole("button", {name: "Excluir"}))
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
    await userEvent.click(screen.getByRole("button", {name: "Abrir"}))
    expect(open).toHaveBeenCalledTimes(1)
  })

  it("after a swipe that closed the row", async () => {
    const open = vi.fn()
    render(<ul><Row title="Aluguel" actions={[del()]} primary={open} /></ul>)
    drag(front("Aluguel"), -160)
    drag(front("Aluguel"), 160)
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
    await userEvent.click(screen.getByRole("button", {name: "Abrir"}))
    expect(open).toHaveBeenCalledTimes(1)
  })

  it("but a mouse drag's own trailing click, in the same task, is swallowed", () => {
    const open = vi.fn()
    render(<ul><Row title="Aluguel" actions={[del()]} primary={open} /></ul>)
    drag(front("Aluguel"), -160)
    fireEvent.click(screen.getByRole("button", {name: "Abrir"}))
    expect(open).not.toHaveBeenCalled()
  })

  it("a tap on an open row closes it instead of acting on what it hit", () => {
    const open = vi.fn()
    render(<ul><Row title="Aluguel" actions={[del()]} primary={open} /></ul>)
    drag(front("Aluguel"), -160)
    const button = screen.getByRole("button", {name: "Abrir"})
    fireEvent.pointerDown(button, {...touch(), clientX: 100, clientY: 100})
    fireEvent.pointerUp(button, {...touch(), clientX: 100, clientY: 100})
    fireEvent.click(button)
    expect(open).not.toHaveBeenCalled()
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
  })
})

describe("SwipeRow survives interrupted gestures", () => {
  it("ignores a second finger mid-drag", () => {
    rows(() => [del()])
    drag(front("Aluguel"), -160, 0, {release: false})
    fireEvent.pointerDown(front("Aluguel"), {...touch(2), clientX: 50, clientY: 100})
    fireEvent.pointerMove(front("Aluguel"), {...touch(2), clientX: 400, clientY: 100})
    fireEvent.pointerUp(front("Aluguel"), {...touch(1), clientX: 140, clientY: 100})
    expect(front("Aluguel")).toHaveAttribute("data-open", "true")
  })

  it("returns to rest when the browser cancels the gesture, then swipes again", () => {
    rows(() => [del()])
    drag(front("Aluguel"), -160, 0, {release: false})
    fireEvent.pointerCancel(front("Aluguel"), {...touch()})
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
    expect(front("Aluguel").style.transform).toBe("")
    drag(front("Aluguel"), -160)
    expect(front("Aluguel")).toHaveAttribute("data-open", "true")
  })

  it("returns to rest when pointer capture is lost", () => {
    rows(() => [del()])
    drag(front("Aluguel"), -160, 0, {release: false})
    fireEvent.lostPointerCapture(front("Aluguel"), {...touch()})
    expect(front("Aluguel")).toHaveAttribute("data-open", "false")
    expect(front("Aluguel").style.transform).toBe("")
  })

  // Found by ctech-billing on a real touch screen: a finger's pointer is
  // implicitly captured by the element it landed on (here the title). When the
  // swipe locks to the x axis the front calls setPointerCapture, so the title
  // receives `lostpointercapture`, which bubbles to the front. Only the front's
  // own lost capture means the browser took the gesture.
  it("keeps the swipe when a child hands its implicit capture to the front", () => {
    rows(() => [del()])
    const title = screen.getByText("Aluguel")
    fireEvent.pointerDown(title, {...touch(), clientX: 300, clientY: 100})
    fireEvent.pointerMove(title, {...touch(), clientX: 286, clientY: 100})
    fireEvent.lostPointerCapture(title, {...touch()})
    for (let x = 272; x >= 132; x -= 14) fireEvent.pointerMove(front("Aluguel"), {...touch(), clientX: x, clientY: 100})
    fireEvent.pointerUp(front("Aluguel"), {...touch(), clientX: 132, clientY: 100})
    expect(front("Aluguel")).toHaveAttribute("data-open", "true")
  })

  it("returns to rest when the window loses focus mid-drag", () => {
    rows(() => [del()])
    drag(front("Aluguel"), -160, 0, {release: false})
    act(() => { window.dispatchEvent(new Event("blur")) })
    expect(front("Aluguel").style.transform).toBe("")
    drag(front("Aluguel"), -160)
    expect(front("Aluguel")).toHaveAttribute("data-open", "true")
  })
})

describe("SwipeRow and reduced motion", () => {
  it("slides with a transition that prefers-reduced-motion turns off, and none while dragging", () => {
    rows(() => [del()])
    expect(front("Aluguel")).toHaveClass("transition-transform", "motion-reduce:transition-none")
    drag(front("Aluguel"), -100, 0, {release: false})
    expect(front("Aluguel")).not.toHaveClass("transition-transform")
    fireEvent.pointerUp(front("Aluguel"), {...touch(), clientX: 200, clientY: 100})
  })
})
