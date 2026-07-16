import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appIdentity, phone } = await req.json();

    // Check if profile exists
    const existing = await base44.asServiceRole.entities.UserProfile.filter({
      user_id: user.id,
    });

    if (existing && existing.length > 0) {
      // Update existing profile
      await base44.asServiceRole.entities.UserProfile.update(existing[0].id, {
        app_identity: appIdentity || existing[0].app_identity,
        phone: phone || existing[0].phone,
        status: 'active',
        is_online: true,
      });
      return Response.json({
        success: true,
        message: 'Profile updated',
        profile: { ...existing[0], is_online: true },
      });
    } else {
      // Create new profile
      const profile = await base44.asServiceRole.entities.UserProfile.create({
        user_id: user.id,
        app_identity: appIdentity || `user_${user.id}`,
        phone: phone || '',
        status: 'active',
        is_online: true,
        is_on_call: false,
      });
      return Response.json({
        success: true,
        message: 'Profile created',
        profile,
      });
    }
  } catch (error) {
    console.error('[initializeUserProfile]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});