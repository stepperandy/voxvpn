Deno.serve(async (req) => {
  try {
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

    return Response.json({ servers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});