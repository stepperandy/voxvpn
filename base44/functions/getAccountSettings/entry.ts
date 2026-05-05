import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getAccountSettings — get user's account settings & preferences
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription info
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs?.find(s => s.status === 'active');

    // Get devices
    const devices = activeSub
      ? await base44.entities.LinkedDevice.filter({ subscription_id: activeSub.id })
      : [];

    return Response.json({
      profile: {
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_date: user.created_date,
      },
      subscription: activeSub ? {
        plan: activeSub.plan,
        status: activeSub.status,
        billing_cycle: activeSub.billing_cycle,
        renewal_date: activeSub.renewal_date,
        max_devices: activeSub.max_devices,
        devices_used: devices.filter(d => d.status === 'active').length,
      } : null,
      devices: devices.map(d => ({
        id: d.id,
        name: d.device_name,
        type: d.device_type,
        status: d.status,
        last_connected: d.last_connected,
      })),
      preferences: {
        notifications_enabled: true,
        theme: 'dark',
        auto_connect: false,
      },
    });
  } catch (error) {
    console.error('getAccountSettings error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});