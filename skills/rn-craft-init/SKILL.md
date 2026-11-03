---
name: rn-craft-init
description: "Starts a new React Native app, or brings an existing one onto a clear project standard: product intake, latest stable React Native verified from official sources, a pinned compatibility table, Community CLI by default (an existing Expo app stays on Expo), strict TypeScript, Hermes and New Architecture, Yarn, dev/staging/prod environments with separate app identities, a validated config schema, a feature-based folder structure and a STACK.md that records every decision. Use when asked to create, bootstrap, scaffold or set up a React Native project, choose its stack, add environments or flavors, or upgrade React Native."
---

# Start a React Native project

Work as a senior React Native engineer setting up an app that will ship and be maintained. Keep decisions the
project already made: its architecture, names and components. When a rule here cannot be applied, say why and offer
options; never change a chosen technology silently.

## 0. House file first

Read the project's `STACK.md` (and `DESIGN.md`, `CLAUDE.md`, `AGENTS.md`) before anything else. It holds the bundle
identifier prefix, stack overrides and product decisions, and it wins over this skill. If there is none, create it
from `references/stack-template.md` at the end of step 1.

## 1. Intake

Pull these from the product description. Do not ask again for what was given. Ask only about gaps that change the
architecture or product behaviour; for the rest, pick a sensible default and list it as an assumption.

| Topic | What to settle |
|---|---|
| App name | Display name and the app slug for bundle id / applicationId |
| Purpose and users | Core problem, user groups, main journeys |
| MVP | First-release features and what is out of scope |
| Platforms | iOS / Android, minimum OS versions, phone / tablet, orientation |
| Languages | Supported locales, regional variants, RTL |
| Auth | Sign-in methods, guest use, account linking |
| Backend | API contract, environments, auth scheme |
| Revenue | Subscriptions, one-off purchases, ads |
| Device features | Camera, notifications, location, other permissions |
| Design | Brand, references, key flows |
| Offline | Cache only, or offline writes with later sync |
| Media | Photo/video sizes, compression, upload, storage |
| Account lifecycle | Sign-out, account switch, account deletion, data wipe |
| Operations | Minimum supported version, maintenance mode, kill switches |
| Distribution | Signing, test tracks, production release flow, who has access |

Never invent business rules, endpoints, product ids, keys or finished integrations. Mark every mock as a mock and keep
it apart from real integrations. Do not build a feature only because this skill or the stack table names it.

Then share, in a few lines: the assumptions, the open questions that block architecture, and a short plan.

## 2. Versions

1. Look up the **latest stable React Native** on the day you start (reactnative.dev blog/releases, the npm `latest`
   tag). No RC, nightly, beta or preview by default.
2. Pick React and every package at versions that support that React Native version and the New Architecture. Read
   each package's own docs for that version; do not copy setup code from old examples.
3. Before installing, write a **compatibility table** into `STACK.md`: React Native, React, each required package,
   its peer dependencies, minimum iOS / Android, and the toolchain (Node, Java JDK, Ruby, CocoaPods, Xcode, Android
   SDK / build tools / NDK).
4. Pin exact versions. Never `yarn add` everything at `latest` independently.
5. If a package does not support the chosen React Native version, look for its current release or a supported
   integration first. Never downgrade React Native silently; explain the blocker and the options.
6. TypeScript with `strict: true`. Hermes on. New Architecture on (it is the only architecture in current React
   Native); confirm every native dependency supports it.
7. Android release builds use R8 (`minifyEnabled`, `shrinkResources`) from the first release, and ship as AAB. Size
   and release-build settings: `rn-craft-perf` → `references/bundle-size.md`.

## 3. Create or adopt

- **New project:** React Native Community CLI (`npx @react-native-community/cli@latest init <AppName> --pm yarn`).
  No Expo by default: no Expo Go, Expo Router, EAS or Expo SDK modules unless the user asks for Expo.
- **Existing Expo project:** keep Expo. Apply the same architecture and rules with the Expo equivalents
  (config plugins, EAS build profiles for environments); do not add or remove Expo pieces without asking.
- **Existing bare project:** keep its structure; move toward this standard only in the areas you touch.

## 4. Package manager

- Yarn, pinned per project (`packageManager` in `package.json`, Corepack). Commit `yarn.lock`.
- One lockfile only: delete `package-lock.json` / `pnpm-lock.yaml` if they appear.
- All scripts run through Yarn: `yarn start`, `yarn ios`, `yarn android`, `yarn typecheck`, `yarn lint`,
  `yarn test`. CI installs with `yarn install --immutable`.

## 5. Environments and identity

Details and examples: `references/environments.md`.

- Three environments: development, staging, production. iOS build configurations + schemes, Android
  `productFlavors`.
- Production id: `<prefix>.<appslug>`, prefix from `STACK.md` (for example `com.limoncreatif`). Slug: app name in
  lower case, ASCII only, no spaces or dashes (`Demo App` → `demoapp`). Others: `.dev` / `.staging` suffixes and a
  marked display name, so all three install side by side.
- Per environment: API base URL, Firebase project, ad and purchase keys, OTA channel, analytics on/off.
- Development data never reaches production users or production analytics.
- Config is validated at startup with a schema; a missing value fails with a clear message. Ship `.env.example`
  without real values. A mobile `.env` is **not** a secret store: everything in it ends up in the binary.

## 6. Structure and stack

- Folder layout and code rules: `references/structure.md`.
- Default stack and when to install each package: `references/stack.md`. Install modules that depend on product
  scope (camera, ads, purchases, OTA) only when the product needs them.
- Then follow `rn-craft` for UI and `rn-craft-arch` for data, storage, i18n, permissions, Firebase, purchases,
  OTA, tests and release.

## 7. Upgrading React Native

Use the React Native Upgrade Helper diff for the exact versions, upgrade dependencies to versions that support the
target, rebuild both platforms natively (`pod install`, clean Gradle build), run typecheck, lint and tests, then the
regression checklist in `rn-craft-arch` → `references/testing-release.md`. Record the new versions in `STACK.md`.

## How to work

- Small, consistent, verifiable steps. One standard per concern; do not create a second way to do the same thing.
- Do routine development without asking for approval; stop for decisions that change the product.
- Never report an integration, test, build or release as done when it was not run. At the end, say what changed, how
  it was verified, and what is still blocked.
