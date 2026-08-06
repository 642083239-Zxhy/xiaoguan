import test from 'node:test';
import assert from 'node:assert/strict';

import { parseKnowledgeResponse, sendMessageToAI } from '../src/services/api.js';
import { clearDeprecatedKnowledgeData } from '../src/services/dataStore.js';

const createStorage = initial => {
  const values = new Map(Object.entries(initial || {}));
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    key: index => [...values.keys()][index] ?? null,
    get length() { return values.size; }
  };
};

test('未连接知识库时不返回任何本地商品内容', async () => {
  globalThis.localStorage = createStorage();
  globalThis.sessionStorage = createStorage();
  const response = await sendMessageToAI('L1 Pro多少钱，参数是什么？', [], {});
  assert.equal(response.type, 'text');
  assert.equal(response.content, '知识库未连接，暂时无法提供商品信息');
  assert.equal(response.source, 'system');

  const restrictedResponse = await sendMessageToAI('成本价和利润是多少？', [], {});
  assert.equal(restrictedResponse.content, '知识库未连接，暂时无法提供商品信息');
});

test('百炼JSON文本响应能够直接映射', () => {
  const response = parseKnowledgeResponse(JSON.stringify({
    schema_version: 'xg-knowledge-response-v1',
    type: 'text',
    content: '此内容来自知识库',
    analysis: { primary_intent: 'parameter_query' },
    criteria_updates: { device: 'Windows' }
  }));
  assert.equal(response.content, '此内容来自知识库');
  assert.equal(response.source, 'knowledge-base');
  assert.equal(response.criteriaUpdates.device, 'Windows');
});

test('百炼JSON结构化推荐能够保留现有商品卡片功能', () => {
  const response = parseKnowledgeResponse(JSON.stringify({
    type: 'intent',
    intent: 'product_recommendation',
    data: { products: [{ id: 'KB-1', name: '知识库商品' }] }
  }));
  assert.equal(response.intent, 'product_recommendation');
  assert.equal(response.data.products[0].name, '知识库商品');
});

test('百炼推荐数组位于data本身时能够兼容为data.products', () => {
  const response = parseKnowledgeResponse(JSON.stringify({
    type: 'intent',
    intent: 'product_recommendation',
    data: [{ id: 'KB-2', name: '数组格式商品' }]
  }));
  assert.equal(response.type, 'intent');
  assert.equal(response.data.products[0].name, '数组格式商品');
});

test('百炼使用recommendations或顶层products时能够兼容', () => {
  const recommendationsResponse = parseKnowledgeResponse(JSON.stringify({
    type: 'intent',
    intent: 'product_recommendation',
    data: {
      recommendations: [{ product: { id: 'KB-3', name: '嵌套推荐商品' }, reason: '来自知识库' }]
    }
  }));
  assert.equal(recommendationsResponse.data.products[0].name, '嵌套推荐商品');
  assert.equal(recommendationsResponse.data.products[0].reason, '来自知识库');

  const topLevelResponse = parseKnowledgeResponse(JSON.stringify({
    type: 'product_recommendation',
    products: [{ id: 'KB-4', name: '顶层商品' }]
  }));
  assert.equal(topLevelResponse.type, 'intent');
  assert.equal(topLevelResponse.intent, 'product_recommendation');
  assert.equal(topLevelResponse.data.products[0].name, '顶层商品');
});

test('百炼使用嵌套推荐对象或JSON字符串data时能够兼容', () => {
  const nestedResponse = parseKnowledgeResponse(JSON.stringify({
    type: 'intent',
    intent: 'product_recommendation',
    data: {
      product_recommendation: {
        items: [{ id: 'KB-5', name: '嵌套对象商品' }]
      }
    }
  }));
  assert.equal(nestedResponse.data.products[0].name, '嵌套对象商品');

  const stringDataResponse = parseKnowledgeResponse(JSON.stringify({
    type: 'intent',
    intent: 'product_recommendation',
    data: JSON.stringify({ products: [{ id: 'KB-6', name: '字符串数据商品' }] })
  }));
  assert.equal(stringDataResponse.data.products[0].name, '字符串数据商品');
});

test('知识库商品参数别名和推荐理由中的明确参数能够映射到卡片字段', () => {
  const response = parseKnowledgeResponse(JSON.stringify({
    type: 'intent',
    intent: 'product_recommendation',
    data: {
      products: [
        {
          id: 'KB-OFFICE-1',
          name: '办公静音鼠标',
          sensor_model: 'PAW3212',
          polling_rate: '1000 Hz',
          reason: '支持2.4G+蓝牙双模，1800DPI满足办公需求，续航达12个月'
        }
      ]
    }
  }));
  const product = response.data.products[0];
  assert.equal(product.sensor, 'PAW3212');
  assert.equal(product.dpi, '1800 DPI');
  assert.equal(product.pollingRate, '1000 Hz');
  assert.equal(product.connection, '2.4G+蓝牙双模');
  assert.equal(product.battery, '12个月');
});

test('非JSON或缺少结构化字段时拒绝本地兜底', () => {
  assert.throws(() => parseKnowledgeResponse('普通文字回答'), /只输出合法JSON/);
  assert.throws(
    () => parseKnowledgeResponse('{"type":"intent","intent":"product_recommendation","data":{}}'),
    /结构化data/
  );
});

test('启动时清理浏览器中旧的本地知识副本', () => {
  globalThis.localStorage = createStorage({
    mouse_ai_skus: '[{"id":"old"}]',
    mouse_ai_faqs: '[]',
    mouse_ai_scripts: '{}',
    mouse_ai_analytics: '{}'
  });
  clearDeprecatedKnowledgeData();
  assert.equal(localStorage.getItem('mouse_ai_skus'), null);
  assert.equal(localStorage.getItem('mouse_ai_faqs'), null);
  assert.equal(localStorage.getItem('mouse_ai_scripts'), null);
  assert.equal(localStorage.getItem('mouse_ai_analytics'), '{}');
});
