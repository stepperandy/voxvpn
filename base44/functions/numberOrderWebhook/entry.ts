/**
 * Stripe Webhook for Number Orders
 * Handles: checkout.session.completed for number purchases
 * → Calls assignNumber to provision + activate
 */

import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

  const stripe = new Stripe(stripeKey);
  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('[numberOrderWebhook] Signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const meta = session.metadata || {};

    if (meta.flow === 'esim_order') {
      // eSIM post-payment — place the actual order
      console.log('[numberOrderWebhook] eSIM post-payment order for', meta.user_email);
      // The orderESim function handles this in wallet mode; Stripe path is handled separately
      return Response.json({ received: true });
    }

    const order_id = meta.order_id;
    if (!order_id) {
      console.log(`[numberOrderWebhook] No order_id in metadata for session ${session.id}, skipping`);
      return Response.json({ received: true });
    }

    console.log(`[numberOrderWebhook] Payment complete for order ${order_id}`);

    try {
      const result = await base44.asServiceRole.functions.invoke('assignNumber', {
        order_id,
        stripe_subscription_id: session.subscription || '',
        stripe_customer_id: session.customer || '',
      });
      console.log(`[numberOrderWebhook] assignNumber result:`, JSON.stringify(result));
    } catch (err) {
      console.error('[numberOrderWebhook] assignNumber failed:', err.message);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    // Find and cancel linked subscription
    const subs = await base44.asServiceRole.entities.Subscription.filter({
      stripe_subscription_id: sub.id
    });
    for (const s of subs || []) {
      await base44.asServiceRole.entities.Subscription.update(s.id, { status: 'cancelled' });
      if (s.service_type === 'virtual_number' && s.service_id) {
        await base44.asServiceRole.entities.VirtualNumber.update(s.service_id, { status: 'cancelled' });
      }
      console.log(`[numberOrderWebhook] Subscription ${s.id} cancelled via Stripe`);
    }
  }

  return Response.json({ received: true });
});