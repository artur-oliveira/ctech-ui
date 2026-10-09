"use client"

import {Dialog} from "@base-ui/react/dialog"
import type {ReactNode} from "react"

import {cn} from "../lib/cn"
import {DEFAULT_LOCALE, getModalLabels, type Locale, type ModalLabels} from "../lib/i18n"
import {Button} from "./button"
import {useThemeScope} from "./theme-provider"

/**
 * Built on Base UI's Dialog rather than a hand-rolled portal. The focus trap,
 * the scroll lock, the Escape handling, the restore-focus-on-close and the
 * inert-background are all behaviours it already gets right, and every one of
 * them is a thing a bespoke implementation gets subtly wrong — most commonly
 * a hardcoded `aria-labelledby` id that collides the moment two dialogs are
 * mounted at once.
 */

const SIZE = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  /** Optional one-line framing, announced with the title by screen readers. */
  description?: string
  children?: ReactNode
  onSubmit?: () => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  danger?: boolean
  submitDisabled?: boolean
  size?: keyof typeof SIZE
  /** BCP-47 tag for built-in copy. Defaults to "pt-BR". */
  locale?: Locale
  /** Overrides built-in strings; submitLabel/cancelLabel take precedence. */
  labels?: Partial<ModalLabels>
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel,
  cancelLabel,
  loading = false,
  danger = false,
  submitDisabled = false,
  size = "md",
  locale = DEFAULT_LOCALE,
  labels,
}: ModalProps) {
  const text = getModalLabels(locale, labels)
  const {theme, density} = useThemeScope()

  return (
    <Dialog.Root open={open} onOpenChange={next => !next && onClose()}>
      <Dialog.Portal data-ctech-theme={theme} data-density={density}>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]",
            "transition-opacity duration-200 ease-out",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            "motion-reduce:transition-none"
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto",
            "rounded-xl border border-border bg-background text-foreground shadow-modal outline-none",
            "transition-[opacity,translate,scale] duration-200 ease-out",
            "data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0",
            "data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
            "motion-reduce:transition-opacity motion-reduce:data-[ending-style]:scale-100 motion-reduce:data-[starting-style]:scale-100",
            SIZE[size]
          )}
        >
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background px-6 py-4">
            <div className="space-y-1">
              <Dialog.Title className="text-base font-semibold text-foreground">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-muted-foreground">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={text.close}
                  className="-mr-2 shrink-0 text-muted-foreground"
                />
              }
            >
              <CloseGlyph />
            </Dialog.Close>
          </header>

          {children && <div className="px-6 py-5">{children}</div>}

          <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-surface px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {cancelLabel ?? text.cancel}
            </Button>
            {onSubmit && (
              <Button
                type="button"
                variant={danger ? "danger" : "brand"}
                onClick={onSubmit}
                disabled={loading || submitDisabled}
              >
                {loading ? text.loading : submitLabel ?? text.submit}
              </Button>
            )}
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  )
}

export {Modal, type ModalProps}
