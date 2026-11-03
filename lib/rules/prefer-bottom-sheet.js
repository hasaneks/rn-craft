'use strict';

const { attribute, elementName, meta, stringValue, walk } = require('../utils');

const SHEET_STYLES = new Set(['pageSheet', 'formSheet']);
const MODAL_SOURCES = new Set(['react-native', 'react-native-modal']);

module.exports = {
  meta: meta('prefer-bottom-sheet', {
    description: 'Mobile tasks open in a bottom sheet, a pushed screen or a native alert; a centered modal card is a web pattern.',
    messages: {
      modal: '<{{name}}> from "{{source}}" draws a web-style modal. Use a bottom sheet for a short task, push a screen for a long one, or a native alert / action sheet for a choice.',
    },
    schema: [{ type: 'object', additionalProperties: false, properties: { sources: { type: 'array', items: { type: 'string' } } } }],
  }),
  create(context) {
    const sources = new Set([...MODAL_SOURCES, ...(context.options[0]?.sources ?? [])]);
    const imported = new Map();
    return {
      ImportDeclaration(node) {
        if (!sources.has(node.source.value)) return;
        for (const specifier of node.specifiers) {
          const isModal = specifier.type === 'ImportDefaultSpecifier'
            ? node.source.value !== 'react-native'
            : specifier.type === 'ImportSpecifier' && specifier.imported.name === 'Modal';
          if (isModal) imported.set(specifier.local.name, node.source.value);
        }
      },
      JSXOpeningElement(node) {
        const name = elementName(node.name);
        if (!imported.has(name) || node.name.type !== 'JSXIdentifier') return;
        // iOS's native page/form sheet is already a sheet, also when chosen per platform.
        const style = attribute(node, 'presentationStyle');
        let sheet = false;
        if (style?.value) {
          walk(style.value, (child) => {
            if (SHEET_STYLES.has(stringValue(child))) sheet = true;
          });
        }
        if (sheet) return;
        context.report({ node, messageId: 'modal', data: { name, source: imported.get(name) } });
      },
    };
  },
};
