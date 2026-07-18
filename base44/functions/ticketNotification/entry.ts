import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { ticket_id, action, support_message } = await req.json();

    if (!ticket_id || !action) {
      return Response.json({ error: 'Missing ticket_id or action' }, { status: 400 });
    }

    // Get ticket details
    const ticket = await base44.asServiceRole.entities.SupportTicket.get(ticket_id);
    if (!ticket) {
      return Response.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const userEmail = ticket.user_email;
    if (!userEmail) {
      return Response.json({ error: 'No user email found' }, { status: 400 });
    }

    let emailSubject = '';
    let emailBody = '';

    if (action === 'responded') {
      emailSubject = `Support Response: ${ticket.title}`;
      emailBody = `
Hello,

A support agent has responded to your ticket #${ticket.id.slice(0, 8)}.

**Ticket:** ${ticket.title}
**Status:** ${ticket.status}
${support_message ? `**Response:** ${support_message}` : ''}

Log in to your account to view the full response and any updates.

Best regards,
VoxDigits Support Team
      `.trim();
    } else if (action === 'status_changed') {
      emailSubject = `Ticket Status Updated: ${ticket.title}`;
      emailBody = `
Hello,

Your support ticket status has been updated.

**Ticket:** ${ticket.title}
**New Status:** ${ticket.status}
${support_message ? `**Notes:** ${support_message}` : ''}

Log in to your account to view more details.

Best regards,
VoxDigits Support Team
      `.trim();
    } else if (action === 'resolved') {
      emailSubject = `Your Support Ticket Has Been Resolved`;
      emailBody = `
Hello,

Your support ticket has been resolved.

**Ticket:** ${ticket.title}
**Resolution Notes:** ${support_message || 'No additional notes'}

If you have any follow-up questions, feel free to open a new ticket.

Best regards,
VoxDigits Support Team
      `.trim();
    }

    // Send email notification
    if (emailSubject && emailBody) {
      try {
        await base44.integrations.Core.SendEmail({
          to: userEmail,
          subject: emailSubject,
          body: emailBody,
          from_name: 'VoxDigits Support'
        });
        
        console.log(`Email notification sent to ${userEmail} for ticket ${ticket_id}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError.message);
        // Don't fail the request if email fails
      }
    }

    return Response.json({
      success: true,
      message: 'Notification sent',
      ticket_id,
      action
    });
  } catch (error) {
    console.error('Ticket notification error:', error.message);
    return Response.json({ 
      error: 'Failed to send notification',
      details: error.message 
    }, { status: 500 });
  }
});