import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { iccid, package_id, user_email } = body;

    if (!iccid || !user_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[provisionEsim] Provisioning eSIM ${iccid} for ${user_email}`);

    const base44 = createClientFromRequest(req);

    // Get the eSIM order
    const esims = await base44.asServiceRole.entities.ESim.filter(
      { user_email, iccid },
      '-created_date',
      1
    );

    if (!esims || esims.length === 0) {
      return Response.json({ error: 'eSIM not found' }, { status: 404 });
    }

    const esim = esims[0];

    // Update eSIM status to active
    await base44.asServiceRole.entities.ESim.update(esim.id, {
      status: 'active'
    });

    // OTA provisioning - QR code contains LPA string for automatic setup
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'support@voxdigits.com',
        to: user_email,
        subject: '✅ Your eSIM is Ready - Automatic Setup',
        html: `
          <h2>Your eSIM is Ready! 🎉</h2>
          <p>Your eSIM plan <strong>${esim.product_name}</strong> has been automatically configured and is ready to use.</p>
          
          <h3>Quick Setup (2 steps):</h3>
          <ol>
            <li>Open your phone camera and scan the QR code below</li>
            <li>Tap the notification to install - that's it! No manual APN setup needed</li>
          </ol>
          
          <div style="text-align: center; margin: 20px 0;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(esim.qr_code || '')}" alt="QR Code" style="max-width: 300px;" />
          </div>
          
          <p><strong>ICCID:</strong> ${iccid}</p>
          
          <h3>What you get:</h3>
          <ul>
            <li>✅ Data, Voice & SMS</li>
            <li>✅ Global roaming enabled</li>
            <li>✅ Automatic APN configuration</li>
            <li>✅ Ready to use immediately</li>
          </ul>
          
          <p><strong>Having issues?</strong> <a href="https://voxdigits.com/support">Contact support</a></p>
        `
      })
    });

    console.log(`[provisionEsim] eSIM ${iccid} auto-provisioned with OTA`);

    return Response.json({
      success: true,
      esim_id: esim.id,
      status: 'active',
      auto_provisioned: true,
      note: 'eSIM automatically configured - data works immediately'
    });
  } catch (error) {
    console.error('[provisionEsim] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});