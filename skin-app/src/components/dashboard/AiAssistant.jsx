import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Send, User, AlertCircle, Loader2 } from 'lucide-react';

// ── Config ───────────────────────────────────────────────────────────────
// Uses Google's Gemini API free tier (no credit card required).
// Get a free key at https://aistudio.google.com/apikey
// This call is made directly from the browser — fine for a local/college
// project, but don't deploy this publicly with your real key attached.
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = `You are the AI Assistant inside DermaLens, a skin disease
detection app. You answer users' questions about skin conditions, symptoms,
general skincare, and how to use the app.

Rules:
- Give clear, helpful, general educational information about skin conditions.
- You are NOT a replacement for a dermatologist. For anything that sounds
  serious, changing, painful, or bleeding, clearly recommend seeing a doctor.
- Never claim to diagnose the user. You can discuss what the app's prediction
  results might mean in general terms, but the final call is a professional's.
- Keep answers concise and easy to read for a non-medical audience.`;

const AiAssistant = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        t(
          'dashboard.assistant.greeting',
          "Hi! I'm your skin health assistant. Ask me about symptoms, skin conditions, or your scan results — I'm here to help explain things, though I can't replace a doctor's diagnosis."
        ),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    if (!API_KEY) {
      setError(
        'No API key found. Add REACT_APP_GEMINI_API_KEY to your .env file and restart the dev server.'
      );
      return;
    }

    const nextMessages = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Gemini uses "user"/"model" roles, and history goes in `contents`.
      const contents = nextMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Request failed');
      }

      const reply =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
        "Sorry, I couldn't generate a response.";

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || 'Something went wrong reaching the assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[calc(100vh-160px)] max-h-[720px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-800 dark:text-white truncate">
            {t('dashboard.assistant.title', 'AI Assistant')}
          </h2>
          <p className="text-xs text-slate-400 truncate">
            {t('dashboard.assistant.subtitle', 'Ask about symptoms, conditions, or your results')}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[75%] whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('dashboard.assistant.thinking', 'Thinking...')}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="px-5 pb-2">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
          {t(
            'dashboard.assistant.disclaimer',
            'This assistant provides general information only and is not a medical diagnosis.'
          )}
        </p>
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 p-4 border-t border-slate-100 dark:border-slate-700">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={t('dashboard.assistant.placeholder', 'Ask a skin-related question...')}
          className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-10 h-10 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AiAssistant;
