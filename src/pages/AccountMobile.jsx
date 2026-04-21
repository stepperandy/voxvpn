import { useState, useEffect } from 'react';
import MobileLayout from '@/mobile/MobileLayout';
import PullToRefresh from '@/mobile/PullToRefresh';
import { base44 } from '@/api/base44Client';
import { LogOut, Trash2, ChevronRight } from 'lucide-react';
import ReferralWidget from '@/components/ReferralWidget';

export default function AccountMobile() {
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = () => {
    setUser(null);
    base44.auth.logout('/');
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    const prevUser = user;
    setUser(null);
    setDeleting(true);
    try {
      await base44.functions.invoke('deleteUserAccount', {});
      base44.auth.logout('/');
    } catch (error) {
      setUser(prevUser);
      setShowDeleteConfirm(false);
      setDeleting(false);
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleRefresh = async () => {
    const updated = await base44.auth.me();
    setUser(updated);
  };

  return (
    <MobileLayout headerTitle="Account" rootPath="/account-mobile">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="pb-24 px-4 pt-6">
          <h1 className="text-white text-2xl font-black mb-6">Account</h1>

          {user ? (
            <>
              {/* User Info Card */}
              <div className="p-4 rounded-xl border border-white/5 bg-[#0d1120] mb-6">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">
                  Logged in as
                </p>
                <p className="text-white font-bold text-lg">{user.full_name}</p>
                <p className="text-slate-400 text-sm">{user.email}</p>
                {user.role && (
                  <div className="mt-3 inline-block px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded">
                    {user.role.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Referral */}
              <div className="mb-6">
                <ReferralWidget />
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                   onClick={handleLogout}
                   className="w-full flex items-center justify-between p-4 rounded-lg border border-white/5 bg-[#0d1120] hover:bg-[#0f1428] transition-colors select-none touch-target active:scale-95"
                 >
                   <div className="flex items-center gap-3">
                     <LogOut size={18} className="text-slate-400" />
                     <span className="text-white font-medium">Log Out</span>
                   </div>
                   <ChevronRight size={18} className="text-slate-500" />
                 </button>

                {/* Delete Account */}
                <div className="space-y-2">
                  <button
                     onClick={handleDeleteAccount}
                     disabled={deleting}
                     className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors select-none touch-target active:scale-95 disabled:scale-100 ${
                       showDeleteConfirm
                         ? 'border-red-500 bg-red-500/10'
                         : 'border-white/5 bg-[#0d1120] hover:bg-[#0f1428]'
                     }`}
                   >
                    <div className="flex items-center gap-3">
                      <Trash2
                        size={18}
                        className={showDeleteConfirm ? 'text-red-400' : 'text-slate-400'}
                      />
                      <span
                        className={showDeleteConfirm ? 'text-red-400 font-bold' : 'text-white font-medium'}
                      >
                        {deleting ? 'Deleting...' : 'Delete Account'}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-slate-500" />
                  </button>

                  {showDeleteConfirm && (
                    <div className="p-4 rounded-lg border border-red-500 bg-red-500/10">
                      <p className="text-red-400 font-bold text-sm mb-3">
                        This will permanently delete your account and all data.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-2 rounded bg-slate-700 text-white text-sm font-bold transition-colors select-none touch-target active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                          className="flex-1 py-2 rounded bg-red-600 text-white text-sm font-bold transition-colors select-none touch-target active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                          {deleting ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">Please log in to view your account.</p>
              <button
                 onClick={() => base44.auth.redirectToLogin()}
                 className="px-6 py-3 bg-cyan-400 text-black font-bold rounded-lg transition-colors select-none touch-target active:scale-95"
               >
                 Log In
               </button>
            </div>
          )}
        </div>
      </PullToRefresh>
    </MobileLayout>
  );
}