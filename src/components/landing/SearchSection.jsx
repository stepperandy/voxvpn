import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, ShoppingCart, Globe, Phone, MessageSquare, X, Zap, Sparkles, Loader2 } from "lucide-react";
import { isRunningInIframe } from "@/components/stripe/stripeUtils";

const COUNTRY_MAP = {
  'all': null,
  'US': 'US',
  'UK': 'GB',
  'CA': 'CA',
};

const COUNTRY_FLAGS = {
  'US': '🇺🇸',
  'GB': '🇬🇧',
  'CA': '🇨🇦',
  'AU': '🇦🇺',
};

const typeColors = {
  local: 'bg-blue-500/30 text-blue-200 border-blue-400/50',
  mobile: 'bg-violet-500/30 text-violet-200 border-violet-400/50',
  toll_free: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50',
};

const selectClass = "w-full bg-white/10 border border-white/20 hover:border-cyan-400/60 focus:border-cyan-400 rounded-xl px-3 py-3 text-white text-sm focus:outline-none transition-all cursor-pointer";

export default function SearchSection({ onAddToCart }) {
  const [country, setCountry] = useState('all');
  const [type, setType] = useState('all');
  const [feature, setFeature] = useState('all');
  const [areaCode, setAreaCode] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [cart, setCart] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchNumbers = async () => {
    setLoading(true);
    setResults([]);
    setSearched(true);
    try {
      const countryCode = country === 'all' ? 'US' : COUNTRY_MAP[country];
      const res = await base44.functions.invoke("searchNumbers", {
        country_code: countryCode,
        area_code: areaCode || undefined,
      });
      
      if (res.status === 503) {
        alert("Number search service not configured");
      } else {
        const numbers = res.data?.data || [];
        setResults(numbers.map(num => ({
          id: num.id,
          phone: num.phone_number || num.prefix,
          country: num.country_iso || country,
          flag: COUNTRY_FLAGS[num.country_iso] || '🌐',
          type: num.type || 'local',
          features: [
            ...(num.voice_enabled ? ['Voice'] : []),
            ...(num.sms_enabled ? ['SMS'] : []),
          ],
          price: parseFloat(num.monthly_fee) || 0,
          areaCode: areaCode,
          setup_fee: num.setup_fee || 0,
        })));
      }
    } catch (err) {
      alert("Failed to search numbers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    if (!cart.some(n => n.phone === item.phone)) {
      const newCart = [...cart, item];
      setCart(newCart);
      onAddToCart?.(newCart);
    }
  };

  const removeFromCart = (phone) => {
    const newCart = cart.filter(n => n.phone !== phone);
    setCart(newCart);
    onAddToCart?.(newCart);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const inCart = (phone) => cart.some(n => n.phone === phone);

  const proceedToCheckout = async () => {
    if (isRunningInIframe()) {
      alert("Checkout only works from the published app. Please visit the app directly.");
      return;
    }
    
    if (cart.length === 0) return;
    
    setCheckingOut(true);
    try {
      const res = await base44.functions.invoke("homeCheckout", {
        cart: cart.map(item => ({
          phone: item.phone,
          country: item.country,
          price: item.price,
        })),
        total: total,
      });

      if (res.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        alert(res.data?.error || "Failed to start checkout");
      }
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <section id="search" className="py-24 px-6 md:px-10 relative overflow-hidden" style={{background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 40%, #0d1b3e 100%)"}}>
      {/* Vivid background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-20" style={{background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)"}} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-15" style={{background: "radial-gradient(circle, #a855f7 0%, transparent 70%)"}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-10" style={{background: "radial-gradient(ellipse, #3b82f6 0%, transparent 70%)"}} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5" style={{background: "linear-gradient(90deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2))", border: "1px solid rgba(6,182,212,0.4)"}}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">50+ countries available</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Find your perfect{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">virtual number</span>
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto text-lg">Browse thousands of numbers worldwide — local, mobile, toll-free.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(20px)"}}>
              {/* Panel Header */}
              <div className="px-6 py-4 flex items-center gap-3" style={{background: "linear-gradient(90deg, rgba(6,182,212,0.15), rgba(168,85,247,0.1))", borderBottom: "1px solid rgba(255,255,255,0.1)"}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background: "linear-gradient(135deg, #06b6d4, #3b82f6)"}}>
                  <Search className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Number Search</p>
                  <p className="text-cyan-300/70 text-xs">Filter by country, type & features</p>
                </div>
              </div>

              <div className="p-6">
                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Country", value: country, onChange: setCountry, options: [["all","All Countries"],["US","🇺🇸 United States"],["UK","🇬🇧 United Kingdom"],["CA","🇨🇦 Canada"]] },
                    { label: "Type", value: type, onChange: setType, options: [["all","Any Type"],["Local","Local"],["Mobile","Mobile"],["Toll-Free","Toll-Free"]] },
                    { label: "Feature", value: feature, onChange: setFeature, options: [["all","Voice or SMS"],["Voice","Voice only"],["SMS","SMS only"],["Voice,SMS","Voice + SMS"]] },
                  ].map(({ label, value, onChange, options }) => (
                    <div key={label}>
                      <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{color: "#67e8f9"}}>{label}</label>
                      <select value={value} onChange={e => onChange(e.target.value)} className={selectClass}>
                        {options.map(([v, l]) => <option key={v} value={v} style={{background: "#1e1b4b"}}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{color: "#67e8f9"}}>Area Code</label>
                    <input
                      value={areaCode}
                      onChange={e => setAreaCode(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchNumbers()}
                      placeholder="213, 646…"
                      className="w-full bg-white/10 border border-white/20 hover:border-cyan-400/60 focus:border-cyan-400 rounded-xl px-3 py-3 text-white text-sm focus:outline-none transition-all placeholder-white/30"
                    />
                  </div>
                </div>

                <button
                  onClick={searchNumbers}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 shadow-lg mb-6"
                  style={{background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)", boxShadow: "0 0 20px rgba(6,182,212,0.4)"}}
                >
                  <Search className="w-4 h-4" /> Search Numbers
                </button>

                {/* Results */}
                <div className="space-y-2.5">
                  {results.map((item) => (
                    <div
                      key={item.phone}
                      className="flex items-center justify-between p-4 rounded-xl transition-all"
                      style={{
                        background: inCart(item.phone) ? "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.1))" : "rgba(255,255,255,0.05)",
                        border: inCart(item.phone) ? "1px solid rgba(6,182,212,0.5)" : "1px solid rgba(255,255,255,0.1)"
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">{item.flag}</span>
                        <div className="min-w-0">
                          <p className="font-mono font-bold text-white text-sm">{item.phone}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColors[item.type] || 'bg-gray-500/30 text-gray-200 border-gray-400/50'}`}>{item.type}</span>
                            <span className="text-xs text-gray-300 flex items-center gap-1">
                              {item.features.includes('Voice') && <Phone className="w-3 h-3 text-cyan-400" />}
                              {item.features.includes('SMS') && <MessageSquare className="w-3 h-3 text-purple-400" />}
                              <span className="text-gray-400">{item.features.join(' + ')}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="font-extrabold text-lg" style={{background: "linear-gradient(90deg, #06b6d4, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>${item.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">/month</p>
                        </div>
                        <button
                          onClick={() => inCart(item.phone) ? removeFromCart(item.phone) : addToCart(item)}
                          className="px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
                          style={inCart(item.phone)
                            ? {background: "rgba(6,182,212,0.2)", border: "1px solid rgba(6,182,212,0.5)", color: "#67e8f9"}
                            : {background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "#fff", boxShadow: "0 0 12px rgba(6,182,212,0.3)"}
                          }
                        >
                          {inCart(item.phone) ? '✓ Added' : 'Add'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {searched && results.length === 0 && (
                    <div className="text-center py-12">
                      <Globe className="w-12 h-12 mx-auto mb-3 text-cyan-500/40" />
                      <p className="text-gray-400">No numbers match your filters</p>
                    </div>
                  )}
                  {loading && (
                  <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Searching available numbers...</span>
                  </div>
                )}

                {!loading && !searched && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(168,85,247,0.15))", border: "1px solid rgba(6,182,212,0.2)"}}>
                        <Search className="w-7 h-7 text-cyan-400/60" />
                      </div>
                      <p className="text-gray-300 font-medium">Click Search to view available numbers</p>
                      <p className="text-gray-500 text-sm mt-1">Filter by country, type, or area code</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl overflow-hidden shadow-2xl sticky top-6" style={{background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(20px)"}}>
              {/* Cart Header */}
              <div className="px-6 py-4 flex items-center justify-between" style={{background: "linear-gradient(90deg, rgba(168,85,247,0.2), rgba(6,182,212,0.1))", borderBottom: "1px solid rgba(255,255,255,0.1)"}}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background: "linear-gradient(135deg, #a855f7, #ec4899)"}}>
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Cart & Summary</p>
                    <p className="text-purple-300/70 text-xs">{cart.length} number{cart.length !== 1 ? 's' : ''} selected</p>
                  </div>
                </div>
                {cart.length > 0 && (
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{background: "linear-gradient(135deg, #06b6d4, #8b5cf6)"}}>
                    {cart.length}
                  </span>
                )}
              </div>

              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)"}}>
                      <ShoppingCart className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-gray-300 font-medium text-sm">No numbers selected</p>
                    <p className="text-gray-500 text-xs mt-1">Add numbers from search results</p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {cart.map((item) => (
                      <div key={item.phone} className="flex items-center justify-between p-3 rounded-xl gap-2" style={{background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)"}}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-lg">{item.flag}</span>
                          <div className="min-w-0">
                            <p className="text-white font-mono text-xs font-bold truncate">{item.phone}</p>
                            <p className="text-gray-400 text-[10px]">{item.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-bold text-sm" style={{background: "linear-gradient(90deg, #06b6d4, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>${item.price.toFixed(2)}</span>
                          <button onClick={() => removeFromCart(item.phone)} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="flex items-center justify-between py-3 mb-5 rounded-xl px-3" style={{background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(168,85,247,0.1))", border: "1px solid rgba(6,182,212,0.2)"}}>
                    <span className="text-gray-300 text-sm font-medium">Monthly total</span>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <strong className="text-xl font-extrabold text-white">${total.toFixed(2)}</strong>
                    </div>
                  </div>
                )}

                <button
                   onClick={proceedToCheckout}
                   disabled={cart.length === 0 || checkingOut}
                   className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 mb-3 flex items-center justify-center gap-2"
                   style={cart.length > 0
                     ? {background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)", color: "#fff", boxShadow: "0 0 25px rgba(6,182,212,0.4)"}
                     : {background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", cursor: "not-allowed"}
                   }
                 >
                   {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                   {checkingOut ? "Processing..." : "Proceed to Checkout"}
                 </button>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                    style={{background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171"}}
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}