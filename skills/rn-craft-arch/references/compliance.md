# Store and privacy compliance

Check these before the first submission and whenever a feature touches accounts, data or payments.

## Accounts

- Apps that let users create an account must let them **delete it in the app** (App Store 5.1.1(v); Google Play also
  requires a deletion path and a web link). The flow: explain what is deleted, re-authenticate if needed, call the
  backend, then `resetSession()`. Active subscriptions are not cancelled by deletion: say so and link to managing
  them.
- Sign in with Apple is required on iOS when other third-party sign-ins exist (4.8).
- Reviewers need a working demo account or a way in; note it in the release checklist.

## Privacy

- **iOS Privacy Manifest:** `PrivacyInfo.xcprivacy` in the app with required-reason API entries
  (UserDefaults/MMKV file timestamp, disk space, system boot time as used) and the data types collected; check that
  each SDK ships its own manifest.
- **App Store privacy labels** and **Google Play Data safety** match what the app and its SDKs actually collect
  (Firebase Analytics, Crashlytics, Adapty, AdMob).
- **Consent:** where GDPR/KVKK apply, analytics and ads wait for consent (UMP for ads, Firebase consent mode for
  analytics); ATT prompt on iOS before any tracking across apps, through the soft flow.
- Privacy policy and terms URLs reachable from settings and the paywall.

## Platform requirements (check current values at release time)

- Google Play target SDK deadline (raised every year) and 16 KB page-size support for native libraries.
- Android 15+ edge-to-edge is enforced: handle insets on every screen.
- Xcode / iOS SDK minimum required by App Store Connect for uploads.
- Only the permissions and background modes the app uses, each with a clear usage string.

## Content and payments

- Digital goods and subscriptions use store billing (Adapty on top of StoreKit / Play Billing); no links to external
  payment unless the store program allows it for the region.
- Kids, health, finance or user-generated content each bring extra rules (reporting, blocking, moderation): ask
  when the product is in one of these categories.
