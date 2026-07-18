/**
 * BILLING ENGINE
 * Handles wallet deductions and credits with full transaction logging.
 * All rates are resolved from PricingRule table via pricingEngine — NO hardcoded prices.
 *
 * POST body:
 *   action: "charge" | "credit" | "get_rate"
 *   user_email: string
 *   amount?: number (USD, positive) — for charge/credit
 *   category: "call" | "sms" | "esim" | "number_rental" | "renewal" | "top_up" | "refund" | "bonus"
 *   description?: string
 *   reference_id?: string
 *   country_code?: string  — for get_rate
 *   call_type?: "inbound" | "outbound"  — for get_rate
 *   is_reseller?: boolean
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Map billing category → pricing category
function getPricingCategory(category, extra = {}) {
  if (category === 'call') return extra.call_type === 'inbound' ? 'call_inbound' : 'call_outbound';
  if (category === 'sms') return extra.call_type === 'inbound' ? 'sms_inbound' : 'sms_outbound';
  if (category === 'number_rental' || category === 'renewal') return `number_${extra.number_type || 'local'}`;
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, user_email, amount, category, description, reference_id, country_code, call_type, number_type, is_reseller } = body;

    // ── GET RATE (no auth needed — used internally) ────────────────────────
    if (action === 'get_rate') {
      if (!category) return Response.json({ error: 'Missing category' }, { status: 400 });

      const pricingCat = getPricingCategory(category, { call_type, number_type });
      if (!pricingCat) return Response.json({ error: `Cannot resolve pricing category for: ${category}` }, { status: 400 });

      const rateRes = await base44.asServiceRole.functions.invoke('pricingEngine', {
        action: 'lookup',
        category: pricingCat,
        country_code: country_code || '*',
        is_reseller: !!is_reseller,
      });

      return Response.json(rateRes.data || rateRes);
    }

    if (!action || !user_email || !category) {
      return Response.json({ error: 'Missing required fields: action, user_email, category' }, { status: 400 });
    }

    // Get user
    const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
    const user = users?.[0];
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

    const currentBalance = user.credits || 0;

    // ── CHARGE ─────────────────────────────────────────────────────────────
    if (action === 'charge') {
      if (!amount || amount <= 0) return Response.json({ error: 'Amount must be positive' }, { status: 400 });

      if (currentBalance < amount) {
        console.warn(`[billingEngine] Insufficient balance for ${user_email}: has $${currentBalance}, needs $${amount}`);
        return Response.json({ error: 'Insufficient balance', balance: currentBalance, required: amount }, { status: 402 });
      }

      const newBalance = Math.round((currentBalance - amount) * 10000) / 10000;
      await base44.asServiceRole.entities.User.update(user.id, { credits: newBalance });
      await base44.asServiceRole.entities.Transaction.create({
        user_email, type: 'debit', category, amount,
        balance_before: currentBalance, balance_after: newBalance,
        description: description || '', reference_id: reference_id || '', status: 'completed',
      });

      console.log(`[billingEngine] Charged $${amount} from ${user_email}. Balance: $${currentBalance} → $${newBalance}`);

      // Low-balance alerts — fire when balance crosses $5 or $2 threshold
      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (resendKey) {
        if (newBalance <= 5 && currentBalance > 5) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'alerts@voxdigits.com', to: user_email,
                subject: '⚠️ Low Balance Alert – $5 Remaining',
                html: `<h2>Low Balance Alert</h2><p>Your wallet balance is down to <strong>$${newBalance.toFixed(2)}</strong>.</p><p>You can still make calls and send SMS, but consider adding more credit soon.</p><p><a href="https://voxdigits.com/WalletTransactions">Add credit</a></p>`,
              }),
            });
            console.log(`[billingEngine] Sent $5 low-balance alert to ${user_email}`);
          } catch (e) { console.warn('[billingEngine] Alert email failed:', e.message); }
        }
        if (newBalance <= 2 && currentBalance > 2) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'alerts@voxdigits.com', to: user_email,
                subject: '🔴 Critical Balance Alert – $2 Remaining',
                html: `<h2>Critical Balance Alert</h2><p>Your wallet balance is down to <strong>$${newBalance.toFixed(2)}</strong>.</p><p>Outgoing calls and SMS will be blocked when your balance reaches zero. Add credit now to avoid interruption.</p><p><a href="https://voxdigits.com/WalletTransactions">Add credit now</a></p>`,
              }),
            });
            console.log(`[billingEngine] Sent $2 low-balance alert to ${user_email}`);
          } catch (e) { console.warn('[billingEngine] Alert email failed:', e.message); }
        }
      }

      // ── Auto-recharge trigger: if balance dropped below $2 and user has auto-recharge enabled ──
      if (newBalance <= 2 && user.auto_recharge_enabled === true) {
        try {
          console.log(`[billingEngine] Triggering auto-recharge for ${user_email} (balance $${newBalance})`);
          await base44.asServiceRole.functions.invoke('autoRecharge', { user_email });
        } catch (e) {
          console.warn(`[billingEngine] Auto-recharge failed for ${user_email}:`, e.message);
        }
      }

      return Response.json({ success: true, balance: newBalance, charged: amount });

    // ── CREDIT ─────────────────────────────────────────────────────────────
    } else if (action === 'credit') {
      if (!amount || amount <= 0) return Response.json({ error: 'Amount must be positive' }, { status: 400 });

      const newBalance = Math.round((currentBalance + amount) * 10000) / 10000;
      await base44.asServiceRole.entities.User.update(user.id, { credits: newBalance });
      await base44.asServiceRole.entities.Transaction.create({
        user_email, type: 'credit', category, amount,
        balance_before: currentBalance, balance_after: newBalance,
        description: description || '', reference_id: reference_id || '', status: 'completed',
      });

      console.log(`[billingEngine] Credited $${amount} to ${user_email}. Balance: $${currentBalance} → $${newBalance}`);
      return Response.json({ success: true, balance: newBalance, credited: amount });

    } else {
      return Response.json({ error: 'Invalid action. Use: charge, credit, get_rate' }, { status: 400 });
    }

  } catch (error) {
    console.error('[billingEngine] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});