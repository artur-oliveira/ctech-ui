import type {ComponentProps, ReactNode} from "react"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "../lib/cn"

const alertVariants = cva("flex gap-3 rounded-lg border px-4 py-3 text-sm", {
  variants: {
    tone: {
      info: "border-border bg-surface text-foreground",
      success: "border-success/25 bg-success/10 text-success",
      warning: "border-warning/25 bg-warning/10 text-warning",
      danger: "border-danger/25 bg-danger/10 text-danger",
    },
  },
  defaultVariants: {tone: "info"},
})

interface AlertProps extends VariantProps<typeof alertVariants> {
  /** Optional: an alert may be just a body (an inline error line). */
  title?: string
  /** The body, or any composition of `AlertTitle` and `AlertDescription`. */
  children?: ReactNode
  /** A glyph before the text. Decorative: the tone and the text carry the meaning. */
  icon?: ReactNode
  className?: string
}

function Alert({title, children, tone, icon, className}: AlertProps) {
  const hasBody = children !== undefined && children !== null && children !== false
  return (
    <div data-slot="alert" role={tone === "danger" ? "alert" : "status"} className={cn(alertVariants({tone}), className)}>
      {icon && <span aria-hidden className="mt-0.5 flex shrink-0 [&_svg:not([class*='size-'])]:size-4">{icon}</span>}
      <div className="grid min-w-0 gap-1">
        {title && <p className="font-medium">{title}</p>}
        {hasBody && <div>{children}</div>}
      </div>
    </div>
  )
}

function AlertTitle({className, ...props}: ComponentProps<"p">) {
  return <p data-slot="alert-title" className={cn("font-medium", className)} {...props} />
}

function AlertDescription({className, ...props}: ComponentProps<"div">) {
  return <div data-slot="alert-description" className={className} {...props} />
}

export {Alert, AlertDescription, AlertTitle, alertVariants, type AlertProps}
