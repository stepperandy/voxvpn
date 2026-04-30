import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Users, Handshake, CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

const TYPES = [
  {
    id: 'affiliate',
    icon: Users,
    title: 'Affiliate',
    desc: 'Earn commissions by sharing your unique link on social media, blogs, or communities.',
    badge: 'Up to 20% commission',
    color: 'border-cyan-500/40 bg-cyan-500/5',
    activeColor: 'border-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-400/30',
    iconColor: 'text-cyan-400',
  },
  {
    id: 'partner',
    icon: Handshake,
    title: 'Partner',
    desc: 'Resell VoxVPN to your clients or integrate it into your business products.',
    badge: 'Custom commission rates',
    color: 'border-violet-500/40 bg-violet-500/5',
    activeColor: 'border-violet-400 bg-violet-500/10 ring-2 ring-violet-400/30',
    iconColor: 'text-violet-400',
  },
];

export default function AffiliateRegister() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [existing, setExisting] = useState(null);
  const [form, setForm] = useState({ type: 'affiliate', full_name: '', website: '', promotion_method: '', payment_method: '', payment_details: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me()
      .then(async (u) => {
        setUser(u);
        setForm(f => ({ ...f, full_name: u.full_name || '' }));
        const records = await base44.entities.AffiliatePartner.filter({ user_email: u.email });
        if (records && records.length > 0) setExisting(records[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    if (!form.full_name || !form.promotion_method) { setError('Please fill in all required fields.'); return; }
    setError('');
    setSubmitting(true);
    const code = btoa(user.email + form.type).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toUpperCase();
    await base44.entities.AffiliatePartner.create({
      user_email: user.email,
      full_name: form.full_name,
      type: form.type,
      status: 'pending',
      affiliate_code: code,
      website: form.website,
      promotion_method: form.promotion_method,
      payment_method: form.payment_method,
      payment_details: form.payment_details,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
        <Loader2 size={28} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-400 text-xs font-medium mb-4">
            <Handshake size={12} /> Affiliate & Partner Program
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Join the <span className="text-cyan-400">VoxVPN</span> Program
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Earn commissions promoting the world's most private VPN. Apply below and our team will review your application.
          </p>
        </motion.div>

        {/* Already applied */}
        {existing && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-[#0d1120] p-8 text-center">
            {existing.status === 'approved' ? (
              <>
                <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
                <h2 className="text-white font-bold text-xl mb-2">You're approved!</h2>
                <p className="text-slate-400 text-sm mb-5">Your {existing.type} account is active. Go to your dashboard to access your link and earnings.</p>
                <a href="/affiliate-dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all">
                  Go to Dashboard <ArrowRight size={15} />
                </a>
              </>
            ) : existing.status === 'pending' ? (
              <>
                <Loader2 size={36} className="text-amber-400 mx-auto mb-3 animate-spin" />
                <h2 className="text-white font-bold text-xl mb-2">Application Under Review</h2>
                <p className="text-slate-400 text-sm">Your application is pending admin approval. We'll notify you by email once reviewed.</p>
              </>
            ) : existing.status === 'rejected' ? (
              <>
                <AlertCircle size={36} className="text-rose-400 mx-auto mb-3" />
                <h2 className="text-white font-bold text-xl mb-2">Application Not Approved</h2>
                <p className="text-slate-400 text-sm">Your application was not approved at this time. Contact support for more info.</p>
              </>
            ) : (
              <>
                <AlertCircle size={36} className="text-slate-400 mx-auto mb-3" />
                <h2 className="text-white font-bold text-xl mb-2">Account Suspended</h2>
                <p className="text-slate-400 text-sm">Your affiliate account has been suspended. Contact support.</p>
              </>
            )}
          </motion.div>
        )}

        {/* Success */}
        {!existing && submitted && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-2xl mb-2">Application Submitted!</h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">Our team will review your application and notify you at <span className="text-white font-semibold">{user?.email}</span>. This typically takes 1–2 business days.</p>
          </motion.div>
        )}

        {/* Form */}
        {!existing && !submitted && (
          <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onSubmit={handleSubmit} className="space-y-5">

            {/* Type selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const active = form.type === t.id;
                return (
                  <button key={t.id} type="button" onClick={() => setForm(f => ({ ...f, type: t.id }))}
                    className={`p-5 rounded-2xl border text-left transition-all ${active ? t.activeColor : t.color}`}>
                    <Icon size={22} className={`mb-3 ${t.iconColor}`} />
                    <p className="text-white font-bold text-base mb-1">{t.title}</p>
                    <p className="text-slate-400 text-xs mb-3">{t.desc}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${active ? t.activeColor : t.color} ${t.iconColor}`}>{t.badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Fields */}
            <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 space-y-4">
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1.5 block">Full Name *</label>
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  required placeholder="Your full name"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1.5 block">Website / Social Media URL</label>
                <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://yourwebsite.com or social profile"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1.5 block">How will you promote VoxVPN? *</label>
                <textarea value={form.promotion_method} onChange={e => setForm(f => ({ ...f, promotion_method: e.target.value }))}
                  required rows={3} placeholder="e.g. YouTube reviews, blog posts, social media, email newsletter, reselling to clients..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none" />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1.5 block">Preferred Payout Method</label>
                <input value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                  placeholder="PayPal, Bank Transfer, USDT, etc."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1.5 block">Payout Account Details</label>
                <input value={form.payment_details} onChange={e => setForm(f => ({ ...f, payment_details: e.target.value }))}
                  placeholder="e.g. PayPal email or wallet address"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-400 text-sm">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {!user ? (
              <button type="button" onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all">
                Log In to Apply
              </button>
            ) : (
              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            )}
          </motion.form>
        )}
      </div>
      <Footer />
    </div>
  );
}