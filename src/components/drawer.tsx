"use client"

import {Drawer as Primitive} from "@base-ui/react/drawer"
import {useEffect, useState} from "react"
import type {ReactNode} from "react"

import {cn} from "../lib/cn"
import {guardedOpenChange, resolveInitialFocus, type DialogGuardProps} from "../lib/dialog-options"
import {DEFAULT_LOCALE, getModalLabels, type Locale} from "../lib/i18n"
import {Button} from "./button"
import {useThemeScope, type Density} from "./theme-provider"

/**
 * A panel for a task that needs a form but not a new page (shadcn's Drawer, on
 * Base UI's Drawer primitive): from the right on a wide screen, where the page
 * behind stays readable, and from the bottom on a phone, where a side panel
 * would be the whole screen anyway. Swipe it away in the direction it came
 * from; focus trap, Escape, scroll lock and restore-focus come from Base UI.
 *
 * The body is the caller's: a form brings its own buttons, so there is no fixed
 * footer unless `footer` is given (it stays visible while the body scrolls).
 */

const WIDTH = {
  md: "sm:max-w-md",
  lg: "sm:max-w-xl",
} as const

interface DrawerProps extends DialogGuardProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: keyof typeof WIDTH
  /**
   * The drawer renders in a portal, outside the caller's `[data-density]`. It
   * follows the nearest `DensityScope` (else `ThemeProvider`); this overrides both.
   */
  density?: Density
  /** BCP-47 tag for the close button's name. Defaults to "pt-BR". */
  locale?: Locale
}

/**
 * What the on-screen keyboard covers, and what is left. iOS (Safari and Chrome,
 * both WebKit) keeps the layout viewport under the keyboard and shrinks only
 * `visualViewport`, so a bottom sheet pinned to the layout viewport ends up behind it.
 * `null` where there is no visualViewport (jsdom, old browsers) or nothing to track.
 */
function useKeyboardInset(active: boolean): {bottom: number; height: number} | null {
  const [inset, setInset] = useState<{bottom: number; height: number} | null>(null)
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null
    if (!active || !vv) return
    const sync = () => setInset({bottom: Math.max(0, window.innerHeight - vv.height - vv.offsetTop), height: vv.height})
    sync()
    vv.addEventListener("resize", sync)
    vv.addEventListener("scroll", sync)
    return () => {
      vv.removeEventListener("resize", sync)
      vv.removeEventListener("scroll", sync)
      setInset(null)
    }
  }, [active])
  return inset
}

/** Right on a wide screen, down on a phone; down until the first effect runs (SSR). */
function useSide(): "right" | "down" {
  const [wide, setWide] = useState(false)
  useEffect(() => {
    // Test environments (jsdom) and very old browsers have no matchMedia.
    if (typeof window.matchMedia !== "function") return
    const q = window.matchMedia("(min-width: 640px)")
    const update = () => setWide(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  return wide ? "right" : "down"
}

function Drawer({open, onClose, title, description, children, footer, size = "md", density: densityProp, locale = DEFAULT_LOCALE, initialFocus, dismissible = true, hideClose = false, aria}: DrawerProps) {
  const scope = useThemeScope()
  const theme = scope.theme
  const density = densityProp ?? scope.density
  const closeLabel = getModalLabels(locale).close
  const side = useSide()
  const keyboard = useKeyboardInset(open && side === "down")
  return (
    <Primitive.Root open={open} onOpenChange={guardedOpenChange(dismissible, onClose)} disablePointerDismissal={!dismissible} swipeDirection={side}>
      <Primitive.Portal data-ctech-theme={theme} data-density={density}>
        <Primitive.Backdrop
          className={cn(
            "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ease-out",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none"
          )}
        />
        {/* The viewport is what turns on swipe-to-dismiss and touch scroll lock. */}
        <Primitive.Viewport className="fixed inset-0 z-50">
        <Primitive.Popup
          initialFocus={resolveInitialFocus(initialFocus)}
          {...(aria?.role && {role: aria.role})}
          aria-describedby={aria?.describedBy}
          style={keyboard ? {bottom: keyboard.bottom, maxHeight: keyboard.height * 0.9} : undefined}
          className={cn(
            "fixed z-50 flex flex-col bg-background text-foreground shadow-modal outline-none",
            "transition-transform duration-200 ease-out data-[swiping]:transition-none motion-reduce:transition-none",
            side === "right"
              ? cn(
                  "inset-y-0 right-0 w-full border-l border-border",
                  WIDTH[size],
                  "[transform:translateX(var(--drawer-swipe-movement-x,0px))]",
                  "data-[starting-style]:[transform:translateX(100%)] data-[ending-style]:[transform:translateX(100%)]"
                )
              : cn(
                  "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-xl border-t border-border",
                  "[transform:translateY(var(--drawer-swipe-movement-y,0px))]",
                  "data-[starting-style]:[transform:translateY(100%)] data-[ending-style]:[transform:translateY(100%)]"
                )
          )}
        >
          {side === "down" && <div aria-hidden className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-border" />}
          <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="space-y-1">
              <Primitive.Title className="text-base font-semibold text-foreground">{title}</Primitive.Title>
              {description && <Primitive.Description className="text-sm text-muted-foreground">{description}</Primitive.Description>}
            </div>
            {!hideClose && (
              <Primitive.Close disabled={!dismissible} render={<Button variant="ghost" size="icon" aria-label={closeLabel} className="-mr-2 shrink-0 text-muted-foreground" />}>
                <CloseGlyph />
              </Primitive.Close>
            )}
          </header>
          {/* swipe-ignore: a vertical drag on a form is a scroll (above the keyboard), not a dismiss; the handle and header still swipe. */}
          <div data-base-ui-swipe-ignore className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <footer className="border-t border-border bg-surface px-5 py-3">{footer}</footer>}
        </Primitive.Popup>
        </Primitive.Viewport>
      </Primitive.Portal>
    </Primitive.Root>
  )
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="size-4">
      <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  )
}

export {Drawer, type DrawerProps}
