# Re-renders

A component renders when:

1. its own state changes (`useState`, `useReducer`),
2. its parent renders (unless it is memoized and every prop is equal by `Object.is`),
3. a context it reads changes value,
4. an external store it subscribes to returns a different value (`useSelector`, `useSyncExternalStore`, Zustand).

Rendering is not committing: React may render and find nothing changed. Still, every render runs your component
function and its children's, and on React Native that JS work competes with gestures and list rendering.

## Find them

- React DevTools Profiler → "Highlight updates when components render" and "Record why each component rendered".
- `why-did-you-render` in development for a specific component.
- Count renders temporarily with a ref in a component under suspicion; remove it after.

## Fixes, in order of value

1. **Move state down.** State used by one row lives in the row; a text input's value lives in the input's component
   (or an uncontrolled input with a ref), not in the screen.
2. **Lift content up (children as props).** A component that changes often (an animated header) takes static
   children as `children`; those elements are created by the parent and do not re-render with it.
3. **Narrow subscriptions.** One selector per field (`useSelector((s) => s.user.name)`), `useShallow` for a few fields
   in Zustand, `createSelector` for derived data. Never select the whole store.
4. **Split contexts.** Separate rarely-changing values (theme, user) from often-changing ones (form draft, playback
   position). Memoize the provider value (`useMemo`), stabilize functions in it (`useCallback`). For high-frequency
   values use a store or shared value, not context.
5. **Memoize at boundaries.** `React.memo` on list rows and expensive subtrees whose parent changes often, together
   with stable props (`useCallback` for handlers, `useMemo` for objects/arrays, styles from `StyleSheet.create`).
   Memoizing a component whose props change every render does nothing.
6. **Derive, don't sync.** `const fullName = first + ' ' + last` during render; `useMemo` if it is expensive. An effect
   that copies props into state renders twice and shows a stale frame. Reset state on id change with `key={id}`.
7. **Refs for values that don't render.** Timers, previous values, scroll position read on demand: `useRef`.
8. **Shared values for per-frame data.** Scroll offset, gesture position, progress: Reanimated shared values;
   `useDerivedValue` for computed ones.

## React Compiler

With React Compiler (`babel-plugin-react-compiler`), components and hooks are memoized automatically: inline
callbacks, inline objects and JSX are cached. Then:

- Remove manual `useMemo`/`useCallback`/`memo` only after it is verified on; don't add new ones.
- Still fix: whole-store selectors, context values that really change, state placed too high, effects syncing state,
  per-frame state. The compiler cannot make a changing value stable.
- Use the `compiler` config of the lint plugin (turns off `stable-list-callbacks` and `context-value-stable`).

## Common traps

- `style={{ ... }}` and `[styles.a, { ... }]` on a memoized child create a new object each render.
- `onPress={() => onSelect(item.id)}` in a row's parent defeats `React.memo` on the row; pass `onSelect` and `id`.
- `useEffect` with an object/array dependency created during render runs every render.
- `navigation.setOptions` in an effect without deps re-renders the header every render.
- Hooks that return a new object each time (`const { a, b } = useThing()`) re-render every consumer when anything in
  them changes.
