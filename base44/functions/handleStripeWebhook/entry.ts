import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Plan → max devices mapping
const PLAN_DEVICES = {
  'Basic': 1,
  'Standard': 3,
  'Premium': 5,
  'Advanced': 10,
  'Enterprise': 999,
};

async function syncSubscription(base44, customerEmail, plan, stripeSubscriptionId, status, billingCycle) {
  // Find existing subscription record
  const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: customerEmail });
  const existing = subs.find(s => s.stripe_subscription_id === stripeSubscriptionId) || subs[0];

  const renewalDate = new Date();
  if (billingCycle === 'yearly') {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  } else {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  }

  const subData = {
    user_email: customerEmail,
    plan: plan || existing?.plan || 'Basic',
    status: status,
    billing_cycle: billingCycle || existing?.billing_cycle || 'monthly',
    stripe_subscription_id: stripeSubscriptionId,
    renewal_date: renewalDate.toISOString(),
    max_devices: PLAN_DEVICES[plan || existing?.plan || 'Basic'] || 1,
    price: 0,
  };

  if (existing) {
    await base44.asServiceRole.entities.VPNSubscription.update(existing.id, subData);
    console.log(`Updated subscription for ${customerEmail}: ${status}`);
  } else {
    await base44.asServiceRole.entities.VPNSubscription.create(subData);
    console.log(`Created subscription for ${customerEmail}: ${status}`);
  }
}

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

    console.log(`Stripe event: ${event.type}`);

    // ── 1. New checkout completed ─────────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { plan, billing, user_id, email } = session.metadata || {};
      const customerEmail = email || session.customer_email || session.customer_details?.email;

      if (!customerEmail) {
        console.error('No email found in session');
        return Response.json({ received: true });
      }

      // Sync subscription record
      await syncSubscription(
        base44,
        customerEmail,
        plan,
        session.subscription,
        'active',
        billing || 'monthly'
      );

      // Provision VPN credentials
      const provisionRes = await base44.asServiceRole.functions.invoke('provisionVpnUser', {
        email: customerEmail,
        plan: plan || 'Basic',
        orderId: session.id,
        platform: 'windows',
        deviceName: 'Windows Device',
      });

      const provisionData = provisionRes?.data || {};

      // Send setup email with dashboard link
      await base44.asServiceRole.functions.invoke('sendBuyerSetups', {
        email: customerEmail,
        orderId: session.id,
        plan: plan || 'Basic',
        serverRegion: provisionData.serverRegion || 'Auto-selected',
        vpnIp: provisionData.vpnIp || 'Assigned',
        configUrl: provisionData.configUrl || null,
        dashboardUrl: `${Deno.env.get('APP_URL')}/dashboard`,
      });

      // Provision Zendit eSIM (non-fatal)
      try {
        await base44.asServiceRole.functions.invoke('provisionZenditEsim', {
          email: customerEmail,
          plan: plan || 'Basic',
          orderId: session.id,
        });
      } catch (zenditErr) {
        console.error('Zendit provisioning error:', zenditErr.message);
      }

      // Handle referral reward
      try {
        const referrals = await base44.asServiceRole.entities.Referral.filter({ referee_email: customerEmail });
        const pendingReferral = referrals.find(r => r.status === 'pending' && r.referee_email);
        if (pendingReferral) {
          await base44.asServiceRole.entities.Referral.update(pendingReferral.id, {
            status: 'rewarded',
            reward_granted_at: new Date().toISOString(),
          });

          const referrerSubs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: pendingReferral.referrer_email });
          const activeSub = referrerSubs.find(s => s.status === 'active');
          if (activeSub && activeSub.renewal_date) {
            const newRenewal = new Date(activeSub.renewal_date);
            newRenewal.setMonth(newRenewal.getMonth() + 1);
            await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, {
              renewal_date: newRenewal.toISOString(),
            });
          }

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

    // ── 2. Recurring payment succeeded → keep subscription active & unlock servers ──
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;

      // Only handle subscription renewals (not the first payment, handled by checkout.session.completed)
      if (invoice.billing_reason !== 'subscription_cycle') {
        return Response.json({ received: true });
      }

      const customerEmail = invoice.customer_email;
      const stripeSubscriptionId = invoice.subscription;

      if (!customerEmail || !stripeSubscriptionId) {
        console.error('Missing email or subscription ID in invoice');
        return Response.json({ received: true });
      }

      // Fetch subscription from Stripe to get current plan metadata
      const stripeSub = await stripeClient.subscriptions.retrieve(stripeSubscriptionId);
      const interval = stripeSub.items.data[0]?.plan?.interval; // 'month' or 'year'
      const billingCycle = interval === 'year' ? 'yearly' : 'monthly';

      // Get plan from subscription metadata or existing record
      const subMeta = stripeSub.metadata || {};
      const plan = subMeta.plan;

      // Sync subscription to active + update renewal date
      await syncSubscription(base44, customerEmail, plan, stripeSubscriptionId, 'active', billingCycle);

      // Notify user of successful renewal
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: customerEmail,
        subject: '✅ VoxVPN subscription renewed successfully',
        body: `Your VoxVPN subscription has been renewed. Your VPN access and all server locations continue uninterrupted.\n\nNext renewal: in ${billingCycle === 'yearly' ? '1 year' : '1 month'}.\n\nThank you for staying protected with VoxVPN!`,
      });

      console.log(`Renewal processed for ${customerEmail} (${stripeSubscriptionId})`);
    }

    // ── 3. Payment failed → mark subscription as expired ─────────────────────
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const customerEmail = invoice.customer_email;
      const stripeSubscriptionId = invoice.subscription;

      if (customerEmail) {
        const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: customerEmail });
        const existing = subs.find(s => s.stripe_subscription_id === stripeSubscriptionId) || subs[0];
        if (existing) {
          await base44.asServiceRole.entities.VPNSubscription.update(existing.id, { status: 'expired' });
        }

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customerEmail,
          subject: '⚠️ VoxVPN payment failed — action required',
          body: `We were unable to process your VoxVPN subscription payment.\n\nNo charge has been made to your account. Please try again with a different payment method or contact your bank.\n\n👉 Try again: ${Deno.env.get('APP_URL')}/pricing\n\nIf you believe this is an error or need help, contact us at support@voxdigits.com\n\nThank you,\nThe VoxVPN Team`,
        });

        console.log(`Payment failed for ${customerEmail}`);
      }
    }

    // ── 4. Subscription cancelled → revoke access ────────────────────────────
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerEmail = subscription.customer_email ||
        (await stripeClient.customers.retrieve(subscription.customer))?.email;

      if (customerEmail) {
        const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: customerEmail });
        const existing = subs.find(s => s.stripe_subscription_id === subscription.id) || subs[0];
        if (existing) {
          await base44.asServiceRole.entities.VPNSubscription.update(existing.id, { status: 'cancelled' });
          console.log(`Subscription cancelled for ${customerEmail}`);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});