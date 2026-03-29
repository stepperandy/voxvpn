import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Sample WireGuard/OpenVPN config templates
const getConfigContent = (os, serverIp, privateKey, publicKey) => {
  if (os === 'windows' || os === 'macos' || os === 'linux') {
    // WireGuard config
    return `[Interface]
PrivateKey = ${privateKey}
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4

[Peer]
PublicKey = ${publicKey}
Endpoint = ${serverIp}:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
`;
  } else if (os === 'android' || os === 'ios') {
    // Mobile config
    return `[Interface]
PrivateKey = ${privateKey}
Address = 10.0.0.2/32
DNS = 8.8.8.8

[Peer]
PublicKey = ${publicKey}
Endpoint = ${serverIp}:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
`;
  }
  return '';
};

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, os } = body;

    if (!token || !os) {
      return Response.json({ error: 'Missing token or OS' }, { status: 400 });
    }

    // In production, fetch the real config from your database using the token
    // For now, generate a demo config
    const privateKey = 'OMJt0NBWzRsD8VC1h+M/i7cqjdPqUNOBkv4GrWx0XnU=';
    const publicKey = 'TGeIU3tgTqLG10sSXWCqOSLN++VKaCYJp1Aw04m/AGo=';
    const serverIp = '103.154.22.45';

    const configContent = getConfigContent(os, serverIp, privateKey, publicKey);

    const filename = `VoxVPN-${os.charAt(0).toUpperCase() + os.slice(1)}-Setup.conf`;

    return new Response(configContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});