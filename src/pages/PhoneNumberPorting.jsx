import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Phone, Building2, FileText, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";

const PROVIDERS = [
  "AT&T",
  "Verizon",
  "T-Mobile",
  "US Cellular",
  "Cricket Wireless",
  "Boost Mobile",
  "Metro by T-Mobile",
  "Mint Mobile",
  "Google Fi",
  "Other"
];

export default function PhoneNumberPorting() {
  const [formData, setFormData] = useState({
    current_provider: "",
    phone_number: "",
    reason_for_porting: ""
  });
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (err) {
        setError("Unable to verify your identity. Please log in first.");
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (documents.length + files.length > 5) {
      setError("Maximum 5 documents allowed");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedDocs = [];
      for (const file of files) {
        const response = await base44.integrations.Core.UploadFile({ file });
        uploadedDocs.push({
          name: file.name,
          url: response.file_url
        });
      }
      setDocuments(prev => [...prev, ...uploadedDocs]);
    } catch (err) {
      setError("Failed to upload document. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to submit a porting request.");
      return;
    }

    if (!formData.current_provider || !formData.phone_number || documents.length === 0) {
      setError("Please fill in all required fields and upload at least one document.");
      return;
    }

    // Validate phone number format (basic)
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await base44.entities.PortingRequest.create({
        user_email: user.email,
        current_provider: formData.current_provider,
        phone_number: formData.phone_number,
        reason_for_porting: formData.reason_for_porting,
        document_urls: documents.map(doc => doc.url),
        status: "pending"
      });
      setSuccess(true);
      setFormData({ current_provider: "", phone_number: "", reason_for_porting: "" });
      setDocuments([]);
    } catch (err) {
      setError("Failed to submit request. Please try again.");
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-3 bg-green-500/20 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Request Submitted</h2>
            <p className="text-gray-400 mb-6">
              Your phone number porting request has been received. Our team will review your documents and contact you within 2-3 business days.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Port Your Phone Number</h1>
          <p className="text-gray-400">
            Transfer your existing phone number to our service. We handle the porting process for you.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Provider */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Current Provider *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <select
                name="current_provider"
                value={formData.current_provider}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                required
              >
                <option value="">Select your current provider</option>
                {PROVIDERS.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Phone Number to Port *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                required
              />
            </div>
          </div>

          {/* Reason for Porting */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Reason for Porting (Optional)</label>
            <textarea
              name="reason_for_porting"
              value={formData.reason_for_porting}
              onChange={handleInputChange}
              placeholder="Tell us why you're switching to our service..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 resize-none"
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Proof of Ownership Documents *</label>
            <p className="text-xs text-gray-400 mb-3">
              Upload recent bills or documents showing you're the account holder (PDF, JPG, PNG). Maximum 5 files.
            </p>

            {/* Upload Area */}
            <div className="relative mb-4">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                disabled={uploading || documents.length >= 5}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-cyan-500/50 transition-colors">
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-white font-medium">
                  {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB each</p>
              </div>
            </div>

            {/* Uploaded Documents */}
            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-gray-300 truncate">{doc.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-400">
                  {documents.length} of 5 documents uploaded
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || uploading || !user}
            className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Porting Request"
            )}
          </button>

          {/* Info Box */}
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
            <p className="text-xs text-gray-300">
              <strong>Next Steps:</strong> After submitting, our team will verify your documents and contact you within 2-3 business days. You'll need an authorization code (PIN) from your current provider to complete the porting process.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}