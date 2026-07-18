import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Phone, MessageSquare, Loader2, Plus, RefreshCw, ChevronDown } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { usePullToRefresh } from "@/components/hooks/usePullToRefresh";
import ThreadView from "@/components/inbox/ThreadView";

export default function Inbox() {
  const [ownedNumbers, setOwnedNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newRecipient, setNewRecipient] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingNums, setLoadingNums] = useState(true);
  const [composing, setComposing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadNumbers = async () => {
      const res = await base44.functions.invoke('getOwnedNumbers', {});
      const raw = res.data?.data;
      const nums = Array.isArray(raw) ? raw : [];
      setOwnedNumbers(nums);
      const params = new URLSearchParams(window.location.search);
      const urlNumber = params.get('number');
      if (urlNumber) {
        setSelectedNumber(urlNumber);
      } else if (nums.length > 0) {
        setSelectedNumber(nums[0].phone_number);
      }
      setLoadingNums(false);
    };
    loadNumbers();
  }, []);

  useEffect(() => {
    if (!selectedNumber) return;
    loadMessages();
  }, [selectedNumber]);

  usePullToRefresh(() => {
    setRefreshing(true);
    loadMessages(true);
  }, containerRef, { disabled: false });

  const loadMessages = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const msgs = await base44.entities.Message.filter({ our_number: selectedNumber }, 'created_date', 200);
      setMessages(msgs);
      const contactSet = new Set();
      msgs.forEach(m => {
        const contact = m.direction === 'outbound' ? m.to_number : m.from_number;
        contactSet.add(contact);
      });
      setContacts([...contactSet]);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredMessages = messages.filter(m =>
    selectedContact && (m.from_number === selectedContact || m.to_number === selectedContact)
  );

  const sendMessage = async () => {
    const recipient = composing ? newRecipient : selectedContact;
    if (!messageText.trim() || !selectedNumber || !recipient) return;

    // Optimistic update
    const optimisticMsg = {
      id: `optimistic-${Date.now()}`,
      from_number: selectedNumber,
      to_number: recipient,
      our_number: selectedNumber,
      body: messageText,
      direction: 'outbound',
      status: 'sending',
    };
    setMessages(prev => [...prev, optimisticMsg]);
    if (!contacts.includes(recipient)) setContacts(prev => [...prev, recipient]);
    const textToSend = messageText;
    setMessageText("");
    if (composing) {
      setSelectedContact(recipient);
      setComposing(false);
      setNewRecipient("");
    }

    setSending(true);
    try {
      const res = await base44.functions.invoke('sendSms', {
        from_number: selectedNumber,
        to_number: recipient,
        body: textToSend,
      });
      if (res.data?.error) throw new Error(res.data.error);
      await loadMessages();
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      alert(err.message || 'Failed to send message. Please try again.');
    }
    setSending(false);
  };



  if (loadingNums) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading...
      </div>
    );
  }

  if (ownedNumbers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center px-4">
        <div>
          <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-white font-semibold">No phone numbers yet</p>
          <p className="text-gray-500 text-sm mt-1">Purchase a number to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-72 border-r border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-gray-800">
          <Drawer>
            <DrawerTrigger asChild>
              <button className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none font-mono flex items-center justify-between">
                <span className="truncate">{selectedNumber || 'Select a number'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 ml-2" />
              </button>
            </DrawerTrigger>
            <DrawerContent className="bg-[#0d2137] border-gray-700">
              <DrawerHeader>
                <DrawerTitle className="text-white text-sm">Select Number</DrawerTitle>
              </DrawerHeader>
              <div className="pb-6 px-4 space-y-2">
                {ownedNumbers.map(n => (
                  <button
                    key={n.id}
                    onClick={() => { setSelectedNumber(n.phone_number); setSelectedContact(null); setComposing(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-mono text-sm transition-colors ${
                      selectedNumber === n.phone_number
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {n.phone_number}
                  </button>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
          <button
            onClick={() => { setComposing(true); setSelectedContact(null); setNewRecipient(""); }}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors min-h-[2.75rem] min-w-[2.75rem]"
            aria-label="Compose new message"
          >
            <Plus className="w-3.5 h-3.5" /> New Message
          </button>
          <button 
            onClick={() => loadMessages()}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-50 min-h-[2.75rem] min-w-[2.75rem] flex items-center justify-center"
            aria-label="Refresh messages"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="text-center py-10 text-gray-700 text-xs px-4">
              No conversations yet
            </div>
          ) : (
            contacts.map(contact => {
              const lastMsg = [...messages].reverse().find(m => m.from_number === contact || m.to_number === contact);
              return (
                <button
                   key={contact}
                   onClick={() => { setSelectedContact(contact); setComposing(false); }}
                   className={`w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 min-h-[3rem] ${
                     selectedContact === contact ? 'bg-gray-800/50' : ''
                   }`}
                   aria-label={`Chat with ${contact}`}
                 >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-white truncate">{contact}</p>
                      {lastMsg && <p className="text-xs text-gray-600 truncate mt-0.5">{lastMsg.body}</p>}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {composing ? (
          <>
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
              <span className="text-gray-500 text-sm flex-shrink-0">To:</span>
              <input
                value={newRecipient}
                onChange={e => setNewRecipient(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-600 font-mono"
                autoFocus
              />
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-700 text-sm">
              Enter a recipient number and type a message below
            </div>
            <div className="p-4 border-t border-gray-800 flex gap-3">
              <input
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !messageText.trim() || !newRecipient}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#0A192F] p-3 rounded-xl transition-colors flex-shrink-0 min-h-[2.75rem] min-w-[2.75rem] flex items-center justify-center"
                aria-label="Send message"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </>
        ) : selectedContact ? (


            <ThreadView 
              contact={selectedContact}
              messages={filteredMessages}
              messageText={messageText}
              onMessageChange={setMessageText}
              onSend={sendMessage}
              sending={sending}
            />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-700">
            <div className="text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-800" />
              <p>Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}