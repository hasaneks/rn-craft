# Safe areas on iOS and Android

Insets differ by device, OS version, orientation and the user's navigation setting, and they can change while the
app runs. Never hard-code a status bar, notch, home indicator or navigation bar height.

## Setup

- `react-native-safe-area-context`: one `SafeAreaProvider` at the root; read insets with `useSafeAreaInsets()` or use
  its `SafeAreaView` with explicit `edges`. Never the `SafeAreaView` from `react-native` (iOS only, deprecated).
- Android edge-to-edge on from the start (`edgeToEdgeEnabled=true` in `gradle.properties` on current React Native).
  Android 15+ with target SDK 35 enforces it and Android 16 removes the opt-out, so status and navigation bars always
  draw over the app.
- System bar icons follow the applied theme (light icons on dark, dark on light), for both the status bar and the
  Android navigation bar: `SystemBars` / `StatusBar` from one place driven by the theme.
- React Native `Modal` on Android: `statusBarTranslucent` and `navigationBarTranslucent`, otherwise the modal is not
  edge-to-edge and its insets are wrong.

## Device differences to handle

| Case | What changes | Handle it by |
|---|---|---|
| iPhone with notch / Dynamic Island | Large top inset; home indicator bottom inset (~34 pt) | Insets from the hook |
| iPhone without home indicator (SE) | Bottom inset is 0 | `Math.max(insets.bottom, spacing.md)` so bottom actions do not touch the edge |
| Android 3-button navigation | Tall bottom inset (~48 dp), bar may be translucent with a scrim | Pad bottom content; check contrast of content scrolling behind it |
| Android gesture navigation | Small bottom inset with a gesture handle; back gesture from both side edges | Pad bottom; keep horizontal swipe areas (carousels, swipe rows, drawers) away from the screen edges |
| User switches navigation mode, hides the bar, or rotates | Insets change at runtime | Always read the hook; never cache insets in state or a constant |
| Punch-hole / cutout cameras | Top inset, and side insets in landscape | Insets on all edges in landscape |
| Landscape (if supported) | Left/right insets on iPhone and many Android phones | `edges` include left and right |
| Tablets, foldables (if supported) | Different insets per posture | Test the postures in scope |

## Who pads which edge

Pad each edge once. Double padding (a screen adding the top inset under a header that already did) and missing
padding are the two common bugs.

- **Top:** the native stack header handles it. A screen without a header pads the top itself.
- **Bottom with tabs:** the bottom tab bar handles it; screens inside tabs do not add the bottom inset again.
- **Bottom without tabs:** scroll content gets `paddingBottom: insets.bottom + gutter` in `contentContainerStyle`, so the
  last item scrolls clear of the home indicator / navigation bar while the background still runs edge to edge.
- **Sticky bottom action:** padding `Math.max(insets.bottom, gutter)`; above the keyboard the inset is not added on
  top of the keyboard height (`KeyboardStickyView` offsets).
- **Sheets:** pass `topInset` / `bottomInset` to `@gorhom/bottom-sheet`; content inside adds the bottom inset.
- **Toasts and floating buttons:** offset by the insets of their edge.
- **Full-screen media and camera:** media runs behind the bars; controls stay inside the insets.

The shared `Screen` component takes an `edges` prop and applies the rules above, so screens do not compute insets
themselves.

## Check before calling a screen done

Screenshots of the top and bottom of every main screen on:

- iPhone with Dynamic Island and an iPhone SE-size device,
- Android with 3-button navigation and Android with gesture navigation (switch in system settings while the app is
  open),
- a punch-hole Android device and landscape, if landscape is in scope,
- with the keyboard open on form screens, and with a sheet open.
