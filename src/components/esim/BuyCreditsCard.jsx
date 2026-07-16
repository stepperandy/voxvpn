import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, Zap, CheckCircle } from "lucide-react";
import { redirectToStripeCheckout } from "@/components/stripe/stripeUtils";

const CREDIT_PACKAGES = [
  { credits: 10, price: 10, discount: 0 },
  { credits: 25, price: 25, discount: 0 },
  { credits: 50, price: 50, discount: 0 },
  { credits: 100, price: 95, discount: 5 },
  { credits: 250, price: 225, discount: 25 },
  { credits: 500, price: 425, discount: 75 },
];

export default function BuyCreditsCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBuyCredits = async (packageInfo) => {
    setLoading(true);
    setError(null);

    try {
      // Check if running in iframe
      if (window.self !== window.top) {
        setError("Checkout only works from the published app. Open in a new window.");
        setLoading(false);
        return;
      }

      // Get user email
      let userEmail = '';
      try {
        const user = await base44.auth.me();
        userEmail = user?.email || '';
      } catch {
        // User not logged in, will be prompted for email at checkout
        userEmail = '';
      }

      if (!userEmail) {
        setError("Please log in to purchase credits.");
        setLoading(false);
        return;
      }

      // Invoke backend function
      const res = await base44.functions.invoke('stripeCheckout', {
        type: 'credits',
        credits: packageInfo.credits,
        amount: packageInfo.price * 100,
        email: userEmail,
      });

      const data = res.data;
      if (!data?.sessionId) throw new Error("Invalid response from server");
      await redirectToStripeCheckout(data.sessionId, data.publishableKey);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to process checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-cyan-500/20 rounded-lg">
          <Zap className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Buy Credits</h2>
          <p className="text-xs text-gray-400">Top up your account to purchase eSIM plans</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {CREDIT_PACKAGES.map((pkg) => (
          <button
            key={pkg.credits}
            onClick={() => handleBuyCredits(pkg)}
            disabled={loading}
            className="relative group p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-cyan-500/50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pkg.discount > 0 && (
              <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">
                Save ${pkg.discount}
              </div>
            )}
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-sm">{pkg.credits}</span>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">${pkg.price}</p>
                {pkg.discount > 0 && (
                  <p className="text-xs text-green-400 font-semibold">Save {Math.round((pkg.discount / (pkg.price + pkg.discount)) * 100)}%</p>
                )}
              </div>
              {loading ? (
                <div className="w-4 h-4 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
        <div className="flex gap-2">
          <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-white mb-1">Why buy credits?</p>
            <p className="text-xs">Use credits to purchase eSIM data plans. Unused credits never expire and can be used anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}