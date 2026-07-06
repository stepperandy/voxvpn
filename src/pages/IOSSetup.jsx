import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  ArrowLeft, Smartphone, Download, Shield, Lock, UserCheck,
  Settings, Wifi, CheckCircle2, Loader2, ExternalLink, Apple,
  ChevronRight, KeyRound, Fingerprint, AppWindow, Bell, Clock,
  FileText, FolderOpen, RefreshCw, FileCheck2, Rocket, AlertCircle,
  Cpu, Network
} from 'lucide-react';

const STEPS = [
  {
    icon: AppWindow,
    title: 'Install OpenVPN Connect',
    subtitle: 'From the App Store',
    description: 'Open the App Store on your iPhone or iPad, search for "OpenVPN Connect", and install it. This is the official, free OpenVPN client that will run your VoxVPN profile.',
    accent: '#a78bfa',
    action: { label: 'Open in App Store', href: 'https://apps.apple.com/app/openvpn-connect/id590379981' },
  },
  {
    icon: UserCheck,
    title: 'Sign In to VoxVPN',
    subtitle: 'Get your credentials',
    description: 'Sign in to your VoxVPN dashboard using the button below. Your subscription must be active to generate a VPN configuration file for your device.',
    accent: '#8b5cf6',
    action: { label: 'Go to Dashboard', to: '/dashboard' },
  },
  {
    icon: Download,
    title: 'Download Your VPN Profile',
    subtitle: '.ovpn config file',
    description: 'From your dashboard, use the server selector to pick a location, then tap "Download Config" to get your personal .ovpn profile. This file contains your encrypted connection credentials and server details.',
    accent: '#7c3aed',
  },
  {
    icon: FolderOpen,
    title: 'Import the Profile',
    subtitle: 'Open in OpenVPN Connect',
    description: 'After the download completes, tap the downloaded .ovpn file in Safari, then tap "Open in OpenVPN" from the share sheet. OpenVPN Connect will launch and show "New profile available — Import". Tap the green + button to import.',
    accent: '#6d28d9',
  },
  {
    icon: KeyRound,
    title: 'Enter Your Credentials',
    subtitle: 'VoxVPN username & password',
    description: 'OpenVPN Connect will ask for a username and password. Use the email address you subscribed with as the username, and your VoxVPN account password. Toggle "Save" so you don\'t have to re-enter them each time.',
    accent: '#5b21b6',
  },
  {
    icon: Fingerprint,
    title: 'Allow VPN Configuration',
    subtitle: 'iOS permission prompt',
    description: 'iOS will show "OpenVPN Connect Would Like to Add VPN Configurations". Tap Allow. Confirm with Face ID, Touch ID, or your device passcode to authorize the VPN profile.',
    accent: '#4c1d95',
  },
  {
    icon: Wifi,
    title: 'Connect & Browse Securely',
    subtitle: 'You\'re protected!',
    description: 'Toggle the connection switch in OpenVPN Connect to the ON position. You\'ll see a "VPN" icon in your status bar — your traffic is now encrypted with AES-256. Browse, stream, and work privately.',
    accent: '#00d4ff',
  },
];

