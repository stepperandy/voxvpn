import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Mail, LifeBuoy, Shield, CreditCard, Scale, UserCog,
  Loader2, ChevronDown, MessageSquare, Phone, Wifi, Search
} from "lucide-react";

const SUPPORT_EMAILS = [
  {
    label: "General Support",
    email: "support@voxdigits.com",
    icon: LifeBuoy,
    description: "Technical issues, account help, product questions, and general assistance.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    label: "Admin & Accounts",
    email: "admin@voxtelefony.com",
    icon: UserCog,
    description: "Account management, permissions, reseller approvals, and platform access.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    label: "Privacy & Data",
    email: "privacy@voxtelefony.com",
    icon: Shield,
    description: "Data protection requests, GDPR/privacy concerns, and information security.",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    label: "Billing & Payments",
    email: "billing@voxtelefony.com",
    icon: CreditCard,
    description: "Invoices, refunds, subscription charges, wallet top-ups, and payment disputes.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    label: "Legal & Compliance",
    email: "legal@voxtelefony.com",
    icon: Scale,
    description: "Terms of service, legal notices, law enforcement inquiries, and compliance matters.",
    gradient: "from-rose-500 to-red-600",
  },
];

const QUICK_LINKS = [
  { label: "Live Chat Support", path: "/UserTickets", icon: MessageSquare },
  { label: "Call from Virtual Number", path: "/Dialer", icon: Phone },
  { label: "eSIM Dashboard", path: "/ESimDashboard", icon: Wifi },
  { label: "Help Center", path: "/AIAssistant", icon: Search },
];

export default function Support() {
  const [aiContent, setAiContent] = useState(null);
  const [loadingAI, setLoadingAI] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    base44.integrations.Core.InvokeLLM({
      prompt: `You are the support knowledge base for VoxTelefony.com — a platform offering private virtual phone numbers, eSIM data plans, call forwarding, SMS messaging, and VPN services for international business and personal security.

Generate a comprehensive support guide as JSON with these sections:
1. "getting_started": A short paragraph (2-3 sentences) on how to get started with VoxTelefony.
2. "topics": An array of 4 objects, each with "title" (string) and "tips" (array of 3 short practical tips as strings). Topics should cover: Virtual Numbers setup, eSIM activation, Call Forwarding, and Account Security.
3. "faq": An array of 6 objects, each with "question" (string) and "answer" (string, 1-2 sentences). Questions should be common support questions about virtual numbers, eSIMs, billing, privacy, call quality, and number porting.

Keep all text concise, helpful, and professional. Use plain language a non-technical user can understand.`,
      response_json_schema: {
        type: "object",
        properties: {
          getting_started: { type: "string" },
          topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                tips: { type: "array", items: { type: "string" } },
              },
            },
          },
          faq: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                answer: { type: "string" },
              },
            },
          },
        },
      },
    })
      .then(result => {
        setAiContent(result);
        setLoadingAI(false);
      })
      .catch(() => setLoadingAI(false));
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(6,182,212,0.3)" }}>
            <LifeBuoy className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Support Center</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            We're here to help. Reach the right team directly or browse our guides below.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {QUICK_LINKS.map(link => {
            const Icon = link.icon;
            return (
              <a
                key={link.path}
                href={link.path}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Icon className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-medium text-gray-300 text-center">{link.label}</span>
              </a>
            );
          })}
        </div>

        {/* Email Cards */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            Contact Our Team
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {SUPPORT_EMAILS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.email}
                  href={`mailto:${item.email}`}
                  className="group p-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white mb-0.5">{item.label}</p>
                      <p className="text-cyan-400 text-sm font-mono mb-2 truncate">{item.email}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* AI-Generated Content */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Help Guides
          </h2>

          {loadingAI ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : aiContent ? (
            <div className="space-y-6">
              {/* Getting Started */}
              {aiContent.getting_started && (
                <div className="p-5 rounded-2xl" style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  <h3 className="font-bold text-cyan-400 mb-2 text-sm uppercase tracking-wide">Getting Started</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{aiContent.getting_started}</p>
                </div>
              )}

              {/* Topics */}
              {aiContent.topics && aiContent.topics.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {aiContent.topics.map((topic, i) => (
                    <div key={i} className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <h3 className="font-bold text-white mb-3 text-sm">{topic.title}</h3>
                      <ul className="space-y-2">
                        {topic.tips && topic.tips.map((tip, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* FAQ */}
              {aiContent.faq && aiContent.faq.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">Frequently Asked Questions</h3>
                  <div className="space-y-2">
                    {aiContent.faq.map((item, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="font-medium text-white text-sm pr-3">{item.question}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                        </button>
                        {openFaq === i && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-gray-500 text-sm">Guides are being prepared. Please check back shortly or contact our team directly.</p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="text-center pt-6 border-t border-white/10">
          <p className="text-gray-500 text-xs">
            Response times: Support within 24 hours • Billing within 48 hours • Legal within 5 business days
          </p>
        </div>
      </div>
    </div>
  );
}