import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, Clock, Heart, Zap, Globe, Users } from "lucide-react";

const POSITIONS = [
  { title: "Senior Backend Engineer (Node.js/Deno)", dept: "Engineering", location: "Remote (Global)", type: "Full-time" },
  { title: "Mobile App Developer (React Native)", dept: "Engineering", location: "Remote (Global)", type: "Full-time" },
  { title: "DevOps / Infrastructure Engineer", dept: "Engineering", location: "Remote (Global)", type: "Full-time" },
  { title: "Telecom Integration Specialist", dept: "Product", location: "Remote (EU/US)", type: "Full-time" },
  { title: "Customer Success Manager", dept: "Support", location: "Remote (Global)", type: "Full-time" },
  { title: "Digital Marketing Specialist", dept: "Marketing", location: "Remote (Global)", type: "Contract" },
];

const CULTURE = [
  { icon: Globe, title: "100% Remote", desc: "Work from anywhere in the world. We are a fully distributed team across multiple time zones." },
  { icon: Zap, title: "Fast-Paced & Autonomous", desc: "We move quickly and trust our team to make decisions. You'll have real ownership from day one." },
  { icon: Heart, title: "Work-Life Balance", desc: "Flexible hours, unlimited PTO, and a culture that respects your personal time and wellbeing." },
  { icon: Users, title: "Collaborative & Inclusive", desc: "Diverse team from 15+ countries. We value different perspectives and create an inclusive environment." },
];

export default function Careers() {
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
            <Briefcase className="w-3.5 h-3.5" /> Careers
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Build the Future of <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Global Communication</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Join a fully remote team building telecom infrastructure that connects people across borders. We're looking for passionate people who want to make global communication accessible to everyone.
          </p>
        </div>
      </section>

      {/* Culture */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Our Culture</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CULTURE.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
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

      {/* Open Positions */}
      <section className="py-12 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Open Positions</h2>
          <p className="text-gray-500 text-sm mb-8">All positions are remote unless otherwise noted.</p>
          <div className="space-y-3">
            {POSITIONS.map(pos => (
              <a
                key={pos.title}
                href="mailto:careers@voxtelefony.com"
                className="block p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">{pos.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="text-cyan-400">{pos.dept}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {pos.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pos.type}</span>
                    </div>
                  </div>
                  <span className="text-xs text-cyan-400 font-semibold whitespace-nowrap">Apply →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Don't See Your Role?</h2>
          <p className="text-gray-400 mb-8">
            We're always looking for talented people. Send your CV to <a href="mailto:careers@voxtelefony.com" className="text-cyan-400 hover:text-cyan-300">careers@voxtelefony.com</a> and tell us how you'd contribute to VoxDigits.
          </p>
          <Link to="/Company" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors">
            Learn More About Us
          </Link>
        </div>
      </section>
    </div>
  );
}