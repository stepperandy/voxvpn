import { useState } from 'react';
import { Copy, Check, Share2, UserPlus, Link as LinkIcon } from 'lucide-react';

export default function ReferralCodeCard({ referralCode }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fullLink = referralCode
    ? `${window.location.origin}/?ref=${referralCode}`
    : '';

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(fullLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join VoxDigits',
          text: 'Get a virtual number or eSIM with VoxDigits. Use my referral code:',
          url: fullLink,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5 text-cyan-400" />
        <h2 className="text-sm font-bold text-white">Your Referral Code</h2>
      </div>

      {/* Code */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 px-4 py-3 bg-slate-950/50 rounded-lg border border-slate-700/50">
          <p className="text-lg font-bold text-cyan-400 tracking-wider">
            {referralCode || 'Generating…'}
          </p>
        </div>
        <button
          onClick={copyCode}
          disabled={!referralCode}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {copiedCode ? (
            <Check className="w-5 h-5 text-green-400" />
          ) : (
            <Copy className="w-5 h-5 text-gray-300" />
          )}
        </button>
      </div>

      {/* Shareable link */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 px-4 py-2.5 bg-slate-950/50 rounded-lg border border-slate-700/50">
          <p className="text-xs text-gray-400 truncate">{fullLink || '—'}</p>
        </div>
        <button
          onClick={copyLink}
          disabled={!referralCode}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {copiedLink ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <LinkIcon className="w-4 h-4 text-gray-300" />
          )}
        </button>
      </div>

      {/* Share button */}
      <button
        onClick={share}
        disabled={!referralCode}
        className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Share2 className="w-4 h-4" />
        Share with friends
      </button>
    </div>
  );
}