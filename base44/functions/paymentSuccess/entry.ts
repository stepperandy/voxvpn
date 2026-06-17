import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_DEVICES = {
  'Basic': 1, 'Standard': 3, 'Premium': 5, 'Advanced': 10, 'Enterprise': 999,
  'Free Trial': 1, 'Pro Monthly': 3, 'Pro Annual': 5,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, plan, billing_cycle } = await req.json();

    if (!email || !plan) {
      return Response.json({ success: false, message: 'Missing email or plan' }, { status: 400 });
    }

    const billingCycle = billing_cycle || 'monthly';
    const renewalDate = new Date();
    if (billingCycle === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const subData = {
      plan,
      status: 'active',
      billing_cycle: billingCycle,
      renewal_date: renewalDate.toISOString(),
      max_devices: PLAN_DEVICES[plan] || 1,
      start_date: new Date().toISOString(),
    };

    const existing = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: email });

    if (existing.length > 0) {
      await base44.asServiceRole.entities.VPNSubscription.update(existing[0].id, subData);
    } else {
      await base44.asServiceRole.entities.VPNSubscription.create({ user_email: email, ...subData });
    }

    return Response.json({ success: true, message: 'User activated', plan });

  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
});