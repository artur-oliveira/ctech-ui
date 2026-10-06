import type {ReactNode} from "react"
import {cn} from "../lib/cn"

const errorMessages = {
  400: {title: "Não foi possível abrir este endereço", description: "Confira os parâmetros do link ou volte ao início para continuar."},
  404: {title: "Não encontramos esta página", description: "O endereço pode ter mudado ou o conteúdo não está disponível."},
  500: {title: "Não foi possível carregar a página", description: "Ocorreu um erro inesperado. Tente novamente em instantes."},
  503: {title: "Serviço temporariamente indisponível", description: "Estamos sem conexão com o serviço. Verifique sua conexão e tente novamente."},
} as const

type ErrorStatus = keyof typeof errorMessages
interface ErrorStateProps {
  status: ErrorStatus
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

/** Shared error presentation. Apps own routing, retries and availability checks.
 * Never pass exception messages, stack traces, tokens or private data as copy.
 */
function ErrorState({status, title, description, action, className}: ErrorStateProps) {
  const message = errorMessages[status]
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
