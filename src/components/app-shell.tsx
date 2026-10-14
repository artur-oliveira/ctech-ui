import type {ReactNode} from "react"

import {cn} from "../lib/cn"
import {DEFAULT_LOCALE, getAppShellLabels, type AppShellLabels, type Locale} from "../lib/i18n"
import {defaultRenderLink, type RenderLink} from "../lib/link"

/**
 * A product's frame: one column pinned to the left edge from `md` up, holding
 * the mark, the context the person works in (an organization, a space), the
 * sections and the person; the page takes the rest of the width. Under `md`
 * the same column is a bar across the top (the sections move to the product's
 * `BottomNav`), so every slot is rendered once and nothing is duplicated for
 * a breakpoint.
 *
 * The column is the width of its longest label and no wider, and it scrolls
 * on its own; a wide screen gives its extra width to the page, where tables
 * compare down a column. How wide a page reads is the page's decision
 * (`contentClassName`): a form or a detail keeps a reading width inside it.
 */

interface AppShellProps {
  /** Mark and product name. */
  brand: ReactNode
  /** Whose work this is (an organization or space switch). Under the brand; in the bar on a phone. */
  context?: ReactNode
  /** The sections, usually `SidebarNav`. Not shown on a phone: that is the `BottomNav`'s job. */
  nav?: ReactNode
  /** The person (`UserMenu trigger="row"`): the foot of the column, the end of the bar. */
  account: ReactNode
  /** Full-width notice above the page (a test-mode band). Never inside the column. */
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

function AppShell({
  brand,
  context,
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
    <div data-slot="app-shell" className={cn("min-h-dvh bg-background text-foreground md:flex", className)}>
      <a
        href={`#${MAIN_ID}`}
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-3 focus:ring-ring/50"
      >
        {text.skip}
      </a>
      <aside
        data-testid="app-shell-sidebar"
        className={cn(
          "sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background px-4 py-2",
          "md:h-dvh md:w-60 md:shrink-0 md:flex-col md:items-stretch md:gap-0 md:overflow-y-auto md:border-r md:border-b-0 md:bg-surface md:px-3 md:py-3"
        )}
      >
        <div className="flex min-h-10 shrink-0 items-center md:px-2">{brand}</div>
        {context && <div className="min-w-0 flex-1 md:mt-3 md:flex-none">{context}</div>}
        {nav && <div className="hidden md:mt-4 md:block">{nav}</div>}
        <div className={cn("shrink-0 md:mt-auto md:border-t md:border-border md:pt-3", !context && "ml-auto md:ml-0")}>
          {account}
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        {banner}
        <main id={MAIN_ID} tabIndex={-1} className={cn("mx-auto w-full max-w-[96rem] px-4 py-6 outline-none sm:px-6 lg:px-10 lg:py-8", contentClassName)}>
          {children}
        </main>
        {bottomNav}
      </div>
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

const ITEM = cn(
  "flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-sm text-muted-foreground outline-none",
  "in-data-[density=compact]:min-h-8",
  "transition-colors duration-150 motion-reduce:transition-none",
  "hover:bg-background hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
  "aria-[current=page]:bg-brand-50 aria-[current=page]:font-medium aria-[current=page]:text-brand-700",
  "[&_svg]:size-4 [&_svg]:shrink-0"
)

/** The column's sections. "Current" is a fill and a weight, never colour alone. */
function SidebarNav({label, groups, renderLink = defaultRenderLink, className}: SidebarNavProps) {
  return (
    <nav aria-label={label} className={cn("flex flex-col gap-4", className)}>
      {groups.map((group, i) => (
        <div key={group.label ?? i}>
          {group.label && <p className="m-0 px-2 pb-1 text-xs font-medium text-muted-foreground">{group.label}</p>}
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
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
