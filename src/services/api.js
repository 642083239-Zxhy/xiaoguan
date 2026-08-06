import { getAnalytics } from './dataStore.js';
import { getBailianAnalysisContext } from './memoryApi.js';

const API_CONFIG_KEY = 'mouse_ai_api_config';
const BAILIAN_SESSION_KEY = 'mouse_ai_bailian_session_id';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const KNOWLEDGE_UNAVAILABLE_MESSAGE = '知识库未连接，暂时无法提供商品信息';

const getBailianSessionKey = () => `${BAILIAN_SESSION_KEY}:${localStorage.getItem('chat_session_id') || 'current'}`;

export const DEFAULT_API_CONFIG = {
  mode: 'bailian-app',
  appId: '',
  apiKey: ''
};

export const getApiConfig = () => {
  try {
    const saved = sessionStorage.getItem(API_CONFIG_KEY);
    return saved ? { ...DEFAULT_API_CONFIG, ...JSON.parse(saved), mode: 'bailian-app' } : DEFAULT_API_CONFIG;
  } catch {
    return DEFAULT_API_CONFIG;
  }
};

export const saveApiConfig = config => {
  const normalized = {
    mode: 'bailian-app',
    appId: (config.appId || '').trim(),
    apiKey: (config.apiKey || '').trim()
  };
  const previous = getApiConfig();
  if (previous.appId !== normalized.appId) sessionStorage.removeItem(getBailianSessionKey());
  sessionStorage.setItem(API_CONFIG_KEY, JSON.stringify(normalized));
  return normalized;
};

export const clearApiConfig = () => {
  sessionStorage.removeItem(API_CONFIG_KEY);
  Object.keys(sessionStorage)
    .filter(key => key.startsWith(BAILIAN_SESSION_KEY))
    .forEach(key => sessionStorage.removeItem(key));
};

export const hasApiConfig = () => {
  const config = getApiConfig();
  return Boolean(config.appId && config.apiKey);
};

export const resetKnowledgeSession = () => sessionStorage.removeItem(getBailianSessionKey());

const toShanghaiIso = value => {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00');
};

const toPromptValue = value => JSON.stringify(value ?? null);

export const buildBailianUserPromptParams = ({
  databaseContext = {},
  message = '',
  conversationHistory = [],
  currentCriteria = {},
  analytics = {},
  currentTime = new Date()
}) => {
  const currentTimeText = toShanghaiIso(currentTime);
  const storedMessages = Array.isArray(databaseContext.conversation_messages)
    ? [...databaseContext.conversation_messages]
    : [];
  if (databaseContext.latest_session_summary) {
    storedMessages.unshift({
      message_id: 'latest_session_summary',
      role: 'system',
      content: `结构化会话摘要：${toPromptValue(databaseContext.latest_session_summary)}`,
      source: 'structured_session_summary',
      created_at: databaseContext.latest_session_summary.created_at || null
    });
  }
  if (!storedMessages.length) {
    conversationHistory
      .filter(item => item?.content && (item.type === 'user' || item.type === 'ai'))
      .slice(-20)
      .forEach((item, index) => storedMessages.push({
        message_id: `frontend_history_${index + 1}`,
        role: item.type === 'user' ? 'user' : 'assistant',
        content: item.content,
        source: 'frontend_history',
        created_at: null
      }));
  }
  const latest = storedMessages.at(-1);
  if (message && !(latest?.role === 'user' && latest?.content === message)) {
    storedMessages.push({
      message_id: 'current_user_message',
      role: 'user',
      content: message,
      source: 'explicit_current_turn',
      created_at: currentTimeText
    });
  }

  const storedFacts = Array.isArray(databaseContext.session_facts)
    ? [...databaseContext.session_facts]
    : [];
  Object.entries(currentCriteria || {}).forEach(([factType, value]) => {
    const index = storedFacts.findIndex(item => item.fact_type === factType);
    const currentFact = {
      fact_id: `frontend_${factType}`,
      fact_type: factType,
      value,
      confirmation_status: 'confirmed',
      source_message_id: 'current_user_message',
      updated_at: currentTimeText
    };
    if (index >= 0) storedFacts[index] = currentFact;
    else storedFacts.push(currentFact);
  });

  return {
    current_time: currentTimeText,
    last_interaction_at: currentTimeText,
    customer_id: String(databaseContext.customer_id || ''),
    session_id: String(databaseContext.session_id || ''),
    conversation_messages: toPromptValue(storedMessages),
    session_facts: toPromptValue(storedFacts),
    behavior_data: toPromptValue({
      ...databaseContext.behavior_data,
      purchase_link_clicks: Number(analytics.purchaseClicks || 0),
      contact_link_clicks: Number(analytics.contactClicks || 0),
      database_context_available: Boolean(databaseContext.session_id)
    }),
    authorized_long_term_memories: toPromptValue(databaseContext.authorized_long_term_memories || []),
    recommendation_runs: toPromptValue(databaseContext.recommendation_runs || []),
    quote_versions: toPromptValue(databaseContext.quote_versions || [])
  };
};

