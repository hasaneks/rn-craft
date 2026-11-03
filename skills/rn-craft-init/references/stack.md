# Default stack

A project's `STACK.md` overrides any row. "When" says whether to install it in every app or only when the product
needs it. Verify each version against the chosen React Native version before installing.

## Core (every app)

| Area | Package / approach | Notes |
|---|---|---|
| Runtime | Latest stable React Native, Community CLI, TypeScript strict | Hermes, New Architecture |
| Package manager | Yarn (pinned) | One lockfile |
| Navigation | `@react-navigation/native` + `native-stack` (+ `bottom-tabs` if needed) | Typed routes |
| Native screens / insets | `react-native-screens`, `react-native-safe-area-context` | Peer deps of React Navigation |
| Global client state | `@reduxjs/toolkit` + `react-redux` | Typed `useAppSelector` / `useAppDispatch` |
| Server data | RTK Query | Cache, pagination, invalidation |
| Connectivity | `@react-native-community/netinfo` | Refetch on reconnect, offline banner |
| Local storage | `react-native-mmkv` | Preferences, small user data |
| Sensitive storage | Separate encrypted MMKV instance | Key in Keychain / Keystore |
| Key management | `react-native-keychain` (or an equivalent native module) | Only for the encryption key and SDK-less secrets |
| i18n | `i18next` + `react-i18next` | Locale detection via `react-native-localize` |
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` | Messages through i18n |
| Gestures / animation | `react-native-gesture-handler`, `react-native-reanimated` 4 (+ `react-native-worklets`) | UI-thread motion: transitions, CSS animations, layout animations, gesture-driven values. Tool choice: `rn-craft-fix` → `references/motion.md` |
| Bottom sheet | `@gorhom/bottom-sheet` | One sheet at a time |
| Keyboard | `react-native-keyboard-controller` | Aware scroll, sticky actions |
| SVG / icons | `react-native-svg` + one SVG icon family (SVG Repo or similar), typed `Icon` component | Bundled, themed |
| Toast | `toastify-react-native` | Short feedback only |
| Splash | `react-native-bootsplash` | Themed splash; hides once theme and auth are ready |
| Long lists | `@shopify/flash-list` (or `FlatList` for short lists) | Virtualized |
| Images | A maintained cached image component (check maintenance status before choosing) | Placeholders, sized sources |
| Permissions | `react-native-permissions` | Soft-permission flow |
| Theme | Light / Dark / System with central tokens | Preference in MMKV |
| Tests | Jest + `@testing-library/react-native` | Behaviour, not implementation |
| E2E | Maestro (or Detox if the team already uses it) | Critical journeys |
| Lint / format | ESLint (`@react-native/eslint-config` + `eslint-plugin-rn-craft`), Prettier | Pre-commit with lint-staged |

## Firebase (every app that uses Firebase)

| Area | Package |
|---|---|
| Base | `@react-native-firebase/app` |
| Auth | `@react-native-firebase/auth` |
| Crashes | `@react-native-firebase/crashlytics` |
| Push | `@react-native-firebase/messaging` |
| Analytics | `@react-native-firebase/analytics` |
| Remote flags (operations) | `@react-native-firebase/remote-config`, or the backend |

Using Firebase does not mean the backend database is Firestore.

## Only when the product needs it

| Need | Package |
|---|---|
| Camera | `react-native-vision-camera` |
| Subscriptions / paywall | Adapty React Native SDK (`react-native-adapty`) |
| Ads | `react-native-google-mobile-ads` (with UMP consent) |
| Store review prompt | `react-native-in-app-review` |
| OTA updates | `@hot-updater/react-native`, AWS provider |
| Graphics, charts, shaders, Lottie | `@shopify/react-native-skia` v3; Lottie plays through Skottie, so no `lottie-react-native` |
| Interactive, state-driven illustrations | Rive (`rive-react-native`) |
| Rich local notifications | `@notifee/react-native` (justify it: FCM alone delivers, Notifee displays) |
| Sign in with Apple | `@invertase/react-native-apple-authentication` (required by Apple when other third-party logins exist) |
| Google sign-in | `@react-native-google-signin/google-signin` |

## Checks before adding any package

- Supports the chosen React Native version and the New Architecture; released in the last year; issues answered.
- Required minimum iOS / Android fits the product's device range (Skia v3 and Vision Camera have their own).
- Native libraries support Android 16 KB page sizes (required by Google Play for new apps and updates).
- Ships a Privacy Manifest or you add its required-reason API entries to the app's `PrivacyInfo.xcprivacy`.
- No overlap with something already installed.
- Size cost is worth it: check the package's install and bundle size, and whether a lighter option or a few lines of
  own code would do. Every native dependency grows both binaries.
- Works with R8 in release (consumer keep rules shipped, or documented rules added to `proguard-rules.pro`).
