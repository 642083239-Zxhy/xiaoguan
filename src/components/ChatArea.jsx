import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShoppingCart, Headphones, MessageSquare } from 'lucide-react';
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
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-primary text-white' 
          : isSystem 
            ? 'bg-gray-200 text-gray-500'
            : 'bg-gradient-to-br from-primary to-secondary text-white'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : isSystem ? <MessageSquare className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      {/* 消息内容 */}
      <div className={`flex-1 max-w-[88%] sm:max-w-[80%] ${isUser ? 'items-end' : ''}`}>
        {message.intent ? (
          // 意图组件渲染
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
 */
const LoadingMessage = () => (
  <div className="message-enter flex gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  </div>
);

/**
 * 聊天区域主组件
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
      {/* 欢迎区（仅首次对话时显示） */}
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
              <span className="text-xs text-gray-500 mb-2 block">快捷场景：</span>
              <div className="flex gap-2 flex-wrap">
                {scenarioTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleQuickQuestion(`${tag}鼠标推荐`)}
                    className="cyber-btn flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-primary hover:text-primary"
                  >
                    {tag === '办公' && <span>💼</span>}
                    {tag === '游戏' && <span>🎮</span>}
                    {tag === '便携' && <span>🎒</span>}
                    {tag === '按预算' && <span>💰</span>}
                    {tag}鼠标推荐
                  </button>
                ))}
              </div>
            </div>
            
            {/* 预算快捷入口 */}
            <div className="mb-4">
              <span className="text-xs text-gray-500 mb-2 block">预算范围：</span>
              <div className="flex gap-2 flex-wrap">
                {priceRanges.map(range => (
                  <button
                    key={range}
                    onClick={() => handleQuickQuestion(range)}
                    className="cyber-btn rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-primary hover:text-primary"
                  >
                    {range}
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
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-primary rounded-lg px-3 py-1.5 text-sm text-gray-700 transition-colors"
          >
            <span>当前条件（{Object.keys(currentCriteria || {}).length}）</span>
            {candidateCount > 0 && (
              <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
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
      <div className="flex-1 overflow-y-auto px-6 py-4">
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
      <div className="px-6 py-2 border-t border-gray-100 bg-white">
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
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto">
          {/* 常用问题 */}
          <div className="mb-3">
            <span className="text-xs text-gray-500 mb-2 block">常用问题：</span>
            <div className="flex gap-2 flex-wrap">
              {quickQuestions.map(question => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
          
          {/* 输入框 */}
          <div className="flex items-end gap-2 bg-gray-50 rounded-xl p-2 border border-gray-200 focus-within:border-primary transition-colors">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入您想了解的问题..."
              className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-700 placeholder-gray-400 max-h-32"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI回复可能存在误差，请核实重要信息
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
