import {cn} from "../lib/cn"
import type {ComponentProps} from "react"

/**
 * A skeleton, not a spinner. A spinner says "something is happening"; a
 * skeleton says "this much is coming, and it will land here", which stops the
 * layout jumping when it does.
 *
 * `motion-reduce:animate-none` is not optional: a pulsing block is exactly the
 * kind of ambient motion prefers-reduced-motion exists to switch off.
 */
function Skeleton({className, ...props}: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-md bg-border/60 motion-reduce:animate-none", className)}
      {...props}
    />
  )
}

export {Skeleton}
