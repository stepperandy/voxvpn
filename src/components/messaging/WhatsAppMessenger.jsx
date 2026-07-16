import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, AlertCircle } from "lucide-react";

export default function WhatsAppMessenger({ virtualNumberId, onMessageSent }) {
  const [toWhatsApp, setToWhatsApp] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!toWhatsApp || !message.trim()) {
      setStatus({ type: "error", message: "Please fill in all fields" });
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const res = await base44.functions.invoke("sendWhatsApp", {
        virtual_number_id: virtualNumberId,
        to_whatsapp: toWhatsApp,
        message_body: message
      });

      if (res.data?.success) {
        setStatus({ type: "success", message: "WhatsApp sent!" });
        setToWhatsApp("");
        setMessage("");
        if (onMessageSent) onMessageSent(res.data);
      } else {
        setStatus({ type: "error", message: res.data?.error || "Failed to send" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Error sending message" });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span>💬</span> WhatsApp
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">To WhatsApp Number</label>
        <input
          type="text"
          value={toWhatsApp}
          onChange={(e) => setToWhatsApp(e.target.value)}
          placeholder="+1234567890"
          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          rows="3"
          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
        />
      </div>

      {status && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          status.type === "success"
            ? "bg-green-500/10 border border-green-500/30 text-green-300"
            : "bg-red-500/10 border border-red-500/30 text-red-300"
        }`}>
          <AlertCircle className="w-4 h-4" />
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 rounded-lg font-bold text-sm transition-colors"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {sending ? "Sending..." : "Send via WhatsApp"}
      </button>
    </form>
  );
}