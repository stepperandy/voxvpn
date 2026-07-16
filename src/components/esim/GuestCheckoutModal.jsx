import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { redirectToStripeCheckout } from '@/components/stripe/stripeUtils';
import { X, AlertCircle, Loader2, Mail } from 'lucide-react';

export default function GuestCheckoutModal({ product, isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !agreedToTerms) {
      setError('Please enter your email and agree to the terms');
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Create checkout session
      const res = await base44.functions.invoke('purchaseEsimGuest', {
        email,
        product_id: product.product_id,
        product_name: product.name,
        price: product.price,
        data_gb: product.data_gb,
        duration_days: product.duration_days
      });

      if (!res.data?.sessionId) {
        throw new Error('Failed to create checkout session - invalid response from server');
      }

      await redirectToStripeCheckout(res.data.sessionId, res.data.publishableKey);
    } catch (err) {
      setError(err.message || 'Failed to start checkout');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Continue as Guest</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Product Summary */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-400 mb-2">Purchasing</p>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white font-semibold">{product.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {product.data_gb ? `${product.data_gb} GB • ` : ''}
                {product.duration_days ? `${product.duration_days} days` : ''}
              </p>
            </div>
            <span className="text-lg font-bold text-cyan-400">${product.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleCheckout} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email Address</label>
            <div className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2.5">
              <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              We'll send your eSIM details and installation instructions here
            </p>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={loading}
              className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-800 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer">
              I agree to receive the eSIM details and installation guide by email, and understand this is a digital purchase
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email || !agreedToTerms}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-semibold text-sm transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Secure payment powered by Stripe • Your email is never shared
          </p>
        </div>
      </div>
    </div>
  );
}