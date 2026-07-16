import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const DEFAULT_IOS_SETTINGS = [
  {
    setting_key: "NSUserTrackingUsageDescription",
    setting_value: "This identifier will be used to deliver personalized ads to you.",
    description: "Required for iOS App Tracking Transparency",
    enabled: true,
  },
  {
    setting_key: "NSLocalNetworkUsageDescription",
    setting_value: "VoxDigits needs to access your local network to enable voice calls.",
    description: "Required for local network access on iOS",
    enabled: true,
  },
  {
    setting_key: "NSBonjourServices",
    setting_value: "_voxdigits._tcp,_voxdigits._udp",
    description: "Bonjour services for VoIP on iOS",
    enabled: true,
  },
];

const DEFAULT_ANDROID_SETTINGS = [
  {
    setting_key: "android:requestLegacyExternalStorage",
    setting_value: "true",
    description: "Allow access to legacy external storage for Android 10 and below",
    enabled: true,
  },
  {
    setting_key: "uses-permission:RECORD_AUDIO",
    setting_value: "android.permission.RECORD_AUDIO",
    description: "Required for voice call recording",
    enabled: true,
  },
  {
    setting_key: "uses-permission:ACCESS_COARSE_LOCATION",
    setting_value: "android.permission.ACCESS_COARSE_LOCATION",
    description: "Required for location-based services",
    enabled: true,
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Check existing iOS settings
    const existingIos = await base44.asServiceRole.entities.IOSSettings.list();
    const iosCount = existingIos?.length || 0;

    // Check existing Android settings
    const existingAndroid = await base44.asServiceRole.entities.AndroidSettings.list();
    const androidCount = existingAndroid?.length || 0;

    const results = {
      ios: { migrated: 0, skipped: iosCount > 0, count: iosCount },
      android: { migrated: 0, skipped: androidCount > 0, count: androidCount },
    };

    // Migrate iOS settings if none exist
    if (iosCount === 0) {
      for (const setting of DEFAULT_IOS_SETTINGS) {
        await base44.asServiceRole.entities.IOSSettings.create(setting);
        results.ios.migrated++;
      }
    }

    // Migrate Android settings if none exist
    if (androidCount === 0) {
      for (const setting of DEFAULT_ANDROID_SETTINGS) {
        await base44.asServiceRole.entities.AndroidSettings.create(setting);
        results.android.migrated++;
      }
    }

    return Response.json({
      success: true,
      message: 'App settings migration completed',
      results,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});