const loadBailianUserPromptParams = async ({ message, conversationHistory, currentCriteria }) => {
  const frontendSessionId = localStorage.getItem('chat_session_id') || getSessionId();
  let databaseContext = {};
  try {
    databaseContext = await getBailianAnalysisContext(frontendSessionId);
  } catch {
    databaseContext = {};
  }
  return buildBailianUserPromptParams({
    databaseContext,
    message,
    conversationHistory,
    currentCriteria,
    analytics: getAnalytics()
  });
};

const requestBailianApplication = async (config, prompt, userPromptParams = null) => {
  const bizParams = userPromptParams && Object.keys(userPromptParams).length
    ? { user_prompt_params: userPromptParams }
    : undefined;
  const response = await fetch('/api/proxy-bailian', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: config.apiKey,
      appId: config.appId,
      prompt,
      sessionId: sessionStorage.getItem(getBailianSessionKey()) || '',
      bizParams
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || payload?.code || `请求失败（${response.status}）`);
  const content = payload?.output?.text;
  if (!content) throw new Error('百炼应用未返回回答，请检查应用是否已发布并已绑定知识库');
  if (payload.output.session_id) sessionStorage.setItem(getBailianSessionKey(), payload.output.session_id);
  return content;
};

const stripJsonFence = value => String(value || '')
  .trim()
  .replace(/^```(?:json)?\s*/i, '')
  .replace(/\s*```$/, '');

const INTENT_DATA_CHECKS = {
  product_recommendation: data => Array.isArray(data.products),
  product_comparison: data => Boolean(data.productA && data.productB),
  parameter_query: data => typeof data.answer === 'string',
  compatibility_check: data => Boolean(data.product),
  price_inquiry: data => Boolean(data.product || Array.isArray(data.products)),
  bargain: data => typeof data.message === 'string',
  stock_logistics: data => Boolean(data.product && data.stockInfo),
  purchase_push: data => Boolean(data.product)
};

const firstString = (...values) => values.find(value => typeof value === 'string' && value.trim()) || null;

const firstDefined = (...values) => values.find(value => value !== undefined && value !== null && value !== '');

const extractProductSpecsFromText = product => {
  const text = [product.reason, product.description, product.details, product.note]
    .filter(value => typeof value === 'string')
    .join('；');
  if (!text) return {};
  const dpi = text.match(/(\d{3,6}(?:\s*[-~至]\s*\d{3,6})?)\s*DPI/i)?.[1];
  const pollingRate = text.match(/(\d{3,4})\s*Hz/i)?.[1];
  const weight = text.match(/(?:重量|轻量化?|约|仅)?\s*(\d+(?:\.\d+)?)\s*(g|克)\b/i);
  const battery = text.match(/续航(?:时间)?(?:可达|达到|达|约|为|[:：])?\s*(\d+(?:\.\d+)?\s*(?:个月|月|小时|h|天))/i)?.[1];
  const connection = text.match(/((?:2\.4G|蓝牙(?:\s*\d(?:\.\d)?)?|有线)(?:\s*[+、/]\s*(?:2\.4G|蓝牙(?:\s*\d(?:\.\d)?)?|有线)){0,2}(?:双模|三模)?)/i)?.[1];
  const sensor = text.match(/((?:PixArt\s*)?PAW\d{4}[A-Za-z]*|原相\s*[A-Za-z0-9-]+(?:传感器)?)/i)?.[1];
  return {
    ...(sensor ? { sensor } : {}),
    ...(dpi ? { dpi: `${dpi.replace(/\s+/g, '')} DPI` } : {}),
    ...(weight ? { weight: `${weight[1]}${weight[2]}` } : {}),
    ...(pollingRate ? { pollingRate: `${pollingRate} Hz` } : {}),
    ...(connection ? { connection: connection.replace(/\s+/g, '') } : {}),
    ...(battery ? { battery: battery.replace(/\s+/g, '') } : {})
  };
};

