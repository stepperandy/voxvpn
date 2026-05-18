package net.voxvpn.mobile

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import de.blinkt.openvpn.VpnProfile
import de.blinkt.openvpn.core.ConfigParser
import de.blinkt.openvpn.core.OpenVPNService
import de.blinkt.openvpn.core.ProfileManager
import de.blinkt.openvpn.core.VPNLaunchHelper
import de.blinkt.openvpn.core.VpnStatus
import java.io.InputStreamReader
import java.io.StringReader

/**
 * VoxVpnPlugin — Capacitor bridge between the React UI and ICS-OpenVPN.
 *
 * Flow:
 *  1. JS calls connect({ config: "us-ny" })
 *  2. We open assets/configs/us-ny.ovpn, parse it with ConfigParser
 *  3. Save the VpnProfile to ProfileManager (ICS-OpenVPN requires this)
 *  4. VPNLaunchHelper.startOpenVpn() → creates the TUN device → routes ALL traffic
 *  5. VpnStatus.StateListener fires LEVEL_CONNECTED → we resolve the JS call
 *  6. JS calls disconnect() → OpenVPNService.DISCONNECT_VPN → TUN torn down
 */
@CapacitorPlugin(name = "VoxVpnPlugin")
class VoxVpnPlugin : Plugin(), VpnStatus.StateListener {

    companion object {
        private const val VPN_REQUEST_CODE = 24601
        private const val CONFIG_DIR = "configs"
    }

    private var pendingCall: PluginCall? = null
    private var pendingConfigName: String? = null

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    override fun load() {
        VpnStatus.addStateListener(this)
    }

    override fun handleOnDestroy() {
        VpnStatus.removeStateListener(this)
        super.handleOnDestroy()
    }

    // ── VpnStatus.StateListener ───────────────────────────────────────────────

    override fun updateState(
        state: String?,
        logmessage: String?,
        localizedResId: Int,
        level: VpnStatus.ConnectionStatus?,
        intent: Intent?
    ) {
        val connected = level == VpnStatus.ConnectionStatus.LEVEL_CONNECTED
        val connecting = level == VpnStatus.ConnectionStatus.LEVEL_CONNECTING_NO_SERVER_REPLY_YET
                || level == VpnStatus.ConnectionStatus.LEVEL_CONNECTING_SERVER_REPLIED
        val failed = level == VpnStatus.ConnectionStatus.LEVEL_AUTH_FAILED
                || level == VpnStatus.ConnectionStatus.LEVEL_NONETWORK

        val evt = JSObject().apply {
            put("state", state ?: "DISCONNECTED")
            put("connected", connected)
            put("connecting", connecting)
            put("level", level?.name ?: "LEVEL_NOTCONNECTED")
            put("message", logmessage ?: "")
        }

        // Push status to all JS listeners in real time
        notifyListeners("vpnStatus", evt)

        // Resolve / reject the pending connect() call
        val call = pendingCall
        if (call != null) {
            when {
                connected -> {
                    call.resolve(evt)
                    pendingCall = null
                }
                failed -> {
                    call.reject("VPN connection failed: ${logmessage ?: level?.name}")
                    pendingCall = null
                }
            }
        }
    }

    override fun setConnectedVPN(uuid: String?) { /* not needed */ }

    // ── Plugin Methods ────────────────────────────────────────────────────────

    /**
     * connect({ config: "us-ny" })
     *
     * Reads assets/configs/<config>.ovpn, parses it, saves the profile,
     * then calls VPNLaunchHelper.startOpenVpn() which starts the real tunnel.
     */
    @PluginMethod
    fun connect(call: PluginCall) {
        val configName = call.getString("config") ?: run {
            call.reject("config is required")
            return
        }

        // Android requires explicit user consent for VPN
        val permIntent = VpnService.prepare(activity)
        if (permIntent != null) {
            pendingCall = call
            pendingConfigName = configName
            startActivityForResult(call, permIntent, VPN_REQUEST_CODE)
            return
        }

        launchTunnel(call, configName)
    }

    /**
     * disconnect()
     *
     * Sends DISCONNECT_VPN to OpenVPNService → tears down TUN → restores normal routing.
     */
    @PluginMethod
    fun disconnect(call: PluginCall) {
        val i = Intent(context, OpenVPNService::class.java).apply {
            action = OpenVPNService.DISCONNECT_VPN
        }
        context.startService(i)
        call.resolve(JSObject().apply {
            put("success", true)
            put("state", "DISCONNECTED")
        })
    }

    /**
     * getStatus()
     */
    @PluginMethod
    fun getStatus(call: PluginCall) {
        val active = VpnStatus.isVPNActive()
        call.resolve(JSObject().apply {
            put("connected", active)
            put("state", if (active) "CONNECTED" else "DISCONNECTED")
        })
    }

    // ── VPN permission result ─────────────────────────────────────────────────

    override fun handleOnActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.handleOnActivityResult(requestCode, resultCode, data)
        if (requestCode != VPN_REQUEST_CODE) return

        val call = pendingCall
        val configName = pendingConfigName
        pendingCall = null
        pendingConfigName = null

        if (resultCode == Activity.RESULT_OK && call != null && configName != null) {
            launchTunnel(call, configName)
        } else {
            call?.reject("VPN permission denied by user")
        }
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private fun launchTunnel(call: PluginCall, configName: String) {
        try {
            // 1. Read the .ovpn file from assets
            val assetPath = "$CONFIG_DIR/$configName.ovpn"
            val ovpnText = context.assets.open(assetPath).bufferedReader().readText()

            // 2. Parse with ICS-OpenVPN ConfigParser
            val cp = ConfigParser()
            cp.parseConfig(StringReader(ovpnText))

            // 3. Convert to VpnProfile
            val profile: VpnProfile = cp.convertProfile()
            profile.mName = configName

            // 4. Persist to ProfileManager (ICS-OpenVPN reads it from here when starting)
            val pm = ProfileManager.getInstance(context)
            pm.addProfile(profile)
            pm.saveProfileList(context)
            pm.saveProfile(context, profile)

            // 5. Set as the "last used" profile so VPNLaunchHelper can find it
            ProfileManager.setConntectedVpnProfile(context, profile)

            // 6. Keep the call pending — StateListener will resolve it when CONNECTED
            pendingCall = call

            // 7. Launch — VPNLaunchHelper handles the Intent + foreground service correctly
            VPNLaunchHelper.startOpenVpn(profile, context)

        } catch (e: Exception) {
            call.reject("Failed to start VPN: ${e.message}")
        }
    }
}