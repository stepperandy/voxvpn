import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, Copy, CheckCircle2, Search, MousePointerClick, Megaphone, Mail, Share2, FileText } from 'lucide-react';

const TABS = [
  { id: 'seo', label: 'SEO', icon: Search, desc: 'Meta tags, keywords & page descriptions' },
  { id: 'ppc', label: 'PPC Ads', icon: MousePointerClick, desc: 'Google & Bing ad copy' },
  { id: 'social', label: 'Social Media', icon: Share2, desc: 'Posts for Twitter, LinkedIn, Facebook' },
  { id: 'email', label: 'Email', icon: Mail, desc: 'Email campaigns & subject lines' },
  { id: 'blog', label: 'Blog', icon: FileText, desc: 'Blog post ideas & outlines' },
  { id: 'promo', label: 'Promotions', icon: Megaphone, desc: 'Offers, banners & announcements' },
];

const PROMPTS = {
  seo: `You are a VPN SEO expert. Generate SEO content for VoxVPN (www.voxvpn.net), a premium VPN service by VoxDigits Communications LLC.
Return JSON with:
- page_title: string (60 chars max, for homepage)
- meta_description: string (155 chars max)
- focus_keywords: array of 8 high-value VPN keywords
- long_tail_keywords: array of 6 long-tail keywords
- h1_suggestions: array of 3 H1 headline options
- internal_link_strategy: array of 4 recommended internal link opportunities with anchor text and target page`,

  ppc: `You are a PPC advertising expert. Generate Google Ads and Bing Ads copy for VoxVPN (www.voxvpn.net), a premium VPN service.
Return JSON with:
- google_ads: array of 3 ads, each with: headline1, headline2, headline3, description1, description2, display_url
- bing_ads: array of 2 ads, each with: headline, description, display_url
- ad_extensions: object with: sitelinks (array of 4 with text and url), callouts (array of 6 short callout strings)
- recommended_keywords: array of 6 high-intent keywords with match type (exact/phrase/broad)`,

  social: `You are a social media marketing expert. Generate social media content for VoxVPN (www.voxvpn.net), a premium VPN service by VoxDigits Communications LLC.
Return JSON with:
- twitter_posts: array of 4 tweets (max 280 chars each, include hashtags)
- linkedin_post: string (professional tone, 150-200 words)
- facebook_post: string (engaging, conversational, 100-150 words)
- instagram_caption: string (with emojis and hashtags, 80-120 words)
- hashtags: array of 12 recommended hashtags`,

  email: `You are an email marketing expert. Generate email campaign content for VoxVPN (www.voxvpn.net), a premium VPN service.
Return JSON with:
- campaigns: array of 3 campaigns, each with: name, subject_line, preview_text, headline, body (2-3 sentences), cta_text
- subject_line_ideas: array of 6 additional subject line variations
- welcome_email: object with: subject, body (3-4 sentences), cta`,

  blog: `You are a content marketing expert. Generate blog content ideas for VoxVPN (www.voxvpn.net), a premium VPN service.
Return JSON with:
- post_ideas: array of 5 posts, each with: title, meta_description, outline (array of 4-5 section headings), target_keyword, estimated_word_count
- content_calendar: array of 4 weekly themes with topic suggestion`,

  promo: `You are a promotions and campaign expert. Generate promotional content for VoxVPN (www.voxvpn.net), a premium VPN service.
Return JSON with:
- offers: array of 4 promotional offers, each with: name, headline, description, discount_text, urgency_text, cta
- banner_copy: array of 3 banner ad texts with: headline, subtext, cta
- referral_campaign: object with: headline, description, reward_text, cta`,
};

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-cyan-400 transition-colors flex-shrink-0">
      {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

function ContentBlock({ label, value }) {
  if (!value) return null;
  const text = Array.isArray(value) ? value.join('\n') : String(value);
  return (
    <div className="rounded-xl border border-white/5 bg-[#060910] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{label}</p>
        <CopyBtn text={text} />
      </div>
      {Array.isArray(value) ? (
        <ul className="space-y-1.5">
          {value.map((item, i) => (
            <li key={i} className="text-slate-200 text-sm flex items-start gap-2">
              <span className="text-cyan-500 mt-1 flex-shrink-0">›</span>
              <span>{typeof item === 'object' ? JSON.stringify(item, null, 2) : item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      )}
    </div>
  );
}

function renderContent(tab, data) {
  if (!data) return null;

  if (tab === 'seo') return (
    <div className="space-y-4">
      <ContentBlock label="Page Title" value={data.page_title} />
      <ContentBlock label="Meta Description" value={data.meta_description} />
      <ContentBlock label="Focus Keywords" value={data.focus_keywords} />
      <ContentBlock label="Long-Tail Keywords" value={data.long_tail_keywords} />
      <ContentBlock label="H1 Suggestions" value={data.h1_suggestions} />
      <div className="rounded-xl border border-white/5 bg-[#060910] p-4">
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Internal Link Strategy</p>
        <div className="space-y-2">
          {(data.internal_link_strategy || []).map((link, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-cyan-400 font-medium">{link.anchor_text}</span>
              <span className="text-slate-600">→</span>
              <span className="text-slate-400">{link.target_page}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (tab === 'ppc') return (
    <div className="space-y-5">
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Google Ads</p>
        <div className="space-y-3">
          {(data.google_ads || []).map((ad, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-[#060910] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-cyan-400 text-sm font-bold">{ad.headline1} | {ad.headline2} | {ad.headline3}</p>
                  <p className="text-emerald-500 text-xs mt-1">{ad.display_url}</p>
                  <p className="text-slate-300 text-sm mt-1">{ad.description1}</p>
                  <p className="text-slate-400 text-sm">{ad.description2}</p>
                </div>
                <CopyBtn text={`${ad.headline1} | ${ad.headline2} | ${ad.headline3}\n${ad.description1}\n${ad.description2}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Bing Ads</p>
        <div className="space-y-3">
          {(data.bing_ads || []).map((ad, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-[#060910] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-cyan-400 text-sm font-bold">{ad.headline}</p>
                  <p className="text-emerald-500 text-xs">{ad.display_url}</p>
                  <p className="text-slate-300 text-sm mt-1">{ad.description}</p>
                </div>
                <CopyBtn text={`${ad.headline}\n${ad.description}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <ContentBlock label="Callout Extensions" value={data.ad_extensions?.callouts} />
      <div className="rounded-xl border border-white/5 bg-[#060910] p-4">
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Recommended Keywords</p>
        <div className="flex flex-wrap gap-2">
          {(data.recommended_keywords || []).map((kw, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {typeof kw === 'object' ? `${kw.keyword} [${kw.match_type}]` : kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (tab === 'social') return (
    <div className="space-y-4">
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Twitter / X Posts</p>
        <div className="space-y-3">
          {(data.twitter_posts || []).map((post, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-[#060910] p-4 flex items-start justify-between gap-2">
              <p className="text-slate-200 text-sm leading-relaxed">{post}</p>
              <CopyBtn text={post} />
            </div>
          ))}
        </div>
      </div>
      <ContentBlock label="LinkedIn Post" value={data.linkedin_post} />
      <ContentBlock label="Facebook Post" value={data.facebook_post} />
      <ContentBlock label="Instagram Caption" value={data.instagram_caption} />
      <div className="rounded-xl border border-white/5 bg-[#060910] p-4">
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Hashtags</p>
        <div className="flex flex-wrap gap-2">
          {(data.hashtags || []).map((tag, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );

  if (tab === 'email') return (
    <div className="space-y-5">
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Email Campaigns</p>
        <div className="space-y-3">
          {(data.campaigns || []).map((c, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-[#060910] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-white text-sm font-bold">{c.name}</p>
                  <p className="text-cyan-400 text-xs mt-1">Subject: {c.subject_line}</p>
                  <p className="text-slate-500 text-xs">Preview: {c.preview_text}</p>
                  <p className="text-white text-sm font-semibold mt-2">{c.headline}</p>
                  <p className="text-slate-400 text-sm mt-1">{c.body}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{c.cta_text}</span>
                </div>
                <CopyBtn text={`Subject: ${c.subject_line}\n\n${c.headline}\n\n${c.body}\n\nCTA: ${c.cta_text}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <ContentBlock label="Subject Line Ideas" value={data.subject_line_ideas} />
      {data.welcome_email && (
        <div className="rounded-xl border border-white/5 bg-[#060910] p-4">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Welcome Email</p>
          <p className="text-cyan-400 text-xs">Subject: {data.welcome_email.subject}</p>
          <p className="text-slate-200 text-sm mt-2 leading-relaxed">{data.welcome_email.body}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{data.welcome_email.cta}</span>
        </div>
      )}
    </div>
  );

  if (tab === 'blog') return (
    <div className="space-y-4">
      <div className="space-y-4">
        {(data.post_ideas || []).map((post, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-[#060910] p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-white text-sm font-bold">{post.title}</p>
                <p className="text-slate-400 text-xs mt-1">{post.meta_description}</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs text-cyan-400">🎯 {post.target_keyword}</span>
                  <span className="text-xs text-slate-500">~{post.estimated_word_count} words</span>
                </div>
                <div className="mt-3 space-y-1">
                  {(post.outline || []).map((h, j) => (
                    <p key={j} className="text-slate-500 text-xs flex items-center gap-2">
                      <span className="text-slate-700">{j + 1}.</span> {h}
                    </p>
                  ))}
                </div>
              </div>
              <CopyBtn text={`${post.title}\n\n${post.meta_description}\n\nOutline:\n${(post.outline || []).join('\n')}`} />
            </div>
          </div>
        ))}
      </div>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Content Calendar</p>
        <div className="grid grid-cols-2 gap-3">
          {(data.content_calendar || []).map((week, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-[#060910] p-3">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider">Week {i + 1}</p>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">{week.theme || week.topic_suggestion || JSON.stringify(week)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (tab === 'promo') return (
    <div className="space-y-5">
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Promotional Offers</p>
        <div className="space-y-3">
          {(data.offers || []).map((offer, i) => (
            <div key={i} className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-emerald-400 text-xs font-bold uppercase">{offer.name}</p>
                  <p className="text-white text-sm font-bold mt-1">{offer.headline}</p>
                  <p className="text-slate-400 text-sm">{offer.description}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{offer.discount_text}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20">{offer.urgency_text}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{offer.cta}</span>
                  </div>
                </div>
                <CopyBtn text={`${offer.headline}\n${offer.description}\n${offer.discount_text} | ${offer.urgency_text}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Banner Ad Copy</p>
        <div className="space-y-3">
          {(data.banner_copy || []).map((b, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-[#060910] p-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-white text-sm font-bold">{b.headline}</p>
                <p className="text-slate-400 text-sm">{b.subtext}</p>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{b.cta}</span>
              </div>
              <CopyBtn text={`${b.headline}\n${b.subtext}\n${b.cta}`} />
            </div>
          ))}
        </div>
      </div>
      {data.referral_campaign && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
          <p className="text-violet-400 text-xs font-bold uppercase mb-2">Referral Campaign</p>
          <p className="text-white text-sm font-bold">{data.referral_campaign.headline}</p>
          <p className="text-slate-400 text-sm mt-1">{data.referral_campaign.description}</p>
          <p className="text-violet-300 text-sm mt-1 font-medium">{data.referral_campaign.reward_text}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-violet-500/15 text-violet-400 border border-violet-500/20">{data.referral_campaign.cta}</span>
        </div>
      )}
    </div>
  );

  return null;
}

export default function MarketingView() {
  const [activeTab, setActiveTab] = useState('seo');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});

  const generate = async (tab) => {
    setLoading(l => ({ ...l, [tab]: true }));
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: PROMPTS[tab],
        response_json_schema: { type: 'object', properties: {}, additionalProperties: true },
      });
      setData(d => ({ ...d, [tab]: result }));
    } finally {
      setLoading(l => ({ ...l, [tab]: false }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (!data[tab] && !loading[tab]) generate(tab);
  };

  // Auto-generate first tab
  useState(() => { generate('seo'); });

  const activeTabMeta = TABS.find(t => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">AI Marketing Generator</h2>
          <p className="text-slate-500 text-sm mt-1">AI-generated SEO, PPC, and marketing content for VoxVPN</p>
        </div>
        <button
          onClick={() => generate(activeTab)}
          disabled={loading[activeTab]}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 transition-all disabled:opacity-50"
        >
          {loading[activeTab]
            ? <Loader2 size={14} className="animate-spin" />
            : <RefreshCw size={14} />}
          Regenerate
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                isActive
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-[#0d1120] border-white/5 text-slate-500 hover:text-white hover:border-white/10'
              }`}
            >
              <Icon size={14} />
              {tab.label}
              {loading[tab.id] && <Loader2 size={11} className="animate-spin ml-1" />}
              {data[tab.id] && !loading[tab.id] && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
        {loading[activeTab] ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={32} className="text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Generating {activeTabMeta?.label} content with AI…</p>
          </div>
        ) : data[activeTab] ? (
          renderContent(activeTab, data[activeTab])
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <activeTabMeta.icon size={32} className="text-slate-600" />
            <p className="text-slate-500 text-sm">Click "Regenerate" to generate {activeTabMeta?.label} content</p>
            <button onClick={() => generate(activeTab)} className="px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl text-sm font-semibold hover:bg-cyan-500/20 transition-all">
              Generate Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}