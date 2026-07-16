import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, MessageCircle } from "lucide-react";

export default function ChatSupport() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => setUser(null));
    loadMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const msgs = await base44.entities.ChatMessage.filter({}, '-created_date', 50);
      setMessages(msgs || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      message: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending',
      user_email: user.email,
    };

    setMessages(prev => [...prev, optimisticMsg]);
    const msgToSend = inputValue;
    setInputValue("");
    setLoading(true);

    try {
      const res = await base44.functions.invoke('sendChatMessage', {
        message: msgToSend,
        user_email: user.email,
      });

      if (!res.data?.success) throw new Error('Failed to send message');
      await loadMessages();
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      alert('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <p>Please log in to access chat support</p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold text-sm"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a1420]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-[#0d2137]">
        <MessageCircle className="w-5 h-5 text-cyan-400" />
        <h1 className="text-xl font-bold text-white">Chat Support</h1>
        <p className="text-gray-500 text-sm ml-auto">Our team typically responds within 2 hours</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-600">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-700" />
              <p>Start a conversation with our support team</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">S</span>
              </div>
            )}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
            >
              <p className="text-sm break-words">{msg.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-800 bg-[#0d2137]">
        <div className="flex gap-3">
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !inputValue.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#0A192F] p-3 rounded-lg transition-colors flex-shrink-0 min-h-[2.75rem] min-w-[2.75rem] flex items-center justify-center font-semibold"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}