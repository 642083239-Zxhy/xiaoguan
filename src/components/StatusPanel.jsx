import React from 'react';
import { Tag, Package, X } from 'lucide-react';

/**
 * 会话状态面板组件
 * 显示当前选购条件、候选商品列表
 */
const StatusPanel = ({ currentCriteria, candidates, onRemoveCriteria, onClearCandidates, isOpen, onClose }) => {
  if (!isOpen) return null;

  const criteriaLabels = {
    scene: '场景',
    budget: '预算',
    device: '设备',
    hand: '手型',
    preference: '偏好'
  };

  const candidatesStatus = {
    available: 'bg-green-100 text-green-700',
    low: 'bg-yellow-100 text-yellow-700',
    out: 'bg-red-100 text-red-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      
      {/* 侧边栏 */}
      <div className="relative w-80 bg-white h-full shadow-xl flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">选购状态</h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* 当前选购条件 */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-1">
            <Tag className="w-4 h-4" />
            当前选购条件
          </h3>
          
          {Object.keys(currentCriteria).length === 0 ? (
            <p className="text-xs text-gray-400">暂无</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(currentCriteria).map(([key, value]) => (
                value && (
                  <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <div>
                      <span className="text-xs text-gray-400">{criteriaLabels[key]}：</span>
                      <span className="text-sm text-gray-700 font-medium ml-1">{value}</span>
                    </div>
                    {onRemoveCriteria && (
                      <button 
                        onClick={() => onRemoveCriteria(key)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    )}
                  </div>
                )
              ))}
              {onRemoveCriteria && Object.keys(currentCriteria).length > 0 && (
                <button 
                  onClick={onClearCandidates}
                  className="text-xs text-gray-400 hover:text-red-500 mt-2"
                >
                  清空所有条件
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* 候选商品列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <Package className="w-4 h-4" />
              候选商品
            </h3>
            <span className="text-xs text-gray-400">{candidates?.length || 0} 款</span>
          </div>
          
          {!candidates || candidates.length === 0 ? (
            <p className="text-xs text-gray-400">暂无候选商品</p>
          ) : (
            <div className="space-y-2">
              {candidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{candidate.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{candidate.tier} · ¥{candidate.price}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${candidatesStatus[candidate.status] || 'bg-gray-100 text-gray-700'}`}>
                      {candidate.status === 'available' ? '有货' : candidate.status === 'low' ? '紧张' : '缺货'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;
