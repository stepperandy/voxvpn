import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Loader2, TrendingUp, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ClientSubscriptionsSummary from '@/components/reseller/ClientSubscriptionsSummary';
import RevenueTrendsSummary from '@/components/reseller/RevenueTrendsSummary';
import RenewalScheduleTable from '@/components/reseller/RenewalScheduleTable';
import SearchConsoleDashboard from '@/components/reseller/SearchConsoleDashboard';
import { Rocket, Search } from 'lucide-react';

export default function ResellerDashboard() {
  const [user, setUser] = useState(null);
  const [reseller, setReseller] = useState(null);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subsLoading, setSubsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);

        const resellers = await base44.entities.Reseller.filter({ email: u.email });
        if (!resellers || resellers.length === 0) {
          setError('Not registered as reseller');
          setLoading(false);
          setSubsLoading(false);
          return;
        }

        const resellerData = resellers[0];
        setReseller(resellerData);

        if (resellerData.status !== 'approved') {
          setError(`Reseller status: ${resellerData.status}`);
          setLoading(false);
          setSubsLoading(false);
          return;
        }

        const orderData = await base44.entities.ResellerOrder.filter({ reseller_email: u.email }, '-created_date');
        setOrders(orderData || []);
        setLoading(false);

        // Load client subscriptions linked to this reseller
        try {
          const subs = await base44.entities.Subscription.filter({ reseller_email: u.email }, '-current_period_end');
          setSubscriptions(subs || []);
        } catch (subErr) {
          console.error('Failed to load subscriptions:', subErr);
        } finally {
          setSubsLoading(false);
        }
      } catch (err) {
        setError('Failed to load reseller data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg max-w-md">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Agency Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/ClientOnboarding"
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-sm transition-colors"
            >
              <Rocket className="w-4 h-4" />
              Onboard New Client
            </Link>
          </div>
        </div>

        {/* Renewal Schedule — Upcoming renewals highlighted */}
        <div className="mb-8">
          <RenewalScheduleTable subscriptions={subscriptions} loading={subsLoading} />
        </div>

        {/* Google Search Console — Search performance & indexing */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold">Google Search Console</h2>
          </div>
          <SearchConsoleDashboard />
        </div>

        {/* Revenue & Renewal Trends */}
        <div className="mb-8">
          <RevenueTrendsSummary subscriptions={subscriptions} loading={subsLoading} />
        </div>

        {/* Client Subscription Summary */}
        <div className="mb-8">
          <ClientSubscriptionsSummary subscriptions={subscriptions} loading={subsLoading} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Company</p>
                <p className="text-white font-bold text-lg">{reseller?.company_name}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Markup %</p>
                <p className="text-cyan-400 font-bold text-lg">{reseller?.markup_percentage}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-white font-bold text-lg">${(reseller?.total_revenue || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
            Recent Orders
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No orders yet</p>
              <Link
                to={createPageUrl('BundleMarketplace')}
                className="inline-block px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors"
              >
                Browse Bundles
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-400">Order ID</th>
                    <th className="text-left py-3 px-4 text-gray-400">Quantity</th>
                    <th className="text-left py-3 px-4 text-gray-400">Total Cost</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-3 px-4">{order.id}</td>
                      <td className="py-3 px-4">{order.quantity}</td>
                      <td className="py-3 px-4">${order.total_cost.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{new Date(order.order_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}