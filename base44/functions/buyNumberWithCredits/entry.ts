import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { phone_number, country_code, number_type, monthly_fee, setup_fee, city } = await req.json();

  if (!phone_number || !monthly_fee) return Response.json({ error: 'Missing required fields' }, { status: 400 });

  const totalCost = parseFloat(monthly_fee) + parseFloat(setup_fee || 0);
  const currentCredits = user.credits || 0;

  if (currentCredits < totalCost) {
    return Response.json({ error: `Insufficient credits. You have $${currentCredits.toFixed(2)} but need $${totalCost.toFixed(2)}.` }, { status: 400 });
  }

  // Provision number via Twilio
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const auth = btoa(`${accountSid}:${authToken}`);
  const appUrl = Deno.env.get('BASE44_PUBLIC_URL') || 'https://app.voxdigits.com';
  const smsWebhookUrl = `${appUrl}/functions/twilioSmsWebhook`;
  const voiceWebhookUrl = `${appUrl}/functions/voiceWebhook`;

  const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      PhoneNumber: phone_number,
      SmsUrl: smsWebhookUrl,
      SmsMethod: 'POST',
      VoiceUrl: voiceWebhookUrl,
      VoiceMethod: 'POST',
    }),
  });

  const twilioData = await twilioRes.json();
  console.log("[buyNumberWithCredits] Twilio response:", JSON.stringify(twilioData));

  if (!twilioRes.ok) {
    console.error("[buyNumberWithCredits] Twilio provisioning failed:", twilioData);
    return Response.json({ error: 'Failed to provision number with Twilio' }, { status: 500 });
  }

  const twilio_number_sid = twilioData.sid || "";

  // Deduct credits
  const newBalance = currentCredits - totalCost;
  await base44.asServiceRole.entities.User.update(user.id, { credits: newBalance });

  // Set renewal date (1 month from now)
  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + 1);
  const renewal_date = renewalDate.toISOString().split('T')[0];

  // Create VirtualNumber record — entity schema requires `number` and `userId`
  const virtualNumber = await base44.entities.VirtualNumber.create({
    number: phone_number,
    userId: user.id,
    phone_number,
    country_code,
    city: city || "",
    number_type: number_type || "local",
    customer_email: user.email,
    twilio_number_sid: twilio_number_sid,
    provider: "twilio",
    status: "active",
    sms_enabled: true,
    voice_enabled: true,
    renewal_date,
    assigned_at: new Date().toISOString(),
  });

  // Log transaction
  await base44.entities.Transaction.create({
    user_email: user.email,
    type: 'debit',
    category: 'number_rental',
    amount: totalCost,
    balance_before: currentCredits,
    balance_after: newBalance,
    description: `Virtual number: ${phone_number} (${country_code})`,
    status: 'completed',
  });

  // Create Subscription record
  await base44.entities.Subscription.create({
    user_email: user.email,
    service_type: 'virtual_number',
    service_id: virtualNumber.id,
    phone_number,
    plan_name: `${country_code} Virtual Number`,
    amount: parseFloat(monthly_fee),
    billing_cycle: 'monthly',
    status: 'active',
    current_period_start: new Date().toISOString().split('T')[0],
    current_period_end: renewal_date,
    auto_renew: true,
    provider: "twilio",
  });

  // Send confirmation email
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'VoxDigits <noreply@voxdigits.com>',
        to: [user.email],
        subject: `Your VoxDigits Virtual Number ${phone_number} is Ready 🎉`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
          <h2 style="color:#22d3ee;">Your Virtual Number is Ready! 🎉</h2>
          <p style="color:#cbd5e1;">Thank you for your purchase. Your virtual phone number has been activated and is ready to use.</p>
          
          <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">Your Virtual Number</p>
            <p style="font-size:28px;font-weight:bold;color:#22d3ee;letter-spacing:2px;margin:0;font-family:monospace;">${phone_number}</p>
            <p style="color:#64748b;font-size:12px;margin:8px 0 0;">Country: ${country_code}</p>
          </div>
          
          <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 10px 0;"><strong>🚀 Getting Started:</strong></p>
            <ol style="color:#cbd5e1;font-size:13px;margin:0;padding-left:20px;">
              <li style="margin-bottom:8px;">Log in to your VoxDigits Dashboard</li>
              <li style="margin-bottom:8px;">Go to <strong>My Numbers</strong> section to view your number</li>
              <li style="margin-bottom:8px;">Configure settings: call forwarding, voicemail, auto-replies</li>
              <li style="margin-bottom:8px;">Start using your number to send/receive SMS and calls</li>
            </ol>
          </div>
          
          <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 10px 0;"><strong>✅ What You Can Do:</strong></p>
            <ul style="color:#cbd5e1;font-size:13px;margin:0;padding-left:20px;">
              <li>Send and receive SMS messages</li>
              <li>Make and receive voice calls</li>
              <li>Set up call forwarding to your personal number</li>
              <li>Configure voicemail with custom greetings</li>
              <li>Create bulk SMS campaigns to contacts</li>
              <li>Block unwanted callers and messages</li>
              <li>View detailed call and message logs</li>
              <li>Set auto-reply messages for unavailability</li>
            </ul>
          </div>
          
          <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 8px 0;"><strong>💳 Billing Information:</strong></p>
            <p style="color:#cbd5e1;font-size:13px;margin:0 0 6px 0;"><strong>Monthly fee:</strong> $${parseFloat(monthly_fee).toFixed(2)}/mo</p>
            <p style="color:#cbd5e1;font-size:13px;margin:0 0 6px 0;"><strong>Setup fee:</strong> $${parseFloat(setup_fee || 0).toFixed(2)}</p>
            <p style="color:#cbd5e1;font-size:13px;margin:0;"><strong>Remaining balance:</strong> $${newBalance.toFixed(2)}</p>
            <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;">Your number will auto-renew monthly unless you cancel.</p>
          </div>
          
          <div style="text-align:center;margin-top:24px;">
            <a href="https://voxdigits.com/ServicesDashboard" style="display:inline-block;background:#22d3ee;color:#0d1f35;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Go to Dashboard</a>
          </div>
          
          <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:16px;margin:24px 0;">
            <p style="color:#cbd5e1;font-size:13px;margin:0 0 8px;"><strong>Need Help?</strong></p>
            <p style="color:#cbd5e1;font-size:12px;margin:0;">Visit our Help Center or contact support@voxdigits.com</p>
          </div>
          
          <p style="color:#64748b;font-size:12px;margin-top:24px;border-top:1px solid #1e4060;padding-top:16px;">© 2026 VoxDigits. All rights reserved.</p>
        </div>`
      })
    });
  }

  console.log(`[buyNumberWithCredits] Number ${phone_number} provisioned for ${user.email}, credits deducted: $${totalCost}`);
  return Response.json({ success: true, phone_number, new_balance: newBalance });
});