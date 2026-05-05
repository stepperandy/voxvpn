import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * updateAccountSettings — update user preferences
 * Body: { notifications_enabled?, theme?, auto_connect?, billing_email? }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notifications_enabled, theme, auto_connect, billing_email } = body;

    // Update user preferences
    const preferences = {};
    if (notifications_enabled !== undefined) preferences.notifications_enabled = notifications_enabled;
    if (theme) preferences.theme = theme;
    if (auto_connect !== undefined) preferences.auto_connect = auto_connect;
    if (billing_email) preferences.billing_email = billing_email;

    await base44.auth.updateMe({ preferences });

    return Response.json({
      success: true,
      message: 'Settings updated',
      preferences,
    });
  } catch (error) {
    console.error('updateAccountSettings error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});