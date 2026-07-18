import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Send, Loader2, Plus, Search, X, CheckCheck, ArrowLeft,
  MessageSquare, Copy, Check, Phone, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── pure helpers (defined outside component so they never change) ──
function buildThreads(messages) {
  const map = new Map();
  for (const msg of messages) {
    const contact = msg.direction === "inbound" ? msg.from_number : msg.to_number;
    if (!contact) continue;
    const existing = map.get(contact);
    if (!existing || new Date(msg.created_date) > new Date(existing.lastTime)) {
      map.set(contact, { contact, lastMessage: msg.body, lastTime: msg.created_date });
    }
  }
  return Array.from(map.values()).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
}

function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitials(phone) {
  return ((phone || "").replace(/\D/g, "")).slice(-2) || "?";
}

function extractOTP(body) {
  const m = (body || "").match(/\b(\d{4,8})\b/);
  return m ? m[1] : null;
}

function groupByDate(msgs) {
  const grouped = {};
  for (const m of msgs) {
    const key = new Date(m.created_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  }
  return grouped;
}

const AVATAR_COLORS = ["#00c896", "#00a8b5", "#0ea5e9", "#6366f1", "#8b5cf6"];
const avatarColor = (s) => AVATAR_COLORS[((s || "").charCodeAt((s || "").length - 1) || 0) % AVATAR_COLORS.length];

const TEAL = "#00c896";
const BG_MAIN = "#111827";
const BG_SIDEBAR = "#0f172a";
const BG_CARD = "#1a2234";
const BORDER = "rgba(0,200,150,0.15)";

// ── Sidebar (stable component, receives everything via props) ──
const Sidebar = React.memo(function Sidebar({
  threads, virtualNumbers, selectedNumber, selectedContact, searchQuery,
  showNewMessage, newMessagePhone, contactPickerSupported,
  onSelectThread, onNumberChange, onSearch, onNewMsgPhoneChange,
  onStartNewMessage, onShowNewMessage, onHideNewMessage, onPickContact,
}) {
  return (
    <div className="flex flex-col h-full" style={{ background: BG_SIDEBAR }}>
      <div className="px-5 pt-6 pb-4 flex-shrink-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onShowNewMessage}
            className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: TEAL }}>
            <Plus className="w-4 h-4 text-white" />
          </motion.button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4b5563" }} />
          <input type="text" value={searchQuery} onChange={e => onSearch(e.target.value)}
            placeholder="Search…" className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none"
            style={{ background: BG_CARD, border: `1px solid ${BORDER}` }} />
        </div>
        {virtualNumbers.length > 1 && (
          <div className="relative mt-3">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: TEAL }} />
            <select value={selectedNumber} onChange={e => onNumberChange(e.target.value)}
              className="w-full pl-8 pr-8 py-2 rounded-xl text-xs text-white font-mono focus:outline-none appearance-none"
              style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
              {virtualNumbers.map(n => <option key={n.id} value={n.number} className="bg-gray-900">{n.number}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: TEAL }} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showNewMessage && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden flex-shrink-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <div className="px-4 py-3" style={{ background: "rgba(0,200,150,0.05)" }}>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: TEAL }}>New Message</p>
              <div className="flex gap-2">
                <input type="tel" value={newMessagePhone} onChange={e => onNewMsgPhoneChange(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && onStartNewMessage()}
                  autoFocus placeholder="+1 234 567 8900"
                  className="flex-1 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none"
                  style={{ background: "transparent", border: `1px solid ${BORDER}` }} />
                {contactPickerSupported && (
                  <button onClick={onPickContact} title="Pick from contacts"
                    className="p-2 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,200,150,0.15)", border: `1px solid ${BORDER}`, color: TEAL }}>
                    <Phone className="w-4 h-4" />
                  </button>
                )}
                <button onClick={onStartNewMessage} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: TEAL }}>Start</button>
                <button onClick={onHideNewMessage} className="p-2 rounded-xl" style={{ color: "#6b7280" }}><X className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(0,200,150,0.08)", border: `1px solid ${BORDER}` }}>
              <MessageSquare className="w-7 h-7" style={{ color: TEAL, opacity: 0.6 }} />
            </div>
            <p className="text-sm" style={{ color: "#6b7280" }}>No conversations yet</p>
            <button onClick={onShowNewMessage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: TEAL }}>
              <Plus className="w-4 h-4" /> New Message
            </button>
          </div>
        ) : threads.map((thread, idx) => {
          const isActive = selectedContact === thread.contact;
          return (
            <button key={thread.contact} onClick={() => onSelectThread(thread.contact)}
              className="w-full text-left px-4 py-3.5 transition-all flex items-center gap-3"
              style={{
                background: isActive ? "rgba(0,200,150,0.10)" : "transparent",
                borderBottom: `1px solid rgba(255,255,255,0.04)`,
                borderLeft: isActive ? `3px solid ${TEAL}` : "3px solid transparent",
              }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                style={{ background: avatarColor(thread.contact) }}>
                {getInitials(thread.contact)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate font-mono">{thread.contact}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: "#6b7280" }}>{thread.lastMessage}</p>
              </div>
              <span className="text-[10px] flex-shrink-0" style={{ color: "#4b5563" }}>{formatTime(thread.lastTime)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// ── Thread view (stable component) ──
const ThreadView = React.memo(function ThreadView({
  selectedContact, selectedNumber, virtualNumbers, threadMessages,
  messageText, sending, sendError,
  onBack, onNumberChange, onMessageChange, onSend, onClearError,
}) {
  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full min-w-0" style={{ background: BG_MAIN }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ background: BG_CARD, borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={onBack} className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: avatarColor(selectedContact) }}>
          {getInitials(selectedContact)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate font-mono text-sm">{selectedContact}</p>
          <p className="text-[11px]" style={{ color: "#6b7280" }}>via {selectedNumber}</p>
        </div>
        {virtualNumbers.length > 1 && (
          <select value={selectedNumber} onChange={e => onNumberChange(e.target.value)}
            className="text-xs text-white font-mono focus:outline-none rounded-xl px-2 py-1.5"
            style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
            {virtualNumbers.map(n => <option key={n.id} value={n.number} className="bg-gray-900">{n.number}</option>)}
          </select>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {threadMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <MessageSquare className="w-10 h-10" style={{ color: "#374151" }} />
            <p className="text-sm" style={{ color: "#6b7280" }}>No messages yet — say hello!</p>
          </div>
        ) : Object.entries(groupByDate(threadMessages)).map(([dateKey, msgs]) => (
          <div key={dateKey} className="space-y-2">
            <div className="flex items-center justify-center">
              <span className="text-[11px] font-medium px-3 py-1 rounded-full"
                style={{ background: BG_CARD, border: `1px solid ${BORDER}`, color: "#6b7280" }}>{dateKey}</span>
            </div>
            {msgs.map((msg, i) => {
              const isOut = msg.direction === "outbound";
              const otp = !isOut ? extractOTP(msg.body) : null;
              return (
                <div key={msg.id} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[72%] flex flex-col gap-1 ${isOut ? "items-end" : "items-start"}`}>
                    <div className="px-4 py-2.5 text-sm leading-relaxed break-words"
                      style={isOut
                        ? { background: TEAL, color: "#0f172a", borderRadius: "18px 18px 4px 18px" }
                        : { background: BG_CARD, color: "#e5e7eb", border: `1px solid ${BORDER}`, borderRadius: "18px 18px 18px 4px" }}>
                      {msg.body}
                      {otp && (
                        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl"
                          style={{ background: "rgba(0,200,150,0.15)", border: `1px solid rgba(0,200,150,0.3)` }}>
                          <span className="font-mono font-bold tracking-widest text-base" style={{ color: TEAL }}>{otp}</span>
                          <button onClick={() => copyToClipboard(otp, msg.id)} className="ml-auto" style={{ color: TEAL }}>
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] px-1" style={{ color: "#4b5563" }}>
                      {new Date(msg.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {isOut && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      <AnimatePresence>
        {sendError && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-4 mb-2 px-4 py-2.5 rounded-xl text-sm flex items-center justify-between"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
            <span>{sendError}</span>
            <button onClick={onClearError} className="ml-2"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <div className="flex-shrink-0 px-4 py-3"
        style={{ background: BG_CARD, borderTop: `1px solid ${BORDER}`, paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <div className="flex gap-2 items-end">
          <textarea
            value={messageText}
            onChange={e => onMessageChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey && !sending) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none resize-none"
            style={{ background: BG_MAIN, border: `1px solid ${BORDER}` }}
          />
          <button onClick={onSend} disabled={sending || !messageText.trim()}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
            style={{ background: messageText.trim() ? TEAL : BG_MAIN, border: `1px solid ${BORDER}` }}>
            {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
});

// ── Main page ──
export default function SMSInbox() {
  const [allMessages, setAllMessages] = useState([]);
  const [virtualNumbers, setVirtualNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessagePhone, setNewMessagePhone] = useState("");
  const [contactPickerSupported] = useState(() => 'contacts' in navigator && 'ContactsManager' in window);
  const [mobileView, setMobileView] = useState("list");

  // Derive thread data
  const numberMessages = allMessages.filter(m => {
    if (!selectedNumber) return true;
    return (m.our_number || "").replace(/\D/g, "") === selectedNumber.replace(/\D/g, "");
  });

  const threads = buildThreads(numberMessages).filter(t =>
    t.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const threadMessages = selectedContact
    ? numberMessages
        .filter(m => (m.direction === "inbound" ? m.from_number : m.to_number) === selectedContact)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    : [];

  // Load data
  useEffect(() => {
    (async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const [nums, msgs] = await Promise.all([
          base44.entities.VirtualNumber.filter({ userId: currentUser.id }),
          base44.entities.Message.filter({ user_email: currentUser.email }, "-created_date", 500),
        ]);
        const validNums = nums || [];
        setVirtualNumbers(validNums);
        if (validNums.length > 0) setSelectedNumber(validNums[0].number);
        setAllMessages(msgs || []);
      } catch (err) {
        console.error("Failed to load SMS data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!user?.email) return;
    return base44.entities.Message.subscribe((event) => {
      if (event.type === "create" && event.data?.user_email === user.email) {
        setAllMessages(prev => prev.some(m => m.id === event.data.id) ? prev : [event.data, ...prev]);
      }
    });
  }, [user?.email]);

  // Stable callbacks
  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !selectedContact || !selectedNumber) return;
    setSending(true);
    setSendError("");
    try {
      const res = await base44.functions.invoke("sendSms", {
        from: selectedNumber,
        to: selectedContact,
        message: messageText,
      });
      if (!res.data?.success) {
        setSendError(res.data?.error || "Failed to send SMS");
      } else {
        setMessageText("");
      }
    } catch (err) {
      setSendError(err.response?.data?.error || err.message || "Failed to send SMS.");
    } finally {
      setSending(false);
    }
  }, [messageText, selectedContact, selectedNumber]);

  const handleSelectThread = useCallback((contact) => {
    setSelectedContact(contact);
    setMobileView("thread");
    setSendError("");
  }, []);

  const handleStartNewMessage = useCallback(() => {
    const phone = newMessagePhone.trim();
    if (!phone) return;
    handleSelectThread(phone);
    setNewMessagePhone("");
    setShowNewMessage(false);
  }, [newMessagePhone, handleSelectThread]);

  const handleBack = useCallback(() => { setMobileView("list"); setSelectedContact(null); }, []);
  const handleNumberChange = useCallback((n) => { setSelectedNumber(n); setSelectedContact(null); }, []);

  const handlePickContact = useCallback(async () => {
    try {
      const contacts = await navigator.contacts.select(['tel'], { multiple: false });
      if (contacts && contacts.length > 0 && contacts[0].tel && contacts[0].tel.length > 0) {
        const phone = contacts[0].tel[0].replace(/\s+/g, '');
        setNewMessagePhone(phone);
      }
    } catch (err) {
      console.error('Contact picker error:', err);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "calc(100vh - 57px)", background: BG_MAIN }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: TEAL }} />
      </div>
    );
  }

  const sidebarProps = {
    threads, virtualNumbers, selectedNumber, selectedContact, searchQuery,
    showNewMessage, newMessagePhone, contactPickerSupported,
    onSelectThread: handleSelectThread,
    onNumberChange: handleNumberChange,
    onSearch: setSearchQuery,
    onNewMsgPhoneChange: setNewMessagePhone,
    onStartNewMessage: handleStartNewMessage,
    onShowNewMessage: () => setShowNewMessage(true),
    onHideNewMessage: () => { setShowNewMessage(false); setNewMessagePhone(""); },
    onPickContact: handlePickContact,
  };

  const threadProps = {
    selectedContact, selectedNumber, virtualNumbers, threadMessages,
    messageText, sending, sendError,
    onBack: handleBack,
    onNumberChange: handleNumberChange,
    onMessageChange: setMessageText,
    onSend: handleSend,
    onClearError: () => setSendError(""),
  };

  return (
    <div className="flex text-white" style={{ height: "calc(100vh - 57px)", overflow: "hidden", background: BG_MAIN }}>
      {/* Desktop */}
      <div className="hidden min-[600px]:flex w-72 lg:w-80 flex-shrink-0 flex-col" style={{ borderRight: `1px solid ${BORDER}` }}>
        <Sidebar {...sidebarProps} />
      </div>
      <div className="hidden min-[600px]:flex flex-1 min-w-0">
        {selectedContact ? (
          <ThreadView {...threadProps} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8" style={{ background: BG_MAIN }}>
            <MessageSquare className="w-12 h-12" style={{ color: "#374151" }} />
            <p className="text-white font-bold">Select a conversation or start a new one</p>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="flex min-[600px]:hidden flex-1 flex-col min-w-0">
        {mobileView === "thread" && selectedContact
          ? <ThreadView {...threadProps} />
          : <Sidebar {...sidebarProps} />
        }
      </div>
    </div>
  );
}