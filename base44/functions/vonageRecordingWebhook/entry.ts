// Handle voicemail recording completion from Vonage
// Saves recording metadata and triggers transcription
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    
    const base44 = createClientFromRequest(req);
    
    const recordingUrl = params.recording_url || '';
    const recordingId = params.recording_id || '';
    const callUuid = params.uuid || params.call_id || '';
    const from = params.from || 'unknown';
    const to = params.to || '';
    const duration = parseInt(params.recording_duration || '0');
    
    console.log('[vonageRecordingWebhook] Recording received:', {
      recordingId,
      callUuid,
      from,
      to,
      duration,
      timestamp: new Date().toISOString(),
    });

    // Create Voicemail record
    const voicemail = await base44.asServiceRole.entities.Voicemail.create({
      our_number: to,
      caller_number: from,
      recording_url: recordingUrl,
      recording_id: recordingId,
      duration_seconds: duration,
      call_leg_id: callUuid,
      status: 'unread',
      transcript_status: 'pending',
    });

    console.log('[vonageRecordingWebhook] Voicemail saved:', voicemail.id);

    // Trigger transcription via LLM
    try {
      const transcription = await base44.integrations.Core.InvokeLLM({
        prompt: `Transcribe the following voicemail recording and provide a brief summary. Recording URL: ${recordingUrl}`,
        file_urls: [recordingUrl],
        model: 'gemini_3_flash',
      });

      if (transcription) {
        await base44.asServiceRole.entities.Voicemail.update(voicemail.id, {
          transcript: transcription,
          transcript_status: 'done',
        });
        console.log('[vonageRecordingWebhook] Transcription completed');
      }
    } catch (err) {
      console.warn('[vonageRecordingWebhook] Transcription failed:', err.message);
      await base44.asServiceRole.entities.Voicemail.update(voicemail.id, {
        transcript_status: 'failed',
      });
    }

    return Response.json({ success: true, voicemail_id: voicemail.id });

  } catch (error) {
    console.error('[vonageRecordingWebhook] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});