import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Gift, RefreshCw } from 'lucide-react';
import ReferralCodeCard from '@/components/referral/ReferralCodeCard';
import ReferralStats from '@/components/referral/ReferralStats';
import ReferralLeaderboard from '@/components/referral/ReferralLeaderboard';

export default function ReferralDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('referralStats', {});
      setData(res.data);
    } catch (err) {
      console.error('Failed to load referral stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const tiers = data?.tiers;

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <Gift className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Refer & Earn</h1>
            <p className="text-sm text-gray-400">
              Invite friends and earn service credits
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-white mb-3">How It Works</h2>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <p className="text-sm text-gray-300">
                Share your referral link with friends
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <p className="text-sm text-gray-300">
                They sign up and verify their account → you get{' '}
                <span className="text-green-400 font-semibold">
                  ${tiers?.verified_reward ?? 1} credit
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <p className="text-sm text-gray-300">
                They activate or fund their account →{' '}
                {tiers?.milestone_threshold ?? 3} activations ={' '}
                <span className="text-purple-400 font-semibold">
                  ${tiers?.milestone_reward ?? 5} credit
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center text-xs font-bold">
                4
              </span>
              <p className="text-sm text-gray-300">
                Top 20 ambassadors earn{' '}
                <span className="text-orange-400 font-semibold">
                  ${tiers?.ambassador_bonus ?? 10} monthly bonus
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <ReferralCodeCard referralCode={data?.referral_code} />

        {/* Stats */}
        <ReferralStats stats={data?.stats} />

        {/* Leaderboard */}
        <ReferralLeaderboard
          leaderboard={data?.leaderboard}
          currentUserEmail={data?.current_email}
        />
      </div>
    </div>
  );
}