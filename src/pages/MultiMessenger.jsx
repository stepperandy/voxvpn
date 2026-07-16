import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Phone } from "lucide-react";
import WhatsAppMessenger from "@/components/messaging/WhatsAppMessenger";
import TelegramMessenger from "@/components/messaging/TelegramMessenger";
import BillingManager from "@/components/billing/BillingManager";

export default function MultiMessenger() {
  const [numbers, setNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    loadNumbers();
  }, []);

  const loadNumbers = async () => {
    try {
      const user = await base44.auth.me();
      const data = await base44.entities.VirtualNumber.filter(
        { customer_email: user.email, status: 'active' },
        "-created_date"
      );
      setNumbers(data || []);
      if (data && data.length > 0) {
        setSelectedNumber(data[0]);
        loadMessages(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load numbers:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (numberId) => {
    try {
      const whatsapp = await base44.entities.WhatsAppMessage.filter(
        { virtual_number_id: numberId },
        "-created_date",
        10
      );
      const telegram = await base44.entities.TelegramMessage.filter(
        { virtual_number_id: numberId },
        "-created_date",
        10
      );

      setMessages({
        whatsapp: whatsapp || [],
        telegram: telegram || []
      });
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleNumberChange = (number) => {
    setSelectedNumber(number);
    loadMessages(number.id);
  };

  const handleMessageSent = () => {
    if (selectedNumber) {
      loadMessages(selectedNumber.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Multi-Channel Messaging</h1>
          <p className="text-gray-400">WhatsApp, Telegram, SMS & Billing Management</p>
        </div>

        {numbers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <Phone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No active virtual numbers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Number Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-400 mb-3">Your Numbers</h3>
                <div className="space-y-2">
                  {numbers.map(num => (
                    <button
                      key={num.id}
                      onClick={() => handleNumberChange(num)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                        selectedNumber?.id === num.id
                          ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300"
                          : "bg-gray-900/50 border border-gray-700 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      {num.phone_number}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messaging & Billing */}
            <div className="lg:col-span-3 space-y-6">
              {selectedNumber && (
                <>
                  {/* WhatsApp */}
                  <WhatsAppMessenger
                    virtualNumberId={selectedNumber.id}
                    onMessageSent={handleMessageSent}
                  />

                  {/* Telegram */}
                  <TelegramMessenger
                    virtualNumberId={selectedNumber.id}
                    onMessageSent={handleMessageSent}
                  />

                  {/* Billing */}
                  <BillingManager
                    stripeCustomerId={selectedNumber.stripe_customer_id}
                    paypalSubscriptionId={selectedNumber.paypal_subscription_id}
                  />

                  {/* Recent Messages */}
                  <div className="space-y-4">
                    {messages.whatsapp?.length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-gray-300 mb-3">Recent WhatsApp</h4>
                        <div className="space-y-2">
                          {messages.whatsapp.map(msg => (
                            <div key={msg.id} className="text-xs p-2 bg-gray-900/50 rounded border border-gray-700">
                              <p className="text-gray-400">{msg.to_whatsapp}</p>
                              <p className="text-gray-300 mt-1">{msg.message_body}</p>
                              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                                msg.status === 'delivered' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {msg.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.telegram?.length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-gray-300 mb-3">Recent Telegram</h4>
                        <div className="space-y-2">
                          {messages.telegram.map(msg => (
                            <div key={msg.id} className="text-xs p-2 bg-gray-900/50 rounded border border-gray-700">
                              <p className="text-gray-400">Chat {msg.chat_id}</p>
                              <p className="text-gray-300 mt-1">{msg.message_body}</p>
                              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                                msg.status === 'delivered' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {msg.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}