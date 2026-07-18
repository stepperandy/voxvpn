import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, CheckCircle2, X, Eye, Loader2, AlertCircle, Clock } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
  needs_review: "bg-orange-500/20 text-orange-300",
};

export default function AdminKYC() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filter, setFilter] = useState("pending");

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await base44.asServiceRole.entities.KYCVerification.list("-created_date", 200);
      setRecords(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (action === "reject" && !rejectionReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }
    setReviewing(true);
    try {
      await base44.functions.invoke("reviewKYC", {
        kyc_id: selected.id,
        action,
        rejection_reason: rejectionReason,
      });
      await loadRecords();
      setSelected(null);
      setRejectionReason("");
    } catch (err) {
      alert("Failed to submit review");
    } finally {
      setReviewing(false);
    }
  };

  const filtered = records.filter(r => filter === "all" || r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" /> KYC Verifications
        </h2>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected", "needs_review"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === s ? "bg-cyan-500 text-gray-950" : "bg-white/5 text-gray-400 hover:text-white"}`}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.length === 0 && <p className="text-gray-500 text-center py-8">No records found</p>}
          {filtered.map(kyc => (
            <div key={kyc.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${STATUS_COLORS[kyc.status]}`}>
                  {kyc.status.replace("_", " ")}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{kyc.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{kyc.user_email} · {kyc.nationality} · {kyc.id_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                <span>{new Date(kyc.created_date).toLocaleDateString()}</span>
                <button onClick={() => { setSelected(kyc); setRejectionReason(""); }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#0d2137] border border-gray-700 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">KYC Review</h3>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="space-y-3 mb-5">
              {[
                ["Name", selected.full_name],
                ["Email", selected.user_email],
                ["DOB", selected.date_of_birth],
                ["Nationality", selected.nationality],
                ["ID Type", selected.id_type?.replace("_", " ")],
                ["ID Number", selected.id_number],
                ["Address", selected.address],
                ["Status", selected.status],
              ].map(([label, value]) => value && (
                <div key={label} className="flex gap-3">
                  <span className="text-xs text-gray-500 w-24 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm text-white capitalize">{value}</span>
                </div>
              ))}
            </div>

            {/* Document images */}
            <div className="space-y-3 mb-5">
              {[["ID Front", selected.id_front_url], ["ID Back", selected.id_back_url], ["Selfie", selected.selfie_url]].map(([label, url]) => url && (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={label} className="w-full rounded-lg border border-gray-700 max-h-48 object-cover hover:opacity-90 transition-opacity" />
                  </a>
                </div>
              ))}
            </div>

            {selected.status === "pending" || selected.status === "needs_review" ? (
              <div className="space-y-3">
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Rejection reason (required if rejecting)"
                  rows={2}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={() => handleAction("approve")} disabled={reviewing}
                    className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                    {reviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                  </button>
                  <button onClick={() => handleAction("needs_review")} disabled={reviewing}
                    className="flex-1 py-2 rounded-lg bg-orange-500/80 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                    <AlertCircle className="w-4 h-4" /> Needs Review
                  </button>
                  <button onClick={() => handleAction("reject")} disabled={reviewing}
                    className="flex-1 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className={`p-3 rounded-lg text-sm font-semibold text-center capitalize ${STATUS_COLORS[selected.status]}`}>
                {selected.status} {selected.reviewed_at && `on ${new Date(selected.reviewed_at).toLocaleDateString()}`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}