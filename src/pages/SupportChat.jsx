import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, MessageCircle, Shield, Loader2 } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import MessageBubble from '@/components/chat/MessageBubble';

const AGENT_NAME = 'voxvpn_support';

export default function SupportChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    try {
      const convo = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: 'VoxVPN Support Chat' },
      });
      setConversation(convo);

      const unsubscribe = base44.agents.subscribeToConversation(convo.id, (data) => {
        setMessages(data.messages || []);
      });

      setMessages(convo.messages || []);
      return () => unsubscribe();
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

  const suggestions = [
    'How do I set up VoxVPN on Windows?',
    'What plans do you offer?',
    'How do I import my .conf file?',
    'I\'m having trouble connecting',
  ];

  return (
    <div className="bg-[#080c18] min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 pt-28 pb-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Shield size={22} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl">VoxVPN Assistant</h1>
            <p className="text-slate-400 text-sm">Support, setup help & plan info</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Online</span>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-[#0d1120] border border-white/5 rounded-2xl flex flex-col overflow-hidden" style={{ minHeight: '500px' }}>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {initializing ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={24} className="text-cyan-400 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <MessageCircle size={32} className="text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">Ask me anything about VoxVPN!</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="px-3 py-1.5 rounded-full border border-white/10 text-slate-400 text-xs hover:text-white hover:border-cyan-500/40 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/5 p-4 flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 bg-[#091523] border border-white/10 focus:border-cyan-500/40 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none placeholder:text-slate-600"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-11 h-11 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-black flex items-center justify-center transition-all flex-shrink-0 self-end"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-4 p-4 rounded-xl border border-white/5 bg-[#0d1120] flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-semibold">Chat on WhatsApp</p>
            <p className="text-slate-400 text-xs">Get support directly on WhatsApp</p>
          </div>
          <a
            href={base44.agents.getWhatsAppConnectURL(AGENT_NAME)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-xl transition-all"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}