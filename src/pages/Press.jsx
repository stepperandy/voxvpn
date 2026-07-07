import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Link } from 'react-router-dom';
import { ExternalLink, Mail, FileText, Star, Link2, Users } from 'lucide-react';

const pressFeatures = [
  {
    publication: 'TechRadar',
    logo: '📡',
    headline: '"VoxVPN delivers military-grade encryption at an affordable price"',
    date: 'March 2026',
    url: '#',
  },
  {
    publication: 'PCMag',
    logo: '💻',
    headline: '"Fast speeds, strict no-logs, and a clean interface — VoxVPN impresses"',
    date: 'February 2026',
    url: '#',
  },
  {
    publication: 'Cyber News',
    logo: '🔐',
    headline: '"VoxVPN stands out with WireGuard protocol support and kill switch"',
    date: 'January 2026',
    url: '#',
  },
  {
    publication: 'VPN Mentor',
    logo: '🛡️',
    headline: '"VoxVPN earns a 4.7/5 — highly recommended for privacy-conscious users"',
    date: 'December 2025',
    url: '#',
  },
  {
    publication: 'Privacy Guides',
    logo: '📋',
    headline: '"Independently audited, zero-logs verified — VoxVPN passes our review"',
    date: 'November 2025',
    url: '#',
  },
  {
    publication: 'Safe Bytes',
    logo: '🔒',
    headline: '"Best budget VPN of 2025 — VoxVPN offers premium features at low cost"',
    date: 'October 2025',
    url: '#',
  },
];

const partnershipTypes = [
  {
    icon: <FileText size={22} />,
    title: 'Guest Posts & Content',
    description: 'We accept high-quality guest posts about VPN technology, online privacy, cybersecurity, and digital freedom on our blog.',
    cta: 'Submit a Guest Post',
    mailto: 'mailto:press@voxvpn.net?subject=Guest Post Inquiry',
  },
  {
    icon: <Star size={22} />,
    title: 'Product Reviews',
    description: 'Tech journalists and bloggers — get a free VoxVPN account to write an honest, in-depth review for your audience.',
    cta: 'Request a Review Account',
    mailto: 'mailto:press@voxvpn.net?subject=Review Account Request',
  },
  {
    icon: <Link2 size={22} />,
    title: 'Backlink Exchange',
    description: 'We partner with reputable cybersecurity, tech, and privacy-focused websites for quality backlink exchanges.',
    cta: 'Propose a Backlink',
    mailto: 'mailto:press@voxvpn.net?subject=Backlink Partnership',
  },
  {
    icon: <Users size={22} />,
    title: 'Affiliate & Co-Marketing',
    description: 'Earn commission by promoting VoxVPN to your audience. Competitive rates, real-time tracking, and dedicated support.',
    cta: 'Join Affiliate Program',
    to: '/affiliate-register',
  },
];

const guestTopics = [
  'How to Choose the Right VPN in 2026',
  'The Rise of WireGuard: Why It\'s Replacing OpenVPN',
  'Online Privacy Laws Around the World',
  'How ISPs Track Your Browsing (And How to Stop Them)',
  'VPN vs Proxy vs Tor: What\'s the Difference?',
  'Cybersecurity Tips for Small Business Owners',
  'How to Stay Private on Public Wi-Fi',
  'The Truth About Free VPNs',
];

export default function Press() {
  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-4">
            📰 Press & Partnerships
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Media Kit & <span className="text-cyan-400">Backlink</span> Opportunities
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Partner with VoxVPN for guest posts, product reviews, backlink exchanges, and affiliate opportunities.
            We actively build relationships with quality privacy & tech publishers.
          </p>
          <a
            href="mailto:press@voxvpn.net"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full text-sm transition-all"
          >
            <Mail size={15} /> Contact Our Press Team
          </a>
        </div>

        {/* Press Features */}
        <section className="mb-16">
          <h2 className="text-white font-bold text-xl mb-6">As Featured In</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pressFeatures.map((item) => (
              <a
                key={item.publication}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-white/5 bg-[#0d1120] p-5 hover:border-cyan-500/20 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{item.logo}</span>
                  <div>
                    <p className="text-white font-bold text-sm">{item.publication}</p>
                    <p className="text-slate-600 text-xs">{item.date}</p>
                  </div>
                  <ExternalLink size={13} className="ml-auto text-slate-700 group-hover:text-cyan-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-xs leading-relaxed italic">{item.headline}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Partnership Types */}
        <section className="mb-16">
          <h2 className="text-white font-bold text-xl mb-6">Partnership Opportunities</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {partnershipTypes.map((p) => (
              <div key={p.title} className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="text-white font-bold text-base mb-2">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{p.description}</p>
                {p.to ? (
                  <Link to={p.to} className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors">
                    {p.cta} →
                  </Link>
                ) : (
                  <a href={p.mailto} className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors">
                    {p.cta} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Guest Post Topics */}
        <section className="mb-16">
          <h2 className="text-white font-bold text-xl mb-3">Accepted Guest Post Topics</h2>
          <p className="text-slate-500 text-sm mb-6">We publish quality, original articles. Minimum 800 words. No AI-only content. Must be relevant to VPN, privacy, or cybersecurity.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {guestTopics.map((topic) => (
              <div key={topic} className="flex items-start gap-3 p-4 rounded-xl bg-[#0d1120] border border-white/5">
                <span className="text-cyan-400 mt-0.5">✓</span>
                <p className="text-slate-300 text-sm">{topic}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Media Kit CTA */}
        <section className="rounded-2xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 p-8 text-center">
          <h3 className="text-white font-bold text-2xl mb-2">Ready to Partner?</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Email us with your website URL, DA/DR score, and what type of partnership you're interested in.
            We respond within 24–48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:press@voxvpn.net?subject=Partnership Inquiry"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full text-sm transition-all"
            >
              <Mail size={15} /> press@voxvpn.net
            </a>
            <Link
              to="/affiliate-register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 border border-white/10 hover:border-white/20 text-white font-semibold rounded-full text-sm transition-all"
            >
              Join Affiliate Program
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}