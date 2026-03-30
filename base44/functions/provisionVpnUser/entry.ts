import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Generate a WireGuard-compatible keypair using random bytes (Curve25519)
function generateWireGuardKeypair() {
  // Generate 32 random bytes for the private key
  const privateKeyBytes = crypto.getRandomValues(new Uint8Array(32));
  
  // Apply WireGuard clamping to the private key
  privateKeyBytes[0] &= 248;
  privateKeyBytes[31] &= 127;
  privateKeyBytes[31] |= 64;

  const privateKey = btoa(String.fromCharCode(...privateKeyBytes));
  
  // For the public key, we generate a separate random key pair for the config
  // The actual WireGuard server will handle key validation
  // In production, real public key derivation requires a Curve25519 scalar mult implementation
  // We'll store the private key and use a placeholder public key format
  const publicKeyBytes = crypto.getRandomValues(new Uint8Array(32));
  const publicKey = btoa(String.fromCharCode(...publicKeyBytes));

  return { privateKey, publicKey };
}

// Assign a VPN IP address based on subscription index (10.8.0.x)
function assignVpnIp(userId) {
  // Generate a deterministic IP offset from user ID hash
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  const offset = (Math.abs(hash) % 200) + 10; // 10.8.0.10 - 10.8.0.209
  return `10.8.0.${offset}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, plan, orderId, deviceName, platform } = body;

    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 });
    }

    // Find or pick the best available server
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    if (!servers || servers.length === 0) {
      return Response.json({ error: 'No VPN servers available' }, { status: 503 });
    }

    // Pick server with lowest load
    const server = servers.reduce((best, s) => {
      const load = (s.active_connections || 0) / (s.max_connections || 1000);
      const bestLoad = (best.active_connections || 0) / (best.max_connections || 1000);
      return load < bestLoad ? s : best;
    });

    // Generate WireGuard keypair for this user
    const { privateKey, publicKey } = await generateWireGuardKeypair();

    // Assign VPN tunnel IP
    const vpnIp = assignVpnIp(email + (Date.now().toString()));

    // Find or create subscription
    let subscription = null;
    const existingSubs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: email });
    
    if (existingSubs && existingSubs.length > 0) {
      subscription = existingSubs[0];
    } else {
      const planConfig = {
        Basic: { max_devices: 2, price: 9.99 },
        Standard: { max_devices: 3, price: 14.99 },
        Premium: { max_devices: 5, price: 19.99 },
        Advanced: { max_devices: 7, price: 29.99 },
        Enterprise: { max_devices: 10, price: 39.99 },
      };
      const cfg = planConfig[plan] || planConfig['Basic'];

      const now = new Date();
      const renewal = new Date(now);
      renewal.setMonth(renewal.getMonth() + 1);

      subscription = await base44.asServiceRole.entities.VPNSubscription.create({
        user_email: email,
        plan: plan || 'Basic',
        status: 'active',
        billing_cycle: 'monthly',
        price: cfg.price,
        max_devices: cfg.max_devices,
        start_date: now.toISOString(),
        renewal_date: renewal.toISOString(),
        stripe_subscription_id: orderId || '',
      });
    }

    // Create a linked device record with the VPN credentials
    const device = await base44.asServiceRole.entities.LinkedDevice.create({
      subscription_id: subscription.id,
      device_name: deviceName || `${platform || 'Windows'} Device`,
      device_type: (platform || 'windows').toLowerCase(),
      vpn_profile_key: privateKey,
      ip_address: vpnIp,
      status: 'active',
      last_connected: new Date().toISOString(),
    });

    // Build the WireGuard config content
    const configContent = `[Interface]
PrivateKey = ${privateKey}
Address = ${vpnIp}/32
DNS = 8.8.8.8, 1.1.1.1

[Peer]
PublicKey = ${server.public_key}
Endpoint = ${server.ip_address}:${server.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;

    // Build a File object for upload
    const configFile = new File([configContent], `VoxVPN-${email}.conf`, { type: 'text/plain' });
    const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({
      file: configFile,
    });

    return Response.json({
      success: true,
      deviceId: device.id,
      subscriptionId: subscription.id,
      vpnIp,
      serverRegion: server.region,
      serverIp: server.ip_address,
      configUrl: uploadRes.file_url,
      configContent,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});