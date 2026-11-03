'use strict';

const { calleeName, meta } = require('../utils');

// Pictographs, minus the text symbols that share the property (©, ®, ™, ‼, ⁉, digits with keycaps).
const EMOJI = /(?![©®™‼⁉])\p{Extended_Pictographic}/u;

module.exports = {
  meta: meta('no-emoji', {
    description: 'Icons come from the icon set; emoji in interface text render differently on every OS and read as generated.',
    messages: {
      emoji: 'Emoji "{{emoji}}" in interface text. Use an icon from the icon set, or no decoration.',
    },
    schema: [],
  }),
  create(context) {
    function check(node, text) {
      const match = EMOJI.exec(text);
      if (match) context.report({ node, messageId: 'emoji', data: { emoji: match[0] } });
    }
    function isLogging(node) {
      for (let current = node.parent; current && current.type !== 'Program'; current = current.parent) {
        if (current.type === 'CallExpression' && /^(console|logger|log|Sentry)\./.test(calleeName(current))) return true;
      }
      return false;
    }
    return {
      JSXText(node) {
        check(node, node.value);
      },
      Literal(node) {
        if (typeof node.value === 'string' && node.parent.type !== 'ImportDeclaration' && !isLogging(node)) check(node, node.value);
      },
      TemplateElement(node) {
        if (!isLogging(node)) check(node, node.value.cooked ?? '');
      },
    };
  },
};
