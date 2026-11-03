# STACK.md template

Copy into the project root as `STACK.md` and fill it in. Agents read it before `rn-craft-init` and `rn-craft-arch`
defaults; anything written here wins.

```markdown
# STACK

## Identity
- App name: Demo App
- App slug: demoapp
- Bundle id prefix: com.example
- Production id: com.example.demoapp (dev: .dev, staging: .staging)

## Platforms
- iOS minimum: 16.0 · Android minSdk: 24 · targetSdk: <current Play requirement>
- Devices: phone only · Orientation: portrait
- Workflow: Community CLI (bare) | Expo

## Product decisions
- Languages: en (fallback), tr · RTL: no
- Auth: email + Google + Apple · Guest: yes, linked on sign-up
- Revenue: subscriptions (Adapty) · Ads: none
- Offline: cache only
- Operations: min supported version via Remote Config, maintenance mode, kill switches: <list>

## Stack overrides
<!-- Only what differs from rn-craft-init/references/stack.md, with the reason. -->
- Toast: ...

## Compatibility (verified YYYY-MM-DD)
| Package | Version | Peer deps | Min iOS / Android | Notes |
|---|---|---|---|---|
| react-native | x.y.z | react x.y.z | ... | New Architecture |

## Toolchain
- Node x · Yarn x · Java JDK x · Ruby x · CocoaPods x · Xcode x · Android SDK / build tools x · NDK x

## Environments
| Env | API | Firebase project | OTA channel |
|---|---|---|---|

## Mocks still in place
- ...

## Distribution
- iOS: TestFlight internal → external → App Store · Android: internal → closed → production
- Signing: <where it lives, who has access>
```
