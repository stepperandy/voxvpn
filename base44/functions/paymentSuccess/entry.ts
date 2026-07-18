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

    const existing = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: email });
    const existingSub = existing?.[0] || null;

    // If user had a pending_payment trial, activate it (5-day trial starts now on first payment)
    const isFirstPaymentOnTrial = existingSub?.status === 'pending_payment' && existingSub?.plan === 'Free Trial';
    const trialRenewalDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const subData = {
      plan,
      status: isFirstPaymentOnTrial ? 'trial' : 'active',
      billing_cycle: isFirstPaymentOnTrial ? 'trial' : billingCycle,
      renewal_date: isFirstPaymentOnTrial ? trialRenewalDate.toISOString() : renewalDate.toISOString(),
      max_devices: PLAN_DEVICES[plan] || 1,
      start_date: existingSub?.start_date || new Date().toISOString(),
    };

    if (existingSub) {
      await base44.asServiceRole.entities.VPNSubscription.update(existingSub.id, subData);
    } else {
      await base44.asServiceRole.entities.VPNSubscription.create({ user_email: email, ...subData });
    }

    return Response.json({ success: true, message: 'User activated', plan });

  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
});