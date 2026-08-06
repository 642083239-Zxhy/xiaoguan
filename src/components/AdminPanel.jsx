import React from 'react';
import { Database, X } from 'lucide-react';
import { getAnalytics } from '../services/dataStore';

const AdminPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const analytics = getAnalytics();

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black-30" onClick={onClose} />
      <div className="relative m-auto flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-800">知识库与运行统计</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100" aria-label="关闭后台面板">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <Database className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">商品知识统一在阿里云百炼维护</h3>
                <p className="mt-2 text-sm leading-6 text-blue-800">
                  本地不再保存或编辑SKU、FAQ和销售话术。请在百炼控制台更新知识库与应用提示词，发布应用后通过页面顶部“AI与知识库配置”连接。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 p-5">
            <h3 className="mb-4 text-sm font-medium text-gray-800">本地运行统计</h3>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Stat label="有效会话" value={`${analytics.sessionCount} 个`} />
              <Stat label="已转化会话" value={`${analytics.convertedSessionCount} 个`} />
              <Stat label="按钮转化率" value={`${analytics.conversionRate}%`} />
              <Stat label="购买入口点击" value={`${analytics.purchaseClicks} 次`} />
              <Stat label="顾问入口点击" value={`${analytics.contactClicks} 次`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="rounded-xl bg-gray-50 p-3">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="mt-1 font-medium text-gray-800">{value}</div>
  </div>
);

export default AdminPanel;
