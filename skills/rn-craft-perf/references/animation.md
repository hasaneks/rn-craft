# Animation performance

- Everything that moves per frame runs on the UI thread: Reanimated worklets or `Animated` with `useNativeDriver:
  true`. JS-thread animations (state updates per frame, `requestAnimationFrame` loops, JS animation libraries, the
  native driver off) stutter whenever JS is busy. The `no-js-animation` rule bans them.
- Animate `transform` and `opacity`. Width/height/margin/top per frame re-run layout (`animate-transform-opacity`).
  Progress bar: fixed width + `scaleX` with `transformOrigin: 'left'`. Expand/collapse: layout animation
  (`LinearTransition`) once, not a per-frame height.
- Keep worklets small; don't capture large objects in `useAnimatedStyle` (they are copied to the UI runtime).
- `runOnJS` only at the end of a gesture or animation, never per frame.
- `useDerivedValue` for values computed from other shared values; `useAnimatedReaction` to react to thresholds.
- Shadows, blur (`BlurView`) and large semi-transparent layers are expensive on Android, especially while animating;
  avoid animating them.
- Which library for which job: `rn-craft-fix` → `references/motion.md` ("Choosing the tool").
- Reanimated 4 CSS transitions and animations run on the UI thread like shared-value animations; keep them on
  `transform` and `opacity` too.
- Lottie (through Skia Skottie) and Rive illustrations cost memory with large files; pause when off screen, keep
  files small (no embedded large images), and test on a low-end Android device. Do not add `lottie-react-native`
  next to Skia: one Lottie player per app.
- Skia (`@shopify/react-native-skia`) for custom drawing and charts driven by shared values. Standard UI transitions
  stay in Reanimated; do not draw ordinary components on a Canvas.
- Skia v3 has its own minimum iOS / Android, GPU and (on Android) graphics backend requirements; check them against
  the product's device range and say so if they conflict.
- Lottie through Skia: `Skia.Skottie.Make(json)` once (module scope or `useMemo`, assets cached), never per render or
  per focus. Check fonts, images and effects of each Lottie file on a real device; Skottie does not support every
  After Effects feature.
- Stop loops when the screen blurs (`useIsFocused`) or when Reduce Motion is on.
