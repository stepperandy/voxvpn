import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const setupTemplates = {
  windows: `# VoxVPN Windows Configuration
[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  macos: `# VoxVPN macOS Configuration
[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  linux: `# VoxVPN Linux Configuration
[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  ios: `# VoxVPN iOS Configuration
[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  android: `# VoxVPN Android Configuration
[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  router: `# VoxVPN Router Configuration
[Interface]
Address = 10.0.0.1/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY
ListenPort = 51820

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const platform = body.platform?.toLowerCase();

    if (!platform || !setupTemplates[platform]) {
      return Response.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const content = setupTemplates[platform];
    const ext = platform === 'windows' ? 'exe' : 'conf';
    const fileName = `VoxVPN-${platform.charAt(0).toUpperCase() + platform.slice(1)}-Setup.${ext}`;

    return Response.json({
      success: true,
      content,
      fileName,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});