import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { ShieldCheck, Clock, CheckCircle2, XCircle, Mail, CreditCard, RotateCcw } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <ShieldCheck size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Refund Policy</h1>
          <p className="text-slate-500 text-sm mb-4">Last updated: July 7, 2026</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-bold">30-Day Money-Back Guarantee</span>
          </div>
        </div>

        {/* Guarantee summary */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <ShieldCheck size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base mb-1">Our Promise to You</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                VoxVPN offers a <strong className="text-white">30-day money-back guarantee</strong> on all new subscriptions.
                If you're not completely satisfied within the first 30 days, contact us for a full refund — no questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Eligibility */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <h2 className="text-white font-bold text-base">Eligibility</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-emerald-400 text-xs font-bold mb-2">✓ Eligible for Refund</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-slate-400 text-sm"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /> New subscriptions within 30 days of purchase</li>
                  <li className="flex items-start gap-2 text-slate-400 text-sm"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /> Annual plan purchases within 30 days</li>
                  <li className="flex items-start gap-2 text-slate-400 text-sm"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /> Monthly plans within 30 days of first payment</li>
                </ul>
              </div>
              <div>
                <p className="text-rose-400 text-xs font-bold mb-2">✗ Not Eligible</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-slate-400 text-sm"><XCircle size={14} className="text-rose-400 mt-0.5 flex-shrink-0" /> Accounts that violated our Terms of Service</li>
                  <li className="flex items-start gap-2 text-slate-400 text-sm"><XCircle size={14} className="text-rose-400 mt-0.5 flex-shrink-0" /> Renewals after the 30-day period</li>
                  <li className="flex items-start gap-2 text-slate-400 text-sm"><XCircle size={14} className="text-rose-400 mt-0.5 flex-shrink-0" /> Accounts suspended for abuse or fraud</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to request */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw size={18} className="text-cyan-400" />
              <h2 className="text-white font-bold text-base">How to Request a Refund</h2>
            </div>
            <ol className="space-y-3">
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(0,212,255,0.1)', color: '#22d3ee', border: '1px solid rgba(0,212,255,0.2)' }}>1</span>
                <span>Email <a href="mailto:support@voxvpn.net" className="text-cyan-400 hover:underline">support@voxvpn.net</a> with the subject line "Refund Request"</span>
              </li>
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(0,212,255,0.1)', color: '#22d3ee', border: '1px solid rgba(0,212,255,0.2)' }}>2</span>
                <span>Include your registered email address and the reason for your refund request</span>
              </li>
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(0,212,255,0.1)', color: '#22d3ee', border: '1px solid rgba(0,212,255,0.2)' }}>3</span>
                <span>Our team will review and process eligible refunds within 5-10 business days</span>
              </li>
            </ol>
          </div>

          {/* Processing time */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-cyan-400" />
              <h2 className="text-white font-bold text-base">Processing Time</h2>
            </div>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-start gap-2"><Clock size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" /> Refund review: 1-2 business days</li>
              <li className="flex items-start gap-2"><CreditCard size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" /> Refund to original payment method: 5-10 business days</li>
              <li className="flex items-start gap-2"><Mail size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" /> Confirmation email sent once processed</li>
            </ul>
          </div>

          {/* Cancellation */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle size={18} className="text-amber-400" />
              <h2 className="text-white font-bold text-base">Cancellation Policy</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              You can cancel your subscription at any time from your account dashboard. Cancellations take effect at the end of your current billing period — you'll retain access until then.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              We do not offer prorated refunds for cancellations made mid-period after the 30-day guarantee window. However, you will not be charged for the next billing cycle.
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))', border: '1px solid rgba(0,212,255,0.2)' }}>
            <h2 className="text-white font-bold text-base mb-2">Contact Us About Refunds</h2>
            <p className="text-slate-400 text-sm mb-4">Our support team is available 24/7 to help with refund requests.</p>
            <a href="mailto:support@voxvpn.net?subject=Refund Request" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold transition-all text-sm">
              <Mail size={16} /> support@voxvpn.net
            </a>
            <p className="text-slate-500 text-xs mt-3">For billing questions: <a href="mailto:billing@voxvpn.net" className="text-cyan-400 hover:underline">billing@voxvpn.net</a></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}