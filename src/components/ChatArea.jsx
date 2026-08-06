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

const renderInline = (text) => text.split(/(\*\*.*?\*\*)/g).map((part, index) => (
  part.startsWith('**') && part.endsWith('**')
    ? <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>
    : <React.Fragment key={index}>{part}</React.Fragment>
));

const RichText = ({ content = '' }) => (
  <div className="space-y-1 whitespace-pre-wrap">
    {String(content).split('\n').map((line, index) => {
      const bullet = line.match(/^\s*[-•]\s+(.*)$/);
      return bullet
        ? <div key={index} className="flex gap-2"><span>•</span><span>{renderInline(bullet[1])}</span></div>
        : <div key={index}>{renderInline(line)}</div>;
    })}
  </div>
);

/**
 * 聊天消息组件 - 显示单条消息
 * 雷龙品牌 - 赛博朋克紫色主题
 */
const Message = ({ message, onIntentAction }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const sourceLabels = {
    'knowledge-base': '百炼知识库',
    'local-knowledge': '本地知识',
    'rule-engine': '规则引擎',
    api: '通用模型'
  };

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
      <div className={`flex-1 max-w-[88%] sm:max-w-[80%] ${isUser ? 'items-end' : ''}`}>
        {message.intent ? (
          <div className="mb-2">
            {renderIntentComponent(message, onIntentAction)}
          </div>
        ) : (
          <div className={`${
            isUser 
              ? 'bg-primary text-white rounded-2xl rounded-tr-sm' 
              : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
          } px-4 py-2.5 text-sm leading-relaxed shadow-sm`}>
            <RichText content={message.content} />
          </div>
        )}
        
        {/* 时间戳 */}
        <div className={`mt-1 flex items-center gap-2 text-[10px] text-gray-400 ${isUser ? 'justify-end' : ''}`}>
          {!isUser && sourceLabels[message.source] && (
            <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-purple-300">
              {sourceLabels[message.source]}
            </span>
          )}
          <span>{message.time}</span>
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
        onSelectDevice={(device) => onIntentAction('select_device', device)}
        missingFields={data.missingFields}
      />;
    case 'product_recommendation':
      return <ProductRecommendation
        products={data.products}
        note={data.note}
        onBuy={(product) => onIntentAction('buy_now', product)}
        onHuman={() => onIntentAction('contact_human')}
      />;
    case 'product_comparison':
      return <ProductComparison productA={data.productA} productB={data.productB} />;
    case 'parameter_query':
      return <ParameterQuery question={data.question} answer={data.answer} relatedProduct={data.relatedProduct} />;
    case 'compatibility_check':
      return <CompatibilityCheck 
        status={data.status} 
        deviceType={data.deviceType} 
        product={data.product}
      />;
    case 'price_inquiry':
      return <PriceInquiry product={data.product} products={data.products} priceType={data.priceType} quote={data.quote} />;
    case 'bargain':
      return <BargainPrompt 
        message={data.message} 
        isApproving={data.isApproving}
        quote={data.quote}
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
  candidateCount,
  apiConfigured
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
        <div className="border-b border-gray-100 px-4 py-5 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="neon-border relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400/10 via-purple-500/10 to-fuchsia-500/5 p-5 sm:p-6">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-purple-500/15 blur-3xl" />
              <div className="relative">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-cyan-300">L1 SERIES</span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] ${apiConfigured ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-purple-400/25 bg-purple-400/10 text-purple-300'}`}>
                    {apiConfigured ? '知识库已连接' : '规则引擎模式'}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">选对鼠标，不用背参数</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">告诉我预算、游戏类型和设备，我会根据L1系列真实参数、定价规则与知识库给出建议。</p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ['L1 基础版', '399元'],
                    ['L1 Pro', '599元'],
                    ['轻量化', '最低≤55g'],
                    ['旗舰传感器', 'PAW3950']
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/5 bg-black/10 px-3 py-2">
                      <div className="text-[10px] text-gray-500">{label}</div>
                      <div className="mt-0.5 text-xs font-semibold text-gray-700">{value}</div>
                    </div>
                  ))}
                </div>
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
                    className="cyber-btn flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-primary hover:text-primary"
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
                    className="cyber-btn rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-primary hover:text-primary"
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
        <div className="flex justify-end px-6 py-2">
          <button
            onClick={onOpenStatusPanel}
            className="flex items-center gap-2 bg-gradient-to-br from-[#1A1A2E] to-[#16162A] border border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/10 rounded-xl px-3 py-1.5 text-sm text-gray-300 hover:text-violet-300 transition-all"
          >
            <span>当前条件（{Object.keys(currentCriteria || {}).length}）</span>
            {candidateCount > 0 && (
              <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs px-2 py-0.5 rounded-full">
                {candidateCount} 款候选
              </span>
            )}
          </button>
          {Object.keys(currentCriteria || {}).length > 0 && (
            <button
              onClick={() => onIntentAction('clear_criteria')}
              className="ml-2 rounded-lg px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-red-400"
            >
              清除条件
            </button>
          )}
        </div>
      )}
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 fade-mask-bottom scroll-container">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            msg.type === 'loading'
              ? <LoadingMessage key={`loading-${index}`} />
              : <Message
                  key={`${msg.time || 'message'}-${index}`}
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
          <button
            onClick={() => onIntentAction('buy_now')}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary rounded-lg py-2.5 text-sm text-gray-700 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            获取购买链接
          </button>
          <button
            onClick={() => onIntentAction('contact_human')}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary rounded-lg py-2.5 text-sm text-gray-700 transition-colors"
          >
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