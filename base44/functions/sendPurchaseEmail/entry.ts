Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { email, phone_number, country_code } = await req.json();

    if (!email || !phone_number) {
      return Response.json({ error: 'Missing email or phone_number' }, { status: 400 });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const installationGuide = `
      <div class="section">
        <div class="section-title">Installation & Setup Guide</div>
        
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Log Into Your Account</h4>
              <p>Visit voxdigits.com/Dashboard and sign in with your credentials</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>View Your Number</h4>
              <p>Go to "My Numbers" to see your newly activated virtual number</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Configure Settings</h4>
              <p>Set up call forwarding, voicemail, and auto-replies as needed</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Start Using Your Number</h4>
              <p>Send/receive SMS, make/receive calls, and manage all communications from your dashboard</p>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">What You Can Do</div>
        <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:16px;">
          <ul style="color:#cbd5e1;font-size:13px;margin:0;padding-left:20px;">
            <li>Send and receive SMS messages</li>
            <li>Make and receive voice calls</li>
            <li>Set up call forwarding to your personal number</li>
            <li>Configure voicemail with custom greetings</li>
            <li>Create bulk SMS campaigns to contacts</li>
            <li>Block unwanted callers and messages</li>
            <li>View detailed call and message logs</li>
            <li>Set auto-reply messages for unavailability</li>
          </ul>
        </div>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'VoxDigits <noreply@voxdigits.com>',
        to: [email],
        subject: `Your VoxDigits Virtual Number ${phone_number} is Ready 🎉`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
  <h2 style="color:#22d3ee;margin-bottom:8px;">Your Virtual Number is Ready!</h2>
  <p style="color:#cbd5e1;">Thank you for your purchase. Your virtual phone number has been activated and is ready to use.</p>
  <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
    <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">Your Virtual Number</p>
    <p style="font-size:28px;font-weight:bold;color:#22d3ee;letter-spacing:2px;margin:0;font-family:monospace;">${phone_number}</p>
    <p style="color:#64748b;font-size:12px;margin:8px 0 0;">Country: ${country_code}</p>
  </div>
  ${installationGuide}
  <div style="text-align:center;margin-top:24px;">
    <a href="https://voxdigits.com/Dashboard" style="display:inline-block;background:#22d3ee;color:#0d1f35;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Go to Dashboard</a>
  </div>
  <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:16px;margin:24px 0;">
    <p style="color:#cbd5e1;font-size:13px;margin:0 0 10px;"><strong>Need Help?</strong></p>
    <p style="color:#cbd5e1;font-size:12px;margin:0;">Contact support at support@voxdigits.com or visit our help center for detailed guides.</p>
  </div>
  <p style="color:#64748b;font-size:12px;margin-top:24px;border-top:1px solid #1e4060;padding-top:16px;">© 2026 VoxDigits. All rights reserved.</p>
</div>`
      })
    });

    const data = await res.json();
    
    if (!res.ok) {
      console.error('Resend error:', JSON.stringify(data));
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    console.log('Purchase confirmation email sent to:', email);
    return Response.json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});