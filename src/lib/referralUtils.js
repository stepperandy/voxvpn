/**
 * Referral utilities — device fingerprinting, localStorage persistence, and URL param handling.
 */

const STORAGE_KEY = 'pending_referral_code';

/**
 * Read referral code from URL (?ref=CODE) or localStorage.
 * If found in URL, stores it and cleans the URL.
 */
export function getStoredReferralCode() {
  // Check URL first
  const params = new URLSearchParams(window.location.search);
  const urlCode = params.get('ref');
  if (urlCode) {
    const code = urlCode.toUpperCase();
    localStorage.setItem(STORAGE_KEY, code);
    // Clean the URL so the param doesn't persist across navigation
    window.history.replaceState({}, '', window.location.pathname);
    return code;
  }
  return localStorage.getItem(STORAGE_KEY);
}

export function clearStoredReferralCode() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Compute a SHA-256 device fingerprint from browser characteristics.
 * Used for fraud detection (duplicate device check).
 */
export async function computeDeviceFingerprint() {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(navigator.hardwareConcurrency || 'unknown'),
    String(navigator.deviceMemory || 'unknown'),
  ];
  const str = components.join('|');
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}