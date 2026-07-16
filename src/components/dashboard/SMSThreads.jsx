import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function SMSThreads({ number }) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) loadThreads();
  }, [open, number]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const allMessages = await base44.entities.Message.filter({ our_number: number }, '-created_date');
      const threadMap = {};
      
      allMessages.forEach(msg => {
        const otherNumber = msg.direction === 'inbound' ? msg.from_number : msg.to_number;
        if (!threadMap[otherNumber]) {
          threadMap[otherNumber] = [];
        }
        threadMap[otherNumber].push(msg);
      });

      const threadsList = Object.entries(threadMap).map(([contactNumber, msgs]) => ({
        contactNumber,
        lastMessage: msgs[0].body,
        lastTime: msgs[0].created_date,
        unreadCount: msgs.filter(m => m.direction === 'inbound').length
      }));

      setThreads(threadsList.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime)));
    } finally {
      setLoading(false);
    }
  };

  const selectThread = async (contactNumber) => {
    setSelectedThread(contactNumber);
    const threadMessages = await base44.entities.Message.filter({
      our_number: number,
      $or: [
        { from_number: contactNumber },
        { to_number: contactNumber }
      ]
    }, '-created_date');
    setMessages(threadMessages || []);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    setSending(true);
    try {
      await base44.functions.invoke('sendSMS', {
        from_number: number,
        to_number: selectedThread,
        body: replyText
      });

      setReplyText("");
      await selectThread(selectedThread);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          SMS Threads
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#0d2137] border border-gray-700 max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">SMS Conversations - {number}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Threads List */}
          <div className="w-64 border-r border-gray-700 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              </div>
            ) : threads.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm text-center">No conversations yet</div>
            ) : (
              threads.map(thread => (
                <button
                  key={thread.contactNumber}
                  onClick={() => selectThread(thread.contactNumber)}
                  className={`w-full text-left p-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                    selectedThread === thread.contactNumber ? 'bg-gray-800/50' : ''
                  }`}
                >
                  <p className="font-mono text-sm text-white">{thread.contactNumber}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{thread.lastMessage}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(thread.lastTime).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Conversation View */}
          <div className="flex-1 flex flex-col">
            {selectedThread ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 mb-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                          msg.direction === 'outbound'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        {msg.body}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                <div className="border-t border-gray-700 p-4 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendReply()}
                    placeholder="Type your reply..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#0A192F] px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}