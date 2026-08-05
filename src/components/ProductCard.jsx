import React from 'react';
import { ShoppingCart, Headphones, Package, Zap, ArrowRight } from 'lucide-react';

/**
 * 商品推荐卡片组件
 * 雷龙品牌 - 赛博朋克紫色主题
 * 展示单款鼠标的核心信息和操作按钮
 */
const ProductCard = ({ product, showActions = true }) => {
  // 档位颜色映射 - 紫色科技风
  const tierStyles = {
    '入门': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    '进阶': 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    '旗舰': 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30'
  };

  return (
    <div className="card-hover relative bg-gradient-to-br from-[#1A1A2E] to-[#14142A] border border-violet-500/20 rounded-2xl p-4 w-full max-w-xs overflow-hidden group">
      {/* 顶部光效 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      
      {/* 图片占位 */}
      <div className="w-full h-28 placeholder-gradient rounded-xl mb-3 flex items-center justify-center relative overflow-hidden border border-violet-500/10 group-hover:border-violet-500/30 transition-all">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5" />
        {/* 中心图标 */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/20 group-hover:border-violet-500/40 group-hover:scale-110 transition-all">
            <Package className="w-7 h-7 text-violet-400 group-hover:text-violet-300 transition-colors" />
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-violet-400" />
            <span className="text-[10px] text-violet-400 tracking-wider font-medium">{product.connection}</span>
          </div>
        </div>
      </div>
      
      {/* 商品信息 */}
      <div className="space-y-3">
        {/* 名称和档位 */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-tight">{product.name}</h3>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium border ${tierStyles[product.tier] || 'bg-gray-700/30 text-gray-400 border-gray-600/30'}`}>
            {product.tier}
          </span>
        </div>
        
        {/* 参数列表 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-violet-500/5 rounded-lg p-2 border border-violet-500/10">
            <span className="text-[10px] text-gray-500 block">DPI</span>
            <span className="text-xs font-semibold text-violet-300">{product.dpi}</span>
          </div>
          <div className="bg-fuchsia-500/5 rounded-lg p-2 border border-fuchsia-500/10">
            <span className="text-[10px] text-gray-500 block">重量</span>
            <span className="text-xs font-semibold text-fuchsia-300">{product.weight}</span>
          </div>
          <div className="bg-purple-500/5 rounded-lg p-2 border border-purple-500/10">
            <span className="text-[10px] text-gray-500 block">连接</span>
            <span className="text-xs font-semibold text-purple-300 truncate">{product.connection?.split(' ')[0]}</span>
          </div>
        </div>
        
        {/* 价格 */}
        <div className="flex items-baseline gap-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-bold text-gradient-dragon">¥{product.price}</span>
          </div>
          <span className="text-[10px] text-gray-500 bg-gray-800/50 px-1.5 py-0.5 rounded">公开零售价</span>
        </div>
        
        {/* 推荐理由 */}
        <div className="bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 rounded-xl p-2.5 border border-violet-500/10">
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="text-violet-400 font-medium">推荐理由：</span>{product.reason}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                <span className="text-gray-600">适用场景：</span>{product.target}
              </p>
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        {showActions && (
          <div className="flex gap-2 pt-1">
            <button className="cyber-btn flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all group/btn">
              <ShoppingCart className="w-4 h-4" />
              <span>购买链接</span>
              <ArrowRight className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            </button>
            <button className="cyber-btn flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-fuchsia-500/30 text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:border-fuchsia-500/60 hover:text-fuchsia-300 transition-all">
              <Headphones className="w-4 h-4" />
              <span>联系顾问</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 多档商品推荐组组件
 * 展示性价比款、综合首选、旗舰升级款三档
 */
export const ProductRecommendGroup = ({ products, onSelect }) => {
  if (!products || products.length === 0) return null;

  const labels = ['性价比款', '综合首选', '旗舰升级款'];
  
  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm text-gray-300 font-medium">为您推荐以下方案</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        {products.slice(0, 3).map((product, index) => (
          <div key={product.id} className="relative">
            {labels[index] && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] px-2 py-1 rounded-full z-10 shadow-lg shadow-violet-500/30 font-medium">
                {labels[index]}
              </div>
            )}
            <ProductCard 
              product={product} 
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export { ProductCard };
export default ProductCard;