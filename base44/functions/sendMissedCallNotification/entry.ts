import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Triggered by entity automation on CallLog create
    if (event.type !== 'create' || event.entity_name !== 'CallLog') {
      return Response.json({ success: false, reason: 'Not a CallLog event' });
    }

    const callLog = data;

    // Only send notification for missed calls
    if (callLog.status !== 'missed' && callLog.status !== 'no-answer') {
      return Response.json({ success: false, reason: 'Not a missed call' });
    }

    if (!callLog.user_email || !callLog.from_number) {
      return Response.json({ success: false, reason: 'Missing email or caller number' });
    }

    console.log(`[sendMissedCallNotification] Processing missed call from ${callLog.from_number} to ${callLog.user_email}`);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return Response.json({ error: 'Email service not configured' }, { status: 503 });
    }

    // Check if there's a voicemail for this call
    let voicemail = null;
    try {
      const voicemails = await base44.asServiceRole.entities.Voicemail.filter(
        { call_leg_id: callLog.telnyx_call_id },
        '-created_date',
        1
      );
      if (voicemails && voicemails.length > 0) {
        voicemail = voicemails[0];
      }
    } catch (vmErr) {
      console.warn('[sendMissedCallNotification] Could not fetch voicemail:', vmErr.message);
    }

    // Format caller number
    const callerDisplay = callLog.from_number || 'Unknown';
    const callTime = callLog.call_date ? new Date(callLog.call_date).toLocaleString() : 'Unknown time';

    // Build email HTML
    let emailHtml = `
      <h2>📞 You Missed a Call</h2>
      <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 8px 0;"><strong>Caller:</strong> ${callerDisplay}</p>
        <p style="margin: 8px 0;"><strong>Received Number:</strong> ${callLog.our_number || 'Unknown'}</p>
        <p style="margin: 8px 0;"><strong>Time:</strong> ${callTime}</p>
        <p style="margin: 8px 0;"><strong>Duration:</strong> ${callLog.duration_seconds ? callLog.duration_seconds + 's' : 'N/A'}</p>
      </div>
    `;

    // Add voicemail section if available
    if (voicemail) {
      emailHtml += `
        <h3>🎙️ Voicemail</h3>
        <p>${voicemail.duration_seconds ? `Duration: ${voicemail.duration_seconds} seconds` : ''}</p>
      `;

      if (voicemail.recording_url) {
        emailHtml += `
          <p>
            <a href="${voicemail.recording_url}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin: 10px 0;">
              Listen to Voicemail
            </a>
          </p>
        `;
      }

      if (voicemail.transcript) {
        emailHtml += `
          <div style="background-color: #f0f9ff; padding: 12px; border-left: 4px solid #3b82f6; margin: 12px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px;"><strong>Transcript:</strong></p>
            <p style="margin: 8px 0; font-size: 14px;">"${voicemail.transcript}"</p>
          </div>
        `;
      }
    } else {
      emailHtml += `
        <p style="color: #666; font-style: italic;">No voicemail was left for this call.</p>
      `;
    }

    emailHtml += `
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          <a href="${Deno.env.get('BASE44_PUBLIC_URL')}/CallLogs" style="color: #3b82f6; text-decoration: none;">View all call logs</a>
        </p>
      </div>
    `;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'notifications@voxdigits.com',
        to: callLog.user_email,
        subject: `📞 Missed Call from ${callerDisplay}`,
        html: emailHtml
      })
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('[sendMissedCallNotification] Email send failed:', error);
      return Response.json({ error: 'Failed to send email' }, { status: 502 });
    }

    console.log(`[sendMissedCallNotification] ✅ Notification sent to ${callLog.user_email}`);

    return Response.json({
      success: true,
      email_sent: true,
      user_email: callLog.user_email,
      from_number: callerDisplay,
      voicemail_included: !!voicemail
    });
  } catch (error) {
    console.error('[sendMissedCallNotification] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});