# Measuring

Always on a release-like build and, when possible, a mid-range Android device. Same interaction, same data, same
device for before and after.

| Question | Tool |
|---|---|
| Which components render, how often, why | React DevTools Profiler (React Native DevTools, `j` in Metro) with "why did this render" |
| A specific component's unneeded renders | `@welldone-software/why-did-you-render` (dev only) |
| JS and UI frame rate during an interaction | Perf Monitor (dev menu), Flashlight (`flashlight measure`, Android) |
| Where JS time goes | Hermes sampling profiler (React Native DevTools → Performance) |
| Native side (layout, drawing, main thread) | Xcode Instruments (Time Profiler, Animation Hitches), Android Studio Profiler / Perfetto |
| Startup | Xcode "App Launch" template, `adb shell am start -W`, a timestamp from `index.js` to first screen mount |
| Memory | Instruments Allocations/Leaks, Android Studio Memory Profiler |
| Regressions over time | Reassure (render-count/time tests in CI), Flashlight in CI |

Report numbers as: interaction, build, device, metric before → after. A change that does not move a number is reverted.
