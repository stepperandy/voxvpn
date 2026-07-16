import { Users, CheckCircle2, Zap, DollarSign } from 'lucide-react';

export default function ReferralStats({ stats }) {
  const cards = [
    {
      label: 'Total Invited',
      value: stats?.total || 0,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/15',
    },
    {
      label: 'Verified',
      value: stats?.verified || 0,
      icon: CheckCircle2,
      color: 'text-green-400',
      bg: 'bg-green-500/15',
    },
    {
      label: 'Activated',
      value: stats?.activated || 0,
      icon: Zap,
      color: 'text-purple-400',
      bg: 'bg-purple-500/15',
    },
    {
      label: 'Credits Earned',
      value: `$${(stats?.credits_earned || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/15',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4"
          >
            <div
              className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}
            >
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-slate-400">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}