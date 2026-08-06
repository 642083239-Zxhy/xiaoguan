import { mockFaqs, mockScripts, mockSkus } from '../data/mockData.js';

const STORAGE_KEYS = {
  skus: 'mouse_ai_skus',
  faqs: 'mouse_ai_faqs',
  scripts: 'mouse_ai_scripts',
  analytics: 'mouse_ai_analytics'
};

const read = (key, fallback) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS[key]);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  return value;
};

export const getSkus = () => read('skus', mockSkus);
export const saveSkus = (items) => write('skus', items);
export const getFaqs = () => read('faqs', mockFaqs);
export const saveFaqs = (items) => write('faqs', items);
export const getScripts = () => read('scripts', mockScripts);
export const saveScripts = (items) => write('scripts', items);

const EMPTY_ANALYTICS = { purchaseClicks: 0, contactClicks: 0, sessions: [], convertedSessions: [] };

export const calculateConversionMetrics = (value = {}) => {
  const sessions = [...new Set(Array.isArray(value.sessions) ? value.sessions.filter(Boolean) : [])];
  const convertedSessions = [...new Set(
    (Array.isArray(value.convertedSessions) ? value.convertedSessions : [])
      .filter(sessionId => sessionId && sessions.includes(sessionId))
  )];
  const sessionCount = sessions.length;
  const convertedSessionCount = convertedSessions.length;
  return {
    ...EMPTY_ANALYTICS,
    ...value,
    purchaseClicks: Number(value.purchaseClicks || 0),
    contactClicks: Number(value.contactClicks || 0),
    sessions,
    convertedSessions,
    sessionCount,
    convertedSessionCount,
    conversionRate: sessionCount ? Number(((convertedSessionCount / sessionCount) * 100).toFixed(1)) : 0
  };
};

export const trackSession = (sessionId) => {
  if (!sessionId) return getAnalytics();
  const analytics = calculateConversionMetrics(read('analytics', EMPTY_ANALYTICS));
  return write('analytics', calculateConversionMetrics({
    ...analytics,
    sessions: [...analytics.sessions, sessionId]
  }));
};

export const trackConversion = (event, sessionId = '') => {
  const analytics = calculateConversionMetrics(read('analytics', EMPTY_ANALYTICS));
  const key = event === 'purchase' ? 'purchaseClicks' : 'contactClicks';
  return write('analytics', calculateConversionMetrics({
    ...analytics,
    [key]: analytics[key] + 1,
    sessions: sessionId ? [...analytics.sessions, sessionId] : analytics.sessions,
    convertedSessions: sessionId ? [...analytics.convertedSessions, sessionId] : analytics.convertedSessions
  }));
};

export const getAnalytics = () => calculateConversionMetrics(read('analytics', EMPTY_ANALYTICS));
