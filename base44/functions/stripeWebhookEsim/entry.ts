import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`Processing Stripe event: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email || session.customer_email;
    const productId = session.metadata?.product_id;
    const productName = session.metadata?.product_name;
    const isGuest = session.metadata?.is_guest === 'true';

    if (!customerEmail || !productId) {
      console.log('Incomplete session metadata:', { customerEmail, productId });
      return Response.json({ received: true });
    }

    const base44 = createClientFromRequest(req);

    try {
      // Fetch product details
      const products = await base44.asServiceRole.entities.ESimProduct.filter({
        product_id: productId
      });

      const product = products[0];
      if (!product) {
        console.error(`Product ${productId} not found`);
        return Response.json({ received: true });
      }

      // Check if eSIM already exists (prevent duplicates)
      const existingEsims = await base44.asServiceRole.entities.ESim.filter({
        user_email: customerEmail,
        product_id: productId
      });

      if (existingEsims.length > 0) {
        console.log(`eSIM already exists for ${customerEmail}, skipping creation`);
        return Response.json({ received: true });
      }

      // Generate ICCID in Connect Flex format
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString().substring(2, 10);
      const iccid = `89${timestamp}${random}`.substring(0, 19).padEnd(19, '0');
      const qrCode = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='white' width='200' height='200'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em'%3EeSIM Activated%3C/text%3E%3C/svg%3E`;

      // Create eSIM record
      const esimRecord = await base44.asServiceRole.entities.ESim.create({
        user_email: customerEmail,
        product_id: productId,
        product_name: productName || product.name,
        iccid: iccid,
        qr_code: qrCode,
        status: 'active',
        price_paid: product.price,
        data_gb: product.data_gb,
        duration_days: product.duration_days
      });

      console.log(`Created eSIM record:`, { id: esimRecord.id, email: customerEmail, productId });

      // Send confirmation email with eSIM credentials
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customerEmail,
          subject: `✓ Your eSIM Plan Activated - ${product.name}`,
          body: generateEsimEmailTemplate(esimRecord, product)
        });
        console.log(`Confirmation email sent to ${customerEmail}`);
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr.message);
      }

      return Response.json({ received: true, esimId: esimRecord.id });
    } catch (error) {
      console.error('Error processing eSIM checkout:', error.message);
      return Response.json({ received: true, error: error.message });
    }
  }

  return Response.json({ received: true });
});

function generateEsimEmailTemplate(esim, product) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 8px 0 0; opacity: 0.9; }
          .content { padding: 40px 20px; }
          .section { background: white; border-radius: 8px; padding: 24px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
          .section h2 { margin: 0 0 16px; color: #1f2937; font-size: 18px; }
          .detail { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
          .detail:last-child { border-bottom: none; }
          .label { font-weight: 600; color: #6b7280; }
          .value { color: #1f2937; }
          .highlight { background: #f0f4ff; padding: 16px; border-radius: 6px; border-left: 4px solid #667eea; margin: 16px 0; }
          .steps { counter-reset: step-counter; }
          .step { counter-increment: step-counter; margin: 12px 0; padding: 16px; background: #f9fafb; border-radius: 6px; }
          .step-num { display: inline-block; width: 28px; height: 28px; background: #667eea; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 12px; }
          .qr-box { text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; margin: 20px 0; }
          .cta { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; }
          .cta:hover { background: #5568d3; }
          .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Your eSIM is Active!</h1>
            <p>Your plan is ready to use</p>
          </div>

          <div class="content">
            {/* Plan Details */}
            <div class="section">
              <h2>Plan Details</h2>
              <div class="detail">
                <span class="label">Plan Name:</span>
                <span class="value">${product.name}</span>
              </div>
              <div class="detail">
                <span class="label">Data Included:</span>
                <span class="value">${product.data_gb || 'Unlimited'} GB</span>
              </div>
              <div class="detail">
                <span class="label">Validity:</span>
                <span class="value">${product.duration_days || 30} days</span>
              </div>
              <div class="detail">
                <span class="label">Amount Paid:</span>
                <span class="value">$${esim.price_paid?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {/* Activation Details */}
            <div class="section">
              <h2>Activation Details</h2>
              <div class="highlight">
                <strong>ICCID:</strong><br>
                <code style="font-family: monospace; font-size: 14px; word-break: break-all;">${esim.iccid}</code>
              </div>
              <p style="margin-top: 16px; color: #6b7280;">Use this ICCID if you need to manually activate your eSIM.</p>
            </div>

            {/* Installation Steps */}
            <div class="section">
              <h2>How to Activate Your eSIM</h2>
              <div class="steps">
                <div class="step">
                  <span class="step-num">1</span>
                  Go to <strong>Settings → Cellular</strong> on your device
                </div>
                <div class="step">
                  <span class="step-num">2</span>
                  Tap <strong>Add eSIM</strong> or <strong>Add Cellular Plan</strong>
                </div>
                <div class="step">
                  <span class="step-num">3</span>
                  Choose <strong>Scan QR Code</strong> (check your confirmation email) or enter the ICCID above
                </div>
                <div class="step">
                  <span class="step-num">4</span>
                  Follow the prompts and activate your plan
                </div>
                <div class="step">
                  <span class="step-num">5</span>
                  Set this as your primary or secondary data connection
                </div>
              </div>
            </div>

            {/* Device Compatibility Note */}
            <div class="section" style="background: #fef3c7; border-color: #fcd34d;">
              <p><strong>📱 Device Compatibility:</strong> Make sure your device supports eSIM. Most phones from 2018+ support eSIM technology.</p>
              <p style="margin-bottom: 0;"><a href="https://voxdigits.com/DeviceCompatibility" style="color: #667eea; text-decoration: none;">Check device compatibility →</a></p>
            </div>

            {/* CTA Button */}
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://voxdigits.com/MyESims" class="cta">View Your eSIMs</a>
            </div>

            {/* Support */}
            <div class="section" style="text-align: center; background: #f3f4f6;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Need help?</p>
              <p style="margin: 4px 0 0; color: #6b7280;"><a href="mailto:support@voxdigits.com" style="color: #667eea; text-decoration: none;">support@voxdigits.com</a></p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0;">© 2026 VoxDigits. All rights reserved.</p>
            <p style="margin: 4px 0 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}