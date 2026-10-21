import type {RefObject} from "react"

/** Options shared by Modal and Drawer for confirmations that must not be dismissed by accident (money, deletion). */
interface DialogGuardProps {
  /** Element to focus on open: a ref, or a CSS selector resolved when the dialog opens. Default: Base UI's (first tabbable). */
  initialFocus?: RefObject<HTMLElement | null> | string
  /**
   * Default true. False blocks Escape, outside click and the close button while it holds (for example
   * during a pending request). Focus is still trapped and the content stays readable by screen readers.
   */
  dismissible?: boolean
  /** Hides the close button (X). Escape and outside click still follow `dismissible`. */
  hideClose?: boolean
  /** Semantics for confirmations: `role="alertdialog"` for destructive ones, `describedBy` to point at the body that explains the action. */
  aria?: {role?: "dialog" | "alertdialog"; describedBy?: string}
}

/** Base UI takes a ref or a function; a string becomes a lookup at open time (the popup is portaled, so document-wide). */
function resolveInitialFocus(target: DialogGuardProps["initialFocus"]) {
  if (typeof target !== "string") return target
  return () => document.querySelector<HTMLElement>(target)
}

/** Drops close requests while `dismissible` is false; `onClose` otherwise. */
function guardedOpenChange(dismissible: boolean, onClose: () => void) {
  return (next: boolean) => {
    if (!next && dismissible) onClose()
  }
}

export {guardedOpenChange, resolveInitialFocus, type DialogGuardProps}
