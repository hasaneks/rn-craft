# Platform UX: iOS and Android patterns

Follow the Human Interface Guidelines on iOS and Material 3 on Android. Where they agree, one implementation serves
both; where they differ, branch on `Platform.OS` only for the difference.

## Choosing the container

| Job | Use | Not |
|---|---|---|
| Pick one of a few options, filter, sort | Bottom sheet (detents: medium/large) or a native menu | Centered modal card |
| Confirm a destructive action | Native alert (`Alert.alert`, destructive style) or an undo snackbar | Custom dialog |
| Actions on an item | iOS context menu / action sheet; Android menu or bottom sheet | Row of tiny icon buttons |
| Short form (1-3 fields) | Bottom sheet with the keyboard, submit pinned above it | Full-screen modal |
| Long form, multi-step flow | Pushed screen(s) in the stack, or a page/form sheet on iOS | Modal over modal |
| Media viewer, camera | Full-screen modal presentation | Sheet |
| Global navigation (3-5 sections) | Bottom tab bar | Hamburger drawer as the only navigation |
| Secondary destinations | Settings/profile screen, or a drawer if there are many | Tabs for everything |

Sheets: a grabber, drag to dismiss, tapping the backdrop dismisses (unless there is unsaved input), back button and
swipe-back close the sheet first. Content scrolls inside the sheet; the sheet grows to the large detent when it does.
Libraries: `@gorhom/bottom-sheet`, native stack `presentation: 'formSheet'` with `sheetAllowedDetents`
(react-native-screens), `<Modal presentationStyle="pageSheet">` on iOS.

## Navigation

- Native stack (`@react-navigation/native-stack`, `expo-router`). iOS: swipe from the edge goes back, never disable
  it except to protect unsaved input (then ask with a native alert). Android: system back and predictive back.
- iOS: large title on root list screens that collapses on scroll; inline title on detail screens. Back button shows
  the previous title or "Back". Android: top app bar, title left-aligned, up arrow.
- Header actions: at most two icons on the trailing side; the most frequent action there, others in a menu.
- Tabs keep their own stack and scroll position; tapping the active tab scrolls to top / pops to root.
- Deep links land on a real screen with a back path.

## Controls

| Need | iOS | Android |
|---|---|---|
| Date/time | Inline or compact `UIDatePicker` (`@react-native-community/datetimepicker`) | Material date picker dialog |
| On/off | `Switch` (green track) | Material switch |
| 2-4 exclusive views | Segmented control | Segmented buttons / tabs |
| Choose one of many | Menu or pushed list with checkmark | Menu, or bottom sheet with radio list |
| Refresh | `RefreshControl` | `RefreshControl` (Material spinner) |
| Share | `Share.share` (system sheet) | same |
| Pressed feedback | opacity/highlight | `android_ripple` |
| Transient message | Inline banner or toast at top/bottom, no buttons | Snackbar with one optional action |

## Layout and ergonomics

- Touch targets 44×44 pt (iOS), 48×48 dp (Android); spacing between targets ≥ 8.
- Screen gutters 16 (compact) or 20; content max width on tablets (~ 640) or a two-column layout.
- Primary action of a form screen: bottom, full width, above the keyboard and the home indicator. Quick actions:
  header trailing slot.
- Safe areas on every edge; Android 15+ is edge-to-edge by default, so the status and navigation bars overlap your
  content unless you pad for the insets.
- Keyboard: `react-native-keyboard-controller` (`KeyboardAwareScrollView`, `KeyboardStickyView`); return key moves to
  the next field (`returnKeyType="next"`, `submitBehavior`), the last field submits; correct `keyboardType`,
  `textContentType` / `autoComplete` for autofill and one-time codes.
- Orientation and large screens: lock only when the content truly needs it.

## Feedback and states

- Pressed state immediately; result within ~1 s or show progress. Optimistic updates for likes, toggles, reorder.
- Haptics: light impact for success or snapping into place, notification haptic for errors; never on every tap.
- Skeletons for content, spinners for actions, pull-to-refresh for lists, empty states with the first action, error
  states with retry. Offline: show cached data and say it is offline.
- Destructive: red, confirmation or undo, never the default button in an alert.

## Typography and icons

- System fonts (SF Pro, Roboto) unless the brand has one. iOS text styles: large title 34, title 28/22/20, headline
  17 semibold, body 17, callout 16, subheadline 15, footnote 13, caption 12/11. Material body 14-16, title 22,
  headline 24-32.
- Text scales with the user's setting; tight spots cap with `maxFontSizeMultiplier` (1.2-1.4), never disable.
- One icon family. SF Symbols style on iOS, Material Symbols on Android are both fine through a cross-platform set
  (Lucide, Phosphor, Tabler) used consistently: one stroke width, sizes 16/20/24.

## Permissions and system prompts

- Ask in context, after the user starts the feature; explain first in your own UI (a sheet), then trigger the
  system prompt. If denied, show how to enable it in Settings (`Linking.openSettings()`).
