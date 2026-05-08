import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Monitor, Terminal, Smartphone, Loader2, Shield, Globe, CheckCircle2, Wifi } from 'lucide-react';

const PLATFORMS = [
  { id: 'windows', label: 'Windows', icon: <Monitor size={18} className="text-blue-400" /> },
  { id: 'macos',   label: 'macOS',   icon: <Monitor size={18} className="text-slate-300" /> },
  { id: 'linux',   label: 'Linux',   icon: <Terminal size={18} className="text-orange-400" /> },
  { id: 'android', label: 'Android', icon: <Smartphone size={18} className="text-emerald-400" /> },
  { id: 'ios',     label: 'iPhone / iPad', icon: <Smartphone size={18} className="text-cyan-400" /> },
  { id: 'router',  label: 'Router',  icon: <Wifi size={18} className="text-violet-400" /> },
];

export default function SetupPortal() {
  const [status, setStatus] = useState('loading');
  const [welcomeText, setWelcomeText] = useState('Loading your secure setup details.');
  const [tokenInput, setTokenInput] = useState('');
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [downloading, setDownloading] = useState(null); // 'wireguard' | 'openvpn'
  const [liveMode, setLiveMode] = useState(false);
  const [token, setToken] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');

  const loadPortal = async (tok) => {
    setStatus('loading');
    if (!tok) {
      setWelcomeText('No secure token detected. Showing demo setup portal.');
      // Demo servers
      setServers([
        { id: 'demo-1', name: 'New York', country: 'US', load: 22 },
        { id: 'demo-2', name: 'London', country: 'UK', load: 45 },
        { id: 'demo-3', name: 'Frankfurt', country: 'DE', load: 31 },
        { id: 'demo-4', name: 'Singapore', country: 'SG', load: 58 },
        { id: 'demo-5', name: 'Tokyo', country: 'JP', load: 19 },
        { id: 'demo-6', name: 'Amsterdam', country: 'NL', load: 37 },
      ]);
      setLiveMode(false);
      setStatus('demo');
      return;
    }
    setToken(tok);
    setTokenInput(tok);
    try {
      const res = await base44.functions.invoke('setupPortal', { token: tok });
      const data = res.data;
      setWelcomeText(`Setup ready for ${data.email || 'buyer'} · Plan: ${data.plan || 'Basic'}`);
      setServers(data.servers || []);
      setLiveMode(true);
      setStatus('ok');
    } catch {
      setWelcomeText('Unable to load live data. Showing demo portal instead.');
      setServers([
        { id: 'demo-1', name: 'New York', country: 'US', load: 22 },
        { id: 'demo-2', name: 'London', country: 'UK', load: 45 },
        { id: 'demo-3', name: 'Frankfurt', country: 'DE', load: 31 },
      ]);
      setLiveMode(false);
      setStatus('demo');
    }
  };

  useEffect(() => { loadPortal(urlToken); }, []);

  const handleDownload = async (proto) => {
    if (!liveMode) {
      alert('Please load your setup with a valid token first.');
      return;
    }
    if (!selectedServer) { alert('Please select a server first.'); return; }
    if (!selectedPlatform) { alert('Please select your device platform.'); return; }

    setDownloading(proto);
    try {
      const res = await base44.functions.invoke('setupPortal', {
        token,
        server_id: selectedServer.id,
        platform: selectedPlatform,
        proto,
      });
      const { url, fileName } = res.data;
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Download failed: ' + err.message);
    } finally {
      setDownloading(null);
    }
  };

  const reloadWithToken = () => {
    if (!tokenInput.trim()) return;
    const next = new URL(window.location.href);
    next.searchParams.set('token', tokenInput.trim());
    window.location.href = next.toString();
  };

  const loadColor = (load) => {
    if (load < 40) return 'text-emerald-400';
    if (load < 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="min-h-screen text-[#f4f8fc]" style={{ background: 'linear-gradient(180deg,#081120,#0d1b2f)', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* Hero */}
      <header className="px-4 sm:px-6 lg:px-8 pt-14 pb-8 border-b border-white/5"
        style={{ background: 'radial-gradient(circle at top right, rgba(79,209,255,.15), transparent 30%), radial-gradient(circle at top left, rgba(14,165,255,.18), transparent 24%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-5">
            <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="h-16 w-auto" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">Set Up VoxVPN On Any Device</h1>
          <p className="text-[#a9b7c9] text-base max-w-2xl leading-relaxed">
            Choose your server, choose your device, download your config — and connect in minutes.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8 pb-20 max-w-4xl mx-auto space-y-6">

        {/* Status + token */}
        <div className="rounded-[20px] border border-[#223654] p-6 space-y-4"
          style={{ background: 'linear-gradient(180deg,#101d31,#13243d)', boxShadow: '0 20px 50px rgba(0,0,0,.35)' }}>
          <div>
            <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-3 ${
              status === 'ok' ? 'bg-[#123824] border border-[#38c172] text-[#bbf7d0]'
              : status === 'loading' ? 'bg-[#17263d] border border-[#324e74] text-[#c7d7ea]'
              : 'bg-[#4f3b12] border border-[#f6c453] text-[#fde68a]'
            }`}>
              {status === 'loading' && <Loader2 size={11} className="inline animate-spin mr-1" />}
              {status === 'ok' ? '✓ Setup loaded' : status === 'loading' ? 'Loading…' : 'Demo mode'}
            </span>
            <p className="text-[#a9b7c9] text-sm">{welcomeText}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Paste your secure VoxVPN access token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-[#223654] bg-[#091423] text-white placeholder-[#4a5e75] text-sm focus:outline-none focus:border-[#0ea5ff]"
            />
            <button onClick={reloadWithToken}
              className="px-5 py-3 bg-[#0b1627] text-[#4fd1ff] border border-[#28425f] text-sm font-bold rounded-xl hover:bg-[#0d1e38] transition-all">
              Load Setup
            </button>
          </div>
        </div>

        {status === 'loading' ? (
          <div className="flex items-center justify-center py-24 gap-2 text-[#a9b7c9]">
            <Loader2 size={20} className="animate-spin text-[#0ea5ff]" />
            <span className="text-sm">Loading VoxVPN setup…</span>
          </div>
        ) : (
          <>
            {/* Step 1 — Pick Server */}
            <div className="rounded-[18px] border border-[#223654] p-6"
              style={{ background: 'linear-gradient(180deg,#101d31,#13243d)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#0ea5ff] text-[#02111d] text-xs font-black flex items-center justify-center flex-shrink-0">1</span>
                <h2 className="text-white font-bold text-base m-0">Choose a Server</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {servers.map(s => (
                  <button key={s.id}
                    onClick={() => setSelectedServer(s)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-left transition-all ${
                      selectedServer?.id === s.id
                        ? 'border-[#0ea5ff] bg-[#0ea5ff]/10'
                        : 'border-[#223654] bg-[#0b1627] hover:border-[#324e74]'
                    }`}>
                    <Globe size={14} className="text-[#4fd1ff] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{s.name}</p>
                      <p className="text-[#a9b7c9] text-xs">{s.country} · <span className={loadColor(s.load || 0)}>{s.load || 0}% load</span></p>
                    </div>
                    {selectedServer?.id === s.id && <CheckCircle2 size={14} className="text-[#0ea5ff] ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 — Pick Platform */}
            <div className="rounded-[18px] border border-[#223654] p-6"
              style={{ background: 'linear-gradient(180deg,#101d31,#13243d)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#0ea5ff] text-[#02111d] text-xs font-black flex items-center justify-center flex-shrink-0">2</span>
                <h2 className="text-white font-bold text-base m-0">Choose Your Device</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLATFORMS.map(p => (
                  <button key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-left transition-all ${
                      selectedPlatform === p.id
                        ? 'border-[#0ea5ff] bg-[#0ea5ff]/10'
                        : 'border-[#223654] bg-[#0b1627] hover:border-[#324e74]'
                    }`}>
                    {p.icon}
                    <span className="text-white text-sm font-semibold">{p.label}</span>
                    {selectedPlatform === p.id && <CheckCircle2 size={14} className="text-[#0ea5ff] ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3 — Download */}
            <div className="rounded-[18px] border border-[#223654] p-6"
              style={{ background: 'linear-gradient(180deg,#101d31,#13243d)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#0ea5ff] text-[#02111d] text-xs font-black flex items-center justify-center flex-shrink-0">3</span>
                <h2 className="text-white font-bold text-base m-0">Download Config</h2>
              </div>

              {selectedServer && selectedPlatform ? (
                <div className="space-y-3">
                  <p className="text-[#a9b7c9] text-sm">
                    Downloading for <strong className="text-white">{PLATFORMS.find(p => p.id === selectedPlatform)?.label}</strong> → <strong className="text-[#4fd1ff]">{selectedServer.name}, {selectedServer.country}</strong>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleDownload('wireguard')} disabled={!!downloading}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm text-[#02111d] disabled:opacity-50 transition-all"
                      style={{ background: 'linear-gradient(135deg,#0ea5ff,#4fd1ff)' }}>
                      {downloading === 'wireguard' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      WireGuard (.conf)
                    </button>
                    <button onClick={() => handleDownload('openvpn')} disabled={!!downloading}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-[#4fd1ff] border border-[#28425f] bg-[#0b1627] hover:bg-[#0d1e38] disabled:opacity-50 transition-all">
                      {downloading === 'openvpn' ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                      OpenVPN (.ovpn)
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[#4a5e75] text-sm">Select a server and device above to enable download.</p>
              )}
            </div>
          </>
        )}

        {/* Support */}
        <div className="rounded-[14px] border border-[#234a69] p-4 bg-[#0d2638] text-center">
          <p className="text-[#4fd1ff] text-sm font-bold mb-1">Need help?</p>
          <a href="mailto:support@voxdigits.com" className="text-[#a9b7c9] text-xs hover:text-[#4fd1ff] transition-colors">support@voxdigits.com</a>
        </div>
      </main>

      <footer className="text-center py-8 text-[#a9b7c9] text-sm border-t border-[#223654]">
        © 2026 VoxDigits Communications LLC. Secure setup delivery portal. www.voxvpn.net
      </footer>
    </div>
  );
}