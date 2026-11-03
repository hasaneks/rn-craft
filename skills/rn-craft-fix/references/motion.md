# Motion

Motion explains where something came from and where it went. If removing an animation loses no information, it is
decoration; keep it only if it is short and quiet.

## Choosing the tool

Every option here runs on the UI thread or in a native renderer. Pick the simplest one that does the job.

| Need | Use |
|---|---|
| State change of one element (fade, slide, scale, colour) | Reanimated 4 CSS transitions (`transitionProperty`, `transitionDuration`) or `withTiming` |
| Keyframe animation, loading pulse | Reanimated 4 CSS animations (`animationName` keyframes) |
| Values that follow a gesture or scroll | `react-native-gesture-handler` + Reanimated shared values, `useAnimatedScrollHandler` |
| Items entering, leaving, reordering | Reanimated layout animations (`entering`, `exiting`, `layout={LinearTransition}`) |
| Screen and sheet transitions | Native stack `animation` option (react-native-screens), `@gorhom/bottom-sheet`; do not hand-roll |
| Content following the keyboard | `react-native-keyboard-controller` (`useReanimatedKeyboardAnimation`, `KeyboardStickyView`) |
| Lottie: designer-made illustration, empty state, success tick | React Native Skia v3 Skottie (no `lottie-react-native`) |
| Custom drawing, charts, shaders | React Native Skia v3 with shared values |
| Interactive illustration with states (toggle, onboarding character) | Rive (`rive-react-native`), state machine driven from props |

`moti` runs on Reanimated and is allowed, but in new code prefer Reanimated 4's CSS transitions, which cover the
same declarative cases without another dependency.

## Thread

- Reanimated 3/4: `useSharedValue`, `useAnimatedStyle`, `withTiming`, `withSpring`, layout animations
  (`entering`, `exiting`, `layout={LinearTransition}`), `useAnimatedScrollHandler`. Runs on the UI thread.
  Reanimated 4 needs the New Architecture and `react-native-worklets`.
- Legacy `Animated`: only with `useNativeDriver: true` (transform and opacity only). `strict` bans it entirely.
- `LayoutAnimation`: native, fine for simple list insert/remove; Reanimated layout animations give more control.
- Gestures: `react-native-gesture-handler` + Reanimated; never a `PanResponder` that sets state.
- Banned: `requestAnimationFrame` loops through state, `setInterval` animations, JS animation libraries
  (`react-native-animatable`, react-spring) and `Animated` without the native driver.
- `runOnJS` from a worklet only at the end of an interaction (dismissed, snapped), never per frame.

## Timing

| Kind | Duration | Curve |
|---|---|---|
| Press feedback | 80-120 ms | linear / ease-out |
| Small change (toggle, fade, chip select) | 150-200 ms | `Easing.out(Easing.cubic)` |
| Element enter/exit, expand/collapse | 200-300 ms | ease-out in, ease-in out |
| Sheet / screen transition | platform default (native stack, sheet library) | platform |
| Maximum | 400 ms | |

Springs: `withSpring(v, { damping: 20, stiffness: 200 })` or Reanimated 4's duration-based springs
(`{ duration: 300, dampingRatio: 1 }`). Damping under 10 wobbles.

Entering presets: `FadeIn`, `FadeInDown`/`FadeInUp` (small offset), `SlideInRight` for pushed content, `ZoomIn` only for
small elements like a badge. Not: `BounceIn*`, `RollIn*`, `LightSpeedIn*`, `PinwheelIn`, `FlipIn*`, `RotateIn*`,
`StretchIn*`. Stagger list entrances at most 30-50 ms per item and only for the first screenful.

## What not to animate

- Layout properties per frame (width, height, margin, padding, top/left): use transform/opacity or layout animations.
- Every number change (count-up on every render), every icon, the whole screen on mount.
- Infinite loops other than loading/live indicators (and those stop when off screen).
- Parallax and blur on scroll in data screens.

## Reduce Motion

`useReducedMotion()` from Reanimated, or `.reduceMotion(ReduceMotion.System)` on layout animations: movement becomes a
fade or nothing. Never remove the information (a state change still shows).
