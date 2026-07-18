import React, { useState } from "react";
import { Zap, Loader2, CreditCard } from "lucide-react";
import { base44 } from "@/api/base44Client";

const AMOUNTS = [10, 25, 50, 100];

export default function WalletTopUp({ user, onSuccess }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTopUp = async (amount) => {
    setSelected(amount);
    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const res = await base44.functions.invoke("createWalletTopup", {
        amount,
        user_email: user.email,
        success_url: `${origin}/Credits?status=success`,
        cancel_url: `${origin}/Credits?status=cancel`,
      });
      const url = res.data?.url || res.url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(err.message || "Failed to start checkout");
      setLoading(false);
      setSelected(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-600/10 via-blue-600/10 to-purple-600/10 border border-cyan-500/20 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Add to Wallet</h3>
      </div>
      <p className="text-gray-400 text-sm mb-5">
        Top up your calling &amp; SMS balance. Payments are processed securely via Stripe.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {AMOUNTS.map((amt) => (
          <button
            key={amt}
            onClick={() => handleTopUp(amt)}
            disabled={loading}
            className={`relative flex flex-col items-center justify-center gap-1 py-5 rounded-xl border-2 font-bold text-lg transition-all
              ${selected === amt
                ? "border-cyan-400 bg-cyan-500/15 text-cyan-300"
                : "border-gray-700/60 bg-gray-900/40 text-gray-300 hover:border-cyan-500/50 hover:text-white"}
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading && selected === amt ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>${amt}</span>
                <span className="text-[10px] font-normal text-gray-500">USD</span>
              </>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <CreditCard className="w-3.5 h-3.5" />
        <span>Your saved card will appear at checkout if you've paid before.</span>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}