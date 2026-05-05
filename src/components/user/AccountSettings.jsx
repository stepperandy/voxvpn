import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Bell, Moon } from 'lucide-react';

export default function AccountSettings() {
  const [settings, setSettings] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await base44.functions.invoke('getAccountSettings', {});
      const prefs = res.data?.preferences;
      setSettings(res.data);
      setNotificationsEnabled(prefs?.notifications_enabled !== false);
      setAutoConnect(prefs?.auto_connect === true);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('updateAccountSettings', {
        notifications_enabled: notificationsEnabled,
        auto_connect: autoConnect,
      });
      loadSettings();
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-500 text-sm">Loading...</div>;

  return (
    <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/3">
      <h3 className="text-white font-bold">Preferences</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-slate-500" />
            <span className="text-white text-sm">Email Notifications</span>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2">
            <Moon size={16} className="text-slate-500" />
            <span className="text-white text-sm">Auto-Connect on Startup</span>
          </div>
          <Switch
            checked={autoConnect}
            onCheckedChange={setAutoConnect}
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Preferences'}
      </Button>
    </div>
  );
}