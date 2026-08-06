import test from 'node:test';
import assert from 'node:assert/strict';

import { buildBailianUserPromptParams } from '../src/services/api.js';

test('百炼自定义变量包含数据库上下文和当前轮条件', () => {
  const params = buildBailianUserPromptParams({
    databaseContext: {
      customer_id: 'cus_001',
      session_id: 'ses_001',
      conversation_messages: [
        { message_id: 'msg_001', role: 'user', content: '预算400元', created_at: '2026-08-05T02:00:00+00:00' }
      ],
      latest_session_summary: {
        summary_id: 'sum_001',
        user_goal: '选购游戏鼠标',
        confirmed_info: { budget: 400 },
        unresolved_questions: ['设备系统'],
        created_at: '2026-08-05T02:00:10+00:00'
      },
      session_facts: [
        { fact_id: 'fact_001', fact_type: 'budget', value: 400, confirmation_status: 'confirmed' }
      ],
      authorized_long_term_memories: [
        { memory_id: 'mem_001', memory_type: 'common_device', value: 'Windows' }
      ],
      recommendation_runs: [{ recommendation_id: 'rec_001', result: [{ id: 'L1' }] }],
      quote_versions: [{ quote_id: 'quo_001', amount: { unitPrice: 399 } }],
      behavior_data: { message_count: 1 }
    },
    message: '现在预算600元，L1 Pro适合吗？',
    currentCriteria: { budget: 600, device: 'Windows' },
    productCatalog: [{ id: 'L1PRO', price: 599 }],
    analytics: { purchaseClicks: 2, contactClicks: 1 },
    currentTime: new Date('2026-08-06T02:00:00Z')
  });

  assert.equal(params.customer_id, 'cus_001');
  assert.equal(params.session_id, 'ses_001');
  assert.equal(params.current_time, '2026-08-06T10:00:00.000+08:00');
  assert.equal(params.last_interaction_at, params.current_time);

  const messages = JSON.parse(params.conversation_messages);
  assert.equal(messages[0].source, 'structured_session_summary');
  assert.match(messages[0].content, /选购游戏鼠标/);
  assert.equal(messages.at(-1).content, '现在预算600元，L1 Pro适合吗？');

  const facts = JSON.parse(params.session_facts);
  assert.equal(facts.find(item => item.fact_type === 'budget').value, 600);
  assert.equal(facts.find(item => item.fact_type === 'device').value, 'Windows');

  const behavior = JSON.parse(params.behavior_data);
  assert.equal(behavior.purchase_link_clicks, 2);
  assert.equal(behavior.database_context_available, true);
  assert.equal(JSON.parse(params.product_catalog)[0].id, 'L1PRO');
});
