import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const normalizeE164 = (input) => {
  const cleaned = input.replace(/[^\d+]/g, '');
  if (!cleaned) return '';
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

const xmlResponse = (body) => {
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' }
  });
};

Deno.serve(async (req) => {
  try {
    const contentType = req.headers.get('content-type') || '';
    let recordingUrl = '', recordingDuration = 0, from = '', to = '';

    if (contentType.includes('application/json')) {
      const json = await req.json();
      recordingUrl = json.RecordingUrl || '';
      recordingDuration = Number(json.RecordingDuration || 0);
      from = json.From || '';
      to = json.To || '';
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      recordingUrl = params.get('RecordingUrl') || '';
      recordingDuration = Number(params.get('RecordingDuration') || 0);
      from = params.get('From') || '';
      to = params.get('To') || '';
    }

    const fromE164 = normalizeE164(from);
    const toE164 = normalizeE164(to);

    console.log('[voicemailSave] RecordingUrl:', recordingUrl);
    console.log('[voicemailSave] RecordingDuration:', recordingDuration);
    console.log('[voicemailSave] From:', fromE164);
    console.log('[voicemailSave] To:', toE164);

    const base44 = createClientFromRequest(req);

    // Find VirtualNumber owner
    const vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ number: toE164 });
    if (!vnums?.length) {
      console.warn(`[voicemailSave] ❌ VirtualNumber not found: ${toE164}`);
      return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you. Your message could not be saved.</Say>
</Response>`);
    }

    const vnum = vnums[0];
    const userId = vnum.userId;
    console.log(`[voicemailSave] ✅ VirtualNumber owner userId: ${userId}`);

    // Save voicemail record
    const voicemailData = {
      userId,
      fromNumber: fromE164,
      toNumber: toE164,
      recordingUrl,
      duration: recordingDuration,
      createdAt: new Date().toISOString(),
    };

    console.log(`[voicemailSave] 💾 Saving voicemail:`, JSON.stringify(voicemailData));
    const result = await base44.asServiceRole.entities.Voicemail.create(voicemailData);
    console.log(`[voicemailSave] ✅ Voicemail saved, ID: ${result.id}`);

    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you. Your message has been recorded.</Say>
</Response>`);
  } catch (error) {
    console.error('[voicemailSave] ❌ error:', error.message);
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Application error. Your message may not have been saved.</Say>
</Response>`);
  }
});