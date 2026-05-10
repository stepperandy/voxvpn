import { useState } from 'react';
import { CreditCard, X, Smartphone } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// WeChat Pay and Alipay logos as inline SVGs
const WeChatIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/WeChat_logo.svg/120px-WeChat_logo.svg.png" alt="WeChat Pay" className="w-6 h-6 object-contain" />
);

const AlipayIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Alipay_logo.svg/120px-Alipay_logo.svg.png" alt="Alipay" className="w-6 h-6 object-contain" />
);

const STRIPE_METHODS = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    icon: (
      <div className="flex items-center gap-0.5">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/100px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 object-contain" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/100px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 object-contain" />
      </div>
    ),
  },
  {
    id: 'alipay',
    label: 'Alipay 支付宝',
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Alipay_logo.svg/200px-Alipay_logo.svg.png" alt="Alipay" className="h-6 object-contain" />,
  },
  {
    id: 'wechat_pay',
    label: 'WeChat Pay 微信',
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/WeChat_logo.svg/200px-WeChat_logo.svg.png" alt="WeChat Pay" className="h-6 w-6 object-contain" />,
  },
];

export default function PaymentMethodModal({ isOpen, onClose, plan, onProceed, isAdmin, isBilledYearly }) {
  const [selectedMethod, setSelectedMethod] = useState('stripe');
  const [stripeSubMethod, setStripeSubMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    setLoading(true);
    try {
      if (selectedMethod === 'admin-bypass') {
        await onProceed('admin-bypass');
        return;
      }
      if (selectedMethod === 'hubtel') {
        const res = await base44.functions.invoke('createHubtelCheckout', {
          plan: plan?.name,
          isBilledYearly: !!isBilledYearly,
        });
        if (res.data?.url) window.location.href = res.data.url;
        else alert('Hubtel error: ' + (res.data?.error || 'Unknown error'));
        return;
      }
      // Stripe (card, alipay, wechat_pay)
      const res = await base44.functions.invoke('createStripeCheckout', {
        plan: plan?.name,
        isBilledYearly: !!isBilledYearly,
        paymentMethod: stripeSubMethod,
      });
      if (res.data?.url) window.location.href = res.data.url;
      else alert('Payment error: ' + (res.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0d1120] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Choose Payment Method</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-3 mb-6">
          {isAdmin && (
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedMethod === 'admin-bypass' ? 'border-violet-500 bg-violet-500/5' : 'border-white/10 hover:border-white/20'}`}>
              <input type="radio" name="payment" value="admin-bypass" checked={selectedMethod === 'admin-bypass'} onChange={(e) => setSelectedMethod(e.target.value)} className="mt-1.5" />
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Admin Credit</p>
                <p className="text-slate-400 text-xs mt-0.5">Grant subscription using admin credit balance</p>
              </div>
            </label>
          )}

          {/* Stripe — card, Alipay, WeChat all in one */}
          <div className={`rounded-xl border-2 transition-colors ${selectedMethod === 'stripe' ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10'}`}>
            <label className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setSelectedMethod('stripe')}>
              <input type="radio" name="payment" value="stripe" checked={selectedMethod === 'stripe'} onChange={() => setSelectedMethod('stripe')} className="mt-1.5" />
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Stripe</p>
                <p className="text-slate-400 text-xs mt-0.5">Card · Alipay · WeChat Pay</p>
              </div>
            </label>

            {selectedMethod === 'stripe' && (
              <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                {STRIPE_METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setStripeSubMethod(m.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 text-center transition-all min-h-[80px] ${stripeSubMethod === m.id ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 hover:border-white/20 bg-[#0a1020]'}`}
                  >
                    <div className="flex items-center justify-center h-8">{m.icon}</div>
                    <span className="text-white text-[10px] font-semibold leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hubtel */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedMethod === 'hubtel' ? 'border-orange-500 bg-orange-500/5' : 'border-white/10 hover:border-white/20'}`}>
            <input type="radio" name="payment" value="hubtel" checked={selectedMethod === 'hubtel'} onChange={(e) => setSelectedMethod(e.target.value)} className="mt-1.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Smartphone size={14} className="text-orange-400" />
                <p className="text-white font-bold text-sm">Hubtel</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">GHS</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">Mobile Money, Visa, Mastercard (Ghana)</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-white/10 cursor-pointer opacity-50">
            <input type="radio" name="payment" value="bank" disabled className="mt-1.5" />
            <div className="flex-1">
              <p className="text-slate-400 font-bold text-sm">Bank Transfer</p>
              <p className="text-slate-600 text-xs mt-0.5">Coming soon</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-white/10 cursor-pointer opacity-50">
            <input type="radio" name="payment" value="crypto" disabled className="mt-1.5" />
            <div className="flex-1">
              <p className="text-slate-400 font-bold text-sm">Cryptocurrency</p>
              <p className="text-slate-600 text-xs mt-0.5">Coming soon</p>
            </div>
          </label>
        </div>

        <div className="p-3 rounded-lg bg-[#0a1020] border border-white/5 mb-6">
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Plan</p>
          <p className="text-white font-bold">{plan?.name}</p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/5">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 font-bold transition-colors">
            Cancel
          </button>
          <button onClick={handleProceed} disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold transition-all flex items-center justify-center gap-2">
            <CreditCard size={16} />
            {loading ? 'Processing...' : 'Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}