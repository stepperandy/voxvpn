import { motion } from 'framer-motion';
import { MoreVertical, Trash2, Shield } from 'lucide-react';
import { useState } from 'react';

export default function UsersTable({ users }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Joined</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400">{user.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.role === 'admin' && <Shield size={16} className="text-cyan-400" />}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">{user.joined}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {expandedId === user.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
                        <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm">
                          <Trash2 size={16} className="text-rose-400" />
                          Delete User
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}