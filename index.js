'use strict';

const pkg = require('./package.json');

const design = [
  'style-scale',
  'no-raw-colors',
  'no-heavy-font-weight',
  'no-heavy-shadow',
  'no-emoji',
  'pressable-name',
  'locale-aware-case',
  'no-exclamation-copy',
  'no-disabled-font-scaling',
  'use-shared-components',
  'prefer-bottom-sheet',
  'no-excessive-motion',
];

const performance = [
  'stable-list-callbacks',
  'no-index-key',
  'no-scrollview-map',
  'context-value-stable',
  'no-derived-state-effect',
  'store-selector',
  'no-scroll-setstate',
  'animate-transform-opacity',
  'no-js-animation',
];

const rules = Object.fromEntries([...design, ...performance].map((id) => [id, require(`./lib/rules/${id}`)]));

const recommendedRules = {
  'rn-craft/style-scale': 'warn',
  'rn-craft/no-raw-colors': 'warn',
  'rn-craft/no-heavy-font-weight': 'warn',
  'rn-craft/no-heavy-shadow': 'warn',
  'rn-craft/no-emoji': 'warn',
  'rn-craft/pressable-name': 'error',
  'rn-craft/locale-aware-case': 'warn',
  'rn-craft/no-exclamation-copy': 'warn',
  'rn-craft/no-disabled-font-scaling': 'warn',
  // Needs the project's own component map; see README.
  'rn-craft/use-shared-components': 'off',
  'rn-craft/prefer-bottom-sheet': 'warn',
  'rn-craft/no-excessive-motion': 'warn',
  'rn-craft/stable-list-callbacks': 'warn',
  'rn-craft/no-index-key': 'warn',
  'rn-craft/no-scrollview-map': 'warn',
  'rn-craft/context-value-stable': 'warn',
  'rn-craft/no-derived-state-effect': 'warn',
  'rn-craft/store-selector': 'error',
  'rn-craft/no-scroll-setstate': 'warn',
  'rn-craft/animate-transform-opacity': 'warn',
  'rn-craft/no-js-animation': 'error',
};

const strictRules = Object.fromEntries(Object.keys(recommendedRules).map((id) => [id, 'error']));
strictRules['rn-craft/use-shared-components'] = 'off';
strictRules['rn-craft/style-scale'] = ['error', { requireTokens: true }];
strictRules['rn-craft/no-js-animation'] = ['error', { allowAnimatedApi: false }];

// React Compiler memoizes inline callbacks and context values itself.
const compilerRules = {
  'rn-craft/stable-list-callbacks': 'off',
  'rn-craft/context-value-stable': 'off',
};

const plugin = {
  meta: { name: pkg.name, version: pkg.version },
  rules,
  configs: {},
};

Object.assign(plugin.configs, {
  // .eslintrc (ESLint 8)
  recommended: { plugins: ['rn-craft'], rules: recommendedRules },
  strict: { plugins: ['rn-craft'], rules: strictRules },
  compiler: { plugins: ['rn-craft'], rules: compilerRules },
  // eslint.config.js (ESLint 9)
  'flat/recommended': { name: 'rn-craft/recommended', plugins: { 'rn-craft': plugin }, rules: recommendedRules },
  'flat/strict': { name: 'rn-craft/strict', plugins: { 'rn-craft': plugin }, rules: strictRules },
  'flat/compiler': { name: 'rn-craft/compiler', plugins: { 'rn-craft': plugin }, rules: compilerRules },
});

module.exports = plugin;
