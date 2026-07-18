import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'VOX-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const REWARD_VERIFIED = 1;
const MILESTONE_REWARD = 5;
const MILESTONE_THRESHOLD = 3;
const AMBASSADOR_BONUS = 10;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ── Get or generate referral code ──
    let referral_code = user.referral_code;
    if (!referral_code) {
      for (let attempt = 0; attempt < 10; attempt++) {
        const code = generateReferralCode();
        const existing = await base44.asServiceRole.entities.User.filter({ referral_code: code });
        if (!existing || existing.length === 0) {
          referral_code = code;
          await base44.asServiceRole.entities.User.update(user.id, { referral_code: code });
          break;
        }
      }
    }

    // ── User's own referrals ──
    const myReferrals = await base44.asServiceRole.entities.Referral.filter({ referrer_email: user.email }, '-created_date', 200);

    const verifiedCount = (myReferrals || []).filter(r => r.status === 'verified' || r.status === 'activated').length;
    const activatedCount = (myReferrals || []).filter(r => r.status === 'activated').length;
    const fraudCount = (myReferrals || []).filter(r => r.status === 'fraud_flagged').length;

    // Credits earned = verified referrals * $1 + floor(activated / 3) * $5
    const creditsEarned = verifiedCount * REWARD_VERIFIED + Math.floor(activatedCount / MILESTONE_THRESHOLD) * MILESTONE_REWARD;

    // ── Leaderboard: top 20 by activated referral count ──
    const allActivated = await base44.asServiceRole.entities.Referral.filter({ status: 'activated' }, '-created_date', 500);

    const referrerCounts: Record<string, number> = {};
    for (const r of allActivated || []) {
      referrerCounts[r.referrer_email] = (referrerCounts[r.referrer_email] || 0) + 1;
    }

    const leaderboard = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([email, count], i) => ({ rank: i + 1, email, activated_count: count }));

    const myRank = leaderboard.findIndex(l => l.email === user.email);

    return Response.json({
      referral_code,
      current_email: user.email,
      stats: {
        total: (myReferrals || []).length,
        verified: verifiedCount,
        activated: activatedCount,
        fraud: fraudCount,
        credits_earned: creditsEarned,
        rank: myRank >= 0 ? myRank + 1 : null,
      },
      leaderboard,
      tiers: {
        verified_reward: REWARD_VERIFIED,
        milestone_threshold: MILESTONE_THRESHOLD,
        milestone_reward: MILESTONE_REWARD,
        ambassador_bonus: AMBASSADOR_BONUS,
      },
    });
  } catch (error) {
    console.error('[referralStats] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});