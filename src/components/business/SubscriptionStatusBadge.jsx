import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Clock } from 'lucide-react';

/**
 * Real-time subscription status indicator for the business dashboard.
 * Shows "Active" (green) when payment is confirmed, otherwise "Pending" (amber, pulsing).
 * Subscribes to VPNSubscription entity changes so it updates live the moment payment is confirmed.
 */
export default function SubscriptionStatusBadge({ active, onRefresh }) {
  useEffect(() => {
    if (!onRefresh) return;
    const unsubscribe = base44.entities.VPNSubscription.subscribe((event) => {
      // A create/update (e.g. payment confirmed → status flips to active) → refetch team data
      if (event?.type === 'create' || event?.type === 'update') {
        onRefresh();
      }
    });
    return unsubscribe;
  }, [onRefresh]);

  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={11} /> Subscription Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
      <Clock size={11} /> Subscription Pending
    </span>
  );
}