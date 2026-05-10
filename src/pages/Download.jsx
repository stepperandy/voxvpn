import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, AlertCircle, Shield, Lock, CheckCircle2, Monitor, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const INSTALLER_URL = 'https://github.com/stepperandy/VoxVPN-Setup-1.5/releases/tag/v1.5';
const INSTALLER_VERSION = 'v1.5';

const ACTIVE_STATUSES = ['active', 'trial'];

function canDownload(sub) {
  if (!sub) return false;
  return ACTIVE_STATUSES.includes(sub.status);
}

export default function DownloadPage() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const justPaid = new URLSearchParams(window.location.search).get('payment') === 'success';

  useEffect(() => {
    base44.auth.me()
      .then(async (u) => {
        if (!u) { setLoading(false); return; }
        setUser(u);
        if (u.role === 'admin') {
          setSubscription({ plan: 'Admin', status: 'active', renewal_date: null });
          setLoading(false);
          return;
        }
        const subs = await base44.entities.VPNSubscription.filter({ user_email: u.email });
        // Prefer active > trial > others
        const active = subs?.find(s => s.status === 'active')
          || subs?.find(s => s.status === 'trial')
          || subs?.[0]
          || null;
        setSubscription(active);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isExpired = subscription && !canDownload(subscription);
  const downloadUrl = subscription?.download_link || INSTALLER_URL;

  // Not logged in
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-[#060c1a]">
        <Navbar />
        <div className="pt-40 pb-24 px-4 max-w-md mx-auto text-center space-y-6">
          <Lock size={52} className="text-slate-600 mx-auto" />
          <h1 className="text-3xl font-black text-white">Sign In Required</h1>
          <p className="text-slate-400">You need to be logged in with an active subscription to download VoxVPN.</p>
          <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full py-3.5 bg-[#00d4ff] hover:bg-[#00c4ee] text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20">
            Log In to Download
          </button>
          <Link to="/#pricing"
            className="block w-full py-3 border border-white/10 hover:border-white/20 text-slate-400 font-semibold rounded-xl text-sm transition-all text-center">
            View Plans
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-[#00d4ff] text-xs font-semibold mb-4">
            <Download size={12} /> Official Download Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
            Download <span style={{ color: '#00d4ff' }}>VoxVPN</span>
          </h1>
          {!loading && subscription && (
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold ${
              canDownload(subscription)
                ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                : 'border-rose-500/30 bg-rose-500/5 text-rose-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${canDownload(subscription) ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {subscription.plan} Plan · {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={28} className="animate-spin" style={{ color: '#00d4ff' }} />
          </div>
        ) : (
          <>
            {/* Payment success banner */}
            {justPaid && canDownload(subscription) && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 mb-6 flex items-center gap-4">
                <CheckCircle2 size={28} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-emerald-300 font-bold text-base">Payment Successful! 🎉</p>
                  <p className="text-emerald-300/60 text-xs mt-0.5">Your subscription is now active. Download VoxVPN for Windows below.</p>
                </div>
              </motion.div>
            )}

            {/* No subscription at all */}
            {!subscription && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center space-y-4 mb-6">
                <AlertCircle size={44} className="text-amber-400 mx-auto" />
                <h2 className="text-white font-bold text-xl">No Active Subscription</h2>
                <p className="text-slate-400 text-sm">An active VoxVPN plan is required to download the Windows installer.</p>
                <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
                  className="inline-block px-8 py-3 rounded-xl font-bold text-black text-sm transition-all"
                  style={{ background: '#00d4ff' }}>
                  Get a Plan →
                </a>
              </motion.div>
            )}

            {/* Expired / Cancelled */}
            {isExpired && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8 text-center space-y-4 mb-6">
                <AlertCircle size={44} className="text-rose-400 mx-auto" />
                <h2 className="text-white font-bold text-xl">
                  {subscription.status === 'cancelled' ? 'Subscription Cancelled' : 'Subscription Expired'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {subscription.status === 'cancelled'
                    ? 'Your subscription has been cancelled. Resubscribe to regain download access.'
                    : 'Your subscription has expired. Renew now to regain access to the installer.'}
                </p>
                {subscription.renewal_date && (
                  <p className="text-slate-500 text-xs">
                    Expired on: {new Date(subscription.renewal_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black text-sm"
                    style={{ background: '#00d4ff' }}>
                    <RefreshCw size={15} /> Renew Subscription
                  </a>
                  <Link to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white font-bold text-sm transition-all">
                    Go to Dashboard
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Active — show download */}
            {canDownload(subscription) && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {/* Main download card */}
                <div className="rounded-2xl border border-[#00d4ff]/30 bg-[#0d1420] p-8 mb-6 text-center space-y-6"
                  style={{ boxShadow: '0 0 40px rgba(0,212,255,0.06)' }}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,100,200,0.1))', border: '1px solid rgba(0,212,255,0.2)' }}>
                      <Monitor size={36} style={{ color: '#00d4ff' }} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">VoxVPN for Windows</h2>
                      <p className="text-slate-400 text-sm mt-1">Full desktop installer — installs in seconds, connects in one click</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1.5"><Shield size={11} className="text-emerald-400" /> AES-256 Encrypted</span>
                    <span>·</span>
                    <span>Windows 10 / 11</span>
                    <span>·</span>
                    <span>Version {INSTALLER_VERSION}</span>
                    <span>·</span>
                    <span>20+ Server Locations</span>
                  </div>

                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-black text-lg text-black transition-all shadow-2xl w-full sm:w-auto"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)', boxShadow: '0 8px 30px rgba(0,212,255,0.3)' }}
                  >
                    <Download size={22} />
                    Download VoxVPN for Windows
                    <ExternalLink size={16} className="opacity-70" />
                  </a>

                  <p className="text-slate-600 text-xs">
                    Clicking will open the GitHub release page. Select <strong className="text-slate-400">VoxVPN-Setup-v1.5.exe</strong> to download.
                  </p>
                </div>

                {/* Install steps */}
                <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6 mb-6">
                  <h3 className="text-white font-bold text-sm mb-4">How to Install</h3>
                  <ol className="space-y-3">
                    {[
                      'Download the installer using the button above',
                      'Run VoxVPN-Setup-v1.5.exe (allow admin prompt if asked)',
                      'Sign in with your VoxVPN account credentials',
                      'Choose a server location and click Connect',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-black"
                          style={{ background: '#00d4ff', marginTop: '1px' }}>
                          {i + 1}
                        </span>
                        <span className="text-slate-400 text-sm leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Actions row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/dashboard"
                    className="flex-1 py-3 rounded-xl border border-white/10 hover:border-[#00d4ff]/30 text-slate-400 hover:text-white font-semibold text-sm transition-all text-center">
                    My Dashboard
                  </Link>
                  <Link to="/contact"
                    className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-semibold text-sm transition-all text-center">
                    Need Help?
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Trust footer */}
            <div className="text-center mt-8 space-y-1">
              <div className="flex items-center justify-center gap-2 text-slate-700 text-xs">
                <Shield size={11} /> AES-256 Encryption · No-Logs Policy · VoxVPN
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}