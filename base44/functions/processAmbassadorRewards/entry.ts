import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const AMBASSADOR_BONUS = 10;  // $10 monthly credit per ambassador
const TOP_N = 20;

// Scheduled monthly — credits the top 20 ambassadors by activated referral count.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only (allows direct admin invocation; scheduler runs with service-role)
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = !user || user.role === 'admin';
    } catch {
      isAdmin = true; // No user context = scheduled task
    }
    if (!isAdmin) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Get all activated referrals
    const allActivated = await base44.asServiceRole.entities.Referral.filter({ status: 'activated' }, '-created_date', 1000);

    // Count by referrer
    const referrerCounts: Record<string, number> = {};
    for (const r of allActivated || []) {
      referrerCounts[r.referrer_email] = (referrerCounts[r.referrer_email] || 0) + 1;
    }

    // Top N ambassadors
    const topAmbassadors = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N);

    const results: Array<{ email: string; count: number; credited: number }> = [];

    for (const [email, count] of topAmbassadors) {
      const users = await base44.asServiceRole.entities.User.filter({ email });
      if (!users || users.length === 0) continue;

      const referrer = users[0];
      const currentCredits = referrer.credits || 0;
      const newBalance = currentCredits + AMBASSADOR_BONUS;

      await base44.asServiceRole.entities.User.update(referrer.id, { credits: newBalance });

      await base44.asServiceRole.entities.Transaction.create({
        user_email: email,
        type: 'credit',
        category: 'bonus',
        amount: AMBASSADOR_BONUS,
        balance_before: currentCredits,
        balance_after: newBalance,
        description: `Top ${TOP_N} Ambassador monthly reward - ${count} activated referrals`,
        status: 'completed',
      });

      results.push({ email, count, credited: AMBASSADOR_BONUS });
    }

    console.log(`[processAmbassadorRewards] Rewarded ${results.length} ambassadors`);
    return Response.json({ success: true, ambassadors_rewarded: results.length, results });
  } catch (error) {
    console.error('[processAmbassadorRewards] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});