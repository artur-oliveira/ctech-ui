import type {ReactNode} from "react"

import {cn} from "../lib/cn"

/**
 * An empty state is a first-run screen, not an error. `title` says what is
 * absent, `description` says what will fill it, and `action` is the way to
 * make that happen when there is one. A screen whose emptiness the reader
 * cannot act on gets no action, rather than a disabled button.
 */
interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

function EmptyState({title, description, icon, action, className}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center",
        className
      )}
    >
      {icon && (
        <div className="text-muted-foreground [&_svg]:size-6" aria-hidden>
          {icon}
        </div>
      )}
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-[46ch] text-pretty text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export {EmptyState, type EmptyStateProps}
