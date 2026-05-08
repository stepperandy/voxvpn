import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function buildWireGuardConfig(device, server, vpnIp) {
  return `[Interface]
# VoxVPN WireGuard Config
PrivateKey = ${device?.vpn_profile_key || 'REPLACE_WITH_YOUR_PRIVATE_KEY'}
Address = ${vpnIp || device?.ip_address || '10.8.0.2'}/32
DNS = 8.8.8.8, 1.1.1.1

[Peer]
# ${server.city || server.region}, ${server.country || ''}
PublicKey = ${server.public_key || 'REPLACE_WITH_SERVER_PUBLIC_KEY'}
Endpoint = ${server.ip_address}:${server.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;
}

function buildOpenVPNConfig(server, email) {
  return `client
dev tun
proto ${server.proto || 'udp'}
remote ${server.ip_address} ${server.port || 1194}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
redirect-gateway def1 bypass-dhcp
cipher AES-256-CBC
auth SHA256
verb 3
# VoxVPN | Server: ${server.city || server.region}, ${server.country || ''}
# User: ${email}
# Generated: ${new Date().toISOString()}
auth-user-pass
# Use your VoxVPN email + password to authenticate.
${server.ca_cert ? `\n<ca>\n${server.ca_cert.trim()}\n</ca>` : ''}
${server.tls_auth_key ? `\n<tls-auth>\n${server.tls_auth_key.trim()}\n</tls-auth>\nkey-direction 1` : ''}
`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { token, server_id, platform, proto } = body;

    if (!token) {
      return Response.json({ error: 'Missing token' }, { status: 400 });
    }

    // Look up subscription by token
    const allSubs = await base44.asServiceRole.entities.VPNSubscription.list('-created_date', 500);
    const subscription = allSubs.find(s =>
      s.stripe_subscription_id === token || s.id === token
    );
    const email = subscription?.user_email || 'user@voxvpn.net';

    // Get all online servers
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });

    // If server_id + platform provided → generate and return a single config file URL
    if (server_id && platform) {
      const server = servers.find(s => s.id === server_id) || servers[0];
      if (!server) {
        return Response.json({ error: 'No servers available' }, { status: 503 });
      }

      // Find user's linked device for personalized WireGuard key
      let device = null;
      if (subscription) {
        const devices = await base44.asServiceRole.entities.LinkedDevice.filter({
          subscription_id: subscription.id,
          device_type: platform.toLowerCase(),
          status: 'active',
        });
        device = devices?.[0] || null;
      }

      const useProto = proto || 'wireguard';
      const serverLabel = (server.city || server.region || 'Server').replace(/\s+/g, '-');
      const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

      let fileContent, fileName, mimeType;
      if (useProto === 'wireguard') {
        fileContent = buildWireGuardConfig(device, server, device?.ip_address);
        fileName = `VoxVPN-${serverLabel}-${platformLabel}.conf`;
        mimeType = 'text/plain';
      } else {
        fileContent = buildOpenVPNConfig(server, email);
        fileName = `VoxVPN-${serverLabel}-${platformLabel}.ovpn`;
        mimeType = 'application/x-openvpn-profile';
      }

      const file = new File([fileContent], fileName, { type: mimeType });
      const upload = await base44.asServiceRole.integrations.Core.UploadFile({ file });

      return Response.json({
        url: upload.file_url,
        fileName,
        serverName: `${server.city || server.region} (${server.country || ''})`,
      });
    }

    // Otherwise → return server list for the UI to display
    const serverList = servers.map(s => ({
      id: s.id,
      name: `${s.city || s.region}`,
      country: s.country || '',
      region: s.region || '',
      status: s.status,
      load: s.current_load || Math.round((s.active_connections || 0) / (s.max_connections || 100) * 100),
    }));

    return Response.json({
      email,
      orderId: token,
      plan: subscription?.plan || 'Basic',
      servers: serverList,
    });

  } catch (error) {
    console.error('setupPortal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});