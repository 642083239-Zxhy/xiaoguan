/**
 * Mock数据 - 用于前端演示
 */

// SKU商品数据
export const mockSkus = [
  {
    id: 'SKU001',
    name: 'LightPro X1',
    tier: '入门',
    scenario: '办公',
    dpi: '8000',
    weight: '52g',
    connection: '无线/有线双模',
    price: 129,
    stock: 156,
    reason: '适合静音办公，轻巧便携',
    target: '办公用户'
  },
  {
    id: 'SKU002',
    name: 'GamePro M2',
    tier: '进阶',
    scenario: '游戏',
    dpi: '16000',
    weight: '63g',
    connection: '无线/有线双模',
    price: 299,
    stock: 89,
    reason: '电竞级传感器，响应迅速',
    target: 'FPS/MOBA玩家'
  },
  {
    id: 'SKU003',
    name: 'Flagship Ultra',
    tier: '旗舰',
    scenario: '游戏',
    dpi: '26000',
    weight: '58g',
    connection: '无线/有线双模',
    price: 599,
    stock: 23,
    reason: 'PAW3395旗舰芯片，支持8K回报率',
    target: '专业电竞选手'
  },
  {
    id: 'SKU004',
    name: 'Designer Slim',
    tier: '进阶',
    scenario: '设计',
    dpi: '12000',
    weight: '49g',
    connection: '蓝牙/有线',
    price: 349,
    stock: 45,
    reason: '对称式设计，长时间使用不疲劳',
    target: '设计师/办公'
  },
  {
    id: 'SKU005',
    name: 'SilentClick Mini',
    tier: '入门',
    scenario: '办公',
    dpi: '4000',
    weight: '55g',
    connection: '静音微动',
    price: 89,
    stock: 234,
    reason: '静音设计，不打扰他人',
    target: '办公/图书馆'
  }
];

// FAQ数据
export const mockFaqs = [
  { id: 1, question: '这款鼠标支持Mac吗？', answer: '是的，所有鼠标都支持Mac系统，包括MacBook Pro和Mac Mini。' },
  { id: 2, question: '保修政策是什么？', answer: '我们提供1年免费保修，非人为损坏均可享受。' },
  { id: 3, question: '鼠标电池能用多久？', answer: '常规使用情况下可续航30天，快速充电10分钟可用5天。' },
  { id: 4, question: 'DPI是什么意思？', answer: 'DPI是鼠标灵敏度指标，数值越大移动越快，办公用建议800-1600，游戏用建议4000以上。' }
];

// 话术配置
export const mockScripts = {
  welcome: '您好！我是AI鼠标选购顾问，可以根据用途和预算帮您推荐最合适的鼠标。请问有什么可以帮您的？',
  priceQuery: '我来为您介绍这款鼠标的价格信息。',
  priceRange: '我们的鼠标价格区间比较宽，从89元的入门款到599元的旗舰款都有，您的预算大概是多少呢？',
  recommend: '根据您的需求，我为您推荐以下三款鼠标：',
  bargain: '理解您的想法，目前这款已经是活动价了，不过我们可以赠送一个鼠标垫作为赠品。',
  expensive: '如果觉得这款价格稍高，我可以为您推荐一些性价比更高的选择。',
  better: '您的眼光很好！如果追求更高性能，我们还有旗舰款可以考虑。',
  thanks: '感谢您的咨询，有任何问题随时可以联系我们。',
  transferHuman: '已为您转接人工客服，请问还有其他可以帮您的吗？'
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
export const priceRanges = ['150元内', '150~400元', '400元以上'];
