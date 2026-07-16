import React, { useState } from "react";
import { X, Send, Loader2, CheckCircle2, Wifi, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = [
  { value: "activation", label: "Can't Activate eSIM" },
  { value: "connection_dropped", label: "Connection Keeps Dropping" },
  { value: "data_issues", label: "Data Not Working" },
  { value: "slow_speeds", label: "Slow Speeds" },
  { value: "device_compatibility", label: "Device Compatibility" },
  { value: "billing", label: "Billing Issue" },
  { value: "other", label: "Other" },
];

export default function ESimTicketModal({ esim, onClose }) {
  const [form, setForm] = useState({
    category: "data_issues",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) { setError("Please describe your issue."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("submitTicket", {
        title: `${CATEGORIES.find(c => c.value === form.category)?.label} — ${esim.product_name || esim.iccid}`,
        description: form.description,
        category: form.category,
        iccid: esim.iccid,
        esim_id: esim.id,
      });
      if (res.data?.success) {
        setSubmitted(true);
      } else {
        setError(res.data?.error || "Submission failed. Please try again.");
      }
    } catch (err) {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl text-white shadow-2xl"
        style={{ background: "#0d1b2e", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">Report an Issue</h2>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <Wifi className="w-3 h-3 text-cyan-400" />
                {esim.product_name || "eSIM"} · <span className="font-mono">{esim.iccid?.slice(-8)}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="font-bold text-white text-lg mb-1">Ticket Submitted!</h3>
            <p className="text-gray-400 text-sm mb-6">Our team has been notified and will respond shortly via email.</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-950 transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* ICCID (read-only) */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">ICCID</label>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-cyan-300 select-text">
                {esim.iccid}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Issue Category</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className="text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={form.category === cat.value
                      ? { background: "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(139,92,246,0.25))", border: "1px solid rgba(6,182,212,0.5)", color: "#67e8f9" }
                      : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }
                    }
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Describe Your Issue</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What's happening? When did it start? What have you tried?"
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-gray-950 transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}