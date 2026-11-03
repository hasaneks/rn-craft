'use strict';

const { elementName, meta, sourceCodeOf } = require('../utils');

/** A local `const items = [ ... ]`: a fixed list written in the file. */
function isLocalArray(context, identifier) {
  const sourceCode = sourceCodeOf(context);
  for (let scope = sourceCode.getScope(identifier); scope; scope = scope.upper) {
    const variable = scope.set.get(identifier.name);
    if (variable) return variable.defs[0]?.node?.init?.type === 'ArrayExpression';
  }
  return false;
}

const SCROLL_VIEWS = ['ScrollView', 'KeyboardAwareScrollView', 'KeyboardAvoidingScrollView'];

/** `items.map(...)`, `data?.items.map(...)` — but not a module constant (ITEMS, TABS) or an inline array. */
function mappedCollection(expression) {
  if (expression.type === 'ChainExpression') expression = expression.expression;
  if (expression.type !== 'CallExpression') return null;
  const callee = expression.callee;
  if (callee.type !== 'MemberExpression' || callee.property.name !== 'map') return null;
  const target = callee.object;
  if (target.type === 'ArrayExpression') return null;
  if (target.type === 'Identifier' && /^[A-Z][A-Z0-9_]+$/.test(target.name)) return null;
  return target;
}

module.exports = {
  meta: meta('no-scrollview-map', {
    description: 'Lists that can grow render through a virtualized list; a ScrollView mounts every row at once.',
    messages: {
      map: 'ScrollView renders every item of this .map() at once. If the list can grow, use FlatList or FlashList.',
    },
    schema: [{ type: 'object', additionalProperties: false, properties: { components: { type: 'array', items: { type: 'string' } } } }],
  }),
  create(context) {
    const scrollViews = new Set([...SCROLL_VIEWS, ...(context.options[0]?.components ?? [])]);
    return {
      JSXElement(node) {
        if (!scrollViews.has(elementName(node.openingElement.name))) return;
        for (const child of node.children) {
          const collection = child.type === 'JSXExpressionContainer' ? mappedCollection(child.expression) : null;
          if (collection && !(collection.type === 'Identifier' && isLocalArray(context, collection))) {
            context.report({ node: child, messageId: 'map' });
          }
        }
      },
    };
  },
};
