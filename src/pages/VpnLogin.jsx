import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function VpnLogin() {
  useEffect(() => {
    base44.auth.redirectToLogin('/dashboard');
  }, []);

  return (
    <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );
}