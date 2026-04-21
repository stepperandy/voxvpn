import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { target_email, plan, billing_cycle, months } = await req.json();

    if (!target_email || !plan) {
      return Response.json({ error: 'Missing target_email or plan' }, { status: 400 });
    }

    const durationMonths = months || 1;
    const now = new Date();
    const renewal = new Date(now);
    renewal.setMonth(renewal.getMonth() + durationMonths);

    // Check for existing subscription
    const existing = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: target_email });

    let subscription;
    if (existing && existing.length > 0) {
      subscription = await base44.asServiceRole.entities.VPNSubscription.update(existing[0].id, {
        plan,
        status: 'active',
        billing_cycle: billing_cycle || 'monthly',
        renewal_date: renewal.toISOString(),
        max_devices: 5,
      });
    } else {
      subscription = await base44.asServiceRole.entities.VPNSubscription.create({
        user_email: target_email,
        plan,
        status: 'active',
        billing_cycle: billing_cycle || 'monthly',
        start_date: now.toISOString(),
        renewal_date: renewal.toISOString(),
        max_devices: 5,
        price: 0,
      });
    }

    // Send notification email
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: target_email,
        subject: 'Your VoxVPN subscription has been activated',
        body: `Hello,\n\nYour VoxVPN ${plan} plan has been activated by our team. It is valid until ${renewal.toDateString()}.\n\nVisit your dashboard to download your VPN config: ${Deno.env.get('APP_URL')}/dashboard\n\nThe VoxVPN Team`,
      });
    } catch (_) {
      // Email failure is non-fatal
    }

    return Response.json({ success: true, subscription });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});