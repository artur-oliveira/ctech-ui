"use client"

import {Drawer as Primitive} from "@base-ui/react/drawer"
import {Fragment, useId, useState} from "react"
import type {CSSProperties, ReactNode} from "react"

import {cn} from "../lib/cn"
import {DEFAULT_LOCALE, getBottomNavLabels, type BottomNavLabels, type Locale} from "../lib/i18n"
import {defaultRenderLink, type RenderLink} from "../lib/link"
import {Button} from "./button"
import {useThemeScope} from "./theme-provider"

/**
 * The phone's primary navigation: a bar at the bottom, where the thumb already
 * is, instead of a desktop sidebar squeezed into a hamburger. Hidden from `md`
 * up, where the product's own sidebar or tabs take over.
 *
 * Up to four tabs and, between them, one primary action the screen decides
 * ("+" on a list, nothing on a form). One tab may be a "more" tab that opens a
 * bottom sheet with everything secondary — Base UI's Drawer, so the sheet gets
 * the focus trap, Escape, swipe-down and restore-focus without reimplementing
 * any of them.
 *
 * The library knows nothing about routing: the caller says which item is
 * active and how a link navigates (`renderLink`). Touch-sized regardless of
 * `data-density` — a console that is compact on a desk is still a thumb on a
 * phone.
 */

/** A destination: `href` renders a link (through `renderLink`), `onClick` alone a button. */
interface BottomNavTarget {
  href?: string
  onClick?: () => void
}

interface BottomNavTab extends BottomNavTarget {
  label: string
  icon: ReactNode
  /** Supplied by the caller from its router. Renders `aria-current="page"`. */
  active?: boolean
}

interface BottomNavSheetItem extends BottomNavTarget {
  label: string
  icon?: ReactNode
  active?: boolean
  /** Consecutive items with the same group are listed under that heading. */
  group?: string
}

interface BottomNavMore {
  type: "more"
  label: string
  icon: ReactNode
  /** Sheet heading; defaults to `label`. */
  title?: string
  items: BottomNavSheetItem[]
  /** Defaults to "any sheet item is active". */
  active?: boolean
}

type BottomNavItem = BottomNavTab | BottomNavMore

interface BottomNavAction extends BottomNavTarget {
  label: string
  icon: ReactNode
}

interface BottomNavProps {
  /** At most four; any beyond the fourth are not rendered. */
  items: BottomNavItem[]
  /** The central action for this screen, or `null` to leave the slot out. */
  action?: BottomNavAction | null
  renderLink?: RenderLink
  /** BCP-47 tag for built-in copy. Defaults to "pt-BR". */
  locale?: Locale
  labels?: Partial<BottomNavLabels>
  className?: string
}

const MAX_ITEMS = 4
/** Row height; the bar adds the device's safe-area inset below it. */
const BAR_HEIGHT = "4.5rem"
const ACTION_WIDTH = "4.5rem"

const TAB = cn(
  "group flex h-full w-full min-w-0 flex-col items-center justify-start gap-1 px-0.5 pt-2",
  "text-xs/3.5 font-medium text-muted-foreground outline-none select-none [-webkit-tap-highlight-color:transparent]",
  "aria-[current=page]:text-foreground data-[active]:text-foreground"
)
/** The shape behind the icon, so "active" is never colour alone. */
const PILL = cn(
  "flex h-7 w-14 shrink-0 items-center justify-center rounded-full [&_svg]:size-5 [&_svg]:shrink-0",
  "transition-[background-color,color,scale] duration-150 ease-out motion-reduce:transition-none",
  "group-hover:bg-surface group-active:scale-95 motion-reduce:group-active:scale-100",
  "group-focus-visible:ring-3 group-focus-visible:ring-ring/50",
  "group-aria-[current=page]:bg-brand-50 group-aria-[current=page]:text-brand-700",
  "group-data-[active]:bg-brand-50 group-data-[active]:text-brand-700"
)
const TAB_LABEL = "line-clamp-2 max-w-full text-center break-words"

/** Lets "A pagar/receber" wrap after the slash instead of mid-word. */
function breakable(label: string): ReactNode {
  const parts = label.split("/")
  return parts.map((part, i) => (i < parts.length - 1 ? <Fragment key={i}>{part}/<wbr /></Fragment> : part))
}

