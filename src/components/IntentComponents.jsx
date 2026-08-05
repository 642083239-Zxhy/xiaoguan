import React from 'react';
import { XCircle, AlertCircle, CheckCircle, Clock, User, ShoppingBag, Zap, ChevronRight, ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

/**
 * 意图表现组件集合
 * 根据不同用户意图展示对应的前端组件
 * 雷龙品牌 - 赛博朋克紫色主题
 */

// 1. 选购咨询 - 展示场景、预算快捷选项
export const SelectionConsultation = ({ onSelectScene, onSelectBudget }) => {
  const scenes = ['办公', '游戏', '设计', '便携'];
  const budgets = ['150元内', '150~400元', '400元以上'];
  
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          请问您主要用鼠标做什么？预算大概多少？
        </p>
      </div>
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
        <span className="text-xs text-gray-500 mb-2 block flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-fuchsia-400" />
          预算范围
        </span>
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
export const ProductRecommendation = ({ products, onSelect }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm text-gray-300 font-medium">为您推荐以下方案</span>
      </div>
      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={product.id}>
            {index > 0 && (
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                <span className="text-xs text-gray-500">或</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
              </div>
            )}
            <ProductCard product={product} onSelect={onSelect} />
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
    { key: 'dpi', label: 'DPI' },
    { key: 'weight', label: '重量' },
    { key: 'connection', label: '连接方式' },
    { key: 'price', label: '价格' },
    { key: 'stock', label: '库存' }
  ];
  
  return (
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#141428] border border-violet-500/20 rounded-2xl overflow-hidden">
      <div className="p-3 bg-violet-500/5 border-b border-violet-500/10">
        <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-violet-400" />
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
export const ParameterQuery = ({ question, answer, relatedProduct }) => {
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
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-fuchsia-400" />
            相关商品推荐
          </p>
          <ProductCard product={relatedProduct} showActions={false} />
        </div>
      )}
    </div>
  );
};

// 5. 兼容性确认 - 显示兼容、无法确认或转人工状态
export const CompatibilityCheck = ({ status, deviceType, product, onTransferHuman }) => {
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
            <p className="text-sm text-gray-300">
              抱歉，我暂时无法确认 <span className="text-violet-300 font-medium">{product?.name}</span> 是否支持 <span className="text-violet-300 font-medium">{deviceType}</span>。
            </p>
            <button 
              onClick={onTransferHuman}
              className="mt-3 text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
            >
              转接人工客服确认
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 6. 询价 - 展示价格卡片
export const PriceInquiry = ({ product, priceType }) => {
  const typeLabels = {
    'open': '公开标价',
    'range': '参考区间',
    'estimated': '预估到手价',
    'formal': '正式成交报价'
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
      
      {priceType === 'range' ? (
        <div>
          <p className="text-sm text-gray-400 mb-2">鼠标价格区间：</p>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-gradient-dragon">¥89</span>
            <span className="text-gray-500">~</span>
            <span className="text-2xl font-bold text-gradient-dragon">¥599</span>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-gradient-dragon">¥{product?.price}</span>
            <span className="text-sm text-gray-500">起</span>
          </div>
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>商品：<span className="text-gray-300">{product?.name}</span></p>
            <p>库存：<span className="text-gray-300">{product?.stock} 件</span></p>
          </div>
        </div>
      )}
      
      {priceType === 'formal' && (
        <div className="mt-3 pt-3 border-t border-violet-500/10 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-500">商品金额</span>
            <span className="text-gray-300">¥{product?.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">优惠</span>
            <span className="text-green-400">-¥50</span>
          </div>
          <div className="flex justify-between font-medium pt-1 border-t border-violet-500/5">
            <span className="text-gray-400">合计</span>
            <span className="text-gradient-dragon font-bold">¥{product?.price - 50}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 7. 议价优惠 - 显示优惠说明或审批提示
export const BargainPrompt = ({ message, isApproving, onTransferHuman }) => {
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
          <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
          <button 
            onClick={onTransferHuman}
            className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            申请更多优惠
            <ChevronRight className="w-4 h-4" />
          </button>
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