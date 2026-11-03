# OTA updates and operational controls

## Hot Updater on AWS

- `@hot-updater/react-native` with the AWS provider (S3 + CloudFront / Lambda@Edge). Follow the docs for the
  installed version and its bare React Native setup; do not carry over fingerprint packages or Expo pieces from old
  examples.
- Update strategy, written in `STACK.md`:
  - **fingerprint** (preferred): a bundle targets binaries whose native fingerprint matches;
  - or **appVersion** targeting, where you check yourself that every targeted binary has the same native code.
- OTA ships JavaScript and assets only. Native code, native dependencies, permissions, `Info.plist`, Gradle or
  entitlements changes need a store build. A version range does not prove native compatibility.
- Channels: `development`, `staging`, `production`, set per build from config.
- Apply without interrupting: download in the background, apply on next cold start or on a safe moment (no open
  form, no purchase or upload in progress). Force-apply only for critical fixes, with a short notice.
- Test: rollback of a bad bundle, launch offline, failed and partial downloads, bundle that crashes on start (the
  updater must fall back).
- Integrity: signed bundles / checksum verification; publishing rights limited to CI and named people.
- Every OTA release is recorded with app version, platform, channel, bundle id and change summary; rollback steps
  are in the README.

## AWS access

- Look at existing AWS resources before creating any; reuse them.
- Ask for region, bucket / distribution names and a named profile or CI role when the integration starts. Never ask
  for access keys in chat; use local `aws` profiles or CI OIDC roles.
- Separate the setup role (creates infra) from the deploy role (uploads bundles only). The app gets no AWS
  credentials at all.

## Operational controls

Defined in the intake ("Operations"). Read from Remote Config or the backend at launch and on foreground, with
cached last values for offline launch:

- **Minimum supported version:** below it, a blocking screen with "Update" (store link); below a soft minimum, a
  dismissible prompt.
- **Maintenance mode:** a full-screen state with a message and retry; no API calls behind it.
- **Kill switches:** per-feature booleans that hide or disable a feature cleanly (no crash, no dead button).
- **Store-level:** phased release on both stores so a bad binary can be paused.
