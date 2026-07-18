import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, CreditCard, CheckCircle2, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaymentMethodsDisplay from "@/components/checkout/PaymentMethodsDisplay";

const CREDIT_PACKAGES = [
  { amount: 10, credits: 10, savings: 0 },
  { amount: 25, credits: 25, savings: 0 },
  { amount: 50, credits: 50, savings: 0 },
  { amount: 95, credits: 100, savings: 5, savingsLabel: "Save 5%" },
  { amount: 225, credits: 250, savings: 10, savingsLabel: "Save 10%" },
  { amount: 425, credits: 500, savings: 15, savingsLabel: "Save 15%" },
];

export default function BuyCredits() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [currencyPreview, setCurrencyPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    const amounts = {};
    CREDIT_PACKAGES.forEach(p => { amounts[p.amount] = p.amount * 100; });
    base44.functions.invoke("getCurrencyPreview", { amounts })
      .then(res => setCurrencyPreview(res.data))
      .catch(() => {});
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const handlePurchase = async (pkg) => {
    if (window.self !== window.top) {
      alert('Checkout only works from the published app');
      return;
    }

    if (!user?.email) {
      setError('Please log in to purchase credits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await base44.functions.invoke('createCreditsCheckout', {
        amount: pkg.amount,
        credits: pkg.credits,
        user_email: user.email
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (currencyPreview?.currency && currencyPreview.currency !== "usd") {
      const rate = currencyPreview.rates?.[amount];
      if (rate?.display) return rate.display;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#0a1420] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/Credits')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Buy Credits</h1>
            </div>
            <p className="text-gray-500 text-sm">Top up your account to purchase eSIM plans</p>
          </div>
        </div>

        {currencyPreview && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2 p-4 bg-gray-900/40 border border-gray-800 rounded-xl">
            <p className="text-xs text-gray-500">
              Detected location: {currencyPreview.country} · Prices shown in {currencyPreview.currency.toUpperCase()}
            </p>
            <PaymentMethodsDisplay currencyPreview={currencyPreview} className="sm:ml-auto" />
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Credit Packages Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {CREDIT_PACKAGES.map((pkg) => (
            <button
              key={pkg.amount}
              onClick={() => handlePurchase(pkg)}
              disabled={loading}
              className="relative bg-gray-900/60 border border-gray-700/50 hover:border-cyan-500/50 rounded-2xl p-6 transition-all group text-left"
            >
              {/* Savings Badge */}
              {pkg.savings > 0 && (
                <div className="absolute top-3 left-3 bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded-lg">
                  {pkg.savingsLabel}
                </div>
              )}

              <div className="flex flex-col items-center text-center pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span className="text-2xl font-bold text-white">{pkg.credits}</span>
                </div>
                <p className="text-xl font-bold text-white mb-4">{formatCurrency(pkg.amount)}</p>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                  <CreditCard className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Why buy credits?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Use credits to purchase eSIM data plans. Unused credits never expire and can be used 
                for any future purchases. The more you buy, the more you save with our bulk discount tiers.
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-white font-medium">Redirecting to checkout...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}