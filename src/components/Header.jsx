import React from 'react';
import { History, Headphones, Sparkles } from 'lucide-react';
import dragonLogo from '../assets/dragon-logo.jpg';

/**
 * 顶部导航组件
 * 雷龙品牌 - 赛博朋克深色主题
 * 使用雷龙龙头Logo展示品牌形象
 */
const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* 品牌 Logo 和名称 */}
        <div className="flex items-center gap-3">
          {/* 雷龙龙头 Logo - 增大尺寸展示霸气龙头 */}
          <div className="logo-glow relative w-14 h-14 flex items-center justify-center">
            <img 
              src={dragonLogo} 
              alt="雷龙 Thunder Dragon Logo" 
              className="w-14 h-14 object-contain drop-shadow-lg"
              style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.6)) drop-shadow(0 0 24px rgba(192, 132, 252, 0.3))' }}
            />
          </div>
          
          {/* 品牌文字 - 去掉中文，因为Logo已包含雷龙字样 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider text-gradient-dragon" style={{ fontFamily: "'Microsoft YaHei', sans-serif" }}>
                雷龙
              </span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-violet-200 text-[10px] rounded-md border border-violet-400/40 font-bold tracking-wider">
                AI
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 tracking-widest font-medium">THUNDER DRAGON</span>
              <Sparkles className="w-3 h-3 text-violet-400 twinkle" />
              <span className="text-[10px] text-gray-600">|</span>
              <span className="text-[10px] text-gray-500">AI 智能选购顾问</span>
            </div>
          </div>
        </div>
        
        {/* 右侧导航按钮 */}
        <div className="flex items-center gap-2">
          {/* 历史对话 */}
          <button 
            className="group relative p-2.5 rounded-xl text-gray-400 hover:text-violet-300 hover:bg-violet-500/10 transition-all"
            title="历史对话"
          >
            <History className="w-5 h-5" />
          </button>
          
          {/* 联系客服 */}
          <button 
            className="group relative p-2.5 rounded-xl text-gray-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/10 transition-all"
            title="联系客服"
          >
            <Headphones className="w-5 h-5" />
          </button>
          
          {/* 分隔线 */}
          <div className="w-px h-7 bg-gradient-to-b from-transparent via-violet-500/40 to-transparent mx-1" />
          
          {/* 在线状态 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
            <span className="text-xs text-green-300 font-medium">在线</span>
          </div>
        </div>
      </div>
      
      {/* 底部渐变边框 */}
      <div className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
    </header>
  );
};

export default Header;