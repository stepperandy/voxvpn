import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ArrowLeft, Clock, Tag } from 'lucide-react';

const postMeta = {
  'what-is-a-vpn-and-why-you-need-one': {
    title: 'What Is a VPN and Why You Need One in 2026',
    category: 'Beginner Guide',
    date: 'April 28, 2026',
    readTime: '5 min read',
    emoji: '🔒',
    tags: ['VPN basics', 'privacy', 'encryption', 'beginner'],
    prompt: 'Write a comprehensive, SEO-optimized blog post titled "What Is a VPN and Why You Need One in 2026". Cover: what a VPN is, how it works (tunneling, encryption), key benefits (privacy, security, bypass geo-blocks), who needs a VPN, and why VoxVPN is a great choice. Use H2 and H3 headings, bullet points, and a conclusion with a call to action. Write in plain, friendly English for a general audience. ~900 words.',
  },
  'best-vpn-for-streaming': {
    title: 'Best VPN for Streaming Netflix, Disney+, and More in 2026',
    category: 'Streaming',
    date: 'April 25, 2026',
    readTime: '7 min read',
    emoji: '🎬',
    tags: ['streaming', 'Netflix', 'Disney+', 'geo-blocks', 'unblock'],
    prompt: 'Write a comprehensive SEO blog post: "Best VPN for Streaming Netflix, Disney+, and More in 2026". Cover why streaming services block VPNs, what makes a VPN good for streaming (speed, server count, unblocking), tips for specific platforms (Netflix, Disney+, Hulu, BBC iPlayer, HBO Max), and why VoxVPN is a top pick. Use H2 headings and bullet points. ~950 words.',
  },
  'vpn-for-remote-work': {
    title: 'Why Every Remote Worker Needs a VPN in 2026',
    category: 'Business',
    date: 'April 22, 2026',
    readTime: '6 min read',
    emoji: '💼',
    tags: ['remote work', 'business', 'security', 'Wi-Fi'],
    prompt: 'Write an SEO blog post: "Why Every Remote Worker Needs a VPN in 2026". Cover the risks of public Wi-Fi, how VPNs protect remote workers, company data security, BYOD policies, and how VoxVPN fits for individuals and small businesses. Use H2 subheadings and practical tips. ~850 words.',
  },
  'wireguard-vs-openvpn': {
    title: 'WireGuard vs OpenVPN: Which Protocol Is Better?',
    category: 'Technology',
    date: 'April 18, 2026',
    readTime: '8 min read',
    emoji: '⚡',
    tags: ['WireGuard', 'OpenVPN', 'protocols', 'speed', 'security'],
    prompt: 'Write a detailed SEO blog post: "WireGuard vs OpenVPN: Which Protocol Is Better in 2026?". Compare both on speed, security, code complexity, mobile battery usage, compatibility, and use cases. Include a comparison table. Conclude with a recommendation. VoxVPN uses WireGuard. ~1000 words.',
  },
  'how-to-bypass-censorship': {
    title: 'How to Bypass Internet Censorship with a VPN',
    category: 'Privacy',
    date: 'April 15, 2026',
    readTime: '6 min read',
    emoji: '🌐',
    tags: ['censorship', 'freedom', 'China', 'travel', 'unblock'],
    prompt: 'Write an SEO blog post: "How to Bypass Internet Censorship with a VPN". Explain internet censorship (China, Iran, Russia), how VPNs bypass it, obfuscation techniques, what to look for in a VPN for censored countries, and tips for travelers. End with a recommendation for VoxVPN. ~900 words.',
  },
  'vpn-kill-switch-explained': {
    title: 'VPN Kill Switch Explained: Why It Matters for Your Privacy',
    category: 'Features',
    date: 'April 10, 2026',
    readTime: '4 min read',
    emoji: '🛡️',
    tags: ['kill switch', 'IP leak', 'privacy', 'features'],
    prompt: 'Write an SEO blog post: "VPN Kill Switch Explained: Why It Matters for Your Privacy". Explain what a kill switch is, why VPN connections drop, what happens without a kill switch (IP exposure), how it works technically, system-level vs app-level kill switches, and why VoxVPN\'s kill switch is reliable. ~750 words.',
  },
  'best-vpn-for-gaming': {
    title: 'Best VPN for Gaming: Reduce Lag, Block DDoS, and More',
    category: 'Gaming',
    date: 'April 6, 2026',
    readTime: '5 min read',
    emoji: '🎮',
    tags: ['gaming', 'DDoS protection', 'lag', 'ping', 'geo-locked games'],
    prompt: 'Write an SEO blog post: "Best VPN for Gaming: Reduce Lag, Block DDoS, and More". Cover VPN benefits for gamers (DDoS protection, geo-locked games, early access), how a VPN can reduce ping on certain routes, what to look for (low latency servers, kill switch), and VoxVPN gaming features. ~850 words.',
  },
  'dns-leak-test-guide': {
    title: 'DNS Leak Test: Is Your VPN Actually Protecting You?',
    category: 'Security',
    date: 'April 1, 2026',
    readTime: '5 min read',
    emoji: '🕵️',
    tags: ['DNS leak', 'security', 'IP leak', 'test', 'privacy'],
    prompt: 'Write an SEO blog post: "DNS Leak Test: Is Your VPN Actually Protecting You?" Explain what DNS is, what a DNS leak is, why it happens, how to test for DNS leaks (dnsleaktest.com, ipleak.net), how to fix them, and how VoxVPN\'s DNS leak protection works. ~800 words.',
  },
  'vpn-for-torrenting': {
    title: 'How to Torrent Safely and Anonymously with a VPN',
    category: 'Torrenting',
    date: 'March 28, 2026',
    readTime: '6 min read',
    emoji: '⬇️',
    tags: ['torrenting', 'P2P', 'anonymity', 'DMCA', 'no-logs'],
    prompt: 'Write an SEO blog post: "How to Torrent Safely and Anonymously with a VPN". Explain the risks of torrenting without a VPN (DMCA, ISP throttling, surveillance), what makes a VPN good for torrenting (no-logs, kill switch, P2P servers, unlimited bandwidth), and why VoxVPN is a safe choice. ~900 words.',
  },
  'aes-256-encryption-explained': {
    title: 'AES-256 Encryption: The Military-Grade Standard Explained',
    category: 'Security',
    date: 'March 24, 2026',
    readTime: '5 min read',
    emoji: '🔐',
    tags: ['AES-256', 'encryption', 'security', 'military-grade'],
    prompt: 'Write an SEO blog post: "AES-256 Encryption: The Military-Grade Standard Explained". Define AES-256 in plain English, explain how symmetric encryption works, why 256-bit keys are unbreakable, who uses AES-256 (banks, governments, VPNs), and how VoxVPN implements it. ~800 words.',
  },
  'vpn-for-travel': {
    title: 'VPN for Travel: Stay Safe on Hotel and Airport Wi-Fi',
    category: 'Travel',
    date: 'March 20, 2026',
    readTime: '4 min read',
    emoji: '✈️',
    tags: ['travel', 'hotel Wi-Fi', 'airport', 'public Wi-Fi', 'safety'],
    prompt: 'Write an SEO blog post: "VPN for Travel: Stay Safe on Hotel and Airport Wi-Fi". Explain the dangers of public Wi-Fi (man-in-the-middle attacks, fake hotspots), how a VPN protects travelers, accessing home content abroad, bypassing censorship while traveling, and VoxVPN travel tips. ~750 words.',
  },
  'no-logs-vpn-explained': {
    title: 'No-Logs VPN: What It Means and Why It Matters',
    category: 'Privacy',
    date: 'March 15, 2026',
    readTime: '5 min read',
    emoji: '📋',
    tags: ['no-logs', 'privacy policy', 'data retention', 'audit'],
    prompt: 'Write an SEO blog post: "No-Logs VPN: What It Means and Why It Matters". Define a no-logs policy, explain types of logs VPNs might keep (connection logs, usage logs), why it matters legally, how to verify a no-logs policy (audits), warning signs of fake no-logs claims, and VoxVPN\'s commitment. ~850 words.',
  },
};

