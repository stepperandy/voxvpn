import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Download, CreditCard, AlertCircle } from "lucide-react";


export default function Billing() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const numbers = await base44.functions.invoke('getOwnedNumbers', {});
      const activeNumbers = numbers.data?.data || [];
      setSubscriptions(activeNumbers.filter(n => n.status === 'active'));
      setError(null);
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (window.self !== window.top) {
      alert('Payment updates only work from the published app');
      return;
    }
    
    setUpdatingPayment(true);
    try {
      const user = await base44.auth.me();
      if (!user?.email) {
        setError('Please log in to manage payment method');
        setUpdatingPayment(false);
        return;
      }
      
      const res = await base44.functions.invoke('createCustomerPortal', { customer_email: user.email });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError('Failed to open payment portal');
      }
    } catch (err) {
      console.error('Payment portal error:', err);
      setError('Failed to open payment portal');
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading billing...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Billing & Subscriptions</h1>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Method
            </h2>
            <p className="text-gray-500 text-sm mt-1">Manage your billing information</p>
          </div>
          <button
            onClick={handleUpdatePayment}
            disabled={updatingPayment}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#0A192F] px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            {updatingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Payment'}
          </button>
        </div>
        <p className="text-gray-600 text-sm">Click the button above to update your payment method in the Stripe portal</p>
      </div>

      {/* Active Subscriptions */}
      <div className="space-y-4">
        <h2 className="text-white font-semibold">Active Subscriptions</h2>
        
        {subscriptions.length === 0 ? (
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 text-center">
            <p className="text-gray-500">No active subscriptions</p>
          </div>
        ) : (
          subscriptions.map(sub => (
            <div key={sub.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold font-mono text-lg">{sub.phone_number}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {sub.country_code} • Subscription {sub.stripe_subscription_id ? 'Active' : 'Pending'}
                  </p>
                  {sub.created_date && (
                    <p className="text-gray-600 text-xs mt-2">
                      Active since {new Date(sub.created_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
            </div>
          ))
        )}
      </div>



      {/* Invoices Section */}
      <div className="mt-8">
        <h2 className="text-white font-semibold mb-4">Invoices & Receipts</h2>
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 text-center">
          <Download className="w-8 h-8 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Invoices will appear here once billing is finalized</p>
        </div>
      </div>
      </div>
      </div>
      );
      }