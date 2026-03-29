import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, QrCode, Monitor, Terminal, Smartphone, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const guideText = {
  windows: 'Download your VoxVPN setup file for Windows, open the recommended VPN client, import your profile, and connect to your selected VoxVPN server in seconds.',
  macos: 'Download your VoxVPN macOS setup, import the profile into the supported client, and connect securely to your selected VoxVPN server.',
  linux: 'Download your VoxVPN Linux profile, import it into your preferred Linux VPN client or supported command-line environment, and connect securely.',
  android: 'Download your VoxVPN Android setup on your phone or scan the mobile QR code for quick import, then connect to your selected VoxVPN server.',
  ios: 'Open this setup page on your iPhone or iPad or scan the QR code, import your VoxVPN profile, and connect securely to your selected server.',
};

const extraServers = [
  'VoxVPN Paris 01',
  'VoxVPN Madrid 01',
  'VoxVPN Milan 01',
  'VoxVPN Zurich 01',
  'VoxVPN Stockholm 01',
  'VoxVPN Dublin 01',
  'VoxVPN Singapore 01',
  'VoxVPN Tokyo 01',
  'VoxVPN Sydney 01',
  'VoxVPN Johannesburg 01',
];

const osLabel = (os) => {
  if (os === 'ios') return 'iPhone / iPad';
  if (os === 'macos') return 'macOS';
  return os.charAt(0).toUpperCase() + os.slice(1);
};

const osIcon = (os) => {
  if (os === 'windows') return <Monitor size={18} className="text-blue-400" />;
  if (os === 'macos') return <Monitor size={18} className="text-slate-300" />;
  if (os === 'linux') return <Terminal size={18} className="text-orange-400" />;
  return <Smartphone size={18} className="text-cyan-400" />;
};

const demoProfiles = [
  { os: 'windows', fileName: 'VoxVPN-Windows-Setup.conf',     downloadUrl: '#', qrUrl: '', serverName: 'VoxVPN New York 01' },
  { os: 'macos',   fileName: 'VoxVPN-macOS-Setup.conf',       downloadUrl: '#', qrUrl: '', serverName: 'VoxVPN London 01' },
  { os: 'linux',   fileName: 'VoxVPN-Linux-Setup.conf',       downloadUrl: '#', qrUrl: '', serverName: 'VoxVPN Frankfurt 01' },
  { os: 'android', fileName: 'VoxVPN-Android-Setup.conf',     downloadUrl: '#', qrUrl: '', serverName: 'VoxVPN Toronto 01' },
  { os: 'ios',     fileName: 'VoxVPN-iPhone-iPad-Setup.conf', downloadUrl: '#', qrUrl: '', serverName: 'VoxVPN Amsterdam 01' },
];

