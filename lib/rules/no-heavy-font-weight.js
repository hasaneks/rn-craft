'use strict';

const { inStyleContext, keyName, meta, numberValue, stringValue } = require('../utils');

const NAMED = { thin: 100, ultralight: 200, light: 300, normal: 400, regular: 400, medium: 500, semibold: 600, bold: 700, heavy: 800, black: 900 };

module.exports = {
  meta: meta('no-heavy-font-weight', {
    description: 'Headings stop at a bold weight; 800-900 reads as shouting and as generated.',
    messages: {
      heavy: 'fontWeight {{value}} is heavier than {{max}}. Make hierarchy with size and colour, not weight.',
    },
    schema: [{ type: 'object', additionalProperties: false, properties: { max: { type: 'number' }, styleFunctions: { type: 'array', items: { type: 'string' } } } }],
  }),
  create(context) {
    const options = context.options[0] ?? {};
    const max = options.max ?? 700;
    return {
      Property(node) {
        if (keyName(node) !== 'fontWeight') return;
        const raw = stringValue(node.value) ?? numberValue(node.value);
        if (raw === null) return;
        const weight = typeof raw === 'number' ? raw : NAMED[String(raw).toLowerCase()] ?? Number(raw);
        if (weight > max && inStyleContext(node, options.styleFunctions)) {
          context.report({ node: node.value, messageId: 'heavy', data: { value: raw, max } });
        }
      },
    };
  },
};
