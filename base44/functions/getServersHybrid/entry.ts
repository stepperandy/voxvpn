import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Hybrid server list:
 * 1. Fetches all active VPNProviders of type "white_label" and calls their server APIs.
 * 2. Fetches all online VPNServers (our own Vultr / custom nodes).
 * 3. Merges and returns a unified server list with source tagging.
 */

async function fetchProviderServers(provider) {
  if (!provider.api_base_url || !provider.servers_endpoint) return [];

  const url = provider.api_base_url.replace(/\/$/, '') + provider.servers_endpoint;
  const headers = { 'Content-Type': 'application/json' };

  if (provider.api_key) {
    const headerName = provider.auth_header || 'Authorization';
    headers[headerName] = headerName.toLowerCase() === 'authorization'
      ? `Bearer ${provider.api_key}`
      : provider.api_key;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Provider ${provider.name} returned ${res.status}`);

  const data = await res.json();

  // Normalize — providers may return arrays directly or wrapped
  const raw = Array.isArray(data) ? data : (data.servers || data.locations || data.data || []);

  return raw.map(s => ({
    id: `${provider.id}-${s.id || s.server_id || s.hostname || Math.random()}`,
    city: s.city || s.name || s.location || s.region || 'Unknown',
    country: s.country || s.country_code || '',
    country_code: s.country_code || s.cc || '',
    flag: s.flag || '',
    ip_address: s.ip || s.ip_address || s.host || '',
    load: s.load || s.server_load || 0,
    tier: provider.tier || 'standard',
    source: 'provider',
    provider_id: provider.id,
    provider_name: provider.name,
    config_format: provider.config_format || 'wireguard',
    connect_endpoint: provider.api_base_url
      ? provider.api_base_url.replace(/\/$/, '') + (provider.connect_endpoint || '')
      : '',
    api_key: provider.api_key || '',
    auth_header: provider.auth_header || 'Authorization',
  }));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth check (allow unauthenticated for demo — remove if you want auth-only)
    // const user = await base44.auth.me();
    // if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [providers, ownServers] = await Promise.allSettled([
      base44.asServiceRole.entities.VPNProvider.filter({ status: 'active', type: 'white_label' }),
      base44.asServiceRole.entities.VPNServer.filter({ status: 'online' }),
    ]);

    const allServers = [];

    // Own Vultr / custom servers (always first or sorted by priority)
    if (ownServers.status === 'fulfilled' && ownServers.value?.length > 0) {
      for (const s of ownServers.value) {
        allServers.push({
          id: s.id,
          city: s.city || s.region || 'Custom',
          country: s.country || '',
          country_code: s.country || '',
          flag: '',
          ip_address: s.ip_address,
          load: s.current_load || Math.round((s.active_connections || 0) / (s.max_connections || 100) * 100),
          tier: 'premium',
          source: 'own',
          provider_name: 'VoxVPN',
          config_format: s.proto === 'tcp' ? 'openvpn' : 'wireguard',
          port: s.port,
          proto: s.proto,
          ca_cert: s.ca_cert,
          tls_auth_key: s.tls_auth_key,
          public_key: s.public_key,
        });
      }
    }

    // White-label provider servers
    if (providers.status === 'fulfilled' && providers.value?.length > 0) {
      const results = await Promise.allSettled(
        providers.value.map(p => fetchProviderServers(p))
      );
      for (const r of results) {
        if (r.status === 'fulfilled') allServers.push(...r.value);
      }
    }

    // Sort: own (premium) first, then by load
    allServers.sort((a, b) => {
      if (a.tier === 'premium' && b.tier !== 'premium') return -1;
      if (b.tier === 'premium' && a.tier !== 'premium') return 1;
      return (a.load || 0) - (b.load || 0);
    });

    return Response.json({
      servers: allServers,
      total: allServers.length,
      own_count: allServers.filter(s => s.source === 'own').length,
      provider_count: allServers.filter(s => s.source === 'provider').length,
    });

  } catch (error) {
    console.error('getServersHybrid error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});