---
name: rn-craft
description: "Design, UX and performance rules for React Native and Expo screens. Use before building or changing any React Native screen, component, list, form, sheet, navigation flow, animation or store/state code, and before reviewing such changes: platform patterns (bottom sheets over modals, native stack, platform controls), native-thread animation with restrained motion, one spacing/type/colour scale from theme tokens, accessibility, locale-aware copy, re-render control, state placement and selectors, virtualized lists."
---

# Building React Native screens

Apply this whenever you write or review React Native UI or state code. The full catalogue with reasons is
`RULES.md` in the `eslint-plugin-rn-craft` package; this is the working version.

## Before you write

1. **House rules first.** Read the project's `DESIGN.md` (or `CLAUDE.md` / `AGENTS.md` design section) if it exists;
   it wins over these defaults. Note the theme tokens file and the shared UI components (`Button`, `IconButton`,
   `BottomSheet`, `Text`, `ListRow`...). Use them; never invent a parallel look.
2. **Pick the platform pattern** for the task before the layout (see `references/platform-ux.md` in the
   `rn-craft-fix` skill when unsure):
   - short task or choice → bottom sheet; long task → push a screen; yes/no → native alert; actions on an item →
     native menu or action sheet. Not a centered modal card.
   - list is the screen → native large title (iOS) and a virtualized list.
   - primary action → bottom of the screen above the keyboard, or the header's trailing slot for a quick action.
3. **Decide where each piece of state lives** before writing the component (`references/state.md` in
   `rn-craft-perf`): server data in the query cache, global client state in the store with narrow selectors, local
   UI state in the component, per-frame values in Reanimated shared values.

## While you write

**Platform and UX**
- Native stack navigation; never break iOS swipe-back or Android back. Back closes an open sheet first.
- Platform controls for dates, switches, menus, share, pull-to-refresh. Android ripple, iOS dim on press.
- Safe areas and Android edge-to-edge insets on every screen; the keyboard never covers the focused field or submit.
- Every tap answers within 100 ms (pressed state, then result). Disable submit while sending; offer undo for deletes.
- Loading: skeleton for content, spinner for actions. Empty state says what goes here plus the first action.

**Motion**
- UI-thread only: Reanimated or `Animated` with `useNativeDriver: true`. No `requestAnimationFrame` + `setState`.
- 150-300 ms, max 400 ms; `Easing.out(Easing.cubic)` or a damped spring (damping 15-30). No bounce, elastic,
  flip, roll or rotate entrances. Loops only for loading/live indicators.
- Animate `transform` and `opacity`, never `width`/`height`/`margin` per frame.
- Respect Reduce Motion (`useReducedMotion`, `ReduceMotion.System`).

**Visual**
- Spacing, radius, font size, colour from theme tokens only. 4 pt grid. One accent colour.
- Weights stop at 700. Small shadows or a hairline border; no glows, no gradients for decoration.
- Icons from the icon set, never emoji. System font unless the brand has one.

**Copy and accessibility**
- Sentence case, no exclamation marks, no "Welcome back" headlines, buttons say what they do.
- `toLocaleUpperCase(locale)`, `Intl` for numbers/dates/money, the i18n library's plural rules.
- Icon-only pressables get `accessibilityLabel`; custom controls get `accessibilityRole` and `accessibilityState`.
- Targets 44 pt / 48 dp (`hitSlop` for small icons). Never `allowFontScaling={false}`; use `maxFontSizeMultiplier`.

**Rendering and state**
- List callbacks (`renderItem`, `keyExtractor`) are stable; rows are `React.memo`; keys are ids, not indexes.
- Lists that can grow use `FlashList` / `FlatList`, never `ScrollView` + `.map()`.
- Context values are memoized; fast-changing values never go through context.
- `useSelector((s) => s.one.field)`; never the whole store; object/array results need `shallowEqual`/`useShallow`
  or a memoized selector.
- Derive values during render; no `useEffect` that only copies props into state (use `key` to reset).
- Scroll/gesture handlers write shared values, not state.

## After you write

1. Run the linter and fix what it reports (`npx eslint <changed files>`); the project's lint config should extend
   `plugin:rn-craft/recommended`. Never silence a rule without a reason in the config.
2. Look at the screen on **both** platforms (iOS Simulator and Android emulator screenshots), in light and dark, at
   the largest text size and with the longest locale. Check the *review* rules there.
3. For screens with lists, animations or heavy state, run the `rn-craft-perf` checklist.
4. To clean up a screen that already looks generated or feels un-native, use the `rn-craft-fix` skill.

## Adding to the rules

When the user corrects a design or UX decision that is general, propose adding it to the project's `DESIGN.md`; if it
holds for every React Native app, propose it as a rule for rn-craft too.
