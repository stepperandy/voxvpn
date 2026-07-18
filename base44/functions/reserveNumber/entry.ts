/**
 * NUMBER PROVISIONING — Step 1: Reserve
 * 
 * Anti-double-assignment: atomically marks inventory record as "reserved"
 * before creating the Stripe session, preventing race conditions.
 * 
 * Flow:
 * 1. Verify number is "available" in inventory
 * 2. Atomically set status = "reserved" + reserved_for + reserved_at
 * 3. Create NumberOrder
 * 4. Create Stripe Checkout session
 * 5. Return checkout URL
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

const RESERVATION_TTL_MINUTES = 30;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      phone_number, provider_number_id, country_code, number_type = 'local',
      provider = 'twilio', monthly_fee, setup_fee = 0, city, inventory_id
    } = await req.json();

    if (!phone_number || !country_code || !monthly_fee) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Anti-double-assignment: find & lock inventory record ──────────────
    let invRecord = null;

    if (inventory_id) {
      const records = await base44.asServiceRole.entities.NumberInventory.filter({ id: inventory_id });
      invRecord = records?.[0];
    } else {
      const records = await base44.asServiceRole.entities.NumberInventory.filter({ phone_number });
      invRecord = records?.[0];
    }

    if (invRecord) {
      // Check if already reserved/assigned by someone else
      if (invRecord.status === 'reserved') {
        // Check if reservation is stale
        const ageMin = invRecord.reserved_at
          ? (Date.now() - new Date(invRecord.reserved_at).getTime()) / 60000
          : 999;
        if (ageMin < RESERVATION_TTL_MINUTES && invRecord.reserved_for !== user.email) {
          return Response.json({ error: 'Number is currently reserved by another user. Please try a different number.' }, { status: 409 });
        }
      }
      if (invRecord.status === 'assigned') {
        return Response.json({ error: 'Number is already assigned.' }, { status: 409 });
      }
      if (['suspended', 'released', 'expired'].includes(invRecord.status)) {
        return Response.json({ error: `Number is not available (status: ${invRecord.status}).` }, { status: 409 });
      }

      // Lock it immediately
      await base44.asServiceRole.entities.NumberInventory.update(invRecord.id, {
        status: 'reserved',
        reserved_for: user.email,
        reserved_at: new Date().toISOString(),
      });
    }

    // ── Create NumberOrder ────────────────────────────────────────────────
    const order = await base44.asServiceRole.entities.NumberOrder.create({
      user_email: user.email,
      phone_number,
      country_code,
      number_type,
      provider,
      provider_number_id: provider_number_id || phone_number,
      monthly_fee,
      setup_fee,
      status: 'pending_payment',
    });

    // ── Stripe Checkout ───────────────────────────────────────────────────
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const appUrl = Deno.env.get('BASE44_PUBLIC_URL') || 'https://app.voxdigits.com';

    const lineItems = [];
    if (setup_fee > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `Number Setup Fee — ${phone_number}` },
          unit_amount: Math.round(setup_fee * 100),
        },
        quantity: 1,
      });
    }
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Virtual Number — ${phone_number}`,
          description: `${country_code} ${number_type} · ${city || ''} · $${monthly_fee}/month`,
        },
        unit_amount: Math.round(monthly_fee * 100),
        recurring: { interval: 'month' },
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: lineItems,
      success_url: `${appUrl}/ServicesDashboard?number_order=${order.id}&success=1`,
      cancel_url: `${appUrl}/VirtualNumbers?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + (RESERVATION_TTL_MINUTES * 60),
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        order_id: order.id,
        user_email: user.email,
        phone_number,
        provider,
        provider_number_id: provider_number_id || phone_number,
        country_code,
        number_type,
        inventory_id: invRecord?.id || '',
      },
    });

    await base44.asServiceRole.entities.NumberOrder.update(order.id, {
      stripe_session_id: session.id,
    });

    console.log(`[reserveNumber] Reserved ${phone_number} for ${user.email}, order: ${order.id}`);
    return Response.json({ success: true, order_id: order.id, checkout_url: session.url });

  } catch (error) {
    console.error('[reserveNumber] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});