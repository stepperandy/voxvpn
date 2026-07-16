import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Loader2, BarChart3, Wifi, Phone } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

function buildLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), "MMM d"));
  }
  return days;
}

export default function DashboardCharts() {
  const [callLogs, setCallLogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [esims, setEsims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [logs, msgs, sims] = await Promise.all([
          base44.entities.CallLog.list("-created_date", 200),
          base44.entities.Message.list("-created_date", 500),
          base44.entities.ESim.list("-created_date", 100),
        ]);
        setCallLogs(logs || []);
        setMessages(msgs || []);
        setEsims(sims || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const days = buildLast30Days();

  // SMS/Calls per day
  const activityData = days.map(day => {
    const sms = messages.filter(m => {
      try { return format(parseISO(m.created_date), "MMM d") === day; } catch { return false; }
    }).length;
    const calls = callLogs.filter(c => {
      const d = c.call_date ? format(parseISO(c.call_date), "MMM d") : null;
      return d === day;
    }).length;
    const minutes = callLogs
      .filter(c => {
        const d = c.call_date ? format(parseISO(c.call_date), "MMM d") : null;
        return d === day;
      })
      .reduce((sum, c) => sum + Math.round((c.duration_seconds || 0) / 60), 0);
    return { date: day, SMS: sms, Calls: calls, Minutes: minutes };
  });

  // eSIM data usage per day (group by created date)
  const esimData = days.map(day => {
    const usage = esims
      .filter(e => {
        try { return format(parseISO(e.created_date), "MMM d") === day; } catch { return false; }
      })
      .reduce((sum, e) => {
        // find matching product GB via price_paid / estimate
        return sum + (e.price_paid ? parseFloat(e.price_paid) : 0);
      }, 0);
    return { date: day, Spend: parseFloat(usage.toFixed(2)) };
  });

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SMS & Calls Chart */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-white font-semibold text-sm">SMS & Calls — Last 30 Days</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} interval={6} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
            <Bar dataKey="SMS" fill="#06b6d4" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Calls" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Minutes trend */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Phone className="w-4 h-4 text-purple-400" />
          <h3 className="text-white font-semibold text-sm">Call Minutes — Last 30 Days</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={activityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="minutesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} interval={6} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Minutes" stroke="#8b5cf6" strokeWidth={2} fill="url(#minutesGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* eSIM Spend */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Wifi className="w-4 h-4 text-green-400" />
          <h3 className="text-white font-semibold text-sm">eSIM Spend ($) — Last 30 Days</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={esimData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="esimGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} interval={6} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Spend" stroke="#22c55e" strokeWidth={2} fill="url(#esimGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}