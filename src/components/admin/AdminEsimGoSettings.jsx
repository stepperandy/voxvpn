import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, XCircle, RefreshCw, Wifi, Search, Globe, Database, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminEsimGoSettings() {
  const [status, setStatus] = useState(null); // null | "loading" | "ok" | "error"
  const [statusMsg, setStatusMsg] = useState("");
  const [bundles, setBundles] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [bundleSearch, setBundleSearch] = useState("");
  const [expandedBundle, setExpandedBundle] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState("connection");

  const testConnection = async () => {
    setStatus("loading");
    setStatusMsg("");
    try {
      const res = await base44.functions.invoke("esimGoAdmin", { action: "test" });
      if (res.data?.success) {
        setStatus("ok");
        setStatusMsg(`Connected ✓ — Account: ${res.data.account?.email || "unknown"} | Balance: $${res.data.account?.balance ?? "?"}`);
      } else {
        setStatus("error");
        setStatusMsg(res.data?.error || "Connection failed");
      }
    } catch (e) {
      setStatus("error");
      setStatusMsg(e.message || "Unknown error");
    }
  };

  const loadBundles = async () => {
    setLoadingBundles(true);
    try {
      const res = await base44.functions.invoke("esimGoAdmin", { action: "bundles" });
      setBundles(res.data?.bundles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBundles(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await base44.functions.invoke("esimGoAdmin", { action: "orders" });
      setOrders(res.data?.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    if (activeTab === "bundles" && bundles.length === 0) loadBundles();
    if (activeTab === "orders" && orders.length === 0) loadOrders();
  }, [activeTab]);

  const filteredBundles = bundles.filter(b =>
    !bundleSearch ||
    b.name?.toLowerCase().includes(bundleSearch.toLowerCase()) ||
    b.description?.toLowerCase().includes(bundleSearch.toLowerCase()) ||
    b.countries?.some(c => c.toLowerCase().includes(bundleSearch.toLowerCase()))
  );

  const tabs = [
    { id: "connection", label: "Connection" },
    { id: "bundles", label: `Bundles${bundles.length ? ` (${bundles.length})` : ""}` },
    { id: "orders", label: "Recent Orders" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">eSIM Go Settings</h2>
        <p className="text-gray-400 text-sm">Manage your eSIM Go API integration and browse available bundles.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.id ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Connection Tab */}
      {activeTab === "connection" && (
        <div className="space-y-4">
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">API Connection</p>
                  <p className="text-xs text-gray-400">api.esim-go.com · v2.4</p>
                </div>
              </div>
              <button
                onClick={testConnection}
                disabled={status === "loading"}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-sm font-semibold text-white transition-all disabled:opacity-50"
              >
                {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Test Connection
              </button>
            </div>

            {status && status !== "loading" && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                status === "ok"
                  ? "bg-green-500/10 border border-green-500/25"
                  : "bg-red-500/10 border border-red-500/25"
              }`}>
                {status === "ok"
                  ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                }
                <p className={`text-sm font-medium ${status === "ok" ? "text-green-300" : "text-red-300"}`}>
                  {statusMsg}
                </p>
              </div>
            )}

            {status === "loading" && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-700/50">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <p className="text-sm text-gray-400">Testing connection…</p>
              </div>
            )}
          </div>

          {/* Config info */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <p className="text-sm font-semibold text-gray-300 mb-4">Configuration</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-sm text-gray-400">API Key</span>
                <span className="text-sm font-mono text-green-400">ESIM_GO_API_KEY ✓ Set</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-sm text-gray-400">Base URL</span>
                <span className="text-sm font-mono text-gray-300">https://api.esim-go.com/v2.4</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400">Webhook</span>
                <span className="text-sm font-mono text-gray-300">/functions/airaloUsageWebhook</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bundles Tab */}
      {activeTab === "bundles" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={bundleSearch}
                onChange={e => setBundleSearch(e.target.value)}
                placeholder="Search bundles by name or country…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={loadBundles}
              disabled={loadingBundles}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-sm font-semibold text-white transition-all disabled:opacity-50"
            >
              {loadingBundles ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>

          {loadingBundles ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : filteredBundles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Database className="w-10 h-10 mb-3" />
              <p>{bundles.length === 0 ? "No bundles loaded yet" : "No bundles match your search"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">{filteredBundles.length} bundles</p>
              {filteredBundles.map((bundle, i) => (
                <div key={bundle.id || bundle.bundle_id || i}
                  className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedBundle(expandedBundle === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-white text-sm">{bundle.name || bundle.bundle_id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {bundle.data_amount_gb ? `${bundle.data_amount_gb}GB` : bundle.data || "—"}
                          {bundle.validity_days ? ` · ${bundle.validity_days} days` : ""}
                          {bundle.countries?.length ? ` · ${bundle.countries.length} countries` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-cyan-400 font-bold text-sm">${parseFloat(bundle.price || 0).toFixed(2)}</span>
                      {expandedBundle === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                  {expandedBundle === i && (
                    <div className="px-5 pb-4 border-t border-gray-700 pt-3 text-xs text-gray-400 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div><span className="text-gray-500">ID:</span> <span className="font-mono text-gray-300">{bundle.id || bundle.bundle_id}</span></div>
                        <div><span className="text-gray-500">Type:</span> <span className="text-gray-300">{bundle.type || "—"}</span></div>
                        <div><span className="text-gray-500">Provider:</span> <span className="text-gray-300">{bundle.provider || "eSIM Go"}</span></div>
                        <div><span className="text-gray-500">Status:</span> <span className={bundle.is_active !== false ? "text-green-400" : "text-red-400"}>{bundle.is_active !== false ? "Active" : "Inactive"}</span></div>
                      </div>
                      {bundle.countries?.length > 0 && (
                        <div>
                          <span className="text-gray-500">Countries: </span>
                          <span className="text-gray-300">{bundle.countries.slice(0, 20).join(", ")}{bundle.countries.length > 20 ? ` +${bundle.countries.length - 20} more` : ""}</span>
                        </div>
                      )}
                      {bundle.description && <p className="text-gray-400">{bundle.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={loadOrders}
              disabled={loadingOrders}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-sm font-semibold text-white transition-all disabled:opacity-50"
            >
              {loadingOrders ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>

          {loadingOrders ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Database className="w-10 h-10 mb-3" />
              <p>No recent orders</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order, i) => (
                <div key={order.id || order.order_reference || i}
                  className="bg-gray-800/60 border border-gray-700 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white text-sm font-mono">{order.order_reference || order.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.bundle_name || order.bundle_id} · {order.iccid || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                      order.status === "completed" ? "bg-green-500/15 text-green-400" :
                      order.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                      "bg-gray-700 text-gray-400"
                    }`}>{order.status || "unknown"}</span>
                    <p className="text-xs text-gray-500 mt-1">${parseFloat(order.price || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}