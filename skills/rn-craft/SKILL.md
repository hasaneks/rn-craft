---
name: rn-craft
description: "Design, UX and performance rules for React Native and Expo screens. Use before building or changing any React Native screen, component, list, form, sheet, navigation flow, animation or store/state code, and before reviewing such changes: platform patterns (bottom sheets over modals, native stack, platform controls), loading/empty/error/offline states with skeletons, Light/Dark/System theming, language and theme pickers, one SVG icon family, low text density, native-thread animation with restrained motion, one spacing/type/colour scale from theme tokens, accessibility, locale-aware copy, re-render control, state placement and selectors, virtualized lists."
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
   - short task or choice → bottom sheet; long task → push a screen; yes/no → the app's `ConfirmSheet`; actions on
     an item → the app's `ActionSheet`. Not a centered modal card, and not `Alert.alert`, `ActionSheetIOS` or a
     native menu.
   - list is the screen → native large title (iOS) and a virtualized list.
   - primary action → bottom of the screen above the keyboard, or the header's trailing slot for a quick action.
3. **Decide where each piece of state lives** before writing the component (`references/state.md` in
   `rn-craft-perf`): server data in the query cache, global client state in the store with narrow selectors, local
   UI state in the component, per-frame values in Reanimated shared values.
4. **Name the screen's job and its primary action**, then build the hierarchy around them. List the states the
   screen will have (`references/patterns.md`).
5. New project, or work on the API layer, storage, i18n, permissions, Firebase, purchases, OTA or release: use
   `rn-craft-init` / `rn-craft-arch` alongside this skill.

## While you write

**Platform and UX**
- Native stack navigation; never break iOS swipe-back or Android back. Back closes an open sheet first.
- The app's own themed components, not system UI: confirmations, action lists, menus, date/time pickers, switches,
  segmented controls are shared components built on the theme and the sheet. They keep platform behaviour (Android
  ripple, iOS dim on press, back closes them, haptics, accessibility roles). System UI stays only where nothing can
  replace it: permission prompts, share sheet, purchase and review dialogs, `RefreshControl` (tinted from tokens).
- Safe areas on every screen from `useSafeAreaInsets()`, never hard-coded heights. iOS (notch, Dynamic Island,
  home indicator or none) and Android (edge-to-edge, 3-button vs gesture navigation, cutouts) differ and insets change
  at runtime; pad each edge exactly once (`references/safe-area.md`). The keyboard never covers the focused field or
  submit.
- Every tap answers within 100 ms (pressed state, then result). Disable submit while sending; offer undo for deletes.
- Loading: skeleton for content, spinner for actions. Empty state says what goes here plus the first action.
- Every data screen covers the state matrix: first load (skeleton shaped like the content), content, empty, error
  with retry, offline, refreshing (content stays), paging error (list stays), no permission, action in progress.
- Short choices (language, theme, sort, a few actions) open a bottom sheet, not a new screen; simple choices apply
  at once and close the sheet, no "Save". One sheet at a time, never a sheet on a sheet. Long or multi-step work is
  a full screen. Focus moves into the sheet and back to the trigger when it closes.
- Forms: react-hook-form + Zod, messages from i18n, server field errors mapped to fields, input kept on failure,
  submit disabled while sending.
- One-time codes: after "Send code" the phone or e-mail field gives way to a sent-to row ("+90 555 111 22 33 ·
  Change") and the code input; the field never stays above the code. A field that shows the country flag holds the
  national number only (`555 111 22 33`), and a masked API value never fills an editable field
  (`references/patterns.md`).
- Every bottom sheet uses one header component: one title size, at least 24 pt between the title and the first field.
- Language and theme rows show the current choice: the selected language's flag, the current theme's icon.
- Toast is for brief confirmation, never the only sign of an error that blocks the screen. Never show raw errors or
  stack traces; render errors go to an Error Boundary.

**Motion**
- UI-thread only: Reanimated (transitions, layout animations, gestures), Skia for custom drawing and Lottie
  (Skottie), Rive for interactive illustrations, or `Animated` with `useNativeDriver: true`. Native stack and the sheet
  library animate screens and sheets. No `requestAnimationFrame` + `setState`. Tool choice: `rn-craft-fix` →
  `references/motion.md`.
- 150-300 ms, max 400 ms; `Easing.out(Easing.cubic)` or a damped spring (damping 15-30). No bounce, elastic,
  flip, roll or rotate entrances. Loops only for loading/live indicators.
- Animate `transform` and `opacity`, never `width`/`height`/`margin` per frame.
- Respect Reduce Motion (`useReducedMotion`, `ReduceMotion.System`).
- Rings, bars and charts animate in once on first show (arc fill, `scaleX` from the leading edge, 300-400 ms); not
  drawn already full. Android pushes set `animation: 'ios_from_right'`; the native default fade reads as no
  transition.

**Visual**
- Spacing, radius, font size, colour from theme tokens only. 4 pt grid. One accent colour.
- Weights stop at 700. Small shadows or a hairline border; no glows, no gradients for decoration.
- Icons from one SVG family through a typed `Icon` component (`react-native-svg`): same stroke, corners and fill
  style everywhere, colour from theme tokens (brand marks and flags keep their colours), bundled with the app, never
  fetched at runtime. Never emoji. System font unless the brand has one.
- Light, Dark and System from day one. The saved preference (`system` by default) is separate from the applied
  scheme; System follows the OS live, an explicit choice ignores it. Switching needs no restart, and the saved
  preference loads before the first frame. Status bar, navigation, sheets, toasts, inputs and skeletons follow it.
- Less text: no eyebrow or subtitle that repeats the title (no "Manage your preferences" above "Settings"), no intro
  paragraph that restates the screen. Helper text only when it changes a decision. Use icons, status marks, short
  labels and rows instead. No technical implementation details that do not help the user decide.
- Not everything is a card. No decorative gradients, badges or shadows to make a screen look rich.
- Sibling cards share one anatomy (leading tile, text, trailing chevron or action), status dots sit inline before the
  title, stat tiles read label then value, and card actions are labelled buttons in one row, not stacked icons.

**Copy and accessibility**
- Sentence case, no exclamation marks, no "Welcome back" headlines, buttons say what they do.
- `toLocaleUpperCase(locale)`, `Intl` for numbers/dates/money, the i18n library's plural rules.
- Every visible string, including accessibility labels, toasts and validation messages, comes from i18n.
- Icon-only pressables get `accessibilityLabel`; custom controls get `accessibilityRole` and `accessibilityState`.
- Actions carry a meaningful icon where it helps finding or understanding them; primary and ambiguous actions use
  short text + icon; back, close and search may be icon-only. Button states: pressed, disabled, loading (keeps its
  width, blocks a second tap), selected, destructive, in both themes. Selection and errors never rely on colour
  alone.
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
   the largest text size and with the longest locale, and on the safe-area device set (Android 3-button and gesture
   navigation, iPhone with and without a home indicator). Check the *review* rules there.
3. Check every state of the state matrix, not only the happy path.
4. For screens with lists, animations or heavy state, run the `rn-craft-perf` checklist.
5. To clean up a screen that already looks generated or feels un-native, use the `rn-craft-fix` skill.

## Adding to the rules

When the user corrects a design or UX decision that is general, propose adding it to the project's `DESIGN.md`; if it
holds for every React Native app, propose it as a rule for rn-craft too.
