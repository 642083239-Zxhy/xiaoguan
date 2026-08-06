const INTENT_LABELS = {
  selection_consultation: '选购咨询',
  product_recommendation: '商品推荐',
  product_comparison: '商品比较',
  parameter_query: '参数/知识咨询',
  compatibility_check: '兼容性确认',
  price_inquiry: '询价',
  bargain: '议价/优惠',
  stock_logistics: '库存/物流',
  enterprise_purchase: '批量/企业采购',
  purchase_push: '下单/成交推进',
  after_sales: '订单/售后',
  complaint: '投诉/负面',
  direct_human: '明确转人工',
  casual_chat: '闲聊/无关',
  security_warning: '恶意/越权',
  cost_boundary: '内部成本/权限边界'
};

const INTENT_RULES = [
  ['cost_boundary', ['成本', '成本价', '进货价', '采购价', '毛利', '利润'], 0.99],
  ['security_warning', ['系统提示词', '忽略之前', '后台数据', '绕过权限', 'api key', '密钥'], 0.98],
  ['complaint', ['投诉', '欺骗', '差评', '赔偿', '太差', '垃圾', '消协', '生气', '愤怒', '失望', '不满意', '不好用'], 0.97],
  ['direct_human', ['人工', '真人', '找销售', '客服'], 0.96],
  ['enterprise_purchase', ['企业采购', '公司采购', '批量', '批发', '长期合作', '开票'], 0.94],
  ['after_sales', ['退货', '退款', '换货', '维修', '保修', '售后', '订单', '发票'], 0.94],
  ['stock_logistics', ['库存', '现货', '什么时候发', '多久到', '物流', '发货'], 0.93],
  ['bargain', ['便宜点', '最低价', '最低多少', '打折', '优惠', '别家更便宜', '太贵', '贵了'], 0.94],
  ['price_inquiry', ['多少钱', '价格', '报价', '到手价', '成交价', '总价'], 0.95],
  ['compatibility_check', ['兼容', '支持mac', '支持windows', '能连接', '适配', '接口'], 0.92],
  ['product_comparison', ['对比', '比较', '区别', '哪个好'], 0.93],
  ['purchase_push', ['怎么买', '购买', '下单', '发链接', '我要了'], 0.92],
  ['parameter_query', ['dpi', '传感器', '回报率', '重量', '续航', '微动', '参数', '质保', '尺寸', '充电'], 0.93],
  ['selection_consultation', ['怎么选', '适合什么', '选购'], 0.86],
  ['product_recommendation', ['推荐', '选一款', '哪款', '预算内', '适合我'], 0.88]
];

const includesAny = (text, words) => words.some(word => text.includes(word));

