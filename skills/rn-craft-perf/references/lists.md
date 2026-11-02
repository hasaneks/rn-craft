# Lists

## Which list

- `FlashList` (v2, Shopify): default for long or mixed lists; recycles cells; v2 needs no size estimate. Give
  `getItemType` for mixed row types; keep row components free of local state that must reset per item (recycling
  reuses the instance; key the stateful part or reset on item change).
- `FlatList`: fine for short/medium lists; tune it.
- `LegendList`: alternative with dynamic sizes and bidirectional loading (chat).
- `ScrollView` + `.map()`: only for short, fixed content (a settings screen with a known set of rows).
- Never nest a vertical virtualized list inside a vertical `ScrollView`; use `ListHeaderComponent`/sections instead.

## Rows

- `React.memo` the row; pass primitives and stable callbacks (`onPress={onSelect}` + `id`, not a new closure).
- Keys from data (`keyExtractor={(item) => item.id}`), never the index.
- Light rows: no heavy layout nesting, no effects per row, images sized and cached, no shadows in Android rows.
- `renderItem` and `keyExtractor` defined once (outside the component or `useCallback`); header/footer as elements or
  components defined outside, never `ListHeaderComponent={() => ...}`.

## FlatList tuning

- `getItemLayout` for fixed-height rows (skips measurement, enables `scrollToIndex`).
- `initialNumToRender` ≈ one screen; `windowSize` 5-11 (lower = less memory, more blanking); `maxToRenderPerBatch`
  and `updateCellsBatchingPeriod` for heavy rows; `removeClippedSubviews` on Android for long lists of simple rows.
- `onEndReachedThreshold` 0.5 with a guard against duplicate loads; pagination through the query library
  (`useInfiniteQuery`).
- `onViewableItemsChanged` must be stable for the list's lifetime (ref or `useCallback` without deps) or it throws.

## Scroll-linked UI

- Collapsing headers, sticky elements, parallax: `useAnimatedScrollHandler` + shared values; `Animated.FlatList` /
  `Animated.ScrollView` from Reanimated.
- Never `onScroll={(e) => setState(...)}`; if React must know (show a "scroll to top" button), set state only when a
  threshold is crossed, from `runOnJS` inside the worklet.
- `scrollEventThrottle={16}` only when you consume every event on the UI thread.
