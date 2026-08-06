import React from 'react';
import { XCircle, AlertCircle, CheckCircle, Clock, User, ShoppingBag, Zap, ChevronRight, ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

/**
 * 意图表现组件集合
 * 根据不同用户意图展示对应的前端组件
 * 雷龙品牌 - 赛博朋克紫色主题
 */

// 1. 选购咨询 - 展示场景、预算快捷选项
export const SelectionConsultation = ({ onSelectScene, onSelectBudget, onSelectDevice, missingFields = [] }) => {
  const scenes = ['办公', '游戏', '设计', '便携'];
  const budgets = ['400元内', '400~600元', '600元以上'];
  
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-2">
        {missingFields.length ? `还需要确认：${missingFields.join('、')}。` : '请补充使用场景、预算和设备系统。'}
      </p>
      <div>
        <span className="text-xs text-gray-500 mb-2 block flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-violet-400" />
          使用场景
        </span>
        <div className="flex gap-2 flex-wrap">
          {scenes.map(scene => (
            <button
              key={scene}
              onClick={() => onSelectScene(scene)}
              className="cyber-btn px-3.5 py-1.5 bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/10 rounded-lg text-sm text-gray-300 hover:text-violet-300 transition-all"
            >
              {scene}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="text-xs text-gray-500 mb-2 block">设备系统：</span>
        <div className="flex gap-2 flex-wrap">
          {['Windows', 'macOS'].map(device => (
            <button
              key={device}
              onClick={() => onSelectDevice(device)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              {device}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="text-xs text-gray-500 mb-2 block">预算范围：</span>
        <div className="flex gap-2 flex-wrap">
          {budgets.map(budget => (
            <button
              key={budget}
              onClick={() => onSelectBudget(budget)}
              className="cyber-btn px-3.5 py-1.5 bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-fuchsia-500/20 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 rounded-lg text-sm text-gray-300 hover:text-fuchsia-300 transition-all"
            >
              {budget}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. 商品推荐 - 展示三档商品名称
export const ProductRecommendation = ({ products, note, onBuy, onHuman }) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">根据当前条件，知识库中有以下匹配方案：</p>
      {note && (
        <p className="rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2 text-xs leading-5 text-purple-200">
          {note}
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {products.map((product, index) => (
          <div key={product.id}>
            <div className="mb-2 text-[10px] font-semibold tracking-wider text-purple-300">
              {index === 0 ? '优先推荐' : '性能升级'}
            </div>
            <ProductCard product={product} onBuy={onBuy} onHuman={onHuman} />
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. 商品比较 - 展示横向参数对比表
export const ProductComparison = ({ productA, productB }) => {
  if (!productA || !productB) return null;
  
  const compareFields = [
    { key: 'tier', label: '档位' },
    { key: 'sensor', label: '传感器' },
    { key: 'dpi', label: 'DPI' },
    { key: 'weight', label: '重量' },
    { key: 'pollingRate', label: '回报率' },
    { key: 'connection', label: '连接方式' },
    { key: 'battery', label: '续航' },
    { key: 'price', label: '公开零售价' }
  ];
  
  return (
    <div className="neon-border overflow-hidden rounded-xl bg-white">
      <div className="p-3 bg-gray-50 border-b border-gray-100">
        <h4 className="text-sm font-medium text-gray-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          商品参数对比
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-violet-500/10">
              <th className="text-left p-3 text-gray-500 font-medium text-xs">参数</th>
              <th className="text-left p-3 text-violet-300 font-semibold text-xs">{productA.name}</th>
              <th className="text-left p-3 text-fuchsia-300 font-semibold text-xs">{productB.name}</th>
            </tr>
          </thead>
          <tbody>
            {compareFields.map(field => (
              <tr key={field.key} className="border-b border-violet-500/5 hover:bg-violet-500/5 transition-colors">
                <td className="p-3 text-gray-500 text-xs">{field.label}</td>
                <td className="p-3 text-gray-300 text-xs">{productA[field.key]}{field.key === 'price' && '元'}</td>
                <td className="p-3 text-gray-300 text-xs">{productB[field.key]}{field.key === 'price' && '元'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 4. 参数咨询 - 展示知识库答案和相关商品
export const ParameterQuery = ({ question: _question, answer, relatedProduct }) => {
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 rounded-xl p-4 border border-violet-500/10">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="w-3 h-3 text-violet-400" />
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{answer}</p>
        </div>
      </div>
      {relatedProduct && (
        <div>
          <p className="mb-2 text-xs text-gray-500">商品参数卡：</p>
          <ProductCard product={relatedProduct} showActions={false} />
        </div>
      )}
    </div>
  );
};

// 5. 兼容性确认 - 显示兼容、无法确认或转人工状态
export const CompatibilityCheck = ({ status, deviceType, product }) => {
  return (
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#141428] border border-violet-500/20 rounded-2xl p-4">
      {status === 'compatible' && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-300">
              <span className="font-medium text-green-400">完全兼容！</span>
              <span className="text-gray-400"> {product?.name} 可以正常连接 {deviceType}</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              连接方式：{product?.connection}；支持平台：{product?.platform}。
            </p>
          </div>
        </div>
      )}
      {status === 'incompatible' && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-300">
              <span className="font-medium text-red-400">不兼容</span>
              <span className="text-gray-400"> {product?.name} 暂时无法连接 {deviceType}</span>
            </p>
          </div>
        </div>
      )}
      {status === 'unknown' && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              {deviceType === '该设备'
                ? `${product?.name}支持${product?.connection}，兼容平台为${product?.platform}。`
                : `抱歉，我暂时无法确认 ${product?.name} 是否支持 ${deviceType}。`}
            </p>
            {deviceType !== '该设备' && (
              <p className="mt-2 text-xs text-gray-500">当前版本暂未接入人工转接，请通过正式渠道确认。</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const QuoteAudit = ({ quote }) => {
  if (!quote) return null;
  return (
    <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
      {quote.valuePoints?.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium text-gray-600">报价前价值点校验</p>
          <ul className="space-y-1 text-xs text-gray-500">
            {quote.valuePoints.map(point => <li key={point}>• {point}</li>)}
          </ul>
        </div>
      )}
      {quote.ruleChecks?.length > 0 && (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {quote.ruleChecks.map(check => (
            <div key={check.name} className={`rounded-lg px-2.5 py-2 text-xs ${check.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
              <span className="font-medium">{check.passed ? '✓' : '!'} {check.name}</span>
              <span className="ml-1 opacity-80">{check.detail}</span>
            </div>
          ))}
        </div>
      )}
      {quote.missingFields?.length > 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          形成成交报价前还需确认：{quote.missingFields.join('、')}。
        </p>
      )}
      <p className="text-xs text-gray-500">{quote.discountMessage}</p>
    </div>
  );
};

// 6. 询价 - 展示价格卡片
export const PriceInquiry = ({ product, products = [], priceType, quote }) => {
  const typeLabels = {
    'open': '公开标价',
    'range': '参考区间',
    'estimated': '预估到手价',
    'formal': '规则成交报价',
    'promotion': '已确认活动价',
    'approval_required': '超出自动权限',
    'rejected_offer': '出价不符合规则'
  };
  
  return (
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#141428] border border-violet-500/20 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-1 rounded-lg border border-violet-500/20">
          {typeLabels[priceType] || '价格'}
        </span>
        {priceType === 'open' && (
          <span className="text-[10px] text-gray-500">实际到手价受活动影响</span>
        )}
        {priceType === 'range' && (
          <span className="text-[10px] text-gray-500">非最终报价</span>
        )}
        {priceType === 'estimated' && (
          <span className="text-[10px] text-gray-500">最终以结算为准</span>
        )}
      </div>
      
      {priceType === 'range' || !product ? (
        <div>
          <p className="text-sm text-gray-600 mb-2">L1系列公开零售价：</p>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-primary">¥{Math.min(...products.map(item => item.price))}</span>
            <span className="text-gray-400">~</span>
            <span className="text-lg font-bold text-primary">¥{Math.max(...products.map(item => item.price))}</span>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-primary">¥{quote?.unitPrice ?? product?.price}</span>
            <span className="text-sm text-gray-400">单价</span>
          </div>
          <div className="text-xs text-gray-500">
            <p>商品：{product?.name}</p>
            {quote && <p>数量：{quote.quantity}；合计：¥{quote.totalPrice}</p>}
            {quote && <p>渠道：{quote.channel}；活动：{quote.campaign}</p>}
            <p>库存：{product?.stockStatus || '待实时查询'}</p>
          </div>
        </div>
      )}
      <QuoteAudit quote={quote} />
    </div>
  );
};

// 7. 议价优惠 - 显示优惠说明或审批提示
export const BargainPrompt = ({ message, isApproving, quote }) => {
  return (
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#141428] border border-violet-500/20 rounded-2xl p-4">
      {isApproving ? (
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <div>
            <p className="text-sm text-gray-300 font-medium">正在为您申请优惠...</p>
            <p className="text-xs text-gray-500 mt-0.5">预计1分钟内有结果</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">{message}</p>
          <p className="text-xs text-gray-500">当前版本不接入人工审批，也不会承诺未确认优惠。</p>
          <QuoteAudit quote={quote} />
        </div>
      )}
    </div>
  );
};

// 8. 库存物流 - 显示库存和物流查询结果
export const StockLogistics = ({ product, stockInfo, estimatedDelivery }) => {
  return (
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#141428] border border-violet-500/20 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${stockInfo.available ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
          {stockInfo.available ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-200 mb-2">
            {product?.name} - 
            <span className={stockInfo.available ? 'text-green-400' : 'text-red-400'}>
              {stockInfo.available ? `有货（${stockInfo.count}件）` : '暂时缺货'}
            </span>
          </p>
          {stockInfo.available && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>预计 <span className="text-violet-300">{estimatedDelivery}</span> 送达</span>
            </div>
          )}
          <div className="text-xs text-gray-600 space-y-0.5">
            <p>发货仓：<span className="text-gray-400">{stockInfo.warehouse}</span></p>
            <p>配送方式：<span className="text-gray-400">顺丰速运（免费）</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 9. 企业采购 - 展示联系销售入口
export const EnterprisePurchase = ({ onContact }) => {
  return (
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#141428] border border-violet-500/20 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            企业采购可以享受专属优惠，我们有专业的销售团队为您服务。
          </p>
          <button 
            onClick={onContact}
            className="cyber-btn flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all"
          >
            <User className="w-4 h-4" />
            联系企业销售
          </button>
          <p className="text-xs text-gray-600 mt-2">工作时间：周一至周五 9:00-18:00</p>
        </div>
      </div>
    </div>
  );
};

// 10. 成交推进 - 突出购买链接按钮
export const PurchasePush = ({ product, onBuy, onHuman }) => {
  return (
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#141428] border border-violet-500/20 rounded-2xl p-4">
      <p className="text-sm text-gray-300 mb-3 leading-relaxed">
        好的！这款 <span className="font-semibold text-gradient-dragon">{product?.name}</span> 很适合您，要现在购买吗？
      </p>
      <div className="flex gap-2">
        <button 
          onClick={onBuy}
          className="cyber-btn flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-3 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          立即购买
        </button>
        <button 
          onClick={onHuman}
          className="bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/30 text-gray-300 py-3 px-4 rounded-xl text-sm hover:border-violet-500/60 hover:text-violet-300 transition-all"
        >
          咨询顾问
        </button>
      </div>
    </div>
  );
};

// 11. 订单售后 - 引导进入售后或联系人工
export const AfterSalesGuide = ({ onTransferHuman }) => {
  return (
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#141428] border border-violet-500/20 rounded-2xl p-4">
      <p className="text-sm text-gray-300 mb-3 leading-relaxed">
        关于售后问题，我们的人工客服可以更好地为您处理。
      </p>
      <div className="space-y-2">
        <button 
          onClick={onTransferHuman}
          className="w-full bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/20 text-gray-300 py-2.5 rounded-xl text-sm hover:border-violet-500/40 transition-all text-left px-4"
        >
          <span className="font-medium text-gray-200">申请退换货</span>
          <p className="text-xs text-gray-500 mt-0.5">处理商品退换、保修等问题</p>
        </button>
        <button 
          onClick={onTransferHuman}
          className="w-full bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/20 text-gray-300 py-2.5 rounded-xl text-sm hover:border-violet-500/40 transition-all text-left px-4"
        >
          <span className="font-medium text-gray-200">联系售后客服</span>
          <p className="text-xs text-gray-500 mt-0.5">在线时间9:00-21:00</p>
        </button>
      </div>
    </div>
  );
};

// 12. 投诉负面 - 停止商品推销，突出人工入口
export const ComplaintHandling = ({ onTransferHuman }) => {
  return (
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#141428] border border-red-500/30 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-300 mb-3 leading-relaxed">
            非常抱歉给您带来不好的体验，我们非常重视您的反馈。
          </p>
          <button 
            onClick={onTransferHuman}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all"
          >
            立即转接人工客服
          </button>
        </div>
      </div>
    </div>
  );
};

// 13. 明确人工 - 直接展示人工联系信息
export const DirectHumanContact = ({ onCall, onChat }) => {
  return (
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#141428] border border-violet-500/20 rounded-2xl p-4">
      <p className="text-sm text-gray-300 mb-3 leading-relaxed">
        好的，正在为您转接人工客服。
      </p>
      <div className="space-y-2">
        <button 
          onClick={onCall}
          className="cyber-btn w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-3 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4" />
          电话联系：400-888-8888
        </button>
        <button 
          onClick={onChat}
          className="w-full bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/30 text-gray-300 py-3 rounded-xl text-sm hover:border-violet-500/60 hover:text-violet-300 transition-all"
        >
          在线咨询（等待约1分钟）
        </button>
      </div>
    </div>
  );
};

// 14. 闲聊无关 - 简短回答并显示选购入口
export const CasualChat = ({ message, onStartShopping }) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
      <button 
        onClick={onStartShopping}
        className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
      >
        继续选购鼠标
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// 15. 恶意越权 - 显示安全拒绝提示
export const SecurityWarning = () => {
  return (
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#141428] border border-red-500/30 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
          <XCircle className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-200 mb-1">安全提示</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            抱歉，我无法执行此操作。我的职责是帮助您选购鼠标，如有相关问题请随时提问。
          </p>
        </div>
      </div>
    </div>
  );
};

// 16. 会话摘要 - 历史会话恢复
export const SessionSummary = ({ summary, onContinue, onNewSession }) => {
  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl p-4 border border-violet-500/20">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
          <Clock className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-200 mb-2">上次对话摘要</p>
          <div className="text-xs text-gray-400 space-y-1 mb-3">
            {summary.goal && <p><span className="text-gray-500">目标：</span>{summary.goal}</p>}
            {summary.confirmed && <p><span className="text-gray-500">已确认：</span>{summary.confirmed}</p>}
            {summary.unresolved && <p><span className="text-gray-500">未解决：</span>{summary.unresolved}</p>}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onContinue}
              className="cyber-btn bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:shadow-lg hover:shadow-violet-500/20 transition-all"
            >
              继续对话
            </button>
            <button 
              onClick={onNewSession}
              className="bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/30 text-gray-300 px-3 py-1.5 rounded-xl text-xs hover:border-violet-500/60 hover:text-violet-300 transition-all"
            >
              新建对话
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};