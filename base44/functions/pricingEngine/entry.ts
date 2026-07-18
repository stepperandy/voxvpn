/**
 * PRICING ENGINE
 * Single source of truth for all prices.
 * 
 * Actions:
 *   lookup   — get sell_price/buy_cost for a category+country (optionally for a reseller)
 *   seed     — insert default pricing rules if none exist (admin only)
 *   list     — return all active rules (admin only)
 *
 * Lookup priority:
 *   1. Exact country match (e.g. category=number_local, country=US)
 *   2. Global wildcard (country=*)
 *
 * POST { action: "lookup", category, country_code, is_reseller? }
 * POST { action: "seed" }   (admin only)
 * POST { action: "list" }   (admin only)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ── Default pricing table ────────────────────────────────────────────────────
// buy_cost = provider cost  |  sell_price = customer price  |  reseller_price = reseller price
const DEFAULT_RULES = [
  // ── Number Monthly Fees ──────────────────────────────────────────────────
  { name: "US Local DID", category: "number_local",    country_code: "US", buy_cost: 1.20, sell_price: 4.99, reseller_price: 3.50, activation_fee: 0, activation_cost: 0 },
  { name: "CA Local DID", category: "number_local",    country_code: "CA", buy_cost: 1.50, sell_price: 5.99, reseller_price: 4.00, activation_fee: 0, activation_cost: 0 },
  { name: "GB Local DID", category: "number_local",    country_code: "GB", buy_cost: 1.80, sell_price: 6.99, reseller_price: 4.99, activation_fee: 0, activation_cost: 0 },
  { name: "AU Local DID", category: "number_local",    country_code: "AU", buy_cost: 2.00, sell_price: 7.99, reseller_price: 5.99, activation_fee: 0, activation_cost: 0 },
  { name: "DE Local DID", category: "number_local",    country_code: "DE", buy_cost: 1.60, sell_price: 5.99, reseller_price: 4.50, activation_fee: 0, activation_cost: 0 },
  { name: "FR Local DID", category: "number_local",    country_code: "FR", buy_cost: 1.60, sell_price: 5.99, reseller_price: 4.50, activation_fee: 0, activation_cost: 0 },
  { name: "NL Local DID", category: "number_local",    country_code: "NL", buy_cost: 1.50, sell_price: 5.99, reseller_price: 4.50, activation_fee: 0, activation_cost: 0 },
  { name: "SE Local DID", category: "number_local",    country_code: "SE", buy_cost: 1.50, sell_price: 5.99, reseller_price: 4.50, activation_fee: 0, activation_cost: 0 },
  { name: "ES Local DID", category: "number_local",    country_code: "ES", buy_cost: 2.00, sell_price: 6.99, reseller_price: 5.00, activation_fee: 0, activation_cost: 0 },
  { name: "IT Local DID", category: "number_local",    country_code: "IT", buy_cost: 2.00, sell_price: 6.99, reseller_price: 5.00, activation_fee: 0, activation_cost: 0 },
  { name: "Global DID",   category: "number_local",    country_code: "*",  buy_cost: 2.00, sell_price: 6.99, reseller_price: 5.00, activation_fee: 0, activation_cost: 0 },

  // ── Toll-Free ────────────────────────────────────────────────────────────
  { name: "US Toll-Free", category: "number_tollfree", country_code: "US", buy_cost: 2.00, sell_price: 9.99, reseller_price: 7.50, activation_fee: 0, activation_cost: 0 },
  { name: "Global Toll-Free", category: "number_tollfree", country_code: "*", buy_cost: 3.00, sell_price: 12.99, reseller_price: 9.99, activation_fee: 0, activation_cost: 0 },

  // ── Mobile ───────────────────────────────────────────────────────────────
  { name: "US Mobile",    category: "number_mobile",   country_code: "US", buy_cost: 1.50, sell_price: 6.99, reseller_price: 5.00, activation_fee: 0, activation_cost: 0 },
  { name: "Global Mobile", category: "number_mobile",  country_code: "*",  buy_cost: 2.50, sell_price: 8.99, reseller_price: 6.99, activation_fee: 0, activation_cost: 0 },

  // ── Activation Fees ──────────────────────────────────────────────────────
  { name: "US Activation", category: "number_activation", country_code: "US", buy_cost: 0, sell_price: 0, reseller_price: 0, activation_fee: 0, activation_cost: 0 },
  { name: "Global Activation", category: "number_activation", country_code: "*", buy_cost: 1.00, sell_price: 2.99, reseller_price: 1.99, activation_fee: 2.99, activation_cost: 1.00 },

  // ── Outbound Calls ───────────────────────────────────────────────────────
  { name: "US Outbound Call", category: "call_outbound", country_code: "US", buy_cost: 0.01, sell_price: 0.03, reseller_price: 0.025, billing_increment_secs: 60, min_charge_secs: 60, profit_margin_pct: 40 },
  { name: "CA Outbound Call", category: "call_outbound", country_code: "CA", buy_cost: 0.015, sell_price: 0.04, reseller_price: 0.035, billing_increment_secs: 60, min_charge_secs: 60, profit_margin_pct: 40 },
  { name: "GB Outbound Call", category: "call_outbound", country_code: "GB", buy_cost: 0.02, sell_price: 0.05, reseller_price: 0.045, billing_increment_secs: 60, min_charge_secs: 60, profit_margin_pct: 40 },
  { name: "AU Outbound Call", category: "call_outbound", country_code: "AU", buy_cost: 0.025, sell_price: 0.06, reseller_price: 0.055, billing_increment_secs: 60, min_charge_secs: 60, profit_margin_pct: 40 },
  { name: "EU Outbound Call", category: "call_outbound", country_code: "DE", buy_cost: 0.02, sell_price: 0.05, reseller_price: 0.045, billing_increment_secs: 60, min_charge_secs: 60, profit_margin_pct: 40 },
  { name: "Global Outbound Call", category: "call_outbound", country_code: "*", buy_cost: 0.010, sell_price: 0.014, reseller_price: 0.012, billing_increment_secs: 60, min_charge_secs: 60, profit_margin_pct: 40, notes: "Provider cost + 40% margin" },

  // ── Inbound Calls ────────────────────────────────────────────────────────
  { name: "US Inbound Call",  category: "call_inbound", country_code: "US", buy_cost: 0.001, sell_price: 0.008, reseller_price: 0.006, billing_increment_secs: 60, min_charge_secs: 60 },
  { name: "Global Inbound Call", category: "call_inbound", country_code: "*", buy_cost: 0.002, sell_price: 0.010, reseller_price: 0.008, billing_increment_secs: 60, min_charge_secs: 60 },

  // ── SMS ──────────────────────────────────────────────────────────────────
  { name: "US Outbound SMS", category: "sms_outbound", country_code: "US", buy_cost: 0.005, sell_price: 0.03, reseller_price: 0.025 },
  { name: "CA Outbound SMS", category: "sms_outbound", country_code: "CA", buy_cost: 0.015, sell_price: 0.04, reseller_price: 0.035 },
  { name: "GB Outbound SMS", category: "sms_outbound", country_code: "GB", buy_cost: 0.02, sell_price: 0.05, reseller_price: 0.045 },
  { name: "AU Outbound SMS", category: "sms_outbound", country_code: "AU", buy_cost: 0.025, sell_price: 0.06, reseller_price: 0.055 },
  { name: "Global Outbound SMS", category: "sms_outbound", country_code: "*", buy_cost: 0.005, sell_price: 0.007, reseller_price: 0.006, notes: "Provider cost + 40% margin" },
  { name: "US Inbound SMS",  category: "sms_inbound",  country_code: "US", buy_cost: 0.001, sell_price: 0.005, reseller_price: 0.004 },
  { name: "Global Inbound SMS", category: "sms_inbound", country_code: "*", buy_cost: 0.001, sell_price: 0.005, reseller_price: 0.004 },

  // ── eSIM Data Markup ─────────────────────────────────────────────────────
  { name: "eSIM Global Markup", category: "esim_data", country_code: "*", buy_cost: 0, sell_price: 0, reseller_price: 0, notes: "Markup applied as percentage on top of Airalo cost — set buy_cost=0, sell_price=markup_pct e.g. 0.30 = 30%" },
];

// ── Resolve a rule ────────────────────────────────────────────────────────────
function resolveRule(rules, category, country_code) {
  const active = rules.filter(r => r.category === category && r.is_active !== false);
  // Exact country match first
  const exact = active.find(r => r.country_code === country_code);
  if (exact) return exact;
  // Wildcard fallback
  return active.find(r => r.country_code === '*') || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    // ── LIST (admin only) ──────────────────────────────────────────────────
    if (action === 'list') {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      const rules = await base44.asServiceRole.entities.PricingRule.list('-created_date', 500);
      return Response.json({ success: true, rules });
    }

    // ── SEED (admin only) ──────────────────────────────────────────────────
    if (action === 'seed') {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      const existing = await base44.asServiceRole.entities.PricingRule.list('-created_date', 1);
      if (existing.length > 0) {
        return Response.json({ success: true, message: 'Already seeded', count: existing.length });
      }

      let created = 0;
      for (const rule of DEFAULT_RULES) {
        await base44.asServiceRole.entities.PricingRule.create({ ...rule, is_active: true });
        created++;
      }
      console.log(`[pricingEngine] Seeded ${created} pricing rules`);
      return Response.json({ success: true, created });
    }

    // ── LOOKUP ─────────────────────────────────────────────────────────────
    if (action === 'lookup') {
      const { category, country_code = '*', is_reseller = false } = body;
      if (!category) return Response.json({ error: 'Missing category' }, { status: 400 });

      const rules = await base44.asServiceRole.entities.PricingRule.list('-created_date', 500);
      const rule = resolveRule(rules, category, country_code);

      if (!rule) {
        console.warn(`[pricingEngine] No rule found for ${category}/${country_code}`);
        return Response.json({ error: `No pricing rule for ${category}/${country_code}` }, { status: 404 });
      }

      const price = is_reseller && rule.reseller_price != null
        ? rule.reseller_price
        : rule.sell_price;

      return Response.json({
        success: true,
        rule_id: rule.id,
        category: rule.category,
        country_code: rule.country_code,
        buy_cost: rule.buy_cost || 0,
        sell_price: price,
        activation_fee: is_reseller ? (rule.reseller_price != null ? rule.activation_fee * 0.8 : rule.activation_fee) : (rule.activation_fee || 0),
        activation_cost: rule.activation_cost || 0,
        billing_increment_secs: rule.billing_increment_secs || 6,
        min_charge_secs: rule.min_charge_secs || 6,
        margin: rule.buy_cost > 0 ? Math.round((1 - rule.buy_cost / (rule.sell_price || 1)) * 100) : null,
      });
    }

    // ── BATCH LOOKUP ───────────────────────────────────────────────────────
    if (action === 'batch_lookup') {
      const { lookups = [], is_reseller = false } = body; // [{category, country_code}]
      const rules = await base44.asServiceRole.entities.PricingRule.list('-created_date', 500);
      const results = {};
      for (const { category, country_code = '*' } of lookups) {
        const rule = resolveRule(rules, category, country_code);
        if (rule) {
          results[`${category}/${country_code}`] = {
            buy_cost: rule.buy_cost || 0,
            sell_price: is_reseller && rule.reseller_price != null ? rule.reseller_price : rule.sell_price,
            activation_fee: rule.activation_fee || 0,
            billing_increment_secs: rule.billing_increment_secs || 6,
          };
        }
      }
      return Response.json({ success: true, results });
    }

    return Response.json({ error: 'Invalid action. Use: lookup, batch_lookup, list, seed' }, { status: 400 });

  } catch (error) {
    console.error('[pricingEngine] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});