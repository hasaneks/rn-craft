# Subscriptions, ads and review prompts

## Adapty (when the product has purchases)

If the `adapty-skills` plugin is installed, use its integration skill for SDK setup; the rules below still apply.

- One `purchases` service: activate once at startup with the environment's public key; `identify(userId)` after
  sign-in and `logout()` in `resetSession()`, so the Adapty profile follows the account.
- Premium access comes from the profile's access level (`profile.accessLevels.premium?.isActive`), refreshed on
  launch, on `AppState` active and from the profile-update listener. If the backend gates content, it verifies the
  entitlement too (Adapty webhooks / server API). Never a local boolean alone.
- Paywall: load the paywall and products for a placement; show loading, error with retry, and "no products" states.
  Prices and periods come from the SDK (`localizedPrice`, subscription period), never hard-coded text.
- Purchase result: success, user cancelled (silent), pending (Ask to Buy, deferred: say it is pending), error
  (translated message, no retry loop). Disable the buy button while a purchase runs.
- Restore purchases button on the paywall and in settings. Terms of use and privacy policy links on the paywall
  (App Store requirement for subscriptions). Manage-subscription link in settings.
- Re-check access after the app returns to the foreground or reconnects mid-purchase.
- Product ids, placement ids and keys come from the real Adapty dashboard per environment; never invent them. Test in
  sandbox (iOS sandbox tester / StoreKit config, Play license testers) before claiming it works.

## AdMob (when the product has ads)

- `react-native-google-mobile-ads`; development and staging always use test ad unit ids (`TestIds`).
- Consent first: UMP (`AdsConsent`) for GDPR/KVKK regions, then ATT on iOS if ads are personalised; load ads only
  after consent is resolved, with non-personalised requests when consent is refused.
- A failed ad load never blocks or breaks a flow; layouts do not jump when a banner is missing.
- Frequency caps and placements are product rules (for example interstitial at most once per N minutes, never on
  launch, never mid-task).
- Premium users get the behaviour the revenue model defines (usually no ads).
- Rewarded ads grant the reward only in the `EARNED_REWARD` callback, once per ad, ideally verified server-side (SSV).

## In-app review

- `react-native-in-app-review`. Ask after a meaningful success (task completed, Nth session with a completed action),
  never at launch or during a critical flow.
- Keep the last request date and count in `deviceStorage`; cap locally (for example once every 90 days). The OS caps
  too and may show nothing.
- Never ask "Do you like the app?" first and send only happy users to the store (store policies forbid gating).
- The API does not tell you if a dialog appeared or a review was written; do not branch on it.
- A "Rate the app" row in settings opens the store page directly (`itms-apps://` / `market://` with an https
  fallback), not the in-app prompt.
