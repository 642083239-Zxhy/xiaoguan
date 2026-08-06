const API_ROOT = '/api/memory';
const EXTERNAL_REFERENCE_KEY = 'mouse_ai_external_reference';
const CUSTOMER_ID_KEY = 'mouse_ai_customer_id';
const SESSION_MAP_KEY = 'mouse_ai_memory_sessions';
const sessionPromises = new Map();

const request = async (path, options = {}) => {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `记忆服务请求失败（${response.status}）`);
  return payload;
};

const randomId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;

const getExternalReference = () => {
  let reference = localStorage.getItem(EXTERNAL_REFERENCE_KEY);
  if (!reference) {
    reference = `web_${randomId()}`;
    localStorage.setItem(EXTERNAL_REFERENCE_KEY, reference);
  }
  return reference;
};

const getSessionMap = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_MAP_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveSessionMap = map => localStorage.setItem(SESSION_MAP_KEY, JSON.stringify(map));

const ensureCustomer = async () => {
  const payload = await request('/customers', {
    method: 'POST',
    body: JSON.stringify({ external_reference: getExternalReference() })
  });
  localStorage.setItem(CUSTOMER_ID_KEY, payload.customer_id);
  return payload.customer_id;
};

export const initializeMemorySession = async (frontendSessionId) => {
  if (sessionPromises.has(frontendSessionId)) return sessionPromises.get(frontendSessionId);
  const task = (async () => {
    await request('/health');
    const customerId = await ensureCustomer();
    const map = getSessionMap();
    let sessionId = map[frontendSessionId];
    if (sessionId) {
      try {
        await request(`/sessions/${encodeURIComponent(sessionId)}/messages`);
      } catch {
        sessionId = '';
      }
    }
    if (!sessionId) {
      const payload = await request('/sessions', {
        method: 'POST',
        body: JSON.stringify({ customer_id: customerId, channel: 'web', retention_days: 7 })
      });
      sessionId = payload.session_id;
      map[frontendSessionId] = sessionId;
      saveSessionMap(map);
    }
    return { connected: true, customerId, sessionId };
  })();
  sessionPromises.set(frontendSessionId, task);
  try {
    return await task;
  } catch (error) {
    sessionPromises.delete(frontendSessionId);
    throw error;
  }
};

export const recordMemoryMessage = async (frontendSessionId, message) => {
  const { sessionId } = await initializeMemorySession(frontendSessionId);
  return request(`/sessions/${encodeURIComponent(sessionId)}/messages`, {
    method: 'POST',
    body: JSON.stringify(message)
  });
};

const saveFact = (sessionId, factType, value, confirmationStatus = 'confirmed') => request(
  `/sessions/${encodeURIComponent(sessionId)}/facts`,
  {
    method: 'POST',
    body: JSON.stringify({ fact_type: factType, value, confirmation_status: confirmationStatus })
  }
);

export const syncMemoryTurn = async ({ frontendSessionId, criteria, candidates, analysis, quote, summary }) => {
  const { sessionId } = await initializeMemorySession(frontendSessionId);
  const facts = [];
  if (analysis?.primary_intent) facts.push(['main_intent', analysis.primary_intent, 'expressed']);
  if (criteria?.budget != null) facts.push(['budget', criteria.budget, 'confirmed']);
  if (criteria?.device) facts.push(['device', criteria.device, 'confirmed']);
  if (criteria?.scene || criteria?.model) {
    facts.push(['preference', { scene: criteria.scene, model: criteria.model }, 'confirmed']);
  }
  if (candidates?.length) facts.push(['candidate_skus', candidates.map(item => item.id || item.sku || item.name), 'expressed']);
  await Promise.all(facts.map(([type, value, status]) => saveFact(sessionId, type, value, status)));
  if (analysis?.primary_intent === 'product_recommendation' && candidates?.length) {
    await request(`/sessions/${encodeURIComponent(sessionId)}/recommendations`, {
      method: 'POST',
      body: JSON.stringify({ result: candidates, knowledge_source_version: 'local-catalog-2026-08-05' })
    });
  }
  if (quote?.quoteVersion) {
    await request(`/sessions/${encodeURIComponent(sessionId)}/quotes`, {
      method: 'POST',
      body: JSON.stringify({ quote_version: quote.quoteVersion, amount: quote })
    });
  }
  if (summary) {
    await request(`/sessions/${encodeURIComponent(sessionId)}/summary`, {
      method: 'POST',
      body: JSON.stringify({ ...summary, knowledge_source_version: 'local-catalog-2026-08-05' })
    });
  }
};

export const getMemoryOverview = async (frontendSessionId) => {
  const identity = await initializeMemorySession(frontendSessionId);
  const [consent, memories, history, context] = await Promise.all([
    request(`/customers/${encodeURIComponent(identity.customerId)}/consent`),
    request(`/customers/${encodeURIComponent(identity.customerId)}/memories`),
    request(`/customers/${encodeURIComponent(identity.customerId)}/history`),
    request(`/sessions/${encodeURIComponent(identity.sessionId)}/context`)
  ]);
  return {
    ...identity,
    consent: consent.consent,
    memories: memories.memories,
    history: history.sessions,
    context: context.context
  };
};

export const getResolvedMemoryCriteria = async frontendSessionId => {
  const { sessionId } = await initializeMemorySession(frontendSessionId);
  const payload = await request(`/sessions/${encodeURIComponent(sessionId)}/context`);
  const context = payload.context || {};
  const stablePreference = context.stable_preference?.value || {};
  return {
    ...(stablePreference.scene ? { scene: stablePreference.scene } : {}),
    ...(stablePreference.model ? { model: stablePreference.model } : {}),
    ...(context.common_device?.value ? { device: context.common_device.value } : {}),
    ...(context.budget?.value != null ? { budget: context.budget.value } : {})
  };
};

export const getBailianAnalysisContext = async frontendSessionId => {
  const { sessionId } = await initializeMemorySession(frontendSessionId);
  const payload = await request(`/sessions/${encodeURIComponent(sessionId)}/analysis-context`);
  return payload.context || {};
};

export const grantLongTermConsent = async customerId => request(
  `/customers/${encodeURIComponent(customerId)}/consent`,
  { method: 'POST', body: JSON.stringify({ consent_version: 'v1' }) }
);

export const revokeLongTermConsent = async customerId => request(
  `/customers/${encodeURIComponent(customerId)}/consent`,
  { method: 'DELETE' }
);

export const saveStableMemory = async ({ customerId, sessionId, memoryType, value }) => request(
  `/customers/${encodeURIComponent(customerId)}/memories`,
  {
    method: 'POST',
    body: JSON.stringify({
      memory_type: memoryType,
      value,
      confirmed_stable: true,
      source_session_id: sessionId
    })
  }
);

export const deleteStableMemory = async (customerId, memoryType) => request(
  `/customers/${encodeURIComponent(customerId)}/memories/${encodeURIComponent(memoryType)}`,
  { method: 'DELETE' }
);

export const deleteMemorySession = async frontendSessionId => {
  const map = getSessionMap();
  const sessionId = map[frontendSessionId];
  if (sessionId) {
    await request(`/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
    delete map[frontendSessionId];
    saveSessionMap(map);
  }
  sessionPromises.delete(frontendSessionId);
};

export const clearMemoryHistory = async () => {
  const customerId = localStorage.getItem(CUSTOMER_ID_KEY);
  if (customerId) await request(`/customers/${encodeURIComponent(customerId)}/history`, { method: 'DELETE' });
  localStorage.removeItem(SESSION_MAP_KEY);
  sessionPromises.clear();
};
