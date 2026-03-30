import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { deviceId, platform } = body;

    // Find the user's subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    if (!subs || subs.length === 0) {
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }
    const subscription = subs[0];

    // Get the device (or first active device if no deviceId specified)
    let device = null;
    if (deviceId) {
      const devices = await base44.entities.LinkedDevice.filter({ subscription_id: subscription.id });
      device = devices.find(d => d.id === deviceId);
    } else {
      const devices = await base44.entities.LinkedDevice.filter({ subscription_id: subscription.id });
      const targetPlatform = (platform || 'windows').toLowerCase();
      device = devices.find(d => d.device_type === targetPlatform && d.status === 'active') || devices[0];
    }

    if (!device) {
      // No device yet — provision one now
      const provisionRes = await base44.functions.invoke('provisionVpnUser', {
        email: user.email,
        platform: platform || 'windows',
        deviceName: `${platform || 'Windows'} Device`,
      });

      if (provisionRes.data?.configContent) {
        const configContent = provisionRes.data.configContent;
        const fileName = `VoxVPN-${(platform || 'Windows').charAt(0).toUpperCase() + (platform || 'windows').slice(1)}.conf`;

        return new Response(configContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${fileName}"`,
          },
        });
      }

      return Response.json({ error: 'Failed to provision VPN profile' }, { status: 500 });
    }

    // Get the best available server
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    if (!servers || servers.length === 0) {
      return Response.json({ error: 'No VPN servers online' }, { status: 503 });
    }

    const server = servers.reduce((best, s) => {
      const load = (s.active_connections || 0) / (s.max_connections || 1000);
      const bestLoad = (best.active_connections || 0) / (best.max_connections || 1000);
      return load < bestLoad ? s : best;
    });

    // Build config from stored credentials
    const configContent = `[Interface]
PrivateKey = ${device.vpn_profile_key}
Address = ${device.ip_address}/32
DNS = 8.8.8.8, 1.1.1.1

[Peer]
PublicKey = ${server.public_key}
Endpoint = ${server.ip_address}:${server.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;

    const platformLabel = (platform || device.device_type || 'Windows');
    const fileName = `VoxVPN-${platformLabel.charAt(0).toUpperCase() + platformLabel.slice(1)}.conf`;

    // Update last connected
    await base44.entities.LinkedDevice.update(device.id, {
      last_connected: new Date().toISOString(),
    });

    return new Response(configContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});