import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, iccid, esim_id } = await req.json();

    if (!title || !description || !category) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[submitTicket] Creating ticket for ${user.email}`);

    // Create support ticket
    const ticket = await base44.entities.SupportTicket.create({
      user_email: user.email,
      title,
      description,
      category,
      iccid: iccid || '',
      esim_id: esim_id || '',
      status: 'open',
      priority: 'medium'
    });

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const appUrl = Deno.env.get('BASE44_PUBLIC_URL') || 'https://voxdigits.com';

    const iccidRow = iccid ? `<tr><td style="color:#94a3b8;padding:6px 0">ICCID</td><td style="color:#22d3ee;font-family:monospace;padding:6px 0">${iccid}</td></tr>` : '';

    // Send confirmation to user
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'VoxDigits Support <support@voxdigits.com>',
        to: user.email,
        subject: `Support Ticket #${ticket.id.slice(-6).toUpperCase()} Received`,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
          <h2 style="color:#22d3ee;margin-bottom:4px;">We've received your ticket</h2>
          <p style="color:#94a3b8;margin-top:0;">Our support team will get back to you as soon as possible.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr><td style="color:#94a3b8;padding:6px 0">Ticket ID</td><td style="color:#fff;font-weight:bold;padding:6px 0">#${ticket.id.slice(-6).toUpperCase()}</td></tr>
            <tr><td style="color:#94a3b8;padding:6px 0">Category</td><td style="color:#fff;padding:6px 0">${category.replace(/_/g,' ')}</td></tr>
            ${iccidRow}
            <tr><td style="color:#94a3b8;padding:6px 0">Status</td><td style="color:#22d3ee;padding:6px 0">Open</td></tr>
          </table>
          <p style="color:#64748b;font-size:12px;margin-top:24px;">— The VoxDigits Support Team</p>
        </div>`
      })
    });

    // Notify admins
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    const adminEmails = admins.map(a => a.email).filter(Boolean);
    if (adminEmails.length > 0) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'VoxDigits Alerts <support@voxdigits.com>',
          to: adminEmails,
          subject: `🎫 New Support Ticket — ${category.replace(/_/g,' ')}${iccid ? ` (${iccid})` : ''}`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
            <h2 style="color:#f87171;margin-bottom:4px;">New Support Ticket</h2>
            <p style="color:#94a3b8;margin-top:0;">A user has submitted a support request.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr><td style="color:#94a3b8;padding:6px 0">Ticket ID</td><td style="color:#fff;font-weight:bold;padding:6px 0">#${ticket.id.slice(-6).toUpperCase()}</td></tr>
              <tr><td style="color:#94a3b8;padding:6px 0">User</td><td style="color:#22d3ee;padding:6px 0">${user.email}</td></tr>
              <tr><td style="color:#94a3b8;padding:6px 0">Category</td><td style="color:#fff;padding:6px 0">${category.replace(/_/g,' ')}</td></tr>
              ${iccidRow}
              <tr><td style="color:#94a3b8;padding:6px 0;vertical-align:top">Description</td><td style="color:#e2e8f0;padding:6px 0;white-space:pre-wrap">${description}</td></tr>
            </table>
            <a href="${appUrl}/AdminTickets" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">View in Admin Panel →</a>
          </div>`
        })
      });
    }

    console.log(`[submitTicket] Ticket created, admin emails sent to ${adminEmails.length} admins`);

    return Response.json({ success: true, ticket });
  } catch (error) {
    console.error('[submitTicket] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});