function isMore(item: BottomNavItem): item is BottomNavMore {
  return "type" in item && item.type === "more"
}

function BottomNav({items, action = null, renderLink = defaultRenderLink, locale = DEFAULT_LOCALE, labels, className}: BottomNavProps) {
  const text = getBottomNavLabels(locale, labels)
  const tabs = items.slice(0, MAX_ITEMS)
  const left = action ? tabs.slice(0, Math.ceil(tabs.length / 2)) : tabs
  const right = action ? tabs.slice(left.length) : []

  // With an action the slot stays dead centre even when the sides are uneven
  // (two tabs and one): each side shares half the bar, whatever its count.
  const columns = action
    ? [side(left.length), ACTION_WIDTH, side(right.length)].filter(Boolean).join(" ")
    : `repeat(${tabs.length}, minmax(0, 1fr))`

  const renderItem = (item: BottomNavItem, index: number) => (
    // Keyed by the tab's own position in `items`, never by its place in the row:
    // the central action coming or going shifts where a tab is drawn, and a
    // positional key would remount it, closing the "more" sheet it has open.
    <li key={`tab-${index}`} className="min-w-0">
      {isMore(item) ? (
        <MoreTab more={item} renderLink={renderLink} closeLabel={text.close} />
      ) : (
        <Target target={item} renderLink={renderLink} className={TAB} current={item.active} label={item.label}>
          <span aria-hidden className={PILL}>{item.icon}</span>
          <span className={TAB_LABEL}>{breakable(item.label)}</span>
        </Target>
      )}
    </li>
  )

  return (
    <nav
      aria-label={text.nav}
      data-slot="bottom-nav"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background text-foreground md:hidden",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      <ul className="grid list-none p-0 m-0" style={{gridTemplateColumns: columns, height: BAR_HEIGHT} satisfies CSSProperties}>
        {/* One flat, keyed list, so React matches each tab by key across renders. */}
        {[
          ...left.map((item, i) => renderItem(item, i)),
          action && (
          <li key="action" className="min-w-0">
            <Target
              target={action}
              renderLink={renderLink}
              className={cn(TAB, "text-foreground")}
            >
              <span
                aria-hidden
                className={cn(
                  // Rises a little over the bar's edge, cut out of it by a ring of the
                  // background, so its label still sits on the tabs' baseline.
                  "-mt-4 flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white ring-4 ring-background [&_svg]:size-6",
                  "shadow-[0_6px_16px_-8px_var(--brand-700)]",
                  "transition-[background-color,scale] duration-150 ease-out motion-reduce:transition-none",
                  "group-hover:bg-brand-700 group-active:scale-95 motion-reduce:group-active:scale-100",
                  "group-focus-visible:outline-3 group-focus-visible:outline-offset-2 group-focus-visible:outline-ring/50"
                )}
              >
                {action.icon}
              </span>
              <span className="max-w-full truncate">{action.label}</span>
            </Target>
          </li>
          ),
          ...right.map((item, i) => renderItem(item, left.length + i)),
        ]}
      </ul>
    </nav>
  )
}

function side(count: number) {
  return count ? `repeat(${count}, calc((100% - ${ACTION_WIDTH}) / 2 / ${count}))` : ""
}

interface TargetProps {
  target: BottomNavTarget
  renderLink: RenderLink
  className: string
  current?: boolean
  /** Fixes the accessible name where the visible one carries <wbr> breaks. */
  label?: string
  children: ReactNode
}

/** A link when there is somewhere to go, a button when there is something to do. */
function Target({target, renderLink, className, current, label, children}: TargetProps) {
  const ariaCurrent = current ? ("page" as const) : undefined
  if (target.href !== undefined) {
    return renderLink({href: target.href, onClick: target.onClick, className, "aria-current": ariaCurrent, "aria-label": label, children})
  }
  return (
    <button type="button" onClick={target.onClick} aria-current={ariaCurrent} aria-label={label} className={className}>
      {children}
    </button>
  )
}

