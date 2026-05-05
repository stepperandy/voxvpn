import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getUsersData — get all users with subscription status for management
 * Query params: { page?, limit?, sort_by? }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const sortBy = url.searchParams.get('sort_by') || '-created_date';

    // Get all users
    const users = await base44.asServiceRole.entities.User.list(sortBy, limit);

    // Enrich with subscription data
    const enriched = await Promise.all(users.map(async (u) => {
      const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: u.email });
      const activeSub = subs?.find(s => s.status === 'active');
      const devices = activeSub 
        ? await base44.asServiceRole.entities.LinkedDevice.filter({ subscription_id: activeSub.id })
        : [];

      return {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        created_date: u.created_date,
        subscription: activeSub ? {
          plan: activeSub.plan,
          status: activeSub.status,
          renewal_date: activeSub.renewal_date,
          devices_used: devices.filter(d => d.status === 'active').length,
          max_devices: activeSub.max_devices,
        } : null,
        has_subscription: !!activeSub,
      };
    }));

    return Response.json({
      users: enriched,
      total: enriched.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('getUsersData error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});