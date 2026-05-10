import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Users, Copy, Share2, Gift, Loader2, AlertCircle, CheckCircle2, Mail, MessageCircle } from 'lucide-react';

export default function ReferralDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        if (!me) { base44.auth.redirectToLogin('/referral-dashboard'); return; }
        setUser(me);

        const res = await base44.functions.invoke('getReferralStats', {});
        if (res.data?.error) {
          setError(res.data.error);
        } else {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const referralCode = user?.email ? user.email.split('@')[0].toUpperCase().slice(0, 8) : '';
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMessage = `Join VoxVPN using my referral code ${referralCode} and get exclusive rewards! ${referralLink}`;

  const shareOptions = [
    { name: 'WhatsApp', icon: '💬', url: `https://wa.me/?text=${encodeURIComponent(shareMessage)}` },
    { name: 'Twitter', icon: '𝕏', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}` },
    { name: 'Email', icon: '✉️', url: `mailto:?body=${encodeURIComponent(shareMessage)}` },
    { name: 'Copy Link', icon: '📋', action: () => copyToClipboard(referralLink) },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060c1a] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin" style={{ color: '#00d4ff' }} />
      </div>
    );
  }

  const invitedCount = stats?.invitations || 0;
  const completedCount = stats?.completed_referrals || 0;
  const earnedRewards = stats?.earned_rewards || 0;

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-semibold mb-4">
            <Gift size={12} /> Referral Rewards
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Invite Friends, Earn Rewards</h1>
          <p className="text-slate-400 text-sm">Share your referral code and get rewarded for each successful referral.</p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center gap-3 mb-6">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            <p className="text-rose-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          
          <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
              <Users size={24} className="text-cyan-400" />
            </div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Invitations</p>
            <p className="text-4xl font-black text-white">{invitedCount}</p>
            <p className="text-slate-600 text-xs mt-2">Friends invited</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Completed</p>
            <p className="text-4xl font-black text-white">{completedCount}</p>
            <p className="text-slate-600 text-xs mt-2">Paid referrals</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
              <Gift size={24} className="text-violet-400" />
            </div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Rewards</p>
            <p className="text-4xl font-black text-white">{earnedRewards}</p>
            <p className="text-slate-600 text-xs mt-2">Free days earned</p>
          </div>
        </motion.div>

        {/* Referral Code Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-8 mb-8">
          
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Your Referral Code</p>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <p className="text-3xl font-black text-white break-words">{referralCode}</p>
            </div>
            <button
              onClick={() => copyToClipboard(referralCode)}
              className="flex-shrink-0 w-10 h-10 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 flex items-center justify-center transition-all"
            >
              <Copy size={16} />
            </button>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0a1020] p-4 mb-4">
            <p className="text-slate-400 text-xs mb-2">Full Referral Link:</p>
            <div className="flex items-center gap-2">
              <p className="text-slate-300 text-xs break-all font-mono flex-1">{referralLink}</p>
              <button
                onClick={() => copyToClipboard(referralLink)}
                className="flex-shrink-0 px-2 py-1 rounded text-cyan-400 hover:bg-cyan-500/10 text-xs font-bold transition-all"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <p className="text-slate-500 text-xs">Share your code with friends. When they sign up and purchase a plan, you'll both earn rewards!</p>
        </motion.div>

        {/* Share Options */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/5 bg-[#0d1420] p-6 mb-8">
          
          <div className="flex items-center gap-2 mb-4">
            <Share2 size={16} className="text-cyan-400" />
            <h2 className="text-white font-bold">Share Your Code</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => option.action ? option.action() : window.open(option.url, '_blank')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="text-xs font-bold text-slate-400 group-hover:text-cyan-400 transition-colors text-center">{option.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/5 bg-[#0d1420] p-6">
          
          <h2 className="text-white font-bold mb-4">How It Works</h2>
          <ol className="space-y-3">
            {[
              { step: 1, title: 'Share Your Code', desc: 'Send your unique referral code to friends' },
              { step: 2, title: 'They Sign Up', desc: 'Your friends create an account using your code' },
              { step: 3, title: 'They Purchase', desc: 'When they buy a VoxVPN plan, you earn rewards' },
              { step: 4, title: 'Claim Rewards', desc: 'Get free subscription days added to your account' },
            ].map((item) => (
              <li key={item.step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-black bg-cyan-400">
                  {item.step}
                </span>
                <div>
                  <p className="text-white text-sm font-bold">{item.title}</p>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>

      </div>

      <Footer />
    </div>
  );
}