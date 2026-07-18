import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID');
const BASE_URL = 'https://api-m.paypal.com'; // Live mode

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
    const { type, credits, amount, email, product_id, product_name, product_price, number_country } = await req.json();

    if (!amount || amount < 1) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const publicUrl = (Deno.env.get('BASE44_PUBLIC_URL') || '').trim() || 'https://app.example.com';
    const amountUSD = (amount / 100).toFixed(2);

    // Build description
    let description = '';
    let customId = '';
    if (type === 'esim') {
      description = `eSIM Plan: ${product_name}`;
      customId = JSON.stringify({ type, user_email: email, product_id, product_name, product_price: product_price?.toString(), base44_app_id: BASE44_APP_ID });
    } else if (type === 'number') {
      description = `Virtual Number - ${number_country}`;
      customId = JSON.stringify({ type, user_email: email, number_country, base44_app_id: BASE44_APP_ID });
    } else {
      description = `${credits} VoxDigits Credits`;
      customId = JSON.stringify({ type: 'credits', user_email: email, credits: credits?.toString(), base44_app_id: BASE44_APP_ID });
    }

    const accessToken = await getPayPalAccessToken();

    const order = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'USD', value: amountUSD },
          description,
          custom_id: customId.substring(0, 127), // PayPal limit
        }],
        application_context: {
          brand_name: 'VoxDigits',
          return_url: `${publicUrl}/MyESims?paypal=success`,
          cancel_url: `${publicUrl}/MyESims?paypal=cancel`,
          // Note: PayPal appends ?token=ORDER_ID automatically to return_url
          user_action: 'PAY_NOW',
        },
      }),
    });

    const orderData = await order.json();

    if (!orderData.id) {
      console.error('PayPal order creation failed:', orderData);
      return Response.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    const approvalUrl = orderData.links?.find(l => l.rel === 'approve')?.href;

    if (!approvalUrl) {
      console.error('No approval URL in PayPal response:', orderData);
      return Response.json({ error: 'No approval URL returned' }, { status: 500 });
    }

    console.log(`Created PayPal order ${orderData.id} for ${email}`);

    return Response.json({
      orderId: orderData.id,
      approvalUrl,
      clientId: PAYPAL_CLIENT_ID,
      status: 'success',
    });
  } catch (error) {
    console.error('PayPal checkout error:', error);
    return Response.json({ error: error.message || 'Failed to create PayPal order' }, { status: 500 });
  }
});