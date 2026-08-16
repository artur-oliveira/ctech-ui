import type {ReactNode} from "react"

import {cn} from "../lib/cn"

/**
 * One h1 per screen, optionally with a single supporting line and the screen's
 * primary action. `eyebrow` deliberately does not exist here: a small tracked
 * all-caps label above every heading is scaffolding, not hierarchy.
 */
interface PageHeaderProps {
  title: string
  description?: string
  /** The screen's primary action. One, not a toolbar. */
  action?: ReactNode
  /** Rendered above the title — a back link or breadcrumb, not a label. */
  lead?: ReactNode
  className?: string
}

function PageHeader({title, description, action, lead, className}: PageHeaderProps) {
  return (
    <header data-slot="page-header" className={cn("space-y-2", className)}>
      {lead}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="space-y-1">
          <h1 className="text-balance text-xl font-semibold tracking-[-0.01em] text-foreground in-data-[density=compact]:text-lg">
            {title}
          </h1>
          {description && (
            <p className="max-w-[65ch] text-pretty text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  )
}

export {PageHeader, type PageHeaderProps}
