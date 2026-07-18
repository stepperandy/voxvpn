import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, CreditCard, Loader2, AlertCircle } from "lucide-react";

// PayPal SVG logo
const PayPalLogo = () => (
  <svg viewBox="0 0 101 32" className="h-5 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.237 2.8H5.997c-.42 0-.78.305-.845.72L2.656 27.225a.508.508 0 0 0 .501.587h3.236a.84.84 0 0 0 .845-.72l.714-4.525a.84.84 0 0 1 .845-.72h2.06c4.281 0 6.753-2.072 7.4-6.18.291-1.796.012-3.207-.83-4.196-.925-1.088-2.566-1.671-4.19-1.671zm.75 6.09c-.356 2.332-2.138 2.332-3.862 2.332h-.982l.688-4.354a.508.508 0 0 1 .501-.43h.45c1.174 0 2.284 0 2.855.67.342.4.447.993.35 1.782z" fill="#253B80"/>
    <path d="M35.733 8.79h-3.25a.508.508 0 0 0-.501.43l-.144.916-.228-.331c-.708-1.026-2.287-1.37-3.862-1.37-3.614 0-6.7 2.74-7.302 6.582-.313 1.917.132 3.749 1.21 5.027 .99 1.173 2.406 1.662 4.093 1.662 2.912 0 4.527-1.872 4.527-1.872l-.146.91a.508.508 0 0 0 .501.587h2.927a.84.84 0 0 0 .845-.72l1.756-11.12a.508.508 0 0 0-.426-.701zm-4.525 6.37c-.316 1.871-1.8 3.127-3.695 3.127-.95 0-1.712-.305-2.198-.883-.483-.574-.665-1.392-.513-2.302.295-1.855 1.8-3.15 3.667-3.15.93 0 1.688.308 2.184.892.498.588.695 1.41.555 2.316z" fill="#253B80"/>
    <path d="M55.285 8.79h-3.26a.845.845 0 0 0-.7.372l-4.037 5.95-1.713-5.718a.847.847 0 0 0-.81-.604H41.54a.508.508 0 0 0-.483.668l3.226 9.464-3.034 4.285a.508.508 0 0 0 .415.804h3.257a.843.843 0 0 0 .697-.367l9.743-14.07a.508.508 0 0 0-.416-.784z" fill="#253B80"/>
    <path d="M67.017 2.8h-6.24c-.42 0-.78.305-.845.72L57.436 27.225a.508.508 0 0 0 .501.587h3.457c.294 0 .544-.214.59-.505l.744-4.74a.84.84 0 0 1 .845-.72h2.059c4.28 0 6.753-2.072 7.4-6.18.291-1.796.011-3.207-.83-4.196-.926-1.088-2.566-1.671-4.185-1.671zm.75 6.09c-.355 2.332-2.138 2.332-3.862 2.332h-.981l.688-4.354a.506.506 0 0 1 .5-.43h.451c1.174 0 2.284 0 2.855.67.342.4.447.993.35 1.782z" fill="#179BD7"/>
    <path d="M90.512 8.79h-3.248a.507.507 0 0 0-.5.43l-.145.916-.229-.331c-.708-1.026-2.286-1.37-3.861-1.37-3.614 0-6.699 2.74-7.301 6.582-.312 1.917.132 3.749 1.21 5.027.99 1.173 2.405 1.662 4.092 1.662 2.912 0 4.528-1.872 4.528-1.872l-.147.91a.508.508 0 0 0 .502.587h2.926a.84.84 0 0 0 .845-.72l1.756-11.12a.509.509 0 0 0-.429-.701zm-4.524 6.37c-.315 1.871-1.8 3.127-3.694 3.127-.95 0-1.712-.305-2.199-.883-.482-.574-.664-1.392-.512-2.302.295-1.855 1.8-3.15 3.667-3.15.93 0 1.688.308 2.184.892.499.588.695 1.41.556 2.316z" fill="#179BD7"/>
    <path d="M94.992 3.2l-2.6 16.544a.508.508 0 0 0 .501.587h2.8a.84.84 0 0 0 .845-.72L99.035 3.906a.508.508 0 0 0-.5-.587h-3.042a.509.509 0 0 0-.501.881z" fill="#179BD7"/>
  </svg>
);

export default function PaymentMethodModal({ isOpen, onClose, checkoutData, onStripeCheckout }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleStripe = async () => {
    setLoading('stripe');
    setError(null);
    try {
      await onStripeCheckout();
    } catch (err) {
      setError(err.message || 'Stripe checkout failed');
    } finally {
      setLoading(null);
    }
  };

  const handlePayPal = async () => {
    if (window.self !== window.top) {
      setError("Checkout only works from the published app. Please open in a new tab.");
      return;
    }
    setLoading('paypal');
    setError(null);
    try {
      const res = await base44.functions.invoke('paypalCheckout', checkoutData);
      if (!res.data?.approvalUrl) {
        throw new Error('Failed to create PayPal order');
      }
      window.location.href = res.data.approvalUrl;
    } catch (err) {
      setError(err.message || 'PayPal checkout failed');
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Choose Payment Method</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {/* Card / Stripe */}
          <button
            onClick={handleStripe}
            disabled={!!loading}
            className="w-full flex items-center justify-between px-4 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500/40 rounded-xl transition-all disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Credit / Debit Card</p>
                <p className="text-gray-500 text-xs">Visa, Mastercard, Amex</p>
              </div>
            </div>
            {loading === 'stripe' ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <span className="text-gray-600 text-xs">→</span>
            )}
          </button>

          {/* PayPal */}
          <button
            onClick={handlePayPal}
            disabled={!!loading}
            className="w-full flex items-center justify-between px-4 py-4 bg-[#FFC439]/10 hover:bg-[#FFC439]/20 border border-[#FFC439]/30 hover:border-[#FFC439]/60 rounded-xl transition-all disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5">
                <PayPalLogo />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">PayPal</p>
                <p className="text-gray-500 text-xs">Pay with your PayPal account</p>
              </div>
            </div>
            {loading === 'paypal' ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <span className="text-gray-600 text-xs">→</span>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-5">🔒 Secure & encrypted payments</p>
      </div>
    </div>
  );
}