export default function BlogPost() {
  const { slug } = useParams();
  const meta = postMeta[slug];
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meta) { setLoading(false); return; }
    base44.integrations.Core.InvokeLLM({ prompt: meta.prompt })
      .then(res => setContent(typeof res === 'string' ? res : res?.content || ''))
      .catch(() => setContent('Failed to load article. Please try again.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!meta) {
    return (
      <div className="min-h-screen bg-[#080c18] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-4">😕</p>
            <h1 className="text-white text-2xl font-bold mb-2">Post Not Found</h1>
            <Link to="/blog" className="text-cyan-400 hover:underline">← Back to Blog</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Back */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-400 text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Back to Blog
        </Link>

        {/* Header */}
        <div className="mb-8">
          <span className="text-5xl block mb-5">{meta.emoji}</span>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400">{meta.category}</span>
            <span className="flex items-center gap-1 text-slate-600 text-xs"><Clock size={12} /> {meta.readTime}</span>
            <span className="text-slate-600 text-xs">{meta.date}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">{meta.title}</h1>
          <div className="flex flex-wrap gap-2">
            {meta.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-slate-500 text-xs">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Article content */}
        <div className="border-t border-white/5 pt-8">
          {loading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-4 bg-white/5 rounded animate-pulse ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
              ))}
            </div>
          ) : (
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-slate-400 prose-p:leading-relaxed
              prose-li:text-slate-400 prose-li:leading-relaxed
              prose-strong:text-white
              prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
              prose-ul:list-disc prose-ul:pl-5
              prose-ol:list-decimal prose-ol:pl-5">
              {content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>;
                if (line.startsWith('**') && line.endsWith('**')) return <h3 key={i}>{line.replace(/\*\*/g, '')}</h3>;
                if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i}>{line.replace(/^[-*] /, '')}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i}>{line}</p>;
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-2">Ready to protect your privacy?</h3>
          <p className="text-slate-400 text-sm mb-5">Get VoxVPN — AES-256 encryption, no-logs policy, 20+ server locations.</p>
          <Link to="/#pricing" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full text-sm transition-all">
            Get Protected Now →
          </Link>
        </div>

        {/* Back to blog */}
        <div className="mt-8 text-center">
          <Link to="/blog" className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">← More articles</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}