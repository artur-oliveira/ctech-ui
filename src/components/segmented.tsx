import type {ReactNode} from "react"

import {cn} from "../lib/cn"

interface SegmentedOption<V extends string> {
  value: V
  /** What is drawn: a word, a short form ("6 m") or an icon. */
  label: ReactNode
  /**
   * The accessible name, required when `label` is an icon or a short form. It
   * must contain the visible text (WCAG 2.5.3, label in name): "6 meses" for "6 m".
   */
  name?: string
  disabled?: boolean
}

interface SegmentedProps<V extends string> {
  /** Names the group for a screen reader; the options are its buttons. */
  label: string
  value: V
  onValueChange: (value: V) => void
  options: SegmentedOption<V>[]
  /** Stretch across the row, the options sharing it equally (a phone's full width). */
  fill?: boolean
  disabled?: boolean
  className?: string
}

/**
 * A small set of mutually exclusive choices, all in view: a group of toggle
 * buttons, the chosen one `aria-pressed`. For a two-to-four-way switch (a view,
 * a period, a direction); more options than that, or options that change what
 * the page is, want a Select or tabs.
 *
 * The group is as tall as the density's other controls (44px comfortable, 32px
 * compact, 36px compact under touch), so it lines up beside a Button or an
 * Input. Segments sit edge to edge, so each one's hit area grows up and down to
 * 44px, never sideways into a neighbour; its width is a finger's (44px) except
 * in a compact surface under a mouse.
 */
function Segmented<V extends string>({label, value, onValueChange, options, fill = false, disabled = false, className}: SegmentedProps<V>) {
  return (
    <div
      role="group"
      aria-label={label}
      data-slot="segmented"
      className={cn(
        "flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5",
        fill ? "w-full" : "w-max max-w-full",
        className
      )}
    >
      {options.map(option => {
        const pressed = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            data-slot="segmented-item"
            aria-pressed={pressed}
            aria-label={option.name}
            disabled={disabled || option.disabled}
            onClick={() => { if (!pressed) onValueChange(option.value) }}
            className={cn(
              "relative inline-flex h-9.5 min-w-11 items-center justify-center gap-1.5 rounded-md px-3 text-sm whitespace-nowrap outline-none select-none",
              "in-data-[density=compact]:h-6.5 in-data-[density=compact]:min-w-7 in-data-[density=compact]:px-2.5",
              "transition-[background-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none",
              "focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              // The hit area: 44px tall, centred, exactly as wide as the segment.
              "after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:min-h-full after:-translate-y-1/2 after:content-['']",
              fill && "flex-1",
              pressed
                ? "bg-background font-medium text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export {Segmented, type SegmentedOption, type SegmentedProps}
