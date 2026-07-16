// Handle incoming voice calls via Vonage NCCO
// Supports call forwarding, greetings, and call logging
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    // Vonage sends webhook as GET or POST
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    
    const base44 = createClientFromRequest(req);
    
    // Extract call metadata
    const to = params.to || params.to_number || '';
    const from = params.from || params.caller_id || 'unknown';
    const callUuid = params.uuid || params.call_id || '';
    
    console.log('[vonageVoiceWebhook] Incoming call:', {
      from,
      to,
      callUuid,
      timestamp: new Date().toISOString(),
    });

    // Find virtual number and check for forwarding rule
    let forwardingNumber = null;
    let greeting = null;
    
    try {
      const numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: to });
      if (numbers.length > 0) {
        const number = numbers[0];
        
        // Check for active call forwarding rule
        const rules = await base44.asServiceRole.entities.CallForwardingRule.filter({
          virtual_number: to,
          enabled: true,
        });
        
        if (rules.length > 0 && rules[0].forwarding_number) {
          forwardingNumber = rules[0].forwarding_number;
          console.log('[vonageVoiceWebhook] Forwarding call to:', forwardingNumber);
        }
        
        // Check for voicemail greeting
        if (number.voicemail_greeting_url) {
          greeting = number.voicemail_greeting_url;
        }
      }
    } catch (err) {
      console.warn('[vonageVoiceWebhook] Error looking up number config:', err.message);
    }

    // Build NCCO response
    let ncco = [];

    // If call forwarding is enabled, try to forward
    if (forwardingNumber) {
      ncco.push({
        action: 'talk',
        text: 'Your call is being connected.',
        voiceName: 'Amazon Polly',
      });
      ncco.push({
        action: 'connect',
        endpoint: [
          {
            type: 'phone',
            number: forwardingNumber,
          }
        ],
        timeout: 60,
        onAnswer: {
          ncco: [
            {
              action: 'talk',
              text: `Call from ${from}`,
            }
          ]
        },
      });
    } else {
      // No forwarding — play greeting or send to voicemail
      if (greeting) {
        ncco.push({
          action: 'stream',
          url: [greeting],
        });
      } else {
        ncco.push({
          action: 'talk',
          text: 'Thank you for calling. Please leave a message after the tone.',
          voiceName: 'Amazon Polly',
        });
      }
      
      // Record voicemail
      ncco.push({
        action: 'record',
        format: 'wav',
        endOnSilence: 3,
        beepStart: true,
        eventUrl: [`${Deno.env.get('BASE44_PUBLIC_URL') || 'https://app.voxdigits.com'}/functions/vonageRecordingWebhook`],
      });
    }

    // Log incoming call
    try {
      await base44.asServiceRole.entities.CallLog.create({
        from_number: from,
        to_number: to,
        our_number: to,
        direction: 'inbound',
        status: 'completed',
        telnyx_call_id: callUuid,
        call_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.warn('[vonageVoiceWebhook] Error logging call:', err.message);
    }

    return Response.json(ncco, {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[vonageVoiceWebhook] Error:', error.message);
    
    // Return safe NCCO on error (play message)
    return Response.json([
      {
        action: 'talk',
        text: 'We are unable to process your call right now. Please try again later.',
        voiceName: 'Amazon Polly',
      }
    ], {
      headers: { 'Content-Type': 'application/json' },
    });
  }
});