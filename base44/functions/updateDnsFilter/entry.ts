import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['client_admin', 'agency_admin', 'super_admin', 'admin'].includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { dns_filter_config } = body;

    const clientId = user.client_id;
    if (!clientId) return Response.json({ error: 'No business associated' }, { status: 400 });

    await base44.asServiceRole.entities.Client.update(clientId, {
      dns_filter_config,
    });

    // Log the policy change
    await base44.asServiceRole.entities.SecurityLog.create({
      client_id: clientId,
      user_email: user.email,
      event_type: 'policy_change',
      severity: 'info',
      message: 'DNS filtering policy updated',
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true, message: 'DNS filtering policy updated' });
  } catch (error) {
    console.error('updateDnsFilter error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});