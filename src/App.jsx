import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import HistorySidebar from './components/HistorySidebar';
import StatusPanel from './components/StatusPanel';
import { sendMessageToAI, getHistorySessions, saveSession, deleteSession } from './services/api';

/**
 * 主应用组件
 * 整合所有功能模块，管理全局状态
 */
function App() {
  // 消息列表
  const [messages, setMessages] = useState([]);
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 当前会话ID
  const [currentSessionId] = useState(() => 
    localStorage.getItem('chat_session_id') || `session_${Date.now()}`
  );
  
  // 历史会话
  const [sessions, setSessions] = useState([]);
  // 侧边栏状态
  const [showHistory, setShowHistory] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  
  // 当前选购条件
  const [currentCriteria, setCurrentCriteria] = useState({});
  // 候选商品列表
  const [candidates, setCandidates] = useState([]);

  // 初始化加载历史会话
  useEffect(() => {
    const historySessions = getHistorySessions();
    setSessions(historySessions);
  }, []);

  /**
   * 发送消息处理
   */
  const handleSendMessage = useCallback(async (content) => {
    // 添加用户消息
    const userMessage = {
      type: 'user',
      content,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // 获取AI响应
      const response = await sendMessageToAI(content, messages, currentCriteria);
      
      // 添加AI消息
      const aiMessage = {
        type: 'ai',
        ...response,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // 如果是商品推荐，更新候选列表
      if (response.intent === 'product_recommendation' && response.data?.products) {
        setCandidates(response.data.products.map(p => ({
          ...p,
          status: p.stock > 50 ? 'available' : p.stock > 10 ? 'low' : 'out'
        })));
      }
    } catch (error) {
      // 错误处理
      const errorMessage = {
        type: 'text',
        content: '抱歉，服务暂时不可用，请稍后重试。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentCriteria]);

  /**
   * 意图动作处理
   */
  const handleIntentAction = useCallback((actionType, payload) => {
    switch (actionType) {
      case 'select_scene':
        setCurrentCriteria(prev => ({ ...prev, scene: payload }));
        handleSendMessage(`我主要用于${payload}`);
        break;
      case 'select_budget':
        setCurrentCriteria(prev => ({ ...prev, budget: payload }));
        handleSendMessage(`我的预算是${payload}`);
        break;
      case 'transfer_human':
        handleSendMessage('转人工客服');
        break;
      case 'contact_human':
        handleSendMessage('联系人工顾问');
        break;
      case 'contact_enterprise':
        handleSendMessage('企业采购');
        break;
      case 'buy_now':
        handleSendMessage('我要购买这款');
        break;
      case 'start_shopping':
        handleSendMessage('继续选购');
        break;
      case 'continue_session':
        setShowHistory(false);
        break;
      case 'new_session':
        handleNewSession();
        break;
      case 'call_human':
        // 模拟电话联系
        const phoneMessage = {
          type: 'text',
          content: '正在为您接通客服电话：400-888-8888',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, phoneMessage]);
        break;
      case 'chat_human':
        handleSendMessage('在线咨询人工客服');
        break;
      default:
        break;
    }
  }, [handleSendMessage]);

  /**
   * 新建会话
   */
  const handleNewSession = useCallback(() => {
    // 保存当前会话
    if (messages.length > 0) {
      const session = {
        id: currentSessionId,
        title: messages[0]?.content?.slice(0, 20) || '新对话',
        lastTime: new Date().toLocaleString('zh-CN'),
        lastQuery: messages[messages.length - 1]?.content?.slice(0, 30) || '',
        messages: [...messages],
        criteria: { ...currentCriteria },
        candidates: [...candidates]
      };
      saveSession(session);
      setSessions(prev => [session, ...prev.filter(s => s.id !== currentSessionId)]);
    }
    
    // 重置状态
    setMessages([]);
    setCurrentCriteria({});
    setCandidates([]);
    localStorage.setItem('chat_session_id', `session_${Date.now()}`);
  }, [messages, currentSessionId, currentCriteria, candidates]);

  /**
   * 选择历史会话
   */
  const handleSelectSession = useCallback((session) => {
    setMessages(session.messages || []);
    setCurrentCriteria(session.criteria || {});
    setCandidates(session.candidates || []);
    localStorage.setItem('chat_session_id', session.id);
    setShowHistory(false);
  }, []);

  /**
   * 删除会话
   */
  const handleDeleteSession = useCallback((sessionId) => {
    deleteSession(sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  /**
   * 移除选购条件
   */
  const handleRemoveCriteria = useCallback((key) => {
    setCurrentCriteria(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /**
   * 清空选购条件
   */
  const handleClearCandidates = useCallback(() => {
    setCurrentCriteria({});
    setCandidates([]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 顶部导航 */}
      <Header />
      
      {/* 主内容区域 */}
      <main className="flex-1 mt-14">
        <div className="max-w-6xl mx-auto h-[calc(100vh-56px)]">
          <ChatArea
            messages={isLoading ? [...messages, { type: 'loading' }] : messages}
            onSendMessage={handleSendMessage}
            onIntentAction={handleIntentAction}
            onOpenStatusPanel={() => setShowStatus(true)}
            currentCriteria={currentCriteria}
            candidateCount={candidates.length}
          />
        </div>
      </main>
      
      {/* 历史会话侧边栏 */}
      <HistorySidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewSession={handleNewSession}
      />
      
      {/* 状态面板 */}
      <StatusPanel
        isOpen={showStatus}
        onClose={() => setShowStatus(false)}
        currentCriteria={currentCriteria}
        candidates={candidates}
        onRemoveCriteria={handleRemoveCriteria}
        onClearCandidates={handleClearCandidates}
      />
    </div>
  );
}

export default App;
