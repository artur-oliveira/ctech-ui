"use client"

import {Avatar} from "@base-ui/react/avatar"
import {Menu} from "@base-ui/react/menu"
import type {ReactNode} from "react"

import {cn} from "../lib/cn"
import {DEFAULT_LOCALE, getUserMenuLabels, type Locale, type UserMenuLabels} from "../lib/i18n"
import {defaultRenderLink, type RenderLink} from "../lib/link"
import {useThemeScope} from "./theme-provider"

/**
 * The signed-in person, behind their avatar: who they are (the whole name, never
 * truncated — "Maria Aparecida dos Santos" cut to "Maria Apar…" is someone
 * else), which view of the product they are in, and the way out.
 *
 * Base UI's Menu supplies the menu-button pattern: Enter/Space/ArrowDown open
 * it, arrow keys move, type-ahead, Escape closes and focus returns to the
 * avatar. The views are generic — a product passes "Portal" and "Console", or
 * anything else — and the current one is marked with a check and
 * `aria-current`, not with colour alone.
 */

interface UserMenuTarget {
  /** Renders a link through `renderLink`; otherwise the item runs `onClick`. */
  href?: string
  onClick?: () => void
}

interface UserMenuView extends UserMenuTarget {
  label: string
  icon?: ReactNode
  current?: boolean
}

interface UserMenuItem extends UserMenuTarget {
  label: string
  icon?: ReactNode
}

interface UserMenuProps {
  /** Full name, shown whole in the menu and turned into initials on the avatar. */
  name: string
  email?: string
  /** Shown instead of the initials once it loads. */
  imageUrl?: string
  /** A view switcher section (e.g. Portal / Console). Omitted when empty. */
  views?: UserMenuView[]
  /** Extra actions between the views and sign-out. */
  items?: UserMenuItem[]
  /** Renders the sign-out item when given. */
  onSignOut?: () => void
  renderLink?: RenderLink
  /** Which edge of the avatar the menu lines up with. Defaults to "end". */
  align?: "start" | "center" | "end"
  /** BCP-47 tag for built-in copy. Defaults to "pt-BR". */
  locale?: Locale
  labels?: Partial<UserMenuLabels>
  /** Applied to the trigger. */
  className?: string
}

const ITEM = cn(
  "group/item flex min-h-11 w-full cursor-default items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground outline-none select-none",
  "in-data-[density=compact]:min-h-9",
  "data-[highlighted]:bg-surface data-[disabled]:opacity-50",
  "[&_svg]:size-4 [&_svg]:shrink-0"
)
const ICON = "flex size-4 shrink-0 items-center justify-center text-muted-foreground"

/** First and last initials, by grapheme-ish code point so "Érica Ödegaard" is "ÉÖ". */
function initialsOf(name: string, email?: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = (w?: string) => (w ? Array.from(w)[0] ?? "" : "")
  if (words.length === 0) return first(email?.trim()).toUpperCase()
  const letters = words.length === 1 ? first(words[0]) : first(words[0]) + first(words[words.length - 1])
  return letters.toUpperCase()
}

function UserAvatar({name, email, imageUrl, className}: {name: string; email?: string; imageUrl?: string; className?: string}) {
  const initials = initialsOf(name, email)
  return (
    <Avatar.Root
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 align-middle font-semibold text-brand-700 select-none",
        className
      )}
    >
      {imageUrl && <Avatar.Image src={imageUrl} alt="" className="size-full object-cover" />}
      <Avatar.Fallback className="flex size-full items-center justify-center">
        {initials || <PersonGlyph />}
      </Avatar.Fallback>
    </Avatar.Root>
  )
}

