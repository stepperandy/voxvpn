import React, { useEffect, useRef } from "react";
import { Phone, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ThreadView({ 
  contact, 
  messages = [], 
  messageText, 
  onMessageChange, 
  onSend, 
  sending 
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.created_date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-gray-900/50">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
          <Phone className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold font-mono text-sm">{contact}</p>
          <p className="text-gray-600 text-xs">SMS Thread</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-800"></div>
              <span className="text-gray-600 text-xs">{date}</span>
              <div className="flex-1 h-px bg-gray-800"></div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-2">
              {dayMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`group relative max-w-[70%] ${msg.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
                    <div className={`select-text px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-colors ${
                      msg.direction === 'outbound'
                        ? 'bg-cyan-500 text-[#0A192F] rounded-br-md'
                        : 'bg-gray-800 text-white rounded-bl-md'
                    }`}>
                      {msg.body}
                    </div>
                    <p className={`text-gray-600 text-xs mt-1 px-2 ${
                      msg.direction === 'outbound' ? 'text-right' : 'text-left'
                    }`}>
                      {msg.created_date ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true }) : 'Now'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex gap-3">
        <input
          value={messageText}
          onChange={e => onMessageChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSend()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
        />
        <button
          onClick={onSend}
          disabled={sending || !messageText.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#0A192F] p-3 rounded-xl transition-colors flex-shrink-0"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}