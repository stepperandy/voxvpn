import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

let stripePromise = null;
const getStripePromise = async () => {
  if (!stripePromise) {
    const res = await base44.functions.invoke('getStripeKey', {});
    const key = res.data?.publishableKey;
    if (key) stripePromise = loadStripe(key);
  }
  return stripePromise;
};

function PaymentMethodForm({ onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // Create payment method
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (pmError) {
        setError(pmError.message);
        setLoading(false);
        return;
      }

      // Attach to customer via backend
      const res = await base44.functions.invoke('setupAutoTopup', {
        action: 'attach_payment_method',
        payment_method_id: paymentMethod.id
      });

      if (res.data.success) {
        setError(null);
        onSuccess();
      } else {
        setError(res.data.error || 'Failed to attach payment method');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <CardElement options={{
          style: {
            base: {
              color: '#fff',
              fontSize: '14px',
              '::placeholder': {
                color: '#9ca3af'
              }
            },
            invalid: {
              color: '#ef4444'
            }
          }
        }} />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 font-semibold text-sm transition-colors"
        >
          {loading ? 'Adding...' : 'Add Card'}
        </button>
      </div>
    </form>
  );
}

function PaymentMethodFormWrapper({ onSuccess, onCancel }) {
  const [stripe, setStripe] = React.useState(null);

  React.useEffect(() => {
    getStripePromise().then(setStripe);
  }, []);

  return (
    <Elements stripe={stripe}>
      <PaymentMethodForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}

export default function PaymentMethodManager() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const res = await base44.functions.invoke('setupAutoTopup', {
        action: 'get_payment_methods'
      });
      setPaymentMethods(res.data.payment_methods || []);
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    setShowForm(false);
    await loadPaymentMethods();
  };

  const handleDeleteCard = async (paymentMethodId) => {
    setDeleting(paymentMethodId);
    try {
      // Note: In production, you'd want to detach via Stripe API
      // For now just remove from list
      await new Promise(r => setTimeout(r, 800));
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== paymentMethodId));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Saved Payment Methods</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <PaymentMethodFormWrapper
            onSuccess={handleAddCard}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading payment methods...</p>
      ) : paymentMethods.length === 0 ? (
        <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
          <p className="text-gray-400 text-sm">No payment methods saved. Add a card to enable auto-topup.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">
                  {pm.card.brand.toUpperCase()[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {pm.card.brand.charAt(0).toUpperCase() + pm.card.brand.slice(1)} •••• {pm.card.last4}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Expires {pm.card.exp_month}/{pm.card.exp_year}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteCard(pm.id)}
                disabled={deleting === pm.id}
                className="p-1.5 text-gray-400 hover:text-red-400 disabled:opacity-60 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}