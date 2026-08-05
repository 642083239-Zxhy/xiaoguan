import React from 'react';
import { ShoppingCart, Headphones, Package } from 'lucide-react';

/**
 * 商品推荐卡片组件
 * 展示单款鼠标的核心信息和操作按钮
 */
const ProductCard = ({ product, showActions = true }) => {
  // 档位颜色映射
  const tierColors = {
    '入门': 'bg-green-100 text-green-700',
    '进阶': 'bg-blue-100 text-blue-700',
    '旗舰': 'bg-purple-100 text-purple-700'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 w-full max-w-xs shadow-sm hover:shadow-md transition-shadow">
      {/* 图片占位 */}
      <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
        <Package className="w-12 h-12 text-gray-400" />
      </div>
      
      {/* 商品信息 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{product.name}</h3>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${tierColors[product.tier] || 'bg-gray-100 text-gray-700'}`}>
            {product.tier}
          </span>
        </div>
        
        {/* 参数列表 */}
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="flex flex-col">
            <span className="text-gray-400">DPI</span>
            <span className="font-medium text-gray-700">{product.dpi}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400">重量</span>
            <span className="font-medium text-gray-700">{product.weight}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400">连接</span>
            <span className="font-medium text-gray-700 text-xs truncate">{product.connection}</span>
          </div>
        </div>
        
        {/* 价格 */}
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-primary">¥{product.price}</span>
          <span className="text-xs text-gray-400">公开零售价</span>
        </div>
        
        {/* 推荐理由 */}
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-600">
            <span className="text-gray-400">推荐理由：</span>{product.reason}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <span className="text-gray-400">适用场景：</span>{product.target}
          </p>
        </div>
        
        {/* 操作按钮 */}
        {showActions && (
          <div className="flex gap-2 pt-1">
            <button className="flex-1 flex items-center justify-center gap-1 bg-primary text-white py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              购买链接
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              <Headphones className="w-4 h-4" />
              联系顾问
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
      <div className="mb-2 text-sm text-gray-600">为您推荐以下方案：</div>
      <div className="flex gap-3 flex-wrap">
        {products.slice(0, 3).map((product, index) => (
          <div key={product.id} className="relative">
            {labels[index] && (
              <div className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-0.5 rounded-full z-10">
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
