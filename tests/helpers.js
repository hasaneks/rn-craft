'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

/** run('style-scale', { valid, invalid }) where invalid entries are [code, messageIds] or [code, messageIds, options]. */
function run(id, { valid, invalid }) {
  const rule = require(`../lib/rules/${id}`);
  tester.run(id, rule, {
    valid: valid.map((item) => (typeof item === 'string' ? { code: item } : { code: item[0], options: item[1] })),
    invalid: invalid.map(([code, ids, options]) => ({
      code,
      ...(options ? { options } : {}),
      errors: (Array.isArray(ids) ? ids : [ids]).map((messageId) => ({ messageId })),
    })),
  });
}

module.exports = { run };
