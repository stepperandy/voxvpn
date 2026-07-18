import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Newspaper, Download, Mail, Image, FileText } from "lucide-react";

const PRESS_RELEASES = [
  { date: "Jul 2026", title: "VoxDigits Launches Global eSIM Marketplace with Multi-Provider Support", excerpt: "New platform aggregates eSIM plans from multiple telecom providers, offering competitive pricing and broader coverage." },
  { date: "May 2026", title: "VoxDigits Reaches 50,000 Active Users Across 40 Countries", excerpt: "Milestone marks rapid growth in the virtual number and eSIM market since launch." },
  { date: "Mar 2026", title: "VoxDigits Introduces End-to-End Encrypted Voice Calling", excerpt: "New security feature brings AES-256 encrypted voice calls to all virtual number subscribers." },
  { date: "Jan 2026", title: "VoxDigits Secures Series A Funding to Expand Global Infrastructure", excerpt: "Funding will accelerate infrastructure expansion into Asia-Pacific and African markets." },
];

const BRAND_ASSETS = [
  { name: "Primary Logo (PNG, transparent)", size: "240 KB", icon: Image },
  { name: "Primary Logo (SVG)", size: "12 KB", icon: FileText },
  { name: "Logo — Dark Background", size: "180 KB", icon: Image },
  { name: "Brand Guidelines (PDF)", size: "2.4 MB", icon: FileText },
];

export default function Press() {
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
            <Newspaper className="w-3.5 h-3.5" /> Press & Media
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Press & <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Media Kit</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Resources for journalists, bloggers, and partners covering VoxDigits. Download brand assets, read press releases, or get in touch with our media team.
          </p>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Brand Assets</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {BRAND_ASSETS.map(asset => {
              const Icon = asset.icon;
              return (
                <div key={asset.name} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{asset.name}</p>
                      <p className="text-xs text-gray-500">{asset.size}</p>
                    </div>
                  </div>
                  <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Logo Preview */}
      <section className="py-12 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Our Logo</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-8 rounded-xl border border-white/10 bg-[#0d0620] flex items-center justify-center">
              <img src="https://media.base44.com/images/public/69b202c06dc5b1988efe9645/e6163c0d6_TELLOGO11.png" alt="VoxDigits Logo" className="h-24 w-auto" />
            </div>
            <div className="p-8 rounded-xl border border-white/10 bg-white flex items-center justify-center">
              <img src="https://media.base44.com/images/public/69b202c06dc5b1988efe9645/e6163c0d6_TELLOGO11.png" alt="VoxDigits Logo (Light)" className="h-24 w-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Press Releases</h2>
          <div className="space-y-4">
            {PRESS_RELEASES.map(pr => (
              <div key={pr.title} className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-cyan-400 font-medium">{pr.date}</span>
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{pr.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{pr.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="py-12 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Mail className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Media Contact</h2>
          <p className="text-gray-400 mb-4">For press inquiries, interviews, or media partnerships:</p>
          <a href="mailto:press@voxtelefony.com" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors">
            <Mail className="w-4 h-4" /> press@voxtelefony.com
          </a>
        </div>
      </section>
    </div>
  );
}