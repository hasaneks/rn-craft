# Storage and security

## Instances

| Instance | Holds | Cleared on |
|---|---|---|
| `deviceStorage` | Language, theme preference, onboarding seen, permission snoozes, review prompt dates | Never (app data wipe only) |
| `userStorage` (id per user) | Per-user preferences, drafts, cached ids | Sign-out / account switch / deletion |
| `secureStorage` (encrypted) | Backend refresh tokens, anything sensitive the app must persist that no SDK manages | Sign-out / deletion / key loss |

- All keys, types, defaults and versions live in `src/shared/storage`. No raw string keys elsewhere.
- Each instance has a schema version; migrations run once at startup before anything reads it.
- MMKV is synchronous: read the theme and language before the first render to avoid a flash of the wrong theme.
- Do not store what an SDK already stores (Firebase Auth session, Adapty profile).

## Encryption key

1. On first need, generate 16+ random bytes with a cryptographically secure generator (native secure random, e.g.
   `react-native-get-random-values` / `crypto.getRandomValues`). Never `Math.random`.
2. Store it in the Keychain on iOS (`ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` so it does not migrate in
   backups) and in Keystore-backed storage on Android (`react-native-keychain` uses an AES key held in the Android
   Keystore to encrypt the stored value; a Keystore key itself is not exportable).
3. On later launches read it; never regenerate it on each launch.
4. Open `secureStorage` with that key.

The key never goes in source, `.env`, Redux, logs, analytics or unencrypted storage. MMKV encryption without a
protected key is obfuscation, not security.

## Scenarios to handle

| Scenario | Behaviour |
|---|---|
| Sign-out, account switch | Clear `userStorage`, `secureStorage` values, API cache; keep `deviceStorage` |
| Account deletion | As sign-out, plus delete the key and server-side data per the deletion flow |
| Reinstall (iOS keeps Keychain) | Detect first launch with a `deviceStorage` flag; delete stale Keychain items |
| Restore from backup / new device | Key is device-only, so encrypted data is unreadable: discard it and ask to sign in again |
| Key unavailable (locked device, Keystore error) | Do not fall back to plaintext; retry later or re-authenticate |

## Never in the app

AWS keys, service-account JSON, backend secrets, admin tokens. A mobile `.env` is readable from the binary. Put
privileged work behind the backend.

## Logs and analytics

No tokens, passwords, emails, phone numbers or free text the user typed in logs, analytics events or crash keys.
The logger redacts these by default.

## Authorization

The server decides what a user may do and whether they are premium. The client only hides or shows UI.
