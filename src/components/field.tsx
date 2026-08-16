import type {ReactNode} from "react"

import {cn} from "../lib/cn"

interface FieldProps {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}

function Field({label, htmlFor, hint, error, required, children, className}: FieldProps) {
  const descriptionId = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined

  return (
    <div data-slot="field" className={cn("grid gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}{required && <span className="ml-1 text-danger" aria-hidden> *</span>}
      </label>
      {children}
      {hint && !error && <p id={descriptionId} className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p id={descriptionId} className="text-sm text-danger" role="alert">{error}</p>}
    </div>
  )
}

export {Field, type FieldProps}
