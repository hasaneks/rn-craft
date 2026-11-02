'use strict';

const { fullElementName, isFunction, meta } = require('../utils');

module.exports = {
  meta: meta('context-value-stable', {
    description: 'A context value is a stable reference; a new object on every render re-renders every consumer.',
    messages: {
      unstable: 'value={{kind}} is new on every render, so every consumer of {{name}} re-renders. Wrap it in useMemo (and callbacks in useCallback), or split the context.',
    },
    schema: [],
  }),
  create(context) {
    return {
      'JSXAttribute[name.name="value"]'(node) {
        const name = fullElementName(node.parent.name);
        // <Ctx.Provider value> and React 19's <Ctx value>.
        if (!/\.Provider$/.test(name) && !/Context$/.test(name)) return;
        const value = node.value?.type === 'JSXExpressionContainer' ? node.value.expression : null;
        if (!value) return;
        const kind = value.type === 'ObjectExpression' ? '{{...}}' : value.type === 'ArrayExpression' ? '{[...]}' : isFunction(value) ? '{() => ...}' : null;
        if (kind) context.report({ node, messageId: 'unstable', data: { kind, name } });
      },
    };
  },
};
