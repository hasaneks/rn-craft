---
name: rn-craft-arch
description: "Architecture and integration rules for building features in a React Native app: RTK Query API layer with typed errors, token refresh, retries and cache reset; MMKV storage with an encrypted instance and Keychain/Keystore key management; i18next; soft permission flows; Firebase auth, push, analytics and Crashlytics; Adapty subscriptions, AdMob and in-app review; Vision Camera and uploads; Hot Updater OTA on AWS; force update and kill switches; store compliance (account deletion, privacy manifest, consent); tests, CI and release. Use when adding or reviewing any of these, or when deciding whether a feature is done."
---

# Build features on a solid architecture

Read the project's `STACK.md` first; it wins over these defaults. For a new project start with `rn-craft-init`; for
screens and components follow `rn-craft`. Open the reference for the area you touch before writing code:

| Area | Read |
|---|---|
| API calls, caching, auth headers, offline | `references/data.md` |
| Storing anything on the device, secrets, sign-out cleanup | `references/storage-security.md` |
| User-facing text, locales, dates, numbers | `references/i18n.md` |
| Camera, location, notifications, photos, tracking | `references/permissions.md` |
| Firebase auth, push, analytics, crashes, remote config | `references/firebase-notifications.md` |
| Subscriptions, paywalls, ads, review prompts | `references/monetization.md` |
| Camera capture, image/video upload | `references/media.md` |
| OTA updates, force update, maintenance mode | `references/ota-operations.md` |
| Store policies, privacy, account deletion | `references/compliance.md` |
| Tests, CI, builds, signing, release | `references/testing-release.md` |
| Official docs for each package | `references/sources.md` |

## Rules that apply everywhere

- **Scope:** build what the product asks for. Never invent endpoints, product ids, keys or business rules; mark mocks
  as mocks and list them in `STACK.md`.
- **One way per concern:** one API layer, one storage module, one logger, one wrapper per SDK. Extend the existing
  one instead of adding a second.
- **State homes:** server data in RTK Query, global client state in Redux slices, form state in react-hook-form,
  screen UI state local. Do not copy RTK Query data into slices or local state without a reason.
- **Lifecycle:** sign-out, account switch and account deletion clear user-bound cache, storage, push token mapping,
  analytics user id, purchase identity and OTA-independent state the same way every time (one `resetSession()`).
- **Security:** no secrets in the app, `.env`, Redux, logs or analytics. The client never is the only gate for
  authorization or premium access.
- **Failure is a state:** every async path has loading, error with retry, offline and empty outcomes; errors are
  logged with context and shown to the user in their language.
- **Docs per version:** native setup follows the docs for the installed version of each package.

## Done means

A feature is done only when each item that applies is true:

- The requested flow works end to end on both platforms the product supports.
- Loading, error, empty, offline and permission states exist; first load uses a skeleton, refresh keeps content.
- Every string is translated; dates, numbers and money use the locale.
- Light, Dark and System all look right; no redundant headings or filler copy.
- Icons come from the one icon set, follow the theme and have labels when icon-only.
- Short choices (language, theme, sort) use a bottom sheet.
- Sensitive data and the encryption key are stored as `references/storage-security.md` says.
- `yarn typecheck`, `yarn lint` and the relevant tests pass; native changes were built on iOS and Android.
- Setup, config and migration steps are written down (`STACK.md`, README).
- Missing integrations, checks that could not run and real blockers are stated plainly.

Never present an integration, test, build or release as done when it was not run. If a platform was unavailable,
say which check is missing.
