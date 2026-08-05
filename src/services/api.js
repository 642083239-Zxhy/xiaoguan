/**
 * API服务层
 * 封装所有与后端API的交互
 * 目前使用Mock数据，后续替换为真实API
 */

import { mockSkus, mockFaqs, mockScripts } from '../data/mockData';

// API基础地址（待配置）
const API_BASE_URL = '/api';

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
  const sessions = localStorage.getItem('chat_sessions');
  return sessions ? JSON.parse(sessions) : [];
};

/**
 * 保存会话
 */
export const saveSession = (session) => {
  const sessions = getHistorySessions();
  const updatedSessions = [session, ...sessions].slice(0, 50); // 最多保存50条
  localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
};

/**
 * 删除会话
 */
export const deleteSession = (sessionId) => {
  const sessions = getHistorySessions();
  const updatedSessions = sessions.filter(s => s.id !== sessionId);
  localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
};

/**
 * 发送消息给AI（Mock实现）
 * 后续替换为真实API调用
 */
export const sendMessageToAI = async (message, conversationHistory, currentCriteria) => {
  // TODO: 替换为真实API调用
  // const response = await fetch(`${API_BASE_URL}/chat`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     message,
  //     conversation_history: conversationHistory,
  //     current_criteria: currentCriteria
  //   })
  // });
  // return response.json();

  // Mock实现：根据用户消息返回不同意图的响应
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = generateMockResponse(message, currentCriteria);
      resolve(response);
    }, 800);
  });
};

/**
 * 生成Mock响应
 */
const generateMockResponse = (message, criteria) => {
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
