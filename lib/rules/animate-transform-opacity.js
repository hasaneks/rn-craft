'use strict';

const { SPACING_KEYS, calleeName, isFunction, keyName, meta, numberValue, walk } = require('../utils');

const LAYOUT = new Set(['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'top', 'left', 'right', 'bottom', 'start', 'end', 'flex', 'flexBasis', 'flexGrow', 'fontSize', ...SPACING_KEYS]);

module.exports = {
  meta: meta('animate-transform-opacity', {
    description: 'Animations move transform and opacity; animating layout props re-runs layout on every frame.',
    messages: {
      layout: 'useAnimatedStyle animates {{key}}, which re-runs layout every frame. Animate transform (translate/scale) or opacity, or use a layout animation (entering/exiting/LinearTransition).',
    },
    schema: [{ type: 'object', additionalProperties: false, properties: { allow: { type: 'array', items: { type: 'string' } } } }],
  }),
  create(context) {
    const allow = new Set(context.options[0]?.allow ?? []);
    return {
      CallExpression(node) {
        if (!/^(?:Reanimated\.)?useAnimatedStyle$/.test(calleeName(node)) || !isFunction(node.arguments[0])) return;
        walk(node.arguments[0].body, (child) => {
          if (child.type !== 'Property') return;
          const key = keyName(child);
          // A constant (width: 40) is not animated; only computed values are.
          if (key && LAYOUT.has(key) && !allow.has(key) && numberValue(child.value) === null && child.value.type !== 'Literal') {
            context.report({ node: child, messageId: 'layout', data: { key } });
          }
        });
      },
    };
  },
};
