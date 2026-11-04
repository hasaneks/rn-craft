'use strict';

const { meta, sourceCodeOf } = require('../utils');

// ASCII identifiers (ISO codes, ids, hex, HTTP methods) have no locale-specific case.
const ASCII_NAMES = '(?:code|iso\\d?|id|key|hex|currency|uuid|sku|token|scheme|protocol|extension|ext|method|header|mime|type|iban|swift|bic|email|url|uri|domain|host|slug)s?\\b';

module.exports = {
  meta: meta('locale-aware-case', {
    description: 'Case changes name the locale: "istanbul".toUpperCase() is "ISTANBUL", not "İSTANBUL".',
    messages: {
      naive: '{{method}}() ignores the locale (Turkish i/İ, German ß, Greek σ). Use {{fix}}(locale).',
    },
    schema: [{ type: 'object', additionalProperties: false, properties: { ignoreNames: { type: 'string' } } }],
  }),
  create(context) {
    const FIX = { toUpperCase: 'toLocaleUpperCase', toLowerCase: 'toLocaleLowerCase' };
    const ignore = new RegExp(context.options[0]?.ignoreNames ?? ASCII_NAMES, 'i');
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== 'MemberExpression' || callee.computed || node.arguments.length > 0) return;
        const method = callee.property.name;
        // Own keys only: FIX.toString is Object.prototype.toString.
        if (Object.hasOwn(FIX, method) && !ignore.test(sourceCodeOf(context).getText(callee.object))) context.report({ node: callee.property, messageId: 'naive', data: { method, fix: FIX[method] } });
      },
    };
  },
};
