# Tests, CI and release

## What to test

- Jest + React Native Testing Library for business rules, hooks and components with real behaviour: sign-in and
  sign-out, permission denied / blocked, network error and retry, purchase success / cancel / pending, form
  validation and server field errors, language and theme switching.
- Test what the user sees (`getByRole`, `getByText` with translated text), not implementation details. Do not write
  tests only to raise coverage.
- Mock SDKs at the service wrapper boundary, not deep inside components.
- E2E for critical journeys (onboarding, sign-in, main task, purchase in sandbox): Maestro by default.
- Async tests clean up timers, listeners and pending promises. Never hide leaks with `--forceExit` or silenced
  warnings.

## CI on every pull request

1. `yarn install --immutable`
2. `yarn typecheck`
3. `yarn lint` (includes `eslint-plugin-rn-craft`)
4. `yarn test`
5. Missing translation keys check
6. On native changes: iOS and Android builds (at least a debug build of each)

Pre-commit (`lint-staged`) runs ESLint and Prettier on staged files.

## Manual checks before a release

- Real devices: push (foreground, background, cold start), purchases in sandbox, camera, deep links.
- Light / Dark / System switching, language switching, the largest font size, bottom sheet keyboard and back button.
- Safe areas: Android 3-button and gesture navigation (switched while the app runs), iPhone with and without a home
  indicator, cutouts and landscape if supported (`rn-craft` → `references/safe-area.md`).
- A low/mid-range Android device in a release build for performance (`rn-craft-perf`).
- Release build: crash reporting works and symbols resolve, environment is production, OTA channel is production.
- Android release with R8 on: every native integration exercised on a device (missing keep rules crash only here);
  `mapping.txt` uploaded to Crashlytics and Play.
- App size compared with the previous release (`rn-craft-perf` → `references/bundle-size.md`); growth explained.

## Versioning and signing

- `versionName` / `CFBundleShortVersionString` semver; build number strictly increasing (CI run number). One script
  bumps both platforms.
- Changelog per store release and per OTA bundle.
- Signing: iOS certificates/profiles via Fastlane match or Xcode managed signing; Android upload key in CI secrets
  with Play App Signing. Never in git.
- Distribution: TestFlight (internal → external) and Play (internal → closed → production) with phased rollout.
  Document who can publish and how in `STACK.md`.

## Reporting

A build, test or release that did not run is not passed. If a platform or device was not available, say which
check is missing.
