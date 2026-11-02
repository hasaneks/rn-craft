'use strict';

const { inStyleContext, keyName, meta, stringValue } = require('../utils');

const COLOR = /^(?:#[0-9a-f]{3,8}|(?:rgb|rgba|hsl|hsla|hwb|oklch)\(.*\))$/i;
const KEEP = new Set(['transparent', 'currentColor', 'inherit']);
const COLOR_PROPS = new Set(['color', 'tintColor', 'placeholderTextColor', 'selectionColor', 'cursorColor', 'underlineColorAndroid', 'fill', 'stroke', 'stopColor', 'thumbColor', 'backgroundColor']);

module.exports = {
  meta: meta('no-raw-colors', {
    description: 'Colours come from theme tokens, so dark mode and the brand stay in one place.',
    messages: {
      raw: '{{key}}: "{{value}}" is a raw colour. Use a theme token; it is what makes dark mode work.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: { allow: { type: 'array', items: { type: 'string' } }, styleFunctions: { type: 'array', items: { type: 'string' } } },
      },
    ],
  }),
  create(context) {
    const options = context.options[0] ?? {};
    const allow = new Set((options.allow ?? []).map((value) => value.toLowerCase()));
    const isRaw = (value) => value !== null && !KEEP.has(value) && COLOR.test(value.trim()) && !allow.has(value.trim().toLowerCase());

    return {
      Property(node) {
        const key = keyName(node);
        if (!key || !/colou?r$/i.test(key)) return;
        const value = stringValue(node.value);
        if (isRaw(value) && inStyleContext(node, options.styleFunctions)) {
          context.report({ node: node.value, messageId: 'raw', data: { key, value } });
        }
      },
      JSXAttribute(node) {
        if (!COLOR_PROPS.has(node.name.name) || !node.value) return;
        const value = node.value.type === 'Literal' ? stringValue(node.value) : node.value.type === 'JSXExpressionContainer' ? stringValue(node.value.expression) : null;
        // `color="#..."` on an icon or an SVG path is the same raw colour as in a style.
        if (isRaw(value)) {
          context.report({ node: node.value, messageId: 'raw', data: { key: node.name.name, value } });
        }
      },
    };
  },
};