const extractEntities = message => {
  const text = message.toLowerCase();
  const rangeBudget = text.match(/(\d{2,4})\s*[~～-]\s*(\d{2,4})\s*(?:元|块)?/);
  const numericBudget = text.match(/(?:预算(?:是|约|大概)?|最多|不超过)\s*(\d{2,4})|(?:^|\s)(\d{2,4})\s*(?:元|块|以内|以下)|^(\d{2,4})$/);
  const quantity = text.match(/(\d+)\s*(?:个|件|只|台)/);
  const offerPrice = text.match(/(\d{2,4})\s*(?:元|块)\s*(?:行吗|可以吗|能不能|卖不卖)/);
  const handLength = text.match(/(?:手长|手掌|手型)?\s*(\d{2}(?:\.\d)?)\s*(?:cm|厘米)/);
  const models = [
    ...(text.includes('l1 pro') || text.includes('l1pro') || text.includes('pro版') ? ['L1 Pro'] : []),
    ...((/\bl1\b/i.test(message) || text.includes('基础版')) && !text.includes('l1 pro') ? ['L1 基础版'] : [])
  ];
  const device = includesAny(text, ['mac', 'macos', '苹果电脑'])
    ? 'macOS'
    : includesAny(text, ['windows', 'win10', 'win11']) ? 'Windows' : '';
  const purpose = includesAny(text, ['fps', 'cs2', '无畏契约', '游戏', '电竞'])
    ? '游戏'
    : includesAny(text, ['设计', '剪辑', '建模'])
      ? '设计'
      : includesAny(text, ['办公', '出差', '便携']) ? '办公' : '';
  const grip = ['趴握', '抓握', '指握'].find(item => text.includes(item)) || '';
  const handSize = includesAny(text, ['小手', '手小']) ? '小手' : includesAny(text, ['大手', '手大']) ? '大手' : '';
  const connection = ['蓝牙', '2.4g', '有线', 'type-c'].find(item => text.includes(item)) || '';
  const channel = includesAny(text, ['官网', '官方', '网页']) ? '官方渠道' : includesAny(text, ['线下', '门店']) ? '线下门店' : '';
  const campaign = text.includes('618') ? '618' : text.includes('双11') || text.includes('双 11') ? '双11' : '';
  const region = ['北京', '上海', '广州', '深圳', '杭州', '成都'].find(item => text.includes(item)) || '';

  return {
    ...((rangeBudget || numericBudget) && !offerPrice ? {
      budget: rangeBudget ? Number(rangeBudget[2]) : Number(numericBudget.slice(1).find(Boolean)),
      ...(rangeBudget ? { budget_range: rangeBudget.slice(1, 3).map(Number) } : {})
    } : {}),
    ...(quantity ? { quantity: Number(quantity[1]) } : {}),
    ...(offerPrice ? { offer_price: Number(offerPrice[1]) } : {}),
    ...(models.length ? { model: models[0], models } : {}),
    ...(device ? { device } : {}),
    ...(purpose ? { purpose } : {}),
    ...(grip ? { grip } : {}),
    ...(handSize ? { hand_size: handSize } : {}),
    ...(handLength ? { hand_length_cm: Number(handLength[1]) } : {}),
    ...(connection ? { connection } : {}),
    ...(channel ? { channel } : {}),
    ...(campaign ? { campaign } : {}),
    ...(region ? { delivery_region: region } : {}),
    ...(includesAny(text, ['雷龙', 'thunder dragon']) ? { brand: '雷龙' } : {})
  };
};

const detectIntents = (message, entities) => {
  const text = message.toLowerCase().trim();
  const matches = INTENT_RULES
    .filter(([, keywords]) => includesAny(text, keywords))
    .map(([intent, , confidence]) => ({ intent, confidence }));
  if (text.includes('l1') && text.includes('pro') && !matches.some(item => item.intent === 'product_comparison')) {
    matches.push({ intent: 'product_comparison', confidence: 0.9 });
  }
  if (entities.offer_price && !matches.some(item => item.intent === 'bargain')) {
    matches.unshift({ intent: 'bargain', confidence: 0.95 });
  }
  if ((entities.budget || entities.purpose) && !matches.some(item => item.intent === 'product_recommendation')) {
    matches.push({ intent: 'product_recommendation', confidence: 0.84 });
  }
  return matches.length ? matches : [{ intent: 'casual_chat', confidence: 0.72 }];
};

const nextActionFor = (intent, entities) => {
  if (['security_warning', 'cost_boundary'].includes(intent)) return '拒绝';
  if (['complaint', 'direct_human', 'after_sales'].includes(intent)) return '说明范围';
  if (intent === 'parameter_query') return '检索';
  if (['price_inquiry', 'bargain'].includes(intent)) return '报价';
  if (['product_recommendation', 'product_comparison'].includes(intent)) {
    return entities.budget && entities.purpose && entities.device ? '推荐' : '追问';
  }
  if (intent === 'selection_consultation') return '追问';
  return '直接回答';
};

