import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_PRICES = {
  'Basic': { monthly: 3.99, yearly: 29.88 },
  'Standard': { monthly: 6.99, yearly: 53.88 },
  'Premium': { monthly: 9.99, yearly: 77.88 },
  'Advanced': { monthly: 14.99, yearly: 119.88 },
  'Enterprise': { monthly: 29.99, yearly: 239.88 },
};

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { plan, isBilledYearly } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const stripe = await import('npm:stripe@14.0.0');
    const client = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const planPrice = PLAN_PRICES[plan];
    const amount = Math.round((isBilledYearly ? planPrice.yearly : planPrice.monthly) * 100);
    const origin = req.headers.get('origin') || Deno.env.get('APP_URL') || 'https://voxvpn.net';

    const session = await client.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'alipay', 'wechat_pay'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `VoxVPN ${plan} Plan`,
              description: isBilledYearly ? 'Yearly' : 'Monthly',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/payment-success`,
      cancel_url: `${origin}/pricing`,
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return Response.json({ error: 'Checkout failed' }, { status: 500 });
  }
});