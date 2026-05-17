/* eslint-disable no-undef */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronVPN', {
  // Window controls
  minimize: () => ipcRenderer.send('win-minimize'),
  close:    () => ipcRenderer.send('win-close'),

  // VPN actions
  connect:    (ovpnContent) => ipcRenderer.invoke('vpn-connect', { ovpnContent }),
  disconnect: ()            => ipcRenderer.invoke('vpn-disconnect'),
  getStatus:  ()            => ipcRenderer.invoke('vpn-status'),
  getLog:     ()            => ipcRenderer.invoke('vpn-get-log'),

  // Real-time events from main process
  onStatus: (cb) => ipcRenderer.on('vpn-status', (_e, s) => cb(s)),
  onLog:    (cb) => ipcRenderer.on('vpn-log',    (_e, l) => cb(l)),

  // Cleanup
  off: (channel) => ipcRenderer.removeAllListeners(channel),

  // Secure token storage (OS-encrypted via safeStorage)
  saveToken:  (token) => ipcRenderer.invoke('token-save', token),
  loadToken:  ()      => ipcRenderer.invoke('token-load'),
  clearToken: ()      => ipcRenderer.invoke('token-clear'),

  // Version / update check
  getVersion:   () => ipcRenderer.invoke('get-version'),
  checkUpdate:  () => ipcRenderer.invoke('check-update'),
});