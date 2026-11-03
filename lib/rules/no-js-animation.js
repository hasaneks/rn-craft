'use strict';

const { calleeName, isFunction, keyName, meta, walk } = require('../utils');

const DRIVEN = new Set(['Animated.timing', 'Animated.spring', 'Animated.decay', 'Animated.event']);
const JS_PACKAGES = new Set(['react-native-animatable', 'react-spring', '@react-spring/native', 'react-native-motion']);

function nativeDriver(config) {
  if (!config) return 'missing';
  if (config.type !== 'ObjectExpression') return 'unknown';
  const property = config.properties.find((item) => keyName(item) === 'useNativeDriver');
  if (!property) return 'missing';
  return property.value.type === 'Literal' && property.value.value === true ? 'native' : property.value.type === 'Literal' ? 'js' : 'unknown';
}

module.exports = {
  meta: meta('no-js-animation', {
    description: 'Animations run on the UI thread (Reanimated, or Animated with the native driver); a JS-thread animation stutters whenever JS is busy.',
    messages: {
      driver: '{{api}} runs on the JS thread ({{state}}). Set useNativeDriver: true, or move it to Reanimated.',
      legacy: 'Animated from react-native: use Reanimated (useSharedValue + useAnimatedStyle), which runs on the UI thread and supports layout animations.',
      frame: 'requestAnimationFrame calls {{setter}}(): a frame-by-frame animation through React state. Use a Reanimated shared value.',
      package: '"{{source}}" animates on the JS thread. Use Reanimated.',
    },
    schema: [{ type: 'object', additionalProperties: false, properties: { allowAnimatedApi: { type: 'boolean' } } }],
  }),
  create(context) {
    // With allowAnimatedApi: false (the strict default), any Animated import is reported, native driver or not.
    const allowAnimatedApi = context.options[0]?.allowAnimatedApi ?? true;
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (JS_PACKAGES.has(source)) context.report({ node, messageId: 'package', data: { source } });
        if (!allowAnimatedApi && source === 'react-native') {
          const animated = node.specifiers.find((item) => item.type === 'ImportSpecifier' && item.imported.name === 'Animated');
          if (animated) context.report({ node: animated, messageId: 'legacy' });
        }
      },
      CallExpression(node) {
        const name = calleeName(node);
        if (DRIVEN.has(name)) {
          const state = nativeDriver(node.arguments[1]);
          if (state === 'missing' || state === 'js') {
            context.report({ node, messageId: 'driver', data: { api: name, state: state === 'missing' ? 'useNativeDriver is not set' : 'useNativeDriver: false' } });
          }
          return;
        }
        if (name === 'requestAnimationFrame' && isFunction(node.arguments[0])) {
          let setter = null;
          walk(node.arguments[0].body, (child) => {
            if (child.type === 'CallExpression' && child.callee.type === 'Identifier' && /^set[A-Z]/.test(child.callee.name)) setter = child.callee.name;
          });
          // One deferred state update is fine; a loop that schedules itself again is an animation.
          let loops = false;
          walk(node.arguments[0].body, (child) => {
            if (child.type === 'CallExpression' && calleeName(child) === 'requestAnimationFrame') loops = true;
          });
          if (setter && loops) context.report({ node, messageId: 'frame', data: { setter } });
        }
      },
    };
  },
};
