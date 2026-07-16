import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { HelpCircle, X, Send, Loader2, Plus, Bot, ChevronDown, Minimize2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const AGENT_NAME = "customer_support";

const PAGE_LABELS = {
  "/": "Home page",
  "/Home": "Home page",
  "/ESimStore": "eSIM Store",
  "/VirtualNumbers": "Virtual Numbers Store",
  "/Dashboard": "Dashboard",
  "/SMSInbox": "SMS Inbox",
  "/Dialer": "Dialer",
  "/ESimDashboard": "My eSIMs",
  "/ServicesDashboard": "My Services",
  "/Credits": "Credits page",
  "/BuyCredits": "Buy Credits",
  "/NumberSettings": "Number Settings",
  "/Preferences": "Preferences",
  "/UserTickets": "My Support Tickets",
  "/LoyaltyProgram": "Rewards & Loyalty",
  "/SubscriptionManager": "Subscription Manager",
  "/PhoneNumberPorting": "Phone Number Porting",
  "/ESimActivationGuide": "eSIM Activation Guide",
  "/AboutUs": "About VoxDigits",
};

const QUICK_QUESTIONS = [
  "How do I activate my eSIM?",
  "How do virtual numbers work?",
  "How do I add credits?",
  "Can I port my number?",
  "Why isn't my eSIM working?",
  "How does call forwarding work?",
];

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
        </div>
      )}
      {message.content && (
        <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm ${
          isUser
            ? "bg-cyan-600 text-white rounded-br-none"
            : "bg-[#1a2d45] text-gray-200 border border-white/8 rounded-bl-none"
        }`}>
          {isUser ? (
            <p className="leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed"
              components={{
                a: ({ children, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">{children}</a>
                ),
                p: ({ children }) => <p className="my-1">{children}</p>,
                ul: ({ children }) => <ul className="my-1 ml-3 list-disc">{children}</ul>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      )}
      {message.tool_calls?.length > 0 && (
        <div className="text-xs text-gray-500 italic mt-1">Looking up info…</div>
      )}
    </div>
  );
}

export default function SupportChatWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentPage = PAGE_LABELS[location.pathname] || location.pathname.replace("/", "");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsub();
  }, [conversation?.id]);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, minimized]);

  const startConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: { name: `Support - ${currentPage}` },
    });
    setConversation(conv);
    setMessages([]);
    return conv;
  };

  const openChat = async () => {
    setOpen(true);
    setMinimized(false);
    if (!conversation) await startConversation();
  };

  const resetChat = async () => {
    const conv = await startConversation();
    setConversation(conv);
    setShowQuick(true);
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;

    let conv = conversation;
    if (!conv) conv = await startConversation();

    setInput("");
    setShowQuick(false);
    setSending(true);

    // Prepend page context on first real message
    const contextPrefix = messages.filter((m) => m.role === "user").length === 0
      ? `[User is on: ${currentPage}]\n`
      : "";

    await base44.agents.addMessage(conv, {
      role: "user",
      content: contextPrefix + msg,
    });
    setSending(false);
  };

  const handleQuick = (q) => {
    setShowQuick(false);
    sendMessage(q);
  };

  const unreadCount = 0; // placeholder for future badge

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[60] flex flex-col items-end gap-3">
      {/* Chat window */}
      {open && (
        <div
          className={`w-[340px] sm:w-[380px] bg-[#0d1f35] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden transition-all duration-200 ${
            minimized ? "h-14" : "h-[520px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-white/8 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">VoxDigits Support</p>
              {!minimized && <p className="text-xs text-cyan-400/70 truncate">📍 {currentPage}</p>}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                title="New conversation"
                className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
              >
                {minimized ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {/* Welcome */}
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div className="bg-[#1a2d45] border border-white/8 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-sm text-gray-200 max-w-[82%]">
                        <p>Hi! 👋 I'm your VoxDigits support assistant.</p>
                        <p className="mt-1 text-gray-400 text-xs">I can see you're on <strong className="text-cyan-400">{currentPage}</strong>. How can I help?</p>
                      </div>
                    </div>
                    {showQuick && (
                      <div className="ml-9 space-y-1.5">
                        {QUICK_QUESTIONS.map((q) => (
                          <button
                            key={q}
                            onClick={() => handleQuick(q)}
                            className="w-full text-left text-xs text-gray-300 bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-300 border border-white/8 hover:border-cyan-500/30 px-3 py-2 rounded-xl transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} />
                ))}

                {sending && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="bg-[#1a2d45] border border-white/8 rounded-2xl rounded-bl-none px-3.5 py-2.5">
                      <div className="flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/8 p-3 flex-shrink-0">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask me anything…"
                    rows={1}
                    className="flex-1 bg-[#18233f] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none placeholder-gray-600"
                    style={{ maxHeight: "100px", overflowY: "auto" }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={sending || !input.trim()}
                    className="w-9 h-9 flex-shrink-0 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
                  >
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-600 mt-2">Powered by VoxDigits AI</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => (open ? setOpen(false) : openChat())}
        className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full shadow-lg shadow-cyan-500/25 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        {open ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}