export const analyzeIntent = message => {
  const entities = extractEntities(message);
  const matches = detectIntents(message, entities);
  const [{ intent: primaryIntent, confidence }] = matches;
  const riskFlags = [];
  if (primaryIntent === 'complaint') riskFlags.push('投诉');
  if (primaryIntent === 'cost_boundary') riskFlags.push('权限边界');
  if (primaryIntent === 'security_warning') riskFlags.push('越权');
  if (includesAny(message, ['退款', '退钱'])) riskFlags.push('退款');
  if (includesAny(message, ['起诉', '律师', '法律', '消协'])) riskFlags.push('法律');
  if (includesAny(message.toLowerCase(), ['身份证', '银行卡', '密码', 'card number'])) riskFlags.push('隐私');
  const sentiment = includesAny(message, ['非常满意', '很好', '喜欢', '不错'])
    ? '正向'
    : primaryIntent === 'complaint' || includesAny(message, ['气死', '愤怒', '垃圾'])
      ? '激动'
      : includesAny(message, ['不好', '失望', '太贵', '贵了']) ? '负向' : '中性';

  return {
    primary_intent: primaryIntent,
    primary_intent_label: INTENT_LABELS[primaryIntent],
    secondary_intents: matches.slice(1, 4).map(item => item.intent),
    secondary_intent_labels: matches.slice(1, 4).map(item => INTENT_LABELS[item.intent]),
    confidence,
    entities,
    sentiment,
    risk_flags: riskFlags,
    next_action: nextActionFor(primaryIntent, entities)
  };
};

const findProduct = (model, skus) => {
  if (!model) return null;
  return skus.find(product => product.name.toLowerCase() === model.toLowerCase()) || null;
};

const normalizeBudget = budget => {
  if (typeof budget === 'number') return budget;
  if (!budget) return null;
  const matches = String(budget).match(/\d+/g)?.map(Number) || [];
  if (String(budget).includes('以上')) return Number.POSITIVE_INFINITY;
  return matches.at(-1) || null;
};

const valuePointsFor = product => [
  `${product.sensor}，DPI ${product.dpi}`,
  `${product.weight}轻量化设计，支持${product.connection}`,
  `${product.battery}，${product.warranty}`
];

export const calculateQuote = ({
  product,
  quantity = null,
  channel = '',
  campaign = '',
  requestedPrice = null,
  formalRequested = false
}) => {
  if (!product) {
    return {
      canQuote: false,
      priceType: 'range',
      missingFields: ['商品型号'],
      valuePoints: [],
      ruleChecks: [],
      discountAuthority: 'not_applicable'
    };
  }

  const normalizedQuantity = Number(quantity) > 0 ? Number(quantity) : 1;
  const campaignEligible = ['618', '双11'].includes(campaign);
  const missingFields = formalRequested
    ? [!quantity && '数量', !channel && '购买渠道'].filter(Boolean)
    : [];
  let unitPrice = campaignEligible ? product.promotionFloor : product.price;
  let priceType = campaignEligible ? 'promotion' : formalRequested ? 'formal' : 'open';
  let discountAuthority = campaignEligible ? 'rule_allowed' : 'public_price';
  let discountMessage = campaignEligible
    ? `${campaign}规则价已命中，单价不得低于${product.promotionFloor}元。`
    : '当前按公开零售价计算，未使用未经确认的优惠。';

  if (requestedPrice != null) {
    if (requestedPrice < product.promotionFloor) {
      unitPrice = product.price;
      priceType = 'rejected_offer';
      discountAuthority = 'denied';
      discountMessage = `出价${requestedPrice}元低于${product.promotionFloor}元价格底线，规则引擎拒绝。`;
    } else if (requestedPrice < product.price && !campaignEligible) {
      unitPrice = product.price;
      priceType = 'approval_required';
      discountAuthority = 'approval_required';
      discountMessage = `出价${requestedPrice}元未命中已确认活动，当前页面无权承诺。`;
    } else {
      unitPrice = requestedPrice;
      priceType = 'formal';
      discountAuthority = 'rule_allowed';
      discountMessage = '出价符合已知价格规则。';
    }
  }

  const ruleChecks = [
    { name: '商品已锁定', passed: true, detail: product.name },
    { name: '价值点已校验', passed: valuePointsFor(product).length >= 3, detail: '参数、轻量化、连接、续航与质保' },
    { name: '价格底线', passed: unitPrice >= product.promotionFloor, detail: `不得低于${product.promotionFloor}元` },
    { name: '折扣权限', passed: discountAuthority !== 'approval_required' && discountAuthority !== 'denied', detail: discountMessage }
  ];
  const canQuote = missingFields.length === 0 && ruleChecks.every(item => item.passed);

  return {
    canQuote,
    productId: product.id,
    productName: product.name,
    priceType,
    listPrice: product.price,
    unitPrice,
    quantity: normalizedQuantity,
    totalPrice: unitPrice * normalizedQuantity,
    channel: channel || '未确认',
    campaign: campaign || '无已确认活动',
    missingFields,
    valuePoints: valuePointsFor(product),
    ruleChecks,
    discountAuthority,
    discountMessage,
    quoteVersion: `Q-${Date.now()}`
  };
};

