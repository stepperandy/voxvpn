import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Monitor, Download, Loader2, AlertCircle, Shield, Clock, Lock, CheckCircle2 } from 'lucide-react';

const INSTALLER_URL = 'https://github.com/stepperandy/VoxVPN-Setup-1.5/releases/download/v1.5/VoxVPN-Setup-v1.5.exe';
const INSTALLER_FILE = 'VoxVPN-Setup-v1.5.exe';
const INSTALLER_VERSION = 'v1.5';

// What each plan unlocks
const PLAN_PERMS = {
  Basic:      { devices: 1,         platforms: ['windows'],                                label: 'Basic' },
  Standard:   { devices: 3,         platforms: ['windows', 'ios', 'android'],               label: 'Standard' },
  Premium:    { devices: 5,         platforms: ['windows', 'ios', 'android', 'macos'],      label: 'Premium' },
  Advanced:   { devices: 10,        platforms: ['windows', 'ios', 'android', 'macos', 'linux'], label: 'Advanced' },
  Enterprise: { devices: 'Unlimited', platforms: ['windows', 'ios', 'android', 'macos', 'linux', 'router'], label: 'Enterprise' },
  Admin:      { devices: 'Unlimited', platforms: ['windows', 'ios', 'android', 'macos', 'linux', 'router'], label: 'Admin' },
};

const ALL_PLATFORMS = [
  {
    id: 'windows',
    label: 'Windows',
    emoji: '🪟',
    badge: 'Desktop App',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500/20',
    content: (
      <div className="space-y-3">
        <p className="text-slate-400 text-xs">Full desktop installer — installs in seconds, connects in one click.</p>
        <a href={INSTALLER_URL}
          className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
          <Download size={15} /> Download {INSTALLER_FILE}
        </a>
        <p className="text-slate-600 text-xs text-center">Windows 10 / 11 · {INSTALLER_VERSION}</p>
      </div>
    ),
  },
  {
    id: 'ios',
    label: 'iPhone / iPad',
    emoji: '🍎',
    badge: 'OpenVPN Connect',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/20',
    content: (
      <div className="space-y-2">
        <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
          <li>Install <strong className="text-white">OpenVPN Connect</strong> from the App Store</li>
          <li>Visit your <a href="/setup" className="text-cyan-400 hover:underline">Setup Portal</a> → download config</li>
          <li>Open the <code className="text-cyan-400">.ovpn</code> file to import</li>
          <li>Tap <strong className="text-white">Connect</strong></li>
        </ol>
        <a href="https://apps.apple.com/app/openvpn-connect/id590379981" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-black border border-white/20 rounded-xl hover:opacity-90 transition-opacity w-full justify-center mt-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          <span className="text-white text-xs font-bold">App Store</span>
        </a>
      </div>
    ),
  },
  {
    id: 'android',
    label: 'Android',
    emoji: '🤖',
    badge: 'OpenVPN Connect',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/20',
    content: (
      <div className="space-y-2">
        <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
          <li>Install <strong className="text-white">OpenVPN Connect</strong> from Google Play</li>
          <li>Visit your <a href="/setup" className="text-cyan-400 hover:underline">Setup Portal</a> → download config</li>
          <li>Open the <code className="text-cyan-400">.ovpn</code> file to import</li>
          <li>Tap <strong className="text-white">Connect</strong></li>
        </ol>
        <a href="https://play.google.com/store/apps/details?id=net.openvpn.openvpn" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-black border border-white/20 rounded-xl hover:opacity-90 transition-opacity w-full justify-center mt-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><path d="M3.18 23.76c.3.17.65.19.97.06l13.2-7.62-2.82-2.82-11.35 10.38z" fill="#EA4335"/><path d="M21.37 10.3L18.5 8.63l-3.12 3.12 3.12 3.12 2.9-1.67c.83-.48.83-1.42-.03-1.9z" fill="#FBBC05"/><path d="M3.18.24C2.85.38 2.63.74 2.63 1.22v21.56c0 .48.22.84.55.98l.1.06 12.07-12.07v-.28L3.28.18l-.1.06z" fill="#4285F4"/><path d="M15.35 11.75l-3.12-3.12L.17.24C.09.26.02.3 0 .37L12.22 12l3.13-3.13v2.88z" fill="#34A853"/></svg>
          <span className="text-white text-xs font-bold">Google Play</span>
        </a>
      </div>
    ),
  },
  {
    id: 'macos',
    label: 'macOS',
    emoji: '🍏',
    badge: 'Tunnelblick / WireGuard',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    borderColor: 'border-slate-500/20',
    content: (
      <div className="space-y-2">
        <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
          <li>Install <a href="https://tunnelblick.net" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Tunnelblick</a> or <a href="https://www.wireguard.com/install/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">WireGuard</a></li>
          <li>Visit your <a href="/setup" className="text-cyan-400 hover:underline">Setup Portal</a> → download config</li>
          <li>Double-click the config file to import</li>
          <li>Click <strong className="text-white">Connect</strong></li>
        </ol>
        <a href="/setup" className="mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-slate-500/10 border border-slate-500/20 rounded-xl text-slate-300 text-xs font-bold hover:bg-slate-500/20 transition-all">
          Go to Setup Portal →
        </a>
      </div>
    ),
  },
  {
    id: 'linux',
    label: 'Linux',
    emoji: '🐧',
    badge: 'OpenVPN / WireGuard',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    borderColor: 'border-orange-500/20',
    content: (
      <div className="space-y-2">
        <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
          <li>Run: <code className="text-cyan-400">sudo apt install openvpn</code></li>
          <li>Visit your <a href="/setup" className="text-cyan-400 hover:underline">Setup Portal</a> → download config</li>
          <li>Run: <code className="text-cyan-400">sudo openvpn --config VoxVPN.ovpn</code></li>
          <li>Or use WireGuard: run the setup script as root</li>
        </ol>
        <a href="/setup" className="mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 text-xs font-bold hover:bg-orange-500/20 transition-all">
          Go to Setup Portal →
        </a>
      </div>
    ),
  },
  {
    id: 'router',
    label: 'Router',
    emoji: '📡',
    badge: 'OpenWrt / DD-WRT',
    badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    borderColor: 'border-violet-500/20',
    content: (
      <div className="space-y-2">
        <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
          <li>Ensure router runs OpenWrt or DD-WRT</li>
          <li>Visit your <a href="/setup" className="text-cyan-400 hover:underline">Setup Portal</a> → download config</li>
          <li>Upload the <code className="text-cyan-400">.ovpn</code> to your router's VPN section</li>
          <li>Enable tunnel — all devices on the network are protected</li>
        </ol>
        <a href="/setup" className="mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 text-xs font-bold hover:bg-violet-500/20 transition-all">
          Go to Setup Portal →
        </a>
      </div>
    ),
  },
];

