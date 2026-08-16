"use client"

import {Switch as SwitchPrimitive} from "@base-ui/react/switch"

import {cn} from "../lib/cn"

function Switch({className, ...props}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "flex h-6 w-11 shrink-0 items-center rounded-full border border-border bg-surface p-0.5 outline-none",
        "transition-[background-color,border-color,box-shadow] duration-150",
        "data-[checked]:border-brand-600 data-[checked]:bg-brand-600",
        "focus-visible:ring-3 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="size-5 rounded-full bg-background shadow-sm transition-transform duration-150 data-[checked]:translate-x-5 motion-reduce:transition-none" />
    </SwitchPrimitive.Root>
  )
}

export {Switch}
