import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  Smartphone, Search, TrendingUp, Copy, Check, Lightbulb,
  Plus, Edit3, Star, BarChart3, RefreshCw, ArrowLeft, Save, X
} from "lucide-react";
import { Link } from "react-router-dom";

const PLATFORMS = [
  { id: "ios", label: "App Store (iOS)", icon: Smartphone, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "android", label: "Google Play", icon: Smartphone, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
];

const CHAR_LIMITS = {
  ios: { app_title: 30, subtitle: 30, keywords_field: 100, promotional_text: 170, full_description: 4000 },
  android: { app_title: 50, short_description: 80, full_description: 4000 },
};

// Pre-built ASO recommendations optimized for a virtual phone number + eSIM app
const ASO_RECOMMENDATIONS = {
  title: "VoxDigits: Virtual Phone Number & eSIM",
  subtitle: "Private 2nd Number, SMS, Calling & eSIM",
  keywords: "virtual number,second phone number,burner number,us number,uk number,esim,travel esim,disposable number,voip,call forwarding,sms receive,privacy number,international number,virtual phone,dual sim",
  short_description: "Get a private 2nd phone number for calls, SMS & eSIM data. US, UK, CA, AU numbers.",
  promotional_text: "🔒 Private virtual numbers + global eSIM data. No contracts, cancel anytime. Download now!",
  full_description: `VoxDigits gives you a private second phone number for calls, SMS, and eSIM data — perfect for privacy, business, travel, and online verification.

🔑 WHY VOXDIGITS?
• Private virtual numbers from US, UK, Canada & Australia
• Receive SMS for verifications (WhatsApp, Telegram, Google, etc.)
• Make and receive calls with crystal-clear VoIP quality
• Global eSIM data plans — no physical SIM needed
• Call forwarding to any number worldwide
• Burner / disposable numbers for one-time use
• No contracts — pay as you go with credits

📞 VIRTUAL PHONE NUMBERS
Get a dedicated phone number in 4+ countries. Use it for:
- Online sign-ups and OTP verification
- Business calls without sharing your personal number
- International presence without roaming fees
- Temporary / disposable use

✈️ GLOBAL eSIM DATA
Activate data plans in 190+ countries instantly. No physical SIM swap, no roaming charges. Just scan a QR code and you're connected.

🔒 PRIVACY & SECURITY
- End-to-end encrypted calling
- No call logs stored on your device
- Block unwanted numbers
- KYC-verified platform for trust

💳 FLEXIBLE PRICING
- Credits-based pay-as-you-go
- Monthly & annual number subscriptions
- eSIM data packages from $1
- Refer friends and earn free credits

Download VoxDigits today and get your private second number in seconds!`,
};

function CharCounter({ value, max }) {
  const len = (value || "").length;
  const pct = max ? Math.min(100, (len / max) * 100) : 0;
  const danger = pct >= 90;
  const warn = pct >= 75 && pct < 90;
  return (
    <span className={`text-[10px] font-medium ${danger ? "text-red-400" : warn ? "text-amber-400" : "text-slate-500"}`}>
      {len}/{max}
    </span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="text-slate-500 hover:text-cyan-400 transition-colors p-1">
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
    </button>
  );
}

export default function ASOManager() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState("ios");
  const [editingListing, setEditingListing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.AppStoreListing.list("-created_date", 50);
      setListings(data);
    } catch (e) {
      console.error("Failed to load listings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const platformListings = useMemo(
    () => listings.filter(l => l.platform === activePlatform),
    [listings, activePlatform]
  );

  const activeLimits = CHAR_LIMITS[activePlatform];

  const handleApplyRecommendation = (field, value) => {
    if (!editingListing) return;
    setEditingListing(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = { ...editingListing, last_updated: new Date().toISOString() };
      if (editingListing.id) {
        await base44.entities.AppStoreListing.update(editingListing.id, payload);
      } else {
        await base44.entities.AppStoreListing.create(payload);
      }
      setShowForm(false);
      setEditingListing(null);
      fetchListings();
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to save listing. Please try again.");
    }
  };

  const handleNewListing = () => {
    setEditingListing({
      platform: activePlatform,
      locale: "en-US",
      app_title: "",
      subtitle: "",
      keywords_field: "",
      short_description: "",
      full_description: "",
      promotional_text: "",
      target_keywords: [],
      current_rankings: "{}",
      status: "draft",
      version: "",
      notes: "",
    });
    setShowForm(true);
  };

  const handleEdit = (listing) => {
    setEditingListing({ ...listing });
    setShowForm(true);
  };

  const handleStartFromTemplate = () => {
    setEditingListing({
      platform: activePlatform,
      locale: "en-US",
      app_title: ASO_RECOMMENDATIONS.title.slice(0, activeLimits.app_title),
      subtitle: ASO_RECOMMENDATIONS.subtitle.slice(0, activeLimits.subtitle),
      keywords_field: activePlatform === "ios" ? ASO_RECOMMENDATIONS.keywords.slice(0, 100) : "",
      short_description: ASO_RECOMMENDATIONS.short_description.slice(0, 80),
      full_description: ASO_RECOMMENDATIONS.full_description,
      promotional_text: activePlatform === "ios" ? ASO_RECOMMENDATIONS.promotional_text.slice(0, 170) : "",
      target_keywords: ASO_RECOMMENDATIONS.keywords.split(",").map(k => k.trim()).slice(0, 10),
      current_rankings: "{}",
      status: "draft",
      version: "",
      notes: "",
    });
    setShowForm(true);
  };

  const statusConfig = {
    draft: { color: "text-slate-400 bg-slate-500/10 border-slate-500/20", label: "Draft" },
    in_review: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "In Review" },
    live: { color: "text-green-400 bg-green-500/10 border-green-500/20", label: "Live" },
    rejected: { color: "text-red-400 bg-red-500/10 border-red-500/20", label: "Rejected" },
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link to="/AdminPanel" className="p-2 text-slate-400 hover:text-white">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Search size={20} className="text-cyan-400" />
                App Store Optimization
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">Manage listings, keywords & rankings for iOS & Google Play</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowRecommendations(!showRecommendations)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-colors">
              <Lightbulb size={14} /> ASO Tips
            </button>
            <button onClick={handleNewListing} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500 text-gray-950 text-xs font-bold hover:bg-cyan-400 transition-colors">
              <Plus size={14} /> New Listing
            </button>
          </div>
        </div>

        {/* ASO Recommendations Panel */}
        {showRecommendations && (
          <div className="mb-6 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-amber-400" />
              <h3 className="font-bold text-sm">ASO Recommendations for VoxDigits</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 font-semibold mb-1">Optimized App Title</p>
                  <div className="flex items-start gap-2">
                    <code className="flex-1 bg-black/30 rounded p-2 text-amber-300">{ASO_RECOMMENDATIONS.title}</code>
                    <CopyButton text={ASO_RECOMMENDATIONS.title} />
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold mb-1">Subtitle</p>
                  <div className="flex items-start gap-2">
                    <code className="flex-1 bg-black/30 rounded p-2 text-amber-300">{ASO_RECOMMENDATIONS.subtitle}</code>
                    <CopyButton text={ASO_RECOMMENDATIONS.subtitle} />
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold mb-1">iOS Keywords (100 chars)</p>
                  <div className="flex items-start gap-2">
                    <code className="flex-1 bg-black/30 rounded p-2 text-amber-300 text-[10px]">{ASO_RECOMMENDATIONS.keywords}</code>
                    <CopyButton text={ASO_RECOMMENDATIONS.keywords} />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 font-semibold mb-1">Play Store Short Description</p>
                  <div className="flex items-start gap-2">
                    <code className="flex-1 bg-black/30 rounded p-2 text-amber-300">{ASO_RECOMMENDATIONS.short_description}</code>
                    <CopyButton text={ASO_RECOMMENDATIONS.short_description} />
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold mb-1">Promotional Text (iOS)</p>
                  <div className="flex items-start gap-2">
                    <code className="flex-1 bg-black/30 rounded p-2 text-amber-300 text-[10px]">{ASO_RECOMMENDATIONS.promotional_text}</code>
                    <CopyButton text={ASO_RECOMMENDATIONS.promotional_text} />
                  </div>
                </div>
                <button onClick={handleStartFromTemplate} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition-colors">
                  <Copy size={13} /> Start New Listing from This Template
                </button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-500/10 grid md:grid-cols-3 gap-3 text-[11px] text-slate-400">
              <div className="flex gap-2"><Star size={12} className="text-amber-400 flex-shrink-0 mt-0.5" /><span>Put your strongest keyword first in the title — Apple/Google weight early keywords more heavily.</span></div>
              <div className="flex gap-2"><TrendingUp size={12} className="text-amber-400 flex-shrink-0 mt-0.5" /><span>Don't repeat words from the title in the iOS keywords field — it wastes characters.</span></div>
              <div className="flex gap-2"><BarChart3 size={12} className="text-amber-400 flex-shrink-0 mt-0.5" /><span>Update screenshots & promotional text regularly — no new review needed for promo text.</span></div>
            </div>
          </div>
        )}

        {/* Platform Tabs */}
        <div className="flex gap-2 mb-5">
          {PLATFORMS.map(p => {
            const count = listings.filter(l => l.platform === p.id).length;
            const isActive = activePlatform === p.id;
            return (
              <button key={p.id} onClick={() => setActivePlatform(p.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${isActive ? `${p.bg} ${p.color} ${p.border}` : "bg-white/[0.02] text-slate-500 border-white/5 hover:bg-white/5"}`}>
                <Smartphone size={15} /> {p.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/10" : "bg-white/5"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Listings List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw size={20} className="animate-spin text-slate-600" />
          </div>
        ) : platformListings.length === 0 ? (
          <div className="rounded-2xl bg-[#0d1120] border border-white/5 p-10 text-center">
            <Search size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-1">No {PLATFORMS.find(p => p.id === activePlatform)?.label} listings yet</p>
            <p className="text-slate-600 text-xs mb-4">Create your first listing or start from the ASO template</p>
            <div className="flex justify-center gap-2">
              <button onClick={handleNewListing} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 text-gray-950 text-xs font-bold hover:bg-cyan-400 transition-colors">
                <Plus size={14} /> Create Listing
              </button>
              <button onClick={handleStartFromTemplate} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10 transition-colors">
                <Copy size={14} /> Use Template
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {platformListings.map(listing => {
              const sc = statusConfig[listing.status] || statusConfig.draft;
              return (
                <div key={listing.id} className="rounded-2xl bg-[#0d1120] border border-white/5 p-4 hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-sm text-white truncate">{listing.app_title || "Untitled"}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${sc.color}`}>{sc.label}</span>
                        {listing.version && <span className="text-[10px] text-slate-600">v{listing.version}</span>}
                        <span className="text-[10px] text-slate-600">{listing.locale}</span>
                      </div>
                      {listing.subtitle && <p className="text-slate-400 text-xs mb-1">{listing.subtitle}</p>}
                      {listing.target_keywords && listing.target_keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {listing.target_keywords.slice(0, 5).map((kw, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">{kw}</span>
                          ))}
                          {listing.target_keywords.length > 5 && <span className="text-[10px] text-slate-600">+{listing.target_keywords.length - 5} more</span>}
                        </div>
                      )}
                      {listing.last_updated && (
                        <p className="text-slate-600 text-[10px] mt-2">Updated {new Date(listing.last_updated).toLocaleDateString()}</p>
                      )}
                    </div>
                    <button onClick={() => handleEdit(listing)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors flex-shrink-0">
                      <Edit3 size={13} /> Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit/Create Form Modal */}
        {showForm && editingListing && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setShowForm(false)}>
            <div className="bg-[#0d1120] border border-white/10 rounded-t-2xl md:rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {/* Form Header */}
              <div className="sticky top-0 z-10 bg-[#0d1120] border-b border-white/5 px-5 py-4 flex items-center justify-between">
                <h2 className="font-bold text-sm">{editingListing.id ? "Edit Listing" : "New Listing"} — {PLATFORMS.find(p => p.id === editingListing.platform)?.label}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Status & Locale */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Status</label>
                    <select value={editingListing.status} onChange={e => setEditingListing({...editingListing, status: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                      <option value="draft">Draft</option>
                      <option value="in_review">In Review</option>
                      <option value="live">Live</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Locale</label>
                    <input value={editingListing.locale || ""} onChange={e => setEditingListing({...editingListing, locale: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" placeholder="en-US" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Version</label>
                    <input value={editingListing.version || ""} onChange={e => setEditingListing({...editingListing, version: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" placeholder="1.0.0" />
                  </div>
                </div>

                {/* App Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-medium">App Title</label>
                    <CharCounter value={editingListing.app_title} max={activeLimits.app_title} />
                  </div>
                  <input value={editingListing.app_title || ""} onChange={e => setEditingListing({...editingListing, app_title: e.target.value.slice(0, activeLimits.app_title)})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" placeholder="VoxDigits: Virtual Phone Number & eSIM" />
                </div>

                {/* Subtitle (iOS) / Short Description (Android) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-medium">{activePlatform === "ios" ? "Subtitle" : "Short Description"}</label>
                    <CharCounter value={activePlatform === "ios" ? editingListing.subtitle : editingListing.short_description} max={activePlatform === "ios" ? activeLimits.subtitle : activeLimits.short_description} />
                  </div>
                  <input value={activePlatform === "ios" ? (editingListing.subtitle || "") : (editingListing.short_description || "")} onChange={e => {
                    const key = activePlatform === "ios" ? "subtitle" : "short_description";
                    setEditingListing({...editingListing, [key]: e.target.value.slice(0, activePlatform === "ios" ? activeLimits.subtitle : activeLimits.short_description)});
                  }} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" placeholder="Private 2nd Number, SMS, Calling & eSIM" />
                </div>

                {/* iOS Keywords Field */}
                {activePlatform === "ios" && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-slate-400 font-medium">Keywords Field (comma-separated)</label>
                      <CharCounter value={editingListing.keywords_field} max={activeLimits.keywords_field} />
                    </div>
                    <textarea value={editingListing.keywords_field || ""} onChange={e => setEditingListing({...editingListing, keywords_field: e.target.value.slice(0, 100)})} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono" placeholder="virtual number,second phone number,burner,esim,travel" />
                    <p className="text-[10px] text-slate-600 mt-1">Don't repeat words from your title. Use singular forms. Max 100 characters.</p>
                  </div>
                )}

                {/* Promotional Text (iOS only) */}
                {activePlatform === "ios" && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-slate-400 font-medium">Promotional Text</label>
                      <CharCounter value={editingListing.promotional_text} max={activeLimits.promotional_text} />
                    </div>
                    <textarea value={editingListing.promotional_text || ""} onChange={e => setEditingListing({...editingListing, promotional_text: e.target.value.slice(0, 170)})} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" placeholder="Updates without new app review!" />
                  </div>
                )}

                {/* Target Keywords */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Target Keywords (for tracking)</label>
                  <input value={(editingListing.target_keywords || []).join(", ")} onChange={e => setEditingListing({...editingListing, target_keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean)})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" placeholder="virtual number, us phone number, esim data" />
                  <p className="text-[10px] text-slate-600 mt-1">Comma-separated keywords you want to track rankings for.</p>
                </div>

                {/* Full Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-medium">Full Description</label>
                    <CharCounter value={editingListing.full_description} max={activeLimits.full_description} />
                  </div>
                  <textarea value={editingListing.full_description || ""} onChange={e => setEditingListing({...editingListing, full_description: e.target.value})} rows={10} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono" placeholder="Write your full app description..." />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Internal Notes</label>
                  <textarea value={editingListing.notes || ""} onChange={e => setEditingListing({...editingListing, notes: e.target.value})} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" placeholder="A/B test notes, performance observations..." />
                </div>
              </div>

              {/* Form Footer */}
              <div className="sticky bottom-0 bg-[#0d1120] border-t border-white/5 px-5 py-4 flex items-center justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-white/5 text-slate-400 text-xs font-semibold hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 text-gray-950 text-xs font-bold hover:bg-cyan-400 transition-colors">
                  <Save size={14} /> Save Listing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}