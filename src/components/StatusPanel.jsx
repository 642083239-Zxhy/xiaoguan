import React from 'react';
import { BrainCircuit, Package, Tag, X } from 'lucide-react';

/**
 * 会话状态面板组件
 * 雷龙品牌 - 赛博朋克紫色主题
 */
const StatusPanel = ({ currentCriteria, candidates, lastAnalysis, onRemoveCriteria, onClearCandidates, isOpen, onClose }) => {
  if (!isOpen) return null;

  const criteriaLabels = {
    scene: '场景',
    budget: '预算',
    device: '设备',
    hand: '手型',
    preference: '偏好',
    model: '型号',
    quantity: '数量',
    channel: '渠道',
    campaign: '活动'
  };

  const candidatesStatus = {
    available: 'bg-green-100 text-green-700',
    low: 'bg-yellow-100 text-yellow-700',
    out: 'bg-red-100 text-red-700',
    unknown: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* 侧边栏 */}
      <div className="relative w-80 bg-gradient-to-br from-[#1A1A2E] to-[#141428] border-l border-violet-500/20 h-full flex flex-col shadow-2xl">
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
        
        {/* 头部 */}
        <div className="p-4 border-b border-violet-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-white font-display tracking-wider">选购状态</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-violet-500/10 rounded-lg text-gray-400 hover:text-violet-300 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 最近一次内部路由结果 */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-1">
            <BrainCircuit className="w-4 h-4" />
            最近路由分析
          </h3>
          {!lastAnalysis ? (
            <p className="text-xs text-gray-400">发送问题后显示</p>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">主意图</span><span className="font-medium text-gray-700">{lastAnalysis.primary_intent_label}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">置信度</span><span className="text-gray-700">{Math.round(lastAnalysis.confidence * 100)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">情绪</span><span className="text-gray-700">{lastAnalysis.sentiment}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">下一动作</span><span className="text-gray-700">{lastAnalysis.next_action}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">次意图</span><span className="text-gray-700">{lastAnalysis.secondary_intent_labels?.join('、') || '无'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">风险标记</span><span className="text-gray-700">{lastAnalysis.risk_flags?.join('、') || '无'}</span></div>
              <div>
                <span className="text-gray-400">实体：</span>
                <span className="ml-1 break-all text-gray-700">{Object.keys(lastAnalysis.entities || {}).length ? JSON.stringify(lastAnalysis.entities) : '无'}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* 当前选购条件 */}
        <div className="p-4 border-b border-violet-500/10">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-violet-400" />
            当前选购条件
          </h3>
          
          {Object.keys(currentCriteria).length === 0 ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                <Tag className="w-5 h-5 text-violet-400/50" />
              </div>
              <p className="text-xs text-gray-500">暂无选购条件</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(currentCriteria).map(([key, value]) => (
                value && (
                  <div key={key} className="flex items-center justify-between bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 rounded-xl p-2.5 border border-violet-500/10">
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-6 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
                      <div>
                        <span className="text-xs text-gray-500">{criteriaLabels[key]}：</span>
                        <span className="text-sm text-violet-300 font-medium ml-1">{value}</span>
                      </div>
                    </div>
                    {onRemoveCriteria && (
                      <button 
                        onClick={() => onRemoveCriteria(key)}
                        className="p-1 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-400 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )
              ))}
              {onRemoveCriteria && Object.keys(currentCriteria).length > 0 && (
                <button 
                  onClick={onClearCandidates}
                  className="text-xs text-gray-500 hover:text-red-400 mt-2 transition-colors"
                >
                  清空所有条件
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* 候选商品列表 */}
        <div className="flex-1 overflow-y-auto p-4 scroll-container">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-fuchsia-400" />
              候选商品
            </h3>
            <span className="text-xs text-gray-500 bg-fuchsia-500/10 text-fuchsia-400 px-2 py-0.5 rounded-full border border-fuchsia-500/20">
              {candidates?.length || 0} 款
            </span>
          </div>
          
          {!candidates || candidates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                <Package className="w-6 h-6 text-fuchsia-400/50" />
              </div>
              <p className="text-xs text-gray-500">暂无候选商品</p>
              <p className="text-xs text-gray-600 mt-1">开始对话选择心仪产品</p>
            </div>
          ) : (
            <div className="space-y-2">
              {candidates.map((candidate) => {
                const status = candidatesStatus[candidate.status] || candidatesStatus.available;
                return (
                  <div 
                    key={candidate.id}
                    className="bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 border border-violet-500/10 rounded-xl p-3 hover:border-violet-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-200 truncate">{candidate.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <span className="text-violet-400">{candidate.tier}</span>
                          <span className="mx-1">·</span>
                          <span className="text-gradient-dragon font-medium">¥{candidate.price}</span>
                        </p>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs border ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${candidatesStatus[candidate.status] || 'bg-gray-100 text-gray-700'}`}>
                      {candidate.status === 'available' ? '有货' : candidate.status === 'low' ? '紧张' : candidate.status === 'out' ? '缺货' : '待查询'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;