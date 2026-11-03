'use strict';

const { PRESSABLES, attribute, elementName, hasSpread, meta } = require('../utils');

const NAMES = ['accessibilityLabel', 'aria-label', 'aria-labelledby', 'accessibilityLabelledBy'];

module.exports = {
  meta: meta('pressable-name', {
    description: 'A pressable without visible text has an accessibilityLabel, so VoiceOver and TalkBack can say what it does.',
    messages: {
      unnamed: '<{{name}}> has no text and no accessibilityLabel. Screen readers will announce it as "button".',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          components: { type: 'array', items: { type: 'string' } },
          textComponents: { type: 'array', items: { type: 'string' } },
          labelProps: { type: 'array', items: { type: 'string' } },
        },
      },
    ],
  }),
  create(context) {
    const options = context.options[0] ?? {};
    const pressables = new Set([...PRESSABLES, ...(options.components ?? [])]);
    const textComponents = new Set(['Text', ...(options.textComponents ?? [])]);
    const labelProps = [...NAMES, ...(options.labelProps ?? [])];

    function hasText(children) {
      return children.some((child) => {
        if (child.type === 'JSXText') return child.value.trim() !== '';
        // `{label}` or `{t('save')}` may well be text; give it the benefit of the doubt.
        if (child.type === 'JSXExpressionContainer') return child.expression.type !== 'JSXEmptyExpression';
        if (child.type === 'JSXFragment') return hasText(child.children);
        if (child.type === 'JSXElement') {
          if (textComponents.has(elementName(child.openingElement.name))) return true;
          if (labelProps.some((prop) => attribute(child.openingElement, prop))) return true;
          return hasText(child.children);
        }
        return false;
      });
    }

    return {
      JSXElement(node) {
        const opening = node.openingElement;
        const name = elementName(opening.name);
        if (!pressables.has(name) || hasSpread(opening)) return;
        if (labelProps.some((prop) => attribute(opening, prop))) return;
        const accessible = attribute(opening, 'accessible');
        if (accessible?.value?.expression?.value === false) return;
        if (!hasText(node.children)) context.report({ node: opening, messageId: 'unnamed', data: { name } });
      },
    };
  },
};
