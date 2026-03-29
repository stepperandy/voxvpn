import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, QrCode, Monitor, Apple, Terminal, Smartphone, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const guideText = {
  windows: 'Download the setup file, install the VPN client on Windows, then import the downloaded configuration.',
  macos: 'Download the setup file, install the VPN client on macOS, then import and activate your connection.',
  linux: 'Download the configuration and import it into your Linux VPN client or supported command-line workflow.',
  android: 'Download the file on your Android device or scan the QR code from another screen, then import it in the app.',
  ios: 'Open this setup page on your iPhone or iPad or scan the QR code, then import the profile in the app.',
};

const osLabel = (os) => {
  if (os === 'ios') return 'iPhone / iPad';
  if (os === 'macos') return 'macOS';
  return os.charAt(0).toUpperCase() + os.slice(1);
};

const osIcon = (os) => {
  if (os === 'windows') return <Monitor size={18} className="text-blue-400" />;
  if (os === 'macos') return <Apple size={18} className="text-slate-300" />;
  if (os === 'linux') return <Terminal size={18} className="text-orange-400" />;
  return <Smartphone size={18} className="text-cyan-400" />;
};

const demoProfiles = [
  { os: 'windows', fileName: 'voxvpn-windows.conf', downloadUrl: '#', qrUrl: '' },
  { os: 'macos', fileName: 'voxvpn-macos.conf', downloadUrl: '#', qrUrl: '' },
  { os: 'linux', fileName: 'voxvpn-linux.conf', downloadUrl: '#', qrUrl: '' },
  { os: 'android', fileName: 'voxvpn-android.conf', downloadUrl: '#', qrUrl: '' },
  { os: 'ios', fileName: 'voxvpn-ios.conf', downloadUrl: '#', qrUrl: '' },
];

