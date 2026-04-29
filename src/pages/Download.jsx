import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Monitor, Smartphone, Terminal, Wifi, Download, CheckCircle2,
  Loader2, AlertCircle, ExternalLink, Shield, Apple, Chrome
} from 'lucide-react';

const PLATFORMS = [
  {
    id: 'windows',
    label: 'Windows',
    icon: Monitor,
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    badge: 'Windows 10 / 11',
    file: 'VoxVPN-Setup.exe',
    directUrl: 'https://github.com/stepperandy/VoxVPN-Backend-Soft/releases/download/voxvpn.exe/VoxVPN-Setup.exe',
    desc: 'One-click installer for Windows 10 and 11. Installs and configures VoxVPN automatically.',
    steps: ['Download VoxVPN-Setup.exe', 'Double-click the installer and follow the prompts', 'VoxVPN installs and connects automatically', 'Look for VoxVPN in your system tray'],
  },
  {
    id: 'macos',
    label: 'macOS',
    icon: Monitor,
    color: 'text-slate-300',
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/5',
    badge: 'macOS 12+',
    file: 'VoxVPN-macOS-Setup.sh',
    desc: 'Shell script installs OpenVPN via Homebrew and activates your tunnel.',
    steps: ['Download VoxVPN-macOS-Setup.sh', 'Open Terminal → run: sudo bash ~/Downloads/VoxVPN-macOS-Setup.sh', 'VoxVPN connects automatically'],
  },
  {
    id: 'linux',
    label: 'Linux',
    icon: Terminal,
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    badge: 'Ubuntu / Debian / CentOS',
    file: 'VoxVPN-Linux-Setup.sh',
    desc: 'Installs OpenVPN via apt/yum and writes your config to /etc/openvpn.',
    steps: ['Download VoxVPN-Linux-Setup.sh', 'Run: sudo bash ~/Downloads/VoxVPN-Linux-Setup.sh', 'VoxVPN connects automatically'],
  },
  {
    id: 'ios',
    label: 'iPhone / iPad',
    icon: Smartphone,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/5',
    badge: 'iOS 14+',
    file: 'VoxVPN.ovpn',
    desc: 'Import your .ovpn config into OpenVPN Connect from the App Store.',
    store: { label: 'App Store', url: 'https://apps.apple.com/app/openvpn-connect/id590379981' },
    steps: ['Install OpenVPN Connect from the App Store', 'Download your VoxVPN.ovpn config below', 'Tap the file → Copy to OpenVPN', 'Tap connect in OpenVPN Connect'],
  },
  {
    id: 'android',
    label: 'Android',
    icon: Smartphone,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    badge: 'Android 8+',
    file: 'VoxVPN.ovpn',
    desc: 'Import your .ovpn config into OpenVPN Connect from Google Play.',
    store: { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=net.openvpn.openvpn' },
    steps: ['Install OpenVPN Connect from Google Play', 'Download your VoxVPN.ovpn config below', 'Open OpenVPN Connect → + → Import from file', 'Tap connect'],
  },
  {
    id: 'router',
    label: 'Router',
    icon: Wifi,
    color: 'text-violet-400',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/5',
    badge: 'OpenWrt / GL.iNet / DD-WRT',
    file: 'VoxVPN.ovpn',
    desc: 'Upload your .ovpn config into your router\'s OpenVPN client section.',
    steps: ['Ensure router supports OpenVPN client mode', 'Download your VoxVPN.ovpn config below', 'Login to router admin → VPN → OpenVPN Client', 'Upload the .ovpn file and enable the tunnel'],
  },
];

function detectOS() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Win/.test(ua)) return 'windows';
  if (/Mac/.test(ua)) return 'macos';
  if (/Linux/.test(ua)) return 'linux';
  return 'windows';
}

const PLANS = [
  { name: 'Free', price: '$0', desc: 'Limited servers', color: 'border-white/10', btn: 'bg-white/10 text-white hover:bg-white/20' },
  { name: 'Pro', price: '$5/mo', desc: 'All servers + speed', color: 'border-cyan-500/40', btn: 'bg-cyan-400 text-black hover:bg-cyan-300', popular: true },
  { name: 'Business', price: '$15/mo', desc: 'Premium routing', color: 'border-emerald-500/30', btn: 'bg-emerald-400 text-black hover:bg-emerald-300' },
];

