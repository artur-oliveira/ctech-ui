"use client"

import {createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode} from "react"

import {cn} from "../lib/cn"
import {DEFAULT_LOCALE, getNetworkLabels, type Locale, type NetworkLabels} from "../lib/i18n"
import {createLiveness, type Liveness, type LivenessOptions, type NetworkStatus} from "../lib/network/liveness"
import {Button} from "./button"
import {ErrorState} from "./error-state"

interface NetworkContextValue {
  status: NetworkStatus
  /** False until the first probe answers: "online" before that is only the optimistic default. */
  checked: boolean
  /** Probes now. */
  retry: () => void
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

interface NetworkProviderProps extends Partial<Omit<LivenessOptions, "onReconnect">> {
  /**
   * An existing probe to follow instead of creating one, so the API client and
   * the sockets share it. `url` is then not needed. `onReconnect` still fires
   * here on each return to online.
   */
  liveness?: Liveness
  /** Start (and stop) polling the probe. Default true; false when the app already starts it. */
  start?: boolean
  children: ReactNode
  /** Back to online after any outage: refetch/invalidate your queries here. */
  onReconnect?: () => void
  /** Called on each transition to `unavailable`: route to your full-screen page. */
  onUnavailable?: () => void
  /** Render the OfflineBanner above the children while not online. Default true. */
  banner?: boolean
  locale?: Locale
  labels?: Partial<NetworkLabels>
}

/** Owns one liveness probe for the app. Framework-free: routing and cache refresh are callbacks. */
function NetworkProvider({children, onReconnect, onUnavailable, banner = true, locale, labels, liveness: external, start = true, ...options}: NetworkProviderProps) {
  const handlers = useRef({onReconnect, onUnavailable})
  handlers.current = {onReconnect, onUnavailable}
  // Options are read once: the probe is created per mount, change `key` to rebuild it.
  const liveness: Liveness = useMemo(() => {
    if (external) return external
    if (!options.url) throw new Error("NetworkProvider needs `url` or an existing `liveness`")
    return createLiveness({...(options as LivenessOptions), onReconnect: () => handlers.current.onReconnect?.()})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const snapshot = useSyncExternalStore(liveness.subscribe, liveness.getSnapshot, liveness.getSnapshot)
  useEffect(() => (start ? liveness.start() : undefined), [liveness, start])
  // An injected probe has its own onReconnect (or none); ours is driven by its transitions.
  const previous = useRef<NetworkStatus>("online")
  useEffect(() => {
    if (external && snapshot.status === "online" && previous.current !== "online") handlers.current.onReconnect?.()
    previous.current = snapshot.status
  }, [external, snapshot.status])
  useEffect(() => { if (snapshot.status === "unavailable") handlers.current.onUnavailable?.() }, [snapshot.status])
  const value = useMemo(() => ({status: snapshot.status, checked: snapshot.checkedAt !== null, retry: () => void liveness.check()}), [snapshot.status, snapshot.checkedAt, liveness])
  return (
    <NetworkContext.Provider value={value}>
      {banner && <OfflineBanner status={snapshot.status} locale={locale} labels={labels} onRetry={value.retry}/>}
      {children}
    </NetworkContext.Provider>
  )
}

function useNetwork(): NetworkContextValue {
  const value = useContext(NetworkContext)
  if (!value) throw new Error("useNetwork must be used inside <NetworkProvider>")
  return value
}

interface OfflineBannerProps {
  /** Renders nothing for "online". */
  status: NetworkStatus
  onRetry?: () => void
  locale?: Locale
  labels?: Partial<NetworkLabels>
  className?: string
}

/**
 * A strip that reserves its own height instead of covering the page, so
 * navigation stays reachable exactly when recovery matters. `role="status"`
 * is polite: it is announced without stealing focus. Text is never colour alone.
 */
function OfflineBanner({status, onRetry, locale = DEFAULT_LOCALE, labels, className}: OfflineBannerProps) {
  const t = getNetworkLabels(locale, labels)
  const copy = {
    offline: [t.offline, t.offlineHint],
    degraded: [t.degraded, t.degradedHint],
    unavailable: [t.unavailable, t.unavailableHint],
    online: null,
  }[status]
  // The live region stays mounted so the first announcement is not dropped by assistive tech.
  return (
    <div data-slot="offline-banner" role="status" aria-live="polite" className={cn(copy && "border-b border-warning/40 bg-warning/10 px-4 py-2 text-sm text-foreground", className)}>
      {copy && (
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p><strong className="font-medium">{copy[0]}</strong> <span className="text-muted-foreground">{copy[1]}</span></p>
          {onRetry && <Button type="button" size="sm" variant="outline" onClick={onRetry}>{t.retry}</Button>}
        </div>
      )}
    </div>
  )
}

interface UnavailableScreenProps {
  /** Called once the API answers again: send the person back to where they were (the product remembers the route). */
  onRecovered?: () => void
  title?: string
  description?: string
  locale?: Locale
  labels?: Partial<NetworkLabels>
  className?: string
}

/** Full page for a confirmed outage. Polling and automatic return come from the NetworkProvider; the button probes now. */
function UnavailableScreen({onRecovered, title, description, locale = DEFAULT_LOCALE, labels, className}: UnavailableScreenProps) {
  const {status, checked, retry} = useNetwork()
  const t = getNetworkLabels(locale, labels)
  const recovered = useRef(onRecovered)
  recovered.current = onRecovered
  // Only after a real probe: a fresh load of this page starts "online" by default and must not bounce straight back.
  useEffect(() => { if (checked && status === "online") recovered.current?.() }, [checked, status])
  return (
    <ErrorState
      status={503}
      locale={locale}
      className={className}
      title={title ?? (status === "offline" ? t.offline : t.unavailable)}
      description={description ?? (status === "offline" ? t.offlineHint : t.unavailableHint)}
      action={<Button type="button" onClick={retry}>{t.retry}</Button>}
    />
  )
}

export {NetworkProvider, OfflineBanner, UnavailableScreen, useNetwork, type NetworkContextValue, type NetworkProviderProps, type OfflineBannerProps, type UnavailableScreenProps}
