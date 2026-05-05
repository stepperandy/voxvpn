import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * generateVpnConfig — lightweight endpoint used by the Electron desktop app
 * and mobile apps to fetch an OpenVPN .ovpn config for a specific server.
 *
 * Body params:
 *   server_id  (required) — VPNServer entity ID
 *   proto      (optional) — "udp" (default) or "tcp"
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { server_id, proto = 'udp' } = body;

    if (!server_id) {
      return Response.json({ error: 'server_id is required' }, { status: 400 });
    }

    // Verify active subscription (admins bypass)
    if (user.role !== 'admin') {
      const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
      const active = subs?.find(s => s.status === 'active');
      if (!active) {
        return Response.json({ error: 'No active subscription' }, { status: 403 });
      }
    }

    // Fetch the requested server
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ id: server_id });
    const server = servers?.[0];

    if (!server) {
      return Response.json({ error: 'Server not found' }, { status: 404 });
    }
    if (server.status !== 'online') {
      return Response.json({ error: 'Server is offline or under maintenance' }, { status: 503 });
    }

    const ip   = server.ip_address;
    const port = server.port || 1194;
    const label = server.city || server.region || 'VoxVPN';

    // Build .ovpn content
    const lines = [
      `# ╔═══════════════════════════════════════════════════════════╗`,
      `# ║         VoxVPN Secure VPN - Official Configuration         ║`,
      `# ║            https://media.base44.com/images/public/         ║`,
      `# ║                  69c84f61d5543b54fe26e1e5/                 ║`,
      `# ║              8e421fdfc_voxmainlogo.png                     ║`,
      `# ╚═══════════════════════════════════════════════════════════╝`,
      `#`,
      `# Server : ${label} (${server.country || ''})`,
      `# User   : ${user.email}`,
      `# Proto  : ${proto.toUpperCase()}`,
      `# Brand  : VoxVPN Premium VPN Service`,
      `# Support: https://voxvpn.net/support`,
      `#`,
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

    if (server.ca_cert) {
      lines.push(``, `<ca>`, server.ca_cert.trim(), `</ca>`);
    }

    if (server.tls_auth_key) {
      lines.push(``, `<tls-auth>`, server.tls_auth_key.trim(), `</tls-auth>`);
      lines.push(`key-direction 1`);
    }

    // auth-user-pass fallback (no per-user certs here — use downloadVpnConfig for that)
    lines.push(``, `auth-user-pass`);
    lines.push(`# Login with your VoxVPN email and password.`);

    const ovpnContent = lines.join('\n') + '\n';
    const serverLabel = label.replace(/\s+/g, '-');
    const fileName = `VoxVPN-${serverLabel}.ovpn`;

    return new Response(ovpnContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-openvpn-profile',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('generateVpnConfig error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});