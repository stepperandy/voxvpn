import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['client_admin', 'agency_admin', 'super_admin', 'admin'].includes(user.role)) {
      return Response.json({ error: 'Forbidden — not a business admin' }, { status: 403 });
    }

    const clientId = user.client_id;
    if (!clientId) return Response.json({ error: 'No business associated with this account' }, { status: 400 });

    // Fetch core data in parallel
    const [client, teamMembers, securityLogs, dnsLogs] = await Promise.all([
      base44.asServiceRole.entities.Client.get(clientId),
      base44.asServiceRole.entities.User.filter({ client_id: clientId }),
      base44.asServiceRole.entities.SecurityLog.filter({ client_id: clientId }, '-timestamp', 30),
      base44.asServiceRole.entities.DNSFilterLog.filter({ client_id: clientId }, '-timestamp', 30),
    ]);

    // Fetch subscriptions for team members
    const teamEmails = (teamMembers || []).map(m => m.email).filter(Boolean);
    const allSubs = [];
    for (const email of teamEmails) {
      try {
        const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: email });
        allSubs.push(...(subs || []));
      } catch { /* skip */ }
    }

    // Fetch devices for these subscriptions
    const subIds = allSubs.map(s => s.id);
    const allDevices = [];
    for (const subId of subIds) {
      try {
        const devices = await base44.asServiceRole.entities.LinkedDevice.filter({ subscription_id: subId });
        allDevices.push(...(devices || []));
      } catch { /* skip */ }
    }

    // Map devices with owner email
    const subEmailMap = {};
    allSubs.forEach(s => { subEmailMap[s.id] = s.user_email; });
    const devicesWithOwner = allDevices.map(d => ({
      ...d,
      owner_email: subEmailMap[d.subscription_id] || null,
    }));

    // Strip sensitive fields from team members
    const safeMembers = (teamMembers || []).map(m => ({
      id: m.id,
      email: m.email,
      full_name: m.full_name,
      role: m.role,
      job_title: m.job_title,
      is_active: m.is_active,
      last_login: m.last_login,
      created_date: m.created_date,
    }));

    return Response.json({
      client,
      teamMembers: safeMembers,
      securityLogs: securityLogs || [],
      dnsLogs: dnsLogs || [],
      subscriptions: allSubs,
      devices: devicesWithOwner,
      stats: {
        totalMembers: safeMembers.length,
        activeMembers: safeMembers.filter(m => m.is_active !== false).length,
        totalDevices: allDevices.length,
        activeDevices: allDevices.filter(d => d.status === 'active').length,
        threatsBlocked: (dnsLogs || []).filter(l => l.blocked).length,
        totalLogs: (securityLogs || []).length,
      },
    });
  } catch (error) {
    console.error('getTeamData error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});