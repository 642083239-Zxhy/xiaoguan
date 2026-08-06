import React, { useState } from 'react';
import { X, Package, HelpCircle, MessageSquare, Database, Plus, Trash2, Edit2, Save } from 'lucide-react';
import {
  getAnalytics,
  getFaqs,
  getScripts,
  getSkus,
  saveFaqs,
  saveScripts,
  saveSkus
} from '../services/dataStore';

/**
 * 后台配置页面组件
 * 包含SKU管理、FAQ管理、话术配置、知识库更新四个标签页
 */
const AdminPanel = ({ isOpen, onClose, onDataChange }) => {
  const [activeTab, setActiveTab] = useState('sku');
  const [skus, setSkus] = useState(() => getSkus());
  const [faqs, setFaqs] = useState(() => getFaqs());
  const [scripts, setScripts] = useState(() => getScripts());
  const [editingItem, setEditingItem] = useState(null);

  if (!isOpen) return null;
  const analytics = getAnalytics();

  const tabs = [
    { id: 'sku', name: 'SKU管理', icon: Package },
    { id: 'faq', name: 'FAQ管理', icon: HelpCircle },
    { id: 'script', name: '话术配置', icon: MessageSquare },
    { id: 'knowledge', name: '知识库更新', icon: Database }
  ];

  // SKU表单字段
  const skuFields = [
    { key: 'name', label: '商品名称', type: 'text' },
    { key: 'tier', label: '产品档位', type: 'select', options: ['入门', '进阶', '旗舰'] },
    { key: 'scenario', label: '适用场景', type: 'text' },
    { key: 'dpi', label: 'DPI', type: 'text' },
    { key: 'weight', label: '重量', type: 'text' },
    { key: 'connection', label: '连接方式', type: 'text' },
    { key: 'price', label: '公开零售价', type: 'number' },
    { key: 'stock', label: '库存', type: 'number' },
    { key: 'reason', label: '推荐理由', type: 'text' },
    { key: 'target', label: '适用人群', type: 'text' }
  ];

  // FAQ表单字段
  const faqFields = [
    { key: 'question', label: '问题', type: 'text' },
    { key: 'answer', label: '答案', type: 'textarea' }
  ];

  // 保存SKU
  const handleSaveSku = (sku) => {
    if (!sku.name?.trim() || !sku.price) return;
    const normalized = { ...sku, price: Number(sku.price), stock: sku.stock === '' ? null : Number(sku.stock) };
    const next = sku.id
      ? skus.map(item => item.id === sku.id ? normalized : item)
      : [...skus, { ...normalized, id: `SKU${Date.now()}` }];
    setSkus(saveSkus(next));
    onDataChange?.();
    setEditingItem(null);
  };

  // 删除SKU
  const handleDeleteSku = (id) => {
    setSkus(saveSkus(skus.filter(item => item.id !== id)));
    onDataChange?.();
  };

  // 保存FAQ
  const handleSaveFaq = (faq) => {
    if (!faq.question?.trim() || !faq.answer?.trim()) return;
    const next = faq.id
      ? faqs.map(item => item.id === faq.id ? faq : item)
      : [...faqs, { ...faq, id: Date.now() }];
    setFaqs(saveFaqs(next));
    onDataChange?.();
    setEditingItem(null);
  };

  // 删除FAQ
  const handleDeleteFaq = (id) => {
    setFaqs(saveFaqs(faqs.filter(item => item.id !== id)));
    onDataChange?.();
  };

  // 保存话术
  const handleSaveScript = (key, value) => {
    const next = { ...scripts, [key]: value };
    setScripts(saveScripts(next));
    onDataChange?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black-30"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col m-auto">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">后台配置管理</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingItem(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* SKU管理 */}
          {activeTab === 'sku' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">共 {skus.length} 款商品</span>
                <button
                  onClick={() => setEditingItem({})}
                  className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  新增商品
                </button>
              </div>

              {editingItem && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">
                    {editingItem.id ? '编辑商品' : '新增商品'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {skuFields.map(field => (
                      <div key={field.key} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                        <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                        {field.type === 'select' ? (
                          <select
                            value={editingItem[field.key] || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, [field.key]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          >
                            <option value="">请选择</option>
                            {field.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            value={editingItem[field.key] || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, [field.key]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                            rows={3}
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={editingItem[field.key] || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, [field.key]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleSaveSku(editingItem)}
                      className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary/90 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {skus.map(sku => (
                  <div key={sku.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">{sku.name}</h4>
                      <p className="text-xs text-gray-500">{sku.tier} · ¥{sku.price} · 库存{sku.stock}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingItem(sku)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteSku(sku.id)}
                        className="p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ管理 */}
          {activeTab === 'faq' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">共 {faqs.length} 条FAQ</span>
                <button
                  onClick={() => setEditingItem({ question: '', answer: '' })}
                  className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  新增FAQ
                </button>
              </div>

              {editingItem && editingItem.question !== undefined && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">
                    {editingItem.id ? '编辑FAQ' : '新增FAQ'}
                  </h3>
                  <div className="space-y-3">
                    {faqFields.map(field => (
                      <div key={field.key}>
                        <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={editingItem[field.key] || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, [field.key]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                            rows={3}
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={editingItem[field.key] || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, [field.key]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleSaveFaq(editingItem)}
                      className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary/90 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {faqs.map(faq => (
                  <div key={faq.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-800">{faq.question}</h4>
                        <p className="text-xs text-gray-500 mt-1">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem(faq)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 话术配置 */}
          {activeTab === 'script' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">配置各场景下的AI话术模板</p>
              <div className="space-y-3">
                {Object.entries(scripts).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="text-xs text-gray-500 mb-1 block font-medium">{key}</label>
                    <textarea
                      value={value}
                      onChange={(e) => handleSaveScript(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none bg-white"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 知识库更新 */}
          {activeTab === 'knowledge' && (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-2">知识库与数据状态</p>
              <p className="text-sm text-gray-500 mb-6">文档上传与本地向量化属于本期不做范围，请在百炼控制台维护知识库；本页面负责调用已发布的知识库应用。</p>
              <div className="max-w-sm mx-auto rounded-xl border border-blue-200 bg-blue-50 p-4 text-left text-sm text-blue-800">
                <p className="font-medium">使用步骤</p>
                <p className="mt-1 text-xs leading-5">先在百炼应用中绑定并发布知识库，再点击网页顶部钥匙图标，填写APP_ID和API Key。</p>
              </div>
              <div className="mt-8 text-left max-w-sm mx-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-2">本地结构化数据</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">SKU数据</span>
                    <span className="text-green-600">{skus.length} 条</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">FAQ问答</span>
                    <span className="text-green-600">{faqs.length} 条</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">话术模板</span>
                    <span className="text-green-600">{Object.keys(scripts).length} 条</span>
                  </div>
                  <div className="mt-3 border-t border-gray-100 pt-3 flex justify-between text-sm">
                    <span className="text-gray-500">购买入口点击</span>
                    <span className="text-primary">{analytics.purchaseClicks} 次</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">顾问入口点击</span>
                    <span className="text-primary">{analytics.contactClicks} 次</span>
                  </div>
                  <div className="mt-3 border-t border-gray-100 pt-3 flex justify-between text-sm">
                    <span className="text-gray-500">有效会话</span>
                    <span className="text-gray-700">{analytics.sessionCount} 个</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">已转化会话</span>
                    <span className="text-gray-700">{analytics.convertedSessionCount} 个</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">按钮转化率</span>
                    <span className={analytics.conversionRate >= 5 ? 'text-green-600' : 'text-amber-600'}>
                      {analytics.conversionRate}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {analytics.sessionCount === 0
                      ? '产生会话后开始统计5%验收指标。'
                      : analytics.conversionRate >= 5
                        ? '已达到转化率不低于5%的验收目标。'
                        : '当前低于5%验收目标，可继续优化推荐与行动按钮。'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
