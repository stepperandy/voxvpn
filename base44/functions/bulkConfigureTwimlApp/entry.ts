import twilio from 'npm:twilio@4.23.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Configures the TwiML App Voice URL to point to the outbound voice webhook.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken  = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twimlAppSid = Deno.env.get('TWILIO_TWIML_APP_SID');
    const appId = Deno.env.get('BASE44_APP_ID') || '';

    if (!accountSid || !authToken || !twimlAppSid) {
      return Response.json({ error: 'Twilio credentials or TwiML App SID missing' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    const baseUrl = `https://app--${appId}.base44.app/api/apps/${appId}/functions`;
    const voiceUrl = `${baseUrl}/voice-webhook`;  // outbound dialer webhook

    await client.applications(twimlAppSid).update({
      voiceUrl,
      voiceMethod: 'POST',
    });

    console.log(`[bulkConfigureTwimlApp] ✅ TwiML App ${twimlAppSid} voice URL set to: ${voiceUrl}`);

    return Response.json({
      success: true,
      twimlAppSid,
      voiceUrl,
    });
  } catch (error) {
    console.error('[bulkConfigureTwimlApp] ❌ Exception:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});