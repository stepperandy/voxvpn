import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const xml = (body) => new Response(body, {
  status: 200,
  headers: { 'Content-Type': 'text/xml; charset=utf-8' }
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  let params;
  try {
    const text = await req.text();
    params = new URLSearchParams(text);
    // Log ALL params for debugging
    const allParams = {};
    for (const [k, v] of params.entries()) allParams[k] = v;
    console.log('[voiceWebhook] ALL PARAMS:', JSON.stringify(allParams));
  } catch (e) {
    console.error('[voiceWebhook] Parse error:', e.message);
    return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Parse error</Say></Response>`);
  }

  const from           = params.get('From') || '';
  const direction      = params.get('Direction') || '';
  const stdTo          = params.get('To') || '';
  const callerId       = params.get('callerId') || params.get('CallerId') || '';
  const callStatus     = params.get('CallStatus') || '';
  const callbackSource = params.get('CallbackSource') || '';

  console.log(`[voiceWebhook] From=${from} | To=${stdTo} | Direction=${direction} | callerId=${callerId} | CallStatus=${callStatus}`);

  // ── STATUS CALLBACKS: Twilio sends these after call ends — ignore them ──
  // They arrive with CallbackSource=call-progress-events or CallStatus=completed/busy/failed/no-answer
  if (callbackSource || ['completed', 'busy', 'failed', 'no-answer', 'canceled'].includes(callStatus)) {
    console.log('[voiceWebhook] Status callback received, ignoring:', callStatus);
    return xml(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
  }

  // ── OUTBOUND: From is a browser client identity (client:xxx) ──
  // When Twilio JS SDK places a call, From = "client:<identity>"
  // The custom params we passed (To=phoneNumber, callerId=virtualNumber) come through as form fields
  if (from.startsWith('client:')) {
    // For outbound via TwiML App, the destination number is in the custom 'To' param
    // BUT stdTo might be the TwiML App SID (APxx...) — we need the actual phone number
    // Twilio sends custom params alongside standard ones, so params.get('To') IS the custom To we set
    // However if it's an AP... SID, fall back to nothing (shouldn't happen if dialer sets it correctly)
    // If To is the TwiML App SID (starts with AP), use our custom PhoneNumber param instead
    let dest = stdTo.trim();
    if (!dest || dest.startsWith('AP')) {
      dest = (params.get('PhoneNumber') || '').trim();
      console.log('[voiceWebhook] OUTBOUND — To was TwiML SID, using PhoneNumber param:', dest);
    }

    if (!dest) {
      console.error('[voiceWebhook] OUTBOUND — To is empty');
      return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>No destination number provided.</Say></Response>`);
    }

    // Ensure E.164
    if (!dest.startsWith('+') && !dest.startsWith('client:')) {
      dest = '+' + dest.replace(/\D/g, '');
    }

    // Use the virtual number (callerId custom param) as the caller ID
    const finalCallerId = callerId && !callerId.startsWith('client:') ? callerId : '';
    console.log(`[voiceWebhook] OUTBOUND — dialing ${dest} with callerId=${finalCallerId}`);

    // Check wallet balance — block outgoing calls if insufficient
    if (finalCallerId) {
      try {
        let callerVnums = await base44.asServiceRole.entities.VirtualNumber.filter({ number: finalCallerId });
        if (!callerVnums || callerVnums.length === 0) {
          callerVnums = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: finalCallerId });
        }
        if (callerVnums && callerVnums.length > 0) {
          const callerEmail = callerVnums[0].customer_email || '';
          if (callerEmail) {
            const users = await base44.asServiceRole.entities.User.filter({ email: callerEmail });
            if (users && users.length > 0) {
              const balance = users[0].credits || 0;
              if (balance < 0.03) {
                console.log(`[voiceWebhook] OUTBOUND blocked — insufficient balance for ${callerEmail}: $${balance}`);
                return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Your account balance is insufficient to make outgoing calls. Please add calling credit to your account.</Say>
</Response>`);
              }
            }
          }
        }
      } catch (e) {
        console.warn('[voiceWebhook] Balance check error:', e.message);
      }
    }

    const callerIdAttr = finalCallerId ? `callerId="${finalCallerId}"` : '';
    return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial ${callerIdAttr} timeout="30">
    <Number>${dest}</Number>
  </Dial>
</Response>`);
  }

  // ── INBOUND: a real PSTN call to one of our Twilio numbers ──
  // Guard: From must look like a real phone number (starts with + or digits)
  if (!from.match(/^[+\d]/)) {
    console.warn('[voiceWebhook] Unexpected From format, ignoring:', from);
    return xml(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
  }
  console.log('[voiceWebhook] INBOUND — to:', stdTo);

  let toNormalized = stdTo.trim();
  if (!toNormalized) {
    console.error('[voiceWebhook] INBOUND but To is empty');
    return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Number not found.</Say></Response>`);
  }
  if (!toNormalized.startsWith('+')) {
    toNormalized = '+' + toNormalized.replace(/\D/g, '');
  }

  try {
    // Find virtual number owner — always use service role (no user auth on Twilio webhooks)
    // Try multiple formats: exact, with/without +, digits-only match
    let vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNormalized });
    if (!vnums || vnums.length === 0) {
      vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ number: toNormalized });
    }
    // Try without leading + in case stored differently
    if (!vnums || vnums.length === 0) {
      const toNoPlus = toNormalized.replace(/^\+/, '');
      vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNoPlus });
    }
    if (!vnums || vnums.length === 0) {
      const toNoPlus = toNormalized.replace(/^\+/, '');
      vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ number: toNoPlus });
    }
    // Last resort: scan all and match by digits
    if (!vnums || vnums.length === 0) {
      const toDigits = toNormalized.replace(/\D/g, '');
      console.log('[voiceWebhook] Falling back to full scan for digits:', toDigits);
      const allNums = await base44.asServiceRole.entities.VirtualNumber.list('-created_date', 200);
      vnums = (allNums || []).filter(n => {
        const nd = (n.phone_number || n.number || '').replace(/\D/g, '');
        return nd === toDigits || nd.endsWith(toDigits) || toDigits.endsWith(nd);
      });
    }

    if (!vnums || vnums.length === 0) {
      console.warn('[voiceWebhook] No VirtualNumber for:', toNormalized);
      return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>This number is not in service.</Say>
</Response>`);
    }

    const vnum = vnums[0];
    let ownerEmail = vnum.customer_email || '';
    console.log('[voiceWebhook] Found VirtualNumber:', JSON.stringify({ id: vnum.id, number: vnum.number, phone_number: vnum.phone_number, customer_email: vnum.customer_email, userId: vnum.userId }));

    // Resolve owner email via userId if missing — MUST use asServiceRole (no user auth on webhooks)
    if (!ownerEmail && vnum.userId) {
      const users = await base44.asServiceRole.entities.User.filter({ id: vnum.userId });
      if (users && users.length > 0) ownerEmail = users[0].email || '';
    }

    if (!ownerEmail) {
      console.error('[voiceWebhook] Cannot resolve owner for:', toNormalized);
      return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Unable to route this call.</Say>
</Response>`);
    }

    // Build browser client identity — MUST match what twilioToken generates
    // twilioToken uses email.replace(/[@.]/g, '_')
    const identity = ownerEmail.replace(/[@.]/g, '_');
    console.log('[voiceWebhook] Resolved ownerEmail:', ownerEmail, '→ identity:', identity);
    console.log(`[voiceWebhook] Routing inbound to client identity: ${identity}`);

    // Check call forwarding rules
    let forwardingRules = [];
    try {
      forwardingRules = await base44.asServiceRole.entities.CallForwardingRule.filter({
        virtual_number: toNormalized,
        user_email: ownerEmail,
        enabled: true,
      });
    } catch (e) {
      console.warn('[voiceWebhook] Forwarding rules lookup error:', e.message);
    }

    const appId = Deno.env.get('BASE44_APP_ID') || '';
    const voicemailUrl = `https://app--${appId}.base44.app/api/apps/${appId}/functions/voicemailHandler?RetryCount=0`;

    if (forwardingRules && forwardingRules.length > 0) {
      const rule = forwardingRules[0];
      const forwardTo = rule.forwarding_number;
      const ringTimeout = rule.ring_timeout || 30;

      console.log('[voiceWebhook] Forwarding to:', forwardTo);

      if (rule.forward_unanswered_only) {
        return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="${ringTimeout}" action="${voicemailUrl}" method="POST" callerId="${from}">
    <Client>${identity}</Client>
    <Number>${forwardTo}</Number>
  </Dial>
</Response>`);
      } else {
        return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="${ringTimeout}" callerId="${from}">
    <Number>${forwardTo}</Number>
  </Dial>
</Response>`);
      }
    }

    // Default: ring the browser client, fall back to voicemail
    return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="30" action="${voicemailUrl}" method="POST" callerId="${from}">
    <Client>${identity}</Client>
  </Dial>
</Response>`);

  } catch (e) {
    console.error('[voiceWebhook] Exception:', e.message);
    return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>A system error occurred. Please try again.</Say>
</Response>`);
  }
});