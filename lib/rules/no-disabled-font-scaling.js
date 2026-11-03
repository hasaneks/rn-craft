'use strict';

const { meta } = require('../utils');

module.exports = {
  meta: meta('no-disabled-font-scaling', {
    description: 'Text follows the system text size (Dynamic Type, Android font scale); cap it, do not switch it off.',
    messages: {
      disabled: 'allowFontScaling={false} ignores the reader\'s text size. Use maxFontSizeMultiplier (e.g. 1.3) where space is tight.',
    },
    schema: [],
  }),
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== 'allowFontScaling') return;
        if (node.value?.type === 'JSXExpressionContainer' && node.value.expression.type === 'Literal' && node.value.expression.value === false) {
          context.report({ node, messageId: 'disabled' });
        }
      },
      Property(node) {
        // Text.defaultProps.allowFontScaling = false, or { allowFontScaling: false } in a props object.
        if (node.key?.name === 'allowFontScaling' && node.value.type === 'Literal' && node.value.value === false) {
          context.report({ node, messageId: 'disabled' });
        }
      },
      AssignmentExpression(node) {
        const left = node.left;
        if (left.type === 'MemberExpression' && left.property.name === 'allowFontScaling' && node.right.type === 'Literal' && node.right.value === false) {
          context.report({ node, messageId: 'disabled' });
        }
      },
    };
  },
};
