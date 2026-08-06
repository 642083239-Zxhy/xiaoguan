import React, { useEffect, useState } from 'react';
import { CheckCircle2, Database, Eye, EyeOff, KeyRound, Loader2, Trash2, X } from 'lucide-react';
import {
  clearApiConfig,
  DEFAULT_API_CONFIG,
  getApiConfig,
  saveApiConfig,
  testApiConnection
} from '../services/api';

const ApiSettingsModal = ({ isOpen, onClose, onConfigChange }) => {
  const [config, setConfig] = useState(DEFAULT_API_CONFIG);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getApiConfig());
      setStatus({ type: '', message: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setStatus({ type: '', message: '' });
  };

  const validate = () => {
    if (!config.apiKey.trim()) return '请输入API Key';
    if (config.mode === 'bailian-app') {
      if (!config.appId.trim()) return '请输入百炼应用ID（APP_ID）';
      if (!/^[A-Za-z0-9_-]+$/.test(config.appId.trim())) return '应用ID格式不正确';
      return '';
    }
    if (!config.endpoint.trim()) return '请输入API接口地址';
    try {
      const url = new URL(config.endpoint.trim());
      if (!['https:', 'http:'].includes(url.protocol)) return '接口地址必须使用HTTP或HTTPS';
    } catch {
      return 'API接口地址格式不正确';
    }
    if (!config.model.trim()) return '请输入模型名称';
    return '';
  };

  const handleSave = () => {
    const error = validate();
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }
    saveApiConfig(config);
    onConfigChange(true);
    setStatus({
      type: 'success',
      message: config.mode === 'bailian-app'
        ? '配置已保存，参数知识问答将调用百炼知识库应用'
        : '配置已保存，闲聊将调用通用模型；商品与报价仍由本地规则引擎处理'
    });
  };

  const handleTest = async () => {
    const error = validate();
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }
    setIsTesting(true);
    setStatus({ type: '', message: '' });
    try {
      const saved = saveApiConfig(config);
      const reply = await testApiConnection(saved);
      onConfigChange(true);
      setStatus({ type: 'success', message: `连接成功：${reply.slice(0, 100)}` });
    } catch (requestError) {
      setStatus({ type: 'error', message: `连接失败：${requestError.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    clearApiConfig();
    setConfig(DEFAULT_API_CONFIG);
    onConfigChange(false);
    setStatus({ type: 'success', message: 'API配置已清除，聊天将使用模拟数据' });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI与知识库配置</h2>
              <p className="text-xs text-gray-500">连接已发布的百炼知识库应用</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100" aria-label="关闭API配置">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => updateField('mode', 'bailian-app')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                config.mode === 'bailian-app' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
              }`}
            >
              百炼知识库应用
              <span className="ml-1 text-[10px] text-emerald-600">推荐</span>
            </button>
            <button
              type="button"
              onClick={() => updateField('mode', 'openai-compatible')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                config.mode === 'openai-compatible' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
              }`}
            >
              通用模型接口
            </button>
          </div>

          {config.mode === 'bailian-app' ? (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">百炼应用ID（APP_ID）</span>
                <input
                  value={config.appId}
                  onChange={event => updateField('appId', event.target.value)}
                  placeholder="应用发布后，在应用调用页面复制APP_ID"
                  autoComplete="off"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <span className="mt-1.5 block text-xs leading-5 text-gray-500">
                  这里填写绑定了“AI销售助手”知识库的应用ID，不是知识库名称或模型名称。
                </span>
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">API接口地址</span>
                <input
                  value={config.endpoint}
                  onChange={event => updateField('endpoint', event.target.value)}
                  placeholder="https://.../v1/chat/completions"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">模型名称</span>
                <input
                  value={config.model}
                  onChange={event => updateField('model', event.target.value)}
                  placeholder="例如：qwen-plus"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">API Key</span>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={event => updateField('apiKey', event.target.value)}
                placeholder="请输入新的API Key"
                autoComplete="off"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <button
                type="button"
                onClick={() => setShowKey(value => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                aria-label={showKey ? '隐藏API Key' : '显示API Key'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
            {config.mode === 'bailian-app'
              ? '回答会通过APP_ID调用百炼应用，并使用该应用已绑定的知识库。请先在百炼控制台发布应用。'
              : '通用模型接口不会自动读取百炼知识库，仅适合普通模型问答。'}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            <KeyRound className="mr-1 inline h-3.5 w-3.5" />
            API Key只保存在当前浏览器会话中。正式上线时应改为由后端安全保存密钥。
          </div>

          {status.message && (
            <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {status.type === 'success' && <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />}
              <span>{status.message}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            清除配置
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isTesting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />测试中</span> : '测试连接'}
            </button>
            <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90">
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsModal;
