import { motion } from 'framer-motion';
import { LogIn, UserPlus, Settings, Trash2, Heart } from 'lucide-react';

const iconMap = {
  login: LogIn,
  signup: UserPlus,
  settings: Settings,
  delete: Trash2,
  like: Heart
};

export default function ActivityLog({ activities }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, idx) => {
          const Icon = iconMap[activity.type] || LogIn;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-slate-800">
                <Icon size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-slate-400 text-sm">{activity.user}</p>
              </div>
              <span className="text-slate-400 text-xs whitespace-nowrap">{activity.time}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}