function MoreTab({more, renderLink, closeLabel}: {more: BottomNavMore; renderLink: RenderLink; closeLabel: string}) {
  const [open, setOpen] = useState(false)
  const {theme} = useThemeScope()
  const groupIdPrefix = useId()
  const active = more.active ?? more.items.some(i => i.active)
  const groups = groupItems(more.items)
  const title = more.title ?? more.label

  return (
    <Primitive.Root open={open} onOpenChange={setOpen} swipeDirection="down">
      {/* A button, not a link: it opens something here rather than going anywhere,
          so it carries aria-expanded instead of aria-current. */}
      <Primitive.Trigger aria-label={more.label} className={TAB} data-active={active || open ? "" : undefined}>
        <span aria-hidden className={PILL}>{more.icon}</span>
        <span className={TAB_LABEL}>{breakable(more.label)}</span>
      </Primitive.Trigger>
      {/* Always comfortable: the sheet is a phone's, whatever density the app uses. */}
      <Primitive.Portal data-ctech-theme={theme} data-density="comfortable">
        <Primitive.Backdrop
          className={cn(
            "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ease-out md:hidden",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none"
          )}
        />
        <Primitive.Viewport className="fixed inset-0 z-50 md:hidden">
          <Primitive.Popup
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border-t border-border",
              "bg-background text-foreground shadow-modal outline-none pb-[env(safe-area-inset-bottom)]",
              "transition-transform duration-200 ease-out data-[swiping]:transition-none motion-reduce:transition-none",
              "[transform:translateY(var(--drawer-swipe-movement-y,0px))]",
              "data-[starting-style]:[transform:translateY(100%)] data-[ending-style]:[transform:translateY(100%)]"
            )}
          >
            <div aria-hidden className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-border" />
            <header className="flex items-center justify-between gap-4 px-5 pt-2 pb-1">
              <Primitive.Title className="text-base font-semibold text-foreground">{title}</Primitive.Title>
              <Primitive.Close render={<Button variant="ghost" size="icon" aria-label={closeLabel} className="-mr-2 size-11 shrink-0 text-muted-foreground" />}>
                <CloseGlyph />
              </Primitive.Close>
            </header>
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
              {groups.map((group, g) => {
                const groupId = `${groupIdPrefix}-g${g}`
                return (
                  <section key={g} aria-labelledby={group.label ? groupId : undefined} className={cn(g > 0 && "mt-2 border-t border-border pt-2")}>
                    {group.label && (
                      <h3 id={groupId} className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">{group.label}</h3>
                    )}
                    <ul className="m-0 grid list-none gap-0.5 p-0">
                      {group.items.map((item, i) => (
                        <li key={i}>
                          <Target
                            target={{href: item.href, onClick: () => { item.onClick?.(); setOpen(false) }}}
                            renderLink={renderLink}
                            current={item.active}
                            className={cn(
                              "group/item flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground outline-none",
                              "transition-colors duration-150 motion-reduce:transition-none",
                              "hover:bg-surface focus-visible:ring-3 focus-visible:ring-ring/50",
                              "aria-[current=page]:bg-brand-50 aria-[current=page]:font-medium aria-[current=page]:text-brand-700"
                            )}
                          >
                            {item.icon && <span aria-hidden className="flex size-5 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-5 group-aria-[current=page]/item:text-brand-700">{item.icon}</span>}
                            <span className="min-w-0 flex-1 break-words">{item.label}</span>
                          </Target>
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          </Primitive.Popup>
        </Primitive.Viewport>
      </Primitive.Portal>
    </Primitive.Root>
  )
}

function groupItems(items: BottomNavSheetItem[]) {
  const groups: {label?: string; items: BottomNavSheetItem[]}[] = []
  for (const item of items) {
    const last = groups[groups.length - 1]
    if (last && last.label === item.group) last.items.push(item)
    else groups.push({label: item.group, items: [item]})
  }
  return groups
}

/**
 * Keeps the end of a page clear of the bar on a phone: render it as the last
 * child of the scrolling content. Collapses from `md` up, where the bar is gone.
 */
function BottomNavSpacer({className}: {className?: string}) {
  return <div aria-hidden data-slot="bottom-nav-spacer" className={cn("h-[calc(4.5rem+env(safe-area-inset-bottom))] shrink-0 md:hidden", className)} />
}

/** The same clearance as padding, for a container that owns its own bottom padding. */
const bottomNavInset = "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"

function CloseGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="size-4">
      <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  )
}

export {
  BottomNav,
  BottomNavSpacer,
  bottomNavInset,
  type BottomNavAction,
  type BottomNavItem,
  type BottomNavMore,
  type BottomNavProps,
  type BottomNavSheetItem,
  type BottomNavTab,
}
