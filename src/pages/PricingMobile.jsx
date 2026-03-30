import { useState, Suspense } from 'react';
import MobileLayout from '@/mobile/MobileLayout';
import PullToRefresh from '@/mobile/PullToRefresh';
import MobileSelectSheet from '@/mobile/MobileSelectSheet';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const plans = [
  {
    name: 'Monthly',
    price: 8.99,
    billingLabel: 'billed monthly',
    priceId: 'price_1TDvPiAj5jZA8C2y4aS6FXt1',
    features: ['5 Devices', '50+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Log Policy'],
  },
  {
    name: 'Basic',
    price: 9.99,
    billingLabel: 'billed monthly',
    priceId: 'price_1TFwCxAj5jZA8C2ywLEfaNXR',
    trial: true,
    features: ['5 Devices', '50+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', '3-Day Free Trial'],
  },
  {
    name: 'Annual',
    price: 4.99,
    billingLabel: '$59.88/year',
    priceId: 'price_1TDvPjAj5jZA8C2yKmoBiYce',
    popular: true,
    savings: 'Save 44%',
    features: ['5 Devices', 'All Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'Priority Support', 'Kill Switch'],
  },
  {
    name: '2-Year',
    price: 2.99,
    billingLabel: '$71.76 every 2 years',
    priceId: 'price_1TDvPjAj5jZA8C2yrapCxQbT',
    savings: 'Best Value',
    features: ['5 Devices', 'All Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', '24/7 Support', 'Dedicated IP'],
  },
];

function PlanCard({ plan, onCheckout, isLoading }) {
  return (
    <div
      className={`relative p-4 rounded-xl border transition-all ${
        plan.popular
          ? 'border-cyan-500 bg-[#0d1a20] ring-1 ring-cyan-500/20'
          : 'border-white/5 bg-[#0d1120]'
      }`}
    >
      {plan.popular && (
        <div className="mb-2 text-xs font-bold text-cyan-400">⭐ MOST POPULAR</div>
      )}
      {plan.savings && !plan.popular && (
        <div className="mb-2 text-xs font-bold text-emerald-400">🏆 {plan.savings}</div>
      )}
      <h3 className="text-white font-bold text-lg">{plan.name}</h3>
      <div className="text-2xl font-black text-white mt-1">
        ${plan.price}<span className="text-xs text-slate-400">/mo</span>
      </div>
      <p className="text-slate-500 text-xs mb-1">{plan.billingLabel}</p>
      {plan.trial && <p className="text-cyan-400 text-xs font-semibold mb-2">✓ 3-day free trial</p>}
      <button
        onClick={() => onCheckout(plan)}
        disabled={isLoading}
        className="w-full mt-3 py-3 rounded-lg font-bold text-sm transition-all select-none touch-target active:scale-95 disabled:opacity-60"
        style={{
          background: plan.popular ? 'linear-gradient(135deg, #0ea5ff, #4fd1ff)' : 'transparent',
          color: plan.popular ? '#000' : '#fff',
          border: plan.popular ? 'none' : '1px solid #223654',
        }}
      >
        {isLoading ? 'Processing...' : 'Choose Plan'}
      </button>
      <ul className="mt-4 space-y-2">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
            <Check size={14} className="text-cyan-400 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingMobile() {
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (plan) => {
    setLoadingPlan(plan.name);
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createStripeCheckout', {
        plan: plan.name,
        priceId: plan.priceId,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoadingPlan(null);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await new Promise((r) => setTimeout(r, 800));
  };

  return (
    <MobileLayout headerTitle="Pricing" rootPath="/pricing-mobile">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="pb-24 px-4 pt-6">
          <h1 className="text-white text-2xl font-black mb-1">Choose Your Plan</h1>
          <p className="text-slate-500 text-sm mb-6">All plans include AES-256 encryption & no-log policy</p>
          <div className="space-y-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                onCheckout={handleCheckout}
                isLoading={loading && loadingPlan === plan.name}
              />
            ))}
          </div>
        </div>
      </PullToRefresh>
    </MobileLayout>
  );
}