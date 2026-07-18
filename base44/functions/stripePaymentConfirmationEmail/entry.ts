import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const resendKey = Deno.env.get('RESEND_API_KEY');

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'VoxDigits <noreply@voxdigits.com>',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[stripePaymentConfirmationEmail] Resend error:', err);
  }
}

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('[stripePaymentConfirmationEmail] Webhook signature error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email || session.customer_details?.email;

    if (!email) {
      console.warn('[stripePaymentConfirmationEmail] No email found in session:', session.id);
      return Response.json({ received: true });
    }

    const amountPaid = ((session.amount_total || 0) / 100).toFixed(2);
    const currency = (session.currency || 'usd').toUpperCase();
    const productName = session.metadata?.product_name || 'your order';
    const sessionId = session.id;
    const paymentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    console.log(`[stripePaymentConfirmationEmail] Sending confirmation to ${email} for session ${sessionId}`);

    await sendEmail(
      email,
      `Payment Confirmed — ${productName} ✅`,
      `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
        <div style="text-align:center;margin-bottom:28px;">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b202c06dc5b1988efe9645/452fad501_984d42e9-6e04-4f28-ae7f-79413d1fa755.png" alt="VoxDigits" style="height:50px;width:auto;" />
        </div>

        <h2 style="color:#22d3ee;margin:0 0 8px 0;">Payment Confirmed! 🎉</h2>
        <p style="color:#cbd5e1;margin:0 0 24px 0;">Thank you for your purchase. Your payment was successful.</p>

        <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:10px;padding:24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="color:#94a3b8;font-size:13px;padding:6px 0;">Product</td>
              <td style="color:#fff;font-weight:bold;text-align:right;padding:6px 0;">${productName}</td>
            </tr>
            <tr>
              <td style="color:#94a3b8;font-size:13px;padding:6px 0;">Amount Paid</td>
              <td style="color:#22d3ee;font-weight:bold;font-size:20px;text-align:right;padding:6px 0;">${currency} $${amountPaid}</td>
            </tr>
            <tr>
              <td style="color:#94a3b8;font-size:13px;padding:6px 0;">Date</td>
              <td style="color:#fff;text-align:right;padding:6px 0;">${paymentDate}</td>
            </tr>
            <tr>
              <td style="color:#94a3b8;font-size:13px;padding:6px 0;">Reference</td>
              <td style="color:#64748b;font-size:11px;font-family:monospace;text-align:right;padding:6px 0;">${sessionId}</td>
            </tr>
          </table>
        </div>

        <p style="color:#cbd5e1;font-size:14px;">Your service will be activated shortly. You can view your services anytime at <a href="https://voxdigits.com" style="color:#22d3ee;">voxdigits.com</a>.</p>
        <p style="color:#cbd5e1;font-size:14px;">If you have any questions, contact us at <a href="mailto:support@voxdigits.com" style="color:#22d3ee;">support@voxdigits.com</a>.</p>

        <p style="color:#475569;font-size:12px;margin-top:32px;border-top:1px solid #1e3a5f;padding-top:16px;">— The VoxDigits Team</p>
      </div>`
    );
  }

  return Response.json({ received: true });
});