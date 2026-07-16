import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Deleting account for user: ${user.email}`);

    // Cancel all active virtual number subscriptions
    const numbers = await base44.asServiceRole.entities.VirtualNumber.filter(
      { customer_email: user.email, status: 'active' }
    );

    for (const number of numbers) {
      try {
        // Cancel Stripe subscription if exists
        if (number.stripe_subscription_id) {
          const Stripe = (await import('npm:stripe@14.9.0')).default;
          const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
          await stripe.subscriptions.cancel(number.stripe_subscription_id);
          console.log(`Cancelled Stripe subscription: ${number.stripe_subscription_id}`);
        }

        // Cancel Telnyx number if exists
        if (number.telnyx_number_id) {
          await fetch(`https://api.telnyx.com/v2/phone_numbers/${number.telnyx_number_id}/actions/release`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('TELNYX_API_KEY')}`,
              'Content-Type': 'application/json'
            }
          }).catch(e => console.warn(`Failed to release Telnyx number: ${e.message}`));
        }

        // Mark number as cancelled in database
        await base44.asServiceRole.entities.VirtualNumber.update(number.id, {
          status: 'cancelled'
        });
      } catch (err) {
        console.error(`Error processing number ${number.phone_number}:`, err.message);
      }
    }

    // Delete all user data
    const dataToDelete = [
      { entity: 'Message', filter: { from_number: { $exists: true } } },
      { entity: 'CallLog', filter: { user_email: user.email } },
      { entity: 'Voicemail', filter: { user_email: user.email } },
      { entity: 'Contact', filter: { user_email: user.email } },
      { entity: 'BlockedNumber', filter: { user_email: user.email } },
      { entity: 'CallForwardingRule', filter: { user_email: user.email } },
      { entity: 'AutoReplyTemplate', filter: { user_email: user.email } },
      { entity: 'SMSCampaign', filter: { user_email: user.email } },
      { entity: 'ESim', filter: { user_email: user.email } },
      { entity: 'SupportTicket', filter: { user_email: user.email } },
    ];

    for (const item of dataToDelete) {
      try {
        const entity = base44.asServiceRole.entities[item.entity];
        if (entity) {
          const records = await entity.filter(item.filter, '-created_date', 100);
          for (const record of records) {
            await entity.delete(record.id);
          }
          console.log(`Deleted ${records.length} ${item.entity} records`);
        }
      } catch (err) {
        console.warn(`Error deleting ${item.entity}:`, err.message);
      }
    }

    console.log(`Account deletion completed for: ${user.email}`);

    return Response.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    return Response.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
});