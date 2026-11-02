'use strict';

const { meta, resolveFunction, walk } = require('../utils');

const FREQUENT = new Set(['onScroll', 'onGestureEvent', 'onPanResponderMove']);

module.exports = {
  meta: meta('no-scroll-setstate', {
    description: 'Per-frame events (scroll, gestures) drive animations on the UI thread, not React state.',
    messages: {
      setState: '{{prop}} calls {{setter}}() on every frame, re-rendering this screen while it scrolls. Use a Reanimated shared value (useAnimatedScrollHandler) or set state only when a threshold is crossed.',
    },
    schema: [],
  }),
  create(context) {
    return {
      JSXAttribute(node) {
        const prop = node.name.name;
        if (!FREQUENT.has(prop)) return;
        const value = node.value?.type === 'JSXExpressionContainer' ? node.value.expression : null;
        const fn = resolveFunction(context, value);
        if (!fn) return;
        let setter = null;
        walk(fn.body, (child) => {
          if (setter) return false;
          if (child.type === 'CallExpression' && child.callee.type === 'Identifier' && /^set[A-Z]/.test(child.callee.name)) setter = child.callee.name;
          // A guarded call (if (y > 120 && !shown) setShown(true)) is the accepted threshold pattern.
          if (child.type === 'IfStatement' || child.type === 'ConditionalExpression' || child.type === 'LogicalExpression') return false;
        });
        if (setter) context.report({ node, messageId: 'setState', data: { prop, setter } });
      },
    };
  },
};
