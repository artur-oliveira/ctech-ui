"use client"

import {Menu} from "@base-ui/react/menu"
import type {ReactNode} from "react"

import {cn} from "../lib/cn"
import {DEFAULT_LOCALE, getRowMenuLabels, type Locale, type RowMenuLabels} from "../lib/i18n"
import {Button} from "./button"
import {useThemeScope} from "./theme-provider"

interface RowMenuItem {
  /** Stable identity; defaults to `label`. */
  key?: string
  label: string
  onSelect: () => void
  /** Drawn in the danger colour. Should open a confirmation, not act at once. */
  destructive?: boolean
  /** Decoration before the label. */
  icon?: ReactNode
  disabled?: boolean
}

interface RowMenuProps {
  items: RowMenuItem[]
  /**
   * The trigger's accessible name. Name it for the row when a list has many
   * ("Mais ações: Aluguel"); defaults to the catalogue's "Mais ações" / "More actions".
   */
  label?: string
  /** BCP-47 tag for built-in copy. Defaults to "pt-BR". */
  locale?: Locale
  labels?: Partial<RowMenuLabels>
  align?: "start" | "center" | "end"
  className?: string
}

const ITEM = cn(
  "flex min-h-11 w-full cursor-default items-center gap-3 rounded-md px-3 text-left text-sm outline-none select-none",
  "in-data-[density=compact]:min-h-8 in-data-[density=compact]:px-2.5",
  "data-[highlighted]:bg-surface data-[disabled]:opacity-50",
  "[&_svg]:size-4 [&_svg]:shrink-0"
)

/**
 * A row's "⋯": the visible, keyboard and screen-reader way to a row's secondary
 * actions. Pair it with `SwipeRow`, which reveals the same actions under a
 * finger: a gesture is never the only way in. Base UI's Menu gives the
 * menu-button pattern (arrow keys, type-ahead, Escape returns focus).
 */
function RowMenu({items, label, locale = DEFAULT_LOCALE, labels, align = "end", className}: RowMenuProps) {
  const text = getRowMenuLabels(locale, labels)
  const {theme, density} = useThemeScope()
  return (
    <Menu.Root>
      <Menu.Trigger
        render={<Button variant="ghost" size="icon" aria-label={label ?? text.trigger} className={cn("text-muted-foreground", className)} />}
      >
        <EllipsisGlyph />
      </Menu.Trigger>
      <Menu.Portal data-ctech-theme={theme} data-density={density}>
        <Menu.Positioner sideOffset={4} align={align} collisionPadding={8} className="z-50 outline-none">
          <Menu.Popup
            data-slot="row-menu"
            className={cn(
              "min-w-44 max-w-[calc(100vw-1rem)] origin-[var(--transform-origin)] rounded-lg border border-border bg-background p-1 text-foreground shadow-modal outline-none",
              "transition-[opacity,scale] duration-150 ease-out",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
              "motion-reduce:transition-opacity motion-reduce:data-[starting-style]:scale-100 motion-reduce:data-[ending-style]:scale-100"
            )}
          >
            {items.map(item => (
              <Menu.Item
                key={item.key ?? item.label}
                data-slot="menu-item"
                disabled={item.disabled}
                onClick={item.onSelect}
                className={cn(ITEM, item.destructive ? "text-danger" : "text-foreground")}
              >
                {item.icon && <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">{item.icon}</span>}
                <span className="min-w-0 flex-1">{item.label}</span>
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function EllipsisGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className="size-4">
      <circle cx="3.25" cy="8" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="12.75" cy="8" r="1.25" />
    </svg>
  )
}

export {RowMenu, type RowMenuItem, type RowMenuProps}
