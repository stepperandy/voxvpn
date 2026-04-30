import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Handshake, CheckCircle2, AlertCircle, Clock, Search, Edit2, DollarSign, X } from 'lucide-react';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  approved:  { label: 'Approved',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected:  { label: 'Rejected',  cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  suspended: { label: 'Suspended', cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

function EditModal({ record, onClose, onSave }) {
  const [form, setForm] = useState({
    status: record.status,
    commission_rate: record.commission_rate || 20,
    notes: record.notes || '',
    total_clicks: record.total_clicks || 0,
    total_conversions: record.total_conversions || 0,
    total_earnings: record.total_earnings || 0,
    paid_earnings: record.paid_earnings || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.AffiliatePartner.update(record.id, form);
    onSave();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1120] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">Edit: {record.full_name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs font-semibold mb-1.5 block">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-xs font-semibold mb-1.5 block">Commission Rate (%)</label>
            <input type="number" value={form.commission_rate} onChange={e => setForm(f => ({ ...f, commission_rate: Number(e.target.value) }))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs font-semibold mb-1.5 block">Total Clicks</label>
              <input type="number" value={form.total_clicks} onChange={e => setForm(f => ({ ...f, total_clicks: Number(e.target.value) }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold mb-1.5 block">Conversions</label>
              <input type="number" value={form.total_conversions} onChange={e => setForm(f => ({ ...f, total_conversions: Number(e.target.value) }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold mb-1.5 block">Total Earned ($)</label>
              <input type="number" value={form.total_earnings} onChange={e => setForm(f => ({ ...f, total_earnings: Number(e.target.value) }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold mb-1.5 block">Paid Out ($)</label>
              <input type="number" value={form.paid_earnings} onChange={e => setForm(f => ({ ...f, paid_earnings: Number(e.target.value) }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs font-semibold mb-1.5 block">Admin Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 text-slate-300 rounded-xl text-sm font-semibold hover:border-white/20 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AffiliatesView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.AffiliatePartner.list('-created_date', 200);
    setRecords(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = records.filter(r => {
    const matchSearch = !search || r.full_name?.toLowerCase().includes(search.toLowerCase()) || r.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchType = filterType === 'all' || r.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const quickApprove = async (id) => {
    await base44.entities.AffiliatePartner.update(id, { status: 'approved' });
    load();
  };

  const quickReject = async (id) => {
    await base44.entities.AffiliatePartner.update(id, { status: 'rejected' });
    load();
  };

  const counts = {
    total: records.length,
    pending: records.filter(r => r.status === 'pending').length,
    approved: records.filter(r => r.status === 'approved').length,
    affiliates: records.filter(r => r.type === 'affiliate').length,
    partners: records.filter(r => r.type === 'partner').length,
  };

  return (
    <div>
      {editing && <EditModal record={editing} onClose={() => setEditing(null)} onSave={() => { setEditing(null); load(); }} />}

      <div className="mb-6">
        <h1 className="text-white font-bold text-2xl mb-1">Affiliates & Partners</h1>
        <p className="text-slate-500 text-sm">Review applications, approve/reject, manage commissions.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: counts.total, color: 'text-white' },
          { label: 'Pending', value: counts.pending, color: 'text-amber-400' },
          { label: 'Approved', value: counts.approved, color: 'text-emerald-400' },
          { label: 'Affiliates', value: counts.affiliates, color: 'text-cyan-400' },
          { label: 'Partners', value: counts.partners, color: 'text-violet-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl border border-white/5 bg-[#0d1120] text-center">
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…"
            className="w-full pl-9 pr-4 py-2.5 bg-[#0d1120] border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-[#0d1120] border border-white/10 rounded-xl text-white text-sm focus:outline-none">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-[#0d1120] border border-white/10 rounded-xl text-white text-sm focus:outline-none">
          <option value="all">All Types</option>
          <option value="affiliate">Affiliates</option>
          <option value="partner">Partners</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl">
          <p className="text-slate-500 text-sm">No records found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const isPending = r.status === 'pending';
            return (
              <div key={r.id} className="flex flex-wrap items-start sm:items-center gap-4 p-4 rounded-xl bg-[#0d1120] border border-white/5 hover:border-white/10 transition-all">
                {/* Type icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${r.type === 'partner' ? 'bg-violet-500/10' : 'bg-cyan-500/10'}`}>
                  {r.type === 'partner' ? <Handshake size={16} className="text-violet-400" /> : <Users size={16} className="text-cyan-400" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-[180px]">
                  <p className="text-white font-semibold text-sm">{r.full_name}</p>
                  <p className="text-slate-500 text-xs">{r.user_email}</p>
                  <p className="text-slate-600 text-xs mt-0.5 capitalize">{r.type} · Code: <span className="font-mono text-slate-400">{r.affiliate_code || '—'}</span></p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-xs text-slate-500">
                  <div className="text-center">
                    <p className="text-white font-bold">{r.commission_rate || 20}%</p>
                    <p>Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-emerald-400 font-bold">${(r.total_earnings || 0).toFixed(2)}</p>
                    <p>Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-cyan-400 font-bold">{r.total_conversions || 0}</p>
                    <p>Conversions</p>
                  </div>
                </div>

                {/* Status */}
                <span className={`px-3 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${sc.cls}`}>{sc.label}</span>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isPending && (
                    <>
                      <button onClick={() => quickApprove(r.id)}
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all" title="Approve">
                        <CheckCircle2 size={15} />
                      </button>
                      <button onClick={() => quickReject(r.id)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all" title="Reject">
                        <AlertCircle size={15} />
                      </button>
                    </>
                  )}
                  <button onClick={() => setEditing(r)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all" title="Edit">
                    <Edit2 size={15} />
                  </button>
                </div>

                {/* Promotion method */}
                {r.promotion_method && (
                  <p className="w-full text-slate-600 text-xs italic mt-1 truncate">{r.promotion_method}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}