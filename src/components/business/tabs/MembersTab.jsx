import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Users, UserPlus, Loader2, Trash2, Mail, X, CheckCircle2, AlertCircle, Shield, Clock } from 'lucide-react';

export default function MembersTab({ data, onRefresh }) {
  const { teamMembers, client } = data;
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', job_title: '', member_role: 'team_member' });
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInviteMsg(null);
    try {
      const res = await base44.functions.invoke('inviteTeamMember', inviteForm);
      if (res.data?.error) throw new Error(res.data.error);
      setInviteMsg({ type: 'success', text: res.data?.message || 'Team member invited' });
      setInviteForm({ email: '', full_name: '', job_title: '', member_role: 'team_member' });
      setTimeout(() => { setShowInvite(false); setInviteMsg(null); onRefresh(); }, 1500);
    } catch (err) {
      setInviteMsg({ type: 'error', text: err.message });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this team member? They will lose access to the business VPN.')) return;
    setRemovingId(memberId);
    try {
      const res = await base44.functions.invoke('removeTeamMember', { member_id: memberId });
      if (res.data?.error) throw new Error(res.data.error);
      onRefresh();
    } catch (err) {
      alert('Failed to remove: ' + err.message);
    } finally {
      setRemovingId(null);
    }
  };

  const roleColors = {
    client_admin: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    agency_admin: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    team_member: 'text-slate-400 bg-white/5 border-white/10',
    admin: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white font-black text-xl">Team Members</h2>
          <p className="text-slate-500 text-xs mt-1">
            {teamMembers?.length || 0} of {client?.max_users || 10} seats used
          </p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded-xl transition-all">
          <UserPlus size={15} /> Invite Member
        </button>
      </div>

      {/* Seat usage bar */}
      <div className="rounded-xl bg-[#0d1420] border border-white/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-xs">Seat Usage</span>
          <span className="text-white text-xs font-bold">{teamMembers?.length || 0} / {client?.max_users || 10}</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all"
            style={{ width: `${Math.min(100, ((teamMembers?.length || 0) / (client?.max_users || 10)) * 100)}%` }} />
        </div>
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="rounded-2xl border border-cyan-500/20 bg-[#0d1420] p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Invite Team Member</h3>
                <button onClick={() => setShowInvite(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
              </div>

              {inviteMsg && (
                <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                  inviteMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}>
                  {inviteMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {inviteMsg.text}
                </div>
              )}

              <form onSubmit={handleInvite} className="space-y-3">
                <input type="email" required value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Email address *"
                  className="w-full px-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
                <input value={inviteForm.full_name} onChange={e => setInviteForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Full name (optional)"
                  className="w-full px-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
                <input value={inviteForm.job_title} onChange={e => setInviteForm(f => ({ ...f, job_title: e.target.value }))}
                  placeholder="Job title (optional)"
                  className="w-full px-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
                <select value={inviteForm.member_role} onChange={e => setInviteForm(f => ({ ...f, member_role: e.target.value }))}
                  className="w-full px-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                  <option value="team_member">Team Member</option>
                  <option value="client_admin">Admin (full access)</option>
                </select>
                <button type="submit" disabled={inviting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold disabled:opacity-50">
                  {inviting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  {inviting ? 'Sending Invite...' : 'Send Invite'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members list */}
      <div className="space-y-2">
        {teamMembers?.length > 0 ? teamMembers.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-[#0d1420]">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Users size={16} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm truncate">{m.full_name || m.email}</p>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${roleColors[m.role] || roleColors.team_member}`}>
                  {m.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-500 text-xs truncate">{m.email}</p>
              {m.last_login && (
                <p className="text-slate-600 text-[10px] flex items-center gap-1 mt-0.5">
                  <Clock size={9} /> Last active: {new Date(m.last_login).toLocaleDateString()}
                </p>
              )}
            </div>
            {m.role !== 'client_admin' && (
              <button onClick={() => handleRemove(m.id)} disabled={removingId === m.id}
                className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-colors disabled:opacity-50">
                {removingId === m.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            )}
          </motion.div>
        )) : (
          <div className="rounded-2xl border border-white/5 bg-[#0d1420] py-16 text-center">
            <Users size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No team members yet.</p>
            <p className="text-slate-600 text-xs mt-1">Click "Invite Member" to add your first team member.</p>
          </div>
        )}
      </div>
    </div>
  );
}