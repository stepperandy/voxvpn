import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, User, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfileManager() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
      setFullName(me.full_name || '');
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('updateUserProfile', { full_name: fullName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      loadProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-500 text-sm">Loading...</div>;

  return (
    <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/3">
      <h3 className="text-white font-bold">Profile Information</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-slate-400 text-sm">Full Name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-slate-400 text-sm">Email</label>
          <div className="flex items-center gap-2 mt-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5">
            <Mail size={16} className="text-slate-500" />
            <span className="text-white text-sm">{user?.email}</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 text-sm">Member Since</label>
          <p className="text-white text-sm mt-1">
            {new Date(user?.created_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
        </Button>
        {saved && (
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <CheckCircle2 size={14} /> Saved
          </div>
        )}
      </div>
    </div>
  );
}