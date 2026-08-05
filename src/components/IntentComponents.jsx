import React from 'react';
import { XCircle, AlertCircle, CheckCircle, Clock, User, ShoppingBag } from 'lucide-react';
import { ProductCard } from './ProductCard';

/**
 * 意图表现组件集合
 * 根据不同用户意图展示对应的前端组件
 */

// 1. 选购咨询 - 展示场景、预算快捷选项
export const SelectionConsultation = ({ onSelectScene, onSelectBudget }) => {
  const scenes = ['办公', '游戏', '设计', '便携'];
  const budgets = ['150元内', '150~400元', '400元以上'];
  
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-2">请问您主要用鼠标做什么？预算大概多少？</p>
      <div>
        <span className="text-xs text-gray-500 mb-2 block">使用场景：</span>
        <div className="flex gap-2 flex-wrap">
          {scenes.map(scene => (
            <button
              key={scene}
              onClick={() => onSelectScene(scene)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              {scene}
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
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
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
    <div className="space-y-2">
      <p className="text-sm text-gray-600">我为您推荐以下几款鼠标：</p>
      <div className="space-y-2">
        {products.map((product, index) => (
          <div key={product.id}>
            {index > 0 && <div className="text-gray-300 my-2 text-xs">或</div>}
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-100">
        <h4 className="text-sm font-medium text-gray-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          商品参数对比
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-3 text-gray-500 font-medium">参数</th>
              <th className="text-left p-3 text-gray-800 font-medium">{productA.name}</th>
              <th className="text-left p-3 text-gray-800 font-medium">{productB.name}</th>
            </tr>
          </thead>
          <tbody>
            {compareFields.map(field => (
              <tr key={field.key} className="border-b border-gray-50">
                <td className="p-3 text-gray-500">{field.label}</td>
                <td className="p-3 text-gray-700">{productA[field.key]}{field.key === 'price' && '元'}</td>
                <td className="p-3 text-gray-700">{productB[field.key]}{field.key === 'price' && '元'}</td>
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
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-700">{answer}</p>
      </div>
      {relatedProduct && (
        <div>
          <p className="text-xs text-gray-500 mb-2">相关商品推荐：</p>
          <ProductCard product={relatedProduct} showActions={false} />
        </div>
      )}
    </div>
  );
};

// 5. 兼容性确认 - 显示兼容、无法确认或转人工状态
export const CompatibilityCheck = ({ status, deviceType, product, onTransferHuman }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {status === 'compatible' && (
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium text-green-600">完全兼容！</span>
              {product?.name} 可以正常连接 {deviceType}。
            </p>
          </div>
        </div>
      )}
      {status === 'incompatible' && (
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium text-red-600">不兼容</span>
              {product?.name} 暂时无法连接 {deviceType}。
            </p>
          </div>
        </div>
      )}
      {status === 'unknown' && (
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              抱歉，我暂时无法确认 {product?.name} 是否支持 {deviceType}。
            </p>
            <button 
              onClick={onTransferHuman}
              className="mt-2 text-sm text-primary hover:underline"
            >
              转接人工客服确认
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
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {typeLabels[priceType] || '价格'}
        </span>
        {priceType === 'open' && (
          <span className="text-xs text-gray-400">实际到手价受活动影响</span>
        )}
        {priceType === 'range' && (
          <span className="text-xs text-gray-400">非最终报价</span>
        )}
        {priceType === 'estimated' && (
          <span className="text-xs text-gray-400">最终以结算为准</span>
        )}
      </div>
      
      {priceType === 'range' ? (
        <div>
          <p className="text-sm text-gray-600 mb-2">鼠标价格区间：</p>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-primary">¥89</span>
            <span className="text-gray-400">~</span>
            <span className="text-lg font-bold text-primary">¥599</span>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-primary">¥{product?.price}</span>
            <span className="text-sm text-gray-400">起</span>
          </div>
          <div className="text-xs text-gray-500">
            <p>商品：{product?.name}</p>
            <p>库存：{product?.stock} 件</p>
          </div>
        </div>
      )}
      
      {priceType === 'formal' && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">商品金额</span>
            <span>¥{product?.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">优惠</span>
            <span className="text-green-600">-¥50</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>合计</span>
            <span className="text-primary">¥{product?.price - 50}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 7. 议价优惠 - 显示优惠说明或审批提示
export const BargainPrompt = ({ message, isApproving, onTransferHuman }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {isApproving ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
          <div>
            <p className="text-sm text-gray-700 font-medium">正在为您申请优惠...</p>
            <p className="text-xs text-gray-500 mt-1">预计1分钟内有结果</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">{message}</p>
          <div className="flex gap-2">
            <button 
              onClick={onTransferHuman}
              className="text-sm text-primary hover:underline"
            >
              申请更多优惠 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 8. 库存物流 - 显示库存和物流查询结果
export const StockLogistics = ({ product, stockInfo, estimatedDelivery }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        {stockInfo.available ? (
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 mb-2">
            {product?.name} - 
            <span className={stockInfo.available ? 'text-green-600' : 'text-red-600'}>
              {stockInfo.available ? `有货（${stockInfo.count}件）` : '暂时缺货'}
            </span>
          </p>
          {stockInfo.available && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-4 h-4" />
              <span>预计 {estimatedDelivery} 送达</span>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500">
            <p>发货仓：{stockInfo.warehouse}</p>
            <p>配送方式：顺丰速运（免费）</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 9. 企业采购 - 展示联系销售入口
export const EnterprisePurchase = ({ onContact }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <ShoppingBag className="w-5 h-5 text-primary mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-gray-700 mb-3">
            企业采购可以享受专属优惠，我们有专业的销售团队为您服务。
          </p>
          <button 
            onClick={onContact}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            <User className="w-4 h-4" />
            联系企业销售
          </button>
          <p className="text-xs text-gray-400 mt-2">工作时间：周一至周五 9:00-18:00</p>
        </div>
      </div>
    </div>
  );
};

// 10. 成交推进 - 突出购买链接按钮
export const PurchasePush = ({ product, onBuy, onHuman }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-700 mb-3">
        好的！这款 <span className="font-medium text-primary">{product?.name}</span> 很适合您，要现在购买吗？
      </p>
      <div className="flex gap-2">
        <button 
          onClick={onBuy}
          className="flex-1 bg-primary text-white py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          立即购买
        </button>
        <button 
          onClick={onHuman}
          className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-sm hover:bg-gray-200 transition-colors"
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
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-700 mb-3">
        关于售后问题，我们的人工客服可以更好地为您处理。
      </p>
      <div className="space-y-2">
        <button 
          onClick={onTransferHuman}
          className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors text-left px-4"
        >
          <span className="font-medium">申请退换货</span>
          <p className="text-xs text-gray-500 mt-0.5">处理商品退换、保修等问题</p>
        </button>
        <button 
          onClick={onTransferHuman}
          className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors text-left px-4"
        >
          <span className="font-medium">联系售后客服</span>
          <p className="text-xs text-gray-500 mt-0.5">在线时间9:00-21:00</p>
        </button>
      </div>
    </div>
  );
};

// 12. 投诉负面 - 停止商品推销，突出人工入口
export const ComplaintHandling = ({ onTransferHuman }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 border-red-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-gray-700 mb-2">
            非常抱歉给您带来不好的体验，我们非常重视您的反馈。
          </p>
          <button 
            onClick={onTransferHuman}
            className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
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
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-700 mb-3">
        好的，正在为您转接人工客服。
      </p>
      <div className="space-y-2">
        <button 
          onClick={onCall}
          className="w-full bg-primary text-white py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4" />
          电话联系：400-888-8888
        </button>
        <button 
          onClick={onChat}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg text-sm hover:bg-gray-200 transition-colors"
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
      <p className="text-sm text-gray-700">{message}</p>
      <button 
        onClick={onStartShopping}
        className="text-sm text-primary hover:underline"
      >
        继续选购鼠标 →
      </button>
    </div>
  );
};

// 15. 恶意越权 - 显示安全拒绝提示
export const SecurityWarning = () => {
  return (
    <div className="bg-white rounded-xl border border-red-200 p-4">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
        <div>
          <p className="text-sm text-gray-700 font-medium mb-1">安全提示</p>
          <p className="text-sm text-gray-600">
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
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-primary mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 mb-2">上次对话摘要</p>
          <div className="text-xs text-gray-600 space-y-1 mb-3">
            {summary.goal && <p><span className="text-gray-400">目标：</span>{summary.goal}</p>}
            {summary.confirmed && <p><span className="text-gray-400">已确认：</span>{summary.confirmed}</p>}
            {summary.unresolved && <p><span className="text-gray-400">未解决：</span>{summary.unresolved}</p>}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onContinue}
              className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs hover:bg-primary/90 transition-colors"
            >
              继续对话
            </button>
            <button 
              onClick={onNewSession}
              className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-100 transition-colors border border-gray-200"
            >
              新建对话
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
