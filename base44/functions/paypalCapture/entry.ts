import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
const BASE_URL = 'https://api-m.paypal.com';

async function getPayPalAccessToken() {
  const credentials = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!data.access_token) {
    console.error('PayPal token error:', data);
    throw new Error('Failed to get PayPal access token');
  }
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return Response.json({ error: 'order_id is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const accessToken = await getPayPalAccessToken();

    // Capture the PayPal order
    const captureRes = await fetch(`${BASE_URL}/v2/checkout/orders/${order_id}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();
    console.log(`PayPal capture result for ${order_id}:`, captureData.status);

    if (captureData.status !== 'COMPLETED') {
      console.error('PayPal capture not completed:', captureData);
      return Response.json({ error: 'Payment capture failed', details: captureData }, { status: 400 });
    }

    // Extract metadata from custom_id
    const customIdRaw = captureData.purchase_units?.[0]?.custom_id || captureData.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id || '';
    let meta = {};
    try {
      meta = JSON.parse(customIdRaw);
    } catch {
      console.error('Could not parse custom_id:', customIdRaw);
      return Response.json({ error: 'Could not parse order metadata' }, { status: 500 });
    }

    const { type, user_email: userEmail, product_id, product_name, product_price, number_country, credits } = meta;

    if (!userEmail) {
      console.error('No user_email in PayPal metadata');
      return Response.json({ error: 'Missing user email in order metadata' }, { status: 400 });
    }

    console.log(`Processing PayPal payment for ${userEmail}, type=${type}`);

    if (type === 'esim') {
      if (!product_id || !product_name) {
        return Response.json({ error: 'Missing eSIM product details in metadata' }, { status: 400 });
      }

      const esimRes = await base44.asServiceRole.functions.invoke('purchaseEsim', {
        product_id,
        product_name,
        price: parseFloat(product_price || '0'),
        user_email: userEmail,
      });

      if (esimRes.data?.esim?.iccid) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: userEmail,
          subject: 'Your eSIM is Ready - Instant Delivery',
          body: `Your ${product_name} eSIM has been provisioned!\n\nICCID: ${esimRes.data.esim.iccid}\n\nActivation Code (LPA): ${esimRes.data.esim.qr_code}\n\nYou can now install it on your device. Visit your account to view all details.`,
        });
        console.log(`eSIM provisioned and email sent to ${userEmail}`);
      }

      return Response.json({ success: true, type: 'esim', iccid: esimRes.data?.esim?.iccid });

    } else if (type === 'number') {
      if (!number_country) {
        return Response.json({ error: 'Missing number_country in metadata' }, { status: 400 });
      }

      const numberRes = await base44.asServiceRole.functions.invoke('purchaseNumber', {
        country_code: number_country,
        user_email: userEmail,
      });

      if (numberRes.data?.number?.phone_number) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: userEmail,
          subject: 'Your Virtual Number is Ready - Instant Delivery',
          body: `Your ${number_country} virtual number has been provisioned!\n\nPhone Number: ${numberRes.data.number.phone_number}\n\nYou can now use this number for calls and SMS. Visit your dashboard to configure it.`,
        });
        console.log(`Virtual number provisioned and email sent to ${userEmail}`);
      }

      return Response.json({ success: true, type: 'number', phone_number: numberRes.data?.number?.phone_number });

    } else {
      // Credits
      const creditsCount = parseInt(credits || '0', 10);
      if (creditsCount <= 0) {
        return Response.json({ error: 'Invalid credits amount in metadata' }, { status: 400 });
      }

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        subject: 'Credits Added to Your Account',
        body: `Your payment was successful! ${creditsCount} credits have been added to your account. You can now purchase eSIM plans.`,
      });

      try {
        const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
        if (users && users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            credits: (users[0].credits || 0) + creditsCount,
          });
          console.log(`Updated user ${userEmail} with ${creditsCount} credits`);
        }
      } catch (userErr) {
        console.log('Could not update user credits (guest):', userErr.message);
      }

      return Response.json({ success: true, type: 'credits', credits: creditsCount });
    }

  } catch (error) {
    console.error('PayPal capture error:', error);
    return Response.json({ error: error.message || 'Capture failed' }, { status: 500 });
  }
});