# Network resilience (since 0.9.0)

Unified from the code the products wrote locally. Nothing here imports Next, axios or TanStack Query: routing, HTTP client and cache refresh are injected. Copy is pt-BR and en (`locale`), single strings overridable with `labels`.

## API

| Export | What it does |
|---|---|
| `withRetry(fn, {method, idempotent, maxRetries, classify, signal})` | Pure. Retries only safe methods (GET/HEAD/OPTIONS) or a mutation flagged `idempotent` (it carries an `Idempotency-Key`). Max 2 retries (hard cap), on no status or 408/425/429/500/502/503/504. Honors `Retry-After` (seconds or date, capped at 30s, plus a 0-250ms nudge), otherwise full jitter under `min(3s, 250ms * 2^n)`. Rethrows the last error. `classify` maps your library's error to `{status, retryAfter, aborted}`; the default understands axios (`error.response.status/headers`) and `error.status`. |
| `createLiveness({url, fetch?, timeoutMs=5000, intervalMs=30000, maxIntervalMs=30000, failuresToUnavailable=3, onReconnect?, isOnline?})` | Probe of `/v1.0/health` with timeout. `getSnapshot()` -> `{status, failures, checkedAt}`, `subscribe`, `check()` (deduplicated), `start()` (polling with equal-jitter backoff, `online`/`offline`/`visibilitychange`; returns stop). |
| `NetworkStatus` | `online` (last probe 2xx; also the optimistic initial value) · `degraded` (failing, under N in a row) · `unavailable` (N consecutive server failures) · `offline` (`navigator.onLine` false; never escalates). |
| `useOnlineStatus(onReconnect?)` | `navigator.onLine` as state; `onReconnect` fires on each offline -> online transition. Device link only, not API health. |
| `NetworkProvider` | Owns one probe (options are read once per mount). Props: the `createLiveness` options, `onReconnect`, `onUnavailable` (route to your page), `banner` (default true), `locale`, `labels`. |
| `useNetwork()` | `{status, checked, retry}`. |
| `OfflineBanner` | `role="status" aria-live="polite"`, always mounted (announcement not lost), empty when online, reserves its own height, text plus a retry button (44px, density-aware), semantic tokens only. |
| `UnavailableScreen` | `ErrorState` 503 with a "Try again" button that probes now; `onRecovered` fires when a real probe says online again (not on first paint). |

`onReconnect` fires when the status returns to `online` from any other state. The product decides what to refetch.

## Adoption: axios + TanStack Query + Next

```tsx
// lib/api.ts
import {withRetry} from "@aoctech/ui"
export const request = <T,>(config: AxiosRequestConfig) =>
  withRetry(() => api.request<T>(config), {
    method: config.method,
    idempotent: Boolean(config.headers?.["Idempotency-Key"]),
  })
// QueryClient: defaultOptions.queries.retry = false (the client owns retry)

// app/providers.tsx
"use client"
<NetworkProvider
  url={`${process.env.NEXT_PUBLIC_API_URL}/v1.0/health`}
  locale="pt-BR"
  onReconnect={() => queryClient.refetchQueries({type: "active"})}
  onUnavailable={() => { sessionStorage.setItem("return", location.pathname + location.search); router.replace("/unavailable") }}
>
  {children}
</NetworkProvider>

// app/unavailable/page.tsx
"use client"
export default () => <UnavailableScreen onRecovered={() => router.replace(sessionStorage.getItem("return") ?? "/")}/>
```

Ordinary calls should fail fast while `status` is `unavailable`/`offline` (read it from `useNetwork`, or `liveness.getSnapshot()` if you hold the instance), so the probe, not each screen, discovers recovery.

## What each product replaces

| Product file | Replaced by |
|---|---|
| poker `lib/network/liveness.ts`, `NetworkProvider.tsx` (+ `RecoveryState`/`SystemState`) | `createLiveness` + `NetworkProvider` + `OfflineBanner`; poker's in-cycle 3 attempts become the consecutive-failure count; its `navigateToUnavailable` becomes `onUnavailable`; the `queryClient.refetchQueries` becomes `onReconnect`. Mock mode: pass a `fetch` that resolves ok. |
| wallet `liveness.ts` (single-probe variant), `retry.ts`, `system-state.tsx` | `createLiveness`; `withRetry` (same rules and delays); `UnavailableScreen`. |
| dfe `liveness.ts`, `NetworkProvider`, `maintenance.ts` | `createLiveness`/`NetworkProvider`; the 503 redirect and return-path (`redirectOnMaintenance`/`takeMaintenanceReturn`) stay in the product as `onUnavailable`/`onRecovered` handlers. |
| billing `lib/api/client.ts` retry, `/maintenance` page | `withRetry` (billing keeps generating the Idempotency-Key and its 401/409 handling) and `UnavailableScreen`. |
| account | Nothing existed; adopt as above. |

Not extracted on purpose: remembering the return route (storage is a product decision), HTTP 503 interception in the API client, ClientErrorReporter (observability is local).

## Accessibility

Live region is polite and persistent; the retry button is a real `button`; copy never relies on colour alone; the screen reuses `ErrorState` (`role="alert"`, one `h1`).