export default function IOSSetup() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servers, setServers] = useState([]);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(me => { if (me) setUser(me); })
      .catch(() => {})
      .finally(() => setLoading(false));

    base44.functions.invoke('getServers', {})
      .then(res => {
        const list = res?.data?.servers || res?.data || [];
        setServers(Array.isArray(list) ? list.slice(0, 6) : []);
      })
      .catch(() => setServers([]));
  }, []);

  const handleDownloadConfig = async (server) => {
    setGenerating(server.id || server.region);
    try {
      const res = await base44.functions.invoke('downloadVpnConfigForServer', {
        server_id: server.id,
        server_region: server.region,
        server_country: server.country,
      });
      const config = res?.data?.config || res?.config;
      if (!config) throw new Error('No config returned');
      const blob = new Blob([config], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voxvpn-${server.country || server.region}.ovpn`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download config: ' + (err.message || 'Please try again.'));
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Back link */}
        <Link to="/dashboard"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm font-medium transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', boxShadow: '0 0 30px rgba(167,139,250,0.15)' }}>
              <Apple size={32} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">VoxVPN for iOS</h1>
              <p className="text-slate-400 text-sm mt-0.5">Manual VPN profile setup — no installer app needed</p>
            </div>
          </div>
        </motion.div>

        {/* Why manual? */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
          className="rounded-2xl border border-violet-500/25 p-6 mb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(124,58,237,0.04))' }}>
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.15), transparent 70%)' }} />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.35)', color: '#c4b5fd' }}>
                <Cpu size={10} /> Manual Setup
              </span>
            </div>
            <h2 className="text-white font-black text-xl mb-1">No Installer? No Problem.</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              The dedicated VoxVPN iOS app is still in development. In the meantime, you can connect securely
              right now using the official OpenVPN Connect app and your personal VoxVPN profile. It takes about
              5 minutes — follow the 7 steps below.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs">
                <Clock size={12} className="text-violet-400" />
                <span className="text-slate-400">Setup time:</span>
                <span className="text-white font-semibold">~5 minutes</span>
              </div>
              <span className="text-slate-700">·</span>
              <div className="flex items-center gap-2 text-xs">
                <Smartphone size={12} className="text-violet-400" />
                <span className="text-slate-400">iOS 14.0+ · iPhone, iPad & iPod touch</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Credentials reminder */}
        {!loading && user && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl border border-violet-500/20 bg-[#0d1420] p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <KeyRound size={14} className="text-violet-400" />
              </div>
              <h3 className="text-white font-bold text-sm">Your Sign-In Credentials</h3>
            </div>
            <p className="text-slate-400 text-xs mb-3">Use this email when OpenVPN Connect asks for your username:</p>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-slate-500 text-xs w-12 flex-shrink-0">Email</span>
              <span className="text-white text-xs font-mono font-semibold">{user.email}</span>
            </div>
            <p className="text-slate-600 text-[10px] mt-2">Use the same password you set when you signed up. <Link to="/reset-password" className="text-violet-400 hover:text-violet-300">Forgot password?</Link></p>
          </motion.div>
        )}

        {/* Quick config download */}
        {!loading && user && servers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
            className="rounded-2xl border border-cyan-500/20 p-5 mb-8"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,80,160,0.04))' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}>
                <Network size={14} style={{ color: '#00d4ff' }} />
              </div>
              <h3 className="text-white font-bold text-sm">Quick: Download Your Profile</h3>
            </div>
            <p className="text-slate-400 text-xs mb-3">Skip step 3 — grab your .ovpn config right here and AirDrop or save it to Files for import.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {servers.map((s) => {
                const isGenerating = generating === (s.id || s.region);
                return (
                  <button key={s.id || s.region}
                    onClick={() => handleDownloadConfig(s)}
                    disabled={!!generating}
                    className="flex items-center gap-2 p-2.5 rounded-lg text-left transition-all disabled:opacity-50 group"
                    style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                    {isGenerating
                      ? <Loader2 size={14} className="text-cyan-400 animate-spin flex-shrink-0" />
                      : <Download size={14} style={{ color: '#00d4ff' }} className="flex-shrink-0" />}
                    <span className="text-slate-300 text-xs font-semibold truncate">{s.region}</span>
                    <span className="text-slate-600 text-[10px] ml-auto">{s.country}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* What you'll need */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="rounded-2xl border border-cyan-500/15 bg-[#0d1420] p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-cyan-400" />
            <h3 className="text-white font-bold text-sm">What You'll Need</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { icon: Apple, label: 'iPhone or iPad', note: 'iOS 14.0 or later' },
              { icon: AppWindow, label: 'OpenVPN Connect', note: 'Free from App Store' },
              { icon: KeyRound, label: 'VoxVPN account', note: 'Active subscription' },
              { icon: FileText, label: '.ovpn profile', note: 'Downloaded from dashboard' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                    <Icon size={13} style={{ color: '#00d4ff' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold">{item.label}</p>
                    <p className="text-slate-500 text-[10px]">{item.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + idx * 0.05 }}
                className="relative rounded-2xl border bg-[#0d1420] p-5 flex gap-4"
                style={{ borderColor: `${step.accent}22` }}
              >
                {/* Step number badge */}
                <div className="flex-shrink-0">
                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.accent}15`, border: `1px solid ${step.accent}40` }}>
                    <Icon size={22} style={{ color: step.accent }} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                      style={{ background: step.accent }}>
                      {idx + 1}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-white font-bold text-sm">{step.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${step.accent}15`, color: step.accent }}>
                      {step.subtitle}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{step.description}</p>

                  {/* Action button */}
                  {step.action && (
                    step.action.href ? (
                      <a href={step.action.href} target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{ background: `${step.accent}15`, border: `1px solid ${step.accent}35`, color: step.accent }}>
                        <ExternalLink size={12} /> {step.action.label}
                      </a>
                    ) : (
                      <Link to={step.action.to}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{ background: `${step.accent}15`, border: `1px solid ${step.accent}35`, color: step.accent }}>
                        <ChevronRight size={12} /> {step.action.label}
                      </Link>
                    )
                  )}
                </div>

                {/* Connecting line */}
                {idx < STEPS.length - 1 && (
                  <div className="absolute left-[2.6rem] top-[4.5rem] bottom-[-0.75rem] w-px" style={{ background: `${step.accent}20` }} />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Trust banner */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-8 rounded-2xl border border-cyan-500/20 p-5 flex items-start gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,80,160,0.04))' }}>
          <Lock size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-bold text-sm mb-1">Why does iOS ask to trust the profile?</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Apple requires all VPN apps to install a configuration profile that manages your network connection.
              This is a standard security measure — VoxVPN never sees or stores your device passcode, and the profile
              only routes traffic through our encrypted servers. You can remove it anytime in Settings → General →
              VPN & Device Management.
            </p>
          </div>
        </motion.div>

        {/* Troubleshooting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="mt-4 rounded-2xl border border-white/5 bg-[#0d1420] p-5">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <AlertCircle size={14} className="text-violet-400" /> Troubleshooting
          </h3>
          <div className="space-y-2.5">
            {[
              { q: 'Can\'t find the .ovpn file after download', a: 'Open the Files app → Downloads folder. Or in Safari, tap the downloads arrow in the address bar to find the file.' },
              { q: '"Open in OpenVPN" option doesn\'t appear', a: 'Tap and hold the downloaded file in Files, then tap Share → "Open in OpenVPN" from the share sheet.' },
              { q: 'VPN won\'t connect after importing', a: 'Make sure you entered your VoxVPN email (not a separate username) and correct password. Toggle "Save" on. Then slide the connection switch to ON.' },
              { q: 'Profile says "authentication failed"', a: 'Double-check your VoxVPN password. Go to reset it at the "Forgot password?" link above if needed. Ensure your subscription is still active.' },
              { q: 'VPN disconnects when app is closed', a: 'OpenVPN Connect must stay running in the background for the VPN to persist. iOS may kill background apps under memory pressure — just reopen and reconnect.' },
              { q: 'Profile disappeared after iOS update', a: 'iOS updates can reset VPN profiles. Re-import the .ovpn file from Files into OpenVPN Connect and re-authorize with Face ID / passcode.' },
            ].map((item, idx) => (
              <details key={idx} className="group rounded-lg" style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.05)' }}>
                <summary className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer list-none">
                  <span className="text-slate-300 text-xs font-semibold">{item.q}</span>
                  <ChevronRight size={14} className="text-slate-600 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="px-3 pb-3 text-slate-500 text-xs leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </motion.div>

        {/* iOS app preview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-6 rounded-2xl border border-violet-500/15 p-5"
          style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.04), rgba(124,58,237,0.02))' }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)' }}>
              <Rocket size={16} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">Prefer a dedicated app?</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                The native VoxVPN iOS app is in development — it will replace this manual setup with a one-tap connect
                experience. Until then, the OpenVPN Connect method above gives you the same AES-256 encrypted protection.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Help link */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs mb-2">Still need help setting up VoxVPN on iOS?</p>
          <Link to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all"
            style={{ borderColor: 'rgba(0,212,255,0.3)', color: '#00d4ff', background: 'rgba(0,212,255,0.05)' }}>
            <CheckCircle2 size={14} /> Contact Support
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}