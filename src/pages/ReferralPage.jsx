import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Copy, CheckCircle2, Gift, Users, Share2, Loader2, Clock, Star, Trophy, Zap, TrendingUp } from 'lucide-react';

const STATUS_STYLES = {
  pending:   { label: 'Pending',   cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  completed: { label: 'Completed', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  rewarded:  { label: 'Rewarded',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export default function ReferralPage() {
  const [code, setCode] = useState('');
  const [stats, setStats] = useState({ total_referrals: 0, total_rewards: 0 });
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [codeRes, statsRes] = await Promise.all([
          base44.functions.invoke('referral', { action: 'get_code' }),
          base44.functions.invoke('referral', { action: 'get_stats' }),
        ]);
        setCode(codeRes.data?.code || '');
        setStats(statsRes.data || { total_referrals: 0, total_rewards: 0 });

        // Load referral records
        const user = await base44.auth.me();
        const refs = await base44.entities.Referral.filter({ referrer_email: user.email });
        setReferrals(refs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
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
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Join VoxVPN', text: 'Get a free month when you sign up with my link!', url: referralLink });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-medium mb-4">
            <Gift size={12} /> Referral Program
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Refer Friends, <span className="text-cyan-400">Earn Free Months</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Share your link — when a friend subscribes, you both get a free month added automatically.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* Animated Rewards Summary Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-[#0d1a14] to-[#0d1120] p-6 md:p-8 relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Trophy size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">Your Rewards Summary</h2>
                  <p className="text-slate-500 text-xs">Updated in real-time</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { icon: Users, label: 'Friends Referred', value: stats.total_referrals, color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' },
                  { icon: Star, label: 'Free Months Earned', value: stats.total_rewards, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
                  { icon: TrendingUp, label: 'Converted', value: referrals.filter(r => r.status === 'completed' || r.status === 'rewarded').length, color: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/5' },
                  { icon: Zap, label: 'Pending', value: referrals.filter(r => r.status === 'pending').length, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.12 + i * 0.07, type: 'spring', stiffness: 200, damping: 15 }}
                      className={`rounded-xl border ${stat.border} ${stat.bg} p-4 text-center`}
                    >
                      <Icon size={16} className={`${stat.color} mx-auto mb-2`} />
                      <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                      <p className="text-slate-500 text-[11px] mt-1 leading-tight">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Reward milestone message */}
              {stats.total_rewards > 0 ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <span className="text-xl">🎉</span>
                  <p className="text-emerald-300 text-sm font-semibold">
                    Amazing! You've earned <span className="text-white">{stats.total_rewards} free month{stats.total_rewards > 1 ? 's' : ''}</span> so far. Keep referring to earn more!
                  </p>
                </motion.div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  <span className="text-xl">👋</span>
                  <p className="text-slate-400 text-sm">Share your link to start earning free months for every friend who subscribes.</p>
                </div>
              )}
            </motion.div>

            {/* Referral Link Card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#0d1a20] to-[#0d1120] p-6 md:p-8">
              <h2 className="text-white font-bold text-lg mb-1">Your Referral Link</h2>
              <p className="text-slate-400 text-sm mb-5">Share this link with friends. When they subscribe, you both earn a free month.</p>

              <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4">
                <p className="text-slate-200 text-sm flex-1 truncate font-mono">{referralLink}</p>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0">
                  {copied ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCopy}
                  className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
                  <Copy size={15} /> Copy Link
                </button>
                <button onClick={handleShare}
                  className="flex-1 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm transition-all flex items-center justify-center gap-2">
                  <Share2 size={15} /> Share
                </button>
              </div>

              {/* Code badge */}
              <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-3">
                <p className="text-slate-500 text-xs">Your referral code:</p>
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-mono font-bold text-sm tracking-widest">{code || '—'}</span>
              </div>
            </motion.div>

            {/* How it works */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
              <h2 className="text-white font-bold text-lg mb-5">How It Works</h2>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Share your link', desc: 'Copy and send your unique referral link to a friend.' },
                  { step: '2', title: 'Friend subscribes', desc: 'They sign up and purchase any VoxVPN plan.' },
                  { step: '3', title: 'Both get rewarded', desc: 'You get +1 free month added to your subscription. They get +1 month bonus too.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black font-black text-sm flex-shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Referral History */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
              className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
              <h2 className="text-white font-bold text-lg mb-5">Referral History</h2>

              {referrals.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/5 rounded-xl">
                  <Users size={28} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No referrals yet. Share your link to get started!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {referrals.map((ref) => {
                    const s = STATUS_STYLES[ref.status] || STATUS_STYLES.pending;
                    return (
                      <div key={ref.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0a1020] border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                            <Users size={15} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{ref.referee_email || 'Anonymous'}</p>
                            <p className="text-slate-500 text-xs flex items-center gap-1">
                              <Clock size={10} /> {ref.created_date ? new Date(ref.created_date).toLocaleDateString() : '—'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${s.cls}`}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}