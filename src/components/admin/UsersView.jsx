import { useEffect, useState } from 'react';
import { Loader2, Search, Shield, Trash2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => {
    base44.entities.User.list().then(setUsers).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg('');
    try {
      await base44.users.inviteUser(inviteEmail, 'user');
      setInviteMsg('Invitation sent!');
      setInviteEmail('');
    } catch (err) {
      setInviteMsg('Failed: ' + err.message);
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite + Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleInvite} className="flex gap-2 flex-1">
          <input
            type="email"
            placeholder="Invite user by email..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0d1120] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={inviting}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Invite
          </button>
        </form>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl bg-[#0d1120] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 w-full sm:w-56"
          />
        </div>
      </div>

      {inviteMsg && (
        <p className={`text-sm ${inviteMsg.startsWith('Failed') ? 'text-rose-400' : 'text-cyan-400'}`}>{inviteMsg}</p>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1120] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span className="text-sm">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {u.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="text-white text-sm font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm hidden md:table-cell">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-violet-500/10 text-violet-400' : 'bg-white/5 text-slate-400'
                      }`}>
                        {u.role === 'admin' && <Shield size={11} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-sm hidden lg:table-cell">
                      {u.created_date ? format(new Date(u.created_date), 'MMM d, yyyy') : '—'}
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-500 text-sm">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}