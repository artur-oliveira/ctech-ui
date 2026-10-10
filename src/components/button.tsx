"use client"

import {Button as ButtonPrimitive} from "@base-ui/react/button"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "../lib/cn"

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-1.5",
    "rounded-lg border border-transparent bg-clip-padding",
    "text-sm font-medium whitespace-nowrap",
    "transition-colors duration-150 outline-none select-none",
    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        // The brand fill. This is the only place brand colour appears on a
        // button, and status colour never appears here at all — see the
        // package README on why the two vocabularies stay separated.
        brand: "bg-brand-600 text-white hover:bg-brand-700",
        outline: "border-border bg-background text-foreground hover:bg-surface",
        ghost: "text-foreground hover:bg-surface",
        danger: "bg-danger text-white hover:bg-danger-strong",
        link: "text-brand-600 underline-offset-4 hover:underline",
      },
      size: {
        // Height is a property of the surface, not of the call site. The shell
        // sets `data-density` on its root and every button follows; a portal
        // button is touch-sized and the same component in the console is not.
        default: "h-11 px-3.5 in-data-[density=compact]:h-8 in-data-[density=compact]:px-2.5",
        sm: "h-9 px-3 text-xs in-data-[density=compact]:h-7 in-data-[density=compact]:px-2.5",
        icon: "size-11 in-data-[density=compact]:size-8",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "brand",
      size: "default",
      block: false,
    },
  }
)

function Button({
  className,
  variant,
  size,
  block,
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      // Read by the touch rule (styles/touch.css): an icon button stays square.
      data-size={size ?? "default"}
      // A custom `render` element (a Link, say) is never a native <button>, so
      // default nativeButton to false there instead of warning on every usage.
      nativeButton={nativeButton ?? !props.render}
      className={cn(buttonVariants({variant, size, block, className}))}
      {...props}
    />
  )
}

export {Button, buttonVariants}
