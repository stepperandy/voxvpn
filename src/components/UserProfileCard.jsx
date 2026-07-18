import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { User, Phone, Wifi, Phone as PhoneIcon } from 'lucide-react';

export default function UserProfileCard() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setUser(currentUser);

      const profiles = await base44.entities.UserProfile.filter({
        user_id: currentUser.id,
      });

      if (profiles && profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;

  if (!user || !profile) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center text-gray-400 text-sm">
        No profile found
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-500',
    away: 'bg-yellow-500',
    inactive: 'bg-gray-500',
    dnd: 'bg-red-500',
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5 text-white">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-white" />
          </div>
          {/* Status indicator */}
          <div
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-900 ${statusColors[profile.status || 'active']}`}
          />
        </div>

        {/* Profile info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{user.full_name || 'User'}</p>
          <p className="text-gray-400 text-xs truncate">{user.email}</p>
          {profile.phone && (
            <p className="text-gray-500 text-xs font-mono mt-1 flex items-center gap-1">
              <PhoneIcon className="w-3 h-3" />
              {profile.phone}
            </p>
          )}
        </div>

        {/* Status badges */}
        <div className="flex flex-col gap-1.5">
          {profile.is_online && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400">
              <Wifi className="w-3 h-3" />
              Online
            </div>
          )}
          {profile.is_on_call && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">
              <PhoneIcon className="w-3 h-3" />
              In Call
            </div>
          )}
        </div>
      </div>

      {/* App Identity */}
      {profile.app_identity && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">App ID</p>
          <p className="text-xs font-mono text-gray-300">{profile.app_identity}</p>
        </div>
      )}
    </div>
  );
}