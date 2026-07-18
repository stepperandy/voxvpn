import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Wifi, Zap, ShoppingBag, Loader2, QrCode, CheckCircle2,
  AlertCircle, Clock, BookOpen, RefreshCw, Filter, Globe,
  TrendingDown, Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import QRCodeModal from "@/components/esim/QRCodeModal";
import ESimTicketModal from "@/components/esim/ESimTicketModal";
import InsufficientCreditsModal from "@/components/InsufficientCreditsModal";


const FILTERS = ["all", "active", "pending", "expired"];

export default function ESimDashboard() {
  const [esims, setEsims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installESim, setInstallESim] = useState(null);
  const [ticketESim, setTicketESim] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const u = await base44.auth.me();
      setUser(u);
      const data = await base44.entities.ESim.filter({ user_email: u.email }, "-created_date", 50);
      setEsims(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getUsagePercent = (esim) => {
    if (!esim.data_gb) return null;
    return Math.min(100, Math.round(((esim.data_used_gb || 0) / esim.data_gb) * 100));
  };

  const getRemainingGb = (esim) => {
    if (!esim.data_gb) return null;
    return Math.max(0, esim.data_gb - (esim.data_used_gb || 0));
  };

  const getBarColor = (pct) => {
    if (pct >= 90) return "#ef4444";
    if (pct >= 70) return "#f59e0b";
    return "#06b6d4";
  };

  const filtered = filter === "all" ? esims : esims.filter(e => e.status === filter);
  const activeCount = esims.filter(e => e.status === "active").length;
  const totalData = esims.reduce((s, e) => s + (e.data_gb || 0), 0);
  const totalRemaining = esims
    .filter(e => e.status === "active")
    .reduce((s, e) => s + (getRemainingGb(e) || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse" style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
            <Wifi className="w-7 h-7 text-white" />
          </div>
          <p className="text-gray-400 text-sm">Loading your eSIMs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}>
        {/* Background orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white">My eSIMs</h1>
              <p className="text-gray-400 text-sm mt-1">{esims.length} plan{esims.length !== 1 ? "s" : ""} in your account</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              <Link
                to="/ESimStore"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-gray-950 transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
              >
                <ShoppingBag className="w-4 h-4" /> Buy Plan
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          {esims.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Active Plans", value: activeCount, icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
                { label: "Total Data", value: `${totalData} GB`, icon: Globe, color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.25)" },
                { label: "Data Remaining", value: `${totalRemaining.toFixed(1)} GB`, icon: TrendingDown, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)" },
                { label: "Balance", value: `$${user?.credits?.toFixed(2) || "0.00"}`, icon: Zap, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
              ].map(({ label, value, icon: Icon, color, bg, border }) => (
                <div key={label} className="rounded-2xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon className="w-4 h-4 mb-2" style={{ color }} />
                  <p className="text-xl font-extrabold text-white leading-tight">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filter Tabs */}
          {esims.length > 0 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all"
                  style={filter === f
                    ? { background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "#fff" }
                    : { background: "rgba(255,255,255,0.07)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  {f === "all" ? `All (${esims.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${esims.filter(e => e.status === f).length})`}
                </button>
              ))}
            </div>
          )}

          {/* eSIM Cards */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 rounded-3xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Wifi className="w-16 h-16 mx-auto mb-4 text-cyan-500/30" />
              {esims.length === 0 ? (
                <>
                  <p className="text-xl font-semibold text-white mb-2">No eSIMs yet</p>
                  <p className="text-gray-500 mb-6">Purchase your first plan to get started</p>
                  <Link to="/ESimStore" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-950" style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
                    <ShoppingBag className="w-4 h-4" /> Browse Plans
                  </Link>
                </>
              ) : (
                <p className="text-gray-500">No {filter} eSIMs</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((esim) => {
                const pct = getUsagePercent(esim);
                const remaining = getRemainingGb(esim);
                const barColor = pct != null ? getBarColor(pct) : "#06b6d4";
                const isExpired = esim.status === "expired";
                const isLow = pct != null && pct >= 80;

                return (
                  <div
                    key={esim.id}
                    className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${isLow && !isExpired ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)"}`,
                      opacity: isExpired ? 0.7 : 1,
                    }}
                  >
                    {/* Status stripe */}
                    <div className="h-1 w-full" style={{
                      background: isExpired
                        ? "linear-gradient(90deg, #6b7280, #4b5563)"
                        : esim.status === "pending"
                        ? "linear-gradient(90deg, #f59e0b, #f97316)"
                        : isLow
                        ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                        : "linear-gradient(90deg, #06b6d4, #8b5cf6)"
                    }} />

                    <div className="p-5">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)" }}>
                            <Wifi className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm leading-tight">{esim.product_name || "eSIM Plan"}</p>
                            <p className="text-xs text-gray-500 mt-0.5 font-mono truncate max-w-[180px]">{esim.iccid}</p>
                          </div>
                        </div>
                        <StatusBadge status={esim.status} />
                      </div>

                      {/* Data Balance Visual */}
                      {esim.data_gb ? (
                        <div className="mb-4 rounded-xl p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                          <div className="flex items-end justify-between mb-2">
                            <div>
                              <p className="text-xs text-gray-500">Remaining Data</p>
                              <p className="text-2xl font-extrabold text-white">
                                {remaining?.toFixed(1)} <span className="text-sm font-normal text-gray-400">/ {esim.data_gb} GB</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Used</p>
                              <p className="text-lg font-bold" style={{ color: barColor }}>{pct}%</p>
                            </div>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}cc, ${barColor})` }}
                            />
                          </div>
                          {isLow && !isExpired && (
                            <p className="text-xs text-amber-400 mt-1.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Data running low
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mb-4 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                      )}

                      {/* Footer info + actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                          {esim.valid_until && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {isExpired ? "Expired" : "Expires"} {new Date(esim.valid_until).toLocaleDateString()}
                            </span>
                          )}
                          {esim.price_paid && (
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              Paid ${esim.price_paid.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {!isExpired && (
                          <div className="flex gap-2 flex-wrap justify-end">
                            <button
                              onClick={() => setInstallESim(esim)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                              style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
                            >
                              <QrCode className="w-3.5 h-3.5" /> QR Code
                            </button>
                            <Link
                              to={`/ESimActivationGuide?esim_id=${esim.id}`}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 transition-all"
                            >
                              <BookOpen className="w-3.5 h-3.5" /> Guide
                            </Link>
                            <button
                              onClick={() => setTicketESim(esim)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-300 border border-red-500/30 hover:bg-red-500/10 transition-all"
                            >
                              <AlertCircle className="w-3.5 h-3.5" /> Report Issue
                            </button>
                          </div>
                        )}
                        {isExpired && (
                          <Link
                            to="/ESimStore"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-all"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> Renew
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA Banner */}
          <div className="mt-8 rounded-2xl p-5 flex items-center gap-4" style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.18)" }}>
            <Zap className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-white text-sm">Need more data?</p>
              <p className="text-xs text-gray-400 mt-0.5">Top up your balance and buy another plan instantly.</p>
            </div>
            <Link to="/ESimStore" className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-950 transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
              Browse Plans
            </Link>
          </div>
        </div>
      </div>

      {installESim && <QRCodeModal esim={installESim} onClose={() => setInstallESim(null)} />}
      {ticketESim && <ESimTicketModal esim={ticketESim} onClose={() => setTicketESim(null)} />}
      <InsufficientCreditsModal
        isOpen={showInsufficientCredits}
        onClose={() => setShowInsufficientCredits(false)}
        currentCredits={user?.credits || 0}
        requiredCredits={requiredCredits}
        action="purchase an eSIM plan"
      />
      </>
  );
}

function StatusBadge({ status }) {
  if (status === "active") return (
    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(34,197,94,0.15)", color: "#86efac", border: "1px solid rgba(34,197,94,0.3)" }}>
      <CheckCircle2 className="w-3 h-3" /> Active
    </span>
  );
  if (status === "expired") return (
    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
      <AlertCircle className="w-3 h-3" /> Expired
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(245,158,11,0.15)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.3)" }}>
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}