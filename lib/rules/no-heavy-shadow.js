'use strict';

const { inStyleContext, keyName, meta, numberValue, stringValue } = require('../utils');

module.exports = {
  meta: meta('no-heavy-shadow', {
    description: 'Surfaces separate by a step in colour or a hairline; big soft shadows and glows read as generated.',
    messages: {
      shadow: '{{key}}: {{value}} is a heavy shadow (limit {{limit}}). Use a surface step or a hairline border.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          shadowRadius: { type: 'number' },
          shadowOpacity: { type: 'number' },
          elevation: { type: 'number' },
          blur: { type: 'number' },
          styleFunctions: { type: 'array', items: { type: 'string' } },
        },
      },
    ],
  }),
  create(context) {
    const options = context.options[0] ?? {};
    const limits = { shadowRadius: options.shadowRadius ?? 12, shadowOpacity: options.shadowOpacity ?? 0.2, elevation: options.elevation ?? 6 };
    const blurLimit = options.blur ?? 24;

    return {
      Property(node) {
        const key = keyName(node);
        if (key in limits) {
          const value = numberValue(node.value);
          if (value !== null && value > limits[key] && inStyleContext(node, options.styleFunctions)) {
            context.report({ node: node.value, messageId: 'shadow', data: { key, value, limit: limits[key] } });
          }
        } else if (key === 'boxShadow') {
          // "0 8px 40px rgba(...)": the third length is the blur.
          const value = stringValue(node.value);
          const lengths = value?.match(/-?\d+(?:\.\d+)?(?:px)?/g) ?? [];
          const blur = lengths.length >= 3 ? parseFloat(lengths[2]) : 0;
          if (blur > blurLimit && inStyleContext(node, options.styleFunctions)) {
            context.report({ node: node.value, messageId: 'shadow', data: { key, value, limit: `${blurLimit}px blur` } });
          }
        }
      },
    };
  },
};
