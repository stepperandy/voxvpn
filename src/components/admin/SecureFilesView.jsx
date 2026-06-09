import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Trash2, Download, Loader2, ShieldCheck, Copy, CheckCircle2, FileText, Smartphone, Monitor, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FILE_TYPES = [
  { id: 'windows_exe', label: 'Windows Installer (.exe)', icon: Monitor, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'android_apk', label: 'Android APK (.apk)', icon: Smartphone, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'other', label: 'Other File', icon: FileText, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
];

export default function SecureFilesView() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null); // file type being uploaded
  const [copiedId, setCopiedId] = useState(null);
  const [signedUrls, setSignedUrls] = useState({});
  const [loadingUrl, setLoadingUrl] = useState(null);
  const fileRefs = { windows_exe: useRef(), android_apk: useRef(), other: useRef() };

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Download.list();
      // Only show entries that have file_url from private storage (uploaded, not external URLs)
      const secure = list.filter(d => d.notes?.startsWith('[SECURE]'));
      setFiles(secure);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e, fileTypeId) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(fileTypeId);
    try {
      // Rename to .bin so the platform accepts any file type
      const safeName = file.name.replace(/\.(exe|apk)$/i, '.bin');
      const renamedFile = new File([file], safeName, { type: 'application/octet-stream' });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: renamedFile });
      const file_url = file_uri; // file_uri is already in correct mp/private/... format
      const typeMeta = FILE_TYPES.find(t => t.id === fileTypeId);
      // Ensure filename has correct extension (.exe or .apk)
      let finalName = file.name;
      if (fileTypeId === 'windows_exe' && !finalName.toLowerCase().endsWith('.exe')) {
        finalName = finalName.replace(/\.[^.]*$/, '.exe');
      } else if (fileTypeId === 'android_apk' && !finalName.toLowerCase().endsWith('.apk')) {
        finalName = finalName.replace(/\.[^.]*$/, '.apk');
      }
      
      await base44.entities.Download.create({
        name: finalName,
        platform: fileTypeId === 'windows_exe' ? 'Windows' : fileTypeId === 'android_apk' ? 'Android' : 'Linux',
        file_url,
        version: new Date().toISOString().split('T')[0],
        is_active: true,
        is_free: false,
        notes: `[SECURE] ${typeMeta.label} — uploaded ${new Date().toLocaleString()}`,
        description: `Secure installer uploaded on ${new Date().toLocaleDateString()}`,
      });
      await load();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file entry?')) return;
    await base44.entities.Download.delete(id);
    setFiles(f => f.filter(x => x.id !== id));
  };

  const getSignedUrl = async (file) => {
    setLoadingUrl(file.id);
    try {
      const res = await base44.functions.invoke('createSignedDownloadUrl', { file_uri: file.file_url });
      const url = res.data?.signed_url;
      if (url) setSignedUrls(prev => ({ ...prev, [file.id]: url }));
    } catch (err) {
      alert('Could not get signed URL: ' + err.message);
    } finally {
      setLoadingUrl(null);
    }
  };

  const copyUrl = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={20} className="text-cyan-400" />
            <h2 className="text-2xl font-black text-white">Secure Setup Files</h2>
          </div>
          <p className="text-slate-400 text-sm">Upload installer files directly to private storage. Subscribers get authenticated signed download links — no external hosting needed.</p>
        </div>
      </div>

      {/* Upload Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FILE_TYPES.map((ft) => {
          const Icon = ft.icon;
          const isUploading = uploading === ft.id;
          return (
            <div key={ft.id} className="rounded-2xl border border-white/5 bg-[#0d1120] p-5 flex flex-col items-center gap-3 text-center">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${ft.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{ft.label}</p>
                <p className="text-slate-600 text-xs mt-0.5">Stored privately, served via signed URL</p>
              </div>
              <input
                ref={fileRefs[ft.id]}
                type="file"
                className="hidden"
                onChange={e => handleUpload(e, ft.id)}
              />
              <button
                onClick={() => fileRefs[ft.id].current.click()}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 transition-all disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-slate-600 text-xs uppercase tracking-widest">Uploaded Files</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* File List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin text-cyan-400" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] py-16 text-center">
          <Lock size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No secure files uploaded yet.</p>
          <p className="text-slate-700 text-xs mt-1">Use the upload cards above to add installer files.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {files.map((f, idx) => {
              const ft = FILE_TYPES.find(t =>
                t.id === (f.platform === 'Windows' ? 'windows_exe' : f.platform === 'Android' ? 'android_apk' : 'other')
              ) || FILE_TYPES[2];
              const Icon = ft.icon;
              const signed = signedUrls[f.id];
              return (
                <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  className="rounded-2xl border border-white/5 bg-[#0d1120] p-5">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${ft.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{f.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{f.platform} · Uploaded {f.version}</p>
                      {f.notes && <p className="text-slate-700 text-[10px] mt-1 truncate">{f.notes.replace('[SECURE] ', '')}</p>}

                      {/* Signed URL */}
                      {signed && (
                        <div className="mt-2 flex items-center gap-2">
                          <input readOnly value={signed} className="flex-1 px-2 py-1 rounded-lg bg-[#060910] border border-white/10 text-cyan-300 text-[10px] font-mono truncate" />
                          <button onClick={() => copyUrl(f.id, signed)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-all">
                            {copiedId === f.id ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                            {copiedId === f.id ? 'Copied!' : 'Copy'}
                          </button>
                          <button
                            onClick={async () => {
                              const blobRes = await fetch(signed);
                              const blob = await blobRes.blob();
                              const blobUrl = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = blobUrl;
                              a.download = f.name; // original .exe/.apk name
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-all">
                            <Download size={12} /> Test
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => getSignedUrl(f)} disabled={loadingUrl === f.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-all disabled:opacity-50">
                        {loadingUrl === f.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                        Get Link
                      </button>
                      <button onClick={() => handleDelete(f.id)}
                        className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/20 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Info box */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-amber-300 text-xs font-semibold mb-1 flex items-center gap-1.5"><Lock size={12} /> How Secure Downloads Work</p>
        <ul className="text-amber-200/60 text-xs space-y-1 list-disc ml-4">
          <li>Files are stored in private Base44 storage — not publicly accessible via direct URL.</li>
          <li>When a subscriber clicks download, the backend verifies their active subscription, then generates a <strong>time-limited signed URL</strong> (5 min expiry).</li>
          <li>The "Get Link" button above generates a temporary admin preview link.</li>
          <li>To serve downloads to users, set the <strong>file_url</strong> of the active Windows/Android Download record to the private URI shown here.</li>
        </ul>
      </div>
    </div>
  );
}