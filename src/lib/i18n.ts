/**
 * Tiny built-in i18n for the strings shared components own. Two catalogs
 * (pt-BR, en); any BCP-47 tag resolves to one of them by language, while Intl
 * formatting still honours the exact tag. Products override single strings with
 * each component's `labels` prop instead of forking the catalog.
 */

type CatalogLocale = "pt-BR" | "en"

/** A BCP-47 tag such as "pt-BR" or "en". Unknown languages fall back to English copy. */
type Locale = string

const DEFAULT_LOCALE: Locale = "pt-BR"

function resolveCatalog(locale: Locale | undefined): CatalogLocale {
  const language = (locale ?? DEFAULT_LOCALE).toLowerCase().split(/[-_]/)[0]
  return language === "pt" ? "pt-BR" : "en"
}

const datePickerMessages = {
  "pt-BR": {
    placeholder: "Selecionar data",
    today: "Hoje",
    selected: "selecionado",
    previousMonth: "Ir para o mês anterior",
    nextMonth: "Ir para o próximo mês",
  },
  en: {
    placeholder: "Select date",
    today: "Today",
    selected: "selected",
    previousMonth: "Go to the previous month",
    nextMonth: "Go to the next month",
  },
} as const

const modalMessages = {
  "pt-BR": {submit: "Salvar", cancel: "Cancelar", close: "Fechar", loading: "Aguarde…"},
  en: {submit: "Save", cancel: "Cancel", close: "Close", loading: "Please wait…"},
} as const

const errorMessages = {
  "pt-BR": {
    400: {title: "Não foi possível abrir este endereço", description: "Confira os parâmetros do link ou volte ao início para continuar."},
    404: {title: "Não encontramos esta página", description: "O endereço pode ter mudado ou o conteúdo não está disponível."},
    500: {title: "Não foi possível carregar a página", description: "Ocorreu um erro inesperado. Tente novamente em instantes."},
    503: {title: "Serviço temporariamente indisponível", description: "Estamos sem conexão com o serviço. Verifique sua conexão e tente novamente."},
  },
  en: {
    400: {title: "We couldn't open this address", description: "Check the link's parameters or go back to the start to continue."},
    404: {title: "We couldn't find this page", description: "The address may have changed or the content is unavailable."},
    500: {title: "We couldn't load the page", description: "An unexpected error occurred. Please try again shortly."},
    503: {title: "Service temporarily unavailable", description: "We can't reach the service. Check your connection and try again."},
  },
} as const

type DatePickerLabels = {-readonly [K in keyof (typeof datePickerMessages)["en"]]: string}
type ModalLabels = {-readonly [K in keyof (typeof modalMessages)["en"]]: string}

function getDatePickerLabels(locale: Locale | undefined, overrides?: Partial<DatePickerLabels>): DatePickerLabels {
  return {...datePickerMessages[resolveCatalog(locale)], ...overrides}
}

function getModalLabels(locale: Locale | undefined, overrides?: Partial<ModalLabels>): ModalLabels {
  return {...modalMessages[resolveCatalog(locale)], ...overrides}
}

function getErrorMessages(locale: Locale | undefined) {
  return errorMessages[resolveCatalog(locale)]
}

export {
  DEFAULT_LOCALE,
  getDatePickerLabels,
  getErrorMessages,
  getModalLabels,
  resolveCatalog,
  type CatalogLocale,
  type DatePickerLabels,
  type Locale,
  type ModalLabels,
}
