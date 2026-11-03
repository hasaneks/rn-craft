'use strict';

/** Shared AST helpers. Rules stay small: they only decide what counts as a finding. */

const SPACING_KEYS = new Set([
  'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingStart', 'paddingEnd',
  'paddingHorizontal', 'paddingVertical', 'paddingBlock', 'paddingBlockStart', 'paddingBlockEnd',
  'paddingInline', 'paddingInlineStart', 'paddingInlineEnd',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginStart', 'marginEnd',
  'marginHorizontal', 'marginVertical', 'marginBlock', 'marginBlockStart', 'marginBlockEnd',
  'marginInline', 'marginInlineStart', 'marginInlineEnd',
  'gap', 'rowGap', 'columnGap',
]);

const RADIUS_KEYS = new Set([
  'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius',
  'borderBottomRightRadius', 'borderTopStartRadius', 'borderTopEndRadius', 'borderBottomStartRadius',
  'borderBottomEndRadius', 'borderStartStartRadius', 'borderStartEndRadius', 'borderEndStartRadius',
  'borderEndEndRadius',
]);

const LIST_COMPONENTS = ['FlatList', 'FlashList', 'SectionList', 'VirtualizedList', 'LegendList', 'BigList'];

const PRESSABLES = [
  'Pressable', 'TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback', 'TouchableNativeFeedback',
  'RectButton', 'BorderlessButton', 'BaseButton',
];

function sourceCodeOf(context) {
  return context.sourceCode ?? context.getSourceCode();
}

function keyName(property) {
  if (!property || property.type !== 'Property') return null;
  if (property.key.type === 'Identifier' && !property.computed) return property.key.name;
  if (property.key.type === 'Literal') return String(property.key.value);
  return null;
}

/** A plain number, including a negative one (`-4`). */
function numberValue(node) {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'number') return node.value;
  if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument.type === 'Literal' && typeof node.argument.value === 'number') {
    return -node.argument.value;
  }
  return null;
}

function stringValue(node) {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0].value.cooked;
  return null;
}

/** `Foo`, `Animated.FlatList` → `FlatList` (the last segment). */
function elementName(nameNode) {
  if (!nameNode) return '';
  if (nameNode.type === 'JSXIdentifier') return nameNode.name;
  if (nameNode.type === 'JSXMemberExpression') return nameNode.property.name;
  if (nameNode.type === 'JSXNamespacedName') return nameNode.name.name;
  return '';
}

function fullElementName(nameNode) {
  if (!nameNode) return '';
  if (nameNode.type === 'JSXIdentifier') return nameNode.name;
  if (nameNode.type === 'JSXMemberExpression') return `${fullElementName(nameNode.object)}.${nameNode.property.name}`;
  return '';
}

function calleeName(call) {
  const callee = call.callee;
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type === 'MemberExpression' && !callee.computed) {
    const object = callee.object.type === 'Identifier' ? callee.object.name : '';
    return `${object}.${callee.property.name}`;
  }
  return '';
}

function attribute(openingElement, name) {
  return openingElement.attributes.find((attr) => attr.type === 'JSXAttribute' && attr.name.name === name);
}

function hasSpread(openingElement) {
  return openingElement.attributes.some((attr) => attr.type === 'JSXSpreadAttribute');
}

function isFunction(node) {
  return !!node && (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression');
}

/**
 * Whether an object literal sits where React Native reads it as a style:
 * inside StyleSheet.create, a `style`/`*Style` prop, useAnimatedStyle, or a
 * helper whose name says it builds styles (makeStyles, createStyles, ...).
 */
function inStyleContext(node, styleFunctions = []) {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === 'JSXAttribute') {
      const name = typeof current.name.name === 'string' ? current.name.name : '';
      return /style$/i.test(name);
    }
    if (current.type === 'CallExpression') {
      const name = calleeName(current);
      if (name === 'StyleSheet.create' || name === 'StyleSheet.compose' || name === 'useAnimatedStyle') return true;
      const last = name.split('.').pop();
      if (/^(make|create|use)\w*Styles?$/.test(last) || styleFunctions.includes(last)) return true;
    }
    // styles, cardStyles, typography, textVariants: objects that are styles by name.
    if (current.type === 'VariableDeclarator' && current.id.type === 'Identifier' && /(?:styles?|typography|textVariants?)$/i.test(current.id.name)) {
      return true;
    }
    if (current.type === 'Program') return false;
  }
  return false;
}

/** The function a JSX prop value points to: an inline function, or a local `const fn = ...`/useCallback. */
function resolveFunction(context, valueNode) {
  if (isFunction(valueNode)) return valueNode;
  if (valueNode?.type !== 'Identifier') return null;
  const scope = sourceCodeOf(context).getScope ? sourceCodeOf(context).getScope(valueNode) : context.getScope();
  for (let current = scope; current; current = current.upper) {
    const variable = current.set.get(valueNode.name);
    if (!variable) continue;
    const def = variable.defs[0];
    if (!def) return null;
    if (def.type === 'FunctionName') return def.node;
    if (def.type === 'Variable' && def.node.init) {
      const init = def.node.init;
      if (isFunction(init)) return init;
      if (init.type === 'CallExpression' && /^(?:React\.)?useCallback$/.test(calleeName(init)) && isFunction(init.arguments[0])) {
        return init.arguments[0];
      }
    }
    return null;
  }
  return null;
}

/** Depth-first walk over child nodes, skipping `parent` links and nested functions when asked. */
function walk(node, visit, { skipFunctions = false } = {}) {
  if (!node || typeof node.type !== 'string') return;
  if (visit(node) === false) return;
  for (const key of Object.keys(node)) {
    if (key === 'parent' || key === 'loc' || key === 'range') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item.type === 'string') {
          if (skipFunctions && isFunction(item)) continue;
          walk(item, visit, { skipFunctions });
        }
      }
    } else if (child && typeof child.type === 'string') {
      if (skipFunctions && isFunction(child)) continue;
      walk(child, visit, { skipFunctions });
    }
  }
}

const REPOSITORY = (() => {
  const repo = require('../package.json').repository;
  const url = typeof repo === 'string' ? repo : repo?.url;
  return url ? url.replace(/^git\+/, '').replace(/\.git$/, '') : null;
})();

/** Rule meta: one place builds the docs link, from package.json `repository`. */
function meta(id, { type = 'suggestion', description, messages, schema = [], fixable, hasSuggestions }) {
  return {
    type,
    docs: { description, url: REPOSITORY ? `${REPOSITORY}/blob/main/RULES.md#${id}` : undefined },
    messages,
    schema,
    ...(fixable ? { fixable } : {}),
    ...(hasSuggestions ? { hasSuggestions } : {}),
  };
}

module.exports = {
  meta,
  SPACING_KEYS,
  RADIUS_KEYS,
  LIST_COMPONENTS,
  PRESSABLES,
  attribute,
  calleeName,
  elementName,
  fullElementName,
  hasSpread,
  inStyleContext,
  isFunction,
  keyName,
  numberValue,
  resolveFunction,
  sourceCodeOf,
  stringValue,
  walk,
};
