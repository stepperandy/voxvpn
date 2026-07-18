/**
 * Process Subscription Renewals
 * Runs daily to auto-renew subscriptions.
 * Charges via Stripe (subscription auto-renewal) or wallet deduction.
 * Admin-only function.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Allow both: admin users calling manually, and scheduler (no user context)
    const user = await base44.auth.me().catch(() => null);
    if (user !== null && user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('[processSubscriptionRenewals] Starting renewal cycle');

    // Find all active subscriptions due for renewal
    const subs = await base44.asServiceRole.entities.Subscription.filter({
      status: 'active',
    });

    const today = new Date().toISOString().split('T')[0];
    const dueSubs = subs.filter(s => s.current_period_end && s.current_period_end <= today);

    console.log(`[processSubscriptionRenewals] Found ${dueSubs.length} subscriptions due for renewal`);

    let renewed = 0;
    let failed = 0;

    for (const sub of dueSubs) {
      try {
        // If Stripe subscription exists, Stripe handles it automatically
        // Otherwise, deduct from wallet
        if (sub.stripe_subscription_id) {
          console.log(`[processSubscriptionRenewals] Stripe will auto-renew: ${sub.stripe_subscription_id}`);
          renewed++;
        } else {
          // Deduct from user's wallet
          const userList = await base44.asServiceRole.entities.User.filter({ email: sub.user_email });
          const userRecord = userList?.[0];

          if (!userRecord) {
            console.warn(`[processSubscriptionRenewals] User not found: ${sub.user_email}`);
            failed++;
            continue;
          }

          const balance = userRecord.credits || 0;
          const amount = parseFloat(sub.amount) || 0;

          if (balance < amount) {
            // Insufficient funds - mark past due
            await base44.asServiceRole.entities.Subscription.update(sub.id, {
              status: 'past_due',
              failed_payment_count: (sub.failed_payment_count || 0) + 1,
            });
            console.warn(`[processSubscriptionRenewals] Insufficient funds for ${sub.user_email}: need $${amount}, have $${balance}`);
            failed++;
            continue;
          }

          // Deduct from wallet
          await base44.asServiceRole.functions.invoke('billingEngine', {
            action: 'charge',
            user_email: sub.user_email,
            amount,
            category: 'number_rental',
            description: `Auto-renewal: ${sub.phone_number}`,
            reference_id: sub.id,
          });

          // Update subscription renewal date
          const nextRenewal = new Date();
          const billingCycle = sub.billing_cycle === 'yearly' ? 365 : 30;
          nextRenewal.setDate(nextRenewal.getDate() + billingCycle);

          await base44.asServiceRole.entities.Subscription.update(sub.id, {
            current_period_start: today,
            current_period_end: nextRenewal.toISOString().split('T')[0],
            last_renewal_at: new Date().toISOString(),
            failed_payment_count: 0,
          });

          console.log(`[processSubscriptionRenewals] Renewed ${sub.phone_number} for ${sub.user_email}`);
          renewed++;
        }
      } catch (err) {
        console.error(`[processSubscriptionRenewals] Error renewing ${sub.id}: ${err.message}`);
        failed++;

        // Send failure notification
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: sub.user_email,
            subject: 'Subscription Renewal Failed',
            body: `Your virtual number subscription renewal for ${sub.phone_number} failed. Please update your billing method or add wallet credit to continue.`,
            from_name: 'VoxDigits',
          });
        } catch (mailErr) {
          console.error(`[processSubscriptionRenewals] Failed to send email: ${mailErr.message}`);
        }
      }
    }

    console.log(`[processSubscriptionRenewals] Completed: ${renewed} renewed, ${failed} failed`);
    return Response.json({ success: true, renewed, failed, total: dueSubs.length });

  } catch (error) {
    console.error('[processSubscriptionRenewals] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});