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

const PLATFORMS = ['windows', 'macos', 'linux', 'ios', 'android', 'router'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, orderId } = body;

    if (!email || !orderId) {
      return Response.json({ error: 'Missing email or orderId' }, { status: 400 });
    }

    // Generate setup files for all platforms
    const setups = [];
    for (const platform of PLATFORMS) {
      const content = setupTemplates[platform];
      const fileName = `VoxVPN-${platform.charAt(0).toUpperCase() + platform.slice(1)}-Setup.conf`;
      
      // Upload setup file
      const fileBlob = new Blob([content], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', fileBlob, fileName);

      const uploadRes = await base44.integrations.Core.UploadFile({ file: content });
      
      setups.push({
        platform,
        fileName,
        fileUrl: uploadRes.file_url,
      });
    }

    // Send email with setup links
    const setupLinks = setups.map(s => `${s.platform}: ${s.fileUrl}`).join('\n');
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Your VoxVPN Setup Files',
      body: `Hello,\n\nYour VoxVPN setup has been completed. Download your configuration files below:\n\n${setupLinks}\n\nBest regards,\nVoxVPN Team`,
      from_name: 'VoxVPN',
    });

    return Response.json({ 
      success: true, 
      message: 'Setup files sent to buyer',
      setups: setups.map(s => ({ platform: s.platform, fileName: s.fileName })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});