import React from "react";
import { Link } from "react-router-dom";
import {
  Shield, Lock, Eye, Network, Server, ShieldCheck,
  Bug, FileText, ArrowLeft, Check, Wifi
} from "lucide-react";

const SECURITY_FEATURES = [
  { icon: Lock, title: "AES-256 Encryption", desc: "All voice calls, SMS messages, and data transmissions are encrypted using AES-256, the same encryption standard used by banks and governments." },
  { icon: Network, title: "DNS Leak Protection", desc: "Our infrastructure prevents DNS leaks by routing all DNS queries through encrypted channels, ensuring your communication metadata is never exposed." },
  { icon: Shield, title: "Kill Switch", desc: "If a secure connection drops unexpectedly, our kill switch automatically blocks all traffic until the secure tunnel is re-established, preventing data exposure." },
  { icon: Wifi, title: "IPv6 Leak Protection", desc: "We fully support IPv6 with built-in leak protection, ensuring no traffic bypasses encrypted channels through IPv6 routes." },
  { icon: Server, title: "RAM-Only Servers", desc: "Our core infrastructure runs on RAM-only servers. All data is wiped on reboot, leaving no trace of user activity on disk." },
  { icon: Eye, title: "Strict No-Logs Policy", desc: "We do not log, store, or track your browsing activity, call history, or message content. We cannot share what we do not collect." },
  { icon: ShieldCheck, title: "Malware Protection", desc: "Our network infrastructure includes real-time malware and threat detection, blocking known malicious domains and protecting users from phishing." },
  { icon: Bug, title: "Responsible Disclosure", desc: "We operate a responsible disclosure program. Security researchers can report vulnerabilities to security@voxtelefony.com and receive recognition and rewards." },
];

const PROTOCOLS = [
  { name: "WireGuard", desc: "Modern, fast, and audited protocol with state-of-the-art cryptography for all VPN connections." },
  { name: "OpenVPN", desc: "Battle-tested, open-source protocol supporting AES-256-GCM encryption for maximum compatibility." },
  { name: "TLS 1.3", desc: "All web traffic and API communications are secured with Transport Layer Security 1.3." },
  { name: "SRTP", desc: "Secure Real-time Transport Protocol encrypts voice call media end-to-end." },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-[#060f1a] text-white">
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-6">
            <Shield className="w-3.5 h-3.5" /> Security & Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Security Built Into <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Every Connection</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            VoxDigits employs industry-leading encryption, strict no-logs policies, and advanced leak protection to safeguard your communications and data.
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">Security Features</h2>
          <p className="text-gray-500 text-center mb-12">Comprehensive protection across every layer of our platform</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECURITY_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocols */}
      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Supported Security Protocols</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {PROTOCOLS.map(({ name, desc }) => (
              <div key={name} className="p-6 rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">{name}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No-Logs Policy */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Eye className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Our No-Logs Commitment</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            VoxDigits does not log, store, or track your browsing activity, call contents, message content, or DNS queries.
            We operate under a strict no-logs policy, meaning we have nothing to share — even if compelled by law.
            Our infrastructure is designed so that even our own engineers cannot access your communication content.
          </p>
          <Link to="/TransparencyReport" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors">
            <FileText className="w-4 h-4" /> View Transparency Report
          </Link>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="py-16 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Bug className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold">Responsible Disclosure</h2>
          </div>
          <p className="text-gray-400 leading-relaxed mb-4">
            We value the security community. If you discover a vulnerability in our platform, we encourage you to report it responsibly.
            We will investigate all legitimate reports and provide recognition through our Hall of Fame.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Email: <a href="mailto:security@voxtelefony.com" className="text-cyan-400 hover:text-cyan-300">security@voxtelefony.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}