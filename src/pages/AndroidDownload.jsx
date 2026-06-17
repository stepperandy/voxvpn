import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Download, Shield, Globe, Zap, CheckCircle2, Clock, Smartphone, Monitor, Apple } from 'lucide-react';

const APK_URL = '/downloads/VoxVPN-v1.0-APK.apk';

const features = [
  { icon: Shield, label: 'OpenVPN Protocol', desc: 'Military-grade AES-256 encryption' },
  { icon: Globe, label: 'Global Server Network', desc: '20+ countries worldwide' },
  { icon: Zap, label: 'One-click Connect', desc: 'Instant secure connection' },
];

const comingSoon = [
  { icon: Monitor, label: 'Windows', color: '#00d4ff' },
  { icon: Apple, label: 'iOS', color: '#A2AAAD' },
];

export default function AndroidDownload() {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = APK_URL;
    a.download = 'VoxVPN-v1.0-APK.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-[#00d4ff] text-xs font-semibold mb-5">
            <Smartphone size={12} /> Android App
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            VoxVPN for <span style={{ color: '#00d4ff' }}>Android</span>
          </h1>
          <p className="text-slate-400 text-base">Secure, private, and fast VPN for your Android device</p>
        </motion.div>

        {/* Main Download Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#0d1420] to-[#060c1a] p-8 mb-6"
          style={{ boxShadow: '0 0 60px rgba(52,168,83,0.08)' }}>

          {/* App icon + info */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(52,168,83,0.25), rgba(52,168,83,0.08))', border: '1px solid rgba(52,168,83,0.35)' }}>
              <Smartphone size={38} style={{ color: '#34A853' }} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">VoxVPN APK</h2>
              <p className="text-slate-400 text-sm mt-0.5">Direct install — no Play Store required</p>
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: 'Version', value: '1.0' },
              { label: 'Platform', value: 'Android 8.0+' },
              { label: 'VPN Protocol', value: 'OpenVPN' },
              { label: 'Status', value: 'Available Now' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-slate-500 text-xs mb-0.5">{label}</p>
                <p className="text-white font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(52,168,83,0.12)', border: '1px solid rgba(52,168,83,0.2)' }}>
                  <Icon size={14} style={{ color: '#34A853' }} />
                </div>
                <div>
                  <span className="text-white text-sm font-semibold">{label}</span>
                  <span className="text-slate-500 text-xs ml-2">{desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black text-lg text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 8px 30px rgba(34,197,94,0.35)' }}
          >
            <Download size={22} />
            Download VoxVPN for Android
          </button>

          <p className="text-slate-600 text-xs text-center mt-3">
            Enable "Install from unknown sources" in Android Settings → Security
          </p>
        </motion.div>

        {/* Coming Soon */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider text-center mb-3">Coming Soon</p>
          <div className="grid grid-cols-2 gap-3">
            {comingSoon.map(({ icon: Icon, label, color }) => (
              <div key={label} className="rounded-2xl border border-white/5 bg-[#0d1420] p-5 flex items-center gap-4 opacity-60">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{label}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} className="text-slate-500" />
                    <span className="text-slate-500 text-xs">Coming Soon</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust note */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-slate-700 text-xs">
            <Shield size={11} /> AES-256 Encryption · No-Logs Policy · VoxVPN
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}