import type {ReactNode} from "react"
import {cn} from "../lib/cn"
import {DEFAULT_LOCALE, getErrorMessages, type Locale} from "../lib/i18n"

type ErrorStatus = 400 | 404 | 500 | 503
interface ErrorStateProps {
  status: ErrorStatus
  title?: string
  description?: string
  action?: ReactNode
  className?: string
  /** BCP-47 tag for the built-in copy. Defaults to "pt-BR". */
  locale?: Locale
}

/** Shared error presentation. Apps own routing, retries and availability checks.
 * Never pass exception messages, stack traces, tokens or private data as copy.
 */
function ErrorState({status, title, description, action, className, locale = DEFAULT_LOCALE}: ErrorStateProps) {
  const message = getErrorMessages(locale)[status]
  return (
    <section data-slot="error-state" role="alert" className={cn("mx-auto flex max-w-2xl flex-col items-center gap-5 px-5 py-16 text-center", className)}>
      <p className="font-mono text-sm tabular-nums text-muted-foreground">{status}</p>
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{title || message.title}</h1>
      <p className="max-w-[48ch] text-pretty text-base text-muted-foreground">{description || message.description}</p>
      {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
    </section>
  )
}

export {ErrorState, type ErrorStateProps, type ErrorStatus}
