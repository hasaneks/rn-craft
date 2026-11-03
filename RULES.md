# rn-craft rules

Rules for React Native screens that feel native, stay fast and do not look generated. Each rule says **what**,
**why** and **how to fix it**. Rules marked **lint** are checked by `eslint-plugin-rn-craft`; rules marked
**review** need eyes (a screenshot on both platforms, the profiler) and are applied by the agent skills.

A project's own `DESIGN.md` (or the file named in the skill) wins over these defaults when they disagree.

- [Platform and UX](#platform-and-ux)
- [Motion](#motion)
- [Visual language](#visual-language)
- [Copy and localisation](#copy-and-localisation)
- [Accessibility](#accessibility)
- [Rendering and re-renders](#rendering-and-re-renders)
- [State](#state)
- [Lists](#lists)
- [Images, startup and memory](#images-startup-and-memory)

## Platform and UX

### prefer-bottom-sheet
**lint.** A short task (pick, filter, confirm with details, share) opens in a bottom sheet; a long task pushes a
screen; a yes/no question or a list of actions is the app's own confirm or action sheet.
**Why:** a centered card over a dimmed page is a web pattern. On a phone the bottom of the screen is where the thumb
is, sheets can be dragged away, and both platforms ship them (iOS sheet detents, Material bottom sheets).
**Fix:** `@gorhom/bottom-sheet` (or the project's `BottomSheet`), `presentation: 'formSheet'` in a native stack with
`sheetAllowedDetents`, `<Modal presentationStyle="pageSheet">` on iOS, and the app's `ConfirmSheet` / `ActionSheet`
built on the sheet for confirmations and choices (not `Alert.alert` or `ActionSheetIOS`, which cannot be themed). A
side drawer is not a modal; this rule can be off for it.

### native-navigation
**review.** Screens use a native stack (`@react-navigation/native-stack`, `expo-router` stacks): iOS swipe-back,
large titles where the list is the screen, Android predictive back, the system back button closes sheets first.
**Why:** people navigate by muscle memory; a JS stack or a custom back gesture breaks it.
**Fix:** native stack; never block the back gesture without a reason (unsaved changes → confirm with the app's
confirm sheet).

### platform-controls
**review.** Controls are the app's own shared components (date/time picker in a sheet, switch, segmented control,
confirm and action sheets), themed from tokens, with platform behaviour: Android presses show a ripple
(`android_ripple`), iOS presses dim or highlight, back closes them, accessibility roles and states are set. System UI
stays only where nothing replaces it: permission prompts, `Share.share`, purchase and review dialogs, `RefreshControl`.
**Why:** system alerts, menus and pickers ignore the theme, dark mode tokens and brand type, so the app looks like two
products. Shared components keep one look and one accessibility contract.
**Fix:** build `ConfirmSheet`, `ActionSheet`, `DatePicker`, `Switch` and `SegmentedControl` once in the shared UI
folder and use them everywhere.

### thumb-zone
**review.** The primary action of a screen sits where the thumb reaches: a bottom bar or the bottom of a sheet for
long forms, the navigation bar's trailing slot for a quick action.
**Why:** one-handed use is the default on phones.
**Fix:** sticky bottom action above the keyboard (`KeyboardStickyView` / `KeyboardAvoidingView`), safe-area aware.

### safe-areas-and-keyboard
**review.** Content respects safe areas (notch, home indicator, Android edge-to-edge system bars) and the keyboard
never covers the focused field or the submit button.
**Why:** Android 15+ draws apps edge to edge; clipped content and hidden buttons are the most common mobile bug.
**Fix:** `react-native-safe-area-context` insets, `react-native-keyboard-controller`, scroll to the focused input.

### loading-and-empty
**review.** Loading shows the shape of what is coming (a skeleton) for content, a spinner only for actions; empty
data shows an empty state that says what goes here and offers the first action; errors say what to do next.
**Why:** a blank screen or an endless spinner reads as broken.

### feedback
**review.** Every tap answers within 100 ms: a pressed state, then a result (navigation, a toast/snackbar, an inline
change). Destructive actions ask once, or offer undo.
**Why:** latency without feedback reads as a missed tap and leads to double submits.
**Fix:** pressed styles, optimistic updates, disable the button while submitting, light haptics on success only.

## Motion

### no-js-animation
**lint.** Animations run on the UI thread: Reanimated (shared values, `useAnimatedStyle`, layout animations) or
`Animated` with `useNativeDriver: true`. No `requestAnimationFrame` loops through state, no JS animation libraries.
**Why:** a JS-thread animation stutters every time JS is busy (a fetch resolving, a list rendering).
**Fix:** `useSharedValue` + `withTiming`; `entering={FadeIn}`; `strict` also reports any `Animated` import.

### no-excessive-motion
**lint.** Motion explains a change: 150-300 ms for most transitions, 400 ms at most; springs settle without wobble
(damping 15-30); no bounce/elastic easing, no showy entrances (Bounce, Roll, LightSpeed, Pinwheel, Flip, Rotate);
endless loops only for loading or live indicators.
**Why:** long or bouncy motion delays the user and reads as a demo, not a tool.
**Fix:** `withTiming(v, { duration: 200, easing: Easing.out(Easing.cubic) })`, `FadeInDown.duration(200)`.

### animate-transform-opacity
**lint.** Animate `transform` and `opacity`; never `width`, `height`, `top`, `margin` or `padding` per frame.
**Why:** layout props re-run Yoga layout every frame; transform and opacity are composited.
**Fix:** `scaleX` with a fixed width for progress bars, `translateY` for slide-ins, layout animations
(`LinearTransition`) when the size really changes.

### reduced-motion
**review.** With Reduce Motion on, movement becomes a fade or nothing.
**Fix:** Reanimated's `useReducedMotion()` / `ReduceMotion.System`, `AccessibilityInfo.isReduceMotionEnabled()`.

## Visual language

### style-scale
**lint.** Spacing on a 4 pt grid (1 and 2 allowed for hairlines), radii and font sizes from one scale; with
`requireTokens`, every one of them from theme tokens.
**Why:** off-scale numbers (13, 18, 7) are what make a generated screen look slightly wrong everywhere.
**Fix:** `spacing.md`, `radius.lg`, a `Text` variant.

### no-raw-colors
**lint.** Colours come from theme tokens, never `#hex` or `rgba()` in a component.
**Why:** dark mode, contrast fixes and a brand change all happen in one file only if every colour comes from it.
**Fix:** `colors.textMuted`; brand artwork (logos, illustrations) may be allowed per file in the lint config.

### no-heavy-font-weight
**lint.** Text stops at bold (700). Hierarchy comes from size, colour and space.
**Why:** 800-900 headings shout and are the most common generated-UI tell.

### no-heavy-shadow
**lint.** Surfaces separate by a colour step or a hairline; shadows stay small (radius ≤ 12, opacity ≤ 0.2,
elevation ≤ 6, blur ≤ 24 px).
**Why:** big soft shadows and coloured glows read as generated and cost GPU on Android.

### no-emoji
**lint.** Icons come from the icon set (SF Symbols / Material Symbols style), not emoji.
**Why:** emoji render differently on every OS version, ignore the theme colour and read as generated.

### one-accent
**review.** One accent colour: the primary action, the selection and one key figure. Status colours only for status.

### system-type
**review.** Use the system font (SF Pro / Roboto) unless the brand has a typeface; sizes follow the platform text
styles (iOS body 17, Android body 16) and scale with the user's text size.

### use-shared-components
**lint (configured per project).** Buttons, inputs, sheets come from the app's own components; a different look is a
new variant, not a one-off style.

## Copy and localisation

### locale-aware-case
**lint.** `toLocaleUpperCase(locale)` instead of `toUpperCase()` for text people read.
**Why:** `"istanbul".toUpperCase()` is `ISTANBUL`; Turkish needs `İSTANBUL`. ASCII codes (ISO codes, ids) are ignored.

### no-exclamation-copy
**lint.** Copy states things calmly: no exclamation marks, no "Welcome back 👋" headlines.

### numbers-and-dates
**review.** Numbers, money and dates go through `Intl` (or the project's formatter) with the app's locale; plurals
through the i18n library's plural rules, not `count === 1`.

### sentence-case
**review.** Sentence case for every label, in the source language and each translation; keep proper names.

### long-locales
**review.** Check the screen with the longest locale (German, Finnish) and the largest text size: labels wrap or
truncate deliberately (`numberOfLines` + full text in `accessibilityLabel`), never overflow.

## Accessibility

### pressable-name
**lint.** A pressable without visible text has an `accessibilityLabel` (or the label prop of your `IconButton`).
**Why:** otherwise VoiceOver and TalkBack say only "button".

### no-disabled-font-scaling
**lint.** Never `allowFontScaling={false}`; cap tight spots with `maxFontSizeMultiplier`.

### tap-target
**review.** Touch targets at least 44×44 pt (iOS) / 48×48 dp (Android); a small icon gets `hitSlop` or padding.

### roles-and-states
**review.** `accessibilityRole` on custom controls, `accessibilityState` for selected/disabled/checked, grouped rows
read as one element (`accessible` on the row).

### contrast
**review.** Text contrast 4.5:1 (3:1 for large text and icons) in light and dark themes.

## Rendering and re-renders

A component re-renders when its state changes, its parent re-renders, or a context it reads changes. Memoization only
helps when the props it compares are stable. With React Compiler on, most manual memoization goes away (use the
`compiler` config), but the state and context rules below still hold.

### stable-list-callbacks
**lint.** `renderItem`, `keyExtractor` and friends are stable references; header/footer slots get an element or a
component defined outside, never an inline component.
**Why:** a new `renderItem` re-renders every visible row; an inline component type remounts on every render.

### context-value-stable
**lint.** A context provider's value is memoized; fast-changing values live in their own context or a store.
**Why:** a new value object re-renders every consumer, on every render of the provider.

### no-derived-state-effect
**lint.** Values computed from props or state are computed during render, not copied into state by an effect.
**Why:** the effect renders twice and shows a stale frame. To reset state when an id changes, use `key={id}`.

### memo-boundaries
**review.** Memoize where it pays: list rows (`React.memo`), expensive subtrees under frequently-changing parents,
callbacks passed to them. Not every component.

### no-scroll-setstate
**lint.** Scroll and gesture events drive shared values (`useAnimatedScrollHandler`), not React state; set state only
when a threshold is crossed.

## State

### store-selector
**lint.** Subscribe to the smallest slice: `useSelector((s) => s.user.name)`; never the whole store; selectors that
build objects or arrays use an equality function, `useShallow` or a memoized selector (`createSelector`).
**Why:** a selector that returns a new reference re-renders the component on every store change.

### state-placement
**review.** Keep state as close to where it is used as possible. Server data lives in a query cache (TanStack Query,
RTK Query), not in a global store; global client state (session, preferences) in a small store with selectors;
form state in the form library; per-frame values in shared values; persisted values in MMKV.
**Why:** every piece of state placed too high re-renders everything below it.

### normalized-data
**review.** Store collections by id (`byId` + `ids`) so updating one item changes one reference.

## Lists

### no-index-key
**lint.** Keys come from the data (`item.id`), not the position.

### no-scrollview-map
**lint.** A list that can grow uses `FlatList` / `FlashList`, not `ScrollView` + `.map()`.

### list-tuning
**review.** Rows are memoized and light; images in rows are sized and cached; `FlashList` for long or mixed lists
(`getItemType` for mixed rows); `FlatList` gets `getItemLayout` for fixed-height rows; no nested vertical lists.

## Images, startup and memory

### sized-images
**review.** Images are requested at the size they are shown (server-side resize or thumbnails), cached
(`expo-image`, `@d11/react-native-fast-image`), and given a placeholder; camera photos are resized before upload.

### lazy-startup
**review.** The first screen renders without waiting on non-critical work: no heavy module-scope code, lazy screens
and heavy libraries, work after the first frame, Hermes on.

### cleanup
**review.** Effects remove listeners, timers and subscriptions; cancelled requests do not set state.
