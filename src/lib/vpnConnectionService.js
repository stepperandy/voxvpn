// VPN Connection Service
// Simulated for now — replace internals with real native VPN calls when ready.

const STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
};

let _currentState = STATES.IDLE;
let _connectedServer = null;

/**
 * Simulate connecting to a VPN server.
 * @param {object} server - Server object from VPN_SERVERS
 * @param {string} config - OpenVPN config string from VPN_CONFIGS
 * @returns {Promise<{success: boolean, state: string, server: object|null}>}
 */
export async function connectToVpn(server, config) {
  _currentState = STATES.CONNECTING;

  // Simulate async connection handshake (replace with real VPN call)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate success (replace with real result check)
  _currentState = STATES.CONNECTED;
  _connectedServer = server;

  return { success: true, state: _currentState, server: _connectedServer };
}

/**
 * Simulate disconnecting from VPN.
 * @returns {Promise<{success: boolean, state: string}>}
 */
export async function disconnectVpn() {
  // Simulate teardown (replace with real VPN disconnect call)
  _currentState = STATES.DISCONNECTED;
  _connectedServer = null;

  return { success: true, state: _currentState };
}

/**
 * Get the current VPN connection status.
 * @returns {{ state: string, server: object|null }}
 */
export function getVpnStatus() {
  return { state: _currentState, server: _connectedServer };
}

export { STATES };