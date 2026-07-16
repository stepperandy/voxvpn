import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Download, CheckCircle, ArrowDownToLine, ArrowRight,
  Monitor, HardDrive, KeyRound, Copy, Cpu, Smartphone, Apple,
  Lock, Shield, Loader2
} from "lucide-react";
import DownloadSuccessOverlay from "@/components/DownloadSuccessOverlay";

const PLATFORM_CONFIG = {
  Windows: { icon: Monitor, color: "#00a3ff" },
  Android: { icon: Smartphone, color: "#00c853" },
  iOS: { icon: Apple, color: "#8a2be2" },
};

function detectOS() {
  if (typeof navigator === "undefined") return "Windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "Android";
  if (/iphone|ipad|ipod/.test(ua)) return "iOS";
  if (/mac os x|macintosh/.test(ua)) return "Windows";
  if (/win/.test(ua)) return "Windows";
  return "Windows";
}

const INSTALLERS = [
  {
    id: "win-voxhub",
    platform: "Windows",
    label: "VoxHub for Windows",
    version: "v1.0.0",
    badge: "EXE",
    icon: HardDrive,
    url: "https://github.com/stepperandy/voxvpn/releases/download/v1.0.0/VoxDigits.Setup.1.0.0.exe",
    color: "#00a3ff",
    available: true,
  },
  {
    id: "win-voxbase",
    platform: "Windows",
    label: "VoxBase for Windows",
    version: "v1.0.0",
    badge: "EXE",
    icon: Cpu,
    url: "https://firebasestorage.googleapis.com/v0/b/voxvpn-setup-v2-2-exe.firebasestorage.app/o/VoxDigits%20Setup%201.0.0.exe?alt=media",
    color: "#8a2be2",
    available: true,
  },
  {
    id: "android-voxhub",
    platform: "Android",
    label: "VoxHub for Android",
    version: "v1.0.0",
    badge: "APK",
    icon: Smartphone,
    url: "https://github.com/stepperandy/voxvpn/releases/download/aV1.0.0/VoxTelephony-Android-1.0.0-debug.apk",
    color: "#00c853",
    available: true,
  },
  {
    id: "android-voxtelefony",
    platform: "Android",
    label: "VoxBase for Android",
    version: "v1.0.0",
    badge: "APK",
    icon: Smartphone,
    url: "https://github.com/stepperandy/voxvpn/releases/download/aV1.0.0/VoxTelephony-Android-1.0.0-debug.apk",
    color: "#00a3ff",
    available: true,
  },
];

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loginToken, setLoginToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(null);
  const [osFilter, setOsFilter] = useState(() => detectOS());
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const canDownload = isAdmin || hasActiveSubscription;

  useEffect(() => {
    base44.auth.me()
      .then(async u => {
        if (u?.email) setUserEmail(u.email);
        if (u?.role === "admin") {
          setIsAdmin(true);
          setCheckingAccess(false);
          return;
        }
        try {
          const subs = await base44.entities.Subscription.filter(
            { user_email: u?.email || "", status: "active" },
            "-updated_date",
            1
          );
          setHasActiveSubscription(Array.isArray(subs) && subs.length > 0);
        } catch { /* treat as no subscription */ }
        setCheckingAccess(false);
      })
      .catch(() => setCheckingAccess(false));
  }, []);

  const availablePlatforms = [...new Set(INSTALLERS.map(i => i.platform))];
  const filteredInstallers = INSTALLERS.filter(i => i.platform === osFilter);

  const triggerDownload = (url, label) => {
    if (!url || !canDownload) return;
    window.open(url, "_blank", "noopener,noreferrer");
    setSuccess(label || "Your installer");
  };

  const generateToken = () => {
    const token = "vtx_" + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    setLoginToken(token);
    setShowToken(true);
    setCopied(false);
  };

  const copyToken = () => {
    navigator.clipboard.writeText(loginToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b111a] text-white pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">

        {/* Dashboard Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Dashboard</h1>
          </div>
          <Link to="/" className="text-xs text-[#8b949e] hover:text-cyan-400 transition-colors hidden md:block">
            ← Back to Home
          </Link>
        </div>

        {/* ── Downloads Section ── */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "#111a26", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <Download className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Download VoxDigits</h2>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,163,255,0.15)", color: "#00a3ff" }}>
              LATEST
            </span>
            {isAdmin && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "rgba(0,200,83,0.15)", color: "#00c853" }}>
                <Shield className="w-3 h-3" /> ADMIN ACCESS
              </span>
            )}
          </div>

          {/* Access status banner */}
          {!checkingAccess && !canDownload && (
            <div className="mt-4 mb-2 flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(255,165,0,0.08)", border: "1px solid rgba(255,165,0,0.25)" }}>
              <Lock className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Active subscription required</p>
                <p className="text-xs text-[#8b949e] mt-0.5">Purchase a plan or virtual number to unlock installer downloads.</p>
              </div>
              <Link to="/Pricing" className="text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap text-white" style={{ background: "#00a3ff" }}>
                View Plans
              </Link>
            </div>
          )}
          {checkingAccess && (
            <div className="mt-4 mb-2 flex items-center gap-2 text-xs text-[#8b949e]">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking your subscription…
            </div>
          )}

          {/* OS Filter Pills — admin only; non-admins locked to detected OS */}
          {isAdmin && (
            <div className="flex items-center gap-2 mt-4 mb-4 flex-wrap">
              {availablePlatforms.map(plat => {
                const PlatIcon = PLATFORM_CONFIG[plat]?.icon || Monitor;
                const platColor = PLATFORM_CONFIG[plat]?.color || "#00a3ff";
                const isActive = osFilter === plat;
                return (
                  <button
                    key={plat}
                    onClick={() => setOsFilter(plat)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={isActive
                      ? { background: platColor, color: "#fff", border: `1px solid ${platColor}` }
                      : { background: "transparent", color: "#8b949e", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    <PlatIcon className="w-4 h-4" />
                    {plat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Installer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredInstallers.map((d) => {
                const Icon = d.icon;
                const PlatIcon = PLATFORM_CONFIG[d.platform]?.icon || Monitor;
                const platColor = PLATFORM_CONFIG[d.platform]?.color || d.color;
                return (
                  <div key={d.id} className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "#1c2635", border: `1px solid ${platColor}25` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${d.color}15`, border: `1px solid ${d.color}30` }}>
                        <Icon className="w-6 h-6" style={{ color: d.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm leading-tight truncate">{d.label}</p>
                        <p className="text-xs text-[#8b949e] mt-0.5">{d.version}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <PlatIcon className="w-3 h-3" style={{ color: platColor }} />
                          <span className="text-xs font-semibold" style={{ color: platColor }}>{d.platform}</span>
                          <span className="text-xs text-[#8b949e]">· {d.badge}</span>
                        </div>
                      </div>
                    </div>
                    {d.available ? (
                      canDownload ? (
                        <button
                          type="button"
                          onClick={() => triggerDownload(d.url, d.label)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                          style={{ background: d.color }}
                        >
                          <ArrowDownToLine className="w-4 h-4" />
                          Download
                        </button>
                      ) : (
                        <Link
                          to="/Pricing"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                          style={{ background: "#8b949e" }}
                        >
                          <Lock className="w-4 h-4" />
                          Unlock with a Plan
                        </Link>
                      )
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#8b949e] bg-white/5">
                        Coming Soon
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* ── Link Desktop App Box ── */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "#111a26", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,163,255,0.1)", border: "1px solid rgba(0,163,255,0.2)" }}>
                <KeyRound className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Link Desktop App to Your Account</h3>
                <p className="text-xs text-[#8b949e] mt-1">After installing, open the app and enter this one-time token to automatically sign in.</p>
              </div>
            </div>
            <button
              onClick={generateToken}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white whitespace-nowrap transition-colors"
              style={{ background: "#00a3ff" }}
            >
              {showToken ? "Regenerate Token" : "Generate Login Token"}
            </button>
          </div>
          {showToken && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-black/30 border border-cyan-500/15">
              <code className="text-xs text-cyan-300 font-mono flex-1 truncate">{loginToken}</code>
              <button onClick={copyToken} className="text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* ── Login Credentials ── */}
        <div className="rounded-2xl p-6" style={{ background: "#111a26", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-sm text-[#8b949e] mb-5">
            Use the same credentials to log in on <span className="text-white font-semibold">Windows, Android, iOS</span> and all other VoxDigits apps.
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-[9px] font-bold tracking-widest text-[#8b949e] mb-1.5">EMAIL</p>
              <div className="px-4 py-3 rounded-xl bg-black/30 border border-white/5 text-sm text-white">
                {userEmail || "—"}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest text-[#8b949e] mb-1.5">PASSWORD</p>
              <div className="px-4 py-3 rounded-xl bg-black/30 border border-white/5 text-sm text-white">
                ••••••••••••
              </div>
            </div>
          </div>
          <Link to="/Preferences" className="text-xs text-cyan-400 hover:text-cyan-300 mt-4 inline-flex items-center gap-1 transition-colors">
            Forgot your password? Reset it here <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {success && <DownloadSuccessOverlay installerName={success} onClose={() => setSuccess(null)} />}
    </div>
  );
}