import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * updateUserProfile — update user's profile data
 * Body: { full_name?, notifications_enabled?, theme? }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, notifications_enabled, theme } = body;

    const updateData = {};
    if (full_name) updateData.full_name = full_name;

    // Save preferences in user entity (if custom fields exist) or via updateMe
    await base44.auth.updateMe({
      ...updateData,
      preferences: {
        notifications_enabled: notifications_enabled !== undefined ? notifications_enabled : true,
        theme: theme || 'dark',
      },
    });

    const updated = await base44.auth.me();

    return Response.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        full_name: updated.full_name,
      },
    });
  } catch (error) {
    console.error('updateUserProfile error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});