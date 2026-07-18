import React from "react";
import { Zap, CreditCard, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function InsufficientCreditsModal({ isOpen, onClose, onPayWithCard, price, balance }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#0d2137] border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">Choose Payment Method</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-1">
          Your balance: <span className="text-white font-semibold">${(balance || 0).toFixed(2)}</span>
        </p>
        <p className="text-gray-400 text-sm mb-6">
          Required: <span className="text-cyan-400 font-semibold">${(price || 0).toFixed(2)}</span>
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/Billing"
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors text-sm"
          >
            <Zap className="w-4 h-4" />
            Add Credits & Pay
          </Link>
          <button
            onClick={() => { onClose(); onPayWithCard(); }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <CreditCard className="w-4 h-4" />
            Pay with Card (Stripe)
          </button>
        </div>
      </div>
    </div>
  );
}