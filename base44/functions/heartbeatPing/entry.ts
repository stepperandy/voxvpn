import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * heartbeatPing — called every ~60s by the Electron client while connected.
 * Keeps the session alive, updates last_connected timestamp on the device.
 * Also validates the subscription is still active (used to force-disconnect expired users).
 *
 * POST body: { device_id, server_id? }
 * Response:  { alive: true, subscription_valid: true, timestamp }
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
    if (!user) return Response.json({ alive: false, error: 'Unauthorized' }, { status: 401, headers: CORS });

    const { device_id, server_id } = await req.json().catch(() => ({}));
    if (!device_id) return Response.json({ alive: false, error: 'device_id is required' }, { status: 400, headers: CORS });

    const timestamp = new Date().toISOString();

    // Check subscription validity
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs?.find(s => ['active', 'trial'].includes(s.status));

    if (!activeSub) {
      return Response.json({
        alive: true,
        subscription_valid: false,
        disconnect: true,
        reason: 'Subscription expired or cancelled.',
        timestamp,
      }, { headers: CORS });
    }

    // Check renewal expiry
    if (activeSub.renewal_date) {
      const expired = new Date(activeSub.renewal_date) < new Date();
      if (expired) {
        return Response.json({
          alive: true,
          subscription_valid: false,
          disconnect: true,
          reason: 'Subscription has expired. Please renew at voxvpn.net.',
          timestamp,
        }, { headers: CORS });
      }
    }

    // Update device last_connected heartbeat
    const devices = await base44.entities.LinkedDevice.filter({ subscription_id: activeSub.id });
    const device = devices.find(d => d.device_id === device_id);
    if (device) {
      await base44.entities.LinkedDevice.update(device.id, {
        last_connected: timestamp,
        status: 'active',
      });
    }

    return Response.json({
      alive: true,
      subscription_valid: true,
      disconnect: false,
      plan: activeSub.plan,
      renewal_date: activeSub.renewal_date,
      timestamp,
    }, { headers: CORS });

  } catch (error) {
    console.error('heartbeatPing error:', error.message);
    return Response.json({ alive: false, error: error.message }, { status: 500, headers: CORS });
  }
});