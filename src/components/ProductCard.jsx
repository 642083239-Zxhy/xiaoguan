import React from 'react';
import { ShoppingCart, Headphones, Zap } from 'lucide-react';

/**
 * 商品推荐卡片组件
 * 雷龙品牌 - 赛博朋克紫色主题
 * 展示单款鼠标的核心信息和操作按钮
 */
const ProductCard = ({ product, showActions = true, onBuy, onHuman }) => {
  // 档位颜色映射
  const tierColors = {
    '入门': 'bg-green-100 text-green-700',
    '进阶': 'bg-blue-100 text-blue-700',
    '旗舰': 'bg-purple-100 text-purple-700',
    '基础版': 'bg-blue-100 text-blue-700',
    'Pro版': 'bg-purple-100 text-purple-700'
  };
  const specs = [
    ['传感器', product.sensor],
    ['DPI', product.dpi],
    ['重量', product.weight],
    ['回报率', product.pollingRate],
    ['连接方式', product.connection],
    ['续航', product.battery]
  ];

  return (
    <div className="neon-border h-full w-full rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-neon-purple">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-800">{product.name}</h3>
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${tierColors[product.tier] || 'bg-gray-100 text-gray-700'}`}>
                {product.tier}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{product.scenario}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary">¥{product.price}</div>
            <div className="text-[10px] text-gray-400">公开零售价</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs md:grid-cols-3">
          {specs.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <div className="text-gray-400">{label}</div>
              <div className="mt-0.5 break-words font-medium leading-5 text-gray-700">{value || '暂无数据'}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs leading-5 text-gray-600">
            <span className="text-gray-400">推荐理由：</span>{product.reason}
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            <span className="text-gray-400">适用场景：</span>{product.target}
          </p>
          {product.matchReasons?.length > 0 && (
            <div className="mt-2 border-t border-gray-200 pt-2 text-xs leading-5 text-emerald-700">
              {product.matchReasons.map(item => <p key={item}>✓ {item}</p>)}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onBuy?.(product)}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary py-2 text-sm text-white transition-colors hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4" />
              购买链接
            </button>
            <button
              onClick={() => onHuman?.(product)}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gray-100 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Headphones className="h-4 w-4" />
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
