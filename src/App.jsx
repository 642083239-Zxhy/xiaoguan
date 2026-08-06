import React, { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import HistorySidebar from './components/HistorySidebar';
import StatusPanel from './components/StatusPanel';
import AdminPanel from './components/AdminPanel';
import ApiSettingsModal from './components/ApiSettingsModal';
import MemoryPanel from './components/MemoryPanel';
import {
  deleteSession,
  clearHistorySessions,
  getHistorySessions,
  hasApiConfig,
  saveSession,
  sendMessageToAI
} from './services/api';
import { trackConversion, trackSession } from './services/dataStore';
import {
  clearMemoryHistory,
  deleteMemorySession,
  getResolvedMemoryCriteria,
  initializeMemorySession,
  recordMemoryMessage,
  syncMemoryTurn
} from './services/memoryApi';

const nowTime = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
const createSessionId = () => `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const responseText = response => response.content
  || response.data?.answer
  || response.data?.message
  || (response.data?.products?.length
    ? `推荐：${response.data.products.map(product => product.name).join('、')}`
    : `结构化回复：${JSON.stringify(response.data || { intent: response.intent || response.type })}`);

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(
    () => localStorage.getItem('chat_session_id') || createSessionId()
  );
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(() => hasApiConfig());
  const [memoryStatus, setMemoryStatus] = useState('checking');
  const [currentCriteria, setCurrentCriteria] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  useEffect(() => {
    const historySessions = getHistorySessions();
    setSessions(historySessions);
    localStorage.setItem('chat_session_id', currentSessionId);
    trackSession(currentSessionId);
    const current = historySessions.find(session => session.id === currentSessionId);
    if (current) {
      setMessages(current.messages || []);
      setCurrentCriteria(current.criteria || {});
      setCandidates(current.candidates || []);
      setLastAnalysis(current.lastAnalysis || null);
    }
  }, [currentSessionId]);

  useEffect(() => {
    let active = true;
    setMemoryStatus('checking');
    initializeMemorySession(currentSessionId)
      .then(() => getResolvedMemoryCriteria(currentSessionId))
      .then(memoryCriteria => {
        if (!active) return;
        setCurrentCriteria(previous => ({ ...memoryCriteria, ...previous }));
        setMemoryStatus('connected');
      })
      .catch(() => active && setMemoryStatus('offline'));
    return () => { active = false; };
  }, [currentSessionId]);

  useEffect(() => {
    if (!messages.length) return;
    const session = {
      id: currentSessionId,
      title: messages.find(message => message.type === 'user')?.content?.slice(0, 20) || '新对话',
      lastTime: new Date().toLocaleString('zh-CN'),
      lastQuery: [...messages].reverse().find(message => message.type === 'user')?.content?.slice(0, 30) || '',
      updatedAt: new Date().toISOString(),
      messages,
      criteria: currentCriteria,
      candidates,
      lastAnalysis
    };
    setSessions(saveSession(session));
  }, [messages, currentCriteria, candidates, currentSessionId, lastAnalysis]);

  const handleSendMessage = useCallback(async (content) => {
    const userMessage = { type: 'user', content, time: nowTime() };
    setMessages(previous => [...previous, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessageToAI(content, messages, currentCriteria);
      const { type: responseType, criteriaUpdates, criteriaReset, analysis, ...responsePayload } = response;
      const aiMessage = {
        type: 'ai',
        responseType,
        ...responsePayload,
        analysis,
        time: nowTime()
      };
      setMessages(previous => [...previous, aiMessage]);
      setLastAnalysis(analysis || null);
      if (criteriaReset) {
        setCurrentCriteria({});
        setCandidates([]);
      }
      if (criteriaUpdates && Object.keys(criteriaUpdates).length) {
        setCurrentCriteria(previous => ({ ...previous, ...criteriaUpdates }));
      }
      let nextCriteria = criteriaReset ? {} : { ...currentCriteria, ...criteriaUpdates };
      let nextCandidates = criteriaReset ? [] : candidates;
      if (response.intent === 'product_recommendation' && response.data?.products) {
        nextCandidates = response.data.products.map(product => ({
          ...product,
          status: product.stock == null ? 'unknown' : product.stock > 50 ? 'available' : product.stock > 10 ? 'low' : 'out'
        }));
        setCandidates(nextCandidates);
      }
      recordMemoryMessage(currentSessionId, {
        role: 'user',
        content,
        intent: analysis?.primary_intent,
        metadata: { criteria: currentCriteria }
      })
        .then(() => recordMemoryMessage(currentSessionId, {
          role: 'assistant',
          content: responseText(response),
          source: response.source || 'rule-engine',
          intent: analysis?.primary_intent,
          metadata: { response_type: responseType }
        }))
        .then(() => syncMemoryTurn({
          frontendSessionId: currentSessionId,
          criteria: nextCriteria,
          candidates: nextCandidates,
          analysis,
          quote: response.quote,
          summary: {
            user_goal: { query: content, intent: analysis?.primary_intent || 'unknown' },
            confirmed_info: nextCriteria,
            result: {
              response_type: responseType,
              candidates: nextCandidates.map(item => item.name),
              quote: response.quote || null
            },
            unresolved_questions: analysis?.next_action === '追问' ? ['预算或使用条件仍需确认'] : []
          }
        }))
        .then(() => setMemoryStatus('connected'))
        .catch(() => setMemoryStatus('offline'));
    } catch (error) {
      setMessages(previous => [...previous, {
        type: 'ai',
        responseType: 'text',
        content: `调用失败：${error.message || '服务暂时不可用，请稍后重试。'}`,
        time: nowTime()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentCriteria, candidates, currentSessionId]);

  const handleNewSession = useCallback(() => {
    const nextId = createSessionId();
    localStorage.setItem('chat_session_id', nextId);
    setCurrentSessionId(nextId);
    setMessages([]);
    setCurrentCriteria({});
    setCandidates([]);
    setLastAnalysis(null);
    setShowHistory(false);
  }, []);

  const handleIntentAction = useCallback((actionType, payload) => {
    switch (actionType) {
      case 'select_scene':
        setCurrentCriteria(previous => ({ ...previous, scene: payload }));
        handleSendMessage(`我主要用于${payload}`);
        break;
      case 'select_budget':
        setCurrentCriteria(previous => ({ ...previous, budget: payload }));
        handleSendMessage(`我的预算是${payload}`);
        break;
      case 'select_device':
        setCurrentCriteria(previous => ({ ...previous, device: payload }));
        handleSendMessage(`我的设备系统是${payload}`);
        break;
      case 'buy_now':
        trackConversion('purchase', currentSessionId);
        setMessages(previous => [...previous, {
          type: 'ai',
          responseType: 'text',
          content: `${payload?.name || '所选商品'}暂未配置正式购买链接，当前版本不会生成虚假地址。`,
          time: nowTime()
        }]);
        break;
      case 'contact_human':
      case 'transfer_human':
      case 'call_human':
      case 'chat_human':
        trackConversion('contact', currentSessionId);
        setMessages(previous => [...previous, {
          type: 'ai',
          responseType: 'text',
          content: '当前版本暂未接入人工转接，不会显示虚假的排队状态或联系电话。',
          time: nowTime()
        }]);
        break;
      case 'contact_enterprise':
        trackConversion('contact', currentSessionId);
        handleSendMessage('企业采购');
        break;
      case 'start_shopping':
        handleSendMessage('继续选购鼠标');
        break;
      case 'clear_criteria':
        setCurrentCriteria({});
        setCandidates([]);
        setMessages(previous => [...previous, {
          type: 'ai',
          responseType: 'text',
          content: '已清空当前选购条件，你可以重新输入预算、场景或型号。',
          source: 'rule-engine',
          time: nowTime()
        }]);
        break;
      case 'continue_session':
        setShowHistory(false);
        break;
      case 'new_session':
        handleNewSession();
        break;
      default:
        break;
    }
  }, [handleNewSession, handleSendMessage]);

  const handleSelectSession = useCallback((session) => {
    localStorage.setItem('chat_session_id', session.id);
    setCurrentSessionId(session.id);
    setMessages(session.messages || []);
    setCurrentCriteria(session.criteria || {});
    setCandidates(session.candidates || []);
    setLastAnalysis(session.lastAnalysis || null);
    setShowHistory(false);
  }, []);

  const handleDeleteSession = useCallback((sessionId) => {
    setSessions(deleteSession(sessionId));
    deleteMemorySession(sessionId).catch(() => setMemoryStatus('offline'));
    if (sessionId === currentSessionId) handleNewSession();
  }, [currentSessionId, handleNewSession]);

  const handleClearHistory = useCallback(() => {
    setSessions(clearHistorySessions());
    clearMemoryHistory().catch(() => setMemoryStatus('offline'));
    handleNewSession();
  }, [handleNewSession]);

  const handleRemoveCriteria = useCallback((key) => {
    setCurrentCriteria(previous => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }, []);

  const handleClearCandidates = useCallback(() => {
    setCurrentCriteria({});
    setCandidates([]);
  }, []);

  return (
    <div className="thunder-theme cyber-grid-bg relative min-h-screen overflow-hidden">
      <div className="dragon-orb dragon-orb-left" />
      <div className="dragon-orb dragon-orb-right" />
      <Header
        onOpenHistory={() => setShowHistory(true)}
        onContact={() => handleIntentAction('contact_human')}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenApiSettings={() => setShowApiSettings(true)}
        onOpenMemory={() => setShowMemory(true)}
        apiConfigured={apiConfigured}
        memoryStatus={memoryStatus}
      />

      <main className="relative z-10 mt-16 px-0 py-0 lg:px-4 lg:py-4">
        <div className="glass-dark neon-border mx-auto h-[calc(100vh-64px)] max-w-6xl overflow-hidden lg:h-[calc(100vh-96px)] lg:rounded-3xl">
          <ChatArea
            messages={isLoading ? [...messages, { type: 'loading' }] : messages}
            onSendMessage={handleSendMessage}
            onIntentAction={handleIntentAction}
            onOpenStatusPanel={() => setShowStatus(true)}
            currentCriteria={currentCriteria}
            candidateCount={candidates.length}
            apiConfigured={apiConfigured}
          />
        </div>
      </main>

      <HistorySidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClearHistory={handleClearHistory}
        onNewSession={handleNewSession}
      />

      <StatusPanel
        isOpen={showStatus}
        onClose={() => setShowStatus(false)}
        currentCriteria={currentCriteria}
        candidates={candidates}
        lastAnalysis={lastAnalysis}
        onRemoveCriteria={handleRemoveCriteria}
        onClearCandidates={handleClearCandidates}
      />

      <AdminPanel
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        onDataChange={() => setCandidates([])}
      />

      <ApiSettingsModal
        isOpen={showApiSettings}
        onClose={() => setShowApiSettings(false)}
        onConfigChange={setApiConfigured}
      />

      <MemoryPanel
        isOpen={showMemory}
        onClose={() => setShowMemory(false)}
        frontendSessionId={currentSessionId}
        currentCriteria={currentCriteria}
        onStatusChange={setMemoryStatus}
      />
    </div>
  );
}

export default App;
