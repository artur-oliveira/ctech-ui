import type {ReactNode} from "react"

import {cn} from "../lib/cn"

type StepState = "done" | "current" | "waiting" | "upcoming"

interface StepItem {
  id: string
  title: string
  state: StepState
  /** Spoken and shown beside the title ("Concluído", "Aguardando"). */
  stateLabel: string
  /** Shown only for the current and waiting steps. */
  content?: ReactNode
}

interface StepsProps {
  label: string
  items: StepItem[]
  className?: string
}

const marker: Record<StepState, string> = {
  done: "bg-success text-white border-success",
  current: "bg-brand-600 text-white border-brand-600",
  waiting: "bg-surface text-warning border-warning",
  upcoming: "bg-background text-muted-foreground border-border",
}

/**
 * A guided checklist: an ordered list, one step open at a time. Not a wizard:
 * every step stays readable, and the current one carries aria-current="step".
 * On a phone the rail collapses to the markers' column and content spans the
 * full width under the title.
 */
function Steps({label, items, className}: StepsProps) {
  return (
    <ol aria-label={label} className={cn("grid gap-0", className)}>
      {items.map((s, i) => (
        <li key={s.id} aria-current={s.state === "current" ? "step" : undefined}
          className="relative grid grid-cols-[2rem_1fr] gap-x-3 pb-6 last:pb-0">
          {i < items.length - 1 && <span aria-hidden className="absolute left-4 top-8 bottom-0 w-px bg-border"/>}
          <span aria-hidden className={cn("flex size-8 items-center justify-center rounded-full border text-sm font-semibold", marker[s.state])}>
            {s.state === "done"
              ? <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>
              : i + 1}
          </span>
          <div className="min-w-0 pt-1">
            <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <span className={cn("font-medium", s.state === "upcoming" ? "text-muted-foreground" : "text-foreground")}>{s.title}</span>
              <span className="text-muted-foreground">{s.stateLabel}</span>
            </p>
            {(s.state === "current" || s.state === "waiting") && s.content && <div className="mt-3 text-sm">{s.content}</div>}
          </div>
        </li>
      ))}
    </ol>
  )
}

export {Steps, type StepItem, type StepsProps, type StepState}
