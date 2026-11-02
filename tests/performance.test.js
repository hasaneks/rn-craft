'use strict';

const { run } = require('./helpers');

run('stable-list-callbacks', {
  valid: [
    '<FlatList data={d} renderItem={renderItem} keyExtractor={keyOf} ListHeaderComponent={<Header />} />',
    '<View onLayout={() => {}} />',
    '<FlashList data={d} keyExtractor={(i) => i.id} renderItem={renderRow} />',
  ],
  invalid: [
    ['<FlatList data={d} renderItem={({ item }) => <Row item={item} />} />', 'callback'],
    ['<Animated.FlatList data={d} renderItem={function (x) { return null; }} />', 'callback'],
    ['<FlatList data={d} ListHeaderComponent={() => <Header />} />', 'component'],
    ['<FlatList data={d} onViewableItemsChanged={({ viewableItems }) => track(viewableItems)} />', 'viewable'],
    ['<MyList renderItem={() => null} />', 'callback', [{ components: ['MyList'] }]],
  ],
});

run('no-index-key', {
  valid: [
    'items.map((item, i) => <Row key={item.id} />);',
    'items.map((item, i) => <Row key={`${item.id}-${i}`} />);',
    '<FlatList keyExtractor={(item) => item.id} />',
    '<FlatList keyExtractor={(item, index) => item.id ?? String(index)} />',
  ],
  invalid: [
    ['items.map((item, index) => <Row key={index} />);', 'key'],
    ['items.map((item, i) => <Row key={`row-${i}`} />);', 'key'],
    ['items.map((item, i) => <Row key={i.toString()} />);', 'key'],
    ['<FlatList keyExtractor={(_, index) => String(index)} />', 'extractor'],
  ],
});

run('no-scrollview-map', {
  valid: [
    '<ScrollView>{TABS.map((t) => <Tab key={t} />)}</ScrollView>',
    '<ScrollView>{["a", "b"].map((t) => <Tab key={t} />)}</ScrollView>',
    '<FlatList data={items} />',
    'function D() { const general = [{ id: 1 }]; return <ScrollView>{general.map((g) => <Row key={g.id} />)}</ScrollView>; }',
  ],
  invalid: [
    ['<ScrollView>{orders.map((o) => <Order key={o.id} />)}</ScrollView>', 'map'],
    ['<ScrollView>{data?.items.map((o) => <Order key={o.id} />)}</ScrollView>', 'map'],
  ],
});

run('context-value-stable', {
  valid: ['<AuthContext.Provider value={auth}>{c}</AuthContext.Provider>', '<Select value={{ a: 1 }} />'],
  invalid: [
    ['<AuthContext.Provider value={{ user, signOut }}>{c}</AuthContext.Provider>', 'unstable'],
    ['<ThemeContext value={[theme, setTheme]}>{c}</ThemeContext>', 'unstable'],
  ],
});

run('no-derived-state-effect', {
  valid: [
    'useEffect(() => { fetchUser(id).then(setUser); }, [id]);',
    'useEffect(() => { const t = setTimeout(() => setShown(true), 300); return () => clearTimeout(t); }, []);',
    'useEffect(() => { setReady(true); }, []);',
    'useEffect(() => { setCount((c) => c + 1); }, [tick]);',
  ],
  invalid: [
    ['useEffect(() => { setFullName(first + " " + last); }, [first, last]);', 'derived'],
    ['React.useEffect(() => setTotal(items.reduce((a, b) => a + b.price, 0)), [items]);', 'derived'],
    ['useLayoutEffect(() => { setPage(1); setQuery(""); }, [filter]);', 'derived'],
  ],
});

run('store-selector', {
  valid: [
    'const name = useSelector((s) => s.user.name);',
    'const v = useSelector((s) => ({ a: s.a }), shallowEqual);',
    'const v = useBearStore(useShallow((s) => ({ a: s.a, b: s.b })));',
    'const n = useBearStore((s) => s.bears);',
    'const items = useSelector(selectVisibleItems);',
  ],
  invalid: [
    ['const state = useSelector((s) => s);', 'whole'],
    ['const { a, b } = useAppSelector((s) => ({ a: s.a, b: s.b }));', 'object'],
    ['const done = useSelector((s) => s.todos.filter((t) => t.done));', 'derived'],
    ['const ids = useSelector((state) => Object.keys(state.byId));', 'derived'],
    ['const store = useBearStore();', 'noSelector'],
    ['const [a, b] = useCartStore((s) => [s.a, s.b]);', 'object'],
  ],
});

run('no-scroll-setstate', {
  valid: [
    '<ScrollView onScroll={scrollHandler} />',
    '<ScrollView onScroll={(e) => { if (e.nativeEvent.contentOffset.y > 120 && !shown) setShown(true); }} />',
    '<ScrollView onMomentumScrollEnd={(e) => setPage(e.nativeEvent.contentOffset.x / width)} />',
  ],
  invalid: [
    ['<ScrollView onScroll={(e) => setOffset(e.nativeEvent.contentOffset.y)} />', 'setState'],
    [
      'function S() { const onScroll = useCallback((e) => { setY(e.nativeEvent.contentOffset.y); }, []); return <FlatList onScroll={onScroll} />; }',
      'setState',
    ],
  ],
});

run('animate-transform-opacity', {
  valid: [
    'useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: y.value }] }));',
    'useAnimatedStyle(() => ({ width: 40, opacity: o.value }));',
  ],
  invalid: [
    ['useAnimatedStyle(() => ({ height: h.value }));', 'layout'],
    ['useAnimatedStyle(() => { return { marginTop: withTiming(open ? 0 : -20) }; });', 'layout'],
  ],
});

run('no-js-animation', {
  valid: [
    'Animated.timing(v, { toValue: 1, duration: 200, useNativeDriver: true }).start();',
    'Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true });',
    'requestAnimationFrame(() => setReady(true));',
    'import Animated, { useSharedValue } from "react-native-reanimated";',
  ],
  invalid: [
    ['Animated.timing(v, { toValue: 1 }).start();', 'driver'],
    ['Animated.spring(v, { toValue: 1, useNativeDriver: false }).start();', 'driver'],
    ['Animated.event([{ nativeEvent: { contentOffset: { y } } }]);', 'driver'],
    ['function tick() { requestAnimationFrame(() => { setX((x) => x + 1); requestAnimationFrame(tick); }); }', 'frame'],
    ['import * as Animatable from "react-native-animatable";', 'package'],
    ['import { Animated, View } from "react-native";', 'legacy', [{ allowAnimatedApi: false }]],
  ],
});
