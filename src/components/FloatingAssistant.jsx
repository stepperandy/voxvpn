import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, X, Send, Loader2, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AGENT_NAME = 'voxvpn_support';

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && !conversation) {
      initConversation();
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    setInitializing(true);
    try {
      const convo = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: 'VoxVPN Chat' },
      });
      setConversation(convo);
      setMessages(convo.messages || []);
      base44.agents.subscribeToConversation(convo.id, (data) => {
        setMessages(data.messages || []);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setInitializing(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !conversation) return;
    const text = input.trim();
    setInput('');
    setLoading(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
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

  const visibleMessages = messages.filter(m => m.content && m.role !== 'tool');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {open && (
        <div className="w-[340px] sm:w-[380px] rounded-2xl border border-white/10 bg-[#0d1120] shadow-2xl flex flex-col overflow-hidden"
          style={{ height: '480px' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#0a1428] border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Shield size={14} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold leading-none">VoxVPN Assistant</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs">Online</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {initializing ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={20} className="text-cyan-400 animate-spin" />
              </div>
            ) : visibleMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Shield size={28} className="text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm font-medium">Hi! I'm your VoxVPN assistant.</p>
                <p className="text-slate-600 text-xs mt-1">Ask me anything about setup, plans, or troubleshooting.</p>
              </div>
            ) : (
              visibleMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/15 border border-cyan-500/20 text-white'
                      : 'bg-[#0a1428] border border-white/5 text-slate-200'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="leading-relaxed">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          p: ({ children }) => <p className="my-1 leading-relaxed text-sm">{children}</p>,
                          a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{children}</a>,
                          ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                          li: ({ children }) => <li className="my-0.5 text-sm">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/5 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 bg-[#091523] border border-white/10 focus:border-cyan-500/40 rounded-xl px-3 py-2 text-white text-sm outline-none placeholder:text-slate-600"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-black flex items-center justify-center transition-all flex-shrink-0"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/30 flex items-center justify-center transition-all active:scale-95"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}