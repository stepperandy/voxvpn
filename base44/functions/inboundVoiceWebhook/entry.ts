import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const formData = await req.formData();

    const from = formData.get('From');
    const to = formData.get('To');
    const callSid = formData.get('CallSid');

    console.log(`[inboundVoiceWebhook] Call from ${from} to ${to}, SID: ${callSid}`);

    if (!from || !to || !callSid) {
      return new Response('Invalid call data', { status: 400 });
    }

    // Find virtual number owner — check both schemas
    let numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ number: to });
    if (!numbers || numbers.length === 0) {
      numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: to });
    }

    if (!numbers || numbers.length === 0) {
      console.warn(`[inboundVoiceWebhook] No owner found for number ${to}`);
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Reject/></Response>`;
      return new Response(twiml, { headers: { 'Content-Type': 'application/xml' } });
    }

    const virtualNumber = numbers[0];

    // Resolve owner
    let userData = null;
    if (virtualNumber.customer_email) {
      const users = await base44.asServiceRole.entities.User.filter({ email: virtualNumber.customer_email });
      if (users && users.length > 0) userData = users[0];
    } else if (virtualNumber.userId) {
      const users = await base44.asServiceRole.entities.User.filter({ id: virtualNumber.userId });
      if (users && users.length > 0) userData = users[0];
    }

    if (!userData) {
      console.warn(`[inboundVoiceWebhook] User not found for number ${to}`);
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Reject/></Response>`;
      return new Response(twiml, { headers: { 'Content-Type': 'application/xml' } });
    }

    // Log the call
    try {
      await base44.asServiceRole.entities.CallLog.create({
        virtual_number: to,
        from_number: from,
        to_number: to,
        to_owner_id: userData.id,
        provider: 'twilio',
        direction: 'inbound',
        status: 'incoming',
        call_sid: callSid,
        started_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[inboundVoiceWebhook] Failed to save call log:', e.message);
    }

    // Check for call forwarding rule
    let forwardingNumber = null;
    let forwardUnansweredOnly = false;
    let ringTimeout = 20;
    try {
      const forwarding = await base44.asServiceRole.entities.CallForwardingRule.filter({
        virtual_number: to,
        user_email: userData.email,
        enabled: true,
      });
      if (forwarding && forwarding.length > 0) {
        forwardingNumber = forwarding[0].forwarding_number;
        forwardUnansweredOnly = forwarding[0].forward_unanswered_only || false;
        ringTimeout = forwarding[0].ring_timeout || 20;
      }
    } catch (e) {
      console.warn('[inboundVoiceWebhook] Failed to check forwarding:', e.message);
    }

    // The Twilio Client identity for this user (used in browser WebRTC calls)
    // Identity is the user's email sanitised to be alphanumeric
    const clientIdentity = userData.email.replace(/[^a-zA-Z0-9_]/g, '_');

    let twiml;

    if (forwardingNumber && !forwardUnansweredOnly) {
      // Forward immediately to external number
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="${ringTimeout}" callerId="${to}">
    <Number>${forwardingNumber}</Number>
  </Dial>
  <Say voice="alice">The person you called is unavailable. Please leave a message after the beep.</Say>
  <Record maxLength="120" transcribe="false" action="/api/functions/voicemailSave" method="POST"/>
  <Say voice="alice">Thank you for your message. Goodbye.</Say>
</Response>`;
    } else if (forwardingNumber && forwardUnansweredOnly) {
      // Ring browser first, then forward if unanswered
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="${ringTimeout}" callerId="${to}" action="/api/functions/voiceRouter" method="POST">
    <Client>${clientIdentity}</Client>
  </Dial>
</Response>`;
    } else {
      // Ring the browser client — this triggers the in-app incoming call popup
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="30" callerId="${to}" action="/api/functions/voiceRouter" method="POST">
    <Client>${clientIdentity}</Client>
  </Dial>
</Response>`;
    }

    console.log(`[inboundVoiceWebhook] ✅ Routing call to browser client: ${clientIdentity}`);

    return new Response(twiml, {
      headers: { 'Content-Type': 'application/xml' },
    });

  } catch (error) {
    console.error('[inboundVoiceWebhook] Error:', error.message);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">An error occurred. Please try again later.</Say></Response>`;
    return new Response(twiml, { headers: { 'Content-Type': 'application/xml' }, status: 500 });
  }
});