import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Gift, Zap, TrendingUp, Copy, Loader2, CheckCircle2 } from "lucide-react";

export default function LoyaltyProgram() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const copyReferral = () => {
    if (user?.id) {
      navigator.clipboard.writeText(`https://voxtelefony.com?ref=${user.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tiers = [
    { name: "Bronze", minPoints: 0, maxPoints: 1000, bonus: "5% discount", color: "bg-amber-500/20 border-amber-500/30" },
    { name: "Silver", minPoints: 1000, maxPoints: 5000, bonus: "10% discount", color: "bg-slate-400/20 border-slate-400/30" },
    { name: "Gold", minPoints: 5000, maxPoints: 10000, bonus: "15% discount + priority support", color: "bg-yellow-500/20 border-yellow-500/30" },
    { name: "Platinum", minPoints: 10000, maxPoints: null, bonus: "20% discount + priority support + free upgrades", color: "bg-purple-500/20 border-purple-500/30" }
  ];

  const rewards = [
    { points: 100, reward: "$5 credit", description: "Redeem for account credit" },
    { points: 250, reward: "$15 credit", description: "Redeem for account credit" },
    { points: 500, reward: "$50 credit", description: "Redeem for account credit" },
    { points: 1000, reward: "Free month eSIM", description: "Get a free month of any eSIM plan" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const userPoints = user?.loyalty_points || 0;
  const currentTier = tiers.find(t => userPoints >= t.minPoints && (!t.maxPoints || userPoints < t.maxPoints)) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const pointsToNextTier = nextTier ? nextTier.minPoints - userPoints : 0;

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-purple-500/20 border border-yellow-500/30 mb-4 mx-auto">
            <Gift className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">VoxDigits Loyalty Program</h1>
          <p className="text-gray-400 text-lg">Earn points on every purchase and redeem for rewards</p>
        </div>

        {/* Loyalty Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <p className="text-sm text-gray-400">Your Points</p>
            </div>
            <p className="text-4xl font-bold text-cyan-400">{userPoints}</p>
            <p className="text-xs text-gray-500 mt-1">Active loyalty points</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <p className="text-sm text-gray-400">Current Tier</p>
            </div>
            <p className="text-4xl font-bold text-purple-400">{currentTier.name}</p>
            <p className="text-xs text-gray-500 mt-1">{currentTier.bonus}</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-pink-400" />
              <p className="text-sm text-gray-400">To Next Tier</p>
            </div>
            <p className="text-4xl font-bold text-pink-400">{nextTier ? pointsToNextTier : "Max"}</p>
            <p className="text-xs text-gray-500 mt-1">{nextTier ? nextTier.name : "Platinum reached!"}</p>
          </div>
        </div>

        {/* Referral Program */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Referral Program</h2>
          <p className="text-gray-400 mb-6">Invite friends and earn 50 points per successful referral</p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={`https://voxtelefony.com?ref=${user?.id}`}
              readOnly
              className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm font-mono"
            />
            <button
              onClick={copyReferral}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg font-bold transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loyalty Tiers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Loyalty Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map(tier => (
              <div
                key={tier.name}
                className={`${tier.color} border rounded-xl p-6 transition-all ${
                  currentTier.name === tier.name ? "ring-2 ring-cyan-500" : ""
                }`}
              >
                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{tier.minPoints.toLocaleString()}+ points</p>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-sm font-semibold text-white">{tier.bonus}</p>
                </div>
                {currentTier.name === tier.name && (
                  <div className="mt-4 px-3 py-1.5 bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-xs font-bold text-cyan-300 text-center">
                    Current Tier
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reward Redemption */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Redeem Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards.map((reward, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-yellow-500/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <p className="font-bold text-white">{reward.points} pts</p>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{reward.reward}</h3>
                <p className="text-xs text-gray-400 mb-4">{reward.description}</p>
                <button
                  disabled={userPoints < reward.points}
                  className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    userPoints >= reward.points
                      ? "bg-yellow-500 hover:bg-yellow-400 text-gray-950"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {userPoints >= reward.points ? "Redeem" : "Locked"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}