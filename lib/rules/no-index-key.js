'use strict';

const { calleeName, isFunction, meta, walk } = require('../utils');

/** Whether an expression is built only from `index` (index, `${index}`, String(index), index.toString(), 'row-' + index). */
function onlyIndex(node, index) {
  if (!node) return false;
  let usesIndex = false;
  let usesOther = false;
  walk(node, (child) => {
    if (child.type === 'Identifier') {
      if (child.name === index) usesIndex = true;
      else if (!['String', 'toString', 'Number'].includes(child.name) && !isMemberProperty(child)) usesOther = true;
    }
    if (child.type === 'MemberExpression' && !(child.property.name === 'toString')) {
      // item.id: a real key.
      if (child.object.type !== 'Identifier' || child.object.name !== index) usesOther = true;
    }
  });
  return usesIndex && !usesOther;
}

function isMemberProperty(identifier) {
  return identifier.parent?.type === 'MemberExpression' && identifier.parent.property === identifier && !identifier.parent.computed;
}

function returned(fn) {
  if (fn.body.type !== 'BlockStatement') return fn.body;
  const statement = fn.body.body.find((item) => item.type === 'ReturnStatement');
  return statement?.argument ?? null;
}

module.exports = {
  meta: meta('no-index-key', {
    description: 'Keys come from the data (an id), not the position, so inserting or removing a row does not reuse the wrong state and remount the rest.',
    messages: {
      key: 'key uses the array index. Use a stable id from the item: after an insert or delete, rows swap state and re-render.',
      extractor: 'keyExtractor returns the index. Return a stable id from the item.',
    },
    schema: [],
  }),
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== 'key' || node.value?.type !== 'JSXExpressionContainer') return;
        // Find the nearest .map((item, index) => ...) around this element.
        for (let current = node.parent; current; current = current.parent) {
          if (isFunction(current) && current.parent?.type === 'CallExpression' && /\.(map|flatMap)$/.test(calleeName(current.parent))) {
            const index = current.params[1];
            if (index?.type === 'Identifier' && onlyIndex(node.value.expression, index.name)) {
              context.report({ node, messageId: 'key' });
            }
            return;
          }
          if (current.type === 'Program') return;
        }
      },
      'JSXAttribute[name.name="keyExtractor"]'(node) {
        const fn = node.value?.expression;
        if (!isFunction(fn) || fn.params[1]?.type !== 'Identifier') return;
        if (onlyIndex(returned(fn), fn.params[1].name)) context.report({ node, messageId: 'extractor' });
      },
    };
  },
};