const missingRecommendationFields = criteria => [
  !criteria.scene && '使用场景',
  !criteria.budget && '预算',
  !criteria.device && '设备系统'
].filter(Boolean);

const recommend = (skus, criteria) => {
  const budget = normalizeBudget(criteria.budget);
  const compatible = skus.filter(product => !criteria.device || product.platform?.includes(criteria.device));
  const eligible = compatible.filter(product => !budget || product.price <= budget);
  const ranked = eligible.map(product => {
    const sceneMatch = !criteria.scene || product.scenario?.includes(criteria.scene);
    const performanceFit = criteria.scene === '游戏' && product.id === 'L1PRO';
    const valueFit = criteria.scene !== '游戏' && product.id === 'L1';
    const score = (sceneMatch ? 30 : 0) + (performanceFit ? 20 : 0) + (valueFit ? 15 : 0) - product.price / 1000;
    const matchReasons = [
      sceneMatch ? `适合${criteria.scene || '当前'}场景` : '场景为可选适配',
      `${criteria.device || 'Windows/macOS'}兼容`,
      `公开价${product.price}元在预算内`
    ];
    return { ...product, score, matchReasons };
  }).sort((a, b) => b.score - a.score);
  const excludedProducts = skus.filter(product => !eligible.some(item => item.id === product.id)).map(product => ({
    id: product.id,
    name: product.name,
    reason: budget && product.price > budget
      ? `公开价${product.price}元超过预算上限${budget}元`
      : `${criteria.device}兼容性无法通过`
  }));
  return { products: ranked.slice(0, 3), excludedProducts };
};

const localKnowledgeAnswer = (message, product, faqs, criteria = {}) => {
  const text = message.toLowerCase();
  const matchedFaq = faqs.find(item => includesAny(text, item.question.toLowerCase().split(/[？?，,\s]/).filter(word => word.length > 1)));
  if (matchedFaq) return matchedFaq.answer;
  if (includesAny(text, ['质保', '保修'])) return 'L1系列整机质保2年，微动开关质保3年；质保期内非人为损坏免费换新。';
  if (includesAny(text, ['续航', '电池'])) return 'L1与L1 Pro在1000Hz、灯效关闭条件下续航均不少于80小时；开启灯效时不低于40小时。';
  if (product) {
    if (includesAny(text, ['微动', '寿命', '按键'])) {
      return `${product.name}采用${product.switchLife}微动，整机质保${product.warranty}。`;
    }
    if (includesAny(text, ['接口', '连接', '蓝牙', '2.4g', '有线', '兼容', '平台'])) {
      return `${product.name}支持${product.connection}；兼容平台为${product.platform}。`;
    }
    const budget = normalizeBudget(criteria.budget);
    const budgetFit = budget ? product.price <= budget : null;
    const deviceFit = criteria.device ? product.platform?.includes(criteria.device) : null;
    const knownFits = [budgetFit, deviceFit].filter(value => value !== null);
    const conclusion = knownFits.length
      ? knownFits.every(Boolean)
        ? `结论：${product.name}符合你当前已确认的条件。`
        : `结论：${product.name}暂未完全符合你当前已确认的条件。`
      : `结论：以下是${product.name}的已确认商品信息。`;
    const fitDetails = [
      budget != null
        ? budgetFit
          ? `你的预算${budget}元可以覆盖${product.price}元公开价`
          : `${product.price}元公开价超过你的${budget}元预算`
        : null,
      criteria.device
        ? deviceFit
          ? `支持${criteria.device}`
          : `暂未确认支持${criteria.device}`
        : null
    ].filter(Boolean);
    const parameterText = `${product.sensor}传感器，DPI ${product.dpi}，${product.pollingRate}，重量${product.weight}，${product.connection}，续航${product.battery}，${product.switchLife}微动，兼容${product.platform}，整机质保${product.warranty}`;
    return `${conclusion}${fitDetails.length ? `${fitDetails.join('，')}。` : ''}核心参数：${parameterText}。库存、实时优惠和到货时间需通过正式销售渠道确认。`;
  }
  return '当前商品资料中没有找到对应型号。请告诉我具体型号，或选择L1基础版和L1 Pro进行查询。';
};

