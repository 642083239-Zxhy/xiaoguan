import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShoppingCart, Headphones, MessageSquare, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { 
  SelectionConsultation,
  ProductRecommendation,
  ProductComparison,
  ParameterQuery,
  CompatibilityCheck,
  PriceInquiry,
  BargainPrompt,
  StockLogistics,
  EnterprisePurchase,
  PurchasePush,
  AfterSalesGuide,
  ComplaintHandling,
  DirectHumanContact,
  CasualChat,
  SecurityWarning,
  SessionSummary
} from './IntentComponents';
import { quickQuestions, scenarioTags, priceRanges } from '../data/mockData';
import dragonLogo from '../assets/dragon-logo.jpg';

/**
 * 聊天消息组件 - 显示单条消息
 * 雷龙品牌 - 赛博朋克紫色主题
 */
const Message = ({ message, onIntentAction }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  return (
    <div className={`message-enter flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden ${
        isUser 
          ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/30' 
          : isSystem 
            ? 'bg-gray-700/50 text-gray-500'
            : 'bg-gradient-to-br from-violet-900/80 to-purple-900/80 shadow-violet-500/40 glow-pulse border border-violet-400/30'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : isSystem ? <MessageSquare className="w-4 h-4" /> : <img src={dragonLogo} alt="雷龙AI" className="w-full h-full object-contain" />}
      </div>
      
      {/* 消息内容 */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {message.intent ? (
          <div className="mb-2">
            {renderIntentComponent(message, onIntentAction)}
          </div>
        ) : (
          <div className={`
            ${isUser 
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-violet-500/20' 
              : 'bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/20 text-gray-200 rounded-2xl rounded-tl-sm'
            } 
            px-4 py-2.5 text-sm leading-relaxed
          `}>
            {message.content}
          </div>
        )}
        
        {/* 时间戳 */}
        <div className={`text-[10px] text-gray-600 mt-1 px-1 ${isUser ? 'text-right' : ''}`}>
          {message.time}
        </div>
      </div>
    </div>
  );
};

/**
 * 根据意图类型渲染对应组件
 */
const renderIntentComponent = (message, onIntentAction) => {
  const { intent, data } = message;
  
  switch (intent) {
    case 'selection_consultation':
      return <SelectionConsultation 
        onSelectScene={(scene) => onIntentAction('select_scene', scene)}
        onSelectBudget={(budget) => onIntentAction('select_budget', budget)}
      />;
    case 'product_recommendation':
      return <ProductRecommendation products={data.products} />;
    case 'product_comparison':
      return <ProductComparison productA={data.productA} productB={data.productB} />;
    case 'parameter_query':
      return <ParameterQuery question={data.question} answer={data.answer} relatedProduct={data.relatedProduct} />;
    case 'compatibility_check':
      return <CompatibilityCheck 
        status={data.status} 
        deviceType={data.deviceType} 
        product={data.product}
        onTransferHuman={() => onIntentAction('transfer_human')}
      />;
    case 'price_inquiry':
      return <PriceInquiry product={data.product} priceType={data.priceType} />;
    case 'bargain':
      return <BargainPrompt 
        message={data.message} 
        isApproving={data.isApproving}
        onTransferHuman={() => onIntentAction('transfer_human')}
      />;
    case 'stock_logistics':
      return <StockLogistics 
        product={data.product} 
        stockInfo={data.stockInfo}
        estimatedDelivery={data.estimatedDelivery}
      />;
    case 'enterprise_purchase':
      return <EnterprisePurchase onContact={() => onIntentAction('contact_enterprise')} />;
    case 'purchase_push':
      return <PurchasePush 
        product={data.product}
        onBuy={() => onIntentAction('buy_now', data.product)}
        onHuman={() => onIntentAction('contact_human')}
      />;
    case 'after_sales':
      return <AfterSalesGuide onTransferHuman={() => onIntentAction('transfer_human')} />;
    case 'complaint':
      return <ComplaintHandling onTransferHuman={() => onIntentAction('transfer_human')} />;
    case 'direct_human':
      return <DirectHumanContact 
        onCall={() => onIntentAction('call_human')}
        onChat={() => onIntentAction('chat_human')}
      />;
    case 'casual_chat':
      return <CasualChat 
        message={data.message} 
        onStartShopping={() => onIntentAction('start_shopping')}
      />;
    case 'security_warning':
      return <SecurityWarning />;
    case 'session_summary':
      return <SessionSummary 
        summary={data.summary}
        onContinue={() => onIntentAction('continue_session')}
        onNewSession={() => onIntentAction('new_session')}
      />;
    default:
      return null;
  }
};

/**
 * 加载中消息组件
 * 雷龙品牌 - 紫色动态效果
 */
const LoadingMessage = () => (
  <div className="message-enter flex gap-3">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-900/80 to-purple-900/80 flex items-center justify-center glow-pulse border border-violet-400/30 overflow-hidden">
      <img src={dragonLogo} alt="加载中" className="w-full h-full object-contain" />
    </div>
    <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/20 rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 bg-violet-400 rounded-full loading-dot" style={{ animationDelay: '0s', boxShadow: '0 0 8px #8B5CF680' }} />
        <div className="w-2 h-2 bg-fuchsia-400 rounded-full loading-dot" style={{ animationDelay: '0.2s', boxShadow: '0 0 8px #C084FC80' }} />
        <div className="w-2 h-2 bg-purple-400 rounded-full loading-dot" style={{ animationDelay: '0.4s', boxShadow: '0 0 8px #A78BFA80' }} />
      </div>
    </div>
  </div>
);

/**
 * 聊天区域主组件
 * 雷龙品牌 - 赛博朋克紫色主题
 */
const ChatArea = ({ 
  messages, 
  onSendMessage, 
  onIntentAction, 
  onOpenStatusPanel,
  currentCriteria,
  candidateCount
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  
  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  // 快捷问题点击
  const handleQuickQuestion = (question) => {
    onSendMessage(question);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* 欢迎区 - 仅首次对话时显示 */}
      {messages.length === 0 && (
        <div className="px-6 py-6 border-b border-violet-500/10">
          <div className="max-w-3xl mx-auto">
            {/* 欢迎卡片 */}
            <div className="relative overflow-hidden rounded-2xl p-6 mb-5 welcome-decoration border border-violet-500/20">
              {/* 背景装饰 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(192, 132, 252, 0.2))', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                    <img src={dragonLogo} alt="雷龙AI" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">您好，我是雷龙 AI 选购顾问</p>
                    <div className="flex items-center gap-1 text-xs text-violet-300">
                      <Sparkles className="w-3 h-3" />
                      <span>智能推荐 · 精准匹配 · 专业解答</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  根据您的用途和预算，帮您推荐最合适的鼠标产品。
                </p>
              </div>
            </div>
            
            {/* 快捷场景入口 */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
                <span className="text-xs text-gray-400 tracking-wider font-medium">选择使用场景</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {scenarioTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleQuickQuestion(`${tag}鼠标推荐`)}
                    className="cyber-btn group flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/10 rounded-xl text-sm text-gray-300 hover:text-violet-300 transition-all"
                  >
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full group-hover:animate-pulse" />
                    {tag === '办公' && '💼 '}
                    {tag === '游戏' && '🎮 '}
                    {tag === '便携' && '🎒 '}
                    {tag === '按预算' && '💰 '}
                    {tag}鼠标推荐
                  </button>
                ))}
              </div>
            </div>
            
            {/* 预算快捷入口 */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3 bg-gradient-to-b from-fuchsia-500 to-purple-500 rounded-full" />
                <span className="text-xs text-gray-400 tracking-wider font-medium">预算范围</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {priceRanges.map(range => (
                  <button
                    key={range}
                    onClick={() => handleQuickQuestion(range)}
                    className="cyber-btn group px-4 py-2 bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-fuchsia-500/20 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 rounded-xl text-sm text-gray-300 hover:text-fuchsia-300 transition-all"
                  >
                    <span>{range}</span>
                    <ChevronRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 状态面板入口 */}
      {messages.length > 0 && (
        <div className="px-6 py-2 flex justify-end">
          <button
            onClick={onOpenStatusPanel}
            className="flex items-center gap-2 bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/10 rounded-xl px-3 py-1.5 text-sm text-gray-300 hover:text-violet-300 transition-all"
          >
            <span>当前条件</span>
            {candidateCount > 0 && (
              <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs px-2 py-0.5 rounded-full">
                {candidateCount} 款候选
              </span>
            )}
          </button>
        </div>
      )}
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 fade-mask-bottom scroll-container">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <Message 
              key={index} 
              message={msg} 
              onIntentAction={onIntentAction}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* 固定转化区 */}
      <div className="px-6 py-3 border-t border-violet-500/10 bg-gradient-to-b from-transparent to-[#0A0A12]/80">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button className="cyber-btn flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600/80 to-purple-600/80 border border-violet-500/40 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/20 rounded-xl py-2.5 text-sm text-white font-medium transition-all">
            <ShoppingCart className="w-4 h-4" />
            获取购买链接
          </button>
          <button className="cyber-btn flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600/80 to-pink-600/80 border border-fuchsia-500/40 hover:border-fuchsia-400 hover:shadow-lg hover:shadow-fuchsia-500/20 rounded-xl py-2.5 text-sm text-white font-medium transition-all">
            <Headphones className="w-4 h-4" />
            联系人工顾问
          </button>
        </div>
      </div>
      
      {/* 输入区 */}
      <div className="px-6 py-4 bg-[#0A0A12]/90">
        <div className="max-w-3xl mx-auto">
          {/* 常用问题 */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-3 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
              <span className="text-xs text-gray-500 tracking-wider">常用问题</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {quickQuestions.map(question => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-1.5 bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/15 hover:border-violet-500/40 rounded-lg text-xs text-gray-400 hover:text-violet-300 transition-all"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
          
          {/* 输入框 */}
          <div className="flex items-end gap-2 bg-gradient-to-br from-[#1A1A2E] to-[#12121F] border border-violet-500/20 rounded-2xl p-2.5 input-focus-glow transition-all">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入您想了解的问题... 例如：推荐一款适合打游戏的鼠标"
              className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-200 placeholder-gray-600 max-h-32 py-1"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="cyber-btn p-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* 底部提示 */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <Sparkles className="w-3 h-3 text-violet-500/50" />
            <p className="text-[11px] text-gray-600">
              雷龙 AI 回复仅供参考，请核实重要信息
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;