import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle, ShoppingCart } from 'lucide-react';

export default function BundleMarketplace() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isReseller, setIsReseller] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);

        // Check if user is approved reseller
        const resellers = await base44.entities.Reseller.filter({ email: u.email });
        if (resellers && resellers.length > 0 && resellers[0].status === 'approved') {
          setIsReseller(true);
        }

        // Load bundles
        const bundleData = await base44.entities.Bundle.filter({ is_active: true });
        setBundles(bundleData);
      } catch (err) {
        setError('Failed to load bundles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOrderBundle = async (bundle) => {
    if (!isReseller) {
      setError('Only approved resellers can order bundles');
      return;
    }

    try {
      const res = await base44.functions.invoke('resellerPlaceOrder', {
        bundle_id: bundle.id,
        quantity: 1
      });

      if (res.data?.sessionId) {
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(res.data.publishableKey);
        await stripe.redirectToCheckout({ sessionId: res.data.sessionId });
      }
    } catch (err) {
      setError('Failed to create order');
      console.error(err);
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
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bundle Marketplace</h1>
          <p className="text-gray-400">
            {isReseller ? 'Browse and order bundles at wholesale prices' : 'Login as approved reseller to order bundles'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
              <div className="mb-4">
                <span className="text-xs font-bold text-cyan-400 uppercase">{bundle.bundle_type}</span>
                <h3 className="text-lg font-bold text-white mt-2">{bundle.name}</h3>
                {bundle.description && (
                  <p className="text-sm text-gray-400 mt-2">{bundle.description}</p>
                )}
              </div>

              <div className="space-y-2 mb-6 py-4 border-y border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">Wholesale Price</span>
                  <span className="text-white font-bold">${bundle.base_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Retail Price</span>
                  <span className="text-cyan-400 font-bold">${bundle.retail_price.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => handleOrderBundle(bundle)}
                disabled={!isReseller}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                {isReseller ? 'Order Now' : 'Reseller Only'}
              </button>
            </div>
          ))}
        </div>

        {bundles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No bundles available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}