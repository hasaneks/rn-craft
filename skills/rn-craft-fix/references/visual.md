# Visual language

## Scales

- Spacing: 4 pt grid. A typical set: 4, 8, 12, 16, 20, 24, 32, 40, 48. 1 and 2 only for hairlines and tight icon gaps.
  Screen gutter 16 or 20; between groups 24-32; inside a group 8-12.
- Radius: one scale, e.g. 6, 8, 12, 16, 24, full. Nested radius = outer radius − padding.
- Type: the theme's text variants only (see platform-ux.md for iOS/Material sizes). One display size per screen.
- Weights: 400 body, 500-600 labels, 700 for headings at most.

## Colour

- Neutral ramp for surfaces and text (background, surface, surface raised, border, text, text muted).
- One accent: primary action, selection, one key figure. Status colours (success/warning/danger/info) only for status.
- Dark mode is a separate ramp from tokens, not inverted colours; elevated surfaces get lighter in dark mode.
- Contrast: text 4.5:1, large text and icons 3:1, in both themes.

## Surfaces

- Separate with a surface step or a hairline (`StyleSheet.hairlineWidth`), not with shadows. If a shadow is needed
  (floating button, sheet), keep it small: iOS radius ≤ 12 / opacity ≤ 0.2, Android elevation ≤ 6.
- No cards inside cards; a grouped list (iOS inset grouped) is one card with rows.
- No decorative gradients, glows, blurred blobs, glass on data screens.

## Text density

- Start from the screen's job and its primary action; hierarchy follows them.
- One title. Remove eyebrows and subtitles that repeat it ("Manage your preferences" over "Settings") and intro
  paragraphs that restate the screen.
- Helper text stays only where it helps a decision. Replace the rest with icons, status marks, short labels, images
  and list rows. Keep error explanations and accessibility text.
- Remove technical details the user cannot act on.

## Icons

- One SVG family (SVG Repo or similar) with one stroke width, corner style and fill style; never mix families on a
  screen.
- SVGs cleaned of metadata, bundled in the app, rendered with `react-native-svg` through a typed `Icon` component
  with size and theme colour props. Brand marks and flags keep their own colours.

## Generated-UI tells to remove

- Emoji as icons or in headings; "Welcome back, Alex 👋"; exclamation copy.
- Purple-to-blue gradients, gradient text, sparkles for "AI".
- 800-900 weight headings, tracked uppercase labels.
- Every section in a shadowed card; icon in a coloured square on every row.
- Off-grid numbers (13, 18, 7) and many slightly different grays.
- Badges on everything; three accent colours.
