# App size and release build optimisation

App size affects install conversion, update rate and startup. Measure it on every release like any other number.

## Measure

- Android: the size Google Play reports per device (Play Console → App size), and locally
  `bundletool get-size total --apks=app.apks` from the release AAB. Analyze the APK in Android Studio (APK Analyzer)
  to see dex, native libs, resources and the JS bundle.
- iOS: App Store Connect "App Store File Sizes" per device, or an App Thinning Size Report from an Xcode export.
- JS: `npx react-native bundle --platform android --dev false --minify true --sourcemap-output ...` then
  `source-map-explorer` or `react-native-bundle-visualizer`.
- Keep the numbers in the release notes and fail CI (or warn) when a release grows more than an agreed budget.

## Android release build

Turn R8 on from the first release, not just before launch:

```gradle
// android/app/build.gradle
def enableProguardInReleaseBuilds = true

android {
  buildTypes {
    release {
      minifyEnabled true          // R8: shrink, optimise and obfuscate Java/Kotlin
      shrinkResources true        // drop unused Android resources
      proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
    }
  }
}
```

- Ship an **AAB**, never a universal APK, so Play splits by ABI, density and language.
- Keep rules: most libraries ship consumer rules; add to `proguard-rules.pro` only for what breaks (reflection,
  JSON models used from native code, a library's documented rules). Each rule carries a comment naming the library.
- After enabling R8, run the release build on a device through every native integration (Firebase, Adapty, AdMob,
  camera, Skia, push, deep links): crashes at startup or `ClassNotFoundException` mean a missing keep rule.
- Upload the R8 `mapping.txt` to Crashlytics and Play Console for every release, otherwise crashes are unreadable.
- Native libraries: `useLegacyPackaging false` (uncompressed, page-aligned `.so`, required for 16 KB page sizes);
  ship only the ABIs you support (`reactNativeArchitectures` for local builds; Play handles splits for users).
- Limit resource languages to the supported locales: `androidResources { localeFilters += ["en", "tr"] }` (or
  `resConfigs` on older AGP), which also trims strings from Google libraries.

## iOS release build

- Release configuration with `Dead Code Stripping` on, `Strip Debug Symbols During Copy` on, dSYMs uploaded rather
  than shipped.
- Images in the asset catalog (so App Thinning delivers one scale), not loose PNGs in the bundle.
- Bitcode is gone; do not re-enable old settings from templates.

## JavaScript bundle

- Hermes compiles to bytecode in release; keep it on.
- Metro `inlineRequires: true` so modules load when first used.
- Watch the heavy imports: `moment` → `Intl` / `date-fns`; full `lodash` → per-function imports or native code;
  icon packs imported whole → import single SVGs; large JSON (country lists, translations of unused languages) →
  lazy-load or fetch.
- Remove unused dependencies regularly (`knip` or `depcheck`); every native dependency adds to both binaries.
- No `console.*` in release (`babel-plugin-transform-remove-console`), no dev-only libraries in `dependencies`.

## Assets

- Images: WebP or AVIF where supported, sized for the largest display scale used, compressed; no 4000 px source
  images in the bundle. Remote images for content, bundled only for UI.
- Fonts: only the weights the type scale uses; subset large fonts to the supported scripts.
- Lottie files: no embedded raster images when avoidable, remove hidden layers, keep each file small; check the size
  of every animation added.
- SVG icons cleaned of metadata; an icon set used through single imports.

## Performance follows from the same build

Always measure performance on the release build with R8 and Hermes bytecode, on a low/mid-range Android device: a
debug build or an un-minified release hides or invents problems.
