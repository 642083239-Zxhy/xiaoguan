/**
 * API服务层
 * 封装所有与后端API的交互
 * 目前使用Mock数据，后续替换为真实API
 */

import { mockSkus, mockFaqs, mockScripts } from '../data/mockData.js';
import { getAnalytics, getFaqs, getSkus } from './dataStore.js';
import { getBailianAnalysisContext } from './memoryApi.js';
import { routeSalesMessage } from './salesEngine.js';

const API_CONFIG_KEY = 'mouse_ai_api_config';
const BAILIAN_SESSION_KEY = 'mouse_ai_bailian_session_id';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const getBailianSessionKey = () => `${BAILIAN_SESSION_KEY}:${localStorage.getItem('chat_session_id') || 'current'}`;

export const DEFAULT_API_CONFIG = {
  mode: 'bailian-app',
  appId: '',
  endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  apiKey: '',
  model: 'qwen-plus'
};

const SYSTEM_PROMPT = `你是一名专业、耐心、可信的电脑鼠标AI销售助手。
优先确认用户的使用场景、预算和设备兼容条件，再根据可靠商品数据给出推荐。
回答要简洁自然，先说结论，再解释理由；不知道的信息必须明确说明无法确认，不得编造参数、价格、库存或优惠。
本期不支持自动转人工、人工排队、文件自动解析或语音回复。`;

export const getApiConfig = () => {
  try {
    const saved = sessionStorage.getItem(API_CONFIG_KEY);
    return saved ? { ...DEFAULT_API_CONFIG, ...JSON.parse(saved) } : DEFAULT_API_CONFIG;
  } catch {
    return DEFAULT_API_CONFIG;
  }
};

export const saveApiConfig = (config) => {
  const normalized = {
    mode: config.mode === 'openai-compatible' ? 'openai-compatible' : 'bailian-app',
    appId: (config.appId || '').trim(),
    endpoint: config.endpoint.trim(),
    apiKey: config.apiKey.trim(),
    model: config.model.trim()
  };
  const previous = getApiConfig();
  if (previous.mode !== normalized.mode || previous.appId !== normalized.appId) {
    sessionStorage.removeItem(getBailianSessionKey());
  }
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
  if (config.mode === 'bailian-app') {
    return Boolean(config.appId && config.apiKey);
  }
  return Boolean(config.endpoint && config.model && config.apiKey);
};

export const resetKnowledgeSession = () => {
  sessionStorage.removeItem(getBailianSessionKey());
};

const requestChatCompletion = async (config, messages) => {
  const response = await fetch('/api/proxy-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...config, messages })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || `请求失败（${response.status}）`;
    throw new Error(detail);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('API返回格式不正确，未找到回答内容');
  }
  return content;
};

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
  productCatalog = [],
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
    quote_versions: toPromptValue(databaseContext.quote_versions || []),
    product_catalog: toPromptValue(productCatalog)
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
    productCatalog: getSkus(),
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
  if (!response.ok) {
    const detail = payload?.message || payload?.code || `请求失败（${response.status}）`;
    throw new Error(detail);
  }

  const content = payload?.output?.text;
  if (!content) {
    throw new Error('百炼应用未返回回答，请检查应用是否已发布并已绑定知识库');
  }
  if (payload.output.session_id) {
    sessionStorage.setItem(getBailianSessionKey(), payload.output.session_id);
  }
  return content;
};

export const testApiConnection = async (config) => {
  if (config.mode === 'bailian-app') {
    const content = await requestBailianApplication(config, '请简短回复：知识库应用连接成功');
    resetKnowledgeSession();
    return content;
  }
  const content = await requestChatCompletion(config, [
    { role: 'system', content: '你是API连通性测试助手。' },
    { role: 'user', content: '请只回复：连接成功' }
  ]);
  return content;
};

/**
 * 获取当前会话ID
 */
export const getSessionId = () => {
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
};

/**
 * 获取历史会话列表
 */
export const getHistorySessions = () => {
  try {
    const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    const cutoff = Date.now() - SESSION_TTL_MS;
    const active = sessions.filter(session => new Date(session.updatedAt || 0).getTime() >= cutoff);
    if (active.length !== sessions.length) {
      localStorage.setItem('chat_sessions', JSON.stringify(active));
    }
    return active;
  } catch {
    return [];
  }
};

/**
 * 保存会话
 */
export const saveSession = (session) => {
  const sessions = getHistorySessions();
  const normalized = { ...session, updatedAt: session.updatedAt || new Date().toISOString() };
  const updatedSessions = [normalized, ...sessions.filter(item => item.id !== session.id)].slice(0, 50);
  localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
  return updatedSessions;
};

/**
 * 删除会话
 */
