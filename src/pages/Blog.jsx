import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const posts = [
  {
    slug: 'what-is-a-vpn-and-why-you-need-one',
    category: 'Beginner Guide',
    title: 'What Is a VPN and Why You Need One in 2026',
    excerpt: 'VPNs are no longer just for tech experts. Learn how a VPN protects your privacy, encrypts your traffic, and lets you access content from anywhere.',
    date: 'April 28, 2026',
    readTime: '5 min read',
    emoji: '🔒',
  },
  {
    slug: 'best-vpn-for-streaming',
    category: 'Streaming',
    title: 'Best VPN for Streaming Netflix, Disney+, and More in 2026',
    excerpt: 'Geo-restrictions block your favorite shows. We break down which VPN servers work best for Netflix, Disney+, Hulu, BBC iPlayer, and HBO Max.',
    date: 'April 25, 2026',
    readTime: '7 min read',
    emoji: '🎬',
  },
  {
    slug: 'vpn-for-remote-work',
    category: 'Business',
    title: 'Why Every Remote Worker Needs a VPN in 2026',
    excerpt: 'Working from coffee shops, hotels, or home? Public Wi-Fi is a hacker\'s playground. Here\'s how a VPN keeps your company data safe.',
    date: 'April 22, 2026',
    readTime: '6 min read',
    emoji: '💼',
  },
  {
    slug: 'wireguard-vs-openvpn',
    category: 'Technology',
    title: 'WireGuard vs OpenVPN: Which Protocol Is Better?',
    excerpt: 'WireGuard is the new kid on the block, but OpenVPN has years of battle-testing. We compare speed, security, and compatibility.',
    date: 'April 18, 2026',
    readTime: '8 min read',
    emoji: '⚡',
  },
  {
    slug: 'how-to-bypass-censorship',
    category: 'Privacy',
    title: 'How to Bypass Internet Censorship with a VPN',
    excerpt: 'Traveling to a country with heavy internet censorship? A VPN can help you access blocked sites and maintain your online freedom.',
    date: 'April 15, 2026',
    readTime: '6 min read',
    emoji: '🌐',
  },
  {
    slug: 'vpn-kill-switch-explained',
    category: 'Features',
    title: 'VPN Kill Switch Explained: Why It Matters for Your Privacy',
    excerpt: 'If your VPN drops unexpectedly, your real IP gets exposed. A kill switch prevents that. Here\'s everything you need to know.',
    date: 'April 10, 2026',
    readTime: '4 min read',
    emoji: '🛡️',
  },
  {
    slug: 'best-vpn-for-gaming',
    category: 'Gaming',
    title: 'Best VPN for Gaming: Reduce Lag, Block DDoS, and More',
    excerpt: 'A VPN can actually improve your gaming experience by reducing lag on some routes, stopping DDoS attacks, and letting you access region-locked games.',
    date: 'April 6, 2026',
    readTime: '5 min read',
    emoji: '🎮',
  },
  {
    slug: 'dns-leak-test-guide',
    category: 'Security',
    title: 'DNS Leak Test: Is Your VPN Actually Protecting You?',
    excerpt: 'Many VPN users don\'t realize their DNS queries are leaking outside the VPN tunnel. Here\'s how to test for leaks and fix them.',
    date: 'April 1, 2026',
    readTime: '5 min read',
    emoji: '🕵️',
  },
  {
    slug: 'vpn-for-torrenting',
    category: 'Torrenting',
    title: 'How to Torrent Safely and Anonymously with a VPN',
    excerpt: 'Torrenting without a VPN puts you at risk of DMCA notices, ISP throttling, and data surveillance. Here\'s how to stay anonymous.',
    date: 'March 28, 2026',
    readTime: '6 min read',
    emoji: '⬇️',
  },
  {
    slug: 'aes-256-encryption-explained',
    category: 'Security',
    title: 'AES-256 Encryption: The Military-Grade Standard Explained',
    excerpt: 'AES-256 is used by governments, banks, and VPNs worldwide. But what does it actually mean? We break it down in plain English.',
    date: 'March 24, 2026',
    readTime: '5 min read',
    emoji: '🔐',
  },
  {
    slug: 'vpn-for-travel',
    category: 'Travel',
    title: 'VPN for Travel: Stay Safe on Hotel and Airport Wi-Fi',
    excerpt: 'Hotel and airport Wi-Fi networks are notoriously insecure. A VPN encrypts your connection and keeps hackers out while you travel.',
    date: 'March 20, 2026',
    readTime: '4 min read',
    emoji: '✈️',
  },
  {
    slug: 'no-logs-vpn-explained',
    category: 'Privacy',
    title: 'No-Logs VPN: What It Means and Why It Matters',
    excerpt: 'Not all VPNs are created equal. A true no-logs policy means your provider has nothing to hand over to authorities — even if asked.',
    date: 'March 15, 2026',
    readTime: '5 min read',
    emoji: '📋',
  },
];

const categoryColors = {
  'Beginner Guide': 'bg-emerald-500/10 text-emerald-400',
  'Streaming': 'bg-purple-500/10 text-purple-400',
  'Business': 'bg-blue-500/10 text-blue-400',
  'Technology': 'bg-orange-500/10 text-orange-400',
  'Privacy': 'bg-cyan-500/10 text-cyan-400',
  'Features': 'bg-violet-500/10 text-violet-400',
  'Gaming': 'bg-red-500/10 text-red-400',
  'Security': 'bg-yellow-500/10 text-yellow-400',
  'Torrenting': 'bg-slate-500/10 text-slate-400',
  'Travel': 'bg-pink-500/10 text-pink-400',
};

export default function Blog() {
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-4">
            📝 VoxVPN Blog
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Privacy Guides & VPN <span className="text-cyan-400">Insights</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Expert guides on VPN technology, online privacy, cybersecurity, and staying safe in a digital world.
          </p>
        </div>

        {/* Featured post */}
        <Link to={`/blog/${featured.slug}`} className="block mb-12 group">
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0d1a20] to-[#0a1020] p-8 md:p-10 hover:border-cyan-500/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[featured.category] || 'bg-slate-500/10 text-slate-400'}`}>
                {featured.category}
              </span>
              <span className="text-slate-600 text-xs">Featured</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-5xl">{featured.emoji}</span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{featured.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span>{featured.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Post grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group block rounded-2xl border border-white/5 bg-[#0d1120] p-6 hover:border-cyan-500/20 transition-all">
              <span className="text-3xl mb-4 block">{post.emoji}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[post.category] || 'bg-slate-500/10 text-slate-400'}`}>
                {post.category}
              </span>
              <h3 className="text-white font-bold text-base mt-3 mb-2 group-hover:text-cyan-400 transition-colors leading-snug">{post.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}