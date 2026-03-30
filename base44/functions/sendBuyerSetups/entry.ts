import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, orderId, plan, serverRegion, vpnIp, configUrl } = body;

    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 });
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://voxvpn.com';
    const dashboardUrl = `${appUrl}/dashboard`;

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #060910; color: #f4f8fc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 28px; font-weight: 900; color: #4fd1ff; margin-bottom: 8px; }
    .tagline { color: #a9b7c9; font-size: 13px; margin-bottom: 32px; }
    .card { background: #0d1728; border: 1px solid #223654; border-radius: 16px; padding: 28px; margin-bottom: 24px; }
    h2 { color: #ffffff; font-size: 22px; margin: 0 0 8px 0; }
    p { color: #a9b7c9; line-height: 1.6; margin: 0 0 16px 0; }
    .badge { display: inline-block; background: #123824; border: 1px solid #38c172; color: #bbf7d0; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px; }
    .step { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .step-num { background: linear-gradient(135deg, #0ea5ff, #4fd1ff); color: #02111d; font-weight: 900; font-size: 13px; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
    .step-text { color: #e8eef7; font-size: 14px; line-height: 1.5; }
    .step-text strong { color: #4fd1ff; }
    .btn { display: inline-block; padding: 14px 28px; border-radius: 12px; font-weight: 900; font-size: 15px; text-decoration: none; color: #02111d; background: linear-gradient(135deg, #0ea5ff, #4fd1ff); margin: 8px 4px; }
    .btn-outline { background: transparent; color: #4fd1ff; border: 1px solid #4fd1ff; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #223654; }
    .info-label { color: #a9b7c9; font-size: 13px; }
    .info-val { color: #f4f8fc; font-size: 13px; font-weight: bold; }
    .note { background: #0b1627; border-left: 3px solid #4fd1ff; border-radius: 8px; padding: 12px 16px; color: #a9b7c9; font-size: 13px; margin-top: 16px; }
    .footer { text-align: center; color: #4a5e75; font-size: 12px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">VoxVPN</div>
    <div class="tagline">Your private, secure connection — ready to go</div>

    <div class="card">
      <div class="badge">✓ Account Active</div>
      <h2>Your VoxVPN is Ready!</h2>
      <p>Welcome aboard. Your VPN account has been provisioned and your personal configuration is ready. Follow the steps below to connect in minutes.</p>

      <div class="info-row"><span class="info-label">Plan</span><span class="info-val">${plan || 'Basic'}</span></div>
      <div class="info-row"><span class="info-label">Assigned Server</span><span class="info-val">${serverRegion || 'Optimal Server'}</span></div>
      <div class="info-row"><span class="info-label">Your VPN IP</span><span class="info-val">${vpnIp || 'Assigned on connect'}</span></div>
      ${orderId ? `<div class="info-row"><span class="info-label">Order ID</span><span class="info-val">${orderId}</span></div>` : ''}
    </div>

    <div class="card">
      <h2 style="font-size:18px; margin-bottom:20px;">3 Steps to Connect on Windows</h2>

      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text">
          <strong>Download WireGuard for Windows</strong><br>
          Go to <a href="https://www.wireguard.com/install/" style="color:#4fd1ff;">wireguard.com/install</a> and install the free Windows client. This takes about 1 minute.
        </div>
      </div>

      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text">
          <strong>Download your VoxVPN profile</strong><br>
          Click the button below to download your personal <code style="background:#0b1627; padding:2px 6px; border-radius:4px; color:#4fd1ff;">VoxVPN-Windows.conf</code> file — it contains your unique keys and server details.
        </div>
      </div>

      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text">
          <strong>Import & Connect</strong><br>
          Open WireGuard → click <strong>"Import tunnel(s) from file"</strong> → select your VoxVPN.conf → click <strong>Activate</strong>. You're connected!
        </div>
      </div>

      <div style="margin-top:24px; text-align:center;">
        ${configUrl ? `<a href="${configUrl}" class="btn">⬇ Download VoxVPN Config</a>` : ''}
        <a href="${dashboardUrl}" class="btn ${configUrl ? 'btn-outline' : ''}">Go to Dashboard</a>
      </div>

      <div class="note">
        💡 <strong>Tip:</strong> Your config is unique to your account. Do not share it. You can download additional configs for other devices from your dashboard anytime.
      </div>
    </div>

    <div class="card">
      <h2 style="font-size:16px;">Also Available On</h2>
      <p>macOS · Linux · Android · iPhone/iPad — all accessible from your dashboard with device-specific configs and QR codes for mobile.</p>
      <a href="${dashboardUrl}" class="btn" style="font-size:13px; padding:10px 20px;">Open Dashboard</a>
    </div>

    <div class="footer">
      <p>Need help? Reply to this email or visit <a href="${appUrl}/contact" style="color:#4fd1ff;">our support page</a>.</p>
      <p>© 2026 VoxVPN / VoxDigits. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Use Resend for external customer emails (not app users)
    const resend = await import('npm:resend@3.0.0');
    const resendClient = new resend.default(Deno.env.get('RESEND_API_KEY'));
    
    await resendClient.emails.send({
      from: 'VoxVPN <noreply@voxvpn.com>',
      to: email,
      subject: '✅ Your VoxVPN is Ready — Connect Now',
      html: emailBody,
    });

    return Response.json({
      success: true,
      message: 'Setup email sent to buyer',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});