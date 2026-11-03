---
name: rn-craft-perf
description: "Audits and fixes React Native / Expo performance: unnecessary re-renders, context and store subscriptions, state placement, derived state in effects, list virtualization and row memoization, JS-thread animations, scroll handlers, images, startup time and memory leaks. Measures with the React DevTools profiler, the rn-craft lint rules and on-device frame rates, then fixes the biggest cost first and proves it with before/after numbers. Use when a screen is slow, janky, scrolls badly, re-renders too much, starts slowly, or before shipping a list-heavy or animation-heavy screen."
---

# React Native performance

Measure, fix the largest cost, measure again. Never optimize from a guess, and never ship a "fix" that has no number
behind it. Read the reference that matches the symptom before changing code:

| Symptom | Read |
|---|---|
| Typing or tapping lags, whole screen re-renders | `references/rerenders.md`, `references/state.md` |
| List scrolls with blank cells or drops frames | `references/lists.md` |
| Animation or gesture stutters | `references/animation.md` |
| Slow launch, slow first screen, memory grows | `references/startup-memory.md` |
| How to measure any of the above | `references/measuring.md` |

## 1. Measure

1. Run a **release-like build** (`--mode Release` / `eas build --profile preview`); dev mode is 2-10× slower and
   lies about everything. Use a mid-range Android device when you have one: it shows problems an iPhone hides.
2. Reproduce the slow interaction and record it:
   - React DevTools Profiler (with "Record why each component rendered") for re-renders: which components, how often,
     why, how long.
   - Perf Monitor (dev menu) or Flashlight (`flashlight measure`) for UI and JS frame rates.
   - `rn-craft` lint on the screen's files: `stable-list-callbacks`, `store-selector`, `context-value-stable`,
     `no-derived-state-effect`, `no-scroll-setstate`, `no-js-animation`, `animate-transform-opacity`,
     `no-scrollview-map`, `no-index-key`.
3. Write the baseline: interaction, JS fps / UI fps, commit count and slowest commit in the profiler, render count of
   the hot components, lint findings.

## 2. Diagnose

Ask, in this order:

1. **Is it the JS thread or the UI thread?** JS fps drops: too much React work or JS logic. UI fps drops: heavy
   views, layout animations, overdraw, big images, shadows.
2. **What re-renders, and why?** Parent re-rendered → stabilize props and memoize the child. Context changed → split
   or memoize the value. Store changed → narrow the selector. Own state → move state down or out (shared value, ref).
3. **Is work done that nobody sees?** Off-screen rows (virtualize), hidden tabs (lazy / `freezeOnBlur`), work at
   module scope or on mount (defer).
4. **Is data shaped for the screen?** Selectors filtering/sorting every render, unnormalized collections, big JSON
   parsed on the JS thread.

## 3. Fix, biggest cost first

- State placement before memoization: moving state down or into a store slice removes renders; `memo` only skips them.
- If the project uses React Compiler, don't add manual `useMemo`/`useCallback`; fix state shape and subscriptions.
- One change at a time, measured. Keep changes that move the number; revert the ones that don't.

## 4. Prove it

Report before → after for the same interaction and build: fps (JS/UI), profiler commits and slowest commit, render
counts of the hot components, startup time if relevant, lint findings. Run typecheck and tests.
