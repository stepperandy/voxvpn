import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Upload, X, Loader2, CheckCircle2, AlertCircle, Clock, FileText } from "lucide-react";

const ID_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID Card" },
  { value: "drivers_license", label: "Driver's License" },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Spain", "Italy", "Brazil", "Mexico",
  "India", "Japan", "South Korea", "Singapore", "UAE", "South Africa", "Other"
];

function StatusBanner({ status, reason }) {
  const configs = {
    pending: { icon: Clock, color: "border-yellow-500/30 bg-yellow-500/10", text: "text-yellow-300", label: "Under Review", msg: "Your documents are being reviewed. This typically takes 1–2 business days." },
    approved: { icon: CheckCircle2, color: "border-emerald-500/30 bg-emerald-500/10", text: "text-emerald-300", label: "Verified ✓", msg: "Your identity has been successfully verified." },
    rejected: { icon: AlertCircle, color: "border-red-500/30 bg-red-500/10", text: "text-red-300", label: "Rejected", msg: reason || "Your verification was rejected. Please re-submit." },
    needs_review: { icon: AlertCircle, color: "border-orange-500/30 bg-orange-500/10", text: "text-orange-300", label: "Additional Info Needed", msg: "Our team will contact you with further instructions." },
  };
  const cfg = configs[status];
  const Icon = cfg.icon;
  return (
    <div className={`rounded-xl border p-5 flex items-start gap-4 ${cfg.color}`}>
      <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${cfg.text}`} />
      <div>
        <p className={`font-bold text-lg ${cfg.text}`}>{cfg.label}</p>
        <p className="text-gray-300 text-sm mt-1">{cfg.msg}</p>
      </div>
    </div>
  );
}

export default function KYCVerification() {
  const [user, setUser] = useState(null);
  const [existingKYC, setExistingKYC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: "", date_of_birth: "", nationality: "", id_type: "passport",
    id_number: "", address: "",
  });
  const [files, setFiles] = useState({ id_front: null, id_back: null, selfie: null });
  const [uploading, setUploading] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      setForm(f => ({ ...f, full_name: u.full_name || "" }));
      const kycs = await base44.entities.KYCVerification.filter({ user_email: u.email });
      if (kycs.length > 0) {
        const sorted = kycs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        setExistingKYC(sorted[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (fieldName, file) => {
    setUploading(u => ({ ...u, [fieldName]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFiles(f => ({ ...f, [fieldName]: file_url }));
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading(u => ({ ...u, [fieldName]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.id_front || !files.selfie) {
      setError("Please upload front of ID and a selfie.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await base44.functions.invoke("submitKYC", {
        ...form,
        id_front_url: files.id_front,
        id_back_url: files.id_back || "",
        selfie_url: files.selfie,
      });
      setSuccess(true);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Show status if already submitted and not rejected
  if (existingKYC && existingKYC.status !== 'rejected') {
    return (
      <div className="min-h-screen bg-gray-950 p-6 md:p-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Identity Verification</h1>
          </div>
          <StatusBanner status={existingKYC.status} reason={existingKYC.rejection_reason} />
          {existingKYC.status === 'approved' && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Verified Details</p>
              <p className="text-white font-semibold">{existingKYC.full_name}</p>
              <p className="text-gray-400 text-sm capitalize">{existingKYC.id_type?.replace('_', ' ')} · {existingKYC.nationality}</p>
              <p className="text-gray-600 text-xs">Verified on {new Date(existingKYC.reviewed_at || existingKYC.updated_date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Identity Verification</h1>
        </div>
        <p className="text-gray-400 mb-8">Verify your identity to unlock all VoxDigits features</p>

        {existingKYC?.status === 'rejected' && (
          <div className="mb-6">
            <StatusBanner status="rejected" reason={existingKYC.rejection_reason} />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Personal Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Full Legal Name *</label>
                <input value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  required placeholder="As it appears on your ID" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Date of Birth *</label>
                <input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({...f, date_of_birth: e.target.value}))}
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Nationality *</label>
                <select value={form.nationality} onChange={e => setForm(f => ({...f, nationality: e.target.value}))}
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  required>
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Address</label>
                <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))}
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  placeholder="Your residential address" />
              </div>
            </div>
          </div>

          {/* ID Document */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">ID Document</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">ID Type *</label>
                <select value={form.id_type} onChange={e => setForm(f => ({...f, id_type: e.target.value}))}
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500">
                  {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Document Number *</label>
                <input value={form.id_number} onChange={e => setForm(f => ({...f, id_number: e.target.value}))}
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  required placeholder="e.g. AB1234567" />
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Upload Documents</p>
            {[
              { key: "id_front", label: "Front of ID *", required: true },
              { key: "id_back", label: form.id_type === "passport" ? "Photo Page (optional)" : "Back of ID", required: false },
              { key: "selfie", label: "Selfie Holding ID *", required: true },
            ].map(({ key, label, required }) => (
              <div key={key}>
                <label className="text-sm text-gray-400 block mb-1">{label}</label>
                {files[key] ? (
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-300 flex-1">Uploaded</span>
                    <button type="button" onClick={() => setFiles(f => ({...f, [key]: null}))} className="text-gray-500 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 p-3 border border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-500/50 transition-colors">
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => e.target.files[0] && uploadFile(key, e.target.files[0])} />
                    {uploading[key] ? <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" /> : <Upload className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm text-gray-500">{uploading[key] ? "Uploading..." : "Click to upload (JPG, PNG, PDF)"}</span>
                  </label>
                )}
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-start gap-3">
            <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">Your documents are encrypted and only used for identity verification. We comply with GDPR and do not share your data with third parties.</p>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><ShieldCheck className="w-4 h-4" /> Submit for Verification</>}
          </button>
        </form>
      </div>
    </div>
  );
}