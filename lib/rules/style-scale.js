'use strict';

const { RADIUS_KEYS, SPACING_KEYS, inStyleContext, keyName, meta, numberValue } = require('../utils');

const DEFAULTS = {
  // A 4 pt grid, with 1 and 2 for hairlines and tight icon gaps.
  spacingGrid: 4,
  spacingExtra: [0, 1, 2],
  radius: [0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 999, 9999],
  // iOS text styles plus common display sizes.
  fontSize: [11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 28, 32, 34, 40, 48, 56, 64],
  requireTokens: false,
  styleFunctions: [],
};

module.exports = {
  meta: meta('style-scale', {
    description: 'Spacing, radius and font size come from one scale (or from theme tokens).',
    messages: {
      spacing: '{{key}}: {{value}} is off the {{grid}} pt grid. Use the spacing scale.',
      radius: '{{key}}: {{value}} is not on the radius scale ({{scale}}).',
      fontSize: 'fontSize: {{value}} is not on the type scale ({{scale}}).',
      token: '{{key}}: {{value}} is a raw number. Use a theme token ({{kind}}).',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          spacingGrid: { type: 'number' },
          spacingExtra: { type: 'array', items: { type: 'number' } },
          radius: { type: 'array', items: { type: 'number' } },
          fontSize: { type: 'array', items: { type: 'number' } },
          requireTokens: {
            oneOf: [
              { type: 'boolean' },
              { type: 'array', items: { enum: ['spacing', 'radius', 'fontSize'] } },
            ],
          },
          allowValues: { type: 'array', items: { type: 'number' } },
          styleFunctions: { type: 'array', items: { type: 'string' } },
        },
      },
    ],
  }),
  create(context) {
    const options = { ...DEFAULTS, ...context.options[0] };
    const tokenKinds = options.requireTokens === true ? ['spacing', 'radius', 'fontSize'] : options.requireTokens || [];
    const allowed = new Set(options.allowValues ?? [0]);

    return {
      Property(node) {
        const key = keyName(node);
        if (!key) return;
        const kind = SPACING_KEYS.has(key) ? 'spacing' : RADIUS_KEYS.has(key) ? 'radius' : key === 'fontSize' ? 'fontSize' : null;
        if (!kind) return;
        const value = numberValue(node.value);
        if (value === null || !inStyleContext(node, options.styleFunctions)) return;

        if (tokenKinds.includes(kind)) {
          if (!allowed.has(value)) context.report({ node: node.value, messageId: 'token', data: { key, value, kind } });
          return;
        }
        const size = Math.abs(value);
        if (kind === 'spacing' && size % options.spacingGrid !== 0 && !options.spacingExtra.includes(size)) {
          context.report({ node: node.value, messageId: 'spacing', data: { key, value, grid: options.spacingGrid } });
        } else if (kind === 'radius' && !options.radius.includes(size)) {
          context.report({ node: node.value, messageId: 'radius', data: { key, value, scale: options.radius.join(', ') } });
        } else if (kind === 'fontSize' && !options.fontSize.includes(size)) {
          context.report({ node: node.value, messageId: 'fontSize', data: { value, scale: options.fontSize.join(', ') } });
        }
      },
    };
  },
};
