import {forwardRef, type ComponentProps} from "react"

import {cn} from "../lib/cn"
import {useControlA11y} from "./field"
import {controlClass, type ControlStyleProps} from "./input"

type TextareaProps = ComponentProps<"textarea"> & Pick<ControlStyleProps, "surface" | "invalid">

/** A multi-line Input: the same Field wiring, surface and ref forwarding. Grows vertically only. */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({className, surface, invalid, ...props}, ref) {
  const a11y = useControlA11y({...props, invalid})
  return <textarea ref={ref} data-slot="textarea" {...props} {...a11y} className={cn(controlClass(surface), "min-h-20 resize-y py-2", className)} />
})

export {Textarea, type TextareaProps}
