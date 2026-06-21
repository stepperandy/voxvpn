import { Mail, Phone, Facebook, Youtube } from 'lucide-react';
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

        {/* Payment logos + App store badges */}
        <div className="border-t border-white/5 pt-8 flex flex-col items-center gap-6">
          {/* Payment method icons */}
          <div className="flex items-center justify-center">
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/7ffc067ed_image.png"
              alt="Payment Methods: Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay, Hubtel, Alipay, WeChat Pay, MTN MoMo"
              className="h-48 w-auto object-contain mix-blend-screen"
            />
          </div>

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
        </div>

        {/* Social Media Icons */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {[
            { href: 'https://facebook.com', bg: '#1877F2', icon: <Facebook size={16} /> },
            { href: 'https://x.com', bg: '#000000', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            { href: 'https://pinterest.com', bg: '#E60023', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg> },
            { href: 'https://instagram.com', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
            { href: 'https://youtube.com', bg: '#FF0000', icon: <Youtube size={16} /> },
          ].map(({ href, bg, icon }, i) => (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
              style={{ background: bg }}>
              {icon}
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-6 text-center text-slate-600 text-xs flex flex-col sm:flex-row justify-between">
          <span>© 2026 VoxDigits Communications LLC. All rights reserved. www.voxvpn.net</span>
          <div className="flex gap-4 justify-center mt-2 sm:mt-0">
            <Link to="/privacy-policy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}