# UI patterns

## State matrix

Every screen or component that shows data designs each state that can happen:

| State | Show |
|---|---|
| First load | Skeleton built from shared `Skeleton` primitives in the shape of the real layout (rows, avatar, title lines). Not a full-screen spinner |
| Content | The data |
| Empty | Icon, one line on what goes here, the first action |
| Error | Short translated reason, what to do, "Try again" |
| Offline | Cached content with an offline banner; or an offline state with retry when nothing is cached |
| Refreshing | Existing content stays; pull-to-refresh indicator. Never swap content back to a skeleton |
| Next page | Footer spinner; on error the list stays and the footer shows retry |
| No access / no permission | What is missing and one action (sign in, grant permission, upgrade) |
| Action in progress | The button shows loading, keeps its width and ignores more taps |

Toast is for short feedback ("Saved", "Copied"). A blocking error lives on the screen. Render crashes are caught by an
Error Boundary with a recovery action; async errors are handled where they happen. Never show raw error messages or
stack traces.

## Settings: language

- Row: icon, "Language", current language name on the trailing side, chevron.
- Tap opens a bottom sheet: one row per supported locale. Leading: the flag the product chose for that locale.
  Middle: the language name in its own language (Türkçe, English, Deutsch). Trailing: a check mark on the selected
  one (`accessibilityState={{ selected: true }}`).
- The flag is decoration; the name always shows. Identity is the locale code, not the flag.
- Tap: save to MMKV, `i18n.changeLanguage`, close the sheet. The UI updates without restart. If the direction
  changes (LTR ↔ RTL), explain and reload.

## Settings: theme

- Row: icon, "Theme", current preference (Light / Dark / System, translated), chevron.
- Sheet rows in this order: sun icon "Light", moon icon "Dark", device icon "System"; check mark on the selected one.
- Tap: save the preference to MMKV, apply at once, close the sheet.
- System: the applied scheme follows `useColorScheme()` / `Appearance` live; Light or Dark ignore OS changes.

## Bottom sheets

- Content-height sheet up to a max (about 90% of the screen); content scrolls inside when longer.
- Safe area at the bottom, keyboard-aware inputs, Android back closes the sheet first, backdrop tap closes it (unless
  there is unsaved input).
- One sheet at a time, no nested sheets. One shared `Sheet` component and a single sheet host.
- Screen reader focus moves into the sheet when it opens and returns to the trigger when it closes.

## Confirmations and action lists

- `ConfirmSheet`: icon (optional), title as a question, one line of consequence, destructive or primary button and
  "Cancel". Back and backdrop tap cancel. Used instead of `Alert.alert` everywhere, including unsaved-changes and
  sign-out.
- `ActionSheet`: rows with icon + label, destructive row last in the error colour, "Cancel" at the bottom. Used
  instead of `ActionSheetIOS` and native context menus.
- Both are built on the shared sheet, translated, themed and accessible (focus moves in, returns to the trigger).

## Buttons and actions

- Variants: primary, secondary, tertiary (text), destructive. Sizes from tokens; touch target at least 44 pt / 48 dp
  even when the icon is smaller.
- Icon position: leading for most actions, trailing for "next / open" (chevron, external link). One gap token
  between icon and text; optical alignment checked at every size.
- States: pressed, disabled, loading (spinner replaces or follows the label, width fixed, presses ignored),
  selected, destructive, each in light and dark.
- Selection and errors use an icon or text as well as colour.
- Micro-animations on press or selection are short and respect Reduce Motion.

## Forms

- react-hook-form owns state and submit; a Zod schema defines rules; messages come from i18n.
- Backend validation errors are mapped onto fields with `setError`; general errors show above the submit button.
- Correct `keyboardType`, `autoComplete` / `textContentType`, `secureTextEntry`, `returnKeyType="next"` with focus
  moving to the next field, the last field submits.
- The focused field and the submit button stay visible above the keyboard.
- Submit is disabled while sending; the input is kept when the request fails.

## Text density

- One title per screen. No eyebrow above it and no subtitle that says the same thing in other words.
- Helper text only where it helps the user act or decide.
- Prefer rows with icons, status marks, short labels and images to paragraphs.
- Keep meaning, error explanations and accessibility while cutting words.
