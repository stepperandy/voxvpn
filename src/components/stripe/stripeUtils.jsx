/**
 * Check if app is running inside an iframe
 */
export function isRunningInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // Assume iframe if there's an error checking
  }
}

/**
 * Safely redirects to Stripe Checkout.
 * Blocks checkout if running in iframe, validates session ID, and redirects to Stripe payment page.
 */
export async function redirectToStripeCheckout(sessionId) {
  // Block checkout if running inside iframe
  if (isRunningInIframe()) {
    const message = 'Checkout only works from the published app. Please visit the app directly to complete your purchase.';
    alert(message);
    console.warn('Iframe checkout blocked:', message);
    throw new Error(message);
  }

  if (!sessionId) {
    throw new Error('Stripe checkout session failed - no session ID');
  }

  // Redirect to Stripe checkout
  window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
}