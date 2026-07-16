import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft, Loader2, CheckCircle2 } from "lucide-react";
import WalletTopUp from "@/components/billing/WalletTopUp";


export default function Credits() {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [depositSuccess, setDepositSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success' && params.get('session_id')) {
      setDepositSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
    loadCreditsData();
  }, []);

  const loadCreditsData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Get user's credits (stored in User entity)
      const userCredits = currentUser.credits || 0;
      setCredits(userCredits);

      // Load real transaction history
      const txns = await base44.entities.Transaction.filter(
        { user_email: currentUser.email },
        '-created_date',
        50
      );
      setTransactions(txns);
    } catch (error) {
      console.error('Failed to load credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto h-full bg-[#0a1420] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto overflow-auto h-full bg-[#0a1420]">
      {depositSuccess && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">Payment confirmed! Your credits have been added to your account.</p>
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Credits & Billing</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account credits and payment history</p>
      </div>

      {/* Main Credit Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Large Credit Display */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/30 p-8">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-gray-500 text-sm">Account Balance</span>
              </div>

              <div className="mb-8">
                <p className="text-gray-400 text-sm mb-2">Available Credits</p>
                <h2 className="text-5xl font-bold text-white">{formatCurrency(credits)}</h2>
              </div>

              <div className="pt-6 border-t border-gray-700/50">
                <WalletTopUp user={user} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Monthly Spend</span>
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">$0.00</p>
            <p className="text-gray-600 text-xs mt-2">No active subscriptions</p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Total Spent</span>
              <ArrowDownLeft className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-white">$0.00</p>
            <p className="text-gray-600 text-xs mt-2">All time</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-gray-950/60 border border-gray-800/60 rounded-xl">
        <div className="p-6 border-b border-gray-800/60">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-cyan-400" />
            Transaction History
          </h3>
        </div>

        <div className="divide-y divide-gray-800/60">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 text-sm">No transactions yet</p>
              <p className="text-gray-600 text-xs mt-1">Your payment history will appear here</p>
            </div>
          ) : (
            transactions.map(txn => (
              <div key={txn.id} className="p-4 hover:bg-gray-800/30 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    {txn.type === 'credit'
                      ? <ArrowUpRight className="w-5 h-5 text-green-400" />
                      : <ArrowDownLeft className="w-5 h-5 text-red-400" />
                    }
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{txn.description}</p>
                    <p className="text-gray-500 text-xs">{formatDate(txn.created_date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${txn.type === 'debit' ? 'text-red-400' : 'text-green-400'}`}>
                    {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                  </p>
                  <span className="text-xs text-gray-500 capitalize">{txn.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>



      {/* Help Section */}
      <div className="mt-8 bg-gray-900/40 border border-gray-800/60 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-2">💡 <strong>Credit Balance</strong></p>
            <p className="text-gray-600 text-sm">Your available credits are used to cover monthly subscription costs for virtual numbers.</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">📞 <strong>Auto-Renewal</strong></p>
            <p className="text-gray-600 text-sm">Subscriptions automatically renew monthly. Manage your numbers from the Dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}