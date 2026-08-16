"use client"

import {Checkbox as CheckboxPrimitive} from "@base-ui/react/checkbox"

import {cn} from "../lib/cn"

function Checkbox({className, ...props}: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-md border border-border bg-background text-white outline-none",
        "transition-[background-color,border-color,box-shadow] duration-150",
        "data-[checked]:border-brand-600 data-[checked]:bg-brand-600",
        "data-[indeterminate]:border-brand-600 data-[indeterminate]:bg-brand-600",
        "focus-visible:ring-3 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-items-center data-[unchecked]:hidden" keepMounted>
        <CheckGlyph />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

function CheckGlyph() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden className="size-3.5"><path d="m3.25 8.25 2.9 2.9 6.6-6.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export {Checkbox}
