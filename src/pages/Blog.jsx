import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, ChevronRight } from "lucide-react";

const ARTICLES = [
  {
    title: "Why Use a Virtual Phone Number? 10 Benefits for Businesses",
    category: "Virtual Numbers",
    date: "Jul 5, 2026",
    readTime: "5 min",
    excerpt: "Virtual phone numbers offer flexibility, privacy, and cost savings. Here's why every business should consider using one for their communication needs.",
  },
  {
    title: "Public Wi-Fi Security: How to Stay Safe on Untrusted Networks",
    category: "Security",
    date: "Jul 2, 2026",
    readTime: "7 min",
    excerpt: "Public Wi-Fi is convenient but risky. Learn the risks and discover practical steps to protect your data when connecting to untrusted networks.",
  },
  {
    title: "What Is AES-256 Encryption? A Beginner's Guide",
    category: "Security",
    date: "Jun 28, 2026",
    readTime: "6 min",
    excerpt: "AES-256 is the gold standard for encryption, used by banks and governments. Here's a simple explanation of how it works and why it matters.",
  },
  {
    title: "OpenVPN vs WireGuard: Which Protocol Should You Use?",
    category: "Security",
    date: "Jun 25, 2026",
    readTime: "8 min",
    excerpt: "Both OpenVPN and WireGuard are popular VPN protocols, but they have different strengths. We compare speed, security, and use cases.",
  },
  {
    title: "Online Privacy in 2026: What's Changed and What Hasn't",
    category: "Privacy",
    date: "Jun 20, 2026",
    readTime: "10 min",
    excerpt: "Privacy regulations have evolved, but so have threats. Here's the state of online privacy in 2026 and what you can do to protect yourself.",
  },
  {
    title: "Streaming with a VPN: Unlock Global Content Safely",
    category: "Guides",
    date: "Jun 15, 2026",
    readTime: "6 min",
    excerpt: "Geo-restrictions limit what you can watch. Learn how a VPN lets you access global streaming libraries while keeping your connection secure.",
  },
  {
    title: "Remote Work Security: Best Practices for Distributed Teams",
    category: "Business",
    date: "Jun 10, 2026",
    readTime: "9 min",
    excerpt: "Remote work introduces unique security challenges. From secure connections to device management, here's how to keep your team safe.",
  },
  {
    title: "DNS Leak Protection Explained: Why It Matters",
    category: "Security",
    date: "Jun 5, 2026",
    readTime: "5 min",
    excerpt: "DNS leaks can expose your browsing activity even when using a VPN. Learn what DNS leaks are and how to prevent them.",
  },
  {
    title: "Kill Switch Explained: Your Last Line of Defense",
    category: "Security",
    date: "Jun 1, 2026",
    readTime: "4 min",
    excerpt: "A VPN kill switch blocks all internet traffic if your VPN connection drops. Here's why this feature is essential for your privacy.",
  },
  {
    title: "Choosing a VPN: 10 Questions to Ask Before You Buy",
    category: "Guides",
    date: "May 28, 2026",
    readTime: "8 min",
    excerpt: "Not all VPNs are created equal. Before you commit, ask these 10 critical questions about logging, speed, jurisdiction, and transparency.",
  },
];

export default function Blog() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            The <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">VoxDigits Blog</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Insights, guides, and news on privacy, security, virtual numbers, and global communication.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Featured Article */}
          <div className="mb-12 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">Featured</span>
                <span className="text-xs text-gray-500">{ARTICLES[0].category}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{ARTICLES[0].title}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">{ARTICLES[0].excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {ARTICLES[0].date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ARTICLES[0].readTime} read</span>
              </div>
              <button className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
                Read Article <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Article Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTICLES.slice(1).map(article => (
              <div key={article.title} className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/30 transition-colors cursor-pointer">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 mb-3">
                  {article.category}
                </span>
                <h3 className="font-semibold text-white text-sm mb-2 leading-snug">{article.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-400 mb-6">Subscribe to get the latest articles and updates from VoxDigits.</p>
          <Link to="/Contact" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors">
            Subscribe
          </Link>
        </div>
      </section>
    </div>
  );
}