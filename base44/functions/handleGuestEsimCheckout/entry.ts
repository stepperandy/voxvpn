import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get('STRIPE_WEBHOOK_SECRET'));
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const isGuest = session.metadata?.is_guest === 'true';
    const customerEmail = session.customer_details?.email || '';
    const productId = session.metadata?.product_id;
    const productName = session.metadata?.product_name;

    if (!isGuest || !productId || !customerEmail) {
      return Response.json({ received: true });
    }

    const base44 = createClientFromRequest(req);

    try {
      // Fetch product details to get price
      const products = await base44.entities.ESimProduct.filter({ product_id: productId });
      const product = products[0];

      if (!product) {
        console.error(`Product ${productId} not found`);
        return Response.json({ received: true });
      }

      // Create eSIM record for guest
      const esimRecord = await base44.asServiceRole.entities.ESim.create({
        user_email: customerEmail,
        product_id: productId,
        product_name: productName || product.name,
        iccid: `GUEST_${Date.now()}`, // Placeholder, will be filled by eSIM provider
        qr_code: 'PENDING', // Placeholder
        status: 'pending',
        price_paid: product.price
      });

      console.log(`Created guest eSIM order for ${customerEmail}:`, esimRecord);

      // Send confirmation email to guest
      try {
        await base44.functions.invoke('sendEsimEmail', {
          email: customerEmail,
          esim: esimRecord
        });
      } catch (emailErr) {
        console.error('Failed to send guest eSIM confirmation email:', emailErr);
      }

      return Response.json({ received: true });
    } catch (error) {
      console.error('Error processing guest eSIM checkout:', error);
      return Response.json({ received: true });
    }
  }

  return Response.json({ received: true });
});