export const deleteSession = (sessionId) => {
  const sessions = getHistorySessions();
  const updatedSessions = sessions.filter(s => s.id !== sessionId);
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
  const routed = routeSalesMessage({
    message,
    currentCriteria: currentCriteria || {},
    skus: getSkus(),
    faqs: getFaqs()
  });
  let bailianParamsPromise;
  const getBailianParams = () => {
    bailianParamsPromise ||= loadBailianUserPromptParams({
      message,
      conversationHistory,
      currentCriteria
    });
    return bailianParamsPromise;
  };

  if (routed.useKnowledgeBase && config.mode === 'bailian-app' && config.appId && config.apiKey) {
    const content = await requestBailianApplication(
      config,
      `请仅依据已绑定的知识库和已授权的客户上下文回答；没有依据时明确说明无法确认，并保留引用来源。\n用户问题：${message}`,
      await getBailianParams()
    );
    return {
      ...routed.response,
      data: { ...routed.response.data, answer: content },
      source: 'knowledge-base',
      analysis: routed.analysis,
      criteriaUpdates: routed.criteriaUpdates
    };
  }

  if (
    routed.analysis.primary_intent === 'casual_chat' &&
    config.mode === 'bailian-app' &&
    config.appId && config.apiKey
  ) {
    const content = await requestBailianApplication(
      config,
      `请优先依据已绑定知识库和已授权的客户上下文回答与L1系列相关的问题；无关问题简短回应并引导回产品咨询。\n用户问题：${message}`,
      await getBailianParams()
    );
    return {
      type: 'text',
      content,
      source: 'knowledge-base',
      analysis: routed.analysis,
      criteriaUpdates: routed.criteriaUpdates
    };
  }

  if (
    routed.analysis.primary_intent === 'casual_chat' &&
    config.mode === 'openai-compatible' &&
    config.endpoint && config.model && config.apiKey
  ) {
    const history = conversationHistory
      .filter(item => item.content && (item.type === 'user' || item.type === 'ai'))
      .slice(-12)
      .map(item => ({
        role: item.type === 'user' ? 'user' : 'assistant',
        content: item.content
      }));
    const criteriaText = Object.keys(currentCriteria || {}).length
      ? `\n当前已确认的选购条件：${JSON.stringify(currentCriteria)}`
      : '';
    const content = await requestChatCompletion(config, [
      { role: 'system', content: `${SYSTEM_PROMPT}${criteriaText}` },
      ...history,
      { role: 'user', content: message }
    ]);
    return {
      type: 'text',
      content,
      source: 'api',
      analysis: routed.analysis,
      criteriaUpdates: routed.criteriaUpdates
    };
  }

  return {
    ...routed.response,
    source: routed.useKnowledgeBase ? 'local-knowledge' : 'rule-engine',
    analysis: routed.analysis,
    criteriaUpdates: routed.criteriaUpdates,
    criteriaReset: routed.criteriaReset,
    quote: routed.quote
  };
};

/**
 * 生成Mock响应
 */
