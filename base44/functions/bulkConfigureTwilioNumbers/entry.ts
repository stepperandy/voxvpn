import twilio from 'npm:twilio@4.23.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get Twilio credentials
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twimlAppSid = Deno.env.get('TWILIO_TWIML_APP_SID');

    if (!accountSid || !authToken || !twimlAppSid) {
      return Response.json(
        { error: 'Missing Twilio credentials' },
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);

    console.log('[bulkConfigureTwilioNumbers] Starting configuration...');

    // Fetch all incoming phone numbers
    const incomingNumbers = await client.incomingPhoneNumbers.list({ limit: 1000 });

    console.log(`[bulkConfigureTwilioNumbers] Found ${incomingNumbers.length} numbers`);

    const results = {
      total: incomingNumbers.length,
      configured: 0,
      failed: 0,
      errors: [],
    };

    // Update each number to use the TwiML App
    for (const phoneNumber of incomingNumbers) {
      try {
        await client.incomingPhoneNumbers(phoneNumber.sid).update({
          voiceApplicationSid: twimlAppSid,
        });
        results.configured++;
        console.log(`✅ Configured ${phoneNumber.phoneNumber}`);
      } catch (err) {
        results.failed++;
        results.errors.push({
          number: phoneNumber.phoneNumber,
          error: err.message,
        });
        console.error(`❌ Failed to configure ${phoneNumber.phoneNumber}:`, err.message);
      }
    }

    console.log(`[bulkConfigureTwilioNumbers] Complete: ${results.configured} configured, ${results.failed} failed`);

    return Response.json({
      success: true,
      ...results,
      message: `${results.configured} numbers configured to use TwiML App ${twimlAppSid}`,
    });
  } catch (error) {
    console.error('[bulkConfigureTwilioNumbers] Error:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});