function UserMenu({
  name,
  email,
  imageUrl,
  views = [],
  items = [],
  onSignOut,
  renderLink = defaultRenderLink,
  align = "end",
  locale = DEFAULT_LOCALE,
  labels,
  className,
}: UserMenuProps) {
  const text = getUserMenuLabels(locale, labels)
  const {theme, density} = useThemeScope()

  const renderEntry = (entry: UserMenuItem | UserMenuView, trailing?: ReactNode, current?: boolean) => {
    const content = (
      <>
        {entry.icon && <span aria-hidden className={ICON}>{entry.icon}</span>}
        <span className="min-w-0 flex-1 break-words">{entry.label}</span>
        {trailing}
      </>
    )
    const ariaCurrent = current ? ("true" as const) : undefined
    if (entry.href !== undefined) {
      const href = entry.href
      return (
        <Menu.LinkItem
          key={entry.label}
          href={href}
          closeOnClick
          onClick={entry.onClick}
          aria-current={ariaCurrent}
          className={ITEM}
          render={props => renderLink({...props, href})}
        >
          {content}
        </Menu.LinkItem>
      )
    }
    return (
      <Menu.Item key={entry.label} onClick={entry.onClick} aria-current={ariaCurrent} className={ITEM}>
        {content}
      </Menu.Item>
    )
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`${text.trigger}: ${name}`}
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-full outline-none",
          "in-data-[density=compact]:size-8",
          "transition-shadow duration-150 motion-reduce:transition-none",
          "hover:ring-2 hover:ring-border focus-visible:ring-3 focus-visible:ring-ring/50 data-[popup-open]:ring-2 data-[popup-open]:ring-ring/50",
          className
        )}
      >
        <UserAvatar
          name={name}
          email={email}
          imageUrl={imageUrl}
          className="size-9 text-sm in-data-[density=compact]:size-8 in-data-[density=compact]:text-xs"
        />
      </Menu.Trigger>
      <Menu.Portal data-ctech-theme={theme} data-density={density}>
        <Menu.Positioner sideOffset={8} align={align} collisionPadding={8} className="z-50 outline-none">
          <Menu.Popup
            className={cn(
              "w-72 max-w-[calc(100vw-1rem)] origin-[var(--transform-origin)] rounded-xl border border-border bg-background p-1.5 text-foreground shadow-modal outline-none",
              "transition-[opacity,scale] duration-150 ease-out",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
              "motion-reduce:transition-opacity motion-reduce:data-[starting-style]:scale-100 motion-reduce:data-[ending-style]:scale-100"
            )}
          >
            {/* Who is signed in. Not a menu item: there is nothing to do with it,
                and arrowing onto your own name would be one stop too many. */}
            <div className="flex items-start gap-3 px-3 pt-2.5 pb-3">
              <UserAvatar name={name} email={email} imageUrl={imageUrl} className="size-10 text-sm" />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="m-0 text-sm/5 font-semibold text-pretty [overflow-wrap:anywhere]">{name}</p>
                {email && <p className="m-0 mt-0.5 text-xs/4 text-muted-foreground [overflow-wrap:anywhere]">{email}</p>}
              </div>
            </div>

            {views.length > 0 && (
              <>
                <Menu.Separator className="-mx-1.5 my-1 h-px bg-border" />
                <Menu.Group>
                  <Menu.GroupLabel className="px-3 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">{text.views}</Menu.GroupLabel>
                  {views.map(view =>
                    renderEntry(view, view.current ? <CheckGlyph /> : <span aria-hidden className="size-4 shrink-0" />, view.current)
                  )}
                </Menu.Group>
              </>
            )}

            {items.length > 0 && (
              <>
                <Menu.Separator className="-mx-1.5 my-1 h-px bg-border" />
                {items.map(item => renderEntry(item))}
              </>
            )}

            {onSignOut && (
              <>
                <Menu.Separator className="-mx-1.5 my-1 h-px bg-border" />
                <Menu.Item onClick={onSignOut} className={ITEM}>
                  <span aria-hidden className={ICON}><SignOutGlyph /></span>
                  <span className="min-w-0 flex-1">{text.signOut}</span>
                </Menu.Item>
              </>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="size-4 shrink-0 text-brand-600">
      <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SignOutGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path d="M6 2.75H3.75a1 1 0 0 0-1 1v8.5a1 1 0 0 0 1 1H6M10.5 11l3-3-3-3M13.25 8H6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PersonGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="size-1/2">
      <circle cx="8" cy="5.5" r="2.75" />
      <path d="M2.75 13.5c.9-2.4 2.85-3.75 5.25-3.75s4.35 1.35 5.25 3.75" strokeLinecap="round" />
    </svg>
  )
}

export {UserMenu, initialsOf, type UserMenuItem, type UserMenuProps, type UserMenuView}
