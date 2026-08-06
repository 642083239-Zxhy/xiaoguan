import React from 'react';
import { Plus, Trash2, MessageSquare, Clock, Zap, X } from 'lucide-react';

/**
 * 历史记录侧边栏组件
 * 雷龙品牌 - 赛博朋克紫色主题
 */
const HistorySidebar = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
  onClearHistory,
  onNewSession
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* 侧边栏 */}
      <div className="relative w-72 bg-gradient-to-br from-[#1A1A2E] to-[#141428] border-r border-violet-500/20 h-full flex flex-col shadow-2xl">
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

        {/* 头部 */}
        <div className="p-4 border-b border-violet-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-white font-display tracking-wider">历史对话</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-violet-500/10 rounded-lg text-gray-400 hover:text-violet-300 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onNewSession}
            className="cyber-btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            新建对话
          </button>
        </div>

        {/* 会话列表 */}
        <div className="flex-1 overflow-y-auto p-3 scroll-container">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                <MessageSquare className="w-8 h-8 text-violet-400/50" />
              </div>
              <p className="text-sm text-gray-400">暂无历史对话</p>
              <p className="text-xs text-gray-600 mt-1">开始新对话，记录您的选购历程</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className="group p-3 rounded-xl border border-violet-500/10 hover:border-violet-500/40 hover:bg-violet-500/5 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-200 truncate group-hover:text-violet-300 transition-colors">{session.title}</h3>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{session.lastTime}</span>
                      </div>
                      {session.lastQuery && (
                        <p className="text-xs text-gray-600 mt-1 truncate">{session.lastQuery}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="space-y-2 border-t border-gray-100 p-3 text-center text-xs text-gray-400">
          <p>匿名记录仅保留7天，数据保存在当前浏览器</p>
          {sessions.length > 0 && (
            <button onClick={onClearHistory} className="text-red-400 transition hover:text-red-300">
              清空全部历史记录
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;
