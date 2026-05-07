import { useState } from 'react';
import { CreditCard, X, Smartphone } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// WeChat Pay and Alipay logos as inline SVGs
const WeChatIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#07C160"><path d="M9.5 4C5.36 4 2 6.91 2 10.5c0 2.02 1.07 3.84 2.75 5.03L4 18l2.5-1.25c.95.27 1.96.42 3 .42.26 0 .52-.01.77-.04A5.5 5.5 0 0 0 10 17.5c0-3.04 2.69-5.5 6-5.5.26 0 .52.02.77.05C16.4 9.77 13.28 4 9.5 4zm-1.75 5.25a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3.5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM16 13c-2.76 0-5 1.79-5 4s2.24 4 5 4c.7 0 1.37-.13 1.97-.36L20 22l-.7-2.35C20.6 18.8 21 17.94 21 17c0-2.21-2.24-4-5-4zm-1.25 3.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm2.5 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"/></svg>
);

const AlipayIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1677FF"><path d="M3 3h18v18H3V3zm9 2.5C9.01 5.5 6.5 8.01 6.5 11S9.01 16.5 12 16.5c1.37 0 2.62-.51 3.57-1.35-1.18-.57-2.46-1.19-3.57-1.77v-1.63h5.4c.07.31.1.63.1.95 0 2.99-2.51 5.5-5.5 5.5S6.5 13.99 6.5 11 9.01 5.5 12 5.5c1.78 0 3.36.84 4.39 2.15l-1.6 1.1A3.48 3.48 0 0 0 12 7.5c-1.93 0-3.5 1.57-3.5 3.5 0 .83.29 1.59.77 2.19.9.45 2.62 1.3 4.24 2.08C14.3 14.67 15.5 13 15.5 11c0-.35-.04-.7-.1-1.03H12V8.5h5.38c.08.48.12.97.12 1.5 0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6z"/></svg>
);

export default function PaymentMethodModal({ isOpen, onClose, plan, onProceed, isAdmin, isBilledYearly }) {
  const [selectedMethod, setSelectedMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    setLoading(true);
    try {
      if (selectedMethod === 'hubtel') {
        const res = await base44.functions.invoke('createHubtelCheckout', {
          plan: plan?.name,
          isBilledYearly: !!isBilledYearly,
        });
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          alert('Hubtel error: ' + (res.data?.error || 'Unknown error'));
        }
        return;
      }
      if (selectedMethod === 'alipay' || selectedMethod === 'wechat_pay') {
        const res = await base44.functions.invoke('createStripeCheckout', {
          plan: plan?.name,
          isBilledYearly: !!isBilledYearly,
          paymentMethod: selectedMethod,
        });
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          alert('Payment error: ' + (res.data?.error || 'Unknown error'));
        }
        return;
      }
      await onProceed(selectedMethod);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0d1120] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Choose Payment Method</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {isAdmin && (
            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-violet-500 bg-violet-500/5 cursor-pointer">
              <input type="radio" name="payment" value="admin-bypass"
                checked={selectedMethod === 'admin-bypass'}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="mt-1.5" />
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Admin Credit</p>
                <p className="text-slate-400 text-xs mt-0.5">Grant subscription using admin credit balance</p>
              </div>
            </label>
          )}

          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            selectedMethod === 'stripe' ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 hover:border-white/20'
          }`}>
            <input type="radio" name="payment" value="stripe"
              checked={selectedMethod === 'stripe'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mt-1.5" />
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Credit Card</p>
              <p className="text-slate-400 text-xs mt-0.5">Visa, Mastercard, Amex</p>
            </div>
          </label>

          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            selectedMethod === 'hubtel' ? 'border-orange-500 bg-orange-500/5' : 'border-white/10 hover:border-white/20'
          }`}>
            <input type="radio" name="payment" value="hubtel"
              checked={selectedMethod === 'hubtel'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mt-1.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Smartphone size={14} className="text-orange-400" />
                <p className="text-white font-bold text-sm">Hubtel</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">GHS</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">Mobile Money, Visa, Mastercard (Ghana)</p>
            </div>
          </label>

          {/* Chinese payment methods */}
          <div className="pt-1">
            <p className="text-slate-600 text-xs uppercase tracking-widest mb-2 font-semibold">🇨🇳 Chinese Customers</p>
          </div>

          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            selectedMethod === 'alipay' ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
          }`}>
            <input type="radio" name="payment" value="alipay"
              checked={selectedMethod === 'alipay'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mt-1.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <AlipayIcon />
                <p className="text-white font-bold text-sm">Alipay</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">支付宝</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">Pay with your Alipay account</p>
            </div>
          </label>

          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            selectedMethod === 'wechat_pay' ? 'border-green-500 bg-green-500/5' : 'border-white/10 hover:border-white/20'
          }`}>
            <input type="radio" name="payment" value="wechat_pay"
              checked={selectedMethod === 'wechat_pay'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mt-1.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <WeChatIcon />
                <p className="text-white font-bold text-sm">WeChat Pay</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">微信支付</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">Pay with WeChat Pay</p>
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

        {/* Plan summary */}
        <div className="p-3 rounded-lg bg-[#0a1020] border border-white/5 mb-6">
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Plan</p>
          <p className="text-white font-bold">{plan?.name}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/5">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 font-bold transition-colors">
            Cancel
          </button>
          <button onClick={handleProceed}
            disabled={loading || !['stripe', 'hubtel', 'alipay', 'wechat_pay', 'admin-bypass'].includes(selectedMethod)}
            className="flex-1 px-4 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold transition-all flex items-center justify-center gap-2">
            <CreditCard size={16} />
            {loading ? 'Processing...' : 'Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}