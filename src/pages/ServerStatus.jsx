import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity, CheckCircle, AlertCircle, Wrench, Clock, Server } from "lucide-react";

const REGIONS = [
  { name: "North America (US/CA)", status: "operational", latency: "42ms" },
  { name: "Europe (UK/EU)", status: "operational", latency: "58ms" },
  { name: "Asia Pacific (AU/SG)", status: "operational", latency: "85ms" },
  { name: "Africa (ZA/GH)", status: "operational", latency: "72ms" },
];

const SERVICES = [
  { name: "Virtual Number Provisioning", status: "operational" },
  { name: "Voice Call Routing", status: "operational" },
  { name: "SMS Gateway", status: "operational" },
  { name: "eSIM Activation", status: "operational" },
  { name: "Web Dashboard", status: "operational" },
  { name: "Mobile API", status: "operational" },
  { name: "Payment Processing", status: "operational" },
];

const INCIDENTS = [
  { date: "Jun 15, 2026", title: "Brief SMS delivery delay in EU region", severity: "minor", status: "resolved", desc: "Some SMS messages experienced up to 5-minute delays. Resolved within 32 minutes." },
  { date: "May 03, 2026", title: "eSIM activation timeout for Airalo provider", severity: "minor", status: "resolved", desc: "Intermittent activation timeouts. Root cause identified as upstream API rate limiting. Mitigation deployed." },
];

const STATUS_CONFIG = {
  operational: { label: "Operational", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle },
  degraded: { label: "Degraded Performance", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: AlertCircle },
  partial: { label: "Partial Outage", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: AlertCircle },
  major: { label: "Major Outage", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertCircle },
  maintenance: { label: "Under Maintenance", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Wrench },
};

export default function ServerStatus() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const allOperational = [...REGIONS, ...SERVICES].every(s => s.status === "operational");

  return (
    <div className="min-h-screen bg-[#060f1a] text-white">
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Hero / Overall Status */}
      <section className="relative overflow-hidden py-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${allOperational ? "bg-green-500/10 border border-green-500/20" : "bg-yellow-500/10 border border-yellow-500/20"} mb-6`}>
            <Activity className={`w-8 h-8 ${allOperational ? "text-green-400" : "text-yellow-400"}`} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {allOperational ? "All Systems Operational" : "Some Systems Experiencing Issues"}
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Real-time status of VoxDigits services and infrastructure.
          </p>
          <p className="text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" /> Last checked: {now.toLocaleTimeString()}
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-6">Service Status</h2>
          <div className="space-y-2">
            {SERVICES.map(svc => {
              const cfg = STATUS_CONFIG[svc.status];
              const Icon = cfg.icon;
              return (
                <div key={svc.name} className={`flex items-center justify-between p-4 rounded-xl border ${cfg.border} ${cfg.bg}`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                    <span className="text-sm font-medium text-white">{svc.name}</span>
                  </div>
                  <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Regional Status */}
      <section className="py-12 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Server className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold">Regional Status</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {REGIONS.map(region => {
              const cfg = STATUS_CONFIG[region.status];
              const Icon = cfg.icon;
              return (
                <div key={region.name} className={`p-4 rounded-xl border ${cfg.border} ${cfg.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{region.name}</span>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={cfg.color}>{cfg.label}</span>
                    <span className="text-gray-500">Latency: {region.latency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Uptime */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-6">90-Day Uptime</h2>
          <div className="flex items-center gap-4">
            <div className="flex gap-0.5 flex-1">
              {[...Array(90)].map((_, i) => (
                <div key={i} className="flex-1 h-10 rounded-sm bg-green-500/40 hover:bg-green-400 transition-colors" title="Operational" />
              ))}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">99.98%</p>
              <p className="text-xs text-gray-500">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Incident History */}
      <section className="py-12 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-6">Incident History</h2>
          <div className="space-y-4">
            {INCIDENTS.map((inc, i) => (
              <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm">{inc.title}</h3>
                  <span className="text-xs text-gray-500">{inc.date}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">{inc.desc}</p>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${inc.severity === "minor" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                    {inc.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400">
                    {inc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}