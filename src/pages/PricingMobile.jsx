import { useState, Suspense } from 'react';
import MobileLayout from '@/mobile/MobileLayout';
import PullToRefresh from '@/mobile/PullToRefresh';
import MobileSelectSheet from '@/mobile/MobileSelectSheet';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const plans = [
  {
    name: 'Basic',
    price: 9.99,
    yearly: 5.0,
    priceIdMonthly: 'price_1QsgL0EiNNFb5ydcXxxxx',
    priceIdYearly: 'price_1QsgL0EiNNFb5ydcYyyyy',
    features: ['2 Devices', 'Unlimited Bandwidth', 'AES-256'],
  },
  {
    name: 'Premium',
    price: 19.99,
    yearly: 14.99,
    priceIdMonthly: 'price_1QsgL0EiNNFb5ydcBbbbb',
    priceIdYearly: 'price_1QsgL0EiNNFb5ydcCcccc',
    popular: true,
    features: ['5 Devices', 'All Locations', 'Priority Support', 'Split Tunnel'],
  },
  {
    name: 'Enterprise',
    price: 39.99,
    yearly: 18.0,
    priceIdMonthly: 'price_1QsgL0EiNNFb5ydcFffff',
    priceIdYearly: 'price_1QsgL0EiNNFb5ydcGgggg',
    features: ['10 Devices', 'All Servers', '24/7 Support', 'Dedicated IP'],
  },
];

function PlanCard({ plan, yearly, onCheckout }) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        plan.popular
          ? 'border-cyan-500 bg-[#0d1a20] ring-1 ring-cyan-500/20'
          : 'border-white/5 bg-[#0d1120]'
      }`}
    >
      {plan.popular && (
        <div className="mb-3 text-xs font-bold text-cyan-400">⭐ POPULAR</div>
      )}
      <h3 className="text-white font-bold text-lg">{plan.name}</h3>
      <div className="text-2xl font-black text-white mt-2">
        ${yearly ? plan.yearly : plan.price}
        <span className="text-xs text-slate-400">/mo</span>
      </div>
      <button
        onClick={() => onCheckout(plan, yearly)}
        className="w-full mt-4 py-3 rounded-lg font-bold text-sm transition-all touch-target"
        style={{
          background: plan.popular
            ? 'linear-gradient(135deg, #0ea5ff, #4fd1ff)'
            : 'transparent',
          color: plan.popular ? '#000' : '#fff',
          border: plan.popular ? 'none' : '1px solid #223654',
        }}
      >
        Choose Plan
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
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (plan, isYearly) => {
    setLoading(true);
    try {
      const priceId = isYearly ? plan.priceIdYearly : plan.priceIdMonthly;
      const res = await base44.functions.invoke('createStripeCheckout', {
        plan: plan.name,
        priceId,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
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
          <h1 className="text-white text-2xl font-black mb-2">Choose Your Plan</h1>

          {/* Toggle */}
          <div className="flex items-center gap-3 my-6 p-3 bg-[#0d1120] rounded-lg">
            <button
              onClick={() => setYearly(false)}
              className={`flex-1 py-2 rounded transition-colors font-bold text-sm ${
                !yearly
                  ? 'bg-cyan-400 text-black'
                  : 'text-slate-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`flex-1 py-2 rounded transition-colors font-bold text-sm ${
                yearly
                  ? 'bg-cyan-400 text-black'
                  : 'text-slate-400'
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Plans */}
          <div className="space-y-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                yearly={yearly}
                onCheckout={handleCheckout}
              />
            ))}
          </div>
        </div>
      </PullToRefresh>
    </MobileLayout>
  );
}