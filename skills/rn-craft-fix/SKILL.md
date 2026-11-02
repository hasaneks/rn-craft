---
name: rn-craft-fix
description: "Fixes a React Native or Expo screen that looks generated or does not feel native: measures it with the rn-craft lint rules and simulator screenshots on iOS and Android, picks a direction from the product, then fixes platform patterns (modals to bottom sheets, navigation, controls), spacing, colour, type, icons, copy, motion and accessibility in passes, and proves the result with before/after numbers and screenshots. Use when asked to fix, polish, clean up, de-slop, redesign or make a React Native screen feel native."
---

# Fix a React Native screen

Keep the product: features, data, content and section order stay. Change how every size, colour, word, pattern and
movement is chosen. Read `references/platform-ux.md`, `references/motion.md` and `references/visual.md` before the
first edit.

## 1. Measure first

1. Note the git commit (or copy the files to `*.before.tsx`), so the before state can be shown at the end.
2. Lint exactly the files you will change and keep the counts per rule:
   ```bash
   npx eslint --format json path/to/Screen.tsx path/to/components > /tmp/rn-craft-before.json
   ```
   If the project does not use the plugin yet, install `eslint-plugin-rn-craft` and extend
   `plugin:rn-craft/recommended` (`.eslintrc`) or `rnCraft.configs['flat/recommended']` (`eslint.config.js`) on a
   branch; keep the project's parser settings so TypeScript files are read.
3. Take screenshots on iOS and Android (simulator/emulator), light and dark, largest text size. The review rules
   need them: platform pattern, thumb zone, safe areas, one accent, empty/loading states, contrast, long labels.
4. Write the audit as one short list grouped by area, worst first: problem, where, rule.

If the screen is already good, say so and suggest two or three refinements instead of redesigning it.

## 2. Pick a direction (4 lines, before any edit)

- **Who and what:** the user and the job of this screen in one sentence.
- **Pattern:** the platform pattern the job calls for (list + push, form + sticky action, sheet, tabbed hub).
- **Accent:** one colour for the primary action, the selection and one key figure; keep the real brand colour.
- **One moment:** the single element that carries richness (a chart, a photo, the headline number); the rest quiet.

## 3. Fix in passes, across the whole screen

1. **Pattern and navigation:** centered modals become sheets / pushed screens / native alerts; native stack;
   back closes sheets; primary action in the thumb zone; platform controls instead of hand-made ones.
2. **Spacing and layout:** tokens on a 4 pt grid; consistent screen gutters (16 or 20); group related rows; safe
   areas and keyboard.
3. **Surfaces and colour:** surface steps or hairlines instead of shadows; one accent; status colours for status only;
   dark mode from tokens.
4. **Icons:** one icon set, one stroke, one size per context; emoji out.
5. **Copy:** sentence case, specific button labels, no exclamation, errors say what to do, `Intl` formatting.
6. **Type:** the theme's text variants only; weights ≤ 700; hierarchy by size and colour.
7. **Components:** one look per element through the shared components; repeated markup becomes a component.
8. **Motion:** UI-thread only, 150-300 ms, no bounce, transform/opacity, Reduce Motion respected.
9. **Accessibility:** labels, roles, states, 44/48 targets, font scaling, contrast.

Do not silence a lint finding to make the number go down; fix it, or document a real exception in the lint config
with the reason (brand artwork colours, a side drawer that is not a modal).

## 4. Prove it

1. Lint the same files again; report **before → after** per rule and in total.
2. Take the same screenshots again and show them next to the before set.
3. List anything left on purpose, with the reason.
4. Run the project's typecheck and tests; the fix is not done while they fail.
