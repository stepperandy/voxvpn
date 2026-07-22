import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Shield, Loader2, Lock, Globe, Zap, Server, AlertCircle,
  ArrowRight, CheckCircle2, KeyRound, Eye, Activity,
} from 'lucide-react';

export default function SecurePortal() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setAuthChecked(true); if (!u) base44.auth.redirectToLogin('/secure'); })
      .catch(() => { setAuthChecked(true); base44.auth.redirectToLogin('/secure'); });
  }, []);

  useEffect(() => {
    if (!user) return;
    generateContent();
  }, [user]);

  const generateContent = async () => {
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the VoxVPN Secure Portal AI assistant. Generate a personalized security briefing for a VoxVPN member named "${user?.full_name || user?.email || 'Member'}".

Return a JSON object with this exact structure:
{
  "welcome_message": "A warm, personalized 2-3 sentence welcome acknowledging they've accessed the secure portal",
  "security_tip": "One actionable security tip of the day (1-2 sentences, specific and practical)",
  "threat_alert": "A brief current threat awareness note (1-2 sentences about a common online threat to watch for)",
  "checklist": [
    {"item": "short checklist item title", "description": "one sentence explanation", "done": false},
    {"item": "...", "description": "...", "done": false},
    {"item": "...", "description": "...", "done": false},
    {"item": "...", "description": "...", "done": false}
  ],
  "feature_highlight": {
    "title": "feature name",
    "description": "why this VoxVPN feature matters (2 sentences)"
  }
}

Make the content feel premium, security-focused, and unique. Do not use generic filler.`,
        response_json_schema: {
          type: 'object',
          properties: {
            welcome_message: { type: 'string' },
            security_tip: { type: 'string' },
            threat_alert: { type: 'string' },
            checklist: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  item: { type: 'string' },
                  description: { type: 'string' },
                  done: { type: 'boolean' }
                }
              }
            },
            feature_highlight: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        },
      });
      setContent(res);
    } catch {
      setContent({
        welcome_message: `Welcome to your secure portal. Your connection is encrypted and your session is protected by VoxVPN's zero-log infrastructure.`,
        security_tip: `Enable two-factor authentication on your VoxVPN account to add an extra layer of protection beyond your password.`,
        threat_alert: `Phishing campaigns are increasingly using AI-generated emails that mimic legitimate services. Always verify sender domains before clicking links.`,
        checklist: [
          { item: 'Verify VPN is active', description: 'Confirm your VPN tunnel is connected before browsing sensitive sites.', done: false },
          { item: 'Use strong, unique passwords', description: 'Never reuse passwords across multiple services.', done: false },
          { item: 'Keep software updated', description: 'Install OS and app updates promptly to patch vulnerabilities.', done: false },
          { item: 'Review connected devices', description: 'Check your dashboard for any unrecognized devices.', done: false },
        ],
        feature_highlight: {
          title: 'AES-256 Encryption',
          description: 'Every byte of your traffic is encrypted with military-grade AES-256, the same standard used by banks and governments worldwide.',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked || (user && loading)) {
    return (
      <div className="min-h-screen bg-[#060c1a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
            <Lock size={20} className="absolute inset-0 m-auto text-cyan-400" />
          </div>
          <p className="text-slate-400 text-sm">Securing your session…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#060c1a] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent 70%)' }} />

      <div className="relative pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 24px rgba(0,212,255,0.1)' }}>
              <Shield size={24} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Secure Portal</h1>
              <p className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5">
                <Lock size={10} /> Encrypted session · {user?.email}
              </p>
            </div>
          </div>

          {/* Secure session badge */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-300 text-xs font-medium">
              Your session is protected. All data on this page is transmitted over an encrypted TLS connection.
            </p>
          </div>
        </motion.div>

        {/* AI Welcome */}
        {content && (
          <>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-2xl border border-cyan-500/15 bg-[#0d1420] p-6 mb-5">
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Zap size={9} className="text-cyan-400" /> AI Security Briefing
              </p>
              <p className="text-white text-sm leading-relaxed">{content.welcome_message}</p>
            </motion.div>

            {/* Tip + Alert */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl border border-emerald-500/15 bg-[#0d1420] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound size={14} className="text-emerald-400" />
                  <p className="text-emerald-400 text-[10px] uppercase tracking-widest font-bold">Tip of the Day</p>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{content.security_tip}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                className="rounded-2xl border border-amber-500/15 bg-[#0d1420] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-amber-400" />
                  <p className="text-amber-400 text-[10px] uppercase tracking-widest font-bold">Threat Awareness</p>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{content.threat_alert}</p>
              </motion.div>
            </div>

            {/* Security Checklist */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/5 bg-[#0d1420] p-6 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <p className="text-white font-bold text-sm">Your Security Checklist</p>
              </div>
              <div className="space-y-2">
                {content.checklist?.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: '#0a1020', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="w-5 h-5 rounded-md border border-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {c.done && <CheckCircle2 size={11} className="text-emerald-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold">{c.item}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Feature Highlight */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl p-6 mb-5"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(99,102,241,0.06))', border: '1px solid rgba(0,212,255,0.15)' }}>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Eye size={9} /> Featured Protection
              </p>
              <h3 className="text-white font-bold text-lg mb-1.5">{content.feature_highlight?.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{content.feature_highlight?.description}</p>
            </motion.div>
          </>
        )}

        {/* Quick access tiles */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <QuickTile icon={Activity} label="Dashboard" href="/Dashboard" color="#00d4ff" />
          <QuickTile icon={Server} label="VPN Servers" href="/Servers" color="#a78bfa" />
          <QuickTile icon={Shield} label="Security" href="/Security" color="#10b981" />
        </motion.div>

        {/* Back link */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-xs transition-colors">
            <ArrowRight size={12} className="rotate-180" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function QuickTile({ icon: Icon, label, href, color }) {
  return (
    <Link to={href}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/5 bg-[#0d1420] hover:border-white/10 transition-all group">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <span className="text-slate-400 text-[11px] font-medium group-hover:text-white transition-colors">{label}</span>
    </Link>
  );
}