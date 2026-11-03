'use strict';

const { LIST_COMPONENTS, elementName, isFunction, meta } = require('../utils');

// Only the callbacks that render: a new keyExtractor or getItemLayout costs nothing visible.
const CALLBACKS = new Set(['renderItem', 'renderSectionHeader', 'renderSectionFooter']);
const COMPONENT_PROPS = new Set(['ItemSeparatorComponent', 'ListHeaderComponent', 'ListFooterComponent', 'ListEmptyComponent', 'CellRendererComponent', 'SectionSeparatorComponent']);

module.exports = {
  meta: meta('stable-list-callbacks', {
    description: 'List callbacks and slot components are stable references, so rows are not re-rendered or remounted on every parent render.',
    messages: {
      callback: '{{prop}} is a new function on every render of this component, so every visible row re-renders. Hoist it or wrap it in useCallback.',
      component: '{{prop}} is an inline component: a new component type every render, so it unmounts and remounts. Pass an element (<Header />) or a component defined outside.',
      viewable: 'onViewableItemsChanged must not change after mount (the list throws). Keep it in a ref or a stable useCallback with no deps.',
    },
    schema: [{ type: 'object', additionalProperties: false, properties: { components: { type: 'array', items: { type: 'string' } } } }],
  }),
  create(context) {
    const lists = new Set([...LIST_COMPONENTS, ...(context.options[0]?.components ?? [])]);
    return {
      JSXAttribute(node) {
        const element = node.parent;
        if (!lists.has(elementName(element.name))) return;
        const prop = node.name.name;
        const value = node.value?.type === 'JSXExpressionContainer' ? node.value.expression : null;
        if (!isFunction(value)) return;
        if (COMPONENT_PROPS.has(prop)) context.report({ node, messageId: 'component', data: { prop } });
        else if (prop === 'onViewableItemsChanged') context.report({ node, messageId: 'viewable' });
        else if (CALLBACKS.has(prop)) context.report({ node, messageId: 'callback', data: { prop } });
      },
    };
  },
};
