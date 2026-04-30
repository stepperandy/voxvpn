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
    directUrl: 'https://voxvpn.net/downloads/VoxVPN-Setup.exe',
    desc: 'One-click installer for Windows 10 and 11. Installs OpenVPN and configures your VoxVPN connection automatically.',
    steps: ['Download VoxVPN-Setup.exe', 'Double-click the installer and follow the prompts', 'VoxVPN installs OpenVPN and connects automatically', 'Look for VoxVPN in your system tray'],
  },
  {
    id: 'macos',
    label: 'macOS',
    icon: Monitor,
    color: 'text-slate-300',
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/5',
    badge: 'macOS 12+',
    file: 'VoxVPN.ovpn',
    desc: 'Download your personal OpenVPN .ovpn config file and import it into Tunnelblick or OpenVPN Connect.',
    store: { label: 'Get Tunnelblick', url: 'https://tunnelblick.net/downloads.html' },
    steps: ['Install Tunnelblick or OpenVPN Connect on your Mac', 'Download your VoxVPN.ovpn config below', 'Double-click the .ovpn file — it imports automatically into Tunnelblick', 'Click Connect in Tunnelblick'],
  },
  {
    id: 'linux',
    label: 'Linux',
    icon: Terminal,
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    badge: 'Ubuntu / Debian / CentOS',
    file: 'VoxVPN.ovpn',
    desc: 'Download your .ovpn config and connect via the OpenVPN CLI.',
    steps: ['Install OpenVPN: sudo apt install openvpn (Ubuntu/Debian) or sudo yum install openvpn (CentOS)', 'Download your VoxVPN.ovpn config below', 'Run: sudo openvpn --config ~/Downloads/VoxVPN.ovpn', 'VoxVPN connects automatically'],
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
    steps: ['Install OpenVPN Connect from the App Store', 'Download your VoxVPN.ovpn config below', 'Tap the .ovpn file → Share → Copy to OpenVPN Connect', 'Tap connect in OpenVPN Connect'],
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
    steps: ['Install OpenVPN Connect from Google Play', 'Download your VoxVPN.ovpn config below', 'Open OpenVPN Connect → + → Import from file → select VoxVPN.ovpn', 'Tap connect'],
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
    steps: ['Ensure your router supports OpenVPN client mode (GL.iNet, OpenWrt, DD-WRT)', 'Download your VoxVPN.ovpn config below', 'Login to router admin → VPN → OpenVPN Client', 'Upload the .ovpn file and enable the tunnel'],
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


export default function DownloadPage() {
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
  const [hasSub, setHasSub] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [downloading, setDownloading] = useState(false);

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
      // Windows returns a direct URL
      if (res.data?.directUrl) {
        window.location.href = res.data.directUrl;
        return;
      }
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

        {/* Subscription required banner */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-14 p-6 rounded-2xl border border-cyan-500/20 bg-[#0d1a20] text-center">
          <Shield size={28} className="text-cyan-400 mx-auto mb-3" />
          <h2 className="text-white font-bold text-lg mb-1">Active Subscription Required</h2>
          <p className="text-slate-400 text-sm mb-5">A VoxVPN subscription unlocks your personal config file and the Windows installer. Plans start at $2.49/mo.</p>
          <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
            className="inline-flex items-center gap-2 px-7 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all">
            View Plans →
          </a>
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
                  <Shield size={12} className="text-cyan-500" /> AES-256 · No-Logs · VoxVPN
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