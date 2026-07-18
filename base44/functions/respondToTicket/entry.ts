import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { ticket_id, resolution_notes, new_status } = await req.json();

    if (!ticket_id || !resolution_notes) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[respondToTicket] Updating ticket ${ticket_id}`);

    // Get ticket
    const tickets = await base44.asServiceRole.entities.SupportTicket.filter({ id: ticket_id });
    if (tickets.length === 0) {
      return Response.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = tickets[0];

    // Update ticket
    await base44.asServiceRole.entities.SupportTicket.update(ticket_id, {
      resolution_notes,
      status: new_status || 'in_progress'
    });

    // Send notification email to user
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'support@voxdigits.com',
        to: ticket.user_email,
        subject: `Support Ticket #${ticket_id} Updated`,
        html: `
          <h2>Your support ticket has been updated</h2>
          <p><strong>Ticket ID:</strong> ${ticket_id}</p>
          <p><strong>Status:</strong> ${new_status || 'In Progress'}</p>
          <p><strong>Response:</strong></p>
          <p>${resolution_notes}</p>
        `
      })
    });

    console.log(`[respondToTicket] Updated and notified user`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('[respondToTicket] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});