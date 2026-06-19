import { Download, Smartphone, Shield, Lock, Zap, Star, AlertTriangle, Settings, LogIn, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';

const APK_VERSION = '1.0.1';
const APK_FILENAME = 'VoxVPN-v1.0.1.apk';
const APK_DIRECT_URL = 'https://github.com/stepperandy/voxvpn/releases/download/V1.0/VoxVPN-v1.0.1.apk';

const STEPS = [
  { icon: Download, label: 'Download the APK', desc: 'Tap the button above to download VoxVPN-V1.0.apk' },
  { icon: Settings, label: 'Allow Unknown Sources', desc: 'Go to Settings → Security → enable "Install from Unknown Sources" if prompted' },
  { icon: Smartphone, label: 'Install VoxVPN', desc: 'Open the downloaded APK file and follow the installation prompts' },
  { icon: LogIn, label: 'Log In', desc: 'Use the same email & password you created at voxvpn.net' },
  { icon: Wifi, label: 'Select & Connect', desc: 'Choose a server from the list and tap Connect to go private' },
];

export default function PublicDownload() {

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#060c1a' }}>
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.15)' }}>
            <Shield size={16} style={{ color: '#00d4ff' }} />
          </div>
          <span className="text-white font-bold text-lg">VoxVPN</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/auth-login" className="text-slate-400 hover:text-white text-sm transition-colors">Sign In</Link>
          <Link to="/pricing" className="px-4 py-1.5 rounded-lg text-sm font-semibold text-black" style={{ background: '#00d4ff' }}>Get Plan</Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-12 max-w-2xl mx-auto w-full">

        {/* Hero */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'rgba(52,168,83,0.12)', border: '1px solid rgba(52,168,83,0.3)' }}>
          <Smartphone size={36} style={{ color: '#34A853' }} />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(52,168,83,0.15)', border: '1px solid rgba(52,168,83,0.3)', color: '#34A853' }}>
            <Star size={10} fill="#34A853" /> LATEST VERSION
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
            v{APK_VERSION}
          </span>
        </div>

        <h1 className="text-white text-3xl md:text-4xl font-black text-center mb-3">VoxVPN for Android</h1>
        <p className="text-slate-400 text-center max-w-md mb-2 text-sm leading-relaxed">
          Secure, private, and fast VPN for all Android devices. Download the APK directly — no app store required.
        </p>

        <div className="flex items-center gap-4 mb-8 text-xs text-slate-500 flex-wrap justify-center">
          <span className="flex items-center gap-1"><Shield size={11} className="text-cyan-500" /> AES-256 Encrypted</span>
          <span className="flex items-center gap-1"><Lock size={11} className="text-cyan-500" /> No-Logs Policy</span>
          <span className="flex items-center gap-1"><Zap size={11} className="text-cyan-500" /> Android 8.0+</span>
        </div>

        {/* Download Button */}
        <a
          href={APK_DIRECT_URL}
          download={APK_FILENAME}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-black font-black text-base mb-6 transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #34A853, #2d8f47)', boxShadow: '0 0 30px rgba(52,168,83,0.3)' }}
        >
          <Download size={20} />
          Download VoxVPN {APK_VERSION} · APK
        </a>

        {/* Unknown Sources Warning */}
        <div className="w-full rounded-xl p-4 flex items-start gap-3 mb-8" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300/80 text-xs leading-relaxed">
            <strong className="text-amber-300">Note:</strong> Since this APK is not from the Play Store, Android may ask you to allow installation from unknown sources. This is normal and safe — VoxVPN is signed and verified.
          </p>
        </div>

        {/* Installation Steps */}
        <div className="w-full mb-10">
          <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-black">5</span>
            Installation Instructions
          </h2>
          <div className="space-y-3">
            {STEPS.map(({ icon: Icon, label, desc }, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex-shrink-0 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-black" style={{ background: '#00d4ff', minWidth: 24 }}>{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.08)' }}>
                    <Icon size={15} style={{ color: '#00d4ff' }} />
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="w-full grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Shield, label: 'Verified & Signed', color: '#00d4ff' },
            { icon: Lock, label: 'No Data Collection', color: '#34A853' },
            { icon: Zap, label: 'Free to Download', color: '#a78bfa' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Icon size={18} style={{ color }} />
              <span className="text-slate-400 text-xs">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-slate-700 text-xs text-center">
          Already have an account? <Link to="/dashboard" className="text-cyan-600 hover:text-cyan-400 transition-colors">Go to Dashboard</Link>
        </p>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-white/5">
        <p className="text-slate-700 text-xs">© 2024 VoxVPN · <Link to="/privacy-policy" className="hover:text-slate-500 transition-colors">Privacy</Link> · <Link to="/terms-of-service" className="hover:text-slate-500 transition-colors">Terms</Link></p>
      </footer>
    </div>
  );
}