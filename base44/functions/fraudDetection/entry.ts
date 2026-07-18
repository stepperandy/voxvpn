/**
 * Fraud Detection
 * Monitors user activity for suspicious patterns.
 * Creates FraudAlert entities when thresholds are exceeded.
 * Admin-only function.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('[fraudDetection] Starting fraud detection scan');

    const allUsers = await base44.asServiceRole.entities.User.list();
    const today = new Date().toISOString().split('T')[0];
    const last24h = new Date(Date.now() - 86400000).toISOString();

    let alertsCreated = 0;

    for (const userRecord of allUsers) {
      try {
        const email = userRecord.email;

        // 1. Check SMS volume (high inbound = potential spam trap)
        const sms = await base44.asServiceRole.entities.Message.filter({
          created_by: email,
        });
        const smsLast24 = sms.filter(m => m.created_date >= last24h && m.direction === 'outbound');
        if (smsLast24.length > 1000) {
          const existing = await base44.asServiceRole.entities.FraudAlert.filter({
            user_email: email,
            alert_type: 'high_sms_volume',
            status: 'open',
          });
          if (existing.length === 0) {
            await base44.asServiceRole.entities.FraudAlert.create({
              user_email: email,
              alert_type: 'high_sms_volume',
              severity: 'high',
              description: `${smsLast24.length} SMS sent in 24 hours (threshold: 1000)`,
              metric_value: smsLast24.length,
              metric_threshold: 1000,
            });
            alertsCreated++;
            console.log(`[fraudDetection] Alert: High SMS volume for ${email}`);
          }
        }

        // 2. Check call volume
        const calls = await base44.asServiceRole.entities.CallLog.filter({
          user_email: email,
        });
        const callsLast24 = calls.filter(c => c.created_date >= last24h && c.direction === 'outbound');
        if (callsLast24.length > 500) {
          const existing = await base44.asServiceRole.entities.FraudAlert.filter({
            user_email: email,
            alert_type: 'high_call_volume',
            status: 'open',
          });
          if (existing.length === 0) {
            await base44.asServiceRole.entities.FraudAlert.create({
              user_email: email,
              alert_type: 'high_call_volume',
              severity: 'high',
              description: `${callsLast24.length} calls made in 24 hours (threshold: 500)`,
              metric_value: callsLast24.length,
              metric_threshold: 500,
            });
            alertsCreated++;
            console.log(`[fraudDetection] Alert: High call volume for ${email}`);
          }
        }

        // 3. Check rapid spending
        const txns = await base44.asServiceRole.entities.Transaction.filter({
          user_email: email,
        });
        const spendingLast24 = txns
          .filter(t => t.created_date >= last24h && t.type === 'debit')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        if (spendingLast24 > 500) {
          const existing = await base44.asServiceRole.entities.FraudAlert.filter({
            user_email: email,
            alert_type: 'rapid_spending',
            status: 'open',
          });
          if (existing.length === 0) {
            await base44.asServiceRole.entities.FraudAlert.create({
              user_email: email,
              alert_type: 'rapid_spending',
              severity: 'medium',
              description: `$${spendingLast24.toFixed(2)} spent in 24 hours (threshold: $500)`,
              metric_value: spendingLast24,
              metric_threshold: 500,
            });
            alertsCreated++;
            console.log(`[fraudDetection] Alert: Rapid spending for ${email}`);
          }
        }

        // 4. Check failed payment attempts
        const failedTxns = txns.filter(t =>
          t.created_date >= last24h &&
          t.status === 'failed'
        ).length;

        if (failedTxns > 5) {
          const existing = await base44.asServiceRole.entities.FraudAlert.filter({
            user_email: email,
            alert_type: 'multiple_failed_payments',
            status: 'open',
          });
          if (existing.length === 0) {
            await base44.asServiceRole.entities.FraudAlert.create({
              user_email: email,
              alert_type: 'multiple_failed_payments',
              severity: 'medium',
              description: `${failedTxns} failed payment attempts in 24 hours`,
              metric_value: failedTxns,
              metric_threshold: 5,
            });
            alertsCreated++;
            console.log(`[fraudDetection] Alert: Multiple failed payments for ${email}`);
          }
        }
      } catch (err) {
        console.error(`[fraudDetection] Error checking user ${userRecord.email}: ${err.message}`);
      }
    }

    console.log(`[fraudDetection] Completed: ${alertsCreated} new alerts created`);
    return Response.json({ success: true, alertsCreated });

  } catch (error) {
    console.error('[fraudDetection] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});