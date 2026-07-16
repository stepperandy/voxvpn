import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (e) {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  console.log('[airaloUsageWebhook] Received payload:', JSON.stringify(payload));

  const base44 = createClientFromRequest(req);

  // Airalo sends: { notif_type: "sim_usage", iccid, remaining, total, ... }
  // or nested under data: { data: { iccid, ... } }
  const data = payload.data || payload;
  const iccid = data.iccid || data.sim?.iccid;
  const remaining = parseFloat(data.remaining ?? data.remaining_data ?? 0); // in MB
  const total = parseFloat(data.total ?? data.total_data ?? 0); // in MB

  if (!iccid || !total) {
    console.warn('[airaloUsageWebhook] Missing iccid or total:', { iccid, total });
    return Response.json({ ok: true, skipped: 'missing iccid or total' });
  }

  const usedMb = total - remaining;
  const usagePercent = Math.round((usedMb / total) * 100);
  const usedGb = usedMb / 1024;
  const totalGb = total / 1024;

  console.log(`[airaloUsageWebhook] ICCID: ${iccid}, Usage: ${usagePercent}% (${usedGb.toFixed(2)}/${totalGb.toFixed(2)} GB)`);

  // Find ESim record by ICCID
  const esims = await base44.asServiceRole.entities.ESim.filter({ iccid });
  if (!esims || esims.length === 0) {
    console.warn('[airaloUsageWebhook] No ESim found for ICCID:', iccid);
    return Response.json({ ok: true, skipped: 'esim not found' });
  }
  const esim = esims[0];

  // Update data usage on the ESim record
  await base44.asServiceRole.entities.ESim.update(esim.id, {
    data_used_gb: usedGb,
    data_gb: totalGb,
  });

  // Determine alert type
  let alertType = null;
  if (usagePercent >= 100) alertType = 'data_100';
  else if (usagePercent >= 80) alertType = 'data_80';

  if (!alertType) {
    return Response.json({ ok: true, message: 'Usage below 80%, no alert needed' });
  }

  // Check if this alert was already sent
  const existingAlerts = await base44.asServiceRole.entities.UsageAlert.filter({
    service_id: esim.id,
    alert_type: alertType,
  });

  if (existingAlerts && existingAlerts.length > 0) {
    console.log(`[airaloUsageWebhook] Alert ${alertType} already sent for esim ${esim.id}`);
    return Response.json({ ok: true, message: 'Alert already sent' });
  }

  // Create usage alert record
  const alert = await base44.asServiceRole.entities.UsageAlert.create({
    user_email: esim.user_email,
    alert_type: alertType,
    service_id: esim.id,
    service_name: esim.product_name,
    current_usage: usedGb,
    limit: totalGb,
    percentage: usagePercent,
    email_sent: false,
  });

  // Send email notification
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (resendKey && esim.user_email) {
    const isExhausted = alertType === 'data_100';
    const subject = isExhausted
      ? `⚠️ Your eSIM data is fully used — ${esim.product_name}`
      : `📶 You've used 80% of your eSIM data — ${esim.product_name}`;

    const bodyHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
        <h2 style="color:${isExhausted ? '#ef4444' : '#f59e0b'};">${isExhausted ? '⚠️ Data Exhausted' : '📶 80% Data Used'}</h2>
        <p style="color:#cbd5e1;">Your eSIM plan <strong>${esim.product_name}</strong> has ${isExhausted ? 'run out of data' : 'reached 80% usage'}.</p>
        <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="color:#94a3b8;margin:0 0 8px 0;font-size:13px;">Data Usage</p>
          <p style="font-size:24px;font-weight:bold;color:${isExhausted ? '#ef4444' : '#f59e0b'};margin:0;">${usedGb.toFixed(2)} GB / ${totalGb.toFixed(2)} GB</p>
          <div style="background:#1e3a5f;border-radius:4px;height:8px;margin-top:12px;overflow:hidden;">
            <div style="background:${isExhausted ? '#ef4444' : '#f59e0b'};height:100%;width:${Math.min(100, usagePercent)}%;"></div>
          </div>
          <p style="color:#64748b;font-size:12px;margin:6px 0 0 0;">${usagePercent}% used</p>
        </div>
        <p style="color:#cbd5e1;"><strong>ICCID:</strong> <span style="font-family:monospace;color:#22d3ee;">${iccid}</span></p>
        ${isExhausted
          ? `<p style="color:#cbd5e1;">Visit the <a href="https://voxdigits.com/ESimStore" style="color:#22d3ee;">eSIM Store</a> to purchase a new data plan.</p>`
          : `<p style="color:#cbd5e1;">You have <strong>${remaining < 1024 ? remaining.toFixed(0) + ' MB' : (remaining / 1024).toFixed(2) + ' GB'}</strong> remaining. Consider purchasing a top-up plan soon.</p>`
        }
        <p style="color:#64748b;font-size:12px;margin-top:24px;">— The VoxDigits Team</p>
      </div>
    `;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'VoxDigits <noreply@voxdigits.com>',
        to: [esim.user_email],
        subject,
        html: bodyHtml,
      }),
    });

    if (emailRes.ok) {
      await base44.asServiceRole.entities.UsageAlert.update(alert.id, { email_sent: true });
      console.log(`[airaloUsageWebhook] Email sent to ${esim.user_email} for ${alertType}`);
    } else {
      const err = await emailRes.text();
      console.error('[airaloUsageWebhook] Email send failed:', err);
    }
  }

  // Trigger auto-topup if enabled and at 80%
  if (alertType === 'data_80' && esim.auto_topup && !esim.auto_topup_triggered) {
    console.log(`[airaloUsageWebhook] Triggering auto-topup for esim ${esim.id}`);
    try {
      await base44.asServiceRole.functions.invoke('autoTopupEsim', { esim_id: esim.id });
    } catch (err) {
      console.error('[airaloUsageWebhook] Auto-topup failed:', err.message);
    }
  }

  return Response.json({ ok: true, alert_type: alertType, usage_percent: usagePercent });
});