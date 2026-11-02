'use strict';

const { meta, stringValue } = require('../utils');

const COPY_PROPS = new Set(['title', 'label', 'placeholder', 'message', 'description', 'subtitle', 'accessibilityLabel', 'accessibilityHint', 'headerTitle', 'tabBarLabel']);

module.exports = {
  meta: meta('no-exclamation-copy', {
    description: 'Interface copy states things calmly; exclamation marks and cheering read as generated.',
    messages: {
      exclaim: 'Copy ends with "!": "{{text}}". Say it plainly.',
    },
    schema: [],
  }),
  create(context) {
    function check(node, text) {
      const trimmed = text.trim();
      // "!" alone or "!=" is code-ish, not copy.
      if (/\p{L}[^!]*!+$/u.test(trimmed) && trimmed.length > 2) {
        context.report({ node, messageId: 'exclaim', data: { text: trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed } });
      }
    }
    return {
      JSXText(node) {
        check(node, node.value);
      },
      JSXAttribute(node) {
        if (!COPY_PROPS.has(node.name.name) || !node.value) return;
        const text = node.value.type === 'Literal' ? stringValue(node.value) : node.value.type === 'JSXExpressionContainer' ? stringValue(node.value.expression) : null;
        if (text) check(node.value, text);
      },
    };
  },
};
