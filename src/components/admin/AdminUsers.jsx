import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Users, Search, ShieldCheck, User, Zap, X, CheckCircle, XCircle, MailCheck } from "lucide-react";

function AddCreditsModal({ user, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const credits = parseFloat(amount);
    if (!credits || credits <= 0) return;
    setSaving(true);
    try {
      const newBalance = (user.credits || 0) + credits;
      await base44.entities.User.update(user.id, { credits: newBalance });
      await base44.entities.Transaction.create({
        user_email: user.email,
        type: "credit",
        category: "top_up",
        amount: credits,
        balance_before: user.credits || 0,
        balance_after: newBalance,
        description: `Manual credit added by admin`,
        status: "completed",
      });
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "VoxDigits – Credits Added to Your Account 💳",
        body: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
  <h2 style="color:#22d3ee;">Credits Added!</h2>
  <p style="color:#cbd5e1;">Hi ${user.full_name || user.email},</p>
  <p style="color:#cbd5e1;"><strong style="color:#22d3ee;">$${credits.toFixed(2)}</strong> has been added to your VoxDigits account.</p>
  <p style="color:#cbd5e1;">Your new balance is <strong style="color:#22d3ee;">$${newBalance.toFixed(2)}</strong>.</p>
  <p style="color:#cbd5e1;">You can use your credits to purchase eSIM data plans and virtual numbers.</p>
  <p style="color:#64748b;font-size:12px;margin-top:24px;">— The VoxDigits Team</p>
</div>`
      });
      onSuccess(user.id, newBalance);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Add Credits</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Adding credits to <span className="text-cyan-400 font-medium">{user.email}</span><br />
          Current balance: <span className="text-white font-semibold">${(user.credits || 0).toFixed(2)}</span>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block">Amount (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 10.00"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-700 text-gray-400 rounded-lg text-sm hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !amount || parseFloat(amount) <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Add Credits
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creditModal, setCreditModal] = useState(null);

  useEffect(() => {
    base44.entities.User.list("-created_date", 200)
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleToggle = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await base44.entities.User.update(user.id, { role: newRole });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivationToggle = async (user) => {
    const newActivated = user.activated === false ? true : false;
    try {
      await base44.entities.User.update(user.id, { activated: newActivated });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, activated: newActivated } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBypassVerificationToggle = async (user) => {
    const currentVal = user.bypass_verification === true; // only true means skip verify
    const newVal = !currentVal;
    try {
      await base44.entities.User.update(user.id, { bypass_verification: newVal });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, bypass_verification: newVal } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreditsSuccess = (userId, newBalance) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, credits: newBalance } : u));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>;

  return (
    <div>
      {creditModal && (
        <AddCreditsModal
          user={creditModal}
          onClose={() => setCreditModal(null)}
          onSuccess={handleCreditsSuccess}
        />
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
        />
      </div>

      <p className="text-xs text-gray-500 mb-4">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">
                  {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user.full_name || "—"}</p>
                  <p className="text-gray-500 text-xs truncate">{user.email}</p>
                  <p className="text-cyan-400 text-xs font-semibold">${(user.credits || 0).toFixed(2)} credits</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  user.activated === false ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                }`}>
                  {user.activated === false ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                  {user.activated === false ? "Pending" : "Active"}
                </span>
                <button
                  onClick={() => handleActivationToggle(user)}
                  className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                    user.activated === false
                      ? "border-green-600 text-green-400 hover:bg-green-600/20"
                      : "border-red-700 text-red-400 hover:bg-red-700/20"
                  }`}
                >
                  {user.activated === false ? "Activate" : "Deactivate"}
                </button>
                <button
                  onClick={() => handleBypassVerificationToggle(user)}
                  title={user.bypass_verification === true ? "Click to require email verification" : "Click to allow login without email verification"}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                    user.bypass_verification === true
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                      : "border-gray-700 text-gray-500 hover:bg-gray-700"
                  }`}
                >
                  <MailCheck className="w-3 h-3" />
                  {user.bypass_verification === true ? "Skip Verify" : "Needs Verify"}
                </button>
                <button
                  onClick={() => setCreditModal(user)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors"
                >
                  <Zap className="w-3 h-3" /> Add Credits
                </button>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === "admin" ? "bg-purple-500/20 text-purple-300" : "bg-gray-700 text-gray-400"
                }`}>
                  {user.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {user.role || "user"}
                </span>
                <button
                  onClick={() => handleRoleToggle(user)}
                  className="px-3 py-1.5 text-xs border border-gray-700 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  {user.role === "admin" ? "Demote" : "Make Admin"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}