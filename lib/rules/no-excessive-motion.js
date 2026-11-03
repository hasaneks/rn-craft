'use strict';

const { calleeName, keyName, meta, numberValue } = require('../utils');

// Reanimated presets that draw attention to themselves rather than explain a change.
const SHOWY = /^(Bounce|Roll|LightSpeed|Pinwheel|Flip|Rotate|Stretch|Zoom(?:In|Out)(?:Rotate|Easy))\w*$/;
const SHOWY_EASING = new Set(['bounce', 'elastic', 'back']);

function configNumber(config, key) {
  if (config?.type !== 'ObjectExpression') return null;
  const property = config.properties.find((item) => keyName(item) === key);
  return property ? numberValue(property.value) : null;
}

/** The identifier a builder chain starts from: FadeIn.duration(300).delay(50) → FadeIn. */
function chainRoot(node) {
  let current = node;
  while (current) {
    if (current.type === 'CallExpression') current = current.callee;
    else if (current.type === 'MemberExpression') current = current.object;
    else if (current.type === 'NewExpression') current = current.callee;
    else break;
  }
  return current?.type === 'Identifier' ? current.name : null;
}

module.exports = {
  meta: meta('no-excessive-motion', {
    description: 'Motion explains a change and gets out of the way: short, no bounce, no endless loops outside loading and live indicators.',
    messages: {
      duration: 'A {{value}} ms animation feels slow. Keep interface motion at {{max}} ms or less (150-300 ms for most transitions).',
      loop: 'This animation repeats forever. Loop only loading or live indicators, and stop it when reduced motion is on.',
      bouncy: 'A bouncy spring (damping {{value}}) overshoots and wobbles. Use damping 15-30, or a timing curve.',
      easing: 'Easing.{{name}} overshoots for show. Use Easing.out(Easing.cubic) or the platform curve.',
      preset: '{{name}} is a showy entrance. Use FadeIn / FadeInDown / SlideIn with a short duration.',
    },
    schema: [{ type: 'object', additionalProperties: false, properties: { maxDuration: { type: 'number' }, minDamping: { type: 'number' } } }],
  }),
  create(context) {
    const options = context.options[0] ?? {};
    const maxDuration = options.maxDuration ?? 400;
    const minDamping = options.minDamping ?? 10;

    function checkDuration(node, value) {
      if (value !== null && value > maxDuration) context.report({ node, messageId: 'duration', data: { value, max: maxDuration } });
    }

    return {
      CallExpression(node) {
        const name = calleeName(node);
        const last = name.split('.').pop();
        if (last === 'withTiming' || name === 'Animated.timing') {
          checkDuration(node, configNumber(node.arguments[1], 'duration'));
        } else if (last === 'withSpring' || name === 'Animated.spring') {
          const damping = configNumber(node.arguments[1], 'damping');
          if (damping !== null && damping < minDamping) context.report({ node, messageId: 'bouncy', data: { value: damping } });
        } else if (last === 'withRepeat') {
          const count = numberValue(node.arguments[1]);
          const infinite = node.arguments[1] === undefined || (count !== null && count <= 0) || node.arguments[1]?.name === 'Infinity';
          if (infinite) context.report({ node, messageId: 'loop' });
        } else if (name === 'Animated.loop') {
          if (configNumber(node.arguments[1], 'iterations') === null) context.report({ node, messageId: 'loop' });
        } else if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'duration') {
          // Layout animation builders: FadeIn.duration(800)
          const root = chainRoot(node.callee.object);
          if (root && /^[A-Z]/.test(root)) checkDuration(node, numberValue(node.arguments[0]));
        }
      },
      MemberExpression(node) {
        if (node.object.type === 'Identifier' && node.object.name === 'Easing' && SHOWY_EASING.has(node.property.name)) {
          context.report({ node, messageId: 'easing', data: { name: node.property.name } });
        }
      },
      JSXAttribute(node) {
        if (!['entering', 'exiting'].includes(node.name.name) || node.value?.type !== 'JSXExpressionContainer') return;
        const root = chainRoot(node.value.expression);
        if (root && SHOWY.test(root)) context.report({ node, messageId: 'preset', data: { name: root } });
      },
    };
  },
};
