import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Wifi, Globe, Clock, ShoppingCart, Loader2, AlertCircle, CheckCircle2, Zap, Star, Shield, Sparkles, Phone, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import GuestCheckoutModal from "../components/esim/GuestCheckoutModal";
import PaymentChoiceModal from "@/components/checkout/PaymentChoiceModal";
import { isRunningInIframe } from "@/components/stripe/stripeUtils";
import VirtualNumberStore from "@/components/esim/VirtualNumberStore";
import PaymentMethodsDisplay from "@/components/checkout/PaymentMethodsDisplay";

const COUNTRY_FLAGS = { US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵", IT: "🇮🇹", ES: "🇪🇸", KR: "🇰🇷", SG: "🇸🇬", NL: "🇳🇱", SE: "🇸🇪", NO: "🇳🇴", DK: "🇩🇰", CH: "🇨🇭", BR: "🇧🇷", MX: "🇲🇽", IN: "🇮🇳", TH: "🇹🇭", PH: "🇵🇭", ID: "🇮🇩", MY: "🇲🇾", VN: "🇻🇳", TR: "🇹🇷", AE: "🇦🇪", ZA: "🇿🇦", NG: "🇳🇬", KE: "🇰🇪", GH: "🇬🇭", EG: "🇪🇬" };

const CARD_GRADIENTS = [
  { from: "#06b6d4", to: "#3b82f6" },
  { from: "#8b5cf6", to: "#ec4899" },
  { from: "#10b981", to: "#06b6d4" },
  { from: "#f59e0b", to: "#ef4444" },
  { from: "#6366f1", to: "#8b5cf6" },
  { from: "#ec4899", to: "#f59e0b" },
];

function ProductCard({ product, idx, esimProvider, purchasing, onPurchase, currencyPreview }) {
  const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
  const flag = COUNTRY_FLAGS[product.country_code] || "🌐";
  const isProcessing = purchasing === product.package_id;
  return (
    <div className="relative group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})` }} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${gradient.from}15, transparent 70%)` }} />
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{flag}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: gradient.from }}>{product.country}</p>
              <h3 className="text-white font-bold text-base leading-tight">{product.name}</h3>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${gradient.from}30, ${gradient.to}20)`, border: `1px solid ${gradient.from}40` }}>
              <Wifi className="w-4 h-4" style={{ color: gradient.from }} />
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: esimProvider === "voxgo" ? "rgba(139,92,246,0.2)" : "rgba(6,182,212,0.2)", color: esimProvider === "voxgo" ? "#c4b5fd" : "#67e8f9" }}>
              {esimProvider === "voxgo" ? "VoxGO" : "VoxAIR"}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap mb-5">
          {product.data_gb && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: `${gradient.from}20`, border: `1px solid ${gradient.from}40`, color: gradient.from }}>
              <Wifi className="w-3 h-3" /> {product.data_gb} GB
            </span>
          )}
          {product.duration_days && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: `${gradient.to}20`, border: `1px solid ${gradient.to}40`, color: gradient.to }}>
              <Clock className="w-3 h-3" /> {product.duration_days} days
            </span>
          )}
        </div>
        <div className="flex gap-3 mb-5 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-400" /> Instant</span>
          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> 4G/5G</span>
          <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-blue-400" /> No roaming</span>
        </div>
        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <span className="text-3xl font-extrabold text-white">
              {currencyPreview?.rates?.[product.package_id]?.display || `$${product.price.toFixed(2)}`}
            </span>
            <span className="text-gray-400 text-xs ml-1">one-time</span>
            {currencyPreview && currencyPreview.currency !== "usd" && (
              <div className="text-[10px] text-gray-500 line-through">${product.price.toFixed(2)} USD</div>
            )}
          </div>
          <button
            onClick={() => onPurchase(product)}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`, boxShadow: `0 0 20px ${gradient.from}40` }}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            {isProcessing ? "..." : "Buy Now →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ESimStore() {
  const [activeTab, setActiveTab] = useState("esim");
  const [esimProvider, setEsimProvider] = useState("voxair");
  const [products, setProducts] = useState([]);
  const [voxgoProducts, setVoxgoProducts] = useState([]);
  const [voxzenProducts, setVoxzenProducts] = useState([]);
  const [voxtxProducts, setVoxtxProducts] = useState([]);
  const [loadingVoxgo, setLoadingVoxgo] = useState(false);
  const [loadingVoxzen, setLoadingVoxzen] = useState(false);
  const [loadingVoxtx, setLoadingVoxtx] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [guestCheckoutProduct, setGuestCheckoutProduct] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [currencyPreview, setCurrencyPreview] = useState(null);

  useEffect(() => { loadData(); }, []);

  const allProducts = esimProvider === "voxgo" ? voxgoProducts : esimProvider === "voxzen" ? voxzenProducts : esimProvider === "voxtx" ? voxtxProducts : products;

  useEffect(() => {
    if (allProducts.length > 0) {
      const amounts = {};
      allProducts.forEach(p => { amounts[p.package_id] = Math.round(p.price * 100); });
      base44.functions.invoke("getCurrencyPreview", { amounts })
        .then(res => setCurrencyPreview(res.data))
        .catch(() => {});
    }
  }, [allProducts]);

  useEffect(() => {
    if (esimProvider === "voxgo" && voxgoProducts.length === 0) {
      setLoadingVoxgo(true);
      base44.functions.invoke("getEsimGoPackages", {})
        .then(res => setVoxgoProducts(res.data?.packages || []))
        .catch(err => console.error("VoxGO load error:", err))
        .finally(() => setLoadingVoxgo(false));
    }
    if (esimProvider === "voxzen" && voxzenProducts.length === 0) {
      setLoadingVoxzen(true);
      base44.functions.invoke("getZenditPackages", {})
        .then(res => setVoxzenProducts(res.data?.packages || []))
        .catch(err => console.error("VoxZen load error:", err))
        .finally(() => setLoadingVoxzen(false));
    }
    if (esimProvider === "voxtx" && voxtxProducts.length === 0) {
      setLoadingVoxtx(true);
      base44.functions.invoke("getTelecomsxchangePackages", {})
        .then(res => setVoxtxProducts(res.data?.packages || []))
        .catch(err => console.error("VoxTX load error:", err))
        .finally(() => setLoadingVoxtx(false));
    }
  }, [esimProvider]);

  const stripeCheckoutForProduct = async (product) => {
    if (isRunningInIframe()) {
      alert("Checkout only works from the published app. Please visit the app directly to purchase.");
      return;
    }
    setPurchasing(product.package_id);
    try {
      const appUrl = window.location.origin;
      const res = await base44.functions.invoke("airaloStripeCheckout", {
        package_id: product.package_id,
        product_name: product.name,
        amount_cents: Math.round(product.price * 100),
        user_email: user?.email || "",
        success_url: `${appUrl}/MyESims?session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: `${appUrl}/ESimStore?status=cancelled`,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        showToast(res.data?.error || "Checkout session could not be created. Please try again.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.message || "Checkout failed", "error");
    } finally {
      setPurchasing(null);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      try {
        const u = await base44.auth.me();
        setUser(u);
        setWalletBalance(u?.credits || 0);
      } catch { }
      const prods = await base44.functions.invoke("airaloPackages", {});
      setProducts(prods.data?.packages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (product) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    // VoxZen & VoxTX use credits-only for now (no card option yet)
    if (esimProvider === "voxzen" || esimProvider === "voxtx") {
      setPaymentModal({ product, provider: esimProvider, creditsOnly: true });
    } else {
      setPaymentModal({ product, provider: esimProvider });
    }
  };

  const buyEsimWithCredits = async (product, provider) => {
    setPurchasing(product.package_id);
    let functionName = "buyEsimWithCredits";
    if (provider === "voxgo") functionName = "purchaseEsimGo";
    if (provider === "voxzen") functionName = "purchaseZenditEsim";
    if (provider === "voxtx") functionName = "purchaseTelecomsxchangeEsim";
    
    const res = await base44.functions.invoke(functionName, {
      package_id: product.package_id,
      bundleId: product.package_id,
      quantity: 1,
      product_name: product.name,
      price: product.price,
    });
    setPurchasing(null);
    if (res.data?.success || res.data?.order) {
      setWalletBalance(prev => prev - product.price);
      setPaymentModal(null);
      showToast(`eSIM purchased! Check My eSIMs for details.`, "success");
    } else {
      throw new Error(res.data?.error || "Purchase failed");
    }
  };

  const filteredProducts = useMemo(() => {
    if (!countrySearch.trim()) return allProducts;
    const q = countrySearch.toLowerCase();
    return allProducts.filter(p =>
      (p.country || "").toLowerCase().includes(q) ||
      (p.name || "").toLowerCase().includes(q) ||
      (p.country_code || "").toLowerCase().includes(q)
    );
  }, [allProducts, countrySearch]);

  // Unique countries for the map dots
  const availableCountries = useMemo(() =>
    [...new Set(allProducts.map(p => p.country).filter(Boolean))],
    [allProducts]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse" style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
            <Wifi className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        </div>

        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold backdrop-blur ${
            toast.type === "error" ? "bg-red-500/20 border border-red-500/40 text-red-200" : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-200"
          }`} style={{ backdropFilter: "blur(20px)" }}>
            {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {toast.message}
          </div>
        )}

        <GuestCheckoutModal product={guestCheckoutProduct} isOpen={!!guestCheckoutProduct} onClose={() => setGuestCheckoutProduct(null)} />
        <PaymentChoiceModal
          isOpen={!!paymentModal}
          onClose={() => setPaymentModal(null)}
          totalCost={paymentModal?.product?.price}
          userCredits={walletBalance}
          onPayWithCredits={() => buyEsimWithCredits(paymentModal.product, paymentModal.provider)}
          onPayWithCard={() => stripeCheckoutForProduct(paymentModal.product)}
        />

        <div className="max-w-6xl mx-auto px-4 py-10 relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5" style={{ background: "linear-gradient(90deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(6,182,212,0.4)" }}>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-bold">Instant Global Connectivity</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
              eSIM <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Store</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">Browse & purchase data plans worldwide — no physical SIM needed</p>
            {currencyPreview && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <p className="text-xs text-gray-500">
                  Detected location: {currencyPreview.country} · Prices shown in {currencyPreview.currency.toUpperCase()}
                </p>
                <PaymentMethodsDisplay currencyPreview={currencyPreview} />
              </div>
            )}
          </div>



          {/* Value proposition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: "🚫💸", title: "Zero Roaming Charges", desc: "Pay one flat price upfront — no surprise bills from your home carrier." },
              { icon: "🌐", title: "Use With Any App", desc: "Stream, browse, and make calls via WhatsApp, FaceTime, or any VoIP app." },
              { icon: "✈️", title: "Perfect for Travel", desc: "Land, activate, and connect instantly. No physical SIM swap needed." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-5 flex gap-4 items-start" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-3xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="font-bold text-white mb-1 text-sm">{title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Tabs: Buy eSIM / Virtual Number */}
          <div className="flex justify-center mb-8">
            <div className="flex rounded-2xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <button onClick={() => setActiveTab("esim")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={activeTab === "esim" ? { background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "#fff" } : { color: "#9ca3af" }}>
                <Wifi className="w-4 h-4" /> Buy eSIM
              </button>
              <button onClick={() => setActiveTab("number")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={activeTab === "number" ? { background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "#fff" } : { color: "#9ca3af" }}>
                <Phone className="w-4 h-4" /> Virtual Number
              </button>
            </div>
          </div>

          {/* Balance + My eSIMs */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            {user && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.15))", border: "1px solid rgba(6,182,212,0.3)" }}>
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-white">Balance: </span>
                <span className="text-cyan-400 font-bold">${walletBalance.toFixed(2)}</span>
              </div>
            )}
            <Link to="/MyESims" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd" }}>
              My eSIMs →
            </Link>
          </div>

          {/* Virtual Number Tab */}
          {activeTab === "number" && <VirtualNumberStore user={user} onPaymentModal={setPaymentModal} />}

          {activeTab === "esim" && (
            <>
              {/* Provider toggle */}
              <div className="flex justify-center mb-6">
                <div className="flex rounded-2xl p-1 gap-1 flex-wrap justify-center" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <button onClick={() => { setEsimProvider("voxair"); setCountrySearch(""); }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={esimProvider === "voxair" ? { background: "linear-gradient(135deg, #06b6d4, #3b82f6)", color: "#fff" } : { color: "#9ca3af" }}>
                    ✈️ VoxAIR
                  </button>
                  <button onClick={() => { setEsimProvider("voxgo"); setCountrySearch(""); }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={esimProvider === "voxgo" ? { background: "linear-gradient(135deg, #8b5cf6, #ec4899)", color: "#fff" } : { color: "#9ca3af" }}>
                    🌐 VoxGO
                  </button>
                  <button onClick={() => { setEsimProvider("voxzen"); setCountrySearch(""); }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={esimProvider === "voxzen" ? { background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff" } : { color: "#9ca3af" }}>
                    💎 VoxZen
                  </button>
                  <button onClick={() => { setEsimProvider("voxtx"); setCountrySearch(""); }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={esimProvider === "voxtx" ? { background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" } : { color: "#9ca3af" }}>
                    🌍 VoxTX
                  </button>
                </div>
              </div>

              {/* ── COUNTRY SEARCH ── */}
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  placeholder="Search by country or plan name…"
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl text-white text-sm focus:outline-none placeholder-gray-600"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
                />
                {countrySearch && (
                  <button onClick={() => setCountrySearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Low balance warning */}
              {user && walletBalance <= 0 && (
                <div className="mb-8 p-5 rounded-2xl flex items-start gap-4" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.1))", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-300 mb-1">Low account balance</p>
                    <p className="text-sm text-amber-200/80 mb-3">Deposit credits or pay directly with a card.</p>
                    <Link to="/MyESims" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff" }}>
                      <Zap className="w-3.5 h-3.5" /> Deposit Credits
                    </Link>
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {(esimProvider === "voxgo" && loadingVoxgo) || (esimProvider === "voxzen" && loadingVoxzen) || (esimProvider === "voxtx" && loadingVoxtx) ? (
                <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: esimProvider === "voxgo" ? "#a855f7" : esimProvider === "voxzen" ? "#f59e0b" : "#10b981" }} />
                  <span>Loading {esimProvider === "voxgo" ? "VoxGO" : esimProvider === "voxzen" ? "VoxZen" : "VoxTX"} plans...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-24 rounded-3xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Wifi className="w-16 h-16 mx-auto mb-4 text-cyan-500/30" />
                  <p className="text-xl font-semibold text-gray-300 mb-2">
                    {countrySearch ? `No plans found for "${countrySearch}"` : "No plans available yet"}
                  </p>
                  <p className="text-gray-500">
                    {countrySearch ? "Try a different country name." : "Products will appear here once added by an admin."}
                  </p>
                  {countrySearch && (
                    <button onClick={() => setCountrySearch("")} className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {countrySearch && (
                    <p className="text-gray-400 text-sm mb-4">
                      Showing <span className="text-white font-semibold">{filteredProducts.length}</span> plans for "{countrySearch}"
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProducts.map((product, idx) => (
                      <ProductCard
                        key={product.package_id || idx}
                        product={product}
                        idx={idx}
                        esimProvider={esimProvider}
                        purchasing={purchasing}
                        onPurchase={handlePurchase}
                        currencyPreview={currencyPreview}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}