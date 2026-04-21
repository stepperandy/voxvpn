import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = await import('npm:stripe@14.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = await stripeClient.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { plan, user_id, email } = session.metadata || {};
      const customerEmail = email || session.customer_email;

      if (!customerEmail) {
        console.error('No email found in session');
        return Response.json({ received: true });
      }

      // 1. Provision VPN credentials for the user (generates keypair + assigns server)
      const provisionRes = await base44.asServiceRole.functions.invoke('provisionVpnUser', {
        email: customerEmail,
        plan: plan || 'Basic',
        orderId: session.id,
        platform: 'windows',
        deviceName: 'Windows Device',
      });

      const provisionData = provisionRes?.data || {};

      // 2. Send branded email with download instructions
      await base44.asServiceRole.functions.invoke('sendBuyerSetups', {
        email: customerEmail,
        orderId: session.id,
        plan: plan || 'Basic',
        serverRegion: provisionData.serverRegion || 'Auto-selected',
        vpnIp: provisionData.vpnIp || 'Assigned',
        configUrl: provisionData.configUrl || null,
      });

      // 3. Handle referral reward if this user was referred
      try {
        const referrals = await base44.asServiceRole.entities.Referral.filter({ referee_email: customerEmail });
        const pendingReferral = referrals.find(r => r.status === 'pending' && r.referee_email);
        if (pendingReferral) {
          // Mark referral as completed & rewarded
          await base44.asServiceRole.entities.Referral.update(pendingReferral.id, {
            status: 'rewarded',
            reward_granted_at: new Date().toISOString(),
          });

          // Extend referrer's subscription by 1 month
          const referrerSubs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: pendingReferral.referrer_email });
          const activeSub = referrerSubs.find(s => s.status === 'active');
          if (activeSub && activeSub.renewal_date) {
            const newRenewal = new Date(activeSub.renewal_date);
            newRenewal.setMonth(newRenewal.getMonth() + 1);
            await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, {
              renewal_date: newRenewal.toISOString(),
            });
          }

          // Send reward notification emails
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: pendingReferral.referrer_email,
            subject: '🎉 You earned a free month on VoxVPN!',
            body: `Great news! Your friend ${customerEmail} just subscribed to VoxVPN using your referral link. We've added a free month to your subscription as a thank-you!\n\nKeep sharing your referral link to earn more free months.`,
          });
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: customerEmail,
            subject: '🎁 Your referral bonus is active!',
            body: `Welcome to VoxVPN! Because you signed up with a referral link from ${pendingReferral.referrer_email}, your first month is on us — your account has been extended by 30 days.\n\nEnjoy your VPN!`,
          });

          console.log(`Referral rewarded: ${pendingReferral.referrer_email} → ${customerEmail}`);
        }
      } catch (refErr) {
        console.error('Referral reward error:', refErr.message);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});