const _generateMockResponse = (message, criteria) => {
  const lowerMessage = message.toLowerCase();
  
  // 处理各种意图
  if (lowerMessage.includes('转人工') || lowerMessage.includes('人工')) {
    return {
      type: 'intent',
      intent: 'direct_human',
      data: {}
    };
  }
  
  if (lowerMessage.includes('投诉') || lowerMessage.includes('不好') || lowerMessage.includes('差评')) {
    return {
      type: 'intent',
      intent: 'complaint',
      data: {}
    };
  }
  
  if (lowerMessage.includes('售后') || lowerMessage.includes('退换') || lowerMessage.includes('保修')) {
    return {
      type: 'intent',
      intent: 'after_sales',
      data: {}
    };
  }
  
  if (lowerMessage.includes('价格') || lowerMessage.includes('多少钱') || lowerMessage.includes('报价')) {
    const matchingProduct = findMatchingProduct(criteria);
    return {
      type: 'intent',
      intent: 'price_inquiry',
      data: {
        product: matchingProduct,
        priceType: 'open'
      }
    };
  }
  
  if (lowerMessage.includes('库存') || lowerMessage.includes('现货') || lowerMessage.includes('发货')) {
    const matchingProduct = findMatchingProduct(criteria);
    return {
      type: 'intent',
      intent: 'stock_logistics',
      data: {
        product: matchingProduct,
        stockInfo: {
          available: matchingProduct?.stock > 0,
          count: matchingProduct?.stock || 0,
          warehouse: '华东仓（上海）'
        },
        estimatedDelivery: '2-3天'
      }
    };
  }
  
  if (lowerMessage.includes('dpi') || lowerMessage.includes('参数') || lowerMessage.includes('微动')) {
    return {
      type: 'intent',
      intent: 'parameter_query',
      data: {
        question: message,
        answer: 'DPI是鼠标灵敏度的单位，数值越大移动的像素越多。办公使用建议800-1600 DPI，游戏使用建议4000以上。DPI可调范围越大，鼠标适用场景越广。',
        relatedProduct: mockSkus.find(s => s.tier === '进阶')
      }
    };
  }
  
  if (lowerMessage.includes('兼容') || lowerMessage.includes('mac') || lowerMessage.includes('支持') || lowerMessage.includes('连接')) {
    const matchingProduct = findMatchingProduct(criteria);
    const deviceType = lowerMessage.includes('mac') ? 'Mac系统' : '您的设备';
    return {
      type: 'intent',
      intent: 'compatibility_check',
      data: {
        status: 'compatible',
        deviceType,
        product: matchingProduct || mockSkus[0]
      }
    };
  }
  
  if (lowerMessage.includes('便宜') || lowerMessage.includes('优惠') || lowerMessage.includes('打折')) {
    return {
      type: 'intent',
      intent: 'bargain',
      data: {
        message: '理解您的想法，目前这款已经是活动价了，不过我们可以赠送一个鼠标垫作为赠品，您看可以吗？',
        isApproving: false
      }
    };
  }
  
  if (lowerMessage.includes('便宜点') || lowerMessage.includes('最低价') || lowerMessage.includes('最低多少钱')) {
    return {
      type: 'intent',
      intent: 'bargain',
      data: {
        message: '非常抱歉，我暂时没有直接降价的权限，需要联系销售顾问为您申请。',
        isApproving: false
      }
    };
  }
  
  if (lowerMessage.includes('企业') || lowerMessage.includes('批发') || lowerMessage.includes('批量') || lowerMessage.includes('公司采购')) {
    return {
      type: 'intent',
      intent: 'enterprise_purchase',
      data: {}
    };
  }
  
  if (lowerMessage.includes('买') || lowerMessage.includes('下单') || lowerMessage.includes('购买') || lowerMessage.includes('要了')) {
    const matchingProduct = findMatchingProduct(criteria);
    return {
      type: 'intent',
      intent: 'purchase_push',
      data: {
        product: matchingProduct || mockSkus[1]
      }
    };
  }
  
  if (lowerMessage.includes('比较') || lowerMessage.includes('对比') || lowerMessage.includes('哪个好')) {
    return {
      type: 'intent',
      intent: 'product_comparison',
      data: {
        productA: mockSkus[0],
        productB: mockSkus[1]
      }
    };
  }
  
  if (lowerMessage.includes('办公') || lowerMessage.includes('游戏') || lowerMessage.includes('便携') || 
      lowerMessage.includes('设计') || lowerMessage.includes('推荐') || lowerMessage.includes('选购')) {
    // 根据场景推荐商品
    const scene = lowerMessage.includes('办公') ? '办公' : 
                 lowerMessage.includes('游戏') ? '游戏' :
                 lowerMessage.includes('设计') ? '设计' :
                 lowerMessage.includes('便携') ? '办公' : '';
    
    const products = scene ? mockSkus.filter(s => s.scenario === scene).slice(0, 3) : mockSkus.slice(0, 3);
    
    // 如果没有匹配的，返回全部
    const finalProducts = products.length > 0 ? products : mockSkus.slice(0, 3);
    
    return {
      type: 'intent',
      intent: 'product_recommendation',
      data: {
        products: finalProducts
      }
    };
  }
  
  if (lowerMessage.includes('你好') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
    return {
      type: 'text',
      content: '您好！我是AI鼠标选购顾问。请问您主要用鼠标做什么？我可以根据用途和预算帮您推荐。'
    };
  }
  
  // 默认返回选购咨询引导
  return {
    type: 'intent',
    intent: 'selection_consultation',
    data: {}
  };
};

/**
 * 根据当前条件查找匹配商品
 */
const findMatchingProduct = (criteria) => {
  if (!criteria || Object.keys(criteria).length === 0) {
    return mockSkus[1]; // 默认返回进阶款
  }
  
  let filteredProducts = [...mockSkus];
  
  if (criteria.scene) {
    filteredProducts = filteredProducts.filter(p => 
      p.scenario.includes(criteria.scene)
    );
  }
  
  if (criteria.budget) {
    const budgetMatch = {
      '150元内': p => p.price < 150,
      '150~400元': p => p.price >= 150 && p.price <= 400,
      '400元以上': p => p.price > 400
    };
    const matcher = budgetMatch[criteria.budget];
    if (matcher) {
      filteredProducts = filteredProducts.filter(matcher);
    }
  }
  
  return filteredProducts[0] || mockSkus[1];
};

/**
 * 获取当前会话状态（Mock）
 */
export const getSessionStatus = async () => {
  return {
    sessionId: getSessionId(),
    status: 'active',
    createdAt: new Date().toISOString()
  };
};

// 导出Mock数据供使用
export { mockSkus, mockFaqs, mockScripts };
