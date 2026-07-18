import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { iccid, user_email, carrier_name } = await req.json();

    if (!iccid || !user_email) {
      return Response.json({ error: 'Missing ICCID or user email' }, { status: 400 });
    }

    // APN settings by carrier
    const apnConfigs = {
      telna: {
        apn: 'internet',
        mcc: '000',
        mnc: '000',
        type: 'default,supl'
      },
      airalo: {
        apn: 'airalo',
        mcc: '000',
        mnc: '000',
        type: 'default,supl'
      },
      esimgo: {
        apn: 'internet',
        mcc: '000',
        mnc: '000',
        type: 'default,supl'
      }
    };

    const apn = apnConfigs[carrier_name?.toLowerCase()] || apnConfigs.telna;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    console.log(`[sendEsimApnSettings] Sending APN settings for ${iccid} to ${user_email}`);

    // Send APN configuration email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'support@voxdigits.com',
        to: user_email,
        subject: '📱 eSIM APN Configuration Required',
        html: `
          <h2>Your eSIM Needs Manual APN Configuration</h2>
          <p>Your eSIM has been installed, but you need to configure the APN (Access Point Name) to enable data browsing.</p>
          
          <h3>APN Settings:</h3>
          <ul>
            <li><strong>APN:</strong> ${apn.apn}</li>
            <li><strong>MCC:</strong> ${apn.mcc}</li>
            <li><strong>MNC:</strong> ${apn.mnc}</li>
            <li><strong>Type:</strong> ${apn.type}</li>
            <li><strong>Protocol:</strong> IPv4/IPv6</li>
          </ul>
          
          <h3>iOS Instructions:</h3>
          <ol>
            <li>Go to <strong>Settings → Cellular → Cellular Data Options</strong></li>
            <li>Tap <strong>Cellular Network</strong></li>
            <li>Enter APN: <code>${apn.apn}</code></li>
            <li>Go back and toggle <strong>Cellular Data</strong> ON</li>
          </ol>
          
          <h3>Android Instructions:</h3>
          <ol>
            <li>Go to <strong>Settings → Network & Internet → Mobile Networks</strong></li>
            <li>Tap <strong>Access Point Names</strong></li>
            <li>Create new APN with values above</li>
            <li>Save and select the new APN</li>
          </ol>
          
          <p><strong>Still having issues?</strong> <a href="https://voxdigits.com/support">Contact support</a></p>
        `
      })
    });

    return Response.json({
      success: true,
      message: 'APN settings sent to user email',
      apn_config: apn
    });
  } catch (error) {
    console.error('[sendEsimApnSettings] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});