import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * generateOvpn — builds a complete OpenVPN .ovpn config string.
 * Certs/keys are stored on the VPNServer entity as:
 *   server.ca_cert        — CA certificate (PEM)
 *   server.tls_auth_key   — tls-auth / tls-crypt key (optional)
 * User client certs are stored on LinkedDevice as:
 *   device.vpn_profile_key  — client private key (PEM)
 *   device.client_cert      — client certificate (PEM)  (optional)
 *
 * If per-user certs aren't provisioned yet, it falls back to
 * auth-user-pass (username + password) mode.
 */
function generateOvpn({ server, user, device = null, proto = 'udp' }) {
  const ip   = server.ip_address;
  const port = server.port || 1194;
  const label = server.city || server.region || 'VoxVPN';

  const hasClientCert = device?.client_cert && device?.vpn_profile_key;
  const hasCa         = server.ca_cert;
  const hasTlsAuth    = server.tls_auth_key;

  const lines = [
    `# VoxVPN OpenVPN Configuration`,
    `# Server : ${label} (${server.country || ''})`,
    `# User   : ${user.email}`,
    `# Proto  : ${proto.toUpperCase()}`,
    `# Generated: ${new Date().toISOString()}`,
    ``,
    `client`,
    `dev tun`,
    `proto ${proto}`,
    `remote ${ip} ${port}`,
    `resolv-retry infinite`,
    `nobind`,
    `persist-key`,
    `persist-tun`,
    `remote-cert-tls server`,
    `redirect-gateway def1 bypass-dhcp`,
    `cipher AES-256-CBC`,
    `auth SHA256`,
    `compress lz4-v2`,
    `verb 3`,
    `keepalive 10 60`,
  ];

  // CA certificate (inline)
  if (hasCa) {
    lines.push(``, `<ca>`, server.ca_cert.trim(), `</ca>`);
  } else {
    lines.push(``, `# WARNING: No CA certificate found on server record.`);
    lines.push(`# Add ca_cert to the VPNServer entity for this server.`);
  }

  // Client certificate + key (per-user, inline)
  if (hasClientCert) {
    lines.push(``, `<cert>`, device.client_cert.trim(), `</cert>`);
    lines.push(``, `<key>`, device.vpn_profile_key.trim(), `</key>`);
  } else {
    // Fall back to username/password auth
    lines.push(``, `auth-user-pass`);
    lines.push(`# Use your VoxVPN email and password when prompted.`);
  }

  // TLS auth / tls-crypt (optional but recommended)
  if (hasTlsAuth) {
    lines.push(``, `<tls-auth>`, server.tls_auth_key.trim(), `</tls-auth>`);
    lines.push(`key-direction 1`);
  }

  return lines.join('\n') + '\n';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { platform = 'windows', server_id = null, proto = 'udp' } = body;

    // Verify active subscription (admins bypass)
    if (user.role !== 'admin') {
      const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
      const active = subs?.find(s => s.status === 'active');
      if (!active) {
        return Response.json({ error: 'No active subscription found' }, { status: 403 });
      }
    }

    // Pick server — by ID if provided, otherwise lowest-load online server
    let server;
    if (server_id) {
      const results = await base44.asServiceRole.entities.VPNServer.filter({ id: server_id, status: 'online' });
      server = results?.[0];
    }

    if (!server) {
      const online = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
      if (!online || online.length === 0) {
        return Response.json({ error: 'No VPN servers available' }, { status: 503 });
      }
      server = online.reduce((best, s) => {
        const load = (s.active_connections || 0) / (s.max_connections || 1000);
        const bestLoad = (best.active_connections || 0) / (best.max_connections || 1000);
        return load < bestLoad ? s : best;
      });
    }

    // Find user's linked device for this platform (for per-user cert)
    let device = null;
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    if (subs?.length > 0) {
      const devices = await base44.entities.LinkedDevice.filter({
        subscription_id: subs[0].id,
        device_type: platform,
        status: 'active',
      });
      device = devices?.[0] || null;
    }

    // Generate the .ovpn file content
    const ovpnContent = generateOvpn({ server, user, device, proto });

    const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
    const serverLabel   = (server.city || server.region || 'Server').replace(/\s+/g, '-');
    const fileName      = `VoxVPN-${serverLabel}-${platformLabel}.ovpn`;

    return new Response(ovpnContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-openvpn-profile',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('downloadVpnConfig error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});