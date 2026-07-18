// Test SMS, calls, and webhook functionality
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { test_type, from_number, to_number } = await req.json();
    const results = [];

    // Test 1: SMS Receipt (send test SMS)
    if (test_type === '1' || test_type === 'all') {
      console.log('[testCalls] Test 1: Testing SMS...');
      const smsRes = await base44.functions.invoke('sendSms', {
        from_number: from_number || '+1234567890',
        to_number: to_number || user.email, // Will fail if not a real number
        body: '[TEST] SMS Receipt Test - ' + new Date().toISOString(),
      });
      results.push({
        test: '1_sms',
        status: smsRes.data?.success ? 'PASS' : 'FAIL',
        message: smsRes.data?.success ? `SMS sent via ${smsRes.data.provider}` : smsRes.data?.error,
      });
    }

    // Test 2: Call Making (Vonage Voice API check)
    if (test_type === '2' || test_type === 'all') {
      console.log('[testCalls] Test 2: Checking Vonage Voice API...');
      const vonageKey = Deno.env.get('VONAGE_API_KEY');
      const vonageSecret = Deno.env.get('VONAGE_API_SECRET');
      
      if (vonageKey && vonageSecret) {
        const auth = btoa(`${vonageKey}:${vonageSecret}`);
        const callRes = await fetch('https://api.vonage.com/v1/calls', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: { type: 'phone', number: from_number || '+1234567890' },
            to: [{ type: 'phone', number: to_number || '+1234567890' }],
            ncco: [{ action: 'talk', text: 'Test call from VoxDigits' }],
          }),
        });
        const callData = await callRes.json();
        results.push({
          test: '2_calls',
          status: callRes.ok ? 'PASS' : 'FAIL',
          message: callRes.ok ? `Call initiated: ${callData.uuid}` : callData.error_title || JSON.stringify(callData),
        });
      } else {
        results.push({
          test: '2_calls',
          status: 'SKIP',
          message: 'Vonage credentials not configured',
        });
      }
    }

    // Test 3: Webhook Receipt (check webhook endpoint)
    if (test_type === '3' || test_type === 'all') {
      console.log('[testCalls] Test 3: Testing Webhook...');
      const webhookUrl = `${Deno.env.get('BASE44_PUBLIC_URL') || 'https://app.voxdigits.com'}/functions/webhook`;
      const webhookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
      });
      results.push({
        test: '3_webhook',
        status: webhookRes.ok ? 'PASS' : 'FAIL',
        message: webhookRes.ok ? 'Webhook endpoint is responsive' : `Status ${webhookRes.status}`,
        url: webhookUrl,
      });
    }

    return Response.json({ 
      success: true, 
      user_email: user.email,
      tests: results,
      summary: `${results.filter(r => r.status === 'PASS').length} passed, ${results.filter(r => r.status === 'FAIL').length} failed, ${results.filter(r => r.status === 'SKIP').length} skipped`
    });

  } catch (error) {
    console.error('[testCalls] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});