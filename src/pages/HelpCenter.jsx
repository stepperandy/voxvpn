import React, { useState } from 'react';
import { Search, ChevronRight, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HelpCenter() {
  const [search, setSearch] = useState('');

  const categories = [
    {
      title: 'Getting Started',
      articles: [
        { title: 'How to Download VoxVPN', slug: 'download' },
        { title: 'Create Your Account', slug: 'signup' },
        { title: 'First VPN Connection', slug: 'first-connection' },
      ],
    },
    {
      title: 'Connection & Performance',
      articles: [
        { title: 'Can\'t Connect? Troubleshooting', slug: 'connection-issues' },
        { title: 'Improve Your Speed', slug: 'speed-optimization' },
        { title: 'Server Selection Guide', slug: 'server-selection' },
      ],
    },
    {
      title: 'Subscription & Billing',
      articles: [
        { title: 'Plans & Pricing', slug: 'plans' },
        { title: 'Upgrade or Downgrade Plan', slug: 'change-plan' },
        { title: 'Cancel Subscription', slug: 'cancel' },
        { title: 'View Billing History', slug: 'billing' },
      ],
    },
    {
      title: 'Account & Security',
      articles: [
        { title: 'Enable 2-Factor Authentication', slug: '2fa' },
        { title: 'Reset Your Password', slug: 'password-reset' },
        { title: 'Manage Payment Methods', slug: 'payment-methods' },
        { title: 'Delete Your Account', slug: 'delete-account' },
      ],
    },
    {
      title: 'Advanced Features',
      articles: [
        { title: 'Split Tunneling Setup', slug: 'split-tunneling' },
        { title: 'VPN on Router', slug: 'router-setup' },
        { title: 'Speed Test', slug: 'speed-test' },
        { title: 'Referral Program', slug: 'referrals' },
      ],
    },
  ];

  const filtered = search
    ? categories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(a =>
          a.title.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.articles.length > 0)
    : categories;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080c18] to-[#0d1120] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Help Center</h1>
          <p className="text-slate-400 mb-6">Find answers and solutions to common questions</p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid gap-6">
          {filtered.map((category, idx) => (
            <div key={idx}>
              <h2 className="text-xl font-bold text-cyan-400 mb-3">{category.title}</h2>
              <div className="grid gap-2">
                {category.articles.map((article, i) => (
                  <a
                    key={i}
                    href={`/help/article/${article.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/30 transition-all"
                  >
                    <span>{article.title}</span>
                    <ChevronRight size={18} className="text-slate-500" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still need help? */}
        <div className="mt-12 p-6 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
          <h3 className="text-xl font-bold mb-2">Still need help?</h3>
          <p className="text-slate-400 mb-4">Our support team is here 24/7</p>
          <div className="flex gap-3 flex-wrap">
            <a href="mailto:support@voxvpn.com" className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-bold">
              Email Support
            </a>
            <a href="/contact" className="px-4 py-2 rounded-lg border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}