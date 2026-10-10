"use client"

import {Select as Primitive} from "@base-ui/react/select"
import type {ReactNode} from "react"

import {cn} from "../lib/cn"
import {DEFAULT_LOCALE, getSelectLabels, type Locale, type SelectLabels} from "../lib/i18n"
import {useThemeScope, type Density} from "./theme-provider"

interface SelectOption {
  value: string
  label: string
  /**
   * Decoration beside the label (a brand's mark, a colour swatch), in the list
   * and on the trigger. Hidden from assistive technology: the label is the name.
   */
  icon?: ReactNode
  disabled?: boolean
}

/**
 * Something to do rather than something to pick ("+ Novo espaço"), listed after
 * the options behind a divider. Choosing it runs `onSelect` and leaves the value
 * where it was. Only a deliberate press in the open list runs it, never
 * type-ahead on the closed trigger.
 */
interface SelectAction {
  label: string
  icon?: ReactNode
  onSelect: () => void
}

interface SelectProps {
  id?: string
  /** The chosen value; "" is "nothing chosen" (the `none` option, if any). */
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  actions?: SelectAction[]
  /**
   * Makes the choice optional: a first option that gives back "" when chosen.
   * `true` uses the catalogue's label ("Nenhum" / "None"); a string replaces it
   * ("Nenhuma", for a feminine noun).
   */
  none?: boolean | string
  /** Shown while nothing is chosen and there is no `none`. */
  placeholder?: string
  disabled?: boolean
  /** Submits the value with a form, as a hidden input. */
  name?: string
  /** BCP-47 tag for built-in copy. Defaults to "pt-BR". */
  locale?: Locale
  labels?: Partial<SelectLabels>
  /** The list renders in a portal; it follows the nearest DensityScope unless set. */
  density?: Density
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  className?: string
}

/** The values the action items answer to. No real option value starts with a NUL. */
const ACTION = "\u0000action:"
/** The value of the "none" option; the caller sees "". */
const NONE = "\u0000none"

const ITEM = cn(
  "flex min-h-11 cursor-default items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-foreground outline-none select-none",
  "in-data-[density=compact]:min-h-8 in-data-[density=compact]:px-2",
  "data-[highlighted]:bg-surface data-[disabled]:opacity-50"
)

/**
 * A styled single select on Base UI's Select, in place of the native element.
 *
 * The trigger always shows the chosen option's label, never its value: the
 * options are given to Base UI as `items`, and the trigger renders the label
 * for the current value explicitly, so an id such as "acc_01J9ZX" never leaks
 * onto the screen. Sized by density like every control (44px, 32px compact).
 * Label it with `Field` (`htmlFor` = `id`) or `aria-label`.
 */
