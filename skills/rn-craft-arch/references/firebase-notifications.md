# Firebase, auth and notifications

All Firebase access goes through services in `src/shared/services` (`auth`, `analytics`, `crash`, `messaging`,
`remoteConfig`). Use the modular API of the installed React Native Firebase version.

## Environments

One Firebase project per environment (see `rn-craft-init` → `environments.md`). Analytics and Crashlytics
collection are off in development builds so test traffic never reaches production data.

## Auth bootstrap

- Keep the splash screen until the first `onAuthStateChanged` callback, the saved theme and the language are known;
  then pick the navigator (onboarding, auth, app). No flash of the sign-in screen for signed-in users.
- Sign-in methods only from the product scope. If Google or another third-party login exists on iOS, Sign in with
  Apple is required (App Store guideline 4.8).
- Guest use: anonymous auth, then `linkWithCredential` on sign-up so data is kept; handle
  `auth/credential-already-in-use` (offer to switch accounts, say what happens to guest data).
- Save the intended route before sending a user to sign-in; continue there after success.

## Session reset

`resetSession()` on sign-out, account switch and deletion: unregister the FCM token from the backend for this user,
`analytics.setUserId(null)`, clear Crashlytics user id, log out of Adapty, reset API cache and user storage, then
`auth.signOut()`.

## Push messaging

- Token: request notification permission through the soft flow, then `getToken()`; send it to the backend with the
  user id; update on `onTokenRefresh`; remove the mapping on sign-out.
- Delivery and display are separate: FCM delivers; when the app is in the foreground FCM does not show anything, so
  display it yourself (in-app banner, or Notifee if rich local notifications are needed; justify the extra package).
- Handle all three entries: foreground (`onMessage`), background tap (`onNotificationOpenedApp`), cold start
  (`getInitialNotification`). Register `setBackgroundMessageHandler` at the entry file.
- Navigate from a notification only after the navigation container is ready and auth is resolved; queue the target
  until then. Validate the route and params like a deep link.
- iOS: APNs key in Firebase, Push Notifications + Background Modes (remote notifications) capabilities. Android:
  notification channels created at startup, default channel and icon in the manifest.

## Analytics

- Event names and params in one typed map:

```ts
type AnalyticsEvents = {
  paywall_viewed: { placement: string };
  purchase_completed: { product_id: string; period: 'month' | 'year' };
};
export function track<E extends keyof AnalyticsEvents>(name: E, params: AnalyticsEvents[E]) { /* ... */ }
```

- No personal data in params. Collection follows the user's consent (consent mode, `setAnalyticsCollectionEnabled`).

## Crashlytics

- Set attributes: app version, build number, environment, OTA bundle id.
- Upload dSYMs (iOS build phase) and Android mapping files / native symbols for release builds, then check that a
  test crash from a release build is readable.
- Record handled errors through the logger with context, not raw `console.error`.

## Remote Config

Use it (or the backend) for operations: minimum supported version, maintenance mode, kill switches. See
`ota-operations.md`.

## Deep links

Universal Links (`applinks:` associated domain + `apple-app-site-association` on the server) and Android App Links
(`autoVerify` intent filter + `assetlinks.json`). One `linking` config in React Navigation; every incoming URL is
parsed and validated before navigation; protected targets go through the saved-route sign-in flow.