export const routeSalesMessage = ({ message, currentCriteria, skus, faqs }) => {
  let analysis = analyzeIntent(message);
  const { entities } = analysis;
  const criteriaUpdates = {
    ...(entities.budget ? { budget: entities.budget } : {}),
    ...(entities.purpose ? { scene: entities.purpose } : {}),
    ...(entities.device ? { device: entities.device } : {}),
    ...(entities.model ? { model: entities.model } : {}),
    ...(entities.quantity ? { quantity: entities.quantity } : {}),
    ...(entities.channel ? { channel: entities.channel } : {}),
    ...(entities.campaign ? { campaign: entities.campaign } : {})
  };
  const mergedCriteria = { ...currentCriteria, ...criteriaUpdates };
  let intent = analysis.primary_intent;
  if (intent === 'casual_chat' && Object.keys(criteriaUpdates).length) {
    intent = missingRecommendationFields(mergedCriteria).length ? 'selection_consultation' : 'product_recommendation';
    analysis = {
      ...analysis,
      primary_intent: intent,
      primary_intent_label: INTENT_LABELS[intent],
      next_action: intent === 'product_recommendation' ? '推荐' : '追问'
    };
  }
  const product = findProduct(entities.model || currentCriteria.model, skus);

  if (includesAny(message, ['清空条件', '重置条件', '重新选择', '重新选购'])) {
    return {
      analysis: { ...analysis, primary_intent: 'selection_consultation', primary_intent_label: '选购咨询', next_action: '追问' },
      criteriaUpdates: {},
      criteriaReset: true,
      response: { type: 'text', content: '已清空之前的预算、场景、设备和型号条件。请重新告诉我你的预算与主要用途。' }
    };
  }

  if (intent === 'security_warning') return { analysis, criteriaUpdates, response: { type: 'intent', intent: 'security_warning', data: {} } };
  if (intent === 'cost_boundary') return { analysis, criteriaUpdates, response: { type: 'text', content: '抱歉，成本、进货价、毛利和利润属于内部经营信息，我没有权限查询或披露。可以为你说明公开售价、已确认活动规则和商品参数。' } };
  if (intent === 'complaint') return { analysis, criteriaUpdates, response: { type: 'intent', intent: 'complaint', data: {} } };
  if (intent === 'direct_human') return { analysis, criteriaUpdates, response: { type: 'text', content: '当前版本不包含人工客服转接，请通过品牌正式销售渠道联系顾问。' } };
  if (intent === 'after_sales') return { analysis, criteriaUpdates, response: { type: 'text', content: 'L1系列整机质保2年、微动3年。订单、退换或维修需要账户数据，当前版本不处理，请通过正式售后渠道提交。' } };
  if (intent === 'enterprise_purchase') return { analysis, criteriaUpdates, response: { type: 'text', content: '已识别为企业采购。请补充数量、采购主体、交付地区和发票要求；当前页面只记录需求，不承诺批量折扣。' } };
  if (intent === 'stock_logistics') return { analysis, criteriaUpdates, response: { type: 'text', content: '知识库没有实时库存和物流接口，当前无法确认现货数量或到货时间，也不会把估算当作承诺。' } };
  if (intent === 'bargain') {
    const target = product || findProduct(currentCriteria.model, skus) || skus[0];
    const quote = calculateQuote({
      product: target,
      quantity: entities.quantity || currentCriteria.quantity || 1,
      channel: entities.channel || currentCriteria.channel || '',
      campaign: entities.campaign || currentCriteria.campaign || '',
      requestedPrice: entities.offer_price ?? null
    });
    return {
      analysis,
      criteriaUpdates,
      quote,
      response: {
        type: 'intent',
        intent: 'bargain',
        data: {
          message: `${quote.valuePoints[0]}。${quote.discountMessage}`,
          isApproving: false,
          quote
        }
      }
    };
  }
  if (intent === 'price_inquiry') {
    const formalRequested = includesAny(message, ['到手价', '成交价', '总价', '正式报价', '现在下单']);
    const quote = calculateQuote({
      product,
      quantity: entities.quantity || currentCriteria.quantity,
      channel: entities.channel || currentCriteria.channel || '',
      campaign: entities.campaign || currentCriteria.campaign || '',
      formalRequested
    });
    return {
      analysis,
      criteriaUpdates,
      quote,
      response: {
        type: 'intent',
        intent: 'price_inquiry',
        data: { product, products: skus, priceType: quote.priceType, quote }
      }
    };
  }
  if (intent === 'compatibility_check') {
    const target = product || findProduct(currentCriteria.model, skus) || skus[0];
    const device = entities.device || currentCriteria.device;
    const known = Boolean(device && target.platform?.includes(device));
    return { analysis, criteriaUpdates, response: { type: 'intent', intent: 'compatibility_check', data: { status: known ? 'compatible' : 'unknown', deviceType: device || '该设备', product: target } } };
  }
  if (intent === 'product_comparison') {
    return { analysis, criteriaUpdates, response: { type: 'intent', intent: 'product_comparison', data: { productA: skus[0], productB: skus[1] } } };
  }
  if (intent === 'purchase_push') {
    return { analysis, criteriaUpdates, response: { type: 'intent', intent: 'purchase_push', data: { product: product || recommend(skus, mergedCriteria).products[0] || skus[0] } } };
  }
  if (intent === 'parameter_query') {
    const target = product || findProduct(currentCriteria.model, skus) || skus[0];
    return { analysis, criteriaUpdates, useKnowledgeBase: true, response: { type: 'intent', intent: 'parameter_query', data: { question: message, answer: localKnowledgeAnswer(message, target, faqs, mergedCriteria), relatedProduct: target } } };
  }
  if (intent === 'product_recommendation') {
    const missingFields = missingRecommendationFields(mergedCriteria);
    if (missingFields.length) {
      return {
        analysis: { ...analysis, next_action: '追问' },
        criteriaUpdates,
        response: { type: 'intent', intent: 'selection_consultation', data: { missingFields } }
      };
    }
    const { products, excludedProducts } = recommend(skus, mergedCriteria);
    if (!products.length) {
      return { analysis, criteriaUpdates, response: { type: 'text', content: '当前知识库中没有同时满足预算和兼容条件的SKU。L1基础版公开零售价为399元；仅在规定的大促期间价格底线可到349元。' } };
    }
    const exclusions = excludedProducts.length
      ? `已排除：${excludedProducts.map(item => `${item.name}（${item.reason}）`).join('；')}`
      : '两个知识库型号均通过硬过滤。';
    const note = `硬过滤条件：预算≤${mergedCriteria.budget}元、${mergedCriteria.device}兼容；${exclusions}`;
    return { analysis, criteriaUpdates, response: { type: 'intent', intent: 'product_recommendation', data: { products, note, excludedProducts } } };
  }
  if (intent === 'selection_consultation') {
    return { analysis, criteriaUpdates, response: { type: 'intent', intent: 'selection_consultation', data: { missingFields: missingRecommendationFields(mergedCriteria) } } };
  }
  const casualText = message.toLowerCase();
  const casualMessage = includesAny(casualText, ['你好', 'hello', 'hi'])
    ? '你好，我是雷龙L1智能选购顾问。你可以问我型号区别、参数、价格，或直接告诉我预算。'
    : includesAny(casualText, ['你是谁', '能做什么', '什么功能'])
      ? '我可以进行L1系列选购推荐、L1与L1 Pro对比、参数知识问答、兼容性确认和规则报价。'
      : includesAny(casualText, ['怎么样', '值得买吗', '介绍一下'])
        ? 'L1系列包含399元基础版与599元Pro版，均支持三模连接和80小时以上续航；Pro版主要升级PAW3950传感器、有线4000Hz与更轻重量。'
        : '这个问题不属于当前商品知识范围。你可以继续询问L1系列的价格、参数、兼容性或选购建议。';
  return { analysis, criteriaUpdates, response: { type: 'intent', intent: 'casual_chat', data: { message: casualMessage } } };
};
