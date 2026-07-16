/**
 * Normalize phone number to strict E.164 format
 * @param {string} number - Raw phone number
 * @returns {string} - E.164 formatted number (+[country][number])
 */
export function normalizeToE164(number) {
  if (!number) return '';
  
  // Remove all non-digit and non-plus characters
  let cleaned = number.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}