// Handles Twilio voicemail recording completion
// Returns empty TwiML immediately; saves voicemail + transcription in background

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Parse body params (POST) and query params (GET/action URL extras)
  let bodyParams = {};
  if (req.method === 'POST') {
    try {
      const text = await req.text();
      bodyParams = Object.fromEntries(new URLSearchParams(text));
    } catch (_) {}
  }

  const get = (key) =>
    bodyParams[key] || bodyParams[key.toLowerCase()] ||
    url.searchParams.get(key) || url.searchParams.get(key.toLowerCase()) || '';

  const recordingUrl  = get('RecordingUrl');
  const recordingSid  = get('RecordingSid');
  const callSid       = get('CallSid');
  const duration      = parseInt(get('RecordingDuration') || '0');
  const from          = get('From') || get('from') || 'unknown';
  const to            = get('To') || get('to') || '';

  console.log(`[voiceRecordingWebhook] from=${from} to=${to} sid=${recordingSid} duration=${duration}s`);

  if (!recordingUrl) {
    console.warn('[voiceRecordingWebhook] No RecordingUrl — ignoring');
    return new Response(EMPTY_TWIML, { status: 200, headers: { 'Content-Type': 'text/xml' } });
  }

  // Respond to Twilio immediately — never block
  (async () => {
    try {
      const base44 = createClientFromRequest(req);

      // Find number owner
      let ownerEmail = '';
      try {
        const numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: to });
        ownerEmail = numbers?.[0]?.customer_email || '';
      } catch (e) {
        console.warn('[voiceRecordingWebhook] Owner lookup failed:', e.message);
      }

      // Save voicemail
      const voicemail = await base44.asServiceRole.entities.Voicemail.create({
        user_email: ownerEmail,
        our_number: to,
        caller_number: from,
        recording_url: `${recordingUrl}.mp3`,
        recording_id: recordingSid,
        duration_seconds: duration,
        call_leg_id: callSid,
        status: 'unread',
        transcript_status: 'pending',
      });
      console.log('[voiceRecordingWebhook] Voicemail saved:', voicemail.id);

      // Transcribe
      try {
        const transcript = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: 'Please transcribe this voicemail audio recording. Provide only the transcription text, nothing else.',
          file_urls: [`${recordingUrl}.mp3`],
          model: 'gemini_3_flash',
        });
        await base44.asServiceRole.entities.Voicemail.update(voicemail.id, {
          transcript: transcript || '',
          transcript_status: transcript ? 'done' : 'failed',
        });
        console.log('[voiceRecordingWebhook] Transcription', transcript ? 'done' : 'empty');
      } catch (err) {
        console.warn('[voiceRecordingWebhook] Transcription failed:', err.message);
        await base44.asServiceRole.entities.Voicemail.update(voicemail.id, { transcript_status: 'failed' });
      }
    } catch (err) {
      console.error('[voiceRecordingWebhook] Background error:', err.message);
    }
  })();

  const confirmationTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you. Your message has been recorded. Goodbye.</Say>
  <Hangup/>
</Response>`;

  return new Response(confirmationTwiml, { status: 200, headers: { 'Content-Type': 'text/xml' } });
});