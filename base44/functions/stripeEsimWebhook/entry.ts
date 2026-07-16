import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.9.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Verify Stripe signature using async method for Deno
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Signature verification failed' }, { status: 400 });
    }

    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const base44 = createClientFromRequest(req);

      console.log(`Processing payment for session ${session.id}`);

      // Extract metadata
      const userEmail = session.customer_email || session.metadata?.user_email;
      const type = session.metadata?.type || 'credits';
      const credits = parseInt(session.metadata?.credits || '0', 10);
      const productId = session.metadata?.product_id;
      const productName = session.metadata?.product_name;
      const productPrice = parseFloat(session.metadata?.product_price || '0');
      const numberCountry = session.metadata?.number_country;

      if (!userEmail) {
        console.error('Invalid session metadata: no email');
        return Response.json({ error: 'Invalid session data' }, { status: 400 });
      }

      try {
        if (type === 'esim') {
          // Auto-provision eSIM
          if (!productId || !productName) {
            console.error('Missing eSIM product details');
            return Response.json({ error: 'Invalid eSIM data' }, { status: 400 });
          }

          console.log(`Auto-provisioning eSIM ${productName} for ${userEmail}`);

          // Call purchaseEsim function to provision
          const esimRes = await base44.asServiceRole.functions.invoke('purchaseEsim', {
            product_id: productId,
            product_name: productName,
            price: productPrice,
            user_email: userEmail
          });

          if (esimRes.data?.esim?.iccid) {
            // Send eSIM details to buyer
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: userEmail,
              subject: 'Your eSIM is Ready - Instant Delivery',
              body: `Your ${productName} eSIM has been provisioned!\n\nICCID: ${esimRes.data.esim.iccid}\n\nActivation Code (LPA): ${esimRes.data.esim.qr_code}\n\nYou can now install it on your device. Visit your account to view all details.`
            });
            console.log(`eSIM provisioned and email sent to ${userEmail}`);
          }
        } else if (type === 'number') {
          // Auto-provision virtual number
          if (!numberCountry) {
            console.error('Missing number country');
            return Response.json({ error: 'Invalid number data' }, { status: 400 });
          }

          console.log(`Auto-provisioning virtual number for ${numberCountry} for ${userEmail}`);

          // Call purchaseNumber function to provision
          const numberRes = await base44.asServiceRole.functions.invoke('purchaseNumber', {
            country_code: numberCountry,
            user_email: userEmail
          });

          if (numberRes.data?.number?.phone_number) {
            // Send number details to buyer
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: userEmail,
              subject: 'Your Virtual Number is Ready - Instant Delivery',
              body: `Your ${numberCountry} virtual number has been provisioned!\n\nPhone Number: ${numberRes.data.number.phone_number}\n\nYou can now use this number for calls and SMS. Visit your dashboard to configure auto-reply, call forwarding, and other settings.`
            });
            console.log(`Virtual number provisioned and email sent to ${userEmail}`);
          }
        } else {
          // Credits purchase
          if (credits <= 0) {
            console.error('Invalid credits amount');
            return Response.json({ error: 'Invalid credits' }, { status: 400 });
          }

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: userEmail,
            subject: 'Credits Added to Your Account',
            body: `Your payment was successful! ${credits} credits have been added to your account. You can now purchase eSIM plans.`
          });

          // Try to find and update user if they exist
          try {
            const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
            if (users && users.length > 0) {
              await base44.asServiceRole.entities.User.update(users[0].id, {
                credits: (users[0].credits || 0) + credits
              });
              console.log(`Updated user ${userEmail} with ${credits} credits`);
            }
          } catch (userErr) {
            console.log('Could not update user directly (guest checkout):', userErr.message);
          }
        }

        console.log(`Successfully processed payment for ${userEmail}`);
        return Response.json({ success: true }, { status: 200 });
      } catch (err) {
        console.error('Error processing payment:', err.message);
        return Response.json({ error: 'Processing failed' }, { status: 500 });
      }
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
});