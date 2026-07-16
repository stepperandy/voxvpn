import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, stripe_customer_id, paypal_customer_id } = await req.json();

    if (!action) {
      return Response.json({ error: 'Action required' }, { status: 400 });
    }

    console.log(`[manageBilling] Action: ${action}`);

    const stripeApiKey = Deno.env.get('STRIPE_SECRET_KEY');

    // Get Stripe customer portal session
    if (action === 'stripe_portal') {
      if (!stripeApiKey || !stripe_customer_id) {
        return Response.json({ error: 'Stripe not configured' }, { status: 503 });
      }

      const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          customer: stripe_customer_id,
          return_url: `${Deno.env.get('BASE44_PUBLIC_URL')}/billing`
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[manageBilling] Stripe error:', result);
        return Response.json({ error: 'Failed to create billing portal' }, { status: 500 });
      }

      return Response.json({ success: true, url: result.url });
    }

    // Get PayPal subscription status
    if (action === 'paypal_status') {
      if (!paypal_customer_id) {
        return Response.json({ error: 'PayPal customer ID required' }, { status: 400 });
      }

      const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
      const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');

      if (!paypalClientId || !paypalClientSecret) {
        return Response.json({ error: 'PayPal not configured' }, { status: 503 });
      }

      // Get PayPal access token
      const authResponse = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      const authData = await authResponse.json();
      const accessToken = authData.access_token;

      // Get subscription details
      const subResponse = await fetch(
        `https://api.sandbox.paypal.com/v1/billing/subscriptions/${paypal_customer_id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const subData = await subResponse.json();

      if (!subResponse.ok) {
        console.error('[manageBilling] PayPal error:', subData);
        return Response.json({ error: 'Failed to get subscription status' }, { status: 500 });
      }

      return Response.json({
        success: true,
        status: subData.status,
        billing_info: {
          next_billing_time: subData.billing_cycles?.[0]?.pricing_scheme?.billing_cycle_sequence,
          amount: subData.billing_cycles?.[0]?.pricing_scheme?.fixed_price
        }
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[manageBilling] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});