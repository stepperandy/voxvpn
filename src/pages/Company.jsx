import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Target, Eye, MapPin, Mail, Phone, FileText, Briefcase, Newspaper, Users } from "lucide-react";

const COMPANY_INFO = [
  { label: "Legal Company Name", value: "VoxDigits Communications LLC" },
  { label: "Country of Registration", value: "United States of America" },
  { label: "Company Registration No.", value: "11986542" },
  { label: "Registered Office", value: "16809 Capon Tree Ln, Woodbridge, VA 22191, USA" },
  { label: "Domain", value: "voxtelefony.com" },
  { label: "Founded", value: "2024" },
];

export default function Company() {
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
            <Building2 className="w-3.5 h-3.5" /> Company
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            About <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">VoxDigits</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            VoxDigits Communications LLC is a telecommunications technology company delivering global communication solutions — virtual phone numbers, eSIM connectivity, and cloud-based voice services.
          </p>
        </div>
      </section>

      {/* Legal Information */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-2xl font-bold">Legal Information</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {COMPANY_INFO.map(item => (
              <div key={item.label} className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-sm text-white font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold">Our Mission</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              To make global communication simpler, more reliable, and more accessible for businesses and individuals everywhere — breaking down borders through technology.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold">Our Vision</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              A world where anyone can communicate globally without barriers — where a phone number or data connection is available to anyone, anywhere, at fair prices with uncompromising privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Company Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Privacy First", desc: "We collect only what's necessary and never sell user data." },
              { title: "Global Access", desc: "Communication tools that work across borders and regions." },
              { title: "Reliability", desc: "99.9%+ uptime with redundant infrastructure worldwide." },
              { title: "Transparency", desc: "Open about our practices, policies, and data requests." },
            ].map(v => (
              <div key={v.title} className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
                <h3 className="font-semibold text-white text-sm mb-2">{v.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Explore VoxDigits</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/AboutUs" className="p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/30 transition-colors">
              <Users className="w-5 h-5 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-white text-sm mb-1">About Us</h3>
              <p className="text-gray-500 text-xs">Our story and team</p>
            </Link>
            <Link to="/Careers" className="p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/30 transition-colors">
              <Briefcase className="w-5 h-5 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-white text-sm mb-1">Careers</h3>
              <p className="text-gray-500 text-xs">Join our team</p>
            </Link>
            <Link to="/Press" className="p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/30 transition-colors">
              <Newspaper className="w-5 h-5 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-white text-sm mb-1">Press</h3>
              <p className="text-gray-500 text-xs">Brand assets and media</p>
            </Link>
            <Link to="/Contact" className="p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/30 transition-colors">
              <Mail className="w-5 h-5 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-white text-sm mb-1">Contact</h3>
              <p className="text-gray-500 text-xs">Get in touch</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm text-white">16809 Capon Tree Ln<br />Woodbridge, VA 22191, USA</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a href="mailto:support@voxtelefony.com" className="text-sm text-cyan-400 hover:text-cyan-300">support@voxtelefony.com</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}