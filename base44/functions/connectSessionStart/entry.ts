import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * connectSessionStart — called when the Electron VPN client connects to a server.
 * Records the session start, marks the device as active, updates server active_connections.
 *
 * POST body: { device_id, server_id, proto? }
 * Response:  { success, session_id, connected_at }
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });

    const { device_id, server_id, proto = 'udp' } = await req.json().catch(() => ({}));
    if (!device_id) return Response.json({ error: 'device_id is required' }, { status: 400, headers: CORS });

    const connected_at = new Date().toISOString();

    // Find active subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs?.find(s => ['active', 'trial'].includes(s.status));
    if (!activeSub) return Response.json({ error: 'No active subscription' }, { status: 403, headers: CORS });

    // Find the device
    const devices = await base44.entities.LinkedDevice.filter({ subscription_id: activeSub.id });
    const device = devices.find(d => d.device_id === device_id);
    if (!device) return Response.json({ error: 'Device not found' }, { status: 404, headers: CORS });

    // Update device: mark active + record last connected + store server/proto
    await base44.entities.LinkedDevice.update(device.id, {
      status: 'active',
      last_connected: connected_at,
      ip_address: server_id || device.ip_address,
    });

    // Increment server active_connections
    if (server_id) {
      const servers = await base44.asServiceRole.entities.VPNServer.filter({ id: server_id });
      const server = servers?.[0];
      if (server) {
        await base44.asServiceRole.entities.VPNServer.update(server.id, {
          active_connections: (server.active_connections || 0) + 1,
        });
      }
    }

    const session_id = `${user.email}:${device_id}:${Date.now()}`;
    console.log(`[connectSessionStart] user=${user.email} device=${device_id} server=${server_id} at=${connected_at}`);

    return Response.json({ success: true, session_id, connected_at }, { headers: CORS });

  } catch (error) {
    console.error('connectSessionStart error:', error.message);
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
});