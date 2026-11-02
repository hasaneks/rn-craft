'use strict';

const { calleeName, isFunction, meta } = require('../utils');

const SETTER = /^set[A-Z]/;

function isSetterCall(statement) {
  return statement.type === 'ExpressionStatement'
    && statement.expression.type === 'CallExpression'
    && statement.expression.callee.type === 'Identifier'
    && SETTER.test(statement.expression.callee.name)
    && !statement.expression.arguments.some(isFunction);
}

module.exports = {
  meta: meta('no-derived-state-effect', {
    description: 'Values computed from props or state are computed during render, not copied into state by an effect.',
    messages: {
      derived: 'This effect only copies values into state, which renders twice (once stale). Compute it during render (useMemo if it is expensive); to reset state when an id changes, give the component key={id}.',
    },
    schema: [],
  }),
  create(context) {
    return {
      CallExpression(node) {
        if (!/^(?:React\.)?use(Layout)?Effect$/.test(calleeName(node))) return;
        const [callback, deps] = node.arguments;
        if (!isFunction(callback) || callback.async || deps?.type !== 'ArrayExpression' || deps.elements.length === 0) return;
        const statements = callback.body.type === 'BlockStatement' ? callback.body.body : [{ type: 'ExpressionStatement', expression: callback.body }];
        if (statements.length > 0 && statements.every(isSetterCall)) {
          context.report({ node: callback, messageId: 'derived' });
        }
      },
    };
  },
};
