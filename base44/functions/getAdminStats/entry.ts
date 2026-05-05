import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getAdminStats — real-time dashboard metrics for admin
 * Returns: { total_users, active_subscriptions, revenue, connections, bandwidth }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parallel queries
    const [users, subs, servers, analytics] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.VPNSubscription.filter({ status: 'active' }),
      base44.asServiceRole.entities.VPNServer.filter({ status: 'online' }),
      base44.asServiceRole.entities.Analytics.filter({}, '-date', 1),
    ]);

    const totalConnections = servers.reduce((sum, s) => sum + (s.active_connections || 0), 0);
    const totalBandwidth = servers.reduce((sum, s) => sum + (s.bandwidth_used_gb || 0), 0);
    const totalRevenue = subs.reduce((sum, s) => sum + (s.price || 0), 0);

    const latestAnalytics = analytics?.[0];

    return Response.json({
      timestamp: new Date().toISOString(),
      overview: {
        total_users: users.length,
        active_subscriptions: subs.length,
        online_servers: servers.length,
        total_connections: totalConnections,
        total_bandwidth_gb: totalBandwidth.toFixed(2),
        monthly_revenue: totalRevenue.toFixed(2),
      },
      servers: {
        online: servers.length,
        total_capacity: servers.reduce((sum, s) => sum + (s.max_connections || 1000), 0),
        avg_load: servers.length > 0 
          ? Math.round(servers.reduce((sum, s) => sum + (s.current_load || 0), 0) / servers.length)
          : 0,
        uptime_avg: servers.length > 0
          ? (servers.reduce((sum, s) => sum + (s.uptime_percentage || 99.9), 0) / servers.length).toFixed(2)
          : '0',
      },
      subscriptions: {
        total_active: subs.length,
        by_plan: {
          basic: subs.filter(s => s.plan === 'Basic').length,
          standard: subs.filter(s => s.plan === 'Standard').length,
          premium: subs.filter(s => s.plan === 'Premium').length,
          advanced: subs.filter(s => s.plan === 'Advanced').length,
          enterprise: subs.filter(s => s.plan === 'Enterprise').length,
        },
      },
      latest_analytics: latestAnalytics || null,
    });
  } catch (error) {
    console.error('getAdminStats error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});