import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link2, Save, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

const DEFAULT_URL = 'https://github.com/stepperandy/VoxVPN-Setup-1.5/releases/tag/v1.5';

export default function DownloadLinkManager() {
  const [link, setLink] = useState(DEFAULT_URL);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // We store the global download link override on a "config" subscription record keyed to admin@voxvpn.net
  // More simply: we just let admins set per-user override via subscription record
  // This component shows/edits the default global fallback stored in a known subscription record

  const handleSave = async () => {
    setSaving(true);
    try {
      // Store in localStorage as a simple override for now; 
      // for production you'd store in a Settings entity
      localStorage.setItem('voxvpn_download_link', link);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('voxvpn_download_link');
    if (stored) setLink(stored);
  }, []);

  return (
    <div className="rounded-xl border border-white/5 bg-[#0d1120] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Link2 size={16} className="text-cyan-400" />
        <h3 className="text-white font-bold text-sm">Download Link</h3>
      </div>
      <p className="text-slate-500 text-xs">The URL users are sent to when they click "Download VoxVPN for Windows". Update this when you release a new version.</p>
      
      <div className="space-y-2">
        <input
          type="url"
          value={link}
          onChange={e => setLink(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-[#0a1020] text-white text-sm focus:outline-none focus:border-cyan-500/40"
          placeholder="https://github.com/..."
        />
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs transition-all disabled:opacity-50">
            {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
            {saved ? 'Saved!' : 'Save Link'}
          </button>
          <a href={link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs transition-colors">
            <ExternalLink size={11} /> Test Link
          </a>
        </div>
      </div>
    </div>
  );
}