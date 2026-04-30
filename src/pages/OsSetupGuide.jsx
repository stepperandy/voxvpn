import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer';
import {
  Monitor, Smartphone, Terminal, Wifi, Download, CheckCircle2,
  Loader2, AlertCircle, ExternalLink, ChevronDown, Shield
} from 'lucide-react';

const OS_LIST = [
  { id: 'windows', label: 'Windows', icon: Monitor, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
  { id: 'macos',   label: 'macOS',   icon: Monitor, color: 'text-slate-300', border: 'border-slate-500/30', bg: 'bg-slate-500/5' },
  { id: 'linux',   label: 'Linux',   icon: Terminal, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/5' },
  { id: 'ios',     label: 'iPhone / iPad', icon: Smartphone, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5' },
  { id: 'android', label: 'Android', icon: Smartphone, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  { id: 'router',  label: 'Router',  icon: Wifi, color: 'text-violet-400', border: 'border-violet-500/30', bg: 'bg-violet-500/5' },
];

const GUIDES = {
  windows: {
    steps: [
      {
        title: 'Download VoxVPN-Setup.exe',
        desc: 'Click "Download Setup" below to get the official VoxVPN Windows installer (.exe).',
      },
      {
        title: 'Run the Installer',
        desc: 'Double-click VoxVPN-Setup.exe and follow the on-screen prompts. Click Yes on any UAC prompt to allow installation.',
      },
      {
        title: 'VoxVPN Installs Automatically',
        desc: 'The installer sets up OpenVPN and configures your personal VoxVPN connection automatically.',
      },
      {
        title: 'Connect',
        desc: 'Look for the VoxVPN icon in your system tray. Right-click it and select Connect to start your secure session.',
      },
    ],
  },
  macos: {
    steps: [
      {
        title: 'Install Tunnelblick or OpenVPN Connect',
        desc: 'Download Tunnelblick (free, recommended) from tunnelblick.net, or OpenVPN Connect from the Mac App Store.',
        action: { label: 'Get Tunnelblick', href: 'https://tunnelblick.net/downloads.html' },
      },
      {
        title: 'Download Your VoxVPN Config',
        desc: 'Click "Download Config" below — you\'ll get your personal VoxVPN.ovpn file.',
      },
      {
        title: 'Import the Config',
        desc: 'Double-click the VoxVPN.ovpn file. Tunnelblick will automatically detect and import it.',
      },
      {
        title: 'Connect',
        desc: 'Click the Tunnelblick icon in your menu bar → select VoxVPN → Connect.',
      },
    ],
  },
  linux: {
    steps: [
      {
        title: 'Install OpenVPN',
        desc: 'Run: sudo apt install openvpn (Ubuntu/Debian) or sudo yum install openvpn (CentOS/RHEL).',
      },
      {
        title: 'Download Your VoxVPN Config',
        desc: 'Click "Download Config" below — you\'ll get your personal VoxVPN.ovpn file.',
      },
      {
        title: 'Connect via Terminal',
        desc: 'Run: sudo openvpn --config ~/Downloads/VoxVPN.ovpn',
      },
      {
        title: 'Connected!',
        desc: 'VoxVPN is now active. To disconnect, press Ctrl+C in the terminal or run: sudo pkill openvpn',
      },
    ],
  },
  ios: {
    steps: [
      {
        title: 'Install OpenVPN Connect',
        desc: 'Download OpenVPN Connect from the App Store — this is the client app that powers VoxVPN on iOS.',
        action: { label: 'Get OpenVPN Connect', href: 'https://apps.apple.com/app/openvpn-connect/id590379981' },
      },
      {
        title: 'Download Your VoxVPN Config',
        desc: 'Tap "Download Config" below. Your VoxVPN .ovpn file will be saved to your Files app.',
      },
      {
        title: 'Import into OpenVPN Connect',
        desc: 'Tap the downloaded .ovpn file → "Share" → "Copy to OpenVPN". The profile imports automatically.',
      },
      {
        title: 'Connect',
        desc: 'In OpenVPN Connect, tap the VoxVPN profile toggle to ON. Allow VPN configuration when iOS prompts you.',
      },
    ],
  },
  android: {
    steps: [
      {
        title: 'Install OpenVPN Connect',
        desc: 'Download OpenVPN Connect from Google Play — this is the client that runs VoxVPN on Android.',
        action: { label: 'Get OpenVPN Connect', href: 'https://play.google.com/store/apps/details?id=net.openvpn.openvpn' },
      },
      {
        title: 'Download Your VoxVPN Config',
        desc: 'Tap "Download Config" below. The .ovpn file saves to your Downloads folder.',
      },
      {
        title: 'Import into OpenVPN Connect',
        desc: 'Open OpenVPN Connect → tap "+" → "Import" → "Import from file" → select VoxVPN.ovpn.',
      },
      {
        title: 'Connect',
        desc: 'Tap the VoxVPN profile to connect. Grant VPN permission when Android prompts.',
      },
    ],
  },
  router: {
    steps: [
      {
        title: 'Check Router Compatibility',
        desc: 'Your router must support OpenVPN client mode. Recommended: GL.iNet routers, or routers running OpenWrt / DD-WRT firmware.',
      },
      {
        title: 'Download Your VoxVPN Config',
        desc: 'Click "Download Config" below to get your VoxVPN .ovpn file.',
      },
      {
        title: 'Access Router Admin Panel',
        desc: 'Log in to your router admin panel (usually 192.168.1.1) and go to VPN → OpenVPN Client.',
      },
      {
        title: 'Import & Activate',
        desc: 'Upload the VoxVPN .ovpn file in the OpenVPN client section, save settings, and enable the tunnel.',
      },
    ],
  },
};

function detectOS() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Win/.test(ua)) return 'windows';
  if (/Mac/.test(ua)) return 'macos';
  if (/Linux/.test(ua)) return 'linux';
  return 'windows';
}

function StepCard({ number, step }) {
  return (
    <div className="flex gap-4 p-5 rounded-xl border border-white/5 bg-[#0d1120]">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black font-black text-sm flex-shrink-0 mt-0.5">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-white font-bold text-sm mb-1">{step.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{step.desc}</p>
        {step.action && (
          <a
            href={step.action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
          >
            {step.action.label} <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function OsSetupGuide() {
  const [selectedOS, setSelectedOS] = useState(null);
  const [user, setUser] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    setSelectedOS(detectOS());
    base44.auth.me()
      .then(async (u) => {
        setUser(u);
        const subs = await base44.entities.VPNSubscription.filter({ user_email: u.email });
        setHasSubscription(subs && subs.length > 0 && subs[0].status === 'active');
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  const handleDownload = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    setDownloading(true);
    try {
      const res = await base44.functions.invoke('downloadVpnConfig', { platform: selectedOS });
      // Windows returns a direct URL
      if (res.data?.directUrl) {
        window.location.href = res.data.directUrl;
        return;
      }
      const blob = new Blob([res.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VoxVPN-${selectedOS.charAt(0).toUpperCase() + selectedOS.slice(1)}.ovpn`;
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

  const guide = GUIDES[selectedOS] || GUIDES.windows;
  const osInfo = OS_LIST.find(o => o.id === selectedOS) || OS_LIST[0];

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
            alt="VoxVPN"
            className="h-14 w-auto mx-auto mb-4"
          />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-4">
            <Shield size={12} />
            Step-by-step VPN setup
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Install VoxVPN on <span className="text-cyan-400">{osInfo.label}</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Your device was detected as <strong className="text-white">{osInfo.label}</strong>. Select a different OS below if needed.
          </p>
        </div>

        {/* OS Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-10">
          {OS_LIST.map((os) => {
            const Icon = os.icon;
            const active = selectedOS === os.id;
            return (
              <button
                key={os.id}
                onClick={() => setSelectedOS(os.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  active
                    ? `${os.border} ${os.bg} ring-1 ${os.border.replace('border-', 'ring-')}`
                    : 'border-white/5 bg-[#0d1120] hover:border-white/15'
                }`}
              >
                <Icon size={20} className={active ? os.color : 'text-slate-500'} />
                <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-slate-500'}`}>{os.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-white font-bold text-lg mb-4">Setup Guide for {osInfo.label}</h2>
            {guide.steps.map((step, i) => (
              <StepCard key={i} number={i + 1} step={step} />
            ))}
          </div>

          {/* Download + Status sidebar */}
          <div className="space-y-4">
            {/* Download Card */}
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="h-7 w-auto" />
                <h3 className="text-white font-bold text-sm">VoxVPN for {osInfo.label}</h3>
              </div>

              {loadingUser ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm py-4 justify-center">
                  <Loader2 size={16} className="animate-spin" /> Checking account...
                </div>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="text-slate-400 text-sm">Log in to download your personal VPN config tied to your subscription.</p>
                  <button
                    onClick={() => base44.auth.redirectToLogin(window.location.href)}
                    className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all"
                  >
                    Log In to Download
                  </button>
                </div>
              ) : !hasSubscription ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-amber-400 text-sm">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>No active subscription found. Subscribe to download your config.</span>
                  </div>
                  <a
                    href="/#pricing"
                    onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
                    className="block w-full py-3 text-center bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all"
                  >
                    View Plans
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 size={14} />
                    Active subscription detected
                  </div>
                  <p className="text-slate-400 text-xs">Your personal VoxVPN config for <strong className="text-white">{osInfo.label}</strong> will be generated and downloaded.</p>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {downloading ? (
                      <><Loader2 size={16} className="animate-spin" /> Generating...</>
                    ) : (
                      <><Download size={16} /> {selectedOS === 'windows' ? 'Download VoxVPN-Setup.exe' : 'Download .ovpn Config'}</>
                    )}
                  </button>
                  <p className="text-slate-600 text-xs text-center">
                    {selectedOS === 'windows' ? 'VoxVPN-Setup.exe' : `VoxVPN-${osInfo.label.replace(' / ', '-').replace(' ', '')}.ovpn`}
                  </p>
                </div>
              )}
            </div>

            {/* VoxVPN app link */}
            <div className="rounded-xl border border-white/5 bg-[#0d1120] p-4">
              <p className="text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wide">Get VoxVPN</p>
              <a
                href="/#pricing"
                onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
                className="flex items-center justify-between text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors"
              >
                View Plans <ExternalLink size={14} />
              </a>
              <p className="text-slate-600 text-xs mt-1">Secure, private VPN by VoxDigits</p>
            </div>

            {/* Support */}
            <div className="rounded-xl border border-white/5 bg-[#0d1120] p-4">
              <p className="text-slate-400 text-xs mb-1 font-semibold uppercase tracking-wide">Need Help?</p>
              <a href="/contact" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors">Contact Support →</a>
              <p className="text-slate-600 text-xs mt-0.5">support@voxdigits.com</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}