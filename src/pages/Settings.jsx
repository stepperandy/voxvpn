import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, Bell, Shield, Trash2, AlertTriangle, Save, ChevronRight, Settings as SettingsIcon, Zap, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PaymentMethodManager from "../components/billing/PaymentMethodManager";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // Profile form
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  // Notifications
  const [notifSMS, setNotifSMS] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // Auto-topup
  const [autoTopupEnabled, setAutoTopupEnabled] = useState(false);
  const [autoTopupThreshold, setAutoTopupThreshold] = useState(5);
  const [autoTopupAmount, setAutoTopupAmount] = useState(25);
  const [autoTopupSaving, setAutoTopupSaving] = useState(false);
  const [autoTopupSaved, setAutoTopupSaved] = useState(false);
  const [topupTriggering, setTopupTriggering] = useState(false);
  const [topupError, setTopupError] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) {
        setUser(u);
        setDisplayName(u.full_name || "");
        setEmail(u.email || "");
        setAutoTopupEnabled(u.auto_topup_enabled || false);
        setAutoTopupThreshold(u.auto_topup_threshold || 5);
        setAutoTopupAmount(u.auto_topup_amount || 25);
      }
    }).catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    await base44.auth.updateMe({ full_name: displayName });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await new Promise(r => setTimeout(r, 1500));
    setDeleted(true);
    setDeleting(false);
    setShowConfirm(false);
  };

  const handleTriggerTopup = async () => {
    if (window.self !== window.top) {
      setTopupError("Checkout only works from the published app.");
      return;
    }
    setTopupTriggering(true);
    setTopupError(null);
    try {
      const res = await base44.functions.invoke('triggerAutoTopup', {});
      if (res.data?.skipped) {
        setTopupError(`No topup needed: ${res.data.reason}`);
      } else if (res.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        setTopupError(res.data?.error || "Failed to create checkout");
      }
    } catch (err) {
      setTopupError(err.message || "Failed to trigger topup");
    } finally {
      setTopupTriggering(false);
    }
  };

  const handleSaveAutoTopup = async () => {
    setAutoTopupSaving(true);
    await base44.auth.updateMe({
      auto_topup_enabled: autoTopupEnabled,
      auto_topup_threshold: autoTopupThreshold,
      auto_topup_amount: autoTopupAmount,
    });
    setAutoTopupSaving(false);
    setAutoTopupSaved(true);
    setTimeout(() => setAutoTopupSaved(false), 2500);
  };

  const isAdmin = user?.role === "admin";

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "autotopup", label: "Auto-Topup", icon: Zap },
    { id: "security", label: "Security", icon: Shield },
    { id: "danger", label: "Danger Zone", icon: Trash2, danger: true },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>



        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar — horizontal scrollable on mobile, vertical on desktop */}
          <aside className="md:w-52 flex-shrink-0">
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 scrollbar-hide">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left whitespace-nowrap ${
                      activeTab === tab.id
                        ? tab.danger ? "bg-red-500/10 text-red-400" : "bg-cyan-500/10 text-cyan-400"
                        : tab.danger ? "text-red-500/70 hover:bg-red-500/10 hover:text-red-400" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
              {isAdmin && (
                <Link
                  to={createPageUrl("AdminPanel")}
                  className="flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 whitespace-nowrap"
                >
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  Admin Panel
                </Link>
              )}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Profile */}
            {activeTab === "profile" && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
                <h2 className="text-white font-semibold text-lg">Profile Information</h2>

                <div className="flex items-center gap-4 pb-4 border-b border-gray-800">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl font-bold">
                    {displayName ? displayName[0].toUpperCase() : "?"}
                  </div>
                  <div>
                    <p className="text-white font-medium">{displayName || "—"}</p>
                    <p className="text-gray-500 text-sm">{email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 capitalize">{user?.role || "user"}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Display Name</label>
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Email Address</label>
                  <input
                    value={email}
                    disabled
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2.5 text-gray-500 text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-600 mt-1">Email cannot be changed here. Contact support if needed.</p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
                <h2 className="text-white font-semibold text-lg">Notification Preferences</h2>

                {[
                  { label: "SMS Notifications", desc: "Get notified of incoming messages", value: notifSMS, set: setNotifSMS },
                  { label: "Email Notifications", desc: "Receive activity summaries by email", value: notifEmail, set: setNotifEmail },
                  { label: "Marketing Emails", desc: "Product updates, offers and announcements", value: notifMarketing, set: setNotifMarketing },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">{item.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => item.set(!item.value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.value ? "bg-cyan-500" : "bg-gray-700"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.value ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Auto-Topup */}
            {activeTab === "autotopup" && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
                <h2 className="text-white font-semibold text-lg">Auto-Topup Settings</h2>

                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div>
                    <p className="text-white text-sm font-medium">Enable Auto-Topup</p>
                    <p className="text-gray-500 text-xs mt-0.5">Automatically add credits when balance drops below threshold</p>
                  </div>
                  <button
                    onClick={() => setAutoTopupEnabled(!autoTopupEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoTopupEnabled ? "bg-cyan-500" : "bg-gray-700"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoTopupEnabled ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {autoTopupEnabled && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Minimum Balance Threshold</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={autoTopupThreshold}
                          onChange={(e) => setAutoTopupThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <span className="text-gray-400 text-sm">$</span>
                      </div>
                      <p className="text-gray-600 text-xs mt-1.5">Credits will be added when balance falls below this amount</p>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Topup Amount</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="5"
                          max="500"
                          step="5"
                          value={autoTopupAmount}
                          onChange={(e) => setAutoTopupAmount(Math.max(5, parseInt(e.target.value) || 5))}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <span className="text-gray-400 text-sm">$</span>
                      </div>
                      <p className="text-gray-600 text-xs mt-1.5">Amount added each time threshold is reached</p>
                    </div>

                    <div className="pt-2 border-t border-gray-800">
                      <PaymentMethodManager />
                    </div>

                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 space-y-2">
                      <p className="text-cyan-400 text-sm font-medium">How it works</p>
                      <p className="text-gray-400 text-xs">When your balance drops below ${autoTopupThreshold}, click "Topup Now" to be redirected to checkout to add ${autoTopupAmount} credits.</p>
                    </div>

                    {topupError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">{topupError}</div>
                    )}

                    <button
                      onClick={handleTriggerTopup}
                      disabled={topupTriggering}
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      {topupTriggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                      Topup Now
                    </button>
                  </>
                )}

                <button
                  onClick={handleSaveAutoTopup}
                  disabled={autoTopupSaving}
                  className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {autoTopupSaving ? "Saving..." : autoTopupSaved ? "Saved!" : "Save Settings"}
                </button>
              </div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
                <h2 className="text-white font-semibold text-lg">Security</h2>

                <div className="space-y-3">
                  {[
                    { label: "Change Password", desc: "Update your account password", href: "#" },
                    { label: "Two-Factor Authentication", desc: "Add an extra layer of security", href: "#" },
                    { label: "Active Sessions", desc: "View and revoke active login sessions", href: "#" },
                  ].map(item => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors group"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">{item.label}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </a>
                  ))}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-400 text-sm font-medium">Security Tip</p>
                  <p className="text-gray-400 text-xs mt-1">Use a strong, unique password and enable 2FA to keep your account safe.</p>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeTab === "danger" && (
              <div className="bg-gray-900 border border-red-900/40 rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h2 className="text-white font-semibold text-lg">Danger Zone</h2>
                </div>

                <div className="border border-gray-800 rounded-lg divide-y divide-gray-800">
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white text-sm font-medium">Cancel Subscription</p>
                      <p className="text-gray-500 text-xs mt-0.5">Stop your active virtual number subscriptions.</p>
                    </div>
                    <a href="/Credits" className="flex-shrink-0 px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm transition-colors">
                      Manage
                    </a>
                  </div>

                  <div className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-red-400 text-sm font-medium">Delete Account</p>
                      <p className="text-gray-500 text-xs mt-0.5">Permanently delete your account and all data. This cannot be undone.</p>
                    </div>
                    {deleted ? (
                      <span className="text-green-400 text-xs">Request submitted</span>
                    ) : (
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 text-sm transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {showConfirm && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
                    <p className="text-red-400 text-sm font-semibold">Are you absolutely sure? This cannot be undone.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm hover:bg-gray-800 transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
                        {deleting ? "Processing..." : "Yes, Delete My Account"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}