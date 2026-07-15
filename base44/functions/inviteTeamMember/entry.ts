import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['client_admin', 'agency_admin', 'super_admin', 'admin'].includes(user.role)) {
      return Response.json({ error: 'Forbidden — not a business admin' }, { status: 403 });
    }

    const body = await req.json();
    const { email, full_name, job_title, member_role } = body;

    if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const clientId = user.client_id;
    if (!clientId) return Response.json({ error: 'No business associated' }, { status: 400 });

    // Check max team size
    const client = await base44.asServiceRole.entities.Client.get(clientId);
    const existingMembers = await base44.asServiceRole.entities.User.filter({ client_id: clientId });
    if ((existingMembers || []).length >= (client.max_users || 10)) {
      return Response.json({ error: `Team limit reached (${client.max_users} members). Upgrade your plan to add more.` }, { status: 400 });
    }

    // Check if user already exists
    const existing = await base44.asServiceRole.entities.User.filter({ email });
    if (existing.length > 0) {
      const existingUser = existing[0];
      if (existingUser.client_id) {
        return Response.json({ error: 'This user is already part of a team' }, { status: 400 });
      }
      // Link existing user to this client
      await base44.asServiceRole.entities.User.update(existingUser.id, {
        client_id: clientId,
        role: member_role || 'team_member',
        job_title: job_title || null,
        full_name: full_name || existingUser.full_name,
        is_active: true,
      });

      // Send notification email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `🛡️ You've been added to ${client.name}`,
        body: `Hi ${full_name || email},\n\nYou've been added to the ${client.name} team on VoxShield.\n\nAccess your dashboard: ${Deno.env.get('APP_URL') || 'https://voxvpn.net'}/business/dashboard\n\nUse your existing VoxVPN credentials to log in.\n\nStay secure,\nThe VoxShield Team`,
      });

      return Response.json({ success: true, message: 'Existing user linked to team', action: 'linked' });
    }

    // Invite new user
    try {
      await base44.users.inviteUser(email, member_role || 'team_member');
    } catch (err) {
      return Response.json({ error: 'Failed to invite user: ' + (err.message || 'Unknown error') }, { status: 500 });
    }

    // Set client_id and job_title on the invited user
    const invited = await base44.asServiceRole.entities.User.filter({ email });
    if (invited.length > 0) {
      await base44.asServiceRole.entities.User.update(invited[0].id, {
        client_id: clientId,
        job_title: job_title || null,
        full_name: full_name || null,
      });
    }

    return Response.json({ success: true, message: 'Team member invited', action: 'invited' });
  } catch (error) {
    console.error('inviteTeamMember error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});