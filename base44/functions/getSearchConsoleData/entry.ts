import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    let body = {};
    try { body = await req.json(); } catch { /* no body */ }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_search_console');
    const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // List verified sites
    const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', { headers });
    const sitesData = await sitesRes.json();
    const sites = sitesData.siteEntry || [];

    if (sites.length === 0) {
      return Response.json({ sites: [], currentSite: null, performance: [], topQueries: [], topPages: [], sitemaps: [], summary: { clicks: 0, impressions: 0, ctr: 0, position: 0 } });
    }

    const siteUrl = body.siteUrl || sites[0].siteUrl;
    const encodedSite = encodeURIComponent(siteUrl);

    // Date range: last 28 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 27);
    const fmt = (d) => d.toISOString().split('T')[0];
    const startStr = fmt(startDate);
    const endStr = fmt(endDate);

    const analyticsBase = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

    const [perfRes, queryRes, pageRes, sitemapRes] = await Promise.all([
      fetch(analyticsBase, { method: 'POST', headers, body: JSON.stringify({ startDate: startStr, endDate: endStr, dimensions: ['date'], rowLimit: 1000 }) }),
      fetch(analyticsBase, { method: 'POST', headers, body: JSON.stringify({ startDate: startStr, endDate: endStr, dimensions: ['query'], rowLimit: 20 }) }),
      fetch(analyticsBase, { method: 'POST', headers, body: JSON.stringify({ startDate: startStr, endDate: endStr, dimensions: ['page'], rowLimit: 20 }) }),
      fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`, { headers }),
    ]);

    const [perfData, queryData, pageData, sitemapData] = await Promise.all([
      perfRes.json(), queryRes.json(), pageRes.json(), sitemapRes.json()
    ]);

    const performance = (perfData.rows || []).map(r => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
    const topQueries = (queryData.rows || []).map(r => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
    const topPages = (pageData.rows || []).map(r => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
    const sitemaps = (sitemapData.sitemap || []).map(s => ({ path: s.path, lastSubmitted: s.lastSubmitted, status: s.status, errors: s.errors || 0, warnings: s.warnings || 0, indexed: s.indexed || 0 }));

    // Aggregate summary
    const summary = performance.reduce((acc, r) => {
      acc.clicks += r.clicks;
      acc.impressions += r.impressions;
      acc.ctrSum += r.ctr * r.impressions;
      acc.posSum += r.position * r.impressions;
      return acc;
    }, { clicks: 0, impressions: 0, ctrSum: 0, posSum: 0 });

    return Response.json({
      sites: sites.map(s => ({ url: s.siteUrl, permissionLevel: s.permissionLevel })),
      currentSite: siteUrl,
      performance,
      topQueries,
      topPages,
      sitemaps,
      summary: {
        clicks: summary.clicks,
        impressions: summary.impressions,
        ctr: summary.impressions > 0 ? summary.ctrSum / summary.impressions : 0,
        position: summary.impressions > 0 ? summary.posSum / summary.impressions : 0,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});