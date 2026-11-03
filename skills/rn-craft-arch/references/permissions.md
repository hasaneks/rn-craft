# Soft permission flow

Never ask for permissions in bulk at launch. Ask when the user starts the feature that needs it, through
`react-native-permissions`, in one hook per feature (`useCameraPermission`, ...).

## Flow

```text
user starts feature
  → check()
     GRANTED / LIMITED      → continue (LIMITED: offer what works, explain how to widen)
     UNAVAILABLE            → explain the feature is not available on this device; offer an alternative
     BLOCKED                → our sheet: why + "Open Settings" button (user taps it, never automatic)
     DENIED (can ask)       → snoozed? → stop quietly, show the alternative
                              not snoozed → our sheet: why + what it unlocks
                                  "Not now" → save snooze, do NOT call request(); show the alternative
                                  "Continue" → request() → handle the result as above, return to the flow
```

- The sheet is short: an icon, one sentence on why, one on what it unlocks, "Continue" and "Not now". Translated.
- Accepting our sheet is not a granted permission; only the system result is.
- Snoozes (date, count) live in `deviceStorage`, apart from the system status. Show the sheet again only after a new
  user action and the snooze rule (for example, not within 7 days, at most 3 times).
- After "Open Settings", re-check when `AppState` becomes `active` and continue if granted.

## Platform behaviour

- Do not assume a denied permission can never be asked again; it depends on platform and permission type.
- Android: `check()` returns `DENIED` for both "never asked" and "denied before"; `BLOCKED` often appears only from
  `request()`. Decide from the `request()` result, not from `check()` alone.
- iOS location: handle reduced accuracy (`locationAccuracy`), "while using" vs "always". Photos: `LIMITED` access
  with `openLimitedPhotoLibraryPicker`.
- Android 13+: `POST_NOTIFICATIONS` is a runtime permission. Android 14+: partial media access.
- App Tracking Transparency (iOS) and ad consent (UMP) have their own rules: see `monetization.md`.

## Native setup

Add only the permissions the product uses: iOS `Info.plist` usage descriptions (localized via `InfoPlist.strings`)
plus the `setup_permissions` list in the Podfile; Android `<uses-permission>` entries. Unused permissions are a store
review risk.
