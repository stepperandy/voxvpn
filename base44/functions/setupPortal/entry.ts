import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Build a basic OpenVPN config pointing at all servers.
 * Uses auth-user-pass so the user logs in with their VoxVPN email/password.
 */
function buildOpenVPNConfig(servers, userEmail) {
  const remoteLines = servers.map(s =>
    `remote ${s.ip_address} ${s.port || 1194} ${s.proto || 'udp'}  # ${s.city || s.region || 'Server'}, ${s.country || ''}`
  ).join('\n');

  const firstServer = servers[0] || {};

  const caCert = firstServer.ca_cert
    ? `\n<ca>\n${firstServer.ca_cert.trim()}\n</ca>`
    : `\n# NOTE: Ask support@voxdigits.com for the CA certificate to complete this config.`;

  const tlsAuth = firstServer.tls_auth_key
    ? `\n<tls-auth>\n${firstServer.tls_auth_key.trim()}\n</tls-auth>\nkey-direction 1`
    : '';

  return `# VoxVPN — OpenVPN Configuration
# User: ${userEmail}
# Generated: ${new Date().toISOString()}
# Servers included: ${servers.length}
#
# INSTRUCTIONS:
# 1. Install OpenVPN Connect (free) from https://openvpn.net/client/
# 2. Import this .ovpn file into OpenVPN Connect
# 3. Connect using your VoxVPN email and password
# ─────────────────────────────────────────────

client
dev tun
proto ${firstServer.proto || 'udp'}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
redirect-gateway def1 bypass-dhcp
cipher AES-256-CBC
auth SHA256
verb 3
keepalive 10 60
auth-user-pass

# ── Servers (${servers.length} locations) ──
# OpenVPN auto-connects to the first available server.
${remoteLines}
${caCert}
${tlsAuth}
`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { platform, proto } = body;

    // Authenticate the calling user
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}

    if (!user) {
      return Response.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // Check active subscription (admins bypass)
    if (user.role !== 'admin') {
      const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: user.email });
      const active = subs?.find(s => ['active', 'trial'].includes(s.status));
      if (!active) {
        return Response.json({ error: 'No active subscription found.' }, { status: 403 });
      }
    }

    // Get all online servers
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });

    // Info-only call (no platform/proto) → return server list for UI display
    if (!platform || !proto) {
      return Response.json({
        email: user.email,
        plan: user.role === 'admin' ? 'Admin' : 'Active',
        serverCount: servers.length,
        servers: servers.map(s => ({
          name: s.city || s.region,
          country: s.country || '',
          load: s.current_load || 0,
        })),
      });
    }

    // Generate and upload the config file
    if (servers.length === 0) {
      return Response.json({ error: 'No VPN servers are currently available. Please contact support.' }, { status: 503 });
    }

    let fileContent, fileName, mimeType;

    if (proto === 'openvpn') {
      fileContent = buildOpenVPNConfig(servers, user.email);
      fileName = `VoxVPN-${platform}.ovpn`;
      mimeType = 'application/x-openvpn-profile';
    } else {
      // WireGuard: return a simple per-server conf for the first server
      const s = servers[0];
      fileContent = `[Interface]
# Replace with your WireGuard private key
PrivateKey = YOUR_PRIVATE_KEY_HERE
Address = 10.8.0.2/32
DNS = 8.8.8.8, 1.1.1.1

[Peer]
PublicKey = ${s.public_key || 'SERVER_PUBLIC_KEY_HERE'}
Endpoint = ${s.ip_address}:${s.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
# Server: ${s.city || s.region}, ${s.country}
`;
      fileName = `VoxVPN-${platform}.conf`;
      mimeType = 'text/plain';
    }

    const file = new File([fileContent], fileName, { type: mimeType });
    const upload = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    return Response.json({
      url: upload.file_url,
      fileName,
      serverCount: servers.length,
    });

  } catch (error) {
    console.error('setupPortal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});