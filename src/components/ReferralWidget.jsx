import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Copy, CheckCircle2, Gift, Users, Share2 } from 'lucide-react';

export default function ReferralWidget() {
  const [code, setCode] = useState('');
  const [stats, setStats] = useState({ total_referrals: 0, total_rewards: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [codeRes, statsRes] = await Promise.all([
          base44.functions.invoke('referral', { action: 'get_code' }),
          base44.functions.invoke('referral', { action: 'get_stats' }),
        ]);
        setCode(codeRes.data?.code || '');
        setStats(statsRes.data || { total_referrals: 0, total_rewards: 0 });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const referralLink = `${window.location.origin}/?ref=${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Join VoxVPN', text: 'Get a free month when you sign up with my link!', url: referralLink });
    } else {
      handleCopy();
    }
  };

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-[#0d1120] border border-white/5 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/2 mb-3" />
        <div className="h-10 bg-white/10 rounded" />
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0d1a20] to-[#0d1120] border border-cyan-500/20 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Gift size={16} className="text-cyan-400" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Refer & Earn</p>
          <p className="text-slate-500 text-xs">Both you and your friend get a free month</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users size={13} className="text-cyan-400" />
            <span className="text-xs text-slate-500">Referrals</span>
          </div>
          <p className="text-white font-black text-xl">{stats.total_referrals}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Gift size={13} className="text-emerald-400" />
            <span className="text-xs text-slate-500">Free Months</span>
          </div>
          <p className="text-white font-black text-xl">{stats.total_rewards}</p>
        </div>
      </div>

      {/* Link */}
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Your Referral Link</p>
        <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5">
          <p className="text-slate-300 text-xs flex-1 truncate font-mono">{referralLink}</p>
          <button
            onClick={handleCopy}
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <Share2 size={16} />
        Share Your Link
      </button>
    </div>
  );
}