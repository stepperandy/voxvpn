import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle } from 'lucide-react';
import ClientOnboardingWizard from '@/components/reseller/ClientOnboardingWizard';
import { useNavigate } from 'react-router-dom';

export default function ClientOnboarding() {
  const [reseller, setReseller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        const resellers = await base44.entities.Reseller.filter({ email: u.email });
        if (resellers && resellers.length > 0) {
          setReseller(resellers[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg max-w-md">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Client Onboarding Walkthrough</h1>
          <p className="text-sm text-slate-400">Set up your agency domain and configure your first VPN policy step-by-step.</p>
        </div>
        <ClientOnboardingWizard
          reseller={reseller}
          onComplete={() => navigate('/ResellerDashboard')}
        />
      </div>
    </div>
  );
}