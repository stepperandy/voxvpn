import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import {
  Copy, CheckCircle2, Share2, Loader2, AlertCircle, Link2,
  Twitter, Facebook, MessageCircle, Mail, TrendingUp, DollarSign,
  MousePointer, Users, ExternalLink, Handshake, ArrowRight
} from 'lucide-react';

export default function AffiliateDashboard() {
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState(null);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    base44.auth.me()
      .then(async (u) => {
        setUser(u);
        const records = await base44.entities.AffiliatePartner.filter({ user_email: u.email });
        if (records && records.length > 0) setAffiliate(records[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const baseUrl = 'https://www.voxvpn.net';
  const affiliateLink = affiliate ? `${baseUrl}/?aff=${affiliate.affiliate_code}` : '';

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'VoxVPN', text: 'Stay private online with VoxVPN.', url: affiliateLink });
    } else {
      copyText(affiliateLink, 'link');
    }
  };

  const shareLinks = affiliate ? [
    { label: 'Twitter / X', icon: Twitter, color: 'border-sky-500/30 bg-sky-500/5 text-sky-400 hover:bg-sky-500/10', url: `https://twitter.com/intent/tweet?text=Stay+private+online+with+VoxVPN+%F0%9F%94%92&url=${encodeURIComponent(affiliateLink)}` },
    { label: 'Facebook', icon: Facebook, color: 'border-blue-500/30 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(affiliateLink)}` },
    { label: 'WhatsApp', icon: MessageCircle, color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10', url: `https://wa.me/?text=Stay+private+with+VoxVPN!+${encodeURIComponent(affiliateLink)}` },
    { label: 'Email', icon: Mail, color: 'border-violet-500/30 bg-violet-500/5 text-violet-400 hover:bg-violet-500/10', url: `mailto:?subject=Try+VoxVPN&body=Get+VoxVPN+here:+${encodeURIComponent(affiliateLink)}` },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
        <Loader2 size={28} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-white font-bold text-xl mb-3">Log in to access your dashboard</h2>
          <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (!affiliate || affiliate.status === 'pending') {
    return (
      <div className="min-h-screen bg-[#080c18]">
        <Navbar />
        <div className="pt-28 pb-20 px-4 max-w-xl mx-auto text-center">
          {!affiliate ? (
            <>
              <Handshake size={40} className="text-slate-500 mx-auto mb-4" />
              <h2 className="text-white font-bold text-2xl mb-3">No Application Found</h2>
              <p className="text-slate-400 text-sm mb-6">Apply to become a VoxVPN affiliate or partner to access your dashboard.</p>
              <a href="/affiliate-register" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all">
                Apply Now <ArrowRight size={15} />
              </a>
            </>
          ) : (
            <>
              <Loader2 size={40} className="text-amber-400 mx-auto mb-4 animate-spin" />
              <h2 className="text-white font-bold text-2xl mb-3">Application Pending</h2>
              <p className="text-slate-400 text-sm">Your application is under review. You'll be notified once approved.</p>
            </>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  if (affiliate.status === 'rejected' || affiliate.status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#080c18]">
        <Navbar />
        <div className="pt-28 pb-20 px-4 max-w-xl mx-auto text-center">
          <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
          <h2 className="text-white font-bold text-2xl mb-3">{affiliate.status === 'rejected' ? 'Application Not Approved' : 'Account Suspended'}</h2>
          <p className="text-slate-400 text-sm">Please contact <a href="/contact" className="text-cyan-400 hover:underline">support</a> for more information.</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Approved dashboard
  const pending = (affiliate.total_earnings || 0) - (affiliate.paid_earnings || 0);
  const typeColor = affiliate.type === 'partner' ? 'text-violet-400 border-violet-500/30 bg-violet-500/10' : 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-3 ${typeColor}`}>
            {affiliate.type === 'partner' ? <Handshake size={12} /> : <Users size={12} />}
            {affiliate.type === 'partner' ? 'Partner' : 'Affiliate'} Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Welcome, <span className="text-cyan-400">{affiliate.full_name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Code: <span className="font-mono font-bold text-white">{affiliate.affiliate_code}</span> · {affiliate.commission_rate || 20}% commission rate</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: MousePointer, label: 'Total Clicks', value: affiliate.total_clicks || 0, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
            { icon: Users, label: 'Conversions', value: affiliate.total_conversions || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { icon: DollarSign, label: 'Total Earned', value: `$${(affiliate.total_earnings || 0).toFixed(2)}`, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
            { icon: TrendingUp, label: 'Pending Payout', value: `$${pending.toFixed(2)}`, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`p-5 rounded-2xl border ${bg} flex flex-col gap-2`}>
              <Icon size={18} className={color} />
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Affiliate Link */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-6 mb-5">
          <h2 className="text-white font-bold text-base mb-1">Your Affiliate Link</h2>
          <p className="text-slate-500 text-xs mb-4">Share this link to earn {affiliate.commission_rate || 20}% on every sale.</p>
          <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4">
            <Link2 size={15} className="text-slate-500 flex-shrink-0" />
            <p className="text-slate-200 text-sm flex-1 truncate font-mono">{affiliateLink}</p>
            <button onClick={() => copyText(affiliateLink, 'link')}
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0">
              {copied === 'link' ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
              {copied === 'link' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => copyText(affiliateLink, 'link')}
              className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
              <Copy size={15} /> Copy Link
            </button>
            <button onClick={handleShare}
              className="flex-1 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm transition-all flex items-center justify-center gap-2">
              <Share2 size={15} /> Share
            </button>
          </div>
        </motion.div>

        {/* Social share */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 mb-5">
          <h2 className="text-white font-bold text-base mb-4">Share on Social</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {shareLinks.map(({ label, icon: Icon, color, url }) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all ${color}`}>
                <Icon size={20} />
                <span className="text-xs font-semibold">{label}</span>
                <ExternalLink size={10} className="opacity-50" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Payout info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
          <h2 className="text-white font-bold text-base mb-4">Payout Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs mb-1">Payout Method</p>
              <p className="text-white font-medium">{affiliate.payment_method || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Account Details</p>
              <p className="text-white font-medium">{affiliate.payment_details || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Total Paid Out</p>
              <p className="text-emerald-400 font-bold">${(affiliate.paid_earnings || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Pending Balance</p>
              <p className="text-cyan-400 font-bold">${pending.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-slate-600 text-xs mt-5">Payouts are processed monthly. Contact <a href="/contact" className="text-cyan-400 hover:underline">support</a> for payout requests.</p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}