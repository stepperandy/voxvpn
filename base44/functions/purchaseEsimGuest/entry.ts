import Stripe from 'npm:stripe@14.9.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID');

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY');
    if (!publishableKey) {
      console.error('STRIPE_PUBLISHABLE_KEY environment variable is not set');
      return Response.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const { email, product_id, product_name, price, data_gb, duration_days } = await req.json();

    if (!email || !product_id || !product_name || !price) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create checkout session for guest
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      success_url: `${Deno.env.get('BASE44_PUBLIC_URL') || 'https://app.example.com'}/ESimStore?session_id={CHECKOUT_SESSION_ID}&guest=true`,
      cancel_url: `${Deno.env.get('BASE44_PUBLIC_URL') || 'https://app.example.com'}/ESimStore`,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product_name,
              description: `${data_gb ? data_gb + ' GB' : ''} ${duration_days ? duration_days + ' days' : ''}`.trim()
            },
            unit_amount: Math.round(price * 100)
          },
          quantity: 1
        }
      ],
      metadata: {
        base44_app_id: BASE44_APP_ID,
        customer_email: email,
        product_id: product_id,
        product_name: product_name,
        is_guest: 'true'
      }
    });

    console.log(`Created guest checkout session ${session.id} for ${email}`);

    return Response.json({
      sessionId: session.id,
      publishableKey
    });
  } catch (error) {
    console.error('Guest eSIM checkout error:', error);
    return Response.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
});