function useCountdown(renewalDate) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!renewalDate) return;
    const target = new Date(renewalDate).getTime();

    const calc = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft({ expired: true }); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, mins, secs, expired: false });
    };

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [renewalDate]);

  return timeLeft;
}

function CountdownTimer({ renewalDate }) {
  const t = useCountdown(renewalDate);
  if (!renewalDate) return null;
  if (!t) return null;

  const urgent = t.days !== undefined && t.days < 3 && !t.expired;

  return (
    <div className={`rounded-xl border p-4 mb-6 ${t.expired ? 'border-rose-500/30 bg-rose-500/5' : urgent ? 'border-amber-500/30 bg-amber-500/5' : 'border-cyan-500/20 bg-cyan-500/5'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className={t.expired ? 'text-rose-400' : urgent ? 'text-amber-400' : 'text-cyan-400'} />
        <p className={`text-xs font-bold ${t.expired ? 'text-rose-400' : urgent ? 'text-amber-400' : 'text-cyan-400'}`}>
          {t.expired ? 'Subscription Expired' : 'Subscription Active — Time Remaining'}
        </p>
      </div>
      {!t.expired && (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { val: t.days, label: 'Days' },
            { val: t.hours, label: 'Hours' },
            { val: t.mins, label: 'Mins' },
            { val: t.secs, label: 'Secs' },
          ].map(({ val, label }) => (
            <div key={label} className="rounded-lg bg-[#0a1020] border border-white/5 py-2 px-1">
              <p className={`text-2xl font-black tabular-nums ${urgent ? 'text-amber-400' : 'text-white'}`}>{String(val).padStart(2, '0')}</p>
              <p className="text-slate-600 text-[10px] uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      )}
      {t.expired && (
        <div className="space-y-2">
          <p className="text-rose-300 text-xs">Your subscription has expired. Renew to continue using VoxVPN.</p>
          <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
            className="inline-block px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl hover:bg-rose-500/20 transition-all">
            Renew Now →
          </a>
        </div>
      )}
      {!t.expired && (
        <p className="text-slate-600 text-xs mt-3 text-center">
          Renews: {new Date(renewalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}
    </div>
  );
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
        const active = subs?.find(s => s.status === 'active') || null;
        setSubscription(active);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const perms = subscription ? (PLAN_PERMS[subscription.plan] || PLAN_PERMS.Basic) : null;
  const allowedPlatforms = perms ? ALL_PLATFORMS.filter(p => perms.platforms.includes(p.id)) : [];
  const lockedPlatforms = perms ? ALL_PLATFORMS.filter(p => !perms.platforms.includes(p.id)) : [];

  // Not logged in
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-[#080c18]">
        <Navbar />
        <div className="pt-40 pb-24 px-4 max-w-md mx-auto text-center space-y-6">
          <Lock size={48} className="text-slate-600 mx-auto" />
          <h1 className="text-3xl font-black text-white">Sign In Required</h1>
          <p className="text-slate-400">You need to be logged in with an active subscription to access downloads.</p>
          <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all">
            Log In to Download
          </button>
          <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
            className="block w-full py-3 border border-white/10 hover:border-white/20 text-slate-400 font-semibold rounded-xl text-sm transition-all">
            View Plans
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  // Logged in but no active sub
  if (!loading && user && !subscription) {
    return (
      <div className="min-h-screen bg-[#080c18]">
        <Navbar />
        <div className="pt-40 pb-24 px-4 max-w-md mx-auto text-center space-y-6">
          <AlertCircle size={48} className="text-amber-400 mx-auto" />
          <h1 className="text-3xl font-black text-white">No Active Subscription</h1>
          <p className="text-slate-400">An active VoxVPN plan is required to access downloads.</p>
          <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
            className="block w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all text-center">
            Get a Plan →
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-4">
            <Download size={12} /> Official Download Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
            Download <span className="text-cyan-400">VoxVPN</span>
          </h1>
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 size={14} className="animate-spin" /> Loading your account…
            </div>
          ) : subscription && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {perms?.label} Plan · {typeof perms?.devices === 'number' ? `${perms.devices} device${perms.devices > 1 ? 's' : ''}` : 'Unlimited devices'}
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={28} className="text-cyan-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Payment success banner */}
            {justPaid && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 mb-6 flex items-center gap-4">
                <CheckCircle2 size={28} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-emerald-300 font-bold text-base">Payment Successful! 🎉</p>
                  <p className="text-emerald-300/60 text-xs mt-0.5">Your subscription is now active. Download VoxVPN for your device{allowedPlatforms.length > 1 ? 's' : ''} below.</p>
                </div>
              </motion.div>
            )}

            {/* Countdown timer */}
            {subscription?.renewal_date && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <CountdownTimer renewalDate={subscription.renewal_date} />
              </motion.div>
            )}

            {/* Allowed platforms */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-white font-bold text-base mb-4">
                Your Downloads
                <span className="ml-2 text-xs text-slate-500 font-normal">({allowedPlatforms.length} platform{allowedPlatforms.length !== 1 ? 's' : ''} included in your plan)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {allowedPlatforms.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                    className={`rounded-2xl border ${p.borderColor} bg-[#0d1120] p-5 flex flex-col gap-3`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.emoji}</span>
                      <p className="text-white font-bold text-sm flex-1">{p.label}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${p.badgeColor}`}>{p.badge}</span>
                    </div>
                    {p.content}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Locked platforms (upgrade prompt) */}
            {lockedPlatforms.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={14} className="text-slate-500" />
                  <h3 className="text-slate-400 font-bold text-sm">Upgrade to Unlock More Platforms</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                  {lockedPlatforms.map(p => (
                    <div key={p.id} className="flex items-center gap-2 px-3 py-3 rounded-xl border border-white/5 bg-[#0a1020] opacity-50">
                      <span>{p.emoji}</span>
                      <span className="text-slate-500 text-sm font-medium">{p.label}</span>
                      <Lock size={11} className="text-slate-700 ml-auto" />
                    </div>
                  ))}
                </div>
                <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-bold rounded-xl transition-all">
                  Upgrade Plan →
                </a>
              </motion.div>
            )}

            {/* Setup Portal CTA */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-2xl border border-white/5 bg-[#0a1020] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">Need your VPN config file?</p>
                  <p className="text-slate-500 text-xs">Generate and download your OpenVPN or WireGuard config from the Setup Portal.</p>
                </div>
              </div>
              <a href="/setup"
                className="flex-shrink-0 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap">
                Setup Portal →
              </a>
            </motion.div>

            {/* Trust footer */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
                <Shield size={12} className="text-cyan-600" /> AES-256 Encryption · No-Logs Policy · VoxVPN
              </div>
              <a href="/contact" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Need help? Contact Support →</a>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}