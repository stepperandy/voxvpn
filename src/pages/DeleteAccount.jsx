import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Trash2, ShieldOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DeleteAccount() {
  const [step, setStep] = useState(1); // 1=info, 2=confirm, 3=done
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') return;
    setLoading(true);
    setError('');
    try {
      await base44.functions.invoke('deleteUserAccount', {});
      setStep(3);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c18] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/e4e826602_f43645b8-7e9b-46cb-9b95-1fc45590f65b.png"
            alt="VoxVPN"
            className="h-10 w-auto mx-auto mb-6"
          />
        </div>

        {step === 3 ? (
          /* Success state */
          <div className="bg-[#0d1120] border border-white/5 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <ShieldOff size={28} className="text-emerald-400" />
            </div>
            <h1 className="text-white text-2xl font-black mb-3">Account Deleted</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your account and all associated data have been permanently deleted. We're sorry to see you go.
            </p>
            <p className="text-slate-500 text-xs mb-8">
              If you'd like to come back, you can always create a new account at voxvpn.net.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full text-sm transition-all"
            >
              Back to Home
            </Link>
          </div>
        ) : step === 1 ? (
          /* Info step */
          <div className="bg-[#0d1120] border border-white/5 rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={28} className="text-rose-400" />
            </div>
            <h1 className="text-white text-2xl font-black text-center mb-2">Delete Account</h1>
            <p className="text-slate-400 text-sm text-center mb-8">
              This action is permanent and cannot be undone.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'All your subscription data will be removed',
                'All linked devices and VPN configs will be deleted',
                'Your account cannot be recovered after deletion',
                'Any active subscription will be cancelled',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  </div>
                  <p className="text-slate-400 text-sm">{item}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-sm transition-all"
              >
                Continue to Delete
              </button>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full py-3 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-semibold rounded-xl text-sm transition-all"
              >
                <ArrowLeft size={16} />
                Cancel, keep my account
              </Link>
            </div>
          </div>
        ) : (
          /* Confirm step */
          <div className="bg-[#0d1120] border border-rose-500/20 rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
              <Trash2 size={28} className="text-rose-400" />
            </div>
            <h1 className="text-white text-2xl font-black text-center mb-2">Are you sure?</h1>
            <p className="text-slate-400 text-sm text-center mb-8">
              Type <span className="text-rose-400 font-bold">DELETE</span> to permanently delete your account.
            </p>

            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full bg-[#091523] border border-white/10 focus:border-rose-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none mb-4 placeholder:text-slate-600"
            />

            {error && (
              <p className="text-rose-400 text-xs mb-4 text-center">{error}</p>
            )}

            <div className="space-y-3">
              <button
                onClick={handleDelete}
                disabled={confirmation !== 'DELETE' || loading}
                className="w-full py-3 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all"
              >
                {loading ? 'Deleting...' : 'Permanently Delete My Account'}
              </button>
              <button
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-2 w-full py-3 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-semibold rounded-xl text-sm transition-all"
              >
                <ArrowLeft size={16} />
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}