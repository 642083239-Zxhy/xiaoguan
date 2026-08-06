import React from 'react';
import { Brain, Headphones, History, KeyRound, Settings, Sparkles } from 'lucide-react';
import dragonLogo from '../assets/dragon-logo.png';

const Header = ({ onOpenHistory, onContact, onOpenAdmin, onOpenApiSettings, onOpenMemory, apiConfigured, memoryStatus }) => (
  <header className="glass-dark fixed inset-x-0 top-0 z-50 border-b">
    <div className="flex h-16 items-center justify-between px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border border-cyan-400/30 bg-dragon-dark shadow-neon-cyan">
          <img src={dragonLogo} alt="雷龙 Logo" className="h-full w-full object-cover" />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-secondary shadow-neon-purple" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-gradient-dragon truncate text-lg font-black tracking-wider">雷龙 L1</span>
            <span className="rounded-md border border-purple-400/30 bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-purple-200">AI</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] tracking-wide text-gray-500">
            <span className="hidden sm:inline">THUNDER DRAGON</span>
            <Sparkles className="h-3 w-3 text-secondary" />
            <span>智能选购顾问</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button onClick={onOpenHistory} className="rounded-xl p-2.5 text-gray-400 transition hover:bg-purple-500/10 hover:text-purple-200" title="历史对话" aria-label="历史对话">
          <History className="h-5 w-5" />
        </button>
        <button onClick={onContact} className="rounded-xl p-2.5 text-gray-400 transition hover:bg-cyan-500/10 hover:text-cyan-200" title="联系顾问" aria-label="联系顾问">
          <Headphones className="h-5 w-5" />
        </button>
        <button onClick={onOpenApiSettings} className="relative rounded-xl p-2.5 text-gray-400 transition hover:bg-cyan-500/10 hover:text-primary" title="AI与知识库配置" aria-label="AI与知识库配置">
          <KeyRound className={`h-5 w-5 ${apiConfigured ? 'text-primary' : ''}`} />
          {apiConfigured && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-dragon-dark" />}
        </button>
        <button onClick={onOpenMemory} className="relative rounded-xl p-2.5 text-gray-400 transition hover:bg-purple-500/10 hover:text-purple-200" title="记忆与客户数据" aria-label="记忆与客户数据">
          <Brain className={`h-5 w-5 ${memoryStatus === 'connected' ? 'text-purple-300' : ''}`} />
          <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-dragon-dark ${memoryStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        </button>
        <button onClick={onOpenAdmin} className="rounded-xl p-2.5 text-gray-400 transition hover:bg-purple-500/10 hover:text-purple-200" title="后台管理" aria-label="后台管理">
          <Settings className="h-5 w-5" />
        </button>
        <div className="ml-1 hidden items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1.5 sm:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-[11px] font-medium text-emerald-300">{apiConfigured ? '知识库已连接' : '知识库未连接'}</span>
        </div>
      </div>
    </div>
    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
  </header>
);

export default Header;
