import { useState } from 'react';
import { CreditCard, X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PaymentMethodModal({ isOpen, onClose, plan, onProceed, isAdmin }) {
  const [selectedMethod, setSelectedMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    setLoading(true);
    try {
      await onProceed(selectedMethod);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1120] border border-white/10 rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Choose Payment Method</DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </DialogHeader>

        <div className="space-y-3 mb-6">
          {isAdmin && (
            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-violet-500 bg-violet-500/5 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="admin-bypass"
                checked={selectedMethod === 'admin-bypass'}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="mt-1.5"
              />
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Admin Credit</p>
                <p className="text-slate-400 text-xs mt-0.5">Grant subscription using admin credit balance</p>
              </div>
            </label>
          )}

          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            selectedMethod === 'stripe' 
              ? 'border-cyan-500 bg-cyan-500/5' 
              : 'border-white/10 hover:border-white/20'
          }`}>
            <input
              type="radio"
              name="payment"
              value="stripe"
              checked={selectedMethod === 'stripe'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mt-1.5"
            />
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Credit Card</p>
              <p className="text-slate-400 text-xs mt-0.5">Visa, Mastercard, Amex</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-white/10 hover:border-white/20 cursor-pointer transition-colors opacity-50">
            <input
              type="radio"
              name="payment"
              value="bank"
              disabled
              className="mt-1.5"
            />
            <div className="flex-1">
              <p className="text-slate-400 font-bold text-sm">Bank Transfer</p>
              <p className="text-slate-600 text-xs mt-0.5">Coming soon</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-white/10 hover:border-white/20 cursor-pointer transition-colors opacity-50">
            <input
              type="radio"
              name="payment"
              value="crypto"
              disabled
              className="mt-1.5"
            />
            <div className="flex-1">
              <p className="text-slate-400 font-bold text-sm">Cryptocurrency</p>
              <p className="text-slate-600 text-xs mt-0.5">Coming soon</p>
            </div>
          </label>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-[#0a1020] border border-white/5">
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Plan</p>
            <p className="text-white font-bold">{plan?.name}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-white/5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={loading || (selectedMethod !== 'stripe' && selectedMethod !== 'admin-bypass')}
            className="flex-1 px-4 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold transition-all flex items-center justify-center gap-2"
          >
            <CreditCard size={16} />
            {loading ? 'Processing...' : 'Proceed'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}