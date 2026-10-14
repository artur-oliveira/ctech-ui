"use client"

import {Dialog} from "@base-ui/react/dialog"
import {useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode} from "react"

import {cn} from "../lib/cn"
import {DEFAULT_LOCALE, getCommandPaletteLabels, type CommandPaletteLabels, type Locale} from "../lib/i18n"
import {defaultRenderLink, type RenderLink} from "../lib/link"
import {matchEntries} from "../lib/match"
import {useThemeScope, type Density} from "./theme-provider"

interface CommandEntry {
  id: string
  label: string
  /** The subproduct (or section) the entry belongs to; shown as context. */
  group: string
  /** An action does something (opens a form); a page goes somewhere. */
  kind: "page" | "action"
  keywords?: string[]
  icon?: ReactNode
  /** A page: rendered through `renderLink`, so it is a real link. */
  href?: string
  /** An action: called right after the dialog closes. */
  onSelect?: () => void
}

interface CommandPaletteProps {
  entries: CommandEntry[]
  open: boolean
  onOpenChange: (open: boolean) => void
  renderLink?: RenderLink
  locale?: Locale
  labels?: Partial<CommandPaletteLabels>
  /** Results shown. Defaults to 8. */
  limit?: number
  /** The palette renders in a portal; it follows the nearest DensityScope unless told otherwise. */
  density?: Density
}

const ROW = cn(
  "flex w-full min-h-11 items-center gap-3 rounded-md px-2.5 py-2 text-left outline-none",
  "in-data-[density=compact]:min-h-9 touch:min-h-11",
  "aria-selected:bg-surface [&_svg]:size-4 [&_svg]:shrink-0"
)

/**
 * ⌘K navigation: a search over the screens and actions an app hands it. The
 * app owns the entries and `open`; the palette owns matching, keyboard and
 * focus. Built on Base UI's Dialog (focus trap, Escape, scroll lock). The body
 * mounts only while open, so each opening starts with an empty query.
 */
function CommandPalette({entries, open, onOpenChange, renderLink = defaultRenderLink, locale = DEFAULT_LOCALE, labels, limit = 8, density: densityProp}: CommandPaletteProps) {
  const text = getCommandPaletteLabels(locale, labels)
  const scope = useThemeScope()
  const density = densityProp ?? scope.density
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal data-ctech-theme={scope.theme} data-density={density}>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          aria-label={text.dialog}
          className="fixed top-[10vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-modal outline-none"
        >
          <Dialog.Title className="sr-only">{text.dialog}</Dialog.Title>
          <Body entries={entries} limit={limit} text={text} renderLink={renderLink} close={() => onOpenChange(false)} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Body({entries, limit, text, renderLink, close}: {entries: CommandEntry[]; limit: number; text: CommandPaletteLabels; renderLink: RenderLink; close: () => void}) {
  const [query, setQuery] = useState("")
  const [cursor, setCursor] = useState(0)
  const listId = useId()
  const refs = useRef<(HTMLElement | null)[]>([])
  const results = useMemo(() => matchEntries(entries, query, limit), [entries, query, limit])
  const at = results.length === 0 ? -1 : Math.min(cursor, results.length - 1)

  useEffect(() => {
    refs.current[at]?.scrollIntoView?.({block: "nearest"})
  }, [at])

  const onKeyDown = (e: KeyboardEvent) => {
    if (results.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setCursor((at + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setCursor((at - 1 + results.length) % results.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      refs.current[at]?.click()
    }
  }

  const grouped = query.trim() === ""
  return (
    <div>
      <div className="border-b border-border px-3">
        <input
          autoFocus
          role="combobox"
          aria-label={text.dialog}
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={at >= 0 ? `${listId}-${at}` : undefined}
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={text.placeholder}
          onChange={e => {
            setQuery(e.target.value)
            setCursor(0)
          }}
          onKeyDown={onKeyDown}
          className="h-12 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground md:text-sm"
        />
      </div>
      <ul id={listId} role="listbox" aria-label={text.results} className="m-0 max-h-80 list-none overflow-y-auto p-1.5">
        {results.length === 0 && (
          <li role="presentation" className="px-3 py-6 text-center text-sm text-muted-foreground">
            {text.empty} <b className="text-foreground">{query}</b>
          </li>
        )}
        {results.map((entry, i) => {
          const heading = grouped && (i === 0 || results[i - 1].group !== entry.group)
          const body = (
            <>
              {entry.icon && <span className="text-muted-foreground" aria-hidden>{entry.icon}</span>}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{entry.label}</span>
                {!grouped && <span className="block truncate text-xs text-muted-foreground">{entry.group}</span>}
              </span>
              {entry.kind === "action" && <span className="shrink-0 text-xs text-muted-foreground">{text.action}</span>}
            </>
          )
          const common = {
            id: `${listId}-${i}`,
            role: "option",
            "aria-selected": i === at,
            className: ROW,
            onMouseEnter: () => setCursor(i),
          } as const
          return (
            <li key={entry.id} role="presentation">
              {heading && <p aria-hidden className="m-0 px-2.5 pt-2 pb-1 text-xs text-muted-foreground">{entry.group}</p>}
              {entry.kind === "page" && entry.href ? (
                renderLink({...common, href: entry.href, onClick: close, ref: el => { refs.current[i] = el }, children: body})
              ) : (
                <button
                  {...common}
                  type="button"
                  ref={el => { refs.current[i] = el }}
                  onClick={() => {
                    close()
                    entry.onSelect?.()
                  }}
                >
                  {body}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CommandPaletteTrigger({onClick, locale = DEFAULT_LOCALE, labels, className}: {onClick: () => void; locale?: Locale; labels?: Partial<CommandPaletteLabels>; className?: string}) {
  const text = getCommandPaletteLabels(locale, labels)
  const mac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={text.trigger}
      aria-keyshortcuts="Control+K Meta+K"
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm text-muted-foreground outline-none",
        "hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 touch:min-h-11 touch:min-w-11 touch:justify-center",
        "max-sm:w-8 max-sm:justify-center max-sm:px-0 [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <span className="max-sm:hidden">{text.trigger}</span>
      <kbd className="rounded border border-border px-1.5 text-xs font-medium max-sm:hidden touch:hidden">{mac ? "⌘K" : "Ctrl K"}</kbd>
    </button>
  )
}

/** ⌘K / Ctrl+K anywhere, including from a field: the key is not typed text. */
function useCommandPaletteShortcut(onToggle: () => void): void {
  const ref = useRef(onToggle)
  useEffect(() => {
    ref.current = onToggle
  })
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault()
        ref.current()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])
}

export {CommandPalette, CommandPaletteTrigger, useCommandPaletteShortcut, type CommandEntry, type CommandPaletteProps}
