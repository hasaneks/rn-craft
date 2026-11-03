# State management

Pick the home for each piece of state by what it is, not by which library is installed.

| State | Home | Why |
|---|---|---|
| Data from the server (lists, details) | Query cache: TanStack Query or RTK Query | Caching, dedup, refetch, invalidation, offline persistence; not hand-written in a global store |
| Session, user preferences, feature flags | Small global store (Redux Toolkit slice, Zustand, Jotai) with selectors | Read in many places, changes rarely |
| Form input | Form library (react-hook-form) or the field component | Typing re-renders only the field |
| UI state of one screen (open sheet, selected tab) | `useState` in the screen or the nearest common parent | Smallest blast radius |
| Per-frame values (scroll, gesture, progress) | Reanimated shared values | Never re-renders React |
| URL-like state (selected id, filter) | Navigation params | Survives back/forward and deep links |
| Persisted local data | MMKV (sync, fast); SQLite (op-sqlite, expo-sqlite) for large/queryable data | AsyncStorage is slow and async for everything |
| Secrets, tokens | Keychain / Keystore (react-native-keychain, expo-secure-store) | Never in MMKV/AsyncStorage unencrypted |

## Store rules

- **Selectors:** one field per `useSelector`, or an equality function (`shallowEqual`), or a memoized selector
  (`createSelector`) for anything that builds a new array/object. Zustand v5: `useShallow` for multiple fields; a
  selector that returns a new object without it can loop.
- **Normalize collections:** `{ ids: string[], byId: Record<string, T> }` (RTK `createEntityAdapter`). A row selects
  `byId[id]`; updating one item re-renders one row.
- **Don't mirror server data into the store.** If it came from the API, it belongs in the query cache; derive views
  from it with `select`.
- **Actions describe events**, reducers stay pure; no non-serializable values (Dates, class instances, functions) in
  Redux state.
- **Context is not a state manager** for changing data: every consumer re-renders on every change. Use it for
  dependency injection and rarely-changing values (theme, i18n, services).

## RTK Query

The default when the app already uses Redux Toolkit (and in projects set up with `rn-craft-init`). One `createApi`,
features `injectEndpoints`; `selectFromResult` to subscribe to a slice of the data; tags for invalidation;
`setupListeners` wired to `AppState` and NetInfo (browser focus events do not exist); `resetApiState()` on sign-out.
Do not copy query data into slices. Details: `rn-craft-arch` → `references/data.md`.

## TanStack Query

- Query keys include every input (`['orders', { status, page }]`); `select` to subscribe to a slice; `staleTime` set
  deliberately (0 means refetch on every mount and focus).
- Mutations: optimistic update with rollback for toggles/likes; `invalidateQueries` on success for the affected keys.
- React Native specifics: `focusManager` with `AppState`, `onlineManager` with NetInfo, persist the cache with MMKV
  for offline-first screens.

## Effects

- Effects synchronize with something outside React (subscriptions, native modules, timers), not with other state.
- Fetching in effects: use the query library instead (race conditions, caching, cancellation are solved there).
- Always clean up: listeners, timers, `AppState`/`Keyboard`/`Dimensions` subscriptions, aborted requests.
