import twilio from "npm:twilio@4.23.0";
const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

Deno.serve(async (req) => {
  try {
    const identity = "andre";

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID") || "";
    const apiKey = Deno.env.get("TWILIO_API_KEY") || "";
    const apiSecret = Deno.env.get("TWILIO_API_SECRET") || "";
    const twimlAppSid = Deno.env.get("TWILIO_TWIML_APP_SID") || "";

    if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
      return new Response(JSON.stringify({
        ok: false,
        error: "Missing Twilio secrets"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity,
      ttl: 3600
    });

    token.addGrant(new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true
    }));

    return new Response(JSON.stringify({
      ok: true,
      identity,
      token: token.toJwt()
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});