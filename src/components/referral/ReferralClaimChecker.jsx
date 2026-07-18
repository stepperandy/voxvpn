import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  getStoredReferralCode,
  clearStoredReferralCode,
  computeDeviceFingerprint,
} from '@/lib/referralUtils';

/**
 * Invisible component that auto-claims a stored referral code
 * after the user authenticates. Mounted in Layout.
 */
export default function ReferralClaimChecker() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    const claim = async () => {
      const code = getStoredReferralCode();
      if (!code) {
        setDone(true);
        return;
      }

      try {
        const user = await base44.auth.me();
        if (!user) {
          // Not authenticated yet — code stays in localStorage for later
          setDone(true);
          return;
        }

        const deviceFingerprint = await computeDeviceFingerprint();

        await base44.functions.invoke('referralClaim', {
          referral_code: code,
          device_fingerprint: deviceFingerprint,
        });

        clearStoredReferralCode();
      } catch (err) {
        // Silently fail — don't block the user experience
        console.error('Referral claim failed:', err);
      } finally {
        setDone(true);
      }
    };

    claim();
  }, [done]);

  return null;
}