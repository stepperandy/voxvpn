import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MILESTONE_THRESHOLD = 3;   // Every 3 activated referrals
const MILESTONE_REWARD = 5;       // $5 credit

// Called by entity automation on Transaction creation (or manually).
// Marks the referred user's referral as "activated" and checks milestone rewards.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Support both direct calls { user_email } and entity automation { data: { user_email, ... } }
    const data = body.data || body;
    const user_email = data.user_email;
    const txnCategory = data.category;

    if (!user_email) {
      return Response.json({ error: 'user_email required' }, { status: 400 });
    }

    // Skip referral reward transactions (prevent infinite loop)
    if (txnCategory === 'bonus') {
      return Response.json({ message: 'Skipping bonus transaction' });
    }

    // Find referral for this user
    const referrals = await base44.asServiceRole.entities.Referral.filter({ referred_email: user_email });
    if (!referrals || referrals.length === 0) {
      return Response.json({ message: 'No referral found for this user' });
    }

    const referral = referrals[0];

    // Already activated — idempotent
    if (referral.status === 'activated') {
      return Response.json({ message: 'Already activated' });
    }

    // Must be verified first
    if (referral.status !== 'verified') {
      return Response.json({ message: `Referral not in verified state (current: ${referral.status})` });
    }

    // Activate the referral
    await base44.asServiceRole.entities.Referral.update(referral.id, {
      status: 'activated',
      activated_at: new Date().toISOString(),
    });

    // Check milestone: every 3 activated referrals = $5
    const allActivated = await base44.asServiceRole.entities.Referral.filter({
      referrer_email: referral.referrer_email,
      status: 'activated',
    });
    const activatedCount = allActivated.length;

    if (activatedCount > 0 && activatedCount % MILESTONE_THRESHOLD === 0) {
      const referrers = await base44.asServiceRole.entities.User.filter({ email: referral.referrer_email });
      if (referrers && referrers.length > 0) {
        const referrer = referrers[0];
        const referrerCredits = referrer.credits || 0;
        const newBalance = referrerCredits + MILESTONE_REWARD;

        await base44.asServiceRole.entities.User.update(referrer.id, { credits: newBalance });

        await base44.asServiceRole.entities.Transaction.create({
          user_email: referral.referrer_email,
          type: 'credit',
          category: 'bonus',
          amount: MILESTONE_REWARD,
          balance_before: referrerCredits,
          balance_after: newBalance,
          description: `Referral milestone - ${activatedCount} activated referrals`,
          status: 'completed',
        });

        console.log(`[referralActivate] Milestone: ${referrer.email} reached ${activatedCount} activations, credited $${MILESTONE_REWARD}`);
      }
    }

    return Response.json({ success: true, activated_count: activatedCount });
  } catch (error) {
    console.error('[referralActivate] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});