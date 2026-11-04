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

- Row: the **flag of the language it is set to** as the leading element (not a generic globe or "language" icon),
  "Language", the current language name on the trailing side, chevron. The row shows the choice, not the category.
- Tap opens a bottom sheet: one row per supported locale. Leading: the flag the product chose for that locale.
  Middle: the language name in its own language (Türkçe, English, Deutsch). Trailing: a check mark on the selected
  one (`accessibilityState={{ selected: true }}`).
- The flag is decoration; the name always shows. Identity is the locale code, not the flag.
- Tap: save to MMKV, `i18n.changeLanguage`, close the sheet. The UI updates without restart. If the direction
  changes (LTR ↔ RTL), explain and reload.

## Settings: theme

- Row: the icon of the current preference (sun / moon / device) as the leading element, "Theme", the current
  preference (Light / Dark / System, translated), chevron.
- Sheet rows in this order: sun icon "Light", moon icon "Dark", device icon "System"; check mark on the selected one.
- Tap: save the preference to MMKV, apply at once, close the sheet.
- System: the applied scheme follows `useColorScheme()` / `Appearance` live; Light or Dark ignore OS changes.

## Bottom sheets

- Content-height sheet up to a max (about 90% of the screen); content scrolls inside when longer.
- One shared `SheetHeader` for every sheet: the title in one size for all sheets (not `sectionTitle` here and
  `subtitle` there), an optional one-line subtitle, an optional close or back control in the trailing / leading slot.
  It carries its own bottom space: **at least 24 pt between the title and the first field label or row**. A title
  sitting directly on top of the first input's label reads as cramped and unfinished.
- Safe area at the bottom, keyboard-aware inputs, Android back closes the sheet first, backdrop tap closes it (unless
  there is unsaved input).
- One sheet at a time, no nested sheets. One shared `Sheet` component and a single sheet host.
- Screen reader focus moves into the sheet when it opens and returns to the trigger when it closes.

## One-time codes (OTP)

- After "Send code", the phone or e-mail field **gives way** to the code step; it does not stay on screen above the
  code input. The code step shows:
  - a sent-to row: the number or address, formatted (`+90 555 111 22 33`), with a "Change" action;
  - the code input (`textContentType="oneTimeCode"`, `autoComplete="sms-otp"`, autofocus, auto-submit when full);
  - resend with a countdown.
- "Change" brings the field back with the value kept and the code cleared.
- The same pattern everywhere a code is sent: sign-in, onboarding, profile phone or e-mail change, step-up.

## Phone and prefixed inputs

- When a field shows the country (flag, `+90` addon), the value inside is the **national number only**, grouped as
  typed (`555 111 22 33`). Never `+90…`, `90…` or a leading `0` next to the flag. Normalise pasted and autofilled
  values the same way; send E.164 or whatever the API takes.
- A masked value from the API (`+90 555 XXX 34 56`, `a•••@mail.com`) is display text. It never fills an editable
  field (the field would show `905553456`). Prefill from the unmasked source, or leave the field empty.
- The same applies to other prefixed values: currency inputs with a symbol addon, IBAN with `TR`, URLs with a scheme.

## Cards in a list

Sibling cards are scanned as a column, so they share one anatomy:

- Leading column (icon tile, avatar or flag) → text column → trailing action (chevron or one control). Two kinds of
  card in one list (site contacts and businesses, say) use the same anatomy, the same icon alignment (top) and the
  same trailing element; not a "Contact" text link on one and a chevron on the other.
- Status markers (unread dot, pin) sit inline before the title. A marker column that only some cards fill leaves the
  others with an empty indent and makes padding look uneven.
- Icons in detail rows sit in a fixed-width column, so text starts on one edge whatever the glyph's width.
- Stat tiles read label first, then value ("Block · A Block"), never value over label ("A Block Block").
- Actions on a card are labelled buttons in one row (Share, Revoke), not icon buttons stacked beside the content.
  Long content with an action at the end becomes two bands: content, a divider, the code or figure with its actions.
- Equal padding on all four sides; content height decides the card height, nothing stretches over empty space.

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