export default function DownloadPage() {
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
  const [hasSub, setHasSub] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setSelected(detectOS());
    base44.auth.me()
      .then(async (u) => {
        setUser(u);
        const subs = await base44.entities.VPNSubscription.filter({ user_email: u.email });
        setHasSub(subs?.length > 0 && subs[0].status === 'active');
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  const platform = PLATFORMS.find(p => p.id === selected) || PLATFORMS[0];

  const handleDownload = async () => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    // Direct URL download (e.g. Windows .exe)
    if (platform.directUrl) {
      const a = document.createElement('a');
      a.href = platform.directUrl;
      a.download = platform.file;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    setDownloading(true);
    try {
      const res = await base44.functions.invoke('downloadVpnConfig', { platform: selected });
      const blob = new Blob([res.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = platform.file;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed: ' + (err.message || 'Please try again.'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-4">
            <Download size={12} /> Download VoxVPN
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight">
            Get <span className="text-cyan-400">VoxVPN</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Secure. Fast. Global.
          </p>
        </motion.div>

        {/* Pricing unlock section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-8">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl border ${plan.color} bg-white/5 p-7 text-center flex flex-col gap-4`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-cyan-400 text-black">Most Popular</span>
                )}
                <h2 className="text-white font-black text-xl">{plan.name}</h2>
                <p className="text-3xl font-black text-white">{plan.price}</p>
                <p className="text-slate-400 text-sm">{plan.desc}</p>
                <button
                  onClick={() => setUnlocked(true)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${plan.btn}`}
                >
                  {plan.name === 'Free' ? 'Get Free' : plan.name === 'Pro' ? 'Subscribe' : 'Get Business'}
                </button>
              </div>
            ))}
          </div>

          {/* Download section — revealed after clicking a plan */}
          {unlocked && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="text-center p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 max-w-md mx-auto">
              <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-3" />
              <h2 className="text-white font-black text-xl mb-2">Download VoxVPN</h2>
              <p className="text-slate-400 text-sm mb-5">Click below to download the Windows installer.</p>
              <a
                href="https://github.com/stepperandy/VoxVPN-Backend-Soft/releases/download/voxvpn.exe/VoxVPN-Setup.exe"
                download
                className="inline-flex items-center gap-2 px-7 py-3 bg-emerald-400 hover:bg-emerald-300 text-black font-black rounded-xl text-sm transition-all"
              >
                <Download size={16} /> Download for Windows
              </a>
            </motion.div>
          )}
        </motion.div>

        <hr className="border-white/5 mb-14" />

        {/* Platform selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-10">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            const active = selected === p.id;
            return (
              <button key={p.id} onClick={() => setSelected(p.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  active ? `${p.border} ${p.bg}` : 'border-white/5 bg-[#0d1120] hover:border-white/15'
                }`}>
                <Icon size={22} className={active ? p.color : 'text-slate-500'} />
                <span className={`text-xs font-semibold text-center leading-tight ${active ? 'text-white' : 'text-slate-500'}`}>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <motion.div key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Steps */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`p-5 rounded-2xl border ${platform.border} ${platform.bg}`}>
              <div className="flex items-center gap-3 mb-2">
                <platform.icon size={20} className={platform.color} />
                <h2 className="text-white font-bold text-lg">{platform.label}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">{platform.badge}</span>
              </div>
              <p className="text-slate-400 text-sm">{platform.desc}</p>
              {platform.store && (
                <a href={platform.store.url} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 mt-3 text-xs font-semibold ${platform.color} hover:opacity-80 transition-opacity`}>
                  <ExternalLink size={11} /> Get from {platform.store.label}
                </a>
              )}
            </div>

            <h3 className="text-white font-bold text-base px-1">Setup Steps</h3>
            <div className="space-y-3">
              {platform.steps.map((step, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-[#0d1120]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black font-black text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Download card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-5">
                <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="h-8 w-auto" />
                <div>
                  <p className="text-white font-bold text-sm">VoxVPN for {platform.label}</p>
                  <p className="text-slate-500 text-xs font-mono">{platform.file}</p>
                </div>
              </div>

              {loadingUser ? (
                <div className="flex items-center justify-center gap-2 py-6 text-slate-500 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Checking account…
                </div>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="text-slate-400 text-sm">Log in to download your personal VPN config.</p>
                  <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
                    className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all">
                    Log In to Download
                  </button>
                  <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
                    className="block w-full py-2.5 text-center border border-white/10 hover:border-white/20 text-slate-300 font-semibold rounded-xl text-sm transition-all">
                    View Plans
                  </a>
                </div>
              ) : !hasSub ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-amber-400 text-sm">
                    <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                    <span>No active subscription. Subscribe to download.</span>
                  </div>
                  <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
                    className="block w-full py-3 text-center bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all">
                    Get a Plan →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 size={13} /> Active subscription
                  </div>
                  <button onClick={handleDownload} disabled={downloading}
                    className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                    {downloading ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><Download size={15} /> Download {platform.file}</>}
                  </button>
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Shield size={12} className="text-cyan-500" /> AES-256 · No-Logs · OpenVPN
                </div>
                <a href="/contact" className="block text-xs text-slate-500 hover:text-cyan-400 transition-colors">Need help? Contact Support →</a>
              </div>
            </div>

            {/* App stores */}
            <div className="rounded-xl border border-white/5 bg-[#0d1120] p-4">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">Mobile Apps</p>
              <div className="space-y-2">
                <a href="https://apps.apple.com/app/openvpn-connect/id590379981" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                  <Apple size={14} /> OpenVPN Connect — App Store
                </a>
                <a href="https://play.google.com/store/apps/details?id=net.openvpn.openvpn" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                  <Chrome size={14} /> OpenVPN Connect — Google Play
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}