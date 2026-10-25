import {forwardRef, type ComponentProps} from "react"

import {cn} from "../lib/cn"
import {useControlA11y} from "./field"

/**
 * Shared by Input and Textarea.
 * - `compact`: `true` is always 32px, `false` always 44px, absent follows the
 *   surrounding density (a table's chat box or a slider's number box says so).
 * - `surface`: the fill, for a control sitting on a tinted panel.
 */
interface ControlStyleProps {
  compact?: boolean
  surface?: "background" | "surface" | "transparent"
  /** Marks the control invalid (`aria-invalid`); inside a Field with an `error` it is already so. */
  invalid?: boolean
}

const SURFACE = {background: "bg-background", surface: "bg-surface", transparent: "bg-transparent"} as const

const controlClass = (surface: ControlStyleProps["surface"] = "background") =>
  cn(
    "w-full rounded-lg border border-border px-3 text-sm text-foreground outline-none",
    SURFACE[surface],
    "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20"
  )

type InputProps = ComponentProps<"input"> & ControlStyleProps

/**
 * Wires itself: `id` from the Field around it (or `name`), `aria-describedby`
 * and `aria-invalid` from the Field's hint and error. A ref is forwarded, so
 * react-hook-form's `{...register("email")}` works as it is.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input({className, compact, surface, invalid, ...props}, ref) {
  const a11y = useControlA11y({...props, invalid})
  return (
    <input
      ref={ref}
      data-slot="input"
      {...props}
      {...a11y}
      className={cn(
        controlClass(surface),
        compact === undefined ? "h-11 in-data-[density=compact]:h-8 in-data-[density=compact]:px-2.5" : compact ? "h-8 px-2.5" : "h-11",
        // A file input draws its own button: keep it inside the border, same type scale.
        "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
    />
  )
})

export {Input, controlClass, type ControlStyleProps, type InputProps}
