import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = body.token;

    if (!token) {
      return Response.json({ error: "Missing token" }, { status: 400 });
    }

    // Fetch setups from database where type === 'setup' and is_active === true
    const setups = await base44.asServiceRole.entities.Download.filter(
      { type: 'setup', is_active: true },
      '-updated_date',
      100
    );

    if (setups.length === 0) {
      return Response.json({ error: "No setups available" }, { status: 404 });
    }

    // Map setups to portal format
    const profiles = setups.map((s) => ({
      os: s.platform.toLowerCase().replace('macos', 'macos'),
      fileName: `VoxVPN-${s.platform}-Setup.conf`,
      downloadUrl: s.file_url,
      serverName: s.name,
    }));

    return Response.json({
      email: "setup@voxvpn.com",
      orderId: token,
      profiles,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});