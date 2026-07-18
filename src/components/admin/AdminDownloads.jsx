import React, { useState } from "react";
import {
  Download, Plus, X, Package, Cloud, Edit2, Trash2, CheckCircle,
  Monitor, Apple, Smartphone, HardDrive, Save, TrendingUp,
  Activity, Clock, BarChart3
} from "lucide-react";
import DownloadButtons from "@/components/DownloadButtons";

const PLATFORM_OPTIONS = [
  { value: "Windows", icon: Monitor, color: "#0ea5e9" },
  { value: "macOS", icon: Apple, color: "#a78bfa" },
  { value: "Android", icon: Smartphone, color: "#10b981" },
  { value: "iOS", icon: Apple, color: "#f59e0b" },
];

const FILTERS = ["All", "Free", "Paid", "Windows", "macOS", "Android", "iOS"];

export default function AdminDownloads() {
  const [installers, setInstallers] = useState([
    {
      id: "win-firebase",
      name: "VoxBase",
      platform: "Windows",
      category: "VoxDigits Installer",
      version: "v1.0.0",
      description: "Windows desktop installer. Stable, high-speed download mirror for fast, reliable installs.",
      url: "https://firebasestorage.googleapis.com/v0/b/voxvpn-setup-v2-2-exe.firebasestorage.app/o/VoxDigits%20Setup%201.0.0.exe?alt=media",
      isFree: true,
      price: "",
      icon: HardDrive,
      color: "#0ea5e9",
    },
    {
      id: "win-github",
      name: "VoxHub",
      platform: "Windows",
      category: "VoxDigits Installer",
      version: "v1.0.0",
      description: "Windows desktop installer. Alternative high-speed download mirror.",
      url: "https://github.com/stepperandy/voxvpn/releases/download/v1.0.0/VoxDigits.Setup.1.0.0.exe",
      isFree: true,
      price: "",
      icon: Monitor,
      color: "#38bdf8",
    },
    {
      id: "android-github",
      name: "VoxHub for Android",
      platform: "Android",
      category: "VoxDigits Installer",
      version: "1.0.0 (debug)",
      description: "Android APK debug build. Sideload onto Android devices — enable 'Install from unknown sources' in Settings.",
      url: "https://github.com/stepperandy/voxvpn/releases/download/aV1.0.0/VoxTelephony-Android-1.0.0-debug.apk",
      isFree: true,
      price: "",
      icon: Monitor,
      color: "#22c55e",
    },
    {
      id: "android-firebase",
      name: "VoxBase for Android",
      platform: "Android",
      category: "VoxDigits Installer",
      version: "1.0.0 (debug)",
      description: "Android APK debug build. High-speed download mirror for fast, reliable installs. Sideload onto Android devices — enable 'Install from unknown sources' in Settings.",
      url: "https://firebasestorage.googleapis.com/v0/b/voxvpn-setup-v2-2-exe.firebasestorage.app/o/VoxTelephony-Android-1.0.0-debug.apk?alt=media",
      isFree: true,
      price: "",
      icon: HardDrive,
      color: "#10b981",
    },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [statsTab, setStatsTab] = useState("overview");

  // Per-installer activity metrics (mock data for dashboard display)
  const installerStats = [
    { id: "win-firebase", downloads: 1247, lastDownload: "2h ago", successRate: 98.5, activeUsers: 312, trend: "+12%" },
    { id: "win-github", downloads: 893, lastDownload: "5h ago", successRate: 96.2, activeUsers: 201, trend: "+8%" },
    { id: "android-github", downloads: 2104, lastDownload: "12m ago", successRate: 99.1, activeUsers: 578, trend: "+24%" },
    { id: "android-firebase", downloads: 1856, lastDownload: "35m ago", successRate: 97.8, activeUsers: 489, trend: "+18%" },
  ];
  const [newInstaller, setNewInstaller] = useState({
    name: "",
    platform: "Windows",
    category: "",
    version: "v1.0.0",
    description: "",
    url: "",
    isFree: true,
    price: "",
  });

  const handleAdd = () => {
    if (!newInstaller.name || !newInstaller.url) return;
    const platformOpt = PLATFORM_OPTIONS.find(p => p.value === newInstaller.platform);
    setInstallers(prev => [...prev, {
      ...newInstaller,
      id: `inst-${Date.now()}`,
      icon: platformOpt?.icon || Monitor,
      color: platformOpt?.color || "#0ea5e9",
    }]);
    setNewInstaller({ name: "", platform: "Windows", category: "", version: "v1.0.0", description: "", url: "", isFree: true, price: "" });
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    setInstallers(prev => prev.filter(i => i.id !== id));
  };

  const handleDownload = (url) => {
    if (url) window.open(url, "_blank");
  };

  const handleSave = () => {
    const urlMap = {};
    installers.forEach(i => { urlMap[i.id] = i.url; });
    localStorage.setItem("vox_download_urls", JSON.stringify(urlMap));
    localStorage.setItem("vox_installers", JSON.stringify(installers));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const filtered = installers.filter(inst => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Free") return inst.isFree;
    if (activeFilter === "Paid") return !inst.isFree;
    return inst.platform === activeFilter;
  });

  const stats = [
    { label: "Total Packages", value: installers.length },
    { label: "Free", value: installers.filter(i => i.isFree).length },
    { label: "Paid", value: installers.filter(i => !i.isFree).length },
    { label: "Active", value: installers.filter(i => i.url).length },
  ];

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#131720] border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeFilter === filter
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Download
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              saved ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* Empty State or Grid */}
      {installers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#131720] border border-dashed border-slate-700 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-white mb-1">No installers yet</p>
          <p className="text-xs text-slate-500 mb-4">Add your first download package to get started.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Download
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inst) => {
            const Icon = inst.icon;
            return (
              <div key={inst.id} className="bg-[#131720] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 hover:border-slate-700 transition-colors">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${inst.color}18`, border: `1px solid ${inst.color}35` }}>
                    <Icon className="w-5 h-5" style={{ color: inst.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white truncate">{inst.name}</h3>
                      <button onClick={() => handleDelete(inst.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{inst.platform}{inst.category ? ` · ${inst.category}` : ""} · <span className="text-slate-600">{inst.version}</span></p>
                  </div>
                </div>

                {/* Description */}
                {inst.description && <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{inst.description}</p>}

                {/* Badge & Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${inst.isFree ? "text-[#00ff9d] bg-[#00ff9d]/10" : "text-[#d4af37] bg-[#d4af37]/10"}`}>
                    {inst.isFree ? "$ Free" : `$ ${inst.price || "0.00"}`}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[#00ff9d]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]" />
                    Active
                  </span>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(inst.url)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
                >
                  <Cloud className="w-4 h-4" />
                  DOWNLOAD
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowAdd(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#131720] border border-slate-700 rounded-2xl z-50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Add Download Package</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                <input value={newInstaller.name} onChange={e => setNewInstaller(p => ({ ...p, name: e.target.value }))} placeholder="VoxDigits Shield Agent" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Platform</label>
                  <select value={newInstaller.platform} onChange={e => setNewInstaller(p => ({ ...p, platform: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500">
                    {PLATFORM_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.value}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Version</label>
                  <input value={newInstaller.version} onChange={e => setNewInstaller(p => ({ ...p, version: e.target.value }))} placeholder="v1.0.0" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category / Mirror</label>
                <input value={newInstaller.category} onChange={e => setNewInstaller(p => ({ ...p, category: e.target.value }))} placeholder="GitHub Releases" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea value={newInstaller.description} onChange={e => setNewInstaller(p => ({ ...p, description: e.target.value }))} placeholder="Short description of the installer…" rows={2} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Download URL</label>
                <input type="url" value={newInstaller.url} onChange={e => setNewInstaller(p => ({ ...p, url: e.target.value }))} placeholder="https://…" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setNewInstaller(p => ({ ...p, isFree: !p.isFree }))} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${newInstaller.isFree ? "bg-[#00ff9d]/10 text-[#00ff9d]" : "bg-[#d4af37]/10 text-[#d4af37]"}`}>
                  {newInstaller.isFree ? "$ Free" : "$ Paid"}
                </button>
                {!newInstaller.isFree && (
                  <input value={newInstaller.price} onChange={e => setNewInstaller(p => ({ ...p, price: e.target.value }))} placeholder="0.00" className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500" />
                )}
              </div>
            </div>
            <button onClick={handleAdd} disabled={!newInstaller.name || !newInstaller.url} className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Plus className="w-4 h-4" />
              Add Package
            </button>
          </div>
        </>
      )}

      {/* Download Stats & Activity Metrics */}
      {installers.length > 0 && (
        <div className="bg-[#131720] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Download Stats & Activity</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStatsTab("overview")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${statsTab === "overview" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                Overview
              </button>
              <button
                onClick={() => setStatsTab("perInstaller")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${statsTab === "perInstaller" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                Per Installer
              </button>
            </div>
          </div>

          {statsTab === "overview" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Downloads", value: installerStats.reduce((s, i) => s + i.downloads, 0), icon: Download, color: "#0ea5e9" },
                { label: "Active Installations", value: installerStats.reduce((s, i) => s + i.activeUsers, 0), icon: Activity, color: "#10b981" },
                { label: "Avg Success Rate", value: (installerStats.reduce((s, i) => s + i.successRate, 0) / installerStats.length).toFixed(1) + "%", icon: CheckCircle, color: "#22c55e" },
                { label: "Top Trend", value: installerStats.reduce((max, i) => parseInt(i.trend) > parseInt(max.trend || "0") ? i.trend : max.trend, { trend: "0%" }).trend, icon: TrendingUp, color: "#a78bfa" },
              ].map((stat) => {
                const StatIcon = stat.icon;
                return (
                  <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}35` }}>
                        <StatIcon className="w-4 h-4" style={{ color: stat.color }} />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {installers.map((inst) => {
                const stat = installerStats.find(s => s.id === inst.id) || { downloads: 0, lastDownload: "—", successRate: 0, activeUsers: 0, trend: "0%" };
                const Icon = inst.icon;
                return (
                  <div key={inst.id} className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-colors">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${inst.color}18`, border: `1px solid ${inst.color}35` }}>
                      <Icon className="w-4 h-4" style={{ color: inst.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{inst.name}</p>
                      <p className="text-[10px] text-slate-500">{inst.platform} · {inst.version}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-5 text-right">
                      <div>
                        <p className="text-sm font-bold text-white">{stat.downloads.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-500 uppercase">Downloads</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-400">{stat.activeUsers}</p>
                        <p className="text-[9px] text-slate-500 uppercase">Active</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{stat.successRate}%</p>
                        <p className="text-[9px] text-slate-500 uppercase">Success</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] text-slate-400">{stat.lastDownload}</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </span>
                  </div>
                );
              })}
              {/* Mobile note */}
              <p className="text-[10px] text-slate-600 text-center sm:hidden pt-1">Scroll horizontally or use desktop view for full metrics.</p>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {installers.length > 0 && (
        <div className="bg-[#131720] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Subscriber Preview</h3>
          </div>
          <DownloadButtons showAll={true} />
        </div>
      )}
    </div>
  );
}