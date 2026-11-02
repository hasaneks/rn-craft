'use strict';

const { meta } = require('../utils');

module.exports = {
  meta: meta('use-shared-components', {
    description: 'Buttons, inputs and other controls come from the app\'s own components, so each element has one look.',
    messages: {
      raw: 'Use {{replacement}} instead of {{name}} from "{{source}}": one look per element lives in the shared component.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          // { "Pressable": "Button or IconButton", "TextInput": "Input" }
          components: { type: 'object', additionalProperties: { type: 'string' } },
          sources: { type: 'array', items: { type: 'string' } },
        },
      },
    ],
  }),
  create(context) {
    const options = context.options[0] ?? {};
    const components = options.components ?? {};
    const sources = new Set(options.sources ?? ['react-native', 'react-native-gesture-handler']);
    if (Object.keys(components).length === 0) return {};

    return {
      ImportDeclaration(node) {
        if (!sources.has(node.source.value)) return;
        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier') continue;
          const name = specifier.imported.name;
          if (components[name]) {
            context.report({ node: specifier, messageId: 'raw', data: { name, replacement: components[name], source: node.source.value } });
          }
        }
      },
    };
  },
};
