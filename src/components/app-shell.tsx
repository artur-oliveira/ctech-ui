import type {CSSProperties, ReactNode} from "react"

import {cn} from "../lib/cn"
import {DEFAULT_LOCALE, getAppShellLabels, type AppShellLabels, type Locale} from "../lib/i18n"
import {defaultRenderLink, type RenderLink} from "../lib/link"

/**
 * A product's frame, the CTech family's grammar (ctech-account, ctech-wallet):
 * a bar across the top with the mark at the left and, at the right, whose
 * work this is, the product's actions (a language switch) and the person.
 * Under it, from `md`, the sections in a column pinned to the left edge, and
 * the page across the rest of the width: a wide screen gives its width to the
 * page, where tables compare down a column, not to empty margins. On a phone
 * the bar stays and the sections move to the product's `BottomNav`.
 *
 * How wide a page reads is the page's decision (`contentClassName`): a form or
 * a detail keeps a reading width inside it.
 */

interface AppShellProps {
  /** Mark and product name, the bar's left end. */
  brand: ReactNode
  /** Whose work this is (an organization or space switch), at the bar's right. */
  context?: ReactNode
  /** The product's own controls beside the person (a language switch). */
  actions?: ReactNode
  /** The sections, usually `SidebarNav`. A column from `md`; none on a phone. */
  nav?: ReactNode
  /** The person (`UserMenu`), the bar's right end. */
  account: ReactNode
  /** Full-width notice under the bar (a test-mode band). */
  banner?: ReactNode
  /** The phone's navigation; rendered after the page. */
  bottomNav?: ReactNode
  /** Width and padding of the page area. Defaults to a wide, centred measure. */
  contentClassName?: string
  className?: string
  children: ReactNode
  locale?: Locale
  labels?: Partial<AppShellLabels>
}

const MAIN_ID = "app-shell-main"
/** The bar's height; the column sticks right under it. */
const BAR = "3.5rem"

function AppShell({
  brand,
  context,
  actions,
  nav,
  account,
  banner,
  bottomNav,
  contentClassName,
  className,
  children,
  locale = DEFAULT_LOCALE,
  labels,
}: AppShellProps) {
  const text = getAppShellLabels(locale, labels)
  return (
    <div data-slot="app-shell" className={cn("flex min-h-dvh flex-col bg-background text-foreground", className)} style={{"--app-shell-bar": BAR} as CSSProperties}>
      <a
        href={`#${MAIN_ID}`}
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-3 focus:ring-ring/50"
      >
        {text.skip}
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-(--app-shell-bar) items-center gap-3 px-4 lg:px-6">
          <div className="flex min-w-0 shrink-0 items-center">{brand}</div>
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
            {context && <div className="min-w-0 flex-1 sm:w-60 sm:flex-none">{context}</div>}
            {actions}
            {account}
          </div>
        </div>
      </header>
      {banner}
      <div className="flex flex-1">
        {nav && (
          <aside
            data-testid="app-shell-sidebar"
            className="sticky top-(--app-shell-bar) hidden h-[calc(100dvh-var(--app-shell-bar))] w-56 shrink-0 overflow-y-auto px-4 py-8 md:block lg:w-60 lg:px-6"
          >
            {nav}
          </aside>
        )}
        <main id={MAIN_ID} tabIndex={-1} className={cn("w-full min-w-0 max-w-[96rem] px-4 py-6 outline-none sm:px-6 md:py-8 lg:px-10", contentClassName)}>
          {children}
        </main>
      </div>
      {bottomNav}
    </div>
  )
}

interface SidebarNavItem {
  href: string
  label: string
  icon?: ReactNode
  /** Supplied by the caller from its router. Renders `aria-current="page"`. */
  active?: boolean
}

interface SidebarNavGroup {
  /** A heading above the group; the first group usually has none. */
  label?: string
  items: SidebarNavItem[]
}

interface SidebarNavProps {
  /** The navigation's accessible name. */
  label: string
  groups: SidebarNavGroup[]
  renderLink?: RenderLink
  className?: string
}

/** A rail: the list's left edge is a hairline, and the current section draws
 *  its own stretch of it in the brand colour, with weight. */
const ITEM = cn(
  "-ml-px flex min-h-9 items-center gap-2.5 border-l-2 border-transparent pl-3 text-sm text-muted-foreground outline-none",
  "in-data-[density=compact]:min-h-8",
  "transition-colors duration-150 motion-reduce:transition-none",
  "hover:border-border hover:text-foreground focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50",
  "aria-[current=page]:border-brand-600 aria-[current=page]:font-medium aria-[current=page]:text-foreground",
  "[&_svg]:size-4 [&_svg]:shrink-0"
)

/** The column's sections on a rail. "Current" is an edge and a weight, never colour alone. */
function SidebarNav({label, groups, renderLink = defaultRenderLink, className}: SidebarNavProps) {
  return (
    <nav aria-label={label} className={cn("flex flex-col gap-5", className)}>
      {groups.map((group, i) => (
        <div key={group.label ?? i}>
          {group.label && <p className="m-0 pb-1.5 pl-3.5 text-xs text-muted-foreground">{group.label}</p>}
          <ul className="m-0 flex list-none flex-col gap-0.5 border-l border-border p-0">
            {group.items.map(item => (
              <li key={item.href}>
                {renderLink({
                  href: item.href,
                  className: ITEM,
                  "aria-current": item.active ? "page" : undefined,
                  children: (
                    <>
                      {item.icon && <span aria-hidden className="flex shrink-0">{item.icon}</span>}
                      <span className="min-w-0 truncate">{item.label}</span>
                    </>
                  ),
                })}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export {AppShell, SidebarNav, type AppShellProps, type SidebarNavGroup, type SidebarNavItem, type SidebarNavProps}
