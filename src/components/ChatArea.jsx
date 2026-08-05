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

/**
 * 聊天消息组件 - 显示单条消息
 */
const Message = ({ message, onIntentAction }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

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
      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : ''}`}>
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
            {message.content}
          </div>
        )}
        
        {/* 时间戳 */}
        <div className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : ''}`}>
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
      {/* 欢迎区（仅首次对话时显示） */}
      {messages.length === 0 && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 mb-4">
              <p className="text-lg font-medium text-gray-800">您，我是AI鼠标选购顾问 👋</p>
              <p className="text-sm text-gray-600 mt-1">可以根据用途和预算帮您推荐最合适的鼠标。请问有什么可以帮您的？</p>
            </div>
            
            {/* 快捷场景入口 */}
            <div className="mb-4">
              <span className="text-xs text-gray-500 mb-2 block">快捷场景：</span>
              <div className="flex gap-2 flex-wrap">
                {scenarioTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleQuickQuestion(`${tag}鼠标推荐`)}
                    className="px-4 py-2 bg-white border border-gray-200 hover:border-primary rounded-lg text-sm text-gray-700 transition-colors flex items-center gap-2"
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
                    className="px-4 py-2 bg-white border border-gray-200 hover:border-primary rounded-lg text-sm text-gray-700 transition-colors"
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
        <div className="px-6 py-2 flex justify-end">
          <button
            onClick={onOpenStatusPanel}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-primary rounded-lg px-3 py-1.5 text-sm text-gray-700 transition-colors"
          >
            <span>当前条件</span>
            {candidateCount > 0 && (
              <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                {candidateCount} 款候选
              </span>
            )}
          </button>
        </div>
      )}
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
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
      <div className="px-6 py-2 border-t border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary rounded-lg py-2.5 text-sm text-gray-700 transition-colors">
            <ShoppingCart className="w-4 h-4" />
            获取购买链接
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary rounded-lg py-2.5 text-sm text-gray-700 transition-colors">
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