function ProfileCard({ profile, liveMode }) {
  const [showQr, setShowQr] = useState(false);
  const isMobile = profile.os === 'android' || profile.os === 'ios';

  return (
    <div className="rounded-[18px] border border-[#223654] bg-[rgba(6,14,26,0.45)] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0b1a2c] border border-[#24415f] flex items-center justify-center flex-shrink-0">
          {osIcon(profile.os)}
        </div>
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#4fd1ff] bg-[#0b1a2c] border border-[#24415f] rounded-full px-2.5 py-1">
            {osLabel(profile.os)}
          </span>
        </div>
      </div>

      <h3 className="text-white font-bold text-lg m-0">VoxVPN for {osLabel(profile.os)}</h3>
      <p className="text-[#a9b7c9] text-xs font-mono m-0">{profile.fileName}</p>
      {profile.serverName && (
        <p className="text-[#4fd1ff] text-xs font-semibold m-0">📡 {profile.serverName}</p>
      )}

      {/* Server location selector */}
      <div>
        <label className="text-[#a9b7c9] text-xs font-semibold block mb-1.5">More Server Locations</label>
        <select className="w-full px-3 py-2 rounded-xl bg-[#0b1a2c] border border-[#24415f] text-[#f4f8fc] text-sm focus:outline-none focus:border-[#0ea5ff]">
          <option value="">{profile.serverName || 'Select a server'}</option>
          {extraServers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <p className="text-[#a9b7c9] text-sm leading-relaxed m-0">{guideText[profile.os]}</p>

      {/* Benefits */}
      <div className="rounded-xl bg-[#0b1a2c] border border-[#24415f] px-4 py-3">
        <p className="text-[#4fd1ff] text-xs font-bold mb-2">Best for customers</p>
        <ul className="space-y-1">
          {[
            'Fast setup in minutes',
            'Secure connection on your own VoxVPN servers',
            'Quick download for the correct operating system',
            'Mobile QR import for faster activation',
            'Multiple server locations for better speed and flexibility',
          ].map(b => (
            <li key={b} className="flex items-center gap-2 text-[#a9b7c9] text-xs">
              <span className="w-1 h-1 bg-[#4fd1ff] rounded-full flex-shrink-0" />{b}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 mt-1">
        <a
          href={liveMode ? profile.downloadUrl : '#'}
          onClick={!liveMode ? (e) => e.preventDefault() : undefined}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-extrabold text-sm text-[#02111d] transition-all"
          style={{ background: 'linear-gradient(135deg,#0ea5ff,#4fd1ff)' }}
        >
          <Download size={13} /> Download Setup
        </a>
        {isMobile && (
          <button
            onClick={() => setShowQr(!showQr)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0b1627] text-[#4fd1ff] border border-[#28425f] text-sm font-bold rounded-xl transition-all hover:bg-[#0d1e38]"
          >
            <QrCode size={13} />
            {showQr ? 'Hide QR' : 'Mobile QR'}
            {showQr ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {isMobile && showQr && (
        <div className="border border-dashed border-[#315172] rounded-[14px] p-4 text-center bg-[#0b1524]">
          {profile.qrUrl ? (
            <img src={profile.qrUrl} alt={`${osLabel(profile.os)} QR`} className="w-40 h-40 mx-auto rounded-xl bg-white p-2 mb-2" />
          ) : (
            <div className="w-40 h-40 mx-auto rounded-xl bg-[#0d1e38] border border-[#223654] flex items-center justify-center mb-2">
              <QrCode size={48} className="text-[#315172]" />
            </div>
          )}
          <p className="text-[#a9b7c9] text-xs">Scan with your VoxVPN mobile app to import instantly.</p>
        </div>
      )}
    </div>
  );
}

export default function SetupPortal() {
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState('loading');
  const [welcomeText, setWelcomeText] = useState('Loading your secure setup details.');
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
      const res = await base44.functions.invoke('setupPortal', { token });
      const data = res.data;
      const mapped = (data.profiles || []).map(p => ({
        os: p.os,
        fileName: p.fileName || `VoxVPN-${p.os}-Setup.conf`,
        downloadUrl: `/api/setup/download/${token}?os=${p.os}`,
        serverName: p.serverName || 'VoxVPN Private Server',
        qrUrl: (p.os === 'android' || p.os === 'ios')
          ? `/api/setup/qr/${token}?os=${p.os}`
          : '',
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
    <div className="min-h-screen text-[#f4f8fc]" style={{ background: 'linear-gradient(180deg,#081120,#0d1b2f)', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* Hero */}
      <header className="px-4 sm:px-6 lg:px-8 pt-14 pb-8 border-b border-white/5"
        style={{ background: 'radial-gradient(circle at top right, rgba(79,209,255,.15), transparent 30%), radial-gradient(circle at top left, rgba(14,165,255,.18), transparent 24%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-5">
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/4c008ebc8_image.png"
              alt="VoxVPN"
              className="h-14 w-14 rounded-2xl"
            />
            <div>
              <p className="text-[#4fd1ff] text-sm font-bold uppercase tracking-[1.8px] m-0">VoxVPN Secure Network</p>
              <p className="text-[#a9b7c9] text-sm m-0">Powered by VoxVPN private infrastructure</p>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">Set Up VoxVPN On Any Device</h1>
          <p className="text-[#a9b7c9] text-base max-w-3xl leading-relaxed">
            Download your <span className="text-[#4fd1ff] font-bold">VoxVPN</span> connection profile, follow branded installation steps, and connect to our own secure server locations using the VoxVPN customer setup portal.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Main */}
          <div className="lg:col-span-2 space-y-5">

            {/* Status + token */}
            <div className="rounded-[20px] border border-[#223654] p-6 space-y-4"
              style={{ background: 'linear-gradient(180deg,#101d31,#13243d)', boxShadow: '0 20px 50px rgba(0,0,0,.35)' }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-2 ${
                    status === 'ok'
                      ? 'bg-[#123824] border border-[#38c172] text-[#bbf7d0]'
                      : status === 'loading'
                      ? 'bg-[#17263d] border border-[#324e74] text-[#c7d7ea]'
                      : 'bg-[#4f3b12] border border-[#f6c453] text-[#fde68a]'
                  }`}>
                    {status === 'loading' && <Loader2 size={11} className="inline animate-spin mr-1" />}
                    {status === 'ok' ? '✓ VoxVPN setup loaded' : status === 'loading' ? 'Checking your VoxVPN setup…' : 'Demo mode active'}
                  </span>
                  <h2 className="text-white font-bold text-xl m-0">VoxVPN Setup Center</h2>
                  <p className="text-[#a9b7c9] text-sm mt-1 m-0">{welcomeText}</p>
                </div>
                <p className="text-[#a9b7c9] text-xs mt-1">Supports <strong className="text-[#f4f8fc]">Windows · macOS · Linux · Android · iPhone/iPad</strong></p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Paste your secure VoxVPN access token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-[#223654] bg-[#091423] text-white placeholder-[#4a5e75] text-sm focus:outline-none focus:border-[#0ea5ff]"
                />
                <button
                  onClick={reloadWithToken}
                  className="px-5 py-3 bg-[#0b1627] text-[#4fd1ff] border border-[#28425f] text-sm font-bold rounded-xl transition-all hover:bg-[#0d1e38]"
                >
                  Load Setup
                </button>
              </div>

              {status === 'demo' && (
                <div className="p-4 rounded-[14px] bg-[#17263d] border border-[#324e74] text-[#c7d7ea] text-sm">
                  Demo mode is active. Connect your backend to load real buyer downloads, mobile QR import, assigned servers, and secure profile delivery.
                </div>
              )}
            </div>

            {/* Profiles */}
            {status === 'loading' ? (
              <div className="flex items-center justify-center py-24 gap-2 text-[#a9b7c9]">
                <Loader2 size={20} className="animate-spin text-[#0ea5ff]" />
                <span className="text-sm">Loading VoxVPN profiles...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profiles.map((p) => (
                  <ProfileCard key={p.os} profile={p} liveMode={liveMode} />
                ))}
              </div>
            )}

            {/* Flow + endpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-[16px] border border-[#223654] p-5 bg-[rgba(7,15,28,0.55)]">
                <h3 className="text-white font-bold text-sm mb-3">Branded Customer Flow</h3>
                <ol className="space-y-2 text-[#a9b7c9] text-sm list-decimal list-inside m-0 p-0">
                  {[
                    'Choose your VoxVPN plan and complete payment.',
                    'Your secure VPN access is provisioned on our own VoxVPN servers.',
                    'You receive an email with your secure setup link.',
                    'Open your setup page and download the right file for your device.',
                    'Import your setup and connect in minutes.',
                    'Choose from multiple server locations for speed, privacy, and flexibility.',
                  ].map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div className="rounded-[16px] border border-[#223654] p-5 bg-[rgba(7,15,28,0.55)]">
                <h3 className="text-white font-bold text-sm mb-3">Required Live Endpoints</h3>
                <ol className="space-y-2 list-decimal list-inside m-0 p-0">
                  {['/api/setup/portal?token=...', '/api/setup/download/:token', '/api/setup/qr/:token'].map((e, i) => (
                    <li key={i}><code className="text-xs bg-[#091423] border border-[#223654] px-2 py-0.5 rounded-lg text-[#4fd1ff] font-mono">{e}</code></li>
                  ))}
                </ol>
                <p className="text-[#a9b7c9] text-xs mt-3 m-0">These should return real setup files and QR imports from your VoxVPN infrastructure.</p>
              </div>
            </div>

            {/* Email preview */}
            <div className="rounded-[16px] border border-[#223654] p-5 bg-[#0b1627]">
              <h3 className="text-white font-bold text-sm mb-4">VoxVPN Buyer Email Preview</h3>
              <div className="rounded-[16px] border border-[#27405e] overflow-hidden bg-[#0d1728]">
                <div className="px-5 py-4 font-black text-lg text-[#041321]"
                  style={{ background: 'linear-gradient(135deg,#0ea5ff,#4fd1ff)' }}>
                  Your VoxVPN setup is ready
                </div>
                <div className="px-6 py-5 text-[#e8eef7] text-sm leading-relaxed space-y-3">
                  <p className="m-0">Hello,</p>
                  <p className="m-0">Thank you for your purchase. Your <strong>VoxVPN</strong> account has been provisioned successfully on our secure server network.</p>
                  <p className="m-0">You can now open your secure setup center to download your VoxVPN connection for all supported devices.</p>
                  <div>
                    <span className="inline-block px-5 py-2.5 rounded-xl font-extrabold text-sm text-[#02111d]"
                      style={{ background: 'linear-gradient(135deg,#0ea5ff,#4fd1ff)' }}>
                      Open My VoxVPN Setup
                    </span>
                  </div>
                  <p className="m-0">Inside the portal, you will find:</p>
                  <ul className="space-y-1.5 ml-4 m-0">
                    {['VoxVPN for Windows','VoxVPN for macOS','VoxVPN for Linux','VoxVPN for Android','VoxVPN for iPhone / iPad','Quick branded setup guides','Mobile QR import for easy activation'].map(item => (
                      <li key={item} className="flex items-center gap-2 text-[#a9b7c9]">
                        <span className="w-1.5 h-1.5 bg-[#4fd1ff] rounded-full flex-shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                  <p className="m-0">If you need support, reply to this email.</p>
                  <p className="m-0 font-bold text-white">VoxVPN Team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="rounded-[20px] border border-[#223654] p-6 space-y-4"
            style={{ background: 'linear-gradient(180deg,#101d31,#13243d)', boxShadow: '0 20px 50px rgba(0,0,0,.35)' }}>
            <h3 className="text-white font-bold m-0">VoxVPN Installation Interfaces</h3>
            {[
              { label: 'VoxVPN for Windows', desc: guideText.windows },
              { label: 'VoxVPN for macOS', desc: guideText.macos },
              { label: 'VoxVPN for Linux', desc: guideText.linux },
              { label: 'VoxVPN for Android', desc: guideText.android },
              { label: 'VoxVPN for iPhone / iPad', desc: guideText.ios },
            ].map(({ label, desc }) => (
              <div key={label} className="rounded-[14px] border border-[#223654] p-4 bg-[rgba(7,15,28,0.55)]">
                <p className="text-white text-sm font-bold mb-1 m-0">{label}</p>
                <p className="text-[#a9b7c9] text-xs leading-relaxed m-0">{desc}</p>
              </div>
            ))}
            <div className="rounded-[14px] border border-[#223654] p-4 bg-[rgba(7,15,28,0.55)]">
              <p className="text-white text-sm font-bold mb-3 m-0">Additional Server Locations</p>
              <div className="flex flex-wrap gap-1.5">
                {extraServers.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-1 rounded-full bg-[#0b1a2c] border border-[#24415f] text-[#4fd1ff] font-semibold">{s}</span>
                ))}
              </div>
            </div>

            <div className="rounded-[14px] border border-[#234a69] p-4 bg-[#0d2638]">
              <p className="text-[#4fd1ff] text-sm font-bold mb-1 m-0">Support</p>
              <a href="mailto:support@voxdigits.com" className="text-[#a9b7c9] text-xs hover:text-[#4fd1ff] transition-colors">support@voxdigits.com</a>
            </div>
          </aside>
        </div>
      </main>

      <footer className="text-center py-8 text-[#a9b7c9] text-sm border-t border-[#223654]">
        © 2026 VoxVPN / VoxDigits. Secure setup delivery portal.
      </footer>
    </div>
  );
}