import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Bot, Plus, MessageCircle } from "lucide-react";
import MessageBubble from "@/components/agent/MessageBubble";

const AGENT_NAME = "voxdigits_assistant";

export default function AIAssistant() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeConversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(activeConversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsub();
  }, [activeConversation?.id]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const convs = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      setConversations(convs || []);
      if (convs?.length > 0) {
        await selectConversation(convs[0]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const selectConversation = async (conv) => {
    const full = await base44.agents.getConversation(conv.id);
    setActiveConversation(full);
    setMessages(full.messages || []);
  };

  const startNewConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: { name: `Chat ${new Date().toLocaleDateString()}` },
    });
    setConversations(prev => [conv, ...prev]);
    setActiveConversation(conv);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    let conv = activeConversation;
    if (!conv) {
      conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: `Chat ${new Date().toLocaleDateString()}` },
      });
      setConversations(prev => [conv, ...prev]);
      setActiveConversation(conv);
    }

    const text = input;
    setInput("");
    setSending(true);
    await base44.agents.addMessage(conv, { role: "user", content: text });
    setSending(false);
  };

  return (
    <div className="flex h-full bg-[#0a1420] overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-60 border-r border-gray-800 bg-[#0d2137] flex-shrink-0">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg font-semibold text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors truncate ${
                activeConversation?.id === conv.id
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {conv.metadata?.name || "Chat"}
            </button>
          ))}
        </div>
        {/* WhatsApp link */}
        <div className="p-4 border-t border-gray-800">
          <a
            href={base44.agents.getWhatsAppConnectURL(AGENT_NAME)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-[#0d2137] flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">VoxDigits AI Assistant</h1>
            <p className="text-xs text-green-400">● Online</p>
          </div>
          <button
            onClick={startNewConversation}
            className="ml-auto md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-white font-bold text-lg mb-2">How can I help you?</h2>
              <p className="text-gray-500 text-sm max-w-xs">Ask me about virtual numbers, eSIM plans, troubleshooting, or anything about VoxDigits.</p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
                {[
                  "How do I activate my eSIM?",
                  "What countries are available?",
                  "How do credits work?",
                  "I need help with my number",
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="px-3 py-2 text-xs text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))
          )}
          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-800 bg-[#0d2137] flex-shrink-0">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask me anything about VoxDigits..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-gray-950 p-3 rounded-xl transition-colors flex-shrink-0 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}