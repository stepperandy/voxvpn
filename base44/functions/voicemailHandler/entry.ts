import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const xmlResponse = (body) => {
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' }
  });
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const text = await req.text();
    const params = new URLSearchParams(text);

    const dialCallStatus = params.get('DialCallStatus') || '';
    const callSid = params.get('CallSid') || '';
    const from = params.get('From') || '';
    const to = params.get('To') || '';
    const retryCount = parseInt(params.get('RetryCount') || '0');

    console.log('[voicemailHandler] 📞 CallSid:', callSid);
    console.log('[voicemailHandler] 📞 From:', from);
    console.log('[voicemailHandler] 📞 To:', to);
    console.log('[voicemailHandler] 📞 DialCallStatus:', dialCallStatus);
    console.log('[voicemailHandler] 🔄 RetryCount:', retryCount);

    // Call was answered — do nothing
    if (['completed', 'answered', 'in-progress'].includes(dialCallStatus)) {
      console.log('[voicemailHandler] ✅ Call answered, skipping voicemail');
      return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response />`);
    }

    // If busy/no-answer and haven't retried yet — retry dialing the client once
    if ((dialCallStatus === 'busy' || dialCallStatus === 'no-answer') && retryCount < 2) {
      console.log(`[voicemailHandler] 🔄 Client ${dialCallStatus} — retrying (attempt ${retryCount + 1})`);

      // Look up the client identity from VirtualNumber
      let identity = '';
      try {
        let toNormalized = to;
        if (!toNormalized.startsWith('+')) toNormalized = '+' + toNormalized.replace(/\D/g, '');
        const vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNormalized });
        if (vnums && vnums.length > 0) {
          identity = (vnums[0].customer_email || '').replace(/[@.]/g, '_');
        }
      } catch (e) {
        console.error('[voicemailHandler] VirtualNumber lookup error:', e.message);
      }

      if (identity) {
        const appId = Deno.env.get('BASE44_APP_ID') || '';
        const retryActionUrl = `https://app--${appId}.base44.app/api/apps/${appId}/functions/voicemailHandler?RetryCount=${retryCount + 1}`;
        console.log('[voicemailHandler] 🔄 Retrying dial to client:', identity);
        return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="2"/>
  <Dial timeout="30" action="${retryActionUrl}" method="POST" callerId="${from}">
    <Client>${identity}</Client>
  </Dial>
</Response>`);
      }
    }

    console.log('[voicemailHandler] 📧 Recording voicemail');
    const appId = Deno.env.get('BASE44_APP_ID') || '';
    const voicemailSaveUrl = `https://app--${appId}.base44.app/api/apps/${appId}/functions/voicemailSave`;
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Please leave a message after the tone.</Say>
  <Record
    maxLength="120"
    playBeep="true"
    action="${voicemailSaveUrl}"
    method="POST" />
</Response>`);
  } catch (error) {
    console.error('[voicemailHandler] ❌ error:', error.message);
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Application error.</Say>
</Response>`);
  }
});