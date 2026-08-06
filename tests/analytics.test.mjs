import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateConversionMetrics } from '../src/services/dataStore.js';

test('转化率按去重会话计算并达到5%验收口径', () => {
  const sessions = Array.from({ length: 20 }, (_, index) => `session_${index + 1}`);
  const metrics = calculateConversionMetrics({
    purchaseClicks: 2,
    contactClicks: 1,
    sessions,
    convertedSessions: ['session_1', 'session_1', 'session_2']
  });

  assert.equal(metrics.sessionCount, 20);
  assert.equal(metrics.convertedSessionCount, 2);
  assert.equal(metrics.conversionRate, 10);
});

test('无效转化会话不会污染分母和分子', () => {
  const metrics = calculateConversionMetrics({
    sessions: ['session_1', 'session_1'],
    convertedSessions: ['unknown_session']
  });

  assert.equal(metrics.sessionCount, 1);
  assert.equal(metrics.convertedSessionCount, 0);
  assert.equal(metrics.conversionRate, 0);
});