export const normalizeKnowledgeProduct = product => {
  const extracted = extractProductSpecsFromText(product);
  return {
    ...product,
    sensor: firstDefined(product.sensor, product.sensorModel, product.sensor_model, product['传感器'], extracted.sensor),
    dpi: firstDefined(product.dpi, product.dpiRange, product.dpi_range, product.DPI, product['DPI'], extracted.dpi),
    weight: firstDefined(product.weight, product.weightGrams, product.weight_grams, product['重量'], extracted.weight),
    pollingRate: firstDefined(product.pollingRate, product.polling_rate, product.polling_rate_hz, product['回报率'], extracted.pollingRate),
    connection: firstDefined(product.connection, product.connectionType, product.connection_type, product.connectivity, product['连接方式'], extracted.connection),
    battery: firstDefined(product.battery, product.batteryLife, product.battery_life, product['续航'], extracted.battery),
    scenario: firstDefined(product.scenario, product.useCase, product.use_case, product['适用场景']),
    target: firstDefined(product.target, product.targetUser, product.target_user, product['目标用户'], product.scenario)
  };
};

const normalizeProduct = item => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  const nested = item.product || item.sku || item.item;
  if (!nested || typeof nested !== 'object' || Array.isArray(nested)) return normalizeKnowledgeProduct(item);
  return normalizeKnowledgeProduct({
    ...nested,
    ...(item.reason && !nested.reason ? { reason: item.reason } : {}),
    ...(item.matchReasons && !nested.matchReasons ? { matchReasons: item.matchReasons } : {})
  });
};

const parseNestedJson = value => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const normalizeIntentData = ({ parsed, response, intent, rawData }) => {
  const normalizedRawData = parseNestedJson(rawData);
  const objectData = normalizedRawData && typeof normalizedRawData === 'object' && !Array.isArray(normalizedRawData)
    ? normalizedRawData
    : {};
  if (intent !== 'product_recommendation') return objectData;

  const nestedRecommendation = objectData.product_recommendation
    || objectData.recommendation
    || objectData.result
    || objectData.payload
    || {};
  const productArrays = [
    Array.isArray(normalizedRawData) ? normalizedRawData : null,
    objectData.products,
    objectData.recommendations,
    objectData.product_list,
    objectData.productList,
    objectData.items,
    nestedRecommendation.products,
    nestedRecommendation.recommendations,
    nestedRecommendation.product_list,
    nestedRecommendation.productList,
    nestedRecommendation.items,
    response.products,
    response.recommendations,
    response.product_list,
    response.productList,
    parsed.products,
    parsed.recommendations,
    parsed.product_list,
    parsed.productList
  ];
  const products = productArrays
    .find(Array.isArray)
    ?.map(normalizeProduct)
    .filter(Boolean) || [];

  return products.length ? { ...objectData, products } : objectData;
};

export const parseKnowledgeResponse = rawContent => {
  let parsed;
  try {
    parsed = JSON.parse(stripJsonFence(rawContent));
  } catch {
    throw new Error('知识库返回格式异常，请在百炼提示词中确保只输出合法JSON');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('知识库返回格式异常：顶层必须是JSON对象');
  }
  const response = parsed.response && typeof parsed.response === 'object' && !Array.isArray(parsed.response)
    ? parsed.response
    : parsed;
  let intent = response.intent || parsed.intent || null;
  let type = response.type || response.response_type || (intent ? 'intent' : 'text');
  if (!intent && INTENT_DATA_CHECKS[type]) {
    intent = type;
    type = 'intent';
  }
  const rawData = response.data ?? parsed.data ?? null;
  const data = normalizeIntentData({ parsed, response, intent, rawData });
  const sourceData = rawData && typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {};
  const content = firstString(
    response.content,
    response.answer,
    response.message,
    response.text,
    response.reply,
    parsed.content,
    parsed.answer,
    parsed.message,
    parsed.text,
    parsed.reply,
    sourceData.content,
    sourceData.answer,
    sourceData.message,
    sourceData.text,
    sourceData.reply
  );
  if (type === 'intent' && INTENT_DATA_CHECKS[intent] && !INTENT_DATA_CHECKS[intent](data)) {
    if (content) type = 'text';
    else throw new Error(`知识库JSON缺少${intent}界面所需的结构化data`);
  }
  if (type === 'text' && typeof content !== 'string') {
    throw new Error('知识库JSON缺少可显示的content字段');
  }
  const analysis = parsed.analysis || response.analysis || null;
  const criteriaUpdates = parsed.criteria_updates || parsed.criteriaUpdates || response.criteria_updates || response.criteriaUpdates || {};
  const criteriaReset = Boolean(parsed.criteria_reset ?? parsed.criteriaReset ?? response.criteria_reset ?? response.criteriaReset);
  const quote = parsed.quote || response.quote || data.quote || null;
  return {
    type,
    ...(intent && type === 'intent' ? { intent, data } : { content }),
    source: 'knowledge-base',
    analysis,
    criteriaUpdates,
    criteriaReset,
    quote
  };
};

