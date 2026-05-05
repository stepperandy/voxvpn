import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * runSpeedTest — test connection speed (latency, bandwidth estimate)
 * Body: { server_id? }
 * Returns: { latency_ms, download_mbps, upload_mbps, jitter_ms, packet_loss }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const serverId = body.server_id;

    // Get server
    let server;
    if (serverId) {
      const servers = await base44.asServiceRole.entities.VPNServer.filter({ id: serverId, status: 'online' });
      server = servers?.[0];
    } else {
      const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
      server = servers?.length > 0 ? servers[0] : null;
    }

    if (!server) {
      return Response.json({ error: 'No server available' }, { status: 503 });
    }

    // Simulate speed test results (in production, use real speed test endpoint)
    const baseLatency = Math.random() * 50 + 10; // 10-60ms
    const jitter = Math.random() * 5; // 0-5ms
    const packetLoss = Math.random() * 0.5; // 0-0.5%

    // Bandwidth varies by server load
    const loadFactor = (server.active_connections || 0) / (server.max_connections || 1000);
    const baseBandwidth = 950; // 950 Mbps max
    const downloadMbps = baseBandwidth * (1 - loadFactor * 0.3);
    const uploadMbps = baseBandwidth * (1 - loadFactor * 0.5);

    return Response.json({
      server: {
        city: server.city,
        country: server.country,
      },
      results: {
        latency_ms: Math.round(baseLatency * 10) / 10,
        jitter_ms: Math.round(jitter * 10) / 10,
        download_mbps: Math.round(downloadMbps * 10) / 10,
        upload_mbps: Math.round(uploadMbps * 10) / 10,
        packet_loss: Math.round(packetLoss * 100) / 100,
        test_quality: downloadMbps > 500 ? 'excellent' : downloadMbps > 250 ? 'good' : 'fair',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('runSpeedTest error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});