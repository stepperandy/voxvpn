import { Mail, Phone } from 'lucide-react';
import SocialIcons from '@/components/landing/SocialIcons';
import { Link, useNavigate } from 'react-router-dom';

const footerSections = [
  {
    title: 'VPN for Countries',
    links: [
      { label: 'VPN for USA', to: '/vpn-for-usa' },
      { label: 'VPN for UK', to: '/vpn-for-uk' },
      { label: 'VPN for Canada', to: '/vpn-for-canada' },
      { label: 'VPN for Australia', to: '/vpn-for-australia' },
      { label: 'VPN for Germany', to: '/vpn-for-germany' },
      { label: 'VPN for France', to: '/vpn-for-france' },
      { label: 'VPN for Japan', to: '/vpn-for-japan' },
    ],
  },
  {
    title: 'VPN by Device',
    links: [
      { label: 'Windows VPN', to: '/windows-vpn' },
      { label: 'Mac VPN', to: '/mac-vpn' },
      { label: 'Linux VPN', to: '/linux-vpn' },
      { label: 'iOS VPN', to: '/ios-vpn' },
      { label: 'Android VPN', to: '/android-vpn' },
      { label: 'Router VPN', to: '/router-vpn' },
      { label: 'Chrome Extension', to: '/chrome-extension' },
    ],
  },
  {
    title: 'Features',
    links: [
      { label: 'No-Logs Policy', to: '/no-logs-policy' },
      { label: 'Kill Switch', to: '/kill-switch' },
      { label: 'Split Tunneling', to: '/split-tunneling' },
      { label: 'AES-256 Encryption', to: '/aes-256-encryption' },
      { label: 'DNS Leak Protection', to: '/dns-leak-protection' },
      { label: 'IPv6 Leak Protection', to: '/ipv6-leak-protection' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'VPN for Streaming', to: '/vpn-for-streaming' },
      { label: 'VPN for Gaming', to: '/vpn-for-gaming' },
      { label: 'VPN for Torrenting', to: '/vpn-for-torrenting' },
      { label: 'VPN for Business', to: '/vpn-for-business' },
      { label: 'VPN for Travel', to: '/vpn-for-travel' },
    ],
  },
  {
    title: 'About VPN',
    links: [
      { label: 'What is a VPN?', to: '/what-is-a-vpn' },
      { label: 'How VPN Works', to: '/how-vpn-works' },
      { label: 'VPN Protocols', to: '/vpn-protocols' },
      { label: 'WireGuard VPN', to: '/wireguard-vpn' },
      { label: 'OpenVPN', to: '/openvpn' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog & Guides', to: '/blog' },
      { label: 'Press & Backlinks', to: '/press' },
      { label: 'Affiliate Program', to: '/affiliate-register' },
      { label: 'VPN Setup Guide', to: '/setup-guide' },
    ],
  },
  {
    title: 'eSIM Providers',
    links: [
      { label: 'VoxGO', external: 'https://voxdigits.com' },
      { label: 'VoxAIR', external: 'https://voxdigits.com' },
      { label: 'VoxZen', external: 'https://voxdigits.com' },
    ],
  },
  {
    title: 'Payment',
    links: [
      { label: 'Credit Card', to: '/', hash: 'pricing' },
      { label: 'PayPal', to: '/', hash: 'pricing' },
      { label: 'Crypto', to: '/', hash: 'pricing' },
      { label: 'Bank Transfer', to: '/', hash: 'pricing' },
    ],
  },
  {
    title: 'Get Help',
    links: [
      { label: 'Support Center', to: '/contact' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Status Page', to: '/status' },
      { label: 'Bug Bounty', to: '/bug-bounty' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
      { label: 'Refund Policy', to: '/refund-policy' },
    ],
  },
];

function FooterLinkItem({ link, onHash }) {
  if (link.external) {
    return <a href={link.external} target="_blank" rel="noopener noreferrer" className="text-slate-500 text-xs hover:text-cyan-400 transition-colors">{link.label}</a>;
  }
  if (link.hash) {
    return <button onClick={() => onHash(link)} className="text-slate-500 text-xs hover:text-cyan-400 transition-colors text-left">{link.label}</button>;
  }
  return <Link to={link.to} className="text-slate-500 text-xs hover:text-cyan-400 transition-colors">{link.label}</Link>;
}

export default function Footer() {
  const navigate = useNavigate();

  const handleHash = (link) => {
    navigate(link.to);
    setTimeout(() => {
      const el = document.getElementById(link.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-[#060910] border-t border-white/5 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Brand row */}
        <div className="flex flex-col sm:flex-row gap-6 mb-10 items-start">
          <div className="flex-shrink-0 max-w-[200px]">
            <Link to="/">
              <img
                src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/13431de73_VoxICON.png"
                alt="VoxVPN"
                className="h-16 w-auto mb-4 hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Your privacy is our priority. Stay protected, stay unrestricted.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Mail size={13} className="text-cyan-500" />
                <a href="mailto:support@voxdigits.com" className="hover:text-cyan-400 transition-colors">support@voxdigits.com</a>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Phone size={13} className="text-cyan-500" />
                <span>+1 641 681 8821</span>
              </div>
            </div>
          </div>

          {/* All link columns — responsive grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <FooterLinkItem link={link} onHash={handleHash} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Distribution — payment, app stores, social */}
        <div className="border-t border-white/5 pt-10 pb-8 space-y-8">
          {/* Payment methods — full width row */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">We Accept</span>
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/d9f1ec5eb_image.png"
              alt="Payment Methods: Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay, Hubtel, Alipay, WeChat Pay, MTN MoMo"
              className="h-[54px] w-auto object-contain mix-blend-screen"
            />
          </div>

          {/* App stores + Social — two columns */}
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
            {/* App store badges */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <a href="https://play.google.com/store/apps/details?id=net.openvpn.openvpn" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-black border border-white/20 rounded-xl hover:opacity-90 transition-opacity">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M3.18 23.76c.3.17.65.19.97.06l13.2-7.62-2.82-2.82-11.35 10.38z" fill="#EA4335"/>
                  <path d="M21.37 10.3L18.5 8.63l-3.12 3.12 3.12 3.12 2.9-1.67c.83-.48.83-1.42-.03-1.9z" fill="#FBBC05"/>
                  <path d="M3.18.24C2.85.38 2.63.74 2.63 1.22v21.56c0 .48.22.84.55.98l.1.06 12.07-12.07v-.28L3.28.18l-.1.06z" fill="#4285F4"/>
                  <path d="M15.35 11.75l-3.12-3.12L.17.24C.09.26.02.3 0 .37L12.22 12l3.13-3.13v2.88z" fill="#34A853"/>
                </svg>
                <div>
                  <div className="text-white/60 text-[8px] leading-none">GET IT ON</div>
                  <div className="text-white font-bold text-sm leading-tight">Google Play</div>
                </div>
              </a>
              <a href="https://apps.apple.com/app/openvpn-connect/id590379981" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-black border border-white/20 rounded-xl hover:opacity-90 transition-opacity">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div>
                  <div className="text-white/60 text-[8px] leading-none">Download on the</div>
                  <div className="text-white font-bold text-sm leading-tight">App Store</div>
                </div>
              </a>
            </div>

            {/* Social media */}
            <div className="flex flex-col items-center sm:items-end gap-2">
              <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Follow Us</span>
              <SocialIcons />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 text-slate-600 text-xs flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>© 2026 VoxDigits Communications LLC. All rights reserved. www.voxvpn.net</span>
          <div className="flex gap-4 justify-center">
            <Link to="/privacy-policy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}