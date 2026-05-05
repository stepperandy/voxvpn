import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getConnectionHistory — get user's past VPN connections
 * Returns: { connections: [{ device, server, duration, data_used, timestamp }] }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    if (!subs?.[0]) {
      return Response.json({ connections: [] });
    }

    // Get linked devices (connection records)
    const devices = await base44.entities.LinkedDevice.filter({ subscription_id: subs[0].id }, '-last_connected', 50);

    const connections = devices.map(d => ({
      id: d.id,
      device_name: d.device_name,
      device_type: d.device_type,
      ip_address: d.ip_address,
      last_connected: d.last_connected,
      status: d.status,
      created_at: d.created_date,
    }));

    return Response.json({
      connections,
      total: connections.length,
      subscription_plan: subs[0].plan,
    });
  } catch (error) {
    console.error('getConnectionHistory error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});