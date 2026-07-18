import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ icon: Icon, label, value, change, trend, color = "cyan" }) {
  const colorClasses = {
    cyan: "bg-cyan-500/10 text-cyan-400",
    green: "bg-green-500/10 text-green-400",
    purple: "bg-purple-500/10 text-purple-400",
    orange: "bg-orange-500/10 text-orange-400",
  };

  const isPositive = trend === "up";

  return (
    <div className="bg-gray-950/60 border border-gray-800/60 rounded-xl p-6 hover:border-gray-700/60 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}%
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );
}