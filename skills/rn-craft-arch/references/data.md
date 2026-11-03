# Data and API layer

## Base API

- One `createApi` in `src/app/store/api.ts`; features add endpoints with `injectEndpoints`.
- A custom `baseQuery` around `fetchBaseQuery` that: sets the base URL from config, adds the auth header, applies a
  timeout (`timeout` option or `AbortController`), maps every failure to one typed error:

```ts
type ApiError =
  | { kind: 'network' }                     // offline, DNS, timeout
  | { kind: 'unauthorized' }                // 401 after refresh failed
  | { kind: 'forbidden' }
  | { kind: 'notFound' }
  | { kind: 'validation'; fields: Record<string, string> } // map to form fields
  | { kind: 'server'; status: number; requestId?: string };
```

- Request/response types come from the API contract (OpenAPI → generated types, or hand-written). Types do not
  validate data: parse the responses the app cannot trust (external, versioned, critical) with Zod at the boundary.
- RTK Query cache is the source of server data. Derive views with `selectFromResult` or selectors; do not copy the
  data into slices or `useState`.

## Auth headers and refresh

- **Firebase Auth as identity:** get the ID token with `currentUser.getIdToken()` per request; the SDK caches and
  refreshes it. Do not build a second refresh-token mechanism.
- **Backend-issued tokens:** on 401, run **one** refresh at a time (a shared promise / mutex such as
  `async-mutex`); queued requests wait for it, then retry once. If refresh fails, call `resetSession()` and send the
  user to sign-in with the target route saved for after login.
- Tokens live where `storage-security.md` says, never in Redux persisted state.

## Retries, cancellation, idempotency

- `retry` only for idempotent reads and network/5xx errors, with backoff and a small cap (2-3).
- Never blindly retry purchases or creating writes. Send an `Idempotency-Key` (uuid per user action) if the backend
  supports it; otherwise do not auto-retry and let the user retry with the same key.
- Cancel requests a screen no longer needs (RTK Query unsubscribes; long uploads need explicit abort).
- Optimistic updates only for reversible, low-risk actions (like, toggle, reorder) with `onQueryStarted` +
  `patchResult.undo()` on failure.

## Focus and connectivity

Browser events do not exist. Wire `setupListeners` to React Native:

```ts
setupListeners(store.dispatch, (dispatch, { onFocus, onFocusLost, onOnline, onOffline }) => {
  const app = AppState.addEventListener('change', (s) => (s === 'active' ? dispatch(onFocus()) : dispatch(onFocusLost())));
  const net = NetInfo.addEventListener((s) => dispatch(s.isConnected ? onOnline() : onOffline()));
  return () => { app.remove(); net(); };
});
```

Then opt in per endpoint with `refetchOnFocus` / `refetchOnReconnect` where fresh data matters.

## Pagination

Infinite queries (`build.infiniteQuery`) or a page-merge `serializeQueryArgs` + `merge` + `forceRefetch`. A page error
keeps the loaded list and shows retry at the end.

## Sign-out and account switch

`dispatch(api.util.resetApiState())`, reset user slices, clear the user MMKV instance. Do it in `resetSession()` so
every exit path is identical.

## Offline

Cached data on screen is not offline support. If offline writes are in scope, define with the product: a persisted
queue (MMKV), the order of replay, retry policy, conflict resolution (server wins, last write wins, or ask), and what
the UI shows for pending items. Otherwise show cached data, an offline banner, and disable writes.
