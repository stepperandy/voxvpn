import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

/**
 * upgradeSubscription — Item 8
 * Handles plan upgrade eligibility checks and initiates the upgrade payment.
 *
 * POST body:
 *   { action: "check" | "upgrade", target_plan: "Premium", billing_cycle: "monthly" | "yearly" }
 *
 * "check"   → returns eligibility, current plan, pricing diff, and Stripe upgrade details
 * "upgrade" → creates a Stripe Checkout session for the new plan
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Prices match the pricing page exactly
const PLAN_PRICES = {
  'Basic':      { monthly: 3.99,  yearly: 2.49  },   // yearly billed as $29.88/yr
  'Standard':   { monthly: 6.99,  yearly: 4.49  },   // yearly billed as $53.88/yr
  'Premium':    { monthly: 9.99,  yearly: 6.49  },   // yearly billed as $77.88/yr
  'Advanced':   { monthly: 14.99, yearly: 9.99  },   // yearly billed as $119.88/yr
  'Enterprise': { monthly: 29.99, yearly: 19.99 },   // yearly billed as $239.88/yr
};

const PLAN_ORDER = ['Free Trial', 'Basic', 'Standard', 'Advanced', 'Premium', 'Enterprise'];

const APP_URL = Deno.env.get('APP_URL') || 'https://voxvpn.net';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });

    const body = await req.json().catch(() => ({}));
    const { action = 'check', target_plan, billing_cycle = 'monthly' } = body;

    if (!target_plan) {
      return Response.json({ error: 'target_plan is required.' }, { status: 400, headers: CORS });
    }

    // Load current subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const currentSub = subs?.find(s => ['active', 'trial'].includes(s.status));

    const currentPlan  = currentSub?.plan || 'Free Trial';
    const currentIndex = PLAN_ORDER.indexOf(currentPlan);
    const targetIndex  = PLAN_ORDER.indexOf(target_plan);

    if (targetIndex === -1) {
      return Response.json({ error: `Unknown plan: ${target_plan}` }, { status: 400, headers: CORS });
    }

    const isUpgrade   = targetIndex > currentIndex;
    const isDowngrade = targetIndex < currentIndex;
    const isSamePlan  = targetIndex === currentIndex;

    const currentPrice = PLAN_PRICES[currentPlan]?.[billing_cycle] || 0;
    const targetPrice  = PLAN_PRICES[target_plan]?.[billing_cycle] || 0;
    const priceDiff    = parseFloat((targetPrice - currentPrice).toFixed(2));

    // ── CHECK mode ─────────────────────────────────────────────────────
    if (action === 'check') {
      return Response.json({
        current_plan: currentPlan,
        current_status: currentSub?.status || 'none',
        target_plan,
        billing_cycle,
        is_upgrade: isUpgrade,
        is_downgrade: isDowngrade,
        is_same_plan: isSamePlan,
        eligible: isUpgrade,
        current_price: currentPrice,
        target_price: targetPrice,
        price_difference: priceDiff,
        renewal_date: currentSub?.renewal_date || null,
        message: isUpgrade
          ? `You can upgrade from ${currentPlan} to ${target_plan} for $${targetPrice}/${billing_cycle === 'yearly' ? 'yr' : 'mo'}.`
          : isDowngrade
          ? `Downgrades take effect at next renewal. Current plan active until ${currentSub?.renewal_date || 'renewal'}.`
          : 'You are already on this plan.',
      }, { headers: CORS });
    }

    // ── UPGRADE mode ───────────────────────────────────────────────────
    if (!isUpgrade) {
      return Response.json({
        error: isSamePlan
          ? 'You are already on this plan.'
          : 'Downgrades are not processed via this endpoint. Contact support.',
      }, { status: 400, headers: CORS });
    }

    // Route through the same createStripeCheckout gateway used on the pricing page
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `VoxVPN ${target_plan}`,
            description: `VoxVPN ${target_plan} plan — billed ${billing_cycle}`,
          },
          unit_amount: Math.round(targetPrice * 100),
          recurring: { interval: billing_cycle === 'yearly' ? 'year' : 'month' },
        },
        quantity: 1,
      }],
      metadata: {
        user_email: user.email,
        plan: target_plan,
        billing_cycle,
        action: 'upgrade',
        current_plan: currentPlan,
      },
      success_url: `${APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&upgrade=1`,
      cancel_url:  `${APP_URL}/pricing?upgrade=cancelled`,
    });

    return Response.json({
      success: true,
      checkout_url: session.url,
      target_plan,
      billing_cycle,
      price: targetPrice,
    }, { headers: CORS });

  } catch (error) {
    console.error('upgradeSubscription error:', error.message);
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
});