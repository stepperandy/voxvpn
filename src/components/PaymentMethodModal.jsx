import { useState } from 'react';
import { CreditCard, X, Smartphone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
// v2

export default function PaymentMethodModal({ isOpen, onClose, plan, onProceed, isAdmin, isBilledYearly, isSixMonths, currency, countryCode }) {
  const [selectedMethod, setSelectedMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);

  // Detect if the buyer is in China via timezone or locale
  const isChinaBuyer = (() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const locale = navigator.language || navigator.languages?.[0] || '';
      return tz === 'Asia/Shanghai' || tz === 'Asia/Urumqi' ||
             locale.toLowerCase().startsWith('zh') || locale.toLowerCase().includes('cn');
    } catch { return false; }
  })();

  const handleProceed = async () => {
    setLoading(true);
    try {
      if (selectedMethod === 'admin-bypass') {
        await onProceed('admin-bypass');
        setLoading(false);
        return;
      }
      if (selectedMethod === 'hubtel') {
        const res = await base44.functions.invoke('createHubtelCheckout', {
          plan: plan?.name,
          isBilledYearly: !!isBilledYearly,
          isSixMonths: !!isSixMonths,
        });
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          window.location.href = '/payment-failed';
        }
        return;
      }
      // WeChat Pay and Alipay are Chinese payment methods — always use CNY.
      // Also auto-convert to CNY for China-based buyers using any Stripe method.
      const isChineseMethod = selectedMethod === 'wechat_pay' || selectedMethod === 'alipay';
      const useCNY = isChineseMethod || isChinaBuyer;
      const res = await base44.functions.invoke('createStripeCheckout', {
        plan: plan?.name,
        isBilledYearly: !!isBilledYearly,
        isSixMonths: !!isSixMonths,
        paymentMethod: selectedMethod,
        currencyCode: useCNY ? 'CNY' : (currency?.code || 'USD'),
        countryCode: useCNY ? 'CN' : (countryCode || 'US'),
      });
      const url = res?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        const errorMsg = res?.data?.error || 'Failed to open checkout gateway';
        alert('Payment error: ' + errorMsg);
        setLoading(false);
      }
    } catch (error) {
      window.location.href = '/payment-failed';
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

          {/* Stripe */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedMethod === 'stripe' ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 hover:border-white/20'}`}>
            <input type="radio" name="payment" value="stripe" checked={selectedMethod === 'stripe'} onChange={() => setSelectedMethod('stripe')} className="mt-1.5" />
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Stripe Checkout</p>
              <p className="text-slate-400 text-xs mt-0.5">Card, Apple Pay, Google Pay, and more</p>
            </div>
          </label>

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

          {/* WeChat Pay */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedMethod === 'wechat_pay' ? 'border-green-500 bg-green-500/5' : 'border-white/10 hover:border-white/20'}`}>
            <input type="radio" name="payment" value="wechat_pay" checked={selectedMethod === 'wechat_pay'} onChange={(e) => setSelectedMethod(e.target.value)} className="mt-1.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Smartphone size={14} className="text-green-400" />
                <p className="text-white font-bold text-sm">WeChat Pay</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">CN</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">Fast &amp; secure mobile payment</p>
            </div>
          </label>

          {/* Alipay */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedMethod === 'alipay' ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20'}`}>
            <input type="radio" name="payment" value="alipay" checked={selectedMethod === 'alipay'} onChange={(e) => setSelectedMethod(e.target.value)} className="mt-1.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Smartphone size={14} className="text-blue-400" />
                <p className="text-white font-bold text-sm">Alipay</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">CN</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">Alibaba's digital wallet</p>
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