import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * connectSessionEnd — called when the Electron VPN client disconnects.
 * Records session end, decrements server active_connections.
 *
 * POST body: { device_id, server_id, bytes_sent?, bytes_received?, duration_seconds? }
 * Response:  { success, disconnected_at }
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

    const { device_id, server_id, bytes_sent = 0, bytes_received = 0, duration_seconds = 0 } = await req.json().catch(() => ({}));
    if (!device_id) return Response.json({ error: 'device_id is required' }, { status: 400, headers: CORS });

    const disconnected_at = new Date().toISOString();

    // Find active subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs?.find(s => ['active', 'trial'].includes(s.status));

    if (activeSub) {
      // Find the device and mark inactive
      const devices = await base44.entities.LinkedDevice.filter({ subscription_id: activeSub.id });
      const device = devices.find(d => d.device_id === device_id);
      if (device) {
        await base44.entities.LinkedDevice.update(device.id, {
          status: 'inactive',
        });
      }
    }

    // Decrement server active_connections (floor at 0)
    if (server_id) {
      const servers = await base44.asServiceRole.entities.VPNServer.filter({ id: server_id });
      const server = servers?.[0];
      if (server) {
        const newCount = Math.max(0, (server.active_connections || 1) - 1);
        const bandwidthDelta = (bytes_sent + bytes_received) / (1024 * 1024 * 1024); // bytes → GB
        await base44.asServiceRole.entities.VPNServer.update(server.id, {
          active_connections: newCount,
          bandwidth_used_gb: parseFloat(((server.bandwidth_used_gb || 0) + bandwidthDelta).toFixed(4)),
        });
      }
    }

    console.log(`[connectSessionEnd] user=${user.email} device=${device_id} server=${server_id} duration=${duration_seconds}s`);

    return Response.json({ success: true, disconnected_at }, { headers: CORS });

  } catch (error) {
    console.error('connectSessionEnd error:', error.message);
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
});