import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('[checkUsageAndAlert] Running usage check');

    // Get all eSIMs with active status
    const esims = await base44.asServiceRole.entities.ESim.filter(
      { status: 'active' },
      '-created_date',
      100
    );

    // Get all virtual numbers with active status
    const numbers = await base44.asServiceRole.entities.VirtualNumber.filter(
      { status: 'active' },
      '-created_date',
      100
    );

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    // Check eSIM data usage
    for (const esim of esims) {
      const dataUsed = esim.data_used_gb || 0;
      const dataLimit = esim.data_gb || 1;
      const percentage = Math.round((dataUsed / dataLimit) * 100);

      if (percentage >= 100) {
        // Check if alert already sent
        const existing = await base44.asServiceRole.entities.UsageAlert.filter({
          service_id: esim.id,
          alert_type: 'data_100'
        });

        if (!existing || existing.length === 0) {
          console.log(`[checkUsageAndAlert] eSIM ${esim.id} at 100% data usage`);

          // Create alert record
          await base44.asServiceRole.entities.UsageAlert.create({
            user_email: esim.user_email,
            alert_type: 'data_100',
            service_id: esim.id,
            service_name: esim.product_name,
            current_usage: dataUsed,
            limit: dataLimit,
            percentage: 100,
            email_sent: true
          });

          // Send email
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'alerts@voxdigits.com',
              to: esim.user_email,
              subject: '⚠️ Your eSIM Data Limit Reached',
              html: `
                <h2>Data Limit Reached</h2>
                <p>Your eSIM plan <strong>${esim.product_name}</strong> has reached its monthly data limit.</p>
                <p><strong>Usage:</strong> ${dataUsed}GB / ${dataLimit}GB</p>
                <p>Consider purchasing an additional data plan or upgrade your plan for the next month.</p>
                <p><a href="https://voxdigits.com">Manage your services</a></p>
              `
            })
          });
        }
      } else if (percentage >= 80 && percentage < 100) {
        const existing = await base44.asServiceRole.entities.UsageAlert.filter({
          service_id: esim.id,
          alert_type: 'data_80'
        });

        if (!existing || existing.length === 0) {
          console.log(`[checkUsageAndAlert] eSIM ${esim.id} at 80% data usage`);

          await base44.asServiceRole.entities.UsageAlert.create({
            user_email: esim.user_email,
            alert_type: 'data_80',
            service_id: esim.id,
            service_name: esim.product_name,
            current_usage: dataUsed,
            limit: dataLimit,
            percentage,
            email_sent: true
          });

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'alerts@voxdigits.com',
              to: esim.user_email,
              subject: '📊 eSIM Data Usage Alert - 80% Threshold',
              html: `
                <h2>Data Usage Alert</h2>
                <p>Your eSIM plan <strong>${esim.product_name}</strong> has reached 80% of its monthly data limit.</p>
                <p><strong>Usage:</strong> ${dataUsed.toFixed(2)}GB / ${dataLimit}GB (${percentage}%)</p>
                <p>You have ${(dataLimit - dataUsed).toFixed(2)}GB remaining this month.</p>
                <p><a href="https://voxdigits.com">View your plan</a></p>
              `
            })
          });
        }
      }
    }

    // Check virtual number calls and SMS
    for (const number of numbers) {
      const callsUsed = number.calls_this_month || 0;
      const smsUsed = number.sms_this_month || 0;
      const callLimit = 500; // Default limit
      const smsLimit = 1000; // Default limit

      // Check calls
      const callPercentage = Math.round((callsUsed / callLimit) * 100);
      if (callPercentage >= 80) {
        const existing = await base44.asServiceRole.entities.UsageAlert.filter({
          service_id: number.id,
          alert_type: callPercentage >= 100 ? 'calls_100' : 'calls_80'
        });

        if (!existing || existing.length === 0) {
          const alertType = callPercentage >= 100 ? 'calls_100' : 'calls_80';
          
          await base44.asServiceRole.entities.UsageAlert.create({
            user_email: number.customer_email,
            alert_type: alertType,
            service_id: number.id,
            service_name: number.phone_number,
            current_usage: callsUsed,
            limit: callLimit,
            percentage: callPercentage,
            email_sent: true
          });

          const subject = callPercentage >= 100 
            ? '⚠️ Call Limit Reached'
            : '📞 Call Usage Alert - 80% Threshold';

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'alerts@voxdigits.com',
              to: number.customer_email,
              subject,
              html: `
                <h2>${callPercentage >= 100 ? 'Call Limit Reached' : 'Call Usage Alert'}</h2>
                <p>Your virtual number <strong>${number.phone_number}</strong> has reached ${callPercentage}% of its monthly call limit.</p>
                <p><strong>Usage:</strong> ${callsUsed} / ${callLimit} calls</p>
              `
            })
          });
        }
      }

      // Check SMS
      const smsPercentage = Math.round((smsUsed / smsLimit) * 100);
      if (smsPercentage >= 80) {
        const existing = await base44.asServiceRole.entities.UsageAlert.filter({
          service_id: number.id,
          alert_type: smsPercentage >= 100 ? 'sms_100' : 'sms_80'
        });

        if (!existing || existing.length === 0) {
          const alertType = smsPercentage >= 100 ? 'sms_100' : 'sms_80';

          await base44.asServiceRole.entities.UsageAlert.create({
            user_email: number.customer_email,
            alert_type: alertType,
            service_id: number.id,
            service_name: number.phone_number,
            current_usage: smsUsed,
            limit: smsLimit,
            percentage: smsPercentage,
            email_sent: true
          });

          const subject = smsPercentage >= 100
            ? '⚠️ SMS Limit Reached'
            : '💬 SMS Usage Alert - 80% Threshold';

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'alerts@voxdigits.com',
              to: number.customer_email,
              subject,
              html: `
                <h2>${smsPercentage >= 100 ? 'SMS Limit Reached' : 'SMS Usage Alert'}</h2>
                <p>Your virtual number <strong>${number.phone_number}</strong> has reached ${smsPercentage}% of its monthly SMS limit.</p>
                <p><strong>Usage:</strong> ${smsUsed} / ${smsLimit} SMS</p>
              `
            })
          });
        }
      }
    }

    console.log('[checkUsageAndAlert] Completed successfully');
    return Response.json({ success: true });
  } catch (error) {
    console.error('[checkUsageAndAlert] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});