import React from "react";
import { Link } from "react-router-dom";
import { Shield, Globe, Users, Award, HeadphonesIcon, ChevronRight, Phone, Wifi, Server, CheckCircle } from "lucide-react";

const VALUES = [
  { icon: Globe, title: "Global Reach", desc: "Global communication tools in one platform, available across multiple regions." },
  { icon: Shield, title: "Compliant & Reliable", desc: "Designed for compliance and responsible use with reliable virtual number and eSIM solutions." },
  { icon: Users, title: "Built for Business", desc: "Built for business communication, remote teams, and international operations." },
  { icon: Server, title: "Scalable Infrastructure", desc: "Scalable cloud-based telecom services that grow with your business." },
];

const OFFERINGS = [
  "Virtual phone numbers",
  "eSIM connectivity",
  "International voice services",
  "Call routing solutions",
  "Cloud-based telecom services",
];

const WHO_WE_SERVE = [
  "Startups",
  "Remote teams",
  "International businesses",
  "Digital-first companies",
  "Professionals with cross-border communication needs",
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#060f1a] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-6">
            <Award className="w-3.5 h-3.5" /> VoxDigits Communication LLC
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Global Communication,<br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Made Accessible</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            VoxDigits Communication LLC is a telecommunications technology company focused on delivering global communication solutions. We provide virtual phone numbers, international voice services, and eSIM-based connectivity to help businesses and individuals operate seamlessly across borders.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Our Mission</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            To make global communication simpler, more reliable, and more accessible for businesses and individuals everywhere.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-5">About VoxDigits</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Our platform is designed for customer support, remote teams, and international business communication. We aim to make global connectivity more accessible through reliable, scalable, and user-friendly telecom solutions.
            </p>
            <p className="text-gray-400 leading-relaxed">
              VoxDigits supports businesses looking to expand internationally with scalable communication tools that work across multiple regions.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-72 md:h-auto">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop"
              alt="Global communication technology"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060f1a]/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* What We Offer + Who We Serve */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">What We Offer</h2>
            <ul className="space-y-3">
              {OFFERINGS.map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Who We Serve</h2>
            <ul className="space-y-3">
              {WHO_WE_SERVE.map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Why VoxDigits</h2>
          <p className="text-gray-500 text-center mb-12">Core principles that guide our platform and services</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-cyan-500/10 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Power Your Global Communications?</h2>
          <p className="text-gray-400 mb-8">Connect with our team to learn how VoxDigits can support your business communication needs.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/VirtualNumbers" className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors">
              Get a Number <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/Contact" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-colors">
              Request Access
            </Link>
            <Link to="/Dialer" className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors">
              <Phone className="w-4 h-4" /> Open Dialer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}