function Select({
  id,
  value,
  onValueChange,
  options: given,
  actions = [],
  none,
  placeholder,
  disabled,
  name,
  locale = DEFAULT_LOCALE,
  labels,
  density: densityProp,
  className,
  ...aria
}: SelectProps) {
  const text = getSelectLabels(locale, labels)
  const scope = useThemeScope()
  const density = densityProp ?? scope.density
  const noneLabel = typeof none === "string" ? none : none ? text.none : undefined
  // An optional choice lists its "none" first, as a real option: the list is
  // where a choice is undone.
  const options: SelectOption[] = noneLabel ? [{value: NONE, label: noneLabel}, ...given] : given
  const find = (v: string | null) => options.find(o => o.value === v)

  return (
    <Primitive.Root
      items={options}
      value={value === "" ? (noneLabel ? NONE : null) : value}
      onValueChange={(next, details) => {
        const raw = (next as string | null) ?? ""
        if (raw.startsWith(ACTION)) {
          // Only a press in the open list (a click, a tap, Enter) runs an
          // action. Base UI also types ahead on a closed, focused trigger, and
          // "n" there must not start "Novo espaço" and leave the page.
          if (details.reason === "item-press") actions[Number(raw.slice(ACTION.length))]?.onSelect()
          return
        }
        onValueChange(raw === NONE ? "" : raw)
      }}
      disabled={disabled}
    >
      <Primitive.Trigger
        id={id}
        aria-label={aria["aria-label"]}
        aria-labelledby={aria["aria-labelledby"]}
        aria-invalid={aria["aria-invalid"]}
        aria-describedby={aria["aria-describedby"]}
        data-slot="select-trigger"
        className={cn(
          "flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-left text-sm text-foreground outline-none",
          "transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none",
          "hover:bg-surface focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35 data-[popup-open]:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20",
          "in-data-[density=compact]:h-8 in-data-[density=compact]:px-2.5",
          className
        )}
      >
        <Primitive.Value className="min-w-0 truncate data-[placeholder]:text-muted-foreground">
          {(v: string | null) => {
            const option = find(v)
            if (!option) return placeholder ?? text.placeholder
            return option.icon ? (
              <span className="flex min-w-0 items-center gap-2">
                <OptionIcon>{option.icon}</OptionIcon>
                <span className="truncate">{option.label}</span>
              </span>
            ) : (
              option.label
            )
          }}
        </Primitive.Value>
        <Primitive.Icon className="flex shrink-0 text-muted-foreground">
          <ChevronGlyph />
        </Primitive.Icon>
      </Primitive.Trigger>
      {name && <input type="hidden" name={name} value={value} />}
      <Primitive.Portal data-ctech-theme={scope.theme} data-density={density}>
        <Primitive.Positioner sideOffset={4} alignItemWithTrigger={false} collisionPadding={8} className="z-50 outline-none">
          <Primitive.Popup
            data-slot="select-popup"
            className={cn(
              "max-h-[min(18rem,var(--available-height))] min-w-[var(--anchor-width)] max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain",
              "rounded-lg border border-border bg-background p-1 text-foreground shadow-modal outline-none",
              "origin-[var(--transform-origin)] transition-[opacity,scale] duration-150 ease-out",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
              "motion-reduce:transition-opacity motion-reduce:data-[starting-style]:scale-100"
            )}
          >
            <Primitive.List>
              {options.map(option => (
                <Primitive.Item key={option.value} value={option.value} disabled={option.disabled} data-slot="select-item" className={cn(ITEM, "justify-between")}>
                  <span className="flex min-w-0 items-center gap-2">
                    {option.icon && <OptionIcon>{option.icon}</OptionIcon>}
                    <Primitive.ItemText className={cn("min-w-0", option.value === NONE && "text-muted-foreground")}>{option.label}</Primitive.ItemText>
                  </span>
                  <Primitive.ItemIndicator className="flex shrink-0 text-brand-600">
                    <CheckGlyph />
                  </Primitive.ItemIndicator>
                </Primitive.Item>
              ))}
              {actions.length > 0 && <Primitive.Separator className="-mx-1 my-1 h-px bg-border" />}
              {actions.map((action, i) => (
                <Primitive.Item key={`${ACTION}${i}`} value={`${ACTION}${i}`} data-slot="select-item" data-action="" className={ITEM}>
                  {action.icon && <OptionIcon className="text-muted-foreground">{action.icon}</OptionIcon>}
                  <Primitive.ItemText className="min-w-0">{action.label}</Primitive.ItemText>
                </Primitive.Item>
              ))}
            </Primitive.List>
          </Primitive.Popup>
        </Primitive.Positioner>
      </Primitive.Portal>
    </Primitive.Root>
  )
}

function OptionIcon({children, className}: {children: ReactNode; className?: string}) {
  return <span aria-hidden className={cn("flex shrink-0 items-center [&_svg:not([class*='size-'])]:size-4", className)}>{children}</span>
}

function ChevronGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="size-4">
      <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="size-4">
      <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export {Select, type SelectAction, type SelectOption, type SelectProps}
