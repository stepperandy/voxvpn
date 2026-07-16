import React, { useState } from "react";
import { X, Zap, CreditCard, Loader2, AlertCircle } from "lucide-react";

export default function PaymentChoiceModal({ isOpen, onClose, totalCost, userCredits, onPayWithCredits, onPayWithCard }) {
  const [loading, setLoading] = useState(null); // 'credits' | 'card'
  const [error, setError] = useState(null);
  const parsedCredits = parseFloat(userCredits) || 0;
  const parsedTotal = parseFloat(totalCost) || 0;
  const hasEnoughCredits = parsedCredits >= parsedTotal;

  if (!isOpen) return null;

  const handleCredits = async () => {
    setError(null);
    setLoading('credits');
    try {
      await onPayWithCredits();
    } catch (err) {
      setError(err.message || "Credits payment failed.");
    }
    setLoading(null);
  };

  const handleCard = async () => {
    setError(null);
    setLoading('card');
    try {
      await onPayWithCard();
    } catch (err) {
      setError(err.message || "Card checkout failed.");
    }
    setLoading(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Choose Payment Method</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-5">
          Total: <span className="text-white font-semibold">${totalCost?.toFixed(2)}</span>
        </p>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {/* Credits */}
          <button
            onClick={handleCredits}
            disabled={!hasEnoughCredits || !!loading}
            className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${
              hasEnoughCredits
                ? "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/40 hover:border-cyan-500/70"
                : "bg-gray-800/40 border-gray-700 opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Pay with Credits</p>
                <p className="text-gray-500 text-xs">
                  Balance: ${parsedCredits.toFixed(2)} — {hasEnoughCredits ? "sufficient ✓" : `need $${parsedTotal.toFixed(2)}`}
                </p>
              </div>
            </div>
            {loading === 'credits' ? <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" /> : <span className="text-gray-500 text-xs">→</span>}
          </button>

          {/* Card */}
          <button
            onClick={handleCard}
            disabled={!!loading}
            className="w-full flex items-center justify-between px-4 py-4 bg-gray-800/40 hover:bg-gray-800 border border-gray-700 hover:border-indigo-500/40 rounded-xl transition-all disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Pay with Card</p>
                <p className="text-gray-500 text-xs">Visa, Mastercard, Amex via Stripe</p>
              </div>
            </div>
            {loading === 'card' ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" /> : <span className="text-gray-500 text-xs">→</span>}
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-5">🔒 Secure & encrypted payments</p>
      </div>
    </div>
  );
}