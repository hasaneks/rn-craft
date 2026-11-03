# Platform UX: iOS and Android patterns

Follow the Human Interface Guidelines on iOS and Material 3 on Android. Where they agree, one implementation serves
both; where they differ, branch on `Platform.OS` only for the difference.

## Choosing the container

| Job | Use | Not |
|---|---|---|
| Pick one of a few options, filter, sort | Bottom sheet with a selectable list | Centered modal card, native menu |
| Confirm a destructive action | The app's `ConfirmSheet` (destructive style) or an undo toast | `Alert.alert`, centered dialog |
| Actions on an item | The app's `ActionSheet` (bottom sheet with icon rows) | `ActionSheetIOS`, native context menu, row of tiny icon buttons |
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
  it except to protect unsaved input (then ask with the app's `ConfirmSheet`). Android: system back and predictive back.
- iOS: large title on root list screens that collapses on scroll; inline title on detail screens. Back button shows
  the previous title or "Back". Android: top app bar, title left-aligned, up arrow.
- Header actions: at most two icons on the trailing side; the most frequent action there, others in a menu.
- Tabs keep their own stack and scroll position; tapping the active tab scrolls to top / pops to root.
- Deep links land on a real screen with a back path.

## Controls

Controls are the app's own shared components, themed from tokens and identical in look on both platforms. They
borrow platform behaviour, not system UI.

| Need | Use | Not |
|---|---|---|
| Date/time | The app's `DatePicker` in a bottom sheet (wheel or calendar built on the theme) | `@react-native-community/datetimepicker` dialogs, system pickers |
| On/off | The app's `Switch` (Reanimated thumb, `accessibilityRole="switch"`) | RN `Switch` with default colours |
| 2-4 exclusive views | The app's `SegmentedControl` | System segmented control |
| Choose one of many | Bottom sheet with a selectable list and check mark | Native menu |
| Confirm / yes-no | `ConfirmSheet` with title, one line, primary and cancel | `Alert.alert` |
| Refresh | `RefreshControl` tinted from tokens | Custom pull gesture |
| Share | `Share.share` (system share sheet: no replacement) | Custom share UI |
| Pressed feedback | iOS: opacity/highlight; Android: `android_ripple` | Same feedback on both |
| Transient message | The app's toast, one optional action | Stacked toasts |

Kept as system UI because nothing can replace it: permission prompts, the share sheet, store purchase and review
dialogs, keyboard, notifications.

## Layout and ergonomics

- Touch targets 44×44 pt (iOS), 48×48 dp (Android); spacing between targets ≥ 8.
- Screen gutters 16 (compact) or 20; content max width on tablets (~ 640) or a two-column layout.
- Primary action of a form screen: bottom, full width, above the keyboard and the home indicator. Quick actions:
  header trailing slot.
- Safe areas on every edge; Android 15+ is edge-to-edge by default, so the status and navigation bars overlap your
  content unless you pad for the insets. Android 3-button and gesture navigation give very different bottom insets;
  iPhones with and without a home indicator differ too. Full rules and the device check list: `rn-craft` →
  `references/safe-area.md`.
- Keyboard: `react-native-keyboard-controller` (`KeyboardAwareScrollView`, `KeyboardStickyView`); return key moves to
  the next field (`returnKeyType="next"`, `submitBehavior`), the last field submits; correct `keyboardType`,
  `textContentType` / `autoComplete` for autofill and one-time codes.
- Orientation and large screens: lock only when the content truly needs it.

## Feedback and states

- Pressed state immediately; result within ~1 s or show progress. Optimistic updates for likes, toggles, reorder.
- Haptics: light impact for success or snapping into place, notification haptic for errors; never on every tap.
- Skeletons for content, spinners for actions, pull-to-refresh for lists, empty states with the first action, error
  states with retry. Offline: show cached data and say it is offline.
- Destructive: error colour, a `ConfirmSheet` or undo, never the primary-styled button.

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
