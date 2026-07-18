import React, { useState } from "react";
import { Copy, Download, CheckCircle2, Globe, FileCode } from "lucide-react";

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://voxtelefony.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/VirtualNumbers</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/Services</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/Pricing</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/Contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/AboutUs</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/ESimGuide</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/ESimAvailability</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/DeviceCompatibility</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/us-virtual-number</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/canada-virtual-number</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/uk-virtual-number</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/australia-virtual-number</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/ApplicationForm</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/LaunchCampaign</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/AIAssistant</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/Company</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/Careers</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/Press</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/Blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/Security</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/TransparencyReport</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/ServerStatus</loc>
    <changefreq>daily</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/GumroadStore</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/LegalPolicy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/privacypolicy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/termsofservice</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/acceptableusepolicy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/cookiepolicy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://voxtelefony.com/refundpolicy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>`;

export default function SitemapXml() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SITEMAP_XML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([SITEMAP_XML], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">sitemap.xml</h1>
            <p className="text-gray-400 text-sm">VoxTelefony sitemap for search engines</p>
          </div>
        </div>

        {/* Live link */}
        <div className="flex items-center gap-2 mt-4 mb-6 text-sm">
          <FileCode className="w-4 h-4 text-gray-500" />
          <span className="text-gray-400">Live at:</span>
          <a
            href="https://voxtelefony.com/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            https://voxtelefony.com/sitemap.xml
          </a>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy XML"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download sitemap.xml
          </button>
        </div>

        {/* XML preview */}
        <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-xs text-green-300 overflow-auto max-h-[60vh] whitespace-pre">
          {SITEMAP_XML}
        </pre>

        {/* Info */}
        <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h2 className="text-sm font-semibold text-white mb-2">About this sitemap</h2>
          <p className="text-gray-400 text-xs leading-relaxed">
            This sitemap lists all publicly accessible URLs on VoxTelefony for search engine crawlers.
            Submit it to Google Search Console and Bing Webmaster Tools to improve indexing.
            Authenticated and user-only routes are excluded.
          </p>
        </div>
      </div>
    </div>
  );
}