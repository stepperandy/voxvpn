import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = await import('npm:stripe@14.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = await stripeClient.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { plan, user_id, email } = session.metadata || {};
      const customerEmail = email || session.customer_email;

      if (!customerEmail) {
        console.error('No email found in session');
        return Response.json({ received: true });
      }

      // 1. Provision VPN credentials for the user (generates keypair + assigns server)
      const provisionRes = await base44.asServiceRole.functions.invoke('provisionVpnUser', {
        email: customerEmail,
        plan: plan || 'Basic',
        orderId: session.id,
        platform: 'windows',
        deviceName: 'Windows Device',
      });

      const provisionData = provisionRes?.data || {};

      // 2. Send branded email with download instructions
      await base44.asServiceRole.functions.invoke('sendBuyerSetups', {
        email: customerEmail,
        orderId: session.id,
        plan: plan || 'Basic',
        serverRegion: provisionData.serverRegion || 'Auto-selected',
        vpnIp: provisionData.vpnIp || 'Assigned',
        configUrl: provisionData.configUrl || null,
      });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});