function ProfileCard({ profile, liveMode }) {
  const [showQr, setShowQr] = useState(false);
  const isMobile = profile.os === 'android' || profile.os === 'ios';

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
          {osIcon(profile.os)}
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400/70">{osLabel(profile.os)}</span>
          <p className="text-white font-semibold text-sm">{osLabel(profile.os)} Setup</p>
        </div>
      </div>

      <p className="text-slate-500 text-xs font-mono">{profile.fileName}</p>
      <p className="text-slate-400 text-xs leading-relaxed">{guideText[profile.os]}</p>

      <div className="flex flex-wrap gap-2 mt-auto">
        <a
          href={liveMode ? profile.downloadUrl : '#'}
          onClick={!liveMode ? (e) => e.preventDefault() : undefined}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl transition-all"
        >
          <Download size={13} /> Download Setup
        </a>
        {isMobile && (
          <button
            onClick={() => setShowQr(!showQr)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-all"
          >
            <QrCode size={13} />
            {showQr ? 'Hide QR' : 'Show QR'}
            {showQr ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {isMobile && showQr && (
        <div className="border border-dashed border-white/10 rounded-xl p-4 text-center bg-white/2">
          {profile.qrUrl ? (
            <img src={profile.qrUrl} alt={`${osLabel(profile.os)} QR`} className="w-40 h-40 mx-auto rounded-xl bg-white p-2 mb-2" />
          ) : (
            <div className="w-40 h-40 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
              <QrCode size={48} className="text-slate-600" />
            </div>
          )}
          <p className="text-slate-500 text-xs">Use your mobile VPN app to scan and import.</p>
        </div>
      )}
    </div>
  );
}

export default function SetupPortal() {
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ok | demo
  const [welcomeText, setWelcomeText] = useState('Loading your setup details...');
  const [tokenInput, setTokenInput] = useState('');
  const [liveMode, setLiveMode] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');

  const loadPortal = async (token) => {
    setStatus('loading');
    if (!token) {
      setWelcomeText('No secure token detected. Showing demo setup portal.');
      setProfiles(demoProfiles);
      setLiveMode(false);
      setStatus('demo');
      return;
    }
    setTokenInput(token);
    try {
      const res = await fetch(`/api/setup/portal?token=${encodeURIComponent(token)}`);
      if (!res.ok) throw new Error('Portal fetch failed');
      const data = await res.json();
      const mapped = (data.profiles || []).map(p => ({
        os: p.os,
        fileName: p.fileName || `${p.os}.conf`,
        downloadUrl: p.downloadUrl,
        qrUrl: (p.os === 'android' || p.os === 'ios') && p.qrToken
          ? `/api/setup/qr/${p.qrToken}`
          : (p.qrUrl || ''),
      }));
      setWelcomeText(`Setup ready for ${data.email || 'buyer'}${data.orderId ? ` · Order: ${data.orderId}` : ''}`);
      setProfiles(mapped);
      setLiveMode(true);
      setStatus('ok');
    } catch {
      setWelcomeText('Unable to load live data. Showing demo portal instead.');
      setProfiles(demoProfiles);
      setLiveMode(false);
      setStatus('demo');
    }
  };

  useEffect(() => { loadPortal(urlToken); }, []);

  const reloadWithToken = () => {
    if (!tokenInput.trim()) return;
    const next = new URL(window.location.href);
    next.searchParams.set('token', tokenInput.trim());
    window.location.href = next.toString();
  };

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {/* Hero */}
      <header className="bg-gradient-to-br from-[#0a1e3a] to-[#0e2d56] border-b border-white/5 px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-6xl mx-auto">
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">VoxVPN</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Your VPN Setup Portal</h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            Download your secure VPN configuration, follow setup steps for every operating system, and access your mobile QR code from one place.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Status + token input */}
            <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 space-y-4">
              <div className="flex items-center gap-3 flex-wrap justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {status === 'loading' && <Loader2 size={14} className="animate-spin text-cyan-400" />}
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      status === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      status === 'loading' ? 'bg-white/5 text-slate-400 border border-white/10' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {status === 'ok' ? '✓ Secure setup loaded' : status === 'loading' ? 'Checking setup portal…' : 'Demo mode active'}
                    </span>
                  </div>
                  <h2 className="text-white font-bold text-lg">Buyer Access</h2>
                  <p className="text-slate-400 text-sm">{welcomeText}</p>
                </div>
                <p className="text-slate-600 text-xs">Supports <span className="text-slate-400">Windows · macOS · Linux · Android · iPhone/iPad</span></p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Paste portal token here if needed"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={reloadWithToken}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-semibold rounded-xl transition-all"
                >
                  Load Token
                </button>
              </div>

              {status === 'demo' && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-xs">
                  Demo mode is active. Connect your backend endpoints to load real buyer downloads and QR codes.
                </div>
              )}
            </div>

            {/* Profiles */}
            {status === 'loading' ? (
              <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin text-cyan-400" />
                <span className="text-sm">Loading setup profiles...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profiles.map((p) => (
                  <ProfileCard key={p.os} profile={p} liveMode={liveMode} />
                ))}
              </div>
            )}

            {/* How it works + endpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-5">
                <h3 className="text-cyan-400 font-bold text-sm mb-3 uppercase tracking-wider">How It Works</h3>
                <ol className="space-y-2 text-slate-400 text-sm list-decimal list-inside">
                  {['Customer completes payment.','Backend provisions VPN profile(s).','Email sent with secure setup link.','Buyer opens portal and downloads setup.','Buyer follows installation guide for their device.'].map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-5">
                <h3 className="text-cyan-400 font-bold text-sm mb-3 uppercase tracking-wider">Backend Endpoints</h3>
                <p className="text-slate-500 text-xs mb-3">This page expects these live endpoints:</p>
                <ol className="space-y-2 list-decimal list-inside">
                  {['GET /api/setup/portal?token=...','GET /api/setup/download/:token','GET /api/setup/qr/:token'].map((e, i) => (
                    <li key={i}><code className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-slate-300 font-mono">{e}</code></li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Email preview */}
            <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
              <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Buyer Email Preview</h3>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-[#0a1e3a] to-[#0e2d56] px-5 py-4">
                  <p className="text-white font-bold text-base">Your VoxVPN setup is ready</p>
                </div>
                <div className="bg-[#090d18] p-6 space-y-3 text-slate-300 text-sm leading-relaxed">
                  <p>Hello,</p>
                  <p>Thank you for your purchase. Your VPN access has been provisioned successfully.</p>
                  <p>You can now open your secure setup portal to download your VPN setup for all supported devices.</p>
                  <div>
                    <span className="inline-block px-5 py-2.5 bg-cyan-500 text-black text-xs font-bold rounded-xl">Open My Setup Portal</span>
                  </div>
                  <p>Inside the portal, you will find:</p>
                  <ul className="space-y-1.5 ml-4">
                    {['Windows setup','macOS setup','Linux setup','Android setup','iPhone / iPad setup','Quick installation guidelines'].map(item => (
                      <li key={item} className="flex items-center gap-2 text-slate-400"><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0" />{item}</li>
                    ))}
                  </ul>
                  <p>If you need support, reply to this email.</p>
                  <p className="font-bold text-white">VoxVPN Team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 space-y-4">
            <h3 className="text-white font-bold">Support & Setup Tips</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Use the correct app on each OS, then import the downloaded configuration file or scan the QR code on mobile.</p>

            {[
              { label: 'Windows', desc: 'Install the VPN client, open it, and import the downloaded setup file.' },
              { label: 'macOS', desc: 'Install the client, import your config, then activate the tunnel.' },
              { label: 'Linux', desc: 'Import the config into your preferred client or use command line setup.' },
              { label: 'Android', desc: 'Download the file directly on the phone or scan the QR code from a desktop screen.' },
              { label: 'iPhone / iPad', desc: 'Open this page on the device or scan the QR code using the VPN app\'s import feature.' },
            ].map(({ label, desc }) => (
              <div key={label} className="p-4 rounded-xl bg-white/3 border border-white/5">
                <p className="text-white text-sm font-semibold mb-1">{label}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}

            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
              <p className="text-cyan-400 text-sm font-semibold mb-1">Support Email</p>
              <a href="mailto:support@voxdigits.com" className="text-slate-400 text-xs hover:text-cyan-400 transition-colors">support@voxdigits.com</a>
            </div>
          </aside>
        </div>
      </main>

      <footer className="text-center py-8 text-slate-600 text-xs border-t border-white/5 mt-6">
        © 2026 VoxVPN / VoxDigits. Secure setup delivery portal.
      </footer>
    </div>
  );
}