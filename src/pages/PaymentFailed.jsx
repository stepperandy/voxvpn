import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { XCircle, RefreshCw, HeadphonesIcon, Mail, ArrowRight } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function PaymentFailed() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-32 pb-24 px-4 max-w-2xl mx-auto text-center">

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-rose-400" />
        </div>

        <h1 className="text-3xl font-black text-white mb-3">Payment Failed</h1>
        <p className="text-slate-400 text-base mb-2">
          We were unable to process your payment. No charge has been made to your card.
        </p>
        {user?.email && (
          <p className="text-slate-500 text-sm mb-8">
            A notification has been sent to <span className="text-white">{user.email}</span>.
          </p>
        )}

        {/* Reasons */}
        <div className="rounded-2xl border border-rose-500/15 bg-[#0d1120] p-6 mb-8 text-left space-y-3">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Common Reasons</h3>
          {[
            'Insufficient funds or card limit reached',
            'Incorrect card details entered',
            'Card blocked for online/international transactions',
            'Bank declined the transaction — contact your bank',
            'Session expired — please try again',
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-slate-400 text-sm">
              <span className="text-rose-500 mt-0.5">•</span>
              {r}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3 mb-10">
          <Link to="/pricing"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-black text-black text-base transition-all"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)', boxShadow: '0 6px 24px rgba(0,212,255,0.25)' }}>
            <RefreshCw size={18} /> Try Again
          </Link>

          <Link to="/contact"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm border border-white/10 text-slate-300 hover:border-white/20 hover:text-white transition-all">
            <HeadphonesIcon size={16} /> Contact Support
          </Link>

          {user && (
            <Link to="/dashboard"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm border border-white/5 text-slate-500 hover:text-white transition-all">
              Go to My Dashboard <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Support note */}
        <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
          <Mail size={13} className="text-cyan-500" />
          Need help? Email us at <a href="mailto:support@voxdigits.com" className="text-cyan-400 hover:underline ml-1">support@voxdigits.com</a>
        </div>
      </div>

      <Footer />
    </div>
  );
}