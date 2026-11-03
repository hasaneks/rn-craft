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
- Lottie / Rive for illustrations: native renderers, but large files cost memory; pause when off screen.
- Skia (`@shopify/react-native-skia`) for custom drawing and charts driven by shared values.
- Stop loops when the screen blurs (`useIsFocused`) or when Reduce Motion is on.
