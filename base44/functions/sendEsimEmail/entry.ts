import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { email, esim, installationSteps } = await req.json();

    if (!email || !esim) {
      return Response.json({ error: 'Missing email or eSIM data' }, { status: 400 });
    }

    // Generate HTML email content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d2137 0%, #1a3a52 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 18px; font-weight: 600; color: #0d2137; margin-bottom: 15px; }
    .info-box { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #00bcd4; margin-bottom: 15px; }
    .info-label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
    .info-value { font-size: 16px; font-family: monospace; color: #000; font-weight: 500; word-break: break-all; }
    .qr-section { text-align: center; background: white; padding: 20px; border-radius: 6px; margin-bottom: 15px; }
    .qr-section p { font-size: 13px; color: #666; margin-bottom: 10px; }
    .steps { background: white; padding: 20px; border-radius: 6px; }
    .step { display: flex; gap: 15px; margin-bottom: 15px; }
    .step-number { min-width: 28px; height: 28px; background: #00bcd4; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
    .step-content h4 { margin: 0 0 5px 0; font-size: 14px; color: #0d2137; }
    .step-content p { margin: 0; font-size: 12px; color: #666; }
    .cta-button { display: inline-block; background: #00bcd4; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #ddd; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ eSIM Purchase Confirmed</h1>
      <p>Your eSIM is ready to activate</p>
    </div>
    
    <div class="content">
      <p>Thank you for your purchase! Your eSIM is now ready to use. Below you'll find all the information needed to activate it on your device.</p>
      
      <div class="section">
        <div class="section-title">Your eSIM Details</div>
        
        <div class="info-box">
          <div class="info-label">Plan</div>
          <div class="info-value">${esim.product_name || 'eSIM Data Plan'}</div>
        </div>
        
        <div class="info-box">
          <div class="info-label">ICCID</div>
          <div class="info-value">${esim.iccid}</div>
        </div>
        
        <div class="info-box">
          <div class="info-label">Activation Code (QR Code)</div>
          <div class="info-value">${esim.qr_code.substring(0, 20)}...${esim.qr_code.substring(esim.qr_code.length - 10)}</div>
        </div>
        
        <div class="info-box">
          <div class="info-label">Amount Paid</div>
          <div class="info-value">$${esim.price_paid?.toFixed(2) || 'N/A'}</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">How to Activate Your eSIM</div>
        
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Open Settings</h4>
              <p>Go to Settings > Mobile/Cellular > eSIM on your device</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Add eSIM</h4>
              <p>Tap "Add eSIM" or "Add Cellular Plan"</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Scan QR Code</h4>
              <p>Select "Use QR Code" and scan the code provided in your account</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Confirm & Activate</h4>
              <p>Follow the on-screen prompts to complete activation</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Need Help?</div>
        <p style="font-size: 13px; color: #666;">
          <strong>QR Code Not Working?</strong> You can enter the activation code manually in your device settings. The full code is available in your account dashboard.
        </p>
        <p style="font-size: 13px; color: #666;">
          <strong>Still Having Issues?</strong> Visit your account dashboard to access detailed platform-specific installation guides.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2026 VoxDigits. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Base44 integration
    const emailRes = await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Your eSIM Purchase Confirmation - ${esim.product_name || 'Data Plan'}`,
      body: htmlContent
    });

    console.log(`eSIM confirmation email sent to ${email}`);

    return Response.json({ 
      success: true, 
      message: 'Confirmation email sent' 
    });
  } catch (error) {
    console.error('Error sending eSIM email:', error);
    return Response.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
});