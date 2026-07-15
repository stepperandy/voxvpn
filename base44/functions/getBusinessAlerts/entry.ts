import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['client_admin', 'agency_admin', 'super_admin', 'admin'].includes(user.role)) {
      return Response.json({ error: 'Forbidden — business admin access required' }, { status: 403 });
    }

    // Resolve the client (business team) for this user
    let client = null;
    if (user.client_id) {
      try { client = await base44.asServiceRole.entities.Client.get(user.client_id); } catch { /* fallback below */ }
    }
    if (!client) {
      const byEmail = await base44.asServiceRole.entities.Client.filter({ contact_email: user.email }, '-created_date', 1);
      client = byEmail?.[0];
    }
    if (!client) {
      const byCreator = await base44.asServiceRole.entities.Client.filter({ created_by_id: user.id }, '-created_date', 1);
      client = byCreator?.[0];
    }
    if (!client) {
      return Response.json({ alerts: [], summary: { total: 0, critical: 0, warning: 0, info: 0 } });
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const alerts = [];

    // 1. Recent threat detections (critical)
    try {
      const threatLogs = await base44.asServiceRole.entities.SecurityLog.filter({
        client_id: client.id,
        event_type: 'threat_detected',
        timestamp: { $gte: twentyFourHoursAgo }
      }, '-timestamp', 20);

      for (const log of threatLogs) {
        alerts.push({
          id: `threat_${log.id}`,
          type: 'threat_detected',
          severity: 'critical',
          title: 'Threat Detected',
          message: log.message || 'Malware detected on device',
          device_name: log.device_name,
          user_email: log.user_email,
          timestamp: log.timestamp || log.created_date,
          source: 'security_log'
        });
      }
    } catch { /* non-fatal */ }

    // 2. Recent VPN disconnects (warning — lost secure connection)
    try {
      const disconnectLogs = await base44.asServiceRole.entities.SecurityLog.filter({
        client_id: client.id,
        event_type: 'vpn_disconnect',
        timestamp: { $gte: oneHourAgo }
      }, '-timestamp', 30);

      for (const log of disconnectLogs) {
        alerts.push({
          id: `disconnect_${log.id}`,
          type: 'device_disconnect',
          severity: 'warning',
          title: 'Secure Connection Lost',
          message: log.message || `${log.device_name || 'A device'} disconnected from VPN`,
          device_name: log.device_name,
          user_email: log.user_email,
          timestamp: log.timestamp || log.created_date,
          source: 'security_log'
        });
      }
    } catch { /* non-fatal */ }

    // 3. Stored BusinessAlerts (antivirus updates, device offline, custom alerts)
    try {
      const storedAlerts = await base44.asServiceRole.entities.BusinessAlert.filter({
        client_id: client.id,
        is_resolved: false
      }, '-timestamp', 50);

      for (const alert of storedAlerts) {
        alerts.push({
          id: alert.id,
          type: alert.alert_type,
          severity: alert.severity,
          title: alert.title || getAlertTitle(alert.alert_type),
          message: alert.message,
          device_name: alert.device_name,
          user_email: alert.user_email,
          timestamp: alert.timestamp || alert.created_date,
          source: 'stored',
          resolvable: true
        });
      }
    } catch { /* entity might not be deployed yet — non-fatal */ }

    // Sort by timestamp descending
    alerts.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    return Response.json({
      alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getAlertTitle(type) {
  const titles = {
    device_disconnect: 'Secure Connection Lost',
    device_offline: 'Device Offline',
    antivirus_update: 'Antivirus Update Required',
    threat_detected: 'Threat Detected',
    policy_violation: 'Policy Violation'
  };
  return titles[type] || 'Security Alert';
}