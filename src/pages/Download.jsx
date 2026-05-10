import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Monitor, Download, CheckCircle2, Loader2, AlertCircle, Shield } from 'lucide-react';

// ── UPDATE THIS URL when the new installer is uploaded ──────────────────────
const INSTALLER_URL = 'https://github.com/stepperandy/voxvpn-backnd/releases/download/v1.5/VoxVPN-Setup-v1.5.exe';
const INSTALLER_FILE = 'VoxVPN-Setup-v1.5.exe';
const INSTALLER_VERSION = 'v1.5';
const INSTALLER_SIZE = '';

const STEPS = [
  'Download the VoxVPN installer',
  'Run the setup — click through the wizard (admin rights required)',
  'VoxVPN installs with the built-in VPN engine automatically',
  'Launch VoxVPN from your desktop or system tray',
  'Log in with your VoxVPN account, pick a server, and connect',
];

export default function DownloadPage() {
  const [user, setUser] = useState(null);
  const [hasSub, setHasSub] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(async (u) => {
        if (!u) return;
        setUser(u);
        if (u.role === 'admin') { setHasSub(true); return; }
        const subs = await base44.entities.VPNSubscription.filter({ user_email: u.email });
        setHasSub(subs?.some(s => s.status === 'active'));
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  const canDownload = hasSub && !!INSTALLER_URL;

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-4">
            <Download size={12} /> Official Download
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Download <span className="text-cyan-400">VoxVPN</span>
          </h1>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            The full VoxVPN desktop app for Windows — installs in seconds, connects in one click.
          </p>
        </motion.div>

        {/* Main installer card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-[#0d1120] p-8 mb-8">

          {/* App identity */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Monitor size={32} className="text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-white font-black text-xl">VoxVPN for Windows</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                  {INSTALLER_VERSION}
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                Windows 10 / 11{INSTALLER_SIZE ? ` · ${INSTALLER_SIZE}` : ''} · Full desktop installer
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: '⚡', label: 'Built-in VPN Engine' },
              { icon: '🌍', label: 'Server Selector UI' },
              { icon: '🔒', label: 'Login Screen' },
              { icon: '🖥️', label: 'System Tray Controls' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 text-slate-400 text-sm">
                <span>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>

          {/* Download CTA */}
          <div className="border-t border-white/5 pt-6">
            {loadingUser ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 size={15} className="animate-spin" /> Checking account…
              </div>
            ) : !user ? (
              <div className="space-y-3">
                <button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Download size={16} /> Log In to Download
                </button>
                <a
                  href="/#pricing"
                  onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
                  className="block w-full py-3 text-center border border-white/10 hover:border-white/20 text-slate-400 font-semibold rounded-xl text-sm transition-all"
                >
                  View Plans
                </a>
              </div>
            ) : !hasSub ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-amber-400 text-sm mb-1">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>An active subscription is required to download VoxVPN.</span>
                </div>
                <a
                  href="/#pricing"
                  onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
                  className="block w-full py-3.5 text-center bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
                >
                  Get a Plan →
                </a>
              </div>
            ) : !INSTALLER_URL ? (
              <div className="text-center py-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-semibold">
                  <AlertCircle size={15} /> New installer coming soon
                </div>
                <p className="text-slate-500 text-xs">The new VoxVPN installer is being prepared. Check back shortly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-2">
                  <CheckCircle2 size={13} /> Active subscription — ready to download
                </div>
                <a
                  href={INSTALLER_URL}
                  className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Download size={18} /> Download {INSTALLER_FILE}
                </a>
              </div>
            )}
          </div>
        </motion.div>

        {/* Setup steps */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 mb-6">
          <h3 className="text-white font-bold text-base mb-4">Setup Steps</h3>
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black font-black text-xs flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Other platforms coming soon */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 mb-6">
          <h3 className="text-white font-bold text-base mb-4">Other Platforms</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['macOS', 'Linux', 'iOS', 'Android', 'Router'].map(platform => (
              <div key={platform} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-[#0a1020]">
                <span className="text-slate-400 text-sm">{platform}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">Coming Soon</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust footer */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
            <Shield size={12} className="text-cyan-600" /> AES-256 Encryption · No-Logs Policy · VoxVPN
          </div>
          <a href="/contact" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Need help? Contact Support →</a>
        </div>

      </div>

      <Footer />
    </div>
  );
}