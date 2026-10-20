import {useEffect, useRef, useSyncExternalStore} from "react"

function subscribe(notify: () => void) {
  window.addEventListener("online", notify)
  window.addEventListener("offline", notify)
  return () => {
    window.removeEventListener("online", notify)
    window.removeEventListener("offline", notify)
  }
}

/**
 * `navigator.onLine`, live. `onReconnect` fires on each offline -> online
 * transition: the product passes `() => queryClient.invalidateQueries()` (or
 * any refetch). Server render reports online. Note navigator.onLine only
 * knows about the device's link, not whether the API answers: use
 * `createLiveness` for that.
 */
function useOnlineStatus(onReconnect?: () => void): boolean {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true)
  const callback = useRef(onReconnect)
  callback.current = onReconnect
  const was = useRef(online)
  useEffect(() => {
    if (online && !was.current) callback.current?.()
    was.current = online
  }, [online])
  return online
}

export {useOnlineStatus}
