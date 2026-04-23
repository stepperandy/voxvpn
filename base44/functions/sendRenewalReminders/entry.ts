import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all active subscriptions
    const subscriptions = await base44.asServiceRole.entities.VPNSubscription.filter({ status: 'active' });

    const now = new Date();
    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    let reminded = 0;

    for (const sub of subscriptions) {
      if (!sub.renewal_date || !sub.user_email) continue;

      const renewal = new Date(sub.renewal_date);
      const daysUntilRenewal = Math.ceil((renewal - now) / (1000 * 60 * 60 * 24));

      // Send reminder 3 days before renewal
      if (daysUntilRenewal === 3) {
        const dayWord = 'days';
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: sub.user_email,
          subject: `⏰ Your VoxVPN subscription renews in ${daysUntilRenewal} ${dayWord}`,
          body: `Hello,

Your VoxVPN ${sub.plan} plan is set to renew on ${renewal.toDateString()} (in ${daysUntilRenewal} ${dayWord}).

Plan: ${sub.plan}
Billing: ${sub.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}
${sub.price ? `Amount: $${sub.price}` : ''}

To manage your subscription, visit your dashboard:
${Deno.env.get('APP_URL')}/dashboard

If you have any questions, contact us at support@voxdigits.com.

The VoxVPN Team`,
        });

        console.log(`Sent ${daysUntilRenewal}-day renewal reminder to ${sub.user_email}`);
        reminded++;
      }
    }

    return Response.json({ success: true, reminders_sent: reminded });
  } catch (error) {
    console.error('Renewal reminder error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});