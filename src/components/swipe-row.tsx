"use client"

import {useCallback, useEffect, useId, useRef, useState, useSyncExternalStore} from "react"
import type {ComponentProps, KeyboardEvent, MouseEvent, PointerEvent, ReactNode} from "react"

import {cn} from "../lib/cn"

/**
 * A row that slides left under a finger to reveal actions behind it.
 *
 * Pointer events; the gesture picks an axis after 8px, so a vertical drag stays
 * the page's scroll (the row sets `touch-action: pan-y`); a release past 35% of
 * the revealed width changes state and anything less snaps back; one row is
 * open per page; a press elsewhere or Escape closes it; the slide follows
 * `prefers-reduced-motion`. Only where `media` matches (a phone, by default):
 * under a mouse on a laptop, the row never moves.
 *
 * A gesture is never the only way in. Always offer the same actions another
 * way: a `RowMenu` ("⋯") on the row, or inline buttons where there is room.
 * The revealed strip is inert until uncovered, so it is never tabbed to or read
 * twice.
 */

/** Tailwind's `sm` breakpoint, inverted: a phone. */
const PHONE = "(max-width: 39.999rem)"
/** Movement before the gesture picks an axis, in px. */
const LOCK = 8
/** Share of the revealed width a release must pass to change state. */
const THRESHOLD = 0.35
/** Each revealed action's width, in px. */
const ACTION_WIDTH = 88

// One open row per page: a tiny store every row subscribes to.
let openRow: string | null = null
const listeners = new Set<() => void>()
function setOpenRow(id: string | null) {
  if (openRow === id) return
  openRow = id
  for (const l of listeners) l()
}
function subscribeOpenRow(l: () => void) {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

function useMedia(query: string | null): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (query === null || typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {}
      const list = window.matchMedia(query)
      list.addEventListener?.("change", onChange)
      return () => list.removeEventListener?.("change", onChange)
    },
    [query]
  )
  const get = () => {
    if (query === null) return true
    return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(query).matches
  }
  return useSyncExternalStore(subscribe, get, () => false)
}

interface SwipeRevealOptions {
  /** False turns the gesture off (a row with nothing to reveal). Default true. */
  enabled?: boolean
  /**
   * Where the gesture applies. Defaults to a phone, `(max-width: 39.999rem)`;
   * `null` applies it everywhere.
   */
  media?: string | null
}

interface SwipeReveal {
  open: boolean
  /** The gesture applies here and now (enabled, a width, and `media` matches). */
  active: boolean
  /** Put on the row's root as `data-swipe-row`: a press inside it does not close it. */
  rowId: string
  /** Current translation of the row's front, in px (≤ 0). */
  offset: number
  dragging: boolean
  close: () => void
  /** Spread on the row's front, the part that slides. */
  bind: {
    onPointerDown: (e: PointerEvent<HTMLElement>) => void
    onPointerMove: (e: PointerEvent<HTMLElement>) => void
    onPointerUp: (e: PointerEvent<HTMLElement>) => void
    onPointerCancel: (e: PointerEvent<HTMLElement>) => void
    onLostPointerCapture: (e: PointerEvent<HTMLElement>) => void
    onClickCapture: (e: MouseEvent<HTMLElement>) => void
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void
  }
}

interface Gesture {
  x: number
  y: number
  axis: "x" | "y" | null
  base: number
  pointer: number
  moved: boolean
}

