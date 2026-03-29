import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const apiKey = Deno.env.get("VULTR_API_KEY");

    const response = await fetch("https://api.vultr.com/v2/instances?per_page=100", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `Vultr API error: ${err}` }, { status: response.status });
    }

    const data = await response.json();
    const instances = data.instances || [];

    const servers = instances.map((instance) => ({
      id: instance.id,
      name: instance.label || instance.hostname || instance.id,
      location: instance.region,
      ip: instance.main_ip,
      status: instance.status,        // "active", "pending", etc.
      power: instance.power_status,   // "running", "stopped"
      ram: instance.ram,
      vcpu: instance.vcpu_count,
      os: instance.os,
      plan: instance.plan,
    }));

    // If fewer than 15 servers, add demo servers to reach 15
    const demoServers = [
      { id: 'demo-1', name: 'VoxVPN Singapore 02', location: 'sgp', ip: '103.154.22.45', status: 'active', power: 'running', ram: 2048, vcpu: 2, os: 'Ubuntu', plan: 'Cloud Compute' },
      { id: 'demo-2', name: 'VoxVPN Tokyo 02', location: 'nrt', ip: '161.202.33.56', status: 'active', power: 'running', ram: 4096, vcpu: 4, os: 'Ubuntu', plan: 'Cloud Compute' },
      { id: 'demo-3', name: 'VoxVPN Sydney 02', location: 'syd', ip: '103.188.44.67', status: 'active', power: 'running', ram: 2048, vcpu: 2, os: 'Ubuntu', plan: 'Cloud Compute' },
      { id: 'demo-4', name: 'VoxVPN Mumbai 01', location: 'bom', ip: '103.21.55.78', status: 'active', power: 'running', ram: 2048, vcpu: 2, os: 'Ubuntu', plan: 'Cloud Compute' },
      { id: 'demo-5', name: 'VoxVPN Johannesburg 01', location: 'jnb', ip: '196.207.66.89', status: 'active', power: 'running', ram: 2048, vcpu: 2, os: 'Ubuntu', plan: 'Cloud Compute' },
      { id: 'demo-6', name: 'VoxVPN Madrid 01', location: 'mad', ip: '185.206.77.90', status: 'active', power: 'running', ram: 4096, vcpu: 4, os: 'Ubuntu', plan: 'Cloud Compute' },
      { id: 'demo-7', name: 'VoxVPN Warsaw 01', location: 'waw', ip: '185.206.88.101', status: 'active', power: 'running', ram: 2048, vcpu: 2, os: 'Ubuntu', plan: 'Cloud Compute' },
      { id: 'demo-8', name: 'VoxVPN Stockholm 01', location: 'sto', ip: '185.206.99.112', status: 'active', power: 'running', ram: 2048, vcpu: 2, os: 'Ubuntu', plan: 'Cloud Compute' },
      { id: 'demo-9', name: 'VoxVPN Dublin 01', location: 'lhr', ip: '185.206.110.123', status: 'active', power: 'running', ram: 4096, vcpu: 4, os: 'Ubuntu', plan: 'Cloud Compute' },
      { id: 'demo-10', name: 'VoxVPN Zurich 01', location: 'fra', ip: '185.206.121.134', status: 'active', power: 'running', ram: 2048, vcpu: 2, os: 'Ubuntu', plan: 'Cloud Compute' },
    ];

    const allServers = [...servers, ...demoServers.slice(0, Math.max(0, 15 - servers.length))];

    return Response.json({ servers: allServers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});