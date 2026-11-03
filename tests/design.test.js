'use strict';

const { run } = require('./helpers');

run('style-scale', {
  valid: [
    'const s = StyleSheet.create({ a: { padding: 16, gap: 2, margin: -8, borderRadius: 12, fontSize: 17 } });',
    'const s = StyleSheet.create({ a: { padding: spacing.md } });',
    '<View style={{ paddingHorizontal: 24 }} />',
    // Not a style: a config object that happens to say padding.
    'const chart = { padding: 13 };',
    ['const s = StyleSheet.create({ a: { padding: 0 } });', [{ requireTokens: true }]],
  ],
  invalid: [
    ['const s = StyleSheet.create({ a: { padding: 13 } });', 'spacing'],
    ['<View style={[styles.a, { marginTop: 10 }]} />', 'spacing'],
    ['<FlatList contentContainerStyle={{ paddingBottom: 18 }} />', 'spacing'],
    ['const styles = makeStyles((t) => ({ a: { borderRadius: 7 } }));', 'radius'],
    ['const s = StyleSheet.create({ a: { fontSize: 19 } });', 'fontSize'],
    ['const s = StyleSheet.create({ a: { padding: 16, fontSize: 16 } });', ['token', 'token'], [{ requireTokens: true }]],
    ['const s = StyleSheet.create({ a: { padding: 16, fontSize: 21 } });', ['token', 'fontSize'], [{ requireTokens: ['spacing'] }]],
  ],
});

run('no-raw-colors', {
  valid: [
    'const s = StyleSheet.create({ a: { color: colors.text, backgroundColor: "transparent" } });',
    'const brand = "#6666cc";',
    ['const s = StyleSheet.create({ a: { color: "#000" } });', [{ allow: ['#000'] }]],
  ],
  invalid: [
    ['const s = StyleSheet.create({ a: { backgroundColor: "#fff" } });', 'raw'],
    ['<View style={{ borderColor: "rgba(0,0,0,0.1)" }} />', 'raw'],
    ['<Icon color="#6666cc" />', 'raw'],
    ['<TextInput placeholderTextColor={"#999"} />', 'raw'],
  ],
});

run('no-heavy-font-weight', {
  valid: ['const s = StyleSheet.create({ a: { fontWeight: "700" } });', 'const s = StyleSheet.create({ a: { fontWeight: "bold" } });'],
  invalid: [
    ['const s = StyleSheet.create({ a: { fontWeight: "800" } });', 'heavy'],
    ['<Text style={{ fontWeight: 900 }} />', 'heavy'],
    ['const s = StyleSheet.create({ a: { fontWeight: "black" } });', 'heavy'],
    ['export const typography = { display: { fontSize: 32, fontWeight: "800" } };', 'heavy'],
    ['const s = StyleSheet.create({ a: { fontWeight: "700" } });', 'heavy', [{ max: 600 }]],
  ],
});

run('no-heavy-shadow', {
  valid: [
    'const s = StyleSheet.create({ a: { shadowRadius: 8, shadowOpacity: 0.12, elevation: 2 } });',
    'const s = StyleSheet.create({ a: { boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } });',
  ],
  invalid: [
    ['const s = StyleSheet.create({ a: { shadowRadius: 30, shadowOpacity: 0.4 } });', ['shadow', 'shadow']],
    ['const s = StyleSheet.create({ a: { elevation: 12 } });', 'shadow'],
    ['const s = StyleSheet.create({ a: { boxShadow: "0 20px 60px rgba(99,102,241,0.5)" } });', 'shadow'],
  ],
});

run('no-emoji', {
  valid: ['<Text>Saved</Text>', 'const t = "© 2026 Acme™";', 'console.log("🚀 started");'],
  invalid: [
    ['<Text>Welcome 👋</Text>', 'emoji'],
    ['const title = "🔥 Hot deals";', 'emoji'],
    ['const label = `${count} ✨`;', 'emoji'],
  ],
});

