/**
 * voiceRouter — called by Twilio when a <Dial> to a <Client> ends (answered, busy, no-answer, failed)
 * If the browser didn't answer, fall back to call forwarding or voicemail.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const formData = await req.formData();

    const dialCallStatus = formData.get('DialCallStatus'); // answered | busy | no-answer | failed | completed
    const to = formData.get('To');
    const from = formData.get('From');
    const callSid = formData.get('CallSid');

    console.log(`[voiceRouter] DialCallStatus=${dialCallStatus} to=${to} from=${from}`);

    if (dialCallStatus === 'answered' || dialCallStatus === 'completed') {
      // Call was answered — done
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    // Not answered — check for forwarding fallback
    let numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ number: to });
    if (!numbers || numbers.length === 0) {
      numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: to });
    }

    let forwardingNumber = null;
    if (numbers && numbers.length > 0) {
      const vn = numbers[0];
      const ownerEmail = vn.customer_email || null;
      if (ownerEmail) {
        const fwdRules = await base44.asServiceRole.entities.CallForwardingRule.filter({
          virtual_number: to,
          user_email: ownerEmail,
          enabled: true,
        });
        if (fwdRules && fwdRules.length > 0) {
          forwardingNumber = fwdRules[0].forwarding_number;
        }
      }
    }

    let twiml;
    if (forwardingNumber) {
      console.log(`[voiceRouter] Forwarding unanswered call to ${forwardingNumber}`);
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="25" callerId="${to}">
    <Number>${forwardingNumber}</Number>
  </Dial>
  <Say voice="alice">The person you called is unavailable. Please leave a message after the beep.</Say>
  <Record maxLength="120" action="/api/functions/voicemailSave" method="POST"/>
  <Say voice="alice">Thank you. Goodbye.</Say>
</Response>`;
    } else {
      // Voicemail fallback
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">The person you called is currently unavailable. Please leave a message after the beep and they will get back to you.</Say>
  <Record maxLength="120" transcribe="false" action="/api/functions/voicemailSave" method="POST"/>
  <Say voice="alice">Thank you for your message. Goodbye.</Say>
</Response>`;
    }

    return new Response(twiml, { headers: { 'Content-Type': 'application/xml' } });

  } catch (error) {
    console.error('[voiceRouter] Error:', error.message);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">Sorry, an error occurred.</Say></Response>`;
    return new Response(twiml, { headers: { 'Content-Type': 'application/xml' } });
  }
});