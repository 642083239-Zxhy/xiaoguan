import test from 'node:test';
import assert from 'node:assert/strict';

import { sendMessageToAI } from '../src/services/api.js';

const createStorage = () => {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    key: index => [...values.keys()][index] ?? null,
    get length() { return values.size; }
  };
};

test('规则报价提升到响应顶层供数据库同步使用', async () => {
  globalThis.localStorage = createStorage();
  globalThis.sessionStorage = createStorage();

  const response = await sendMessageToAI('L1 300元可以吗', [], {});

  assert.equal(response.intent, 'bargain');
  assert.ok(response.quote?.quoteVersion);
  assert.equal(response.quote, response.data.quote);
  assert.equal(response.quote.priceType, 'rejected_offer');
});