run('pressable-name', {
  valid: [
    '<Pressable onPress={save}><Text>Save</Text></Pressable>',
    '<Pressable accessibilityLabel="Close" onPress={close}><Icon name="x" /></Pressable>',
    '<TouchableOpacity onPress={go}>{label}</TouchableOpacity>',
    '<Pressable {...props}><Icon /></Pressable>',
    '<Pressable accessible={false}><Icon /></Pressable>',
    ['<Pressable onPress={a}><Label value="x" /></Pressable>', [{ textComponents: ['Label'] }]],
  ],
  invalid: [
    ['<Pressable onPress={close}><Icon name="x" /></Pressable>', 'unnamed'],
    ['<TouchableOpacity onPress={close}><View><Icon /></View></TouchableOpacity>', 'unnamed'],
    ['<IconButton icon="trash" onPress={remove} />', 'unnamed', [{ components: ['IconButton'] }]],
  ],
});

run('locale-aware-case', {
  valid: ['name.toLocaleUpperCase("tr-TR");', 'name.toLocaleLowerCase(locale);', '(p.countryCode ?? "tr").toUpperCase();', 'item.iso2.toUpperCase();', 'method.toUpperCase();'],
  invalid: [
    ['const a = city.toUpperCase();', 'naive'],
    ['const b = query.trim().toLowerCase();', 'naive'],
  ],
});

run('no-exclamation-copy', {
  valid: ['<Text>Saved</Text>', '<Button title="Save changes" />', 'if (a !== b) {}', '<Text>{a ? "x" : "y"}</Text>'],
  invalid: [
    ['<Text>All done!</Text>', 'exclaim'],
    ['<Button title="Let\'s go!" />', 'exclaim'],
    ['<Input placeholder={"Search anything!"} />', 'exclaim'],
  ],
});

run('no-disabled-font-scaling', {
  valid: ['<Text maxFontSizeMultiplier={1.3}>Hi</Text>', '<Text allowFontScaling>Hi</Text>'],
  invalid: [
    ['<Text allowFontScaling={false}>Hi</Text>', 'disabled'],
    ['Text.defaultProps.allowFontScaling = false;', 'disabled'],
  ],
});

run('use-shared-components', {
  valid: [
    'import { Pressable } from "react-native";',
    ['import { View, Text } from "react-native";', [{ components: { Pressable: 'Button' } }]],
  ],
  invalid: [
    ['import { View, Pressable, TextInput } from "react-native";', ['raw', 'raw'], [{ components: { Pressable: 'Button', TextInput: 'Input' } }]],
  ],
});

run('no-excessive-motion', {
  valid: [
    'withTiming(1, { duration: 250 });',
    'withSpring(1, { damping: 20 });',
    'withRepeat(withTiming(1), 3, true);',
    '<Animated.View entering={FadeInDown.duration(200)} />',
    'Easing.out(Easing.cubic);',
  ],
  invalid: [
    ['withTiming(1, { duration: 900 });', 'duration'],
    ['withSpring(1, { damping: 4 });', 'bouncy'],
    ['withRepeat(withTiming(1), -1, true);', 'loop'],
    ['Animated.loop(Animated.timing(v, { toValue: 1, useNativeDriver: true }));', 'loop'],
    ['<Animated.View entering={BounceIn.delay(100)} />', 'preset'],
    ['<Animated.View entering={FadeIn.duration(1200)} />', 'duration'],
    ['const e = Easing.bounce;', 'easing'],
  ],
});

run('prefer-bottom-sheet', {
  valid: [
    'import { Modal } from "react-native"; <Modal presentationStyle="pageSheet" visible />;',
    'import { BottomSheet } from "@/ui"; <BottomSheet />;',
    'import { Modal } from "./Modal"; <Modal />;',
    'import { Modal, Platform } from "react-native"; <Modal presentationStyle={Platform.OS === "ios" ? "pageSheet" : undefined} />;',
  ],
  invalid: [
    ['import { Modal } from "react-native"; <Modal transparent visible={open}><Card /></Modal>;', 'modal'],
    ['import RNModal from "react-native-modal"; <RNModal isVisible />;', 'modal'],
  ],
});
