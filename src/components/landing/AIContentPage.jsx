import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Zap, Lock, Globe, Loader2 } from 'lucide-react';

const ICONS = [Shield, Zap, Lock, Globe];

export default function AIContentPage({ topic, badge, emoji, ctaLabel, ctaHref }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.integrations.Core.InvokeLLM({
      prompt: `You are a VPN marketing copywriter for VoxVPN. Generate content for a landing page about: "${topic}".
Return JSON with exactly these fields:
- headline: string (catchy H1, max 8 words, no quotes)
- subheadline: string (1-2 sentence description, max 30 words)
- cards: array of exactly 4 objects, each with: title (3-5 words), desc (1 sentence, max 20 words)
- cta_headline: string (short call to action headline, max 8 words)`,
      response_json_schema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          subheadline: { type: 'string' },
          cards: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                desc: { type: 'string' },
              },
            },
          },
          cta_headline: { type: 'string' },
        },
      },
    })
      .then(setContent)
      .finally(() => setLoading(false));
  }, [topic]);

  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={36} className="text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Generating fresh content…</p>
          </div>
        ) : (
          <>
            <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">
              {emoji} {badge}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
              {content?.headline?.split(' ').map((word, i, arr) =>
                i === arr.length - 1
                  ? <span key={i} className="text-cyan-400"> {word}</span>
                  : <span key={i}>{i > 0 ? ' ' : ''}{word}</span>
              )}
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-10">{content?.subheadline}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {(content?.cards || []).map((card, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <div key={i} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
                    <Icon size={22} className="text-cyan-400 mb-3" />
                    <h3 className="text-white font-semibold mb-2">{card.title}</h3>
                    <p className="text-slate-400 text-sm">{card.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">{content?.cta_headline}</h2>
              <a
                href={ctaHref || '/#pricing'}
                className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all"
              >
                {ctaLabel || 'Get Protected Now'}
              </a>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}