import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2, MessageSquare, Headphones, Building } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: "support@voxdigits.com",
    sub: "Partnership, support & business inquiries",
    color: "cyan",
    href: "mailto:support@voxdigits.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 207 387 1513",
    sub: "Call or WhatsApp",
    color: "blue",
    href: "tel:+12073871513",
  },
  {
    icon: Building,
    label: "Company",
    value: "VoxTelefony Communication LLC",
    sub: "Telecommunications technology",
    color: "purple",
    href: "#",
  },
];

const TOPICS = ["General Inquiry", "Sales & Pricing", "Technical Support", "Billing", "Partnerships", "Press & Media"];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setError(null);
    try {
      await base44.integrations.Core.SendEmail({
        to: "support@voxdigits.com",
        subject: `[${form.topic || "Contact Form"}] Message from ${form.name}`,
        body: `Name: ${form.name}\nEmail: ${form.email}\nTopic: ${form.topic}\n\n${form.message}`,
        from_name: "VoxTelefony Contact Form",
      });
      // Send confirmation to user
      await base44.integrations.Core.SendEmail({
        to: form.email,
        subject: "We received your message — VoxTelefony",
        body: `Hi ${form.name},\n\nThanks for reaching out to VoxTelefony. We've received your message and will get back to you within 4 business hours.\n\nYour topic: ${form.topic || "General Inquiry"}\n\nBest regards,\nThe VoxTelefony Team`,
        from_name: "VoxDigits Support",
      });
      setSent(true);
    } catch (err) {
      setError("Failed to send message. Please try again or email us directly.");
    }
    setLoading(false);
  };

  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="min-h-screen bg-[#060f1a] text-white">
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 mb-6">
          <Headphones className="w-3.5 h-3.5 text-cyan-400" /> World-Class Support Team
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-5">
          Get in <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Touch</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Whether you have a question about our services, pricing, or just want to say hello — our team is here for you.
        </p>
      </section>

      {/* Contact channels */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-5 mb-16">
          {CONTACT_CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isChat = false;
            const El = "a";
            const props = { href: ch.href };
            return (
              <El
                key={ch.label}
                {...props}
                className={`p-6 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer block ${colorMap[ch.color].split(" ").slice(1).join(" ")} border-white/10 hover:border-current/30`}
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colorMap[ch.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{ch.label}</div>
                <div className={`font-semibold text-sm mb-1 ${ch.color === "cyan" ? "text-cyan-300" : ch.color === "blue" ? "text-blue-300" : "text-purple-300"}`}>{ch.value}</div>
                <div className="text-gray-600 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {ch.sub}
                </div>
              </El>
            );
          })}
        </div>

        {/* Form + Info */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-10">
          {/* Form */}
          <div className="md:col-span-3">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-gray-400 text-sm max-w-xs">We've received your message and sent you a confirmation email. Expect a reply within 4 business hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", topic: "", message: "" }); }} className="mt-6 px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Full Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="John Smith"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="john@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Topic</label>
                  <select
                    value={form.topic}
                    onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 appearance-none"
                  >
                    <option value="" className="bg-gray-900">Select a topic...</option>
                    {TOPICS.map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="How can we help you?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder-gray-600 resize-none"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 font-bold rounded-xl transition-colors text-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Direct Contact</div>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <a href="mailto:support@voxdigits.com" className="text-cyan-300 hover:text-cyan-200 transition-colors">support@voxdigits.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <a href="tel:+12073871513" className="text-blue-300 hover:text-blue-200 transition-colors">+1 207 387 1513</a>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
              <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">Partnership & Sales</div>
              <p className="text-gray-400 text-sm leading-relaxed">For partnership, support, and business inquiries, please contact us using the details above.</p>
            </div>

            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company</div>
              <p className="text-gray-300 text-sm font-medium">VoxTelefony Communication LLC</p>
              <p className="text-gray-500 text-xs mt-1">Telecommunications Technology</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}