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
    const { member_id } = body;

    if (!member_id) return Response.json({ error: 'Member ID required' }, { status: 400 });

    const clientId = user.client_id;
    if (!clientId) return Response.json({ error: 'No business associated' }, { status: 400 });

    // Verify the member belongs to this client
    const member = await base44.asServiceRole.entities.User.get(member_id);
    if (!member || member.client_id !== clientId) {
      return Response.json({ error: 'Member not found in your team' }, { status: 404 });
    }

    // Don't allow removing yourself
    if (member.id === user.id) {
      return Response.json({ error: 'You cannot remove yourself' }, { status: 400 });
    }

    // Unlink from team (keep account, just remove client_id and reset role)
    await base44.asServiceRole.entities.User.update(member_id, {
      client_id: null,
      role: 'user',
      job_title: null,
      is_active: false,
    });

    return Response.json({ success: true, message: 'Team member removed' });
  } catch (error) {
    console.error('removeTeamMember error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});