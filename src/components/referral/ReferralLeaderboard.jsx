import { Trophy, Crown } from 'lucide-react';

function maskEmail(email) {
  if (!email) return '—';
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const visible = name.substring(0, Math.min(2, name.length));
  return `${visible}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`;
}

export default function ReferralLeaderboard({ leaderboard, currentUserEmail }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-orange-400" />
          <h2 className="text-sm font-bold text-white">Top 20 Ambassadors</h2>
        </div>
        <p className="text-sm text-slate-500 text-center py-6">
          No ambassadors yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-orange-400" />
        <h2 className="text-sm font-bold text-white">Top 20 Ambassadors</h2>
        <span className="text-xs text-slate-500 ml-auto">Monthly rewards</span>
      </div>
      <div className="divide-y divide-slate-800/50">
        {leaderboard.map((entry) => {
          const isMe = entry.email === currentUserEmail;
          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 px-5 py-3 ${
                isMe ? 'bg-cyan-500/5' : ''
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  entry.rank === 1
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : entry.rank === 2
                      ? 'bg-gray-400/20 text-gray-300'
                      : entry.rank === 3
                        ? 'bg-orange-700/20 text-orange-500'
                        : 'bg-slate-800 text-slate-400'
                }`}
              >
                {entry.rank <= 3 ? (
                  <Crown className="w-3.5 h-3.5" />
                ) : (
                  entry.rank
                )}
              </span>
              <span
                className={`flex-1 text-sm ${
                  isMe ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                }`}
              >
                {maskEmail(entry.email)}
                {isMe && ' (You)'}
              </span>
              <span className="text-sm text-slate-400">
                {entry.activated_count}{' '}
                <span className="text-xs text-slate-600">activated</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}