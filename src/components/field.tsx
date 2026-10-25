"use client"

import {createContext, useContext, useId, type ComponentProps, type ReactNode} from "react"

import {cn} from "../lib/cn"

/** What a control needs to be wired to its Field: pass it by hand (render prop) or let Input/Textarea/Select read it. */
interface FieldControlProps {
  id: string
  "aria-describedby"?: string
  "aria-invalid"?: true
  "aria-errormessage"?: string
}

const FieldContext = createContext<FieldControlProps | null>(null)

/** The nearest Field's wiring, or null outside one. */
function useFieldControl(): FieldControlProps | null {
  return useContext(FieldContext)
}

/** Joins ids for `aria-describedby`, skipping the empty ones. */
function joinIds(...ids: (string | undefined | false)[]): string | undefined {
  const joined = ids.filter(Boolean).join(" ")
  return joined || undefined
}

/**
 * Resolves a control's own props against the Field around it: its `id` wins,
 * then the Field's, then `name` (so react-hook-form's `register("email")`
 * gets `id="email"` for free); description ids are merged, and `aria-invalid`
 * follows the Field's error unless the control sets it.
 */
function useControlA11y({id, name, invalid, ...aria}: {id?: string; name?: string; invalid?: boolean; "aria-describedby"?: string; "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"; "aria-errormessage"?: string}) {
  const field = useFieldControl()
  const isInvalid = aria["aria-invalid"] !== undefined ? aria["aria-invalid"] : invalid ? true : field?.["aria-invalid"]
  return {
    id: id ?? field?.id ?? name,
    "aria-describedby": joinIds(field?.["aria-describedby"], aria["aria-describedby"]),
    "aria-invalid": isInvalid,
    "aria-errormessage": aria["aria-errormessage"] ?? (isInvalid && isInvalid !== "false" ? field?.["aria-errormessage"] : undefined),
  }
}

interface FieldProps {
  label: string
  /** The control's id. Optional: generated when absent, and handed to the control through context or the render prop. */
  htmlFor?: string
  /** The field's name; the id defaults to it when `htmlFor` is absent (react-hook-form). */
  name?: string
  hint?: string
  error?: string
  required?: boolean
  /** Nodes (Input/Textarea/Select read the wiring from context) or a render prop receiving it. */
  children: ReactNode | ((control: FieldControlProps) => ReactNode)
  className?: string
}

function Field({label, htmlFor, name, hint, error, required, children, className}: FieldProps) {
  const generated = useId()
  const id = htmlFor ?? name ?? generated
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  // Hint and error are both read: the hint is the rule, the error is how this value broke it.
  const control: FieldControlProps = {
    id,
    "aria-describedby": joinIds(hintId, errorId),
    "aria-invalid": error ? true : undefined,
    "aria-errormessage": errorId,
  }

  return (
    <div data-slot="field" className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} required={required}>{label}</Label>
      <FieldContext.Provider value={control}>{typeof children === "function" ? children(control) : children}</FieldContext.Provider>
      {hint && <p id={hintId} className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p id={errorId} className="text-sm text-danger" role="alert">{error}</p>}
    </div>
  )
}

function Label({className, required, children, ...props}: ComponentProps<"label"> & {required?: boolean}) {
  return (
    <label data-slot="label" className={cn("text-sm font-medium text-foreground", className)} {...props}>
      {children}{required && <span className="ml-1 text-danger" aria-hidden> *</span>}
    </label>
  )
}

export {Field, FieldContext, Label, joinIds, useControlA11y, useFieldControl, type FieldControlProps, type FieldProps}
