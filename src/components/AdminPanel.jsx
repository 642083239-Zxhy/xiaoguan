import React, { useState } from 'react';
import { X, Package, HelpCircle, MessageSquare, Database, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { mockSkus, mockFaqs, mockScripts } from '../data/mockData';

/**
 * 后台配置页面组件
 * 包含SKU管理、FAQ管理、话术配置、知识库更新四个标签页
 */
const AdminPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('sku');
  const [skus, setSkus] = useState(mockSkus);
  const [faqs, setFaqs] = useState(mockFaqs);
  const [scripts, setScripts] = useState(mockScripts);
  const [editingItem, setEditingItem] = useState(null);

  if (!isOpen) return null;

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
    if (sku.id) {
      setSkus(skus.map(s => s.id === sku.id ? sku : s));
    } else {
      setSkus([...skus, { ...sku, id: `SKU${Date.now()}` }]);
    }
    setEditingItem(null);
  };

  // 删除SKU
  const handleDeleteSku = (id) => {
    setSkus(skus.filter(s => s.id !== id));
  };

  // 保存FAQ
  const handleSaveFaq = (faq) => {
    if (faq.id) {
      setFaqs(faqs.map(f => f.id === faq.id ? faq : f));
    } else {
      setFaqs([...faqs, { ...faq, id: Date.now() }]);
    }
    setEditingItem(null);
  };

  // 删除FAQ
  const handleDeleteFaq = (id) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };

  // 保存话术
  const handleSaveScript = (key, value) => {
    setScripts({ ...scripts, [key]: value });
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
              onClick={() => setActiveTab(tab.id)}
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
                  onClick={() => setEditingItem({})}
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
              <p className="text-gray-600 mb-2">知识库更新功能</p>
              <p className="text-sm text-gray-400 mb-6">此功能将在API对接后启用，用于上传产品文档、FAQ等资料向量化入库</p>
              <div className="max-w-sm mx-auto space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-primary transition-colors">
                  <p className="text-sm text-gray-500">拖拽文件到此处或点击上传</p>
                  <p className="text-xs text-gray-400 mt-1">支持PDF、Word、Excel格式</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors">
                  选择文件上传
                </button>
              </div>
              <div className="mt-8 text-left max-w-sm mx-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-2">当前知识库内容</h3>
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
