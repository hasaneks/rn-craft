# Environments and app identity

## Identity

| Environment | iOS bundle id / Android applicationId | Display name | Firebase project | OTA channel |
|---|---|---|---|---|
| development | `<prefix>.<appslug>.dev` | `<App> Dev` | dev | `development` |
| staging | `<prefix>.<appslug>.staging` | `<App> Staging` | staging | `staging` |
| production | `<prefix>.<appslug>` | `<App>` | prod | `production` |

`<prefix>` comes from `STACK.md` (for example `com.limoncreatif`). Slug: the app name lower-cased, accents removed
(`ş→s`, `ı→i`, `ö→o`...), only `a-z0-9`, starting with a letter. Android does not allow dashes; keep both platforms
identical. Different app icons (or a badge) for dev and staging help testers.

## iOS

- Build configurations per environment (`Debug-Dev`, `Release-Staging`, `Release`...) and one scheme per environment.
- Per configuration: `PRODUCT_BUNDLE_IDENTIFIER`, display name, `GoogleService-Info.plist` copied by a build phase
  from `ios/config/<env>/`, entitlements (push, associated domains) per environment.
- Run `pod install` after adding configurations (map them in the Podfile `project` call).

## Android

```gradle
android {
  flavorDimensions = ["env"]
  productFlavors {
    dev     { dimension "env"; applicationIdSuffix ".dev";     resValue "string", "app_name", "App Dev" }
    staging { dimension "env"; applicationIdSuffix ".staging"; resValue "string", "app_name", "App Staging" }
    prod    { dimension "env" }
  }
}
```

`google-services.json` per flavor in `android/app/src/<flavor>/`. Release signing from CI secrets or a local,
git-ignored `keystore.properties`; never commit keystores.

## Runtime config

Pick one mechanism (`react-native-config`, or a generated `src/app/config/env.ts` per build) and validate it:

```ts
import { z } from 'zod';

const Env = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']),
  API_URL: z.string().url(),
  OTA_CHANNEL: z.string().min(1),
  ANALYTICS_ENABLED: z.enum(['true', 'false']).transform((v) => v === 'true'),
});

export const env = Env.parse(rawEnv); // throws at startup with the missing key's name
```

- Commit `.env.example` with every key and fake values. Real `.env.*` files are git-ignored.
- Values in the app are public: anyone can read them from the binary. Publishable keys (Firebase config, Adapty
  public key, AdMob app id) are fine; AWS credentials, service-account keys, backend secrets never go in the app.
- Analytics and Crashlytics collection follow `ANALYTICS_ENABLED` so development traffic stays out of production
  data.

## Scripts

```json
{
  "ios:dev": "react-native run-ios --scheme App-Dev",
  "android:dev": "react-native run-android --mode devDebug",
  "android:release": "cd android && ./gradlew bundleProdRelease"
}
```
