import { Users, TrendingUp, Activity, Shield } from 'lucide-react';
import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import MetricCard from '@/components/admin/MetricCard';
import UsersTable from '@/components/admin/UsersTable';
import ActivityLog from '@/components/admin/ActivityLog';
import { base44 } from '@/api/base44Client';

const mockUsers = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'admin', status: 'active', joined: 'Jan 15, 2024' },
  { id: 2, name: 'Mike Chen', email: 'mike@example.com', role: 'user', status: 'active', joined: 'Feb 2, 2024' },
  { id: 3, name: 'Emma Davis', email: 'emma@example.com', role: 'user', status: 'active', joined: 'Feb 10, 2024' },
  { id: 4, name: 'Alex Brown', email: 'alex@example.com', role: 'user', status: 'inactive', joined: 'Jan 28, 2024' },
  { id: 5, name: 'Lisa Wang', email: 'lisa@example.com', role: 'user', status: 'active', joined: 'Mar 5, 2024' },
];

const mockActivities = [
  { type: 'login', action: 'User logged in', user: 'Sarah Johnson', time: '2 min ago' },
  { type: 'signup', action: 'New user registered', user: 'John Smith', time: '15 min ago' },
  { type: 'settings', action: 'Settings updated', user: 'Mike Chen', time: '1 hour ago' },
  { type: 'login', action: 'User logged in', user: 'Emma Davis', time: '3 hours ago' },
  { type: 'delete', action: 'Account deleted', user: 'Robert Wilson', time: '5 hours ago' },
];

export default function Admin() {
  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar onLogout={handleLogout} />
      <AdminHeader />

      {/* Main Content */}
      <main className="lg:ml-64 mt-16 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Welcome back, Admin. Here's your performance overview.</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              icon={Users}
              label="Total Users"
              value="2,543"
              trend={12}
              color="cyan"
            />
            <MetricCard
              icon={TrendingUp}
              label="Active Sessions"
              value="1,284"
              trend={8}
              color="emerald"
            />
            <MetricCard
              icon={Activity}
              label="API Requests"
              value="45.2K"
              trend={-3}
              color="purple"
            />
            <MetricCard
              icon={Shield}
              label="Security Score"
              value="98%"
              trend={5}
              color="rose"
            />
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Users Table */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-white mb-4">Users</h2>
              <UsersTable users={mockUsers} />
            </div>

            {/* Activity Log */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Activity</h2>
              <ActivityLog activities={mockActivities} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}