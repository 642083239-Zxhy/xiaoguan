/**
 * Mock数据 - 用于前端演示
 */

// SKU商品数据
export const mockSkus = [
  {
    id: 'L1',
    name: 'L1 基础版',
    tier: '基础版',
    scenario: '游戏/办公',
    sensor: '原相3360改版',
    dpi: '100-12000',
    ips: '400 IPS',
    acceleration: '40G',
    pollingRate: '2.4G 1000Hz / 有线 2000Hz',
    weight: '≤58g',
    connection: '2.4G+蓝牙5.0+有线三模',
    battery: '≥80小时（1000Hz、灯效关闭）',
    switchLife: '欧姆龙蓝点5000万次',
    platform: 'Windows/macOS',
    warranty: '整机2年，微动3年',
    price: 399,
    promotionFloor: 349,
    stock: null,
    stockStatus: '待实时查询',
    reason: '兼顾轻量化、三模连接与入门竞技性能',
    target: '预算约400元的游戏玩家与多设备用户'
  },
  {
    id: 'L1PRO',
    name: 'L1 Pro',
    tier: 'Pro版',
    scenario: '游戏/电竞',
    sensor: 'PixArt PAW3950',
    dpi: '100-26000',
    ips: '650 IPS',
    acceleration: '50G',
    pollingRate: '2.4G 1000Hz / 有线 4000Hz',
    weight: '≤55g',
    connection: '2.4G+蓝牙5.0+有线三模',
    battery: '≥80小时（1000Hz、灯效关闭）',
    switchLife: '欧姆龙蓝点5000万次',
    platform: 'Windows/macOS',
    warranty: '整机2年，微动3年',
    price: 599,
    promotionFloor: 549,
    stock: null,
    stockStatus: '待实时查询',
    reason: 'PAW3950旗舰传感器、55g级轻量化与更高有线回报率',
    target: '追求旗舰性能的FPS及电竞玩家'
  }
];

// FAQ数据
export const mockFaqs = [
  { id: 1, question: 'L1系列支持Mac吗？', answer: '支持Windows与macOS，可通过2.4G、蓝牙5.0或有线方式连接。' },
  { id: 2, question: '保修政策是什么？', answer: '整机质保2年，微动开关质保3年；质保期内非人为损坏免费换新。' },
  { id: 3, question: '鼠标续航多久？', answer: 'L1与L1 Pro在1000Hz回报率、灯效关闭条件下续航均不少于80小时；开启灯效时不低于40小时。' },
  { id: 4, question: 'L1和L1 Pro有什么区别？', answer: '主要区别是传感器、DPI上限、追踪速度、加速度、有线回报率和重量。L1售价399元，L1 Pro售价599元。' }
];

// 话术配置
export const mockScripts = {
  welcome: '您好！我是AI鼠标选购顾问，可以根据用途和预算帮您推荐最合适的鼠标。请问有什么可以帮您的？',
  priceQuery: '我来为您介绍这款鼠标的价格信息。',
  priceRange: 'L1系列公开零售价为399元至599元，您的预算大概是多少呢？',
  recommend: '根据您的需求，我会从知识库现有型号中给出匹配方案：',
  bargain: '理解您的想法。优惠必须遵守价格底线，当前页面不能承诺未确认的折扣或赠品。',
  expensive: '如果觉得这款价格稍高，我可以为您推荐一些性价比更高的选择。',
  better: '您的眼光很好！如果追求更高性能，我们还有旗舰款可以考虑。',
  thanks: '感谢您的咨询，有任何问题随时可以联系我们。',
  transferHuman: '当前版本暂未接入人工客服转接，请通过正式销售渠道咨询。'
};

// 常见问题快捷入口
export const quickQuestions = [
  '办公鼠标推荐',
  '游戏鼠标推荐',
  '便携鼠标推荐',
  '按预算推荐',
  '查询鼠标参数',
  '查看价格'
];

// 场景快捷入口
export const scenarioTags = ['办公', '游戏', '便携', '按预算'];

// 价格区间
export const priceRanges = ['400元内', '400~600元', '600元以上'];
