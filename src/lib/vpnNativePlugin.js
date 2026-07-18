/**
 * vpnNativePlugin.js
 *
 * Thin wrapper around the native VoxVpnPlugin Capacitor plugin.
 * On web/browser it falls back to a mock so the UI still works in the browser preview.
 *
 * Native plugin source: android/app/src/main/java/net/voxvpn/mobile/VoxVpnPlugin.kt
 */

import { registerPlugin } from '@capacitor/core';

// Register the native plugin — Capacitor will find VoxVpnPlugin on Android
const VoxVpnNative = registerPlugin('VoxVpnPlugin', {
  // Web fallback: used in browser/Vite preview — simulates the native API
  web: () => import('./vpnNativePluginWebFallback').then(m => new m.VoxVpnPluginWeb()),
});

export default VoxVpnNative;

/**
 * SERVER CONFIG MAP
 * Maps display name → .ovpn filename (without extension).
 * These files must exist in android/app/src/main/assets/configs/
 */
export const SERVER_CONFIG_MAP = [
  { name: 'Amsterdam',      flag: '🇳🇱', config: 'amsterdam',      country: 'Netherlands' },
  { name: 'Atlanta',        flag: '🇺🇸', config: 'us-ny',          country: 'United States' },
  { name: 'Chicago',        flag: '🇺🇸', config: 'chicago',        country: 'United States' },
  { name: 'Frankfurt',      flag: '🇩🇪', config: 'de-fra',         country: 'Germany' },
  { name: 'Johannesburg',   flag: '🇿🇦', config: 'za-jnb',         country: 'South Africa' },
  { name: 'London',         flag: '🇬🇧', config: 'gb-lon',         country: 'United Kingdom' },
  { name: 'Los Angeles',    flag: '🇺🇸', config: 'us-la',          country: 'United States' },
  { name: 'Madrid',         flag: '🇪🇸', config: 'fr-par',         country: 'Spain' },
  { name: 'Manchester',     flag: '🇬🇧', config: 'gb-lon',         country: 'United Kingdom' },
  { name: 'Melbourne',      flag: '🇦🇺', config: 'au-syd',         country: 'Australia' },
  { name: 'Miami',          flag: '🇺🇸', config: 'us-la',          country: 'United States' },
  { name: 'Milan',          flag: '🇮🇹', config: 'de-fra',         country: 'Italy' },
  { name: 'New Jersey',     flag: '🇺🇸', config: 'newjersey',      country: 'United States' },
  { name: 'Paris',          flag: '🇫🇷', config: 'fr-par',         country: 'France' },
  { name: 'Seattle',        flag: '🇺🇸', config: 'us-la',          country: 'United States' },
  { name: 'Silicon Valley', flag: '🇺🇸', config: 'us-la',          country: 'United States' },
  { name: 'Singapore',      flag: '🇸🇬', config: 'singapore',      country: 'Singapore' },
  { name: 'Sydney',         flag: '🇦🇺', config: 'au-syd',         country: 'Australia' },
  { name: 'Tokyo',          flag: '🇯🇵', config: 'jp-tyo',         country: 'Japan' },
  { name: 'Toronto',        flag: '🇨🇦', config: 'ca-tor',         country: 'Canada' },
];