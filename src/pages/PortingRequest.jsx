import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Upload, Phone, Building2, FileText, CheckCircle2,
  AlertCircle, Loader2, X, ArrowLeft, Info, Shield,
  Clock, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const PROVIDERS = [
  "AT&T", "Verizon", "T-Mobile", "US Cellular", "Cricket Wireless",
  "Boost Mobile", "Metro by T-Mobile", "Mint Mobile", "Google Fi",
  "EE (UK)", "O2 (UK)", "Vodafone (UK)", "Three (UK)",
  "Telstra (AU)", "Optus (AU)", "Vodafone (AU)",
  "Rogers (CA)", "Bell (CA)", "Telus (CA)",
  "Other"
];

const STEPS_OVERVIEW = [
  { step: "1", title: "Submit Request", desc: "Fill in your number details and upload proof of ownership." },
  { step: "2", title: "Verification", desc: "Our team reviews your documents within 2–3 business days." },
  { step: "3", title: "Authorization", desc: "Obtain your number transfer PIN from your current provider." },
  { step: "4", title: "Port Complete", desc: "Your number is transferred and active on VoxDigits." },
];

export default function PortingRequest() {
  const [formData, setFormData] = useState({
    current_provider: "",
    phone_number: "",
    account_number: "",
    account_pin: "",
    account_holder_name: "",
    reason_for_porting: "",
  });
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadFiles = async (files) => {
    if (documents.length + files.length > 5) {
      setError("Maximum 5 documents allowed.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const uploaded = [];
      for (const file of files) {
        const res = await base44.integrations.Core.UploadFile({ file });
        uploaded.push({ name: file.name, url: res.file_url, size: file.size });
      }
      setDocuments(prev => [...prev, ...uploaded]);
    } catch {
      setError("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    uploadFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setError("Please log in to submit a porting request."); return; }
    if (!formData.current_provider || !formData.phone_number || !formData.account_holder_name) {
      setError("Please fill in all required fields."); return;
    }
    if (documents.length === 0) { setError("Please upload at least one proof of ownership document."); return; }

    const phoneRegex = /^\+?[\d\s\-()+]{7,}$/;
    if (!phoneRegex.test(formData.phone_number)) { setError("Please enter a valid phone number."); return; }

    setSubmitting(true);
    setError(null);
    try {
      await base44.entities.PortingRequest.create({
        user_email: user.email,
        current_provider: formData.current_provider,
        phone_number: formData.phone_number,
        reason_for_porting: [
          formData.account_holder_name && `Account Holder: ${formData.account_holder_name}`,
          formData.account_number && `Account #: ${formData.account_number}`,
          formData.account_pin && `Transfer PIN: ${formData.account_pin}`,
          formData.reason_for_porting && `Notes: ${formData.reason_for_porting}`,
        ].filter(Boolean).join(" | "),
        document_urls: documents.map(d => d.url),
        status: "pending",
      });
      setSuccess(true);
    } catch {
      setError("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-gray-400 text-sm mb-6">You must be logged in to submit a porting request.</p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors"
          >
            Login / Sign Up
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Request Submitted!</h2>
          <p className="text-gray-400 mb-2">Your porting request has been received and is under review.</p>
          <p className="text-gray-500 text-sm mb-8">Our team will verify your documents and contact you at <span className="text-cyan-400">{user?.email}</span> within 2–3 business days.</p>
          <div className="space-y-2 text-left bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">What happens next</p>
            {STEPS_OVERVIEW.slice(1).map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0 mt-0.5">{s.step}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/ServicesDashboard" className="inline-block px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back */}
        <Link to="/ServicesDashboard" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Port Your Number</h1>
          <p className="text-gray-400">Transfer your existing phone number to VoxDigits. Keep your number, switch your service.</p>
        </div>

        {/* Process Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {STEPS_OVERVIEW.map((s, i) => (
            <div key={s.step} className="relative">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                <div className="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400 mb-2">{s.step}</div>
                <p className="text-sm font-semibold text-white">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
              {i < STEPS_OVERVIEW.length - 1 && (
                <ChevronRight className="hidden md:block absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-700 z-10" />
              )}
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 mb-8">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-300">
            <strong className="text-white">Before you begin:</strong> Contact your current provider to get your account number and request a number transfer PIN (also called a port-out PIN or PAC code). You'll need these details below.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section: Number Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400" /> Number Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Provider <span className="text-red-400">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <select
                  name="current_provider"
                  value={formData.current_provider}
                  onChange={handleInput}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 appearance-none"
                >
                  <option value="">Select your current carrier</option>
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number to Port <span className="text-red-400">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInput}
                  placeholder="+1 (555) 123-4567"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Section: Account Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" /> Account Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Account Holder Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="account_holder_name"
                value={formData.account_holder_name}
                onChange={handleInput}
                placeholder="Full name as it appears on your account"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInput}
                  placeholder="Your carrier account number"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Transfer PIN / PAC Code</label>
                <input
                  type="text"
                  name="account_pin"
                  value={formData.account_pin}
                  onChange={handleInput}
                  placeholder="PIN provided by current carrier"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Additional Notes <span className="text-gray-600">(Optional)</span></label>
              <textarea
                name="reason_for_porting"
                value={formData.reason_for_porting}
                onChange={handleInput}
                placeholder="Any additional details or special instructions..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600 resize-none"
              />
            </div>
          </div>

          {/* Section: Documents */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-green-400" /> Proof of Ownership <span className="text-red-400">*</span>
              </h2>
              <p className="text-xs text-gray-500">Upload a recent bill or official document showing you're the account holder. Accepted formats: PDF, JPG, PNG. Max 5 files.</p>
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-cyan-400 bg-cyan-500/5" : "border-gray-700 hover:border-gray-600"} ${documents.length >= 5 ? "opacity-50 pointer-events-none" : ""}`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInput}
                disabled={uploading || documents.length >= 5}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-sm text-gray-400">Uploading securely...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-500" />
                  <p className="text-sm font-medium text-white">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-500">PDF, JPG, PNG — up to 10MB each</p>
                </div>
              )}
            </div>

            {/* Uploaded Files */}
            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300 truncate">{doc.name}</span>
                      {doc.size && <span className="text-xs text-gray-600 flex-shrink-0">{formatFileSize(doc.size)}</span>}
                    </div>
                    <button type="button" onClick={() => setDocuments(prev => prev.filter((_, j) => j !== i))} className="p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-500">{documents.length}/5 documents uploaded</p>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-green-500/8 border border-green-500/20 rounded-xl">
              <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">Your documents are encrypted and stored securely. They are used solely for number ownership verification.</p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-gray-950 font-bold rounded-xl text-sm transition-colors"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Clock className="w-4 h-4" /> Submit Porting Request</>}
          </button>

          <p className="text-xs text-gray-600 text-center">
            By submitting, you confirm you are the authorized account holder for this number.
          </p>
        </form>
      </div>
    </div>
  );
}