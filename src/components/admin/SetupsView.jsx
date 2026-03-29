import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Check, X, ExternalLink, Loader2, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLATFORMS = ['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Router'];

const platformColors = {
  Windows: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  macOS: 'text-slate-300 bg-slate-500/10 border-slate-500/20',
  Linux: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  iOS: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Android: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Router: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

const emptyForm = {
  name: '', description: '', platform: 'Windows', version: '',
  file_url: '', price: 0, is_free: true, is_active: true, notes: '',
  type: 'setup',
};

function SetupForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || emptyForm);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-cyan-500/20 bg-[#0a1020] p-6 space-y-4">
      <h3 className="text-white font-semibold">{initial?.id ? 'Edit Setup' : 'New Setup'}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="VoxVPN Windows Setup"
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">Platform *</label>
          <select value={form.platform} onChange={e => set('platform', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">Version</label>
          <input value={form.version} onChange={e => set('version', e.target.value)} placeholder="2.1.0"
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">Setup Portal URL *</label>
          <input value={form.file_url} onChange={e => set('file_url', e.target.value)} placeholder="https://app.example.com/setup?token=ABC123"
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
            placeholder="Brief description shown to users..."
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">Admin Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
            placeholder="Internal notes (not visible to users)..."
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="accent-cyan-500" />
          <span className="text-slate-400 text-sm">Active (visible)</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} disabled={saving || !form.name || !form.file_url}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30 text-black font-bold text-sm rounded-xl transition-all">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {initial?.id ? 'Update' : 'Create'}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 border border-white/10 text-slate-400 hover:text-white text-sm rounded-xl transition-all">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

export default function SetupsView() {
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.Download.filter({ type: 'setup' }, '-updated_date').then(setSetups).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    if (editing?.id) {
      await base44.entities.Download.update(editing.id, form);
    } else {
      await base44.entities.Download.create(form);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this setup?')) return;
    await base44.entities.Download.delete(id);
    load();
  };

  const handleEdit = (d) => { setEditing(d); setShowForm(true); };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Setups', value: setups.length, color: 'text-white' },
          { label: 'Active', value: setups.filter(d => d.is_active).length, color: 'text-cyan-400' },
          { label: 'Inactive', value: setups.filter(d => !d.is_active).length, color: 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-[#0d1120] border border-white/5 px-4 py-4">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Top controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-white font-semibold">Setup Portals</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded-xl transition-all flex-shrink-0"
        >
          <Plus size={15} /> Add Setup
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <SetupForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* Setups grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin text-cyan-400" />
          <span className="text-sm">Loading setups...</span>
        </div>
      ) : setups.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] py-20 text-center">
          <Link size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No setups yet. Click "Add Setup" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {setups.map((d, idx) => {
            const colorCls = platformColors[d.platform] || 'text-slate-400 bg-white/5 border-white/10';
            return (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`rounded-2xl border bg-[#0d1120] p-5 flex flex-col gap-4 transition-all hover:shadow-lg ${
                  d.is_active ? 'border-white/5 hover:border-white/10' : 'border-rose-500/10 opacity-60'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                      <Link size={18} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm leading-tight">{d.name}</p>
                      <p className="text-slate-500 text-[11px]">{d.platform} {d.version && `· v${d.version}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(d)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-cyan-400 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-rose-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {d.description && <p className="text-slate-400 text-xs leading-relaxed">{d.description}</p>}

                {/* Status */}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold w-fit ${
                  d.is_active ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {d.is_active ? 'Active' : 'Inactive'}
                </span>

                {/* Link button */}
                <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-all">
                  <ExternalLink size={12} /> Open Portal
                </a>

                {/* Notes */}
                {d.notes && (
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-slate-600 text-[10px]">📝 {d.notes}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}