'use strict';

const { calleeName, isFunction, meta, walk } = require('../utils');

const NEW_COLLECTION = new Set(['map', 'filter', 'slice', 'concat', 'reduce', 'sort', 'toSorted', 'flatMap', 'entries', 'keys', 'values']);

function returned(fn) {
  if (fn.body.type !== 'BlockStatement') return fn.body;
  return fn.body.body.find((statement) => statement.type === 'ReturnStatement')?.argument ?? null;
}

/** Why a selector result is a new reference on every call, or null. */
function freshResult(fn) {
  const result = returned(fn);
  if (!result) return null;
  if (result.type === 'Identifier' && fn.params[0]?.type === 'Identifier' && result.name === fn.params[0].name) return 'whole';
  if (result.type === 'ObjectExpression') return 'object';
  if (result.type === 'ArrayExpression') return 'array';
  let derived = false;
  walk(result, (child) => {
    if (child.type === 'CallExpression' && child.callee.type === 'MemberExpression' && NEW_COLLECTION.has(child.callee.property.name)) derived = true;
    if (child.type === 'CallExpression' && /^Object\.(keys|values|entries|assign|fromEntries)$/.test(calleeName(child))) derived = true;
  }, { skipFunctions: true });
  return derived ? 'derived' : null;
}

module.exports = {
  meta: meta('store-selector', {
    description: 'Components subscribe to the smallest slice of a store, and selectors return stable references.',
    messages: {
      whole: '{{hook}} selects the whole store, so this component re-renders on every change anywhere in it. Select only the fields you use.',
      noSelector: '{{hook}}() without a selector subscribes to the whole store. Pass a selector: {{hook}}((s) => s.field).',
      object: '{{hook}} returns a new {{kind}} every time, so it re-renders on every store change. Select fields one by one, or pass shallowEqual / wrap in useShallow.',
      derived: '{{hook}} builds a new collection (map/filter/...) on every store change, so it always re-renders. Use a memoized selector (createSelector) or select the raw data and useMemo.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          selectorHooks: { type: 'array', items: { type: 'string' } },
          storeHookPattern: { type: 'string' },
        },
      },
    ],
  }),
  create(context) {
    const options = context.options[0] ?? {};
    const selectorHooks = new Set(options.selectorHooks ?? ['useSelector', 'useAppSelector', 'useTypedSelector', 'useRootSelector']);
    const storeHook = new RegExp(options.storeHookPattern ?? '^use[A-Z]\\w*Store$');

    return {
      CallExpression(node) {
        const hook = node.callee.type === 'Identifier' ? node.callee.name : null;
        if (!hook) return;
        const isSelectorHook = selectorHooks.has(hook);
        const isStoreHook = storeHook.test(hook);
        if (!isSelectorHook && !isStoreHook) return;

        const [selector, equality] = node.arguments;
        if (!selector) {
          if (isStoreHook) context.report({ node, messageId: 'noSelector', data: { hook } });
          return;
        }
        // useShallow((s) => ({...})) and an explicit equality function both make a fresh object fine.
        if (equality || !isFunction(selector)) return;
        const fresh = freshResult(selector);
        if (fresh === 'whole') context.report({ node: selector, messageId: 'whole', data: { hook } });
        else if (fresh === 'object' || fresh === 'array') context.report({ node: selector, messageId: 'object', data: { hook, kind: fresh } });
        else if (fresh === 'derived') context.report({ node: selector, messageId: 'derived', data: { hook } });
      },
    };
  },
};
