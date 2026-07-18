import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { siteUrl } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_search_console');

    const headers = { 'Authorization': `Bearer ${accessToken}` };

    // 1. List sites to find the one to use
    const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', { headers });
    const sitesData = await sitesRes.json();
    const sites = sitesData.siteEntry || [];

    // Pick the target site: explicit param > any site containing voxtelefony > first site
    const targetSite = siteUrl
      ? sites.find(s => s.siteUrl === siteUrl)
      : sites.find(s => s.siteUrl.includes('voxtelefony')) || sites[0];

    if (!targetSite) {
      return Response.json({
        connected: true,
        sites: sites.map(s => s.siteUrl),
        message: 'No verified properties found in Google Search Console.',
      });
    }

    const encodedSite = encodeURIComponent(targetSite.siteUrl);

    // 2. Search analytics — last 28 days
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 28);
    const fmt = (d) => d.toISOString().split('T')[0];

    const analyticsRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: fmt(startDate),
          endDate: fmt(today),
          dimensions: ['date'],
          rowLimit: 28,
        }),
      }
    );
    const analyticsData = await analyticsRes.json();
    const rows = analyticsData.rows || [];

    const totals = rows.reduce((acc, r) => {
      acc.clicks += r.clicks || 0;
      acc.impressions += r.impressions || 0;
      acc.ctr = ((acc.clicks / Math.max(acc.impressions, 1)) * 100);
      acc.position += (r.position || 0);
      return acc;
    }, { clicks: 0, impressions: 0, ctr: 0, position: 0 });
    totals.position = rows.length ? totals.position / rows.length : 0;
    totals.ctr = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;

    // 3. Top queries
    const queriesRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: fmt(startDate),
          endDate: fmt(today),
          dimensions: ['query'],
          rowLimit: 10,
        }),
      }
    );
    const queriesData = await queriesRes.json();
    const topQueries = (queriesData.rows || []).map(r => ({
      query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position,
    }));

    // 4. Top pages
    const pagesRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: fmt(startDate),
          endDate: fmt(today),
          dimensions: ['page'],
          rowLimit: 10,
        }),
      }
    );
    const pagesData = await pagesRes.json();
    const topPages = (pagesData.rows || []).map(r => ({
      page: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position,
    }));

    // 5. Sitemaps
    const sitemapsRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`,
      { headers }
    );
    const sitemapsData = await sitemapsRes.json();
    const sitemaps = (sitemapsData.sitemap || []).map(s => ({
      path: s.path,
      type: s.type,
      submitted: s.lastSubmitted,
      status: s.errors ? 'errors' : s.warnings ? 'warnings' : 'ok',
      errors: s.errors || 0,
      warnings: s.warnings || 0,
      indexed: s.contents?.indexed || 0,
      submitted_count: s.contents?.submitted || 0,
    }));

    return Response.json({
      connected: true,
      siteUrl: targetSite.siteUrl,
      sites: sites.map(s => s.siteUrl),
      totals: {
        clicks: Math.round(totals.clicks),
        impressions: Math.round(totals.impressions),
        ctr: parseFloat(totals.ctr.toFixed(1)),
        position: parseFloat(totals.position.toFixed(1)),
      },
      daily: rows.map(r => ({
        date: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
      })),
      topQueries,
      topPages,
      sitemaps,
    });
  } catch (error) {
    console.error('getSearchConsoleData error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});