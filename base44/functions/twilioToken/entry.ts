import twilio from 'npm:twilio@4.23.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const authUser = await base44.auth.me();

    if (!authUser?.email) {
      console.error('[twilioToken] ❌ No authenticated user');
      return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const identity = authUser.email.replace(/[@.]/g, '_');
    console.log(`[twilioToken] 🆔 TOKEN IDENTITY ASSIGNED:`);
    console.log(`[twilioToken] 📧 email: ${authUser.email}`);
    console.log(`[twilioToken] 🆔 identity: ${identity}`);

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const apiKey = Deno.env.get('TWILIO_API_KEY');
    const apiSecret = Deno.env.get('TWILIO_API_SECRET');
    const twimlAppSid = Deno.env.get('TWILIO_TWIML_APP_SID');

    if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
      console.error('[twilioToken] ❌ Missing Twilio config');
      return Response.json({ ok: false, error: 'Twilio config missing' }, { status: 500 });
    }

    const token = new twilio.jwt.AccessToken(accountSid, apiKey, apiSecret, {
      identity,
      ttl: 3600,
    });

    token.addGrant(
      new twilio.jwt.AccessToken.VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: true,
      })
    );

    const jwt = token.toJwt();
    console.log(`[twilioToken] ✅ Token generated (${jwt.length} chars)`);
    console.log(`[twilioToken] 🆔 IDENTITY IN TOKEN: ${identity}`);

    return Response.json({ ok: true, token: jwt, identity });
  } catch (error) {
    console.error('[twilioToken] ❌ Exception:', error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});