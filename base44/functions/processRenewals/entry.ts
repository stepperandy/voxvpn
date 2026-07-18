import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can trigger manual renewal
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('[processRenewals] Starting renewal check');

    const stripe = await import('npm:stripe@14.0.0').then(m => new m.default(Deno.env.get('STRIPE_SECRET_KEY')));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active subscriptions
    const subscriptions = await base44.asServiceRole.entities.VirtualNumber.filter({
      status: 'active',
      stripe_subscription_id: { $exists: true }
    });

    console.log(`[processRenewals] Found ${subscriptions.length} active subscriptions to check`);

    let renewed = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        // Get subscription from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);

        // Check if renewal is due (today or past due)
        const renewalDate = new Date(stripeSubscription.current_period_end * 1000);
        renewalDate.setHours(0, 0, 0, 0);

        if (renewalDate <= today) {
          console.log(`[processRenewals] Renewal due for ${sub.phone_number}`);

          // Renew subscription
          await stripe.subscriptions.update(sub.stripe_subscription_id, {
            items: [{ id: stripeSubscription.items.data[0].id }]
          });

          // Update renewal tracking
          await base44.asServiceRole.entities.VirtualNumber.update(sub.id, {
            last_renewal_date: new Date().toISOString(),
            renewal_status: 'renewed'
          });

          renewed++;
          console.log(`[processRenewals] Renewed ${sub.phone_number}`);
        }
      } catch (err) {
        console.error(`[processRenewals] Error renewing ${sub.phone_number}:`, err.message);
        failed++;
      }
    }

    console.log(`[processRenewals] Complete: ${renewed} renewed, ${failed} failed`);
    return Response.json({ success: true, renewed, failed });
  } catch (error) {
    console.error('[processRenewals] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});