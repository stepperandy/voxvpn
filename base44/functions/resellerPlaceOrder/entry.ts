import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.9.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bundle_id, quantity } = await req.json();

    if (!bundle_id || !quantity || quantity < 1) {
      return Response.json({ error: 'Invalid bundle or quantity' }, { status: 400 });
    }

    // Get reseller info
    const reseller = await base44.entities.Reseller.filter({ email: user.email });
    if (!reseller || reseller.length === 0 || reseller[0].status !== 'approved') {
      return Response.json({ error: 'Not an approved reseller' }, { status: 403 });
    }

    // Get bundle
    const bundle = await base44.entities.Bundle.filter({ id: bundle_id });
    if (!bundle || bundle.length === 0) {
      return Response.json({ error: 'Bundle not found' }, { status: 404 });
    }

    const bundleData = bundle[0];
    const totalCost = bundleData.base_price * quantity;

    // Create Stripe checkout for reseller
    const publicUrl = (Deno.env.get('BASE44_PUBLIC_URL') || '').trim() || 'https://app.example.com';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      success_url: `${publicUrl}/AdminPanel?tab=orders&status=success`,
      cancel_url: `${publicUrl}/AdminPanel?tab=bundles`,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${bundleData.name} x${quantity}`,
              description: `Reseller wholesale order`
            },
            unit_amount: Math.round(bundleData.base_price * 100)
          },
          quantity
        }
      ],
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        reseller_email: user.email,
        bundle_id,
        quantity: quantity.toString()
      }
    });

    console.log(`Reseller order session created: ${session.id}`);

    return Response.json({
      success: true,
      sessionId: session.id,
      publishableKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY')
    });
  } catch (error) {
    console.error('Reseller order error:', error);
    return Response.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
});