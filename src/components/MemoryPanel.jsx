import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Brain, CheckCircle2, Database, Loader2, ShieldCheck, Trash2, X } from 'lucide-react';
import {
  deleteStableMemory,
  getMemoryOverview,
  grantLongTermConsent,
  revokeLongTermConsent,
  saveStableMemory
} from '../services/memoryApi';

const MEMORY_LABELS = {
  stable_preference: '稳定偏好',
  common_device: '常用设备',
  purchase_history: '购买历史',
  after_sales_status: '售后状态'
};

const MemoryPanel = ({ isOpen, onClose, frontendSessionId, currentCriteria, onStatusChange }) => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');

  // 统一管理提示显示：错误类型 5 秒后自动消失，成功类型 3 秒后自动消失
  const showNotice = (message, type = 'success') => {
    setNotice(message);
    setNoticeType(type);
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => setNotice(prev => (prev === message ? '' : prev)), duration);
  };

  // 刷新记忆概览：不清空 notice，避免覆盖 run 中刚设置的成功提示
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMemoryOverview(frontendSessionId);
      setOverview(data);
      onStatusChange?.('connected');
    } catch (error) {
      showNotice(error.message, 'error');
      onStatusChange?.('offline');
    } finally {
      setLoading(false);
    }
  }, [frontendSessionId, onStatusChange]);

  // 面板打开时刷新数据并清空旧提示
  useEffect(() => {
    if (isOpen) {
      setNotice('');
      refresh();
    }
  }, [isOpen, refresh]);

  if (!isOpen) return null;

  // 执行授权/保存/删除操作：成功后刷新数据并显示成功提示
  const run = async (action, successMessage) => {
    setLoading(true);
    setNotice('');
    try {
      await action();
      await refresh();
      showNotice(successMessage, 'success');
    } catch (error) {
      showNotice(error.message, 'error');
      setLoading(false);
    }
  };

  const preference = {
    ...(currentCriteria.scene ? { scene: currentCriteria.scene } : {}),
    ...(currentCriteria.model ? { model: currentCriteria.model } : {})
  };
  const hasPreference = Object.keys(preference).length > 0;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-purple-400/20 bg-[#11111f] text-gray-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15">
              <Brain className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <h2 className="font-semibold">记忆与客户数据</h2>
              <p className="text-xs text-gray-400">SQLite 本地存储 · 短期上下文与授权长期记忆</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label="关闭记忆管理">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {loading && !overview ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />正在连接本地数据库
            </div>
          ) : overview ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                  <Database className="mb-2 h-4 w-4 text-emerald-300" />
                  <div className="text-sm font-medium">数据库已连接</div>
                  <div className="mt-1 text-xs text-gray-400">当前会话实时写入</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-2xl font-bold text-cyan-300">{overview.history.length}</div>
                  <div className="text-xs text-gray-400">数据库会话记录</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-2xl font-bold text-purple-300">{overview.memories.length}</div>
                  <div className="text-xs text-gray-400">已授权长期记忆</div>
                </div>
              </div>

              <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-cyan-300" />长期记忆授权</h3>
                    <p className="mt-1 text-xs leading-5 text-gray-400">默认只保留本次会话；授权后仍需点击保存，系统不会自动升级个人偏好。</p>
                  </div>
                  {overview.consent.granted ? (
                    <button
                      onClick={() => run(() => revokeLongTermConsent(overview.customerId), '已撤回授权，长期记忆已立即隐藏并进入删除流程。')}
                      className="whitespace-nowrap rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
                    >撤回授权</button>
                  ) : (
                    <button
                      onClick={() => run(() => grantLongTermConsent(overview.customerId), '长期记忆授权成功。')}
                      className="whitespace-nowrap rounded-lg bg-purple-500 px-3 py-2 text-xs font-medium text-white hover:bg-purple-400"
                    >明确授权</button>
                  )}
                </div>

                {overview.consent.granted && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      disabled={loading}
                      onClick={() => {
                        if (!hasPreference) {
                          showNotice('暂无偏好数据，请先在对话中告知您的使用场景或预算，以便AI为您记录稳定偏好。', 'error');
                          return;
                        }
                        run(
                          () => saveStableMemory({
                            customerId: overview.customerId,
                            sessionId: overview.sessionId,
                            memoryType: 'stable_preference',
                            value: preference
                          }),
                          '当前场景/型号已确认为稳定偏好。'
                        );
                      }}
                      className="rounded-lg border border-purple-400/30 px-3 py-2 text-xs text-purple-200 hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                    >保存当前稳定偏好</button>
                    <button
                      disabled={loading}
                      onClick={() => {
                        if (!currentCriteria.device) {
                          showNotice('暂无常用设备信息，请先在对话中提及您使用的设备（如Mac、Windows等），以便AI为您记录。', 'error');
                          return;
                        }
                        run(
                          () => saveStableMemory({
                            customerId: overview.customerId,
                            sessionId: overview.sessionId,
                            memoryType: 'common_device',
                            value: currentCriteria.device
                          }),
                          '当前设备已确认为常用设备。'
                        );
                      }}
                      className="rounded-lg border border-cyan-400/30 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                    >保存当前常用设备</button>
                  </div>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold">可查看与删除的长期记忆</h3>
                {overview.memories.length ? (
                  <div className="space-y-2">
                    {overview.memories.map(memory => (
                      <div key={memory.memory_id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{MEMORY_LABELS[memory.memory_type] || memory.memory_type}</div>
                          <div className="mt-1 break-all text-xs text-gray-400">{JSON.stringify(memory.value, null, 0)}</div>
                        </div>
                        <button
                          onClick={() => run(() => deleteStableMemory(overview.customerId, memory.memory_type), '该记忆已隐藏并进入删除流程。')}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-300"
                          aria-label={`删除${MEMORY_LABELS[memory.memory_type] || memory.memory_type}`}
                        ><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                ) : <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-gray-500">暂无长期记忆</p>}
              </section>
            </>
          ) : null}

          {notice && (
            <div
              role="alert"
              className={`fixed right-4 top-4 z-[90] flex max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${
                noticeType === 'error'
                  ? 'border-red-400/50 bg-red-500/25 text-red-50'
                  : 'border-emerald-400/50 bg-emerald-500/25 text-emerald-50'
              }`}
            >
              {noticeType === 'error'
                ? <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                : <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              }
              <span className="flex-1">{notice}</span>
              <button
                onClick={() => setNotice('')}
                className="ml-2 rounded p-0.5 text-current opacity-70 hover:opacity-100"
                aria-label="关闭提示"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryPanel;
