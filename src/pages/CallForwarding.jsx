import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Power, Clock, PhoneForwarded, Plus, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CallForwarding() {
  const [virtualNumbers, setVirtualNumbers] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    virtual_number: "",
    forwarding_number: "",
    destination_type: "phone_number",
    enabled: false,
    forward_unanswered_only: false,
    ring_timeout: 30,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [nums, rulesData] = await Promise.all([
        base44.entities.VirtualNumber.filter({ userId: currentUser.id }),
        base44.entities.CallForwardingRule.filter({ user_email: currentUser.email }),
      ]);

      setVirtualNumbers(nums || []);
      setRules(rulesData || []);
    } catch (err) {
      showMessage("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      virtual_number: rule.virtual_number,
      forwarding_number: rule.forwarding_number,
      destination_type: rule.destination_type,
      enabled: rule.enabled,
      forward_unanswered_only: rule.forward_unanswered_only,
      ring_timeout: rule.ring_timeout || 30,
    });
  };

  const handleNew = () => {
    setEditingRule(null);
    setFormData({
      virtual_number: virtualNumbers[0]?.number || "",
      forwarding_number: "",
      destination_type: "phone_number",
      enabled: false,
      forward_unanswered_only: false,
      ring_timeout: 30,
    });
  };

  const handleSave = async () => {
    if (!formData.virtual_number || !formData.forwarding_number) {
      showMessage("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingRule) {
        await base44.entities.CallForwardingRule.update(editingRule.id, {
          ...formData,
          user_email: user.email,
        });
        showMessage("Call forwarding rule updated");
      } else {
        await base44.entities.CallForwardingRule.create({
          ...formData,
          user_email: user.email,
        });
        showMessage("Call forwarding rule created");
      }
      setEditingRule(null);
      await loadData();
    } catch (err) {
      showMessage(err.message || "Failed to save rule", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruleId) => {
    if (!confirm("Delete this forwarding rule?")) return;
    try {
      await base44.entities.CallForwardingRule.delete(ruleId);
      showMessage("Rule deleted");
      await loadData();
    } catch (err) {
      showMessage("Failed to delete rule", "error");
    }
  };

  const handleToggleEnabled = async (rule) => {
    try {
      await base44.entities.CallForwardingRule.update(rule.id, {
        enabled: !rule.enabled,
      });
      await loadData();
    } catch (err) {
      showMessage("Failed to toggle rule", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}>
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <PhoneForwarded className="w-8 h-8 text-cyan-400" />
            Call Forwarding
          </h1>
          <p className="text-gray-400">Route incoming calls to another number or SIP address</p>
        </div>

        {/* Message Toast */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === "error"
                  ? "bg-red-500/20 border border-red-500/40 text-red-200"
                  : "bg-green-500/20 border border-green-500/40 text-green-200"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        {editingRule !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-700/40 border border-slate-600/50 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingRule ? "Edit Forwarding Rule" : "New Forwarding Rule"}
              </h2>
              <button
                onClick={() => setEditingRule(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Virtual Number */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Virtual Number</label>
                <select
                  value={formData.virtual_number}
                  onChange={(e) => setFormData({ ...formData, virtual_number: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select a number</option>
                  {virtualNumbers.map((num) => (
                    <option key={num.id} value={num.number}>
                      {num.number} ({num.country_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Type */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Destination Type</label>
                <div className="flex gap-3">
                  {["phone_number", "sip_uri"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, destination_type: type })}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        formData.destination_type === type
                          ? "bg-cyan-500 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {type === "phone_number" ? "Phone Number" : "SIP URI"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forwarding Number */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  {formData.destination_type === "phone_number" ? "Forward To" : "SIP Address"}
                </label>
                <input
                  type="text"
                  value={formData.forwarding_number}
                  onChange={(e) => setFormData({ ...formData, forwarding_number: e.target.value })}
                  placeholder={formData.destination_type === "phone_number" ? "+1234567890" : "sip:user@domain.com"}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 placeholder-gray-600"
                />
              </div>

              {/* Ring Timeout */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Ring Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={formData.ring_timeout}
                  onChange={(e) => setFormData({ ...formData, ring_timeout: parseInt(e.target.value) || 30 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
                <p className="text-xs text-gray-500 mt-1">How long to ring before forwarding (10-60 seconds)</p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.forward_unanswered_only}
                    onChange={(e) => setFormData({ ...formData, forward_unanswered_only: e.target.checked })}
                    className="w-4 h-4 rounded accent-cyan-500"
                  />
                  <span className="text-white text-sm font-medium">Only forward unanswered calls</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 rounded accent-cyan-500"
                  />
                  <span className="text-white text-sm font-medium">Enable this rule</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
                <button
                  onClick={() => setEditingRule(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rules List */}
        <div className="space-y-4 mb-6">
          {rules.length === 0 ? (
            <div className="text-center py-12 bg-slate-700/20 border border-slate-600/30 rounded-xl">
              <PhoneForwarded className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No call forwarding rules yet</p>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" /> Create First Rule
              </button>
            </div>
          ) : (
            <>
              {rules.map((rule) => (
                <motion.div
                  key={rule.id}
                  layout
                  className="bg-slate-700/40 border border-slate-600/50 rounded-xl p-5 hover:border-slate-500/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <p className="font-bold text-white text-lg font-mono">{rule.virtual_number}</p>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          rule.enabled
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}>
                          {rule.enabled ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="space-y-2 ml-8">
                        <p className="text-sm text-gray-400">
                          Forwards to: <span className="text-white font-mono">{rule.forwarding_number}</span>
                        </p>
                        {rule.ring_timeout && (
                          <p className="text-sm text-gray-400">
                            Ring timeout: <span className="text-white">{rule.ring_timeout}s</span>
                          </p>
                        )}
                        {rule.forward_unanswered_only && (
                          <p className="text-sm text-gray-400">Unanswered calls only</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleEnabled(rule)}
                        className={`p-2 rounded-lg transition-colors ${
                          rule.enabled
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                        title={rule.enabled ? "Disable" : "Enable"}
                      >
                        <Power className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(rule)}
                        className="px-3 py-2 rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 text-sm font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="px-3 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Add New Button */}
        {editingRule === null && rules.length > 0 && (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full justify-center"
          >
            <Plus className="w-5 h-5" /> Add New Forwarding Rule
          </button>
        )}
      </div>
    </div>
  );
}