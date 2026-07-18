/**
 * NUMBER INVENTORY SYNC
 * Currently handles:
 * - Releasing reserved numbers that were never paid (>30 min old)
 * 
 * NOTE: Numbers are provisioned directly via Twilio on purchase.
 * No inventory caching needed (Twilio handles availability).
 * 
 * TODO: Add backup provider (e.g., Vonage, Voicebase, etc.)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const RESERVATION_TTL_MINUTES = 30;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const results = { released: 0, errors: [] };

    // Release stale reservations
    const allInventory = await base44.asServiceRole.entities.NumberInventory.list('-created_date', 2000);
    const staleReserved = allInventory.filter(n => {
      if (n.status !== 'reserved') return false;
      if (!n.reserved_at) return true;
      const age = (Date.now() - new Date(n.reserved_at).getTime()) / 60000;
      return age > RESERVATION_TTL_MINUTES;
    });

    for (const n of staleReserved) {
      await base44.asServiceRole.entities.NumberInventory.update(n.id, {
        status: 'available',
        reserved_for: null,
        reserved_at: null,
      });
      results.released++;
    }

    console.log(`[syncInventory] Released ${results.released} stale reservations`);
    return Response.json({ success: true, ...results });

  } catch (error) {
    console.error('[syncInventory] Fatal:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});