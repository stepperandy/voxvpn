import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription_id, auto_renew } = await req.json();

    if (!subscription_id) {
      return Response.json({ error: 'Missing subscription_id' }, { status: 400 });
    }

    console.log(`[updateSubscriptionRenewal] Updating ${subscription_id} auto_renew=${auto_renew}`);

    const stripe = await import('npm:stripe@14.0.0').then(
      m => new m.default(Deno.env.get('STRIPE_SECRET_KEY'))
    );

    // Update Stripe subscription
    const subscription = await stripe.subscriptions.update(subscription_id, {
      pause_collection: !auto_renew ? { behavior: 'void' } : undefined,
      collection_method: auto_renew ? 'charge_automatically' : 'send_invoice'
    });

    // Update local VirtualNumber record
    const numbers = await base44.entities.VirtualNumber.filter({
      stripe_subscription_id: subscription_id,
      customer_email: user.email
    });

    if (numbers.length > 0) {
      await base44.entities.VirtualNumber.update(numbers[0].id, {
        auto_renew_enabled: auto_renew
      });
    }

    return Response.json({ success: true, subscription });
  } catch (error) {
    console.error('[updateSubscriptionRenewal] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});