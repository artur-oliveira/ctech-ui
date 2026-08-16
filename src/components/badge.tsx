"use client"

import {mergeProps} from "@base-ui/react/merge-props"
import {useRender} from "@base-ui/react/use-render"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "../lib/cn"

/**
 * Status vocabulary. The four tones are the closed set every CTech API that
 * describes a state emits, so a badge renders a server-supplied tone rather
 * than a client-side mapping of an internal enum.
 *
 * These are fixed. They are never recoloured to match a surface's brand
 * accent: an operator has to read "paid" the same way on every screen of
 * every app, and a tone that shifts with the surface is a tone that has to be
 * relearned. Brand lives on the button; status lives here; they never meet on
 * one component.
 */
const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1.5",
    "rounded-full border px-2.5 py-0.5",
    "text-xs font-medium whitespace-nowrap",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ],
  {
    variants: {
      tone: {
        neutral: "border-border bg-surface text-muted-foreground",
        positive: "border-success/20 bg-success/10 text-success",
        attention: "border-warning/20 bg-warning/10 text-warning",
        urgent: "border-danger/20 bg-danger/10 text-danger",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>

function Badge({
  className,
  tone,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">({className: cn(badgeVariants({tone}), className)}, props),
    render,
    state: {slot: "badge", tone},
  })
}

export {Badge, badgeVariants, type BadgeTone}
