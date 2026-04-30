import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import {
  Copy, CheckCircle2, Share2, Loader2, Link2, Twitter, Facebook,
  MessageCircle, Mail, ExternalLink, QrCode
} from 'lucide-react';

export default function AffiliatePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        // Generate a deterministic affiliate code from email
        const code = btoa(u.email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();
        setAffiliateCode(code);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const baseUrl = window.location.origin;
  const affiliateLink = user ? `${baseUrl}/?aff=${affiliateCode}` : `${baseUrl}/?aff=YOURCODE`;

  const shareLinks = [
    {
      label: 'Twitter / X',
      icon: Twitter,
      color: 'border-sky-500/30 bg-sky-500/5 text-sky-400 hover:bg-sky-500/10',
      url: `https://twitter.com/intent/tweet?text=Stay+private+online+with+VoxVPN+%F0%9F%94%92+Get+protected+now%3A&url=${encodeURIComponent(affiliateLink)}`,
    },
    {
      label: 'Facebook',
      icon: Facebook,
      color: 'border-blue-500/30 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(affiliateLink)}`,
    },
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10',
      url: `https://wa.me/?text=Stay+private+online+with+VoxVPN!+Get+protected+now%3A+${encodeURIComponent(affiliateLink)}`,
    },
    {
      label: 'Email',
      icon: Mail,
      color: 'border-violet-500/30 bg-violet-500/5 text-violet-400 hover:bg-violet-500/10',
      url: `mailto:?subject=Try+VoxVPN&body=Hey!+I've+been+using+VoxVPN+to+stay+safe+online.+Check+it+out%3A+${encodeURIComponent(affiliateLink)}`,
    },
  ];

  const prebuiltMessages = [
    {
      label: 'Simple',
      text: `🔒 Protect your privacy online with VoxVPN. AES-256 encryption, no-logs policy, 20+ server locations. Get started here: ${affiliateLink}`,
    },
    {
      label: 'Casual',
      text: `Hey! I've been using VoxVPN and it's great — fast, secure, and no-logs. Use my link to get started: ${affiliateLink}`,
    },
    {
      label: 'Twitter-ready',
      text: `Stay private online with VoxVPN 🛡️ Military-grade encryption, kill switch & no-logs policy. Check it out: ${affiliateLink} #VPN #Privacy`,
    },
  ];

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'VoxVPN — Stay Protected Online',
        text: 'Stay private online with VoxVPN. AES-256 encryption, no-logs, 20+ locations.',
        url: affiliateLink,
      });
    } else {
      copyText(affiliateLink, 'link');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-4">
            <Link2 size={12} /> Affiliate Link
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Share <span className="text-cyan-400">VoxVPN</span>
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Use your personal affiliate link to share VoxVPN on social media, email, or anywhere online.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">

            {/* Affiliate Link Card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-6 md:p-8">
              <h2 className="text-white font-bold text-base mb-1">Your Affiliate Link</h2>
              <p className="text-slate-500 text-xs mb-5">
                Your code: <span className="font-mono font-bold text-cyan-400">{affiliateCode || 'YOURCODE'}</span>
                {!user && <span className="ml-2 text-amber-400">(Log in to get your personal link)</span>}
              </p>

              {/* Link display */}
              <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4">
                <Link2 size={15} className="text-slate-500 flex-shrink-0" />
                <p className="text-slate-200 text-sm flex-1 truncate font-mono">{affiliateLink}</p>
                <button
                  onClick={() => copyText(affiliateLink, 'link')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0"
                >
                  {copied === 'link' ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  {copied === 'link' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => copyText(affiliateLink, 'link')}
                  className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={15} /> Copy Link
                </button>
                <button
                  onClick={handleNativeShare}
                  className="flex-1 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={15} /> Share
                </button>
              </div>
            </motion.div>

            {/* Social Share Buttons */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
              <h2 className="text-white font-bold text-base mb-4">Share on Social</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {shareLinks.map(({ label, icon: Icon, color, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all ${color}`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-semibold">{label}</span>
                    <ExternalLink size={10} className="opacity-50" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Pre-built messages */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
              <h2 className="text-white font-bold text-base mb-1">Ready-to-Use Messages</h2>
              <p className="text-slate-500 text-xs mb-5">Copy and paste any message to share instantly.</p>
              <div className="space-y-3">
                {prebuiltMessages.map(({ label, text }) => (
                  <div key={label} className="p-4 rounded-xl bg-[#0a1020] border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</span>
                      <button
                        onClick={() => copyText(text, label)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {copied === label ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        {copied === label ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Login CTA if not logged in */}
            {!user && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
                <p className="text-amber-300 font-semibold mb-3">Log in to get your personal affiliate link</p>
                <button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all"
                >
                  Log In
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}