const buildKnowledgePrompt = message => `
只能依据阿里云百炼应用已绑定的知识库内容和应用提示词回答。不得使用会话历史中的助手回复作为商品事实，不得根据常识补写知识库中没有的参数、价格、库存、优惠、规则或联系方式。知识库没有依据时必须明确无法确认。

只输出一个合法JSON对象，不要输出Markdown、代码围栏或JSON之外的文字。固定结构：
{
  "schema_version": "xg-knowledge-response-v1",
  "type": "text或intent",
  "intent": "可选；selection_consultation、product_recommendation、product_comparison、parameter_query、compatibility_check、price_inquiry、bargain、stock_logistics、enterprise_purchase、purchase_push、after_sales、complaint、direct_human、casual_chat、security_warning",
  "content": "type为text时必填，所有事实必须来自知识库",
  "data": {},
  "analysis": {"primary_intent":"意图", "secondary_intents":[], "confidence":0, "entities":{}, "sentiment":"中性", "risk_flags":[], "next_action":"动作"},
  "criteria_updates": {},
  "criteria_reset": false,
  "quote": null
}

当intent为product_recommendation时，data必须严格使用以下对象结构，products必须是JSON数组，不要改名为recommendations或product_list，也不要把数组直接放在data中：
"data": {
  "products": [
    { "id": "知识库商品ID", "name": "知识库商品名", "price": 0, "reason": "推荐理由" }
  ],
  "note": "可选补充说明"
}
products中的每个字段都必须来自知识库；知识库没有商品依据时，改用type=text并在content中说明无法确认，不得输出空的product_recommendation。
每个products商品对象必须尽量把知识库中已有的传感器、DPI、重量、回报率、连接方式和续航分别写入sensor、dpi、weight、pollingRate、connection、battery字段。不要只把这些参数写进reason；知识库确实没有的字段填null，禁止猜测。

结构化商品对象的字段按知识库实际内容填写，可用字段包括：id、name、tier、scenario、sensor、dpi、ips、acceleration、pollingRate、weight、connection、battery、switchLife、platform、warranty、price、promotionFloor、stock、stockStatus、reason、target、matchReasons。不得从本地或历史回答补齐缺失字段。

当前用户问题：${message}`.trim();

export const testApiConnection = async config => {
  const content = await requestBailianApplication(config, '请简短回复：知识库应用连接成功');
  resetKnowledgeSession();
  return content;
};

export const getSessionId = () => {
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
};

export const getHistorySessions = () => {
  try {
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    const cutoff = Date.now() - SESSION_TTL_MS;
    const active = sessions.filter(session => new Date(session.updatedAt || 0).getTime() >= cutoff);
    if (active.length !== sessions.length) localStorage.setItem('chat_sessions', JSON.stringify(active));
    return active;
  } catch {
    return [];
  }
};

export const saveSession = session => {
  const sessions = getHistorySessions();
  const normalized = { ...session, updatedAt: session.updatedAt || new Date().toISOString() };
  const updatedSessions = [normalized, ...sessions.filter(item => item.id !== session.id)].slice(0, 50);
  localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
  return updatedSessions;
};

export const deleteSession = sessionId => {
  const updatedSessions = getHistorySessions().filter(session => session.id !== sessionId);
  localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
  sessionStorage.removeItem(`${BAILIAN_SESSION_KEY}:${sessionId}`);
  return updatedSessions;
};

export const clearHistorySessions = () => {
  localStorage.removeItem('chat_sessions');
  Object.keys(sessionStorage)
    .filter(key => key.startsWith(BAILIAN_SESSION_KEY))
    .forEach(key => sessionStorage.removeItem(key));
  return [];
};

export const sendMessageToAI = async (message, conversationHistory, currentCriteria) => {
  const config = getApiConfig();
  if (!config.appId || !config.apiKey) {
    return {
      type: 'text',
      content: KNOWLEDGE_UNAVAILABLE_MESSAGE,
      source: 'system',
      analysis: null,
      criteriaUpdates: {}
    };
  }
  const rawContent = await requestBailianApplication(
    config,
    buildKnowledgePrompt(message),
    await loadBailianUserPromptParams({ message, conversationHistory, currentCriteria })
  );
  return parseKnowledgeResponse(rawContent);
};

export const getSessionStatus = async () => ({
  sessionId: getSessionId(),
  status: 'active',
  createdAt: new Date().toISOString()
});
