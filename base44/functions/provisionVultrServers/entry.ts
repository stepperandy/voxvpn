import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const vultrApiKey = Deno.env.get('VULTR_API_KEY');
    if (!vultrApiKey) {
      return Response.json({ error: 'VULTR_API_KEY not configured' }, { status: 500 });
    }

    // Fetch all VPNServers without Vultr instance IDs
    const servers = await base44.asServiceRole.entities.VPNServer.filter({});
    const serversToProvision = servers.filter(s => !s.vultr_instance_id);

    if (serversToProvision.length === 0) {
      return Response.json({ 
        message: 'No servers to provision (all have Vultr instance IDs)',
        total: servers.length,
        provisioned: 0
      });
    }

    const results = [];
    
    for (const server of serversToProvision) {
      const vultrServerName = `voxvpn-${server.city || server.region}`.toLowerCase().replace(/\s+/g, '-');
      
      const vultrPayload = {
        region: getVultrRegion(server.country),
        plan: 'vc2-1c-1gb',
        os_id: 387, // Ubuntu 22.04
        label: vultrServerName,
        hostname: vultrServerName,
        enable_ipv6: true,
        backups: 'disabled',
        auto_backups: false,
      };

      const vultrRes = await fetch('https://api.vultr.com/v2/instances', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vultrApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vultrPayload),
      });

      if (!vultrRes.ok) {
        const errText = await vultrRes.text();
        results.push({
          city: server.city,
          status: 'failed',
          error: errText,
        });
        continue;
      }

      const vultrData = await vultrRes.json();
      const vultrInstance = vultrData.instance;

      // Update the server record with Vultr info
      await base44.asServiceRole.entities.VPNServer.update(server.id, {
        vultr_instance_id: vultrInstance.id,
        ip_address: vultrInstance.main_ip || server.ip_address,
      });

      results.push({
        city: server.city,
        status: 'provisioned',
        vultr_instance_id: vultrInstance.id,
        ip_address: vultrInstance.main_ip,
      });
    }

    return Response.json({
      message: 'Vultr provisioning completed',
      total_to_provision: serversToProvision.length,
      results: results,
      provisioned_count: results.filter(r => r.status === 'provisioned').length,
      failed_count: results.filter(r => r.status === 'failed').length,
    });

  } catch (error) {
    console.error('provisionVultrServers error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getVultrRegion(countryCode) {
  const regionMap = {
    'US': 'ewr',      // New Jersey
    'CA': 'tor',      // Toronto
    'GB': 'lhr',      // London
    'DE': 'fra',      // Frankfurt
    'FR': 'cdg',      // Paris
    'JP': 'nrt',      // Tokyo
    'SG': 'sgp',      // Singapore
    'AU': 'syd',      // Sydney
  };
  return regionMap[countryCode] || 'ewr';
}