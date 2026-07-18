import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Trash2, Save, X, Loader2, Settings, Zap } from "lucide-react";

export default function AdminIOSSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [formData, setFormData] = useState({
    setting_key: "",
    setting_value: "",
    description: "",
    enabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await base44.asServiceRole.entities.IOSSettings.list();
      setSettings(data || []);
    } catch (err) {
      console.error("Failed to load iOS settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.setting_key.trim() || !formData.setting_value.trim()) {
      alert("Setting key and value are required");
      return;
    }

    try {
      if (editingId) {
        await base44.asServiceRole.entities.IOSSettings.update(editingId, formData);
      } else {
        await base44.asServiceRole.entities.IOSSettings.create(formData);
      }
      await loadSettings();
      resetForm();
    } catch (err) {
      console.error("Failed to save setting:", err);
      alert("Failed to save setting");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this setting?")) {
      try {
        await base44.asServiceRole.entities.IOSSettings.delete(id);
        await loadSettings();
      } catch (err) {
        console.error("Failed to delete setting:", err);
      }
    }
  };

  const handleEdit = (setting) => {
    setFormData({
      setting_key: setting.setting_key,
      setting_value: setting.setting_value,
      description: setting.description || "",
      enabled: setting.enabled !== false,
    });
    setEditingId(setting.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      setting_key: "",
      setting_value: "",
      description: "",
      enabled: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const res = await base44.functions.invoke("migrateAppSettings", {});
      if (res.data?.success) {
        await loadSettings();
        alert(`Migration complete! iOS: ${res.data.results.ios.migrated} added, Android: ${res.data.results.android.migrated} added`);
      }
    } catch (err) {
      alert("Migration failed: " + err.message);
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold">iOS Settings</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
            >
              {migrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {migrating ? "Migrating..." : "Auto Migrate"}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-gray-950 font-bold rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Add Setting
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Setting" : "New iOS Setting"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Setting Key</label>
                <input
                  type="text"
                  value={formData.setting_key}
                  onChange={(e) => setFormData({ ...formData, setting_key: e.target.value })}
                  placeholder="e.g., NSUserTrackingUsageDescription"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-600 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Value</label>
                <textarea
                  value={formData.setting_value}
                  onChange={(e) => setFormData({ ...formData, setting_value: e.target.value })}
                  placeholder="Enter the setting value"
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-600 outline-none focus:border-cyan-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-600 outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="enabled" className="text-sm font-semibold text-gray-300">
                  Enabled
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={resetForm}
                  className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-gray-950 font-bold"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        )}

        {settings.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
            <Settings className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 mb-4">No iOS settings configured yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-gray-950 font-bold rounded-lg"
            >
              <Plus className="w-4 h-4" /> Create your first setting
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{setting.setting_key}</h3>
                    {!setting.enabled && <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">Disabled</span>}
                  </div>
                  <p className="text-sm text-gray-400 font-mono break-all">{setting.setting_value}</p>
                  {setting.description && <p className="text-xs text-gray-500 mt-2">{setting.description}</p>}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(setting)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(setting.id)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}