/**
 * Send Number Welcome Email
 * Entity automation: fires when a VirtualNumber is created (provisioned for a customer).
 * Sends a branded VoxTelefony purchase confirmation email with the number details
 * and a getting-started guide to drive engagement and reduce churn.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Entity automation payload: { event, data }
    const virtualNumber = body.data || body;
    const customerEmail = virtualNumber.customer_email || virtualNumber.user_email;
    const phoneNumber = virtualNumber.phone_number || virtualNumber.number;
    const countryCode = virtualNumber.country_code || '';

    if (!customerEmail || !phoneNumber) {
      console.log('[sendNumberWelcomeEmail] Skipping: missing customer_email or phone_number');
      return Response.json({ success: false, reason: 'Missing customer_email or phone_number' });
    }

    const appUrl = Deno.env.get('BASE44_PUBLIC_URL') || 'https://voxtelefony.com';

    const emailBody = `Hello,

Your VoxTelefony virtual number is ready! 🎉

Phone Number: ${phoneNumber}
${countryCode ? `Country: ${countryCode}\n` : ''}
You can now start sending and receiving SMS, making and receiving calls, and managing all your communications from your dashboard.

GETTING STARTED:
1. Log into your dashboard: ${appUrl}/Dashboard
2. View your number under "My Virtual Numbers"
3. Configure call forwarding, voicemail, and auto-replies
4. Start sending SMS and making calls

WHAT YOU CAN DO:
• Send and receive SMS messages
• Make and receive voice calls
• Set up call forwarding to your personal number
• Configure voicemail with custom greetings
• Create bulk SMS campaigns to your contacts
• Block unwanted callers and messages
• View detailed call and message logs

💡 Refer a friend and earn credits! Share your referral link from the dashboard.

Need help? Contact support@voxdigits.com or visit our help center.

Welcome aboard,
The VoxTelefony Team`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: customerEmail,
      subject: `Your VoxTelefony Virtual Number ${phoneNumber} is Ready 🎉`,
      body: emailBody,
      from_name: 'VoxTelefony',
    });

    console.log(`[sendNumberWelcomeEmail] ✅ Welcome email sent to ${customerEmail} for ${phoneNumber}`);
    return Response.json({ success: true, sent_to: customerEmail, phone_number: phoneNumber });

  } catch (error) {
    console.error('[sendNumberWelcomeEmail] ❌ Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});