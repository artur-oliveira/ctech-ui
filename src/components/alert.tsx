import type {ReactNode} from "react"
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
  title: string
  children?: ReactNode
  className?: string
}

function Alert({title, children, tone, className}: AlertProps) {
  return (
    <div data-slot="alert" role={tone === "danger" ? "alert" : "status"} className={cn(alertVariants({tone}), className)}>
      <div className="grid gap-1"><p className="font-medium">{title}</p>{children && <div>{children}</div>}</div>
    </div>
  )
}

export {Alert, alertVariants, type AlertProps}
