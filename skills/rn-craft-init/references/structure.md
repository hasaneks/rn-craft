# Project structure and code rules

## Layout

```text
src/
  app/                      # composition root: what wires features together
    App.tsx
    providers/              # Redux, theme, i18n, sheet, toast, error boundary, safe area, gesture root
    navigation/             # navigators, typed route params, linking config, auth/onboarding gates
    store/                  # configureStore, root reducer, typed hooks, RTK Query base api
    config/                 # validated environment config
  shared/                   # used by two or more features, knows no feature
    ui/                     # Button, Text, Input, Screen, Icon, ListRow, Skeleton, EmptyState, ErrorState, Sheet,
                            # ConfirmSheet, ActionSheet, DatePicker, Switch, SegmentedControl, Toast
    theme/                  # tokens (color, spacing, radius, type), light/dark palettes, useTheme
    i18n/                   # i18next init, language detection, locales/<lang>/<namespace>.json
    storage/                # MMKV instances, typed keys, defaults, migrations
    services/               # wrappers: analytics, crash, auth, messaging, purchases, ads, review, logger, ota
    hooks/                  # generic hooks (useAppState, useNetInfo, useReducedMotion)
    utils/                  # pure helpers (format, validation)
    assets/                 # icons (svg), images, fonts, animations
  features/
    <feature>/
      api/                  # RTK Query endpoints injected into the base api
      components/
      hooks/
      screens/
      model/                # slice, selectors, types, zod schemas
      index.ts              # what other features may import
```

Rename to the project's existing convention if it has one; do not reorganise unrelated folders.

## Rules

- Navigation, store and providers live in `app/`. Shared UI, theme, helpers and service wrappers live in `shared/`.
  A feature's components, hooks, types and endpoints stay inside that feature.
- Features import other features only through their `index.ts`. `shared/` never imports from `features/`.
- Screens compose; they do not hold business logic, storage calls or SDK calls. Put those in hooks and services.
- Every third-party SDK (Firebase, Adapty, AdMob, Hot Updater, in-app review) is reached through one service in
  `shared/services`. The rest of the app never imports the SDK directly, so it can be mocked and swapped.
- No empty layers or abstractions "for later". One component per responsibility: reuse components that share
  behaviour and design, but do not merge different responsibilities just because they look alike, and avoid
  components driven by many unrelated props.
- Never define a component inside another component's render.
- Lists use stable, unique ids as keys; never the array index for lists that can change.
- No unexplained `any`, `as` casts, `@ts-ignore` / `@ts-expect-error` or `eslint-disable`. A suppression carries a
  comment with the reason.
- ESLint and Prettier run on the whole project (editor, pre-commit, CI).
- Errors are never swallowed. Separate the message shown to the user (translated, actionable) from the technical
  record (logger → Crashlytics, without tokens or personal data).
- When changing an existing project, do not reformat unrelated files and do not discard the user's work in progress.

## Logger

One `logger` service: `debug` only in development; `warn` / `error` go to Crashlytics in release with context
(screen, feature, request id). It redacts tokens, passwords, emails, phone numbers and free text the user typed.
Never `console.log` user data.
