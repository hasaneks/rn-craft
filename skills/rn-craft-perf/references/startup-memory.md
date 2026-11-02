# Startup, images and memory

## Startup (time to first useful screen)

- Hermes on (default). New Architecture on (default since RN 0.76); check heavy legacy native modules.
- Nothing heavy at module scope: no big JSON imports, no SDK initialization that blocks, no synchronous storage reads
  beyond what the first screen needs (MMKV is fine, a full store hydration may not be).
- Lazy-load screens and heavy libraries (charts, maps, PDF, camera) with `React.lazy`/dynamic `import()` or
  navigation's lazy loading; `inlineRequires` in Metro (default on).
- Defer non-critical work until after the first frame (analytics, prefetches, remote config refresh): `setTimeout` /
  `requestIdleCallback` after the first screen mounts.
- Keep the splash until the first screen can render real content, then hide it once (`react-native-bootsplash`,
  `expo-splash-screen`); an animated splash adds to launch time, keep it under ~1 s.
- Measure: cold start on a release build, Android `adb shell am start -W`, Xcode Instruments "App Launch".

## Images

- Request images at display size × pixel ratio (CDN resize, thumbnails for lists); never a 4000 px photo in a 64 pt
  avatar.
- Cached image component: `expo-image` or `@d11/react-native-fast-image`; placeholder/blurhash; `recyclingKey` in
  recycled lists (FlashList).
- Resize/compress camera photos before upload and before showing many of them (image manipulator, vision-camera
  photo size options).
- Prefer SVG/vector icons for UI, raster for photos; huge SVGs (illustrations) can be slower than a PNG.

## Memory and leaks

- Every subscription, listener, timer and interval in an effect has a cleanup.
- Cancel requests on unmount (AbortController / the query library does it).
- Large lists: virtualize; cap in-memory caches; release camera/video resources on blur.
- Hidden screens and tabs: `freezeOnBlur` (react-native-screens) for heavy tabs; unmount what can be rebuilt cheaply.
- Watch memory in Xcode Instruments (Allocations/Leaks) and Android Studio Profiler while navigating back and forth;
  it should return to the baseline.

## Bundle and JS work

- Analyze the bundle (`react-native-bundle-visualizer`, Expo Atlas); replace heavy libraries (moment → date-fns/Intl,
  lodash → per-function imports).
- Move heavy computation off the render path: memoized selectors, precomputed on the server, or a worklet/thread
  (`react-native-worklets` runtimes) for CPU-bound work.
- No `console.log` in release builds (babel `transform-remove-console`).
