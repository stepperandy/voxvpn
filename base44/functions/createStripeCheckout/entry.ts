import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { plan, priceId, email: bodyEmail } = body;

    if (!plan || !priceId) {
      return Response.json({ error: 'Missing plan or priceId' }, { status: 400 });
    }

    // Try to get authenticated user — not required for checkout
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_) {
      // unauthenticated — continue
    }

    // Admins get free access, skip Stripe checkout
    if (user?.role === 'admin') {
      const setupToken = crypto.randomUUID();
      return Response.json({
        sessionId: setupToken,
        url: `${Deno.env.get('APP_URL')}/setup?token=${setupToken}`,
        freeAccess: true,
      });
    }

    const customerEmail = user?.email || bodyEmail || undefined;

    const stripe = await import('npm:stripe@14.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('APP_URL')}/setup?token={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/#pricing`,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        plan: plan,
        ...(user ? { user_id: user.id, email: user.email } : {}),
        ...(bodyEmail ? { email: bodyEmail } : {}),
      },
    });

    return Response.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});