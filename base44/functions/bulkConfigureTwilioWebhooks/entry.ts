import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin check
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const baseUrl = Deno.env.get('BASE44_PUBLIC_URL') || '';
    const webhookUrl = `${baseUrl}/functions/voiceWebhookProductionV2`;

    if (!accountSid || !authToken || !baseUrl) {
      return Response.json({ error: 'Missing Twilio config' }, { status: 500 });
    }

    console.log(`[bulkConfigureTwilioWebhooks] Starting bulk configuration for webhook: ${webhookUrl}`);

    // Fetch all virtual numbers
    const virtualNumbers = await base44.asServiceRole.entities.VirtualNumber.list('-created_date', 5000);
    console.log(`[bulkConfigureTwilioWebhooks] Found ${virtualNumbers?.length || 0} virtual numbers`);

    let updated = 0;
    let failed = 0;
    const errors = [];

    // Configure each number
    for (const vn of virtualNumbers || []) {
      if (!vn.twilio_number_sid) {
        console.warn(`[bulkConfigureTwilioWebhooks] Skipping ${vn.phone_number}: no twilio_number_sid`);
        failed++;
        continue;
      }

      try {
        const auth = btoa(`${accountSid}:${authToken}`);
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${vn.twilio_number_sid}`;
        
        const params = new URLSearchParams();
        params.append('VoiceUrl', webhookUrl);
        params.append('VoiceMethod', 'POST');

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (response.ok) {
          console.log(`[bulkConfigureTwilioWebhooks] ✅ Updated ${vn.phone_number}`);
          updated++;
        } else {
          const text = await response.text();
          console.error(`[bulkConfigureTwilioWebhooks] ❌ Failed to update ${vn.phone_number}: ${response.status} ${text.substring(0, 100)}`);
          errors.push({ phone: vn.phone_number, error: `HTTP ${response.status}` });
          failed++;
        }
      } catch (err) {
        console.error(`[bulkConfigureTwilioWebhooks] Exception for ${vn.phone_number}:`, err.message);
        errors.push({ phone: vn.phone_number, error: err.message });
        failed++;
      }
    }

    console.log(`[bulkConfigureTwilioWebhooks] Complete: ${updated} updated, ${failed} failed`);
    
    return Response.json({
      success: true,
      updated,
      failed,
      total: virtualNumbers?.length || 0,
      errors: errors.slice(0, 10), // Return first 10 errors
      message: `Configured ${updated} numbers. Webhook: ${webhookUrl}`
    });
  } catch (error) {
    console.error('[bulkConfigureTwilioWebhooks] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});