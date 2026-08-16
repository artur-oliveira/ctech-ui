"use client"

import {Radio as RadioPrimitive} from "@base-ui/react/radio"
import {RadioGroup as RadioGroupPrimitive} from "@base-ui/react/radio-group"

import {cn} from "../lib/cn"

function RadioGroup<Value>({className, ...props}: RadioGroupPrimitive.Props<Value>) {
  return <RadioGroupPrimitive className={cn("grid gap-3", className)} {...props} />
}

function Radio<Value>({className, ...props}: RadioPrimitive.Root.Props<Value>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio"
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-full border border-border bg-background outline-none",
        "transition-[background-color,border-color,box-shadow] duration-150",
        "data-[checked]:border-brand-600 focus-visible:ring-3 focus-visible:ring-ring/35",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="size-2.5 rounded-full bg-brand-600" />
    </RadioPrimitive.Root>
  )
}

export {Radio, RadioGroup}
