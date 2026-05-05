import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getSubscriptionAnalytics — subscription trends and revenue analytics
 * Returns: { total_revenue, mrr, churn_rate, ltv, plan_distribution, monthly_trends }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [activeSubs, expiredSubs, allSubs] = await Promise.all([
      base44.asServiceRole.entities.VPNSubscription.filter({ status: 'active' }),
      base44.asServiceRole.entities.VPNSubscription.filter({ status: 'expired' }),
      base44.asServiceRole.entities.VPNSubscription.filter({}, '', 10000),
    ]);

    // Revenue calculations
    const mrr = activeSubs.reduce((sum, s) => {
      return s.billing_cycle === 'monthly' ? sum + (s.price || 0) : sum + ((s.price || 0) / 12);
    }, 0);

    const totalRevenue = allSubs.reduce((sum, s) => sum + (s.price || 0), 0);

    // Churn rate (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentChurned = expiredSubs.filter(s => 
      new Date(s.renewal_date) > thirtyDaysAgo
    ).length;
    const churnRate = activeSubs.length > 0 ? ((recentChurned / activeSubs.length) * 100).toFixed(2) : '0';

    // LTV (simplified: avg subscription price * avg lifetime in months)
    const avgLifetime = 12; // assume 12 months average
    const avgPrice = allSubs.length > 0 ? (totalRevenue / allSubs.length) : 0;
    const ltv = (avgPrice * avgLifetime).toFixed(2);

    // Plan distribution
    const plans = ['Basic', 'Standard', 'Premium', 'Advanced', 'Enterprise'];
    const planDistribution = {};
    plans.forEach(plan => {
      planDistribution[plan] = allSubs.filter(s => s.plan === plan).length;
    });

    // Billing cycle distribution
    const monthlyCount = allSubs.filter(s => s.billing_cycle === 'monthly').length;
    const yearlyCount = allSubs.filter(s => s.billing_cycle === 'yearly').length;

    return Response.json({
      timestamp: new Date().toISOString(),
      revenue: {
        total: totalRevenue.toFixed(2),
        mrr: mrr.toFixed(2),
        monthly_subscriptions: monthlyCount,
        yearly_subscriptions: yearlyCount,
      },
      metrics: {
        active_subscriptions: activeSubs.length,
        expired_subscriptions: expiredSubs.length,
        churn_rate_30d: `${churnRate}%`,
        lifetime_value: ltv,
      },
      plan_distribution: planDistribution,
      total_subscriptions: allSubs.length,
    });
  } catch (error) {
    console.error('getSubscriptionAnalytics error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});