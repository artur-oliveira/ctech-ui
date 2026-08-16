import type {ComponentProps} from "react"

import {cn} from "../lib/cn"

function Input({className, ...props}: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none",
        "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20",
        "in-data-[density=compact]:h-8 in-data-[density=compact]:px-2.5",
        className
      )}
      {...props}
    />
  )
}

export {Input}
