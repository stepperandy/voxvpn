import React, { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar.jsx";
import Footer from "@/components/landing/Footer.jsx";
import { base44 } from "@/api/base44Client";
import {
  Mail, LifeBuoy, Shield, CreditCard, Scale, Settings,
  Clock, Loader2, CheckCircle2, ChevronDown, Zap, MessageSquare
} from "lucide-react";

const DEPARTMENTS = [
  {
    icon: LifeBuoy,
    title: "General Support",
    email: "support@voxtelefony.com",
    desc: "Technical issues, account help, feature questions, and product guidance.",
    color: "cyan",
  },
  {
    icon: Settings,
    title: "Administration",
    email: "admin@voxtelefony.com",
    desc: "Account management, user permissions, partnership inquiries, and business operations.",
    color: "violet",
  },
  {
    icon: Shield,
    title: "Privacy",
    email: "privacy@voxtelefony.com",
    desc: "Data protection requests, privacy policy questions, and data deletion inquiries.",
    color: "emerald",
  },
  {
    icon: CreditCard,
    title: "Billing",
    email: "billing@voxtelefony.com",
    desc: "Payments, invoices, subscriptions, refunds, and payment method updates.",
    color: "amber",
  },
  {
    icon: Scale,
    title: "Legal",
    email: "legal@voxtelefony.com",
    desc: "Legal notices, terms of service, compliance, law enforcement, and formal requests.",
    color: "rose",
  },
];

const STATIC_CONTENT = {
  hero_subtitle:
    "VoxTelefony is committed to providing exceptional support across every department. Whether you need help with your virtual numbers, have a billing question, or require legal documentation — our dedicated teams respond promptly to ensure your experience is seamless.",
  faqs: [
    {
      q: "How quickly will I get a response?",
      a: "Our support team typically responds within 2–4 hours during business hours (Mon–Fri, 9am–6pm UTC). For urgent matters, mark your email subject with [URGENT] for priority handling.",
    },
    {
      q: "Which email should I use for my question?",
      a: "Use support@voxtelefony.com for technical or product questions, billing@voxtelefony.com for payment issues, privacy@voxtelefony.com for data requests, admin@voxtelefony.com for account/admin matters, and legal@voxtelefony.com for legal/compliance inquiries.",
    },
    {
      q: "What information should I include in my email?",
      a: "Always include your registered email address, a clear description of the issue, screenshots if applicable, and the virtual number or service affected. This helps us resolve your request faster.",
    },
    {
      q: "Can I request a refund?",
      a: "Yes. Email billing@voxtelefony.com with your order ID and reason for the refund. Refund requests are reviewed within 1–2 business days according to our refund policy.",
    },
    {
      q: "How do I delete my account and data?",
      a: "Send a request to privacy@voxtelefony.com from your registered email. We process data deletion requests within 30 days in compliance with GDPR and CCPA regulations.",
    },
  ],
};

export default function Support() {
  const [aiContent, setAiContent] = useState(null);
  const [loadingAI, setLoadingAI] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", department: "support@voxtelefony.com", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchAIContent();
  }, []);

  const fetchAIContent = async () => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt:
          "You are the help center content writer for VoxTelefony, a service that offers private virtual phone numbers from 60+ countries with contacts, call logs, SMS, voicemail, and call forwarding features. Write rich, professional, customer-friendly content for the Support page. Return a JSON object with: (1) hero_subtitle — a warm 2-3 sentence paragraph explaining how VoxTelefony's support team helps customers with virtual numbers, call forwarding, SMS, and account management; (2) faqs — an array of 5 objects each with 'q' and 'a' fields covering common support questions about virtual numbers (e.g. activation, renewal, call forwarding setup, SMS issues, number porting, account security, billing). Make answers detailed but concise (2-4 sentences).",
        response_json_schema: {
          type: "object",
          properties: {
            hero_subtitle: { type: "string" },
            faqs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  q: { type: "string" },
                  a: { type: "string" },
                },
              },
            },
          },
        },
      });
      setAiContent(response);
    } catch {
      setAiContent(null);
    } finally {
      setLoadingAI(false);
    }
  };

  const heroSubtitle = aiContent?.hero_subtitle || STATIC_CONTENT.hero_subtitle;
  const faqs = aiContent?.faqs?.length ? aiContent.faqs : STATIC_CONTENT.faqs;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus("error: Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: formData.department,
        subject: `Support Request: ${formData.subject}`,
        body: `From: ${formData.name} (${formData.email})\nDepartment: ${formData.department}\n\nMessage:\n${formData.message}`,
      });
      setStatus("success");
      setFormData({ name: "", email: "", department: "support@voxtelefony.com", subject: "", message: "" });
      setTimeout(() => setStatus(""), 4000);
    } catch {
      setStatus("error: Failed to send. Please email us directly.");
      setTimeout(() => setStatus(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const colorMap = {
    cyan: { icon: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", hover: "hover:border-cyan-500/40" },
    violet: { icon: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", hover: "hover:border-violet-500/40" },
    emerald: { icon: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", hover: "hover:border-emerald-500/40" },
    amber: { icon: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", hover: "hover:border-amber-500/40" },
    rose: { icon: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", hover: "hover:border-rose-500/40" },
  };

  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] opacity-30" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <LifeBuoy size={14} className="text-cyan-400" />
            <span className="text-cyan-400 text-xs font-semibold tracking-wide">24/7 SUPPORT CENTER</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
            How Can We <span className="text-cyan-400">Help You?</span>
          </h1>
          {loadingAI ? (
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading personalized support content…</span>
            </div>
          ) : (
            <p className="text-slate-400 text-lg leading-relaxed max-w-3xl mx-auto">{heroSubtitle}</p>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Clock, label: "Avg Response", value: "< 4 hrs" },
            { icon: Zap, label: "Priority Queue", value: "24/7" },
            { icon: CheckCircle2, label: "Resolution Rate", value: "98.5%" },
            { icon: MessageSquare, label: "Languages", value: "5+" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-5 rounded-2xl border border-white/5 bg-[#0d1120] text-center">
              <Icon size={22} className="text-cyan-400 mx-auto mb-2" />
              <p className="text-white text-xl font-black">{value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Department Emails */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">Contact the Right Team</h2>
          <p className="text-slate-400">Each department is staffed by specialists who can resolve your request quickly.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEPARTMENTS.map(({ icon: Icon, title, email, desc, color }) => {
            const c = colorMap[color];
            return (
              <a
                key={email}
                href={`mailto:${email}`}
                className={`group p-6 rounded-2xl border ${c.border} ${c.hover} bg-[#0d1120] transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center mb-4`}>
                  <Icon size={22} className={c.icon} />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                <p className={`${c.icon} text-sm font-semibold mb-2 break-all`}>{email}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-slate-600 group-hover:text-cyan-400 transition-colors">
                  <Mail size={12} />
                  <span>Click to email</span>
                </div>
              </a>
            );
          })}
          <div className="p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 flex flex-col justify-center items-center text-center">
            <Clock size={28} className="text-cyan-400 mb-3" />
            <h3 className="text-white font-bold mb-1">Business Hours</h3>
            <p className="text-slate-400 text-sm">Mon – Fri, 9am – 6pm UTC</p>
            <p className="text-slate-500 text-xs mt-2">Email support monitored 24/7</p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto mb-20">
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8">
          <h2 className="text-white font-bold text-2xl mb-2">Send a Message</h2>
          <p className="text-slate-400 text-sm mb-6">Choose the relevant department and we'll route your request to the right team.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50"
              />
              <input
                type="email"
                placeholder="Your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.email} value={d.email} className="bg-[#0d1120]">
                  {d.title} — {d.email}
                </option>
              ))}
            </select>
            <input
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50"
            />
            <textarea
              placeholder="Describe your issue or question..."
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            {status && (
              <p className={`text-sm font-semibold flex items-center gap-1.5 ${status.includes("success") ? "text-emerald-400" : "text-rose-400"}`}>
                {status.includes("success") ? <CheckCircle2 size={14} /> : null}
                {status.includes("success") ? "Message sent! We'll respond shortly." : status}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold rounded-full transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">Frequently Asked Questions</h2>
          <p className="text-slate-400">Quick answers to common questions about VoxTelephony services.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-[#0d1120] overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-white font-semibold text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-cyan-400 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-96" : "max-h-0"}`}
              >
                <p className="px-6 pb-4 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}