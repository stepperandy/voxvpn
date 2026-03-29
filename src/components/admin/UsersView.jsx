import { useEffect, useState } from 'react';
import { Loader2, Search, Shield, Trash2, UserPlus, RefreshCw, Filter, Mail, Crown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState({ type: '', text: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [selected, setSelected] = useState([]);

  const loadUsers = () => {
    setLoading(true);
    base44.entities.User.list().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg({ type: '', text: '' });
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteMsg({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
      setInviteEmail('');
      loadUsers();
    } catch (err) {
      setInviteMsg({ type: 'error', text: 'Failed: ' + err.message });
    } finally {
      setInviting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map(u => u.id));
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role !== 'admin').length;

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-white' },
          { label: 'Admins', value: adminCount, color: 'text-violet-400' },
          { label: 'Regular Users', value: userCount, color: 'text-cyan-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-[#0d1120] border border-white/5 px-5 py-4">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Invite panel */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={16} className="text-cyan-400" />
          <h3 className="text-white font-semibold text-sm">Invite New User</h3>
        </div>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Email address..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={inviting || !inviteEmail}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30 text-black text-sm font-bold rounded-xl transition-all flex items-center gap-2"
          >
            {inviting ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
            Send Invite
          </button>
        </form>
        <AnimatePresence>
          {inviteMsg.text && (
            <motion.p
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mt-3 text-sm ${inviteMsg.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}
            >
              {inviteMsg.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0d1120] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'admin', 'user'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-[#0d1120] text-slate-500 border border-white/5 hover:text-white'
              }`}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
          <button onClick={loadUsers} className="p-2 rounded-xl bg-[#0d1120] border border-white/5 text-slate-500 hover:text-white transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
          <span className="text-cyan-400 text-sm font-medium">{selected.length} selected</span>
          <button onClick={() => setSelected([])} className="text-slate-500 hover:text-white text-xs ml-auto">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1120] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span className="text-sm">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-5 py-3.5 text-left">
                    <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll} className="rounded accent-cyan-500" />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">User</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest hidden md:table-cell">Email</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Joined</th>
                  <th className="px-5 py-3.5 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`border-b border-white/4 transition-colors ${selected.includes(u.id) ? 'bg-cyan-500/5' : 'hover:bg-white/2'}`}
                  >
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} className="rounded accent-cyan-500" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {u.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{u.full_name}</p>
                          <p className="text-slate-600 text-xs md:hidden">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm hidden md:table-cell">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-white/5 text-slate-400 border border-white/5'
                      }`}>
                        {u.role === 'admin' ? <Crown size={10} /> : <User size={10} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-sm hidden lg:table-cell">
                      {u.created_date ? format(new Date(u.created_date), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { if (window.confirm(`Send password reset to ${u.email}?`)) {} }}
                          title="Send email"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-cyan-400 transition-colors"
                        >
                          <Mail size={14} />
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => { if (window.confirm(`Make ${u.full_name} an admin?`)) base44.entities.User.update(u.id, { role: 'admin' }).then(loadUsers); }}
                            title="Promote to admin"
                            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-violet-400 transition-colors"
                          >
                            <Shield size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-600 text-sm">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer */}
        {!loading && (
          <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-slate-600 text-xs">Showing {filtered.length} of {users.length} users</span>
            <span className="text-slate-600 text-xs">Page 1 of 1</span>
          </div>
        )}
      </div>
    </div>
  );
}