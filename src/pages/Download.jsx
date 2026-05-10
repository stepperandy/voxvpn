import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Monitor, Download, CheckCircle2, Loader2, AlertCircle, Shield } from 'lucide-react';

// ── UPDATE THIS URL when the new installer is uploaded ──────────────────────
const INSTALLER_URL = 'https://github.com/stepperandy/VoxVPN-Setup-1.5/releases/download/v1.5/VoxVPN-Setup-v1.5.exe';
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

        {/* iOS & Android */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-[#0d1120] p-6 mb-6">
          <h3 className="text-white font-bold text-base mb-1">iOS & Android</h3>
          <p className="text-slate-400 text-xs mb-5">Use the free OpenVPN Connect app to connect VoxVPN on your mobile device.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* iOS */}
            <div className="rounded-xl border border-white/5 bg-[#0a1020] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍎</span>
                <p className="text-white font-bold text-sm">iPhone / iPad</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold">Available</span>
              </div>
              <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
                <li>Install <strong className="text-white">OpenVPN Connect</strong> from the App Store</li>
                <li>Go to your <a href="/setup" className="text-cyan-400 hover:underline">Setup Portal</a> and download your config</li>
                <li>Open the <code className="text-cyan-400">.ovpn</code> file — it will import into OpenVPN Connect</li>
                <li>Tap <strong className="text-white">Connect</strong></li>
              </ol>
              <a href="https://apps.apple.com/app/openvpn-connect/id590379981" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-black border border-white/20 rounded-xl hover:opacity-90 transition-opacity w-full justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <span className="text-white text-xs font-bold">Download on the App Store</span>
              </a>
            </div>
            {/* Android */}
            <div className="rounded-xl border border-white/5 bg-[#0a1020] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <p className="text-white font-bold text-sm">Android</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold">Available</span>
              </div>
              <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
                <li>Install <strong className="text-white">OpenVPN Connect</strong> from Google Play</li>
                <li>Go to your <a href="/setup" className="text-cyan-400 hover:underline">Setup Portal</a> and download your config</li>
                <li>Open the <code className="text-cyan-400">.ovpn</code> file — it will import into OpenVPN Connect</li>
                <li>Tap <strong className="text-white">Connect</strong></li>
              </ol>
              <a href="https://play.google.com/store/apps/details?id=net.openvpn.openvpn" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-black border border-white/20 rounded-xl hover:opacity-90 transition-opacity w-full justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><path d="M3.18 23.76c.3.17.65.19.97.06l13.2-7.62-2.82-2.82-11.35 10.38z" fill="#EA4335"/><path d="M21.37 10.3L18.5 8.63l-3.12 3.12 3.12 3.12 2.9-1.67c.83-.48.83-1.42-.03-1.9z" fill="#FBBC05"/><path d="M3.18.24C2.85.38 2.63.74 2.63 1.22v21.56c0 .48.22.84.55.98l.1.06 12.07-12.07v-.28L3.28.18l-.1.06z" fill="#4285F4"/><path d="M15.35 11.75l-3.12-3.12L.17.24C.09.26.02.3 0 .37L12.22 12l3.13-3.13v2.88z" fill="#34A853"/></svg>
                <span className="text-white text-xs font-bold">Get it on Google Play</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Other platforms coming soon */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 mb-6">
          <h3 className="text-white font-bold text-base mb-4">Other Platforms</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['macOS', 'Linux', 'Router'].map(platform => (
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