/** `width` is how far the row slides when open: the actions' total width. */
function useSwipeReveal(width: number, {enabled = true, media = PHONE}: SwipeRevealOptions = {}): SwipeReveal {
  const id = useId()
  const open = useSyncExternalStore(subscribeOpenRow, () => openRow === id, () => false)
  const matches = useMedia(media)
  const active = enabled && width > 0 && matches
  const [drag, setDrag] = useState<number | null>(null)
  const g = useRef<Gesture | null>(null)
  const swallowClick = useRef(false)
  const lastX = useRef<number | null>(null)

  const close = useCallback(() => { if (openRow === id) setOpenRow(null) }, [id])

  // Abandon a gesture without changing state: the row returns to where it was.
  const abandon = useCallback(() => {
    g.current = null
    lastX.current = null
    setDrag(null)
  }, [])

  // A press anywhere outside the open row closes it (another row's own press
  // opens that one instead, through the store).
  useEffect(() => {
    if (!open) return
    const onDown = (e: Event) => {
      const row = (e.target as Element | null)?.closest?.("[data-swipe-row]")
      if (row?.getAttribute("data-swipe-row") !== id) close()
    }
    document.addEventListener("pointerdown", onDown, true)
    return () => document.removeEventListener("pointerdown", onDown, true)
  }, [open, id, close])

  // The window losing focus mid-drag (an app switch, a notification) ends the
  // drag where it began rather than leaving the row stuck half-open.
  const dragging = drag !== null
  useEffect(() => {
    if (!dragging) return
    window.addEventListener("blur", abandon)
    return () => window.removeEventListener("blur", abandon)
  }, [dragging, abandon])

  // A closed-off gesture (the media stops matching, the row is disabled) never
  // leaves the row open or moved.
  useEffect(() => {
    if (active) return
    abandon()
    close()
  }, [active, abandon, close])

  const end = (e: PointerEvent<HTMLElement>, cancelled: boolean) => {
    const s = g.current
    if (!s || s.pointer !== e.pointerId) return
    g.current = null
    if (s.axis !== "x") {
      setDrag(null)
      return
    }
    const final = lastX.current ?? s.base
    lastX.current = null
    const travelled = final - s.base
    let next = s.base !== 0
    if (!cancelled) {
      if (s.base === 0 && travelled < -width * THRESHOLD) next = true
      else if (s.base !== 0 && travelled > width * THRESHOLD) next = false
    }
    setDrag(null)
    setOpenRow(next ? id : openRow === id ? null : openRow)
  }

  return {
    open,
    active,
    rowId: id,
    offset: drag ?? (open ? -width : 0),
    dragging,
    close,
    bind: {
      onPointerDown: e => {
        // A second finger while one is already dragging: the first keeps the row.
        if (g.current && g.current.pointer !== e.pointerId) return
        // A new gesture: whatever the last one meant to swallow is over. A touch
        // browser sends no click after a drag, so a flag left set would eat the
        // next tap on this row.
        swallowClick.current = false
        if (!active || (e.pointerType === "mouse" && e.button !== 0)) return
        // Pressing a closed row while another is open closes that one.
        if (!open && openRow !== null) setOpenRow(null)
        g.current = {x: e.clientX, y: e.clientY, axis: null, base: open ? -width : 0, pointer: e.pointerId, moved: false}
      },
      onPointerMove: e => {
        const s = g.current
        if (!s || s.pointer !== e.pointerId) return
        const dx = e.clientX - s.x
        const dy = e.clientY - s.y
        if (s.axis === null) {
          if (Math.abs(dx) < LOCK && Math.abs(dy) < LOCK) return
          s.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y"
          if (s.axis === "x") e.currentTarget.setPointerCapture?.(e.pointerId)
        }
        if (s.axis !== "x") return
        s.moved = true
        // Rubber-band past either end, so the row never jumps.
        let x = s.base + dx
        if (x > 0) x = x / 4
        if (x < -width) x = -width + (x + width) / 4
        lastX.current = x
        setDrag(x)
      },
      onPointerUp: e => {
        const s = g.current
        if (!s || s.pointer !== e.pointerId) return
        if (s.axis === "x" && s.moved) {
          // A mouse or pen drag is followed by a click in this same task; a
          // finger's is not. Drop the flag once that click has had its chance.
          swallowClick.current = true
          setTimeout(() => { swallowClick.current = false }, 0)
        } else if (s.axis === null && open) {
          // A tap on an open row closes it instead of acting on what it hit.
          swallowClick.current = true
          g.current = null
          setOpenRow(null)
          return
        }
        end(e, false)
      },
      onPointerCancel: e => end(e, true),
      // Capture lost without a pointerup (the element moved, the browser took
      // the gesture): treat it as a cancel.
      onLostPointerCapture: e => { if (g.current?.axis === "x") end(e, true) },
      onClickCapture: e => {
        if (!swallowClick.current) return
        swallowClick.current = false
        e.preventDefault()
        e.stopPropagation()
      },
      onKeyDown: e => {
        if (e.key === "Escape" && open) close()
      },
    },
  }
}

