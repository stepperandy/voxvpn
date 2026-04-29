import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, plan } = await req.json();

    if (!email || !plan) {
      return Response.json({ success: false, message: 'Missing email or plan' }, { status: 400 });
    }

    // Check if subscription already exists for this user
    const existing = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: email });

    if (existing.length > 0) {
      // Update existing subscription
      await base44.asServiceRole.entities.VPNSubscription.update(existing[0].id, {
        plan,
        status: 'active',
      });
    } else {
      // Create new subscription
      await base44.asServiceRole.entities.VPNSubscription.create({
        user_email: email,
        plan,
        status: 'active',
        billing_cycle: 'monthly',
        start_date: new Date().toISOString(),
      });
    }

    return Response.json({ success: true, message: 'User activated', plan });

  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
});