interface SwipeAction {
  /** Stable identity; defaults to `label`. */
  key?: string
  label: string
  /** Open the row's own step (a confirmation, a form): nothing should happen on the swipe alone. */
  onSelect: () => void
  /** Drawn on the danger fill, the one saturated colour a list gets, and only while uncovered. */
  destructive?: boolean
  icon?: ReactNode
}

interface SwipeRowProps extends Omit<ComponentProps<"div">, "children"> {
  /** What a left swipe uncovers, in order. Offer the same ones in a `RowMenu`. */
  actions: SwipeAction[]
  /** Each action's width in px. Default 88. */
  actionWidth?: number
  enabled?: boolean
  /** Where the gesture applies; defaults to a phone. `null` everywhere. */
  media?: string | null
  /** The row's visible front, the part that slides. */
  children: ReactNode
  /** Classes for the front. It must stay opaque (default `bg-background`), since it covers the actions. */
  frontClassName?: string
}

/**
 * The swipe-to-reveal row, ready to use: the front is the caller's content, the
 * actions sit behind it. Build a custom layout on `useSwipeReveal` instead.
 */
function SwipeRow({actions, actionWidth = ACTION_WIDTH, enabled = true, media, children, className, frontClassName, onKeyDown, ...props}: SwipeRowProps) {
  const swipe = useSwipeReveal(actions.length * actionWidth, {enabled: enabled && actions.length > 0, media})
  // Escape is heard on the whole row, so it also closes from a revealed action.
  const {onKeyDown: closeOnEscape, ...frontBind} = swipe.bind
  // `inert` as a DOM property: React 18 has no `inert` prop, React 19 has.
  const strip = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (strip.current) strip.current.inert = !swipe.open
  })
  const run = (action: SwipeAction) => {
    swipe.close()
    action.onSelect()
  }
  return (
    // Clipped only while moved: at rest the front covers the actions, and an
    // unclipped row lets its controls' 44px touch targets reach past their drawing.
    <div
      {...props}
      data-slot="swipe-row"
      data-swipe-row={swipe.rowId}
      onKeyDown={e => { onKeyDown?.(e); closeOnEscape(e) }}
      className={cn("relative", swipe.offset !== 0 && "overflow-hidden", className)}
    >
      {swipe.active && (
        <div
          ref={strip}
          data-swipe-actions=""
          aria-hidden={!swipe.open || undefined}
          className="absolute inset-y-0 right-0 flex"
        >
          {actions.map(action => (
            <button
              key={action.key ?? action.label}
              type="button"
              onClick={() => run(action)}
              style={{width: actionWidth}}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-1 px-2 text-center text-sm/tight font-medium outline-none",
                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset [&_svg]:size-5 [&_svg]:shrink-0",
                action.destructive ? "bg-danger text-white" : "bg-surface text-foreground"
              )}
            >
              {action.icon && <span aria-hidden className="flex">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
      <div
        data-swipe-front=""
        data-open={swipe.open}
        {...frontBind}
        style={{
          transform: swipe.offset ? `translateX(${swipe.offset}px)` : undefined,
          touchAction: swipe.active ? "pan-y" : undefined,
        }}
        className={cn(
          "relative bg-background",
          !swipe.dragging && "transition-transform duration-200 ease-out motion-reduce:transition-none",
          frontClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}

export {SwipeRow, useSwipeReveal, type SwipeAction, type SwipeReveal, type SwipeRevealOptions, type SwipeRowProps}
