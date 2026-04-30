import { Mail, Phone, Facebook, Youtube } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const footerSections = [
  {
    title: 'VPN for Countries',
    links: [
      { label: 'VPN for USA', external: 'https://voxvpn.net/#pricing' },
      { label: 'VPN for UK', external: 'https://voxvpn.net/#pricing' },
      { label: 'VPN for Canada', external: 'https://voxvpn.net/#pricing' },
      { label: 'VPN for Australia', external: 'https://voxvpn.net/#pricing' },
      { label: 'VPN for Germany', external: 'https://voxvpn.net/#pricing' },
      { label: 'VPN for France', external: 'https://voxvpn.net/#pricing' },
      { label: 'VPN for Japan', external: 'https://voxvpn.net/#pricing' },
    ],
  },
  {
    title: 'VPN Download by OS',
    links: [
      { label: 'Windows VPN', external: 'https://voxvpn.net/#pricing' },
      { label: 'Mac VPN', external: 'https://voxvpn.net/#pricing' },
      { label: 'Linux VPN', external: 'https://voxvpn.net/#pricing' },
      { label: 'iOS VPN', external: 'https://voxvpn.net/#pricing' },
      { label: 'Android VPN', external: 'https://voxvpn.net/#pricing' },
      { label: 'Router VPN', external: 'https://voxvpn.net/#pricing' },
      { label: 'Chrome Extension', external: 'https://voxvpn.net/#pricing' },
    ],
  },
  {
    title: 'Features',
    links: [
      { label: 'No-Logs Policy', external: 'https://voxvpn.net/#pricing' },
      { label: 'Kill Switch', external: 'https://voxvpn.net/#pricing' },
      { label: 'Split Tunneling', external: 'https://voxvpn.net/#pricing' },
      { label: 'AES-256 Encryption', external: 'https://voxvpn.net/#pricing' },
      { label: 'DNS Leak Protection', external: 'https://voxvpn.net/#pricing' },
      { label: 'IPv6 Leak Protection', external: 'https://voxvpn.net/#pricing' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'VPN for Streaming', external: 'https://voxvpn.net/#pricing' },
      { label: 'VPN for Gaming', external: 'https://voxvpn.net/#pricing' },
      { label: 'VPN for Torrenting', external: 'https://voxvpn.net/#pricing' },
      { label: 'VPN for Business', external: 'https://voxvpn.net/#pricing' },
      { label: 'VPN for Travel', external: 'https://voxvpn.net/#pricing' },
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
    title: 'Legal Offers',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
      { label: 'Refund Policy', to: '/refund-policy' },
    ],
  },
];

export default function Footer() {
  const navigate = useNavigate();

  const handleLink = (link) => {
    if (link.hash) {
      navigate(link.to);
      setTimeout(() => {
        const el = document.getElementById(link.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <footer className="bg-[#060910] border-t border-white/5 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top: logo + columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
              alt="VoxVPN"
              className="h-16 w-auto mb-4"
            />
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

          {/* Footer link columns */}
          {footerSections.slice(0, 4).map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-xs font-bold mb-4 uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.external} target="_blank" rel="noopener noreferrer" className="text-slate-500 text-xs hover:text-cyan-400 transition-colors">{link.label}</a>
                    ) : link.hash ? (
                      <button onClick={() => handleLink(link)} className="text-slate-500 text-xs hover:text-cyan-400 transition-colors text-left">{link.label}</button>
                    ) : (
                      <Link to={link.to} className="text-slate-500 text-xs hover:text-cyan-400 transition-colors">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Second row of columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12 lg:ml-[20%]">
          {footerSections.slice(4).map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-xs font-bold mb-4 uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.external} target="_blank" rel="noopener noreferrer" className="text-slate-500 text-xs hover:text-cyan-400 transition-colors">{link.label}</a>
                    ) : link.hash ? (
                      <button onClick={() => handleLink(link)} className="text-slate-500 text-xs hover:text-cyan-400 transition-colors text-left">{link.label}</button>
                    ) : (
                      <Link to={link.to} className="text-slate-500 text-xs hover:text-cyan-400 transition-colors">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App store badges */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <a href="https://apps.apple.com/app/openvpn-connect/id590379981" target="_blank" rel="noopener noreferrer" className="hover:opacity-90 transition-opacity">
              <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/49e04d038_image.png" alt="Download on the App Store" className="h-10 w-auto" />
            </a>
            <a href="https://play.google.com/store/apps/details?id=net.openvpn.openvpn" target="_blank" rel="noopener noreferrer" className="hover:opacity-90 transition-opacity">
              <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/1349633d5_image.png" alt="Get it on Google Play" className="h-10 w-auto" />
            </a>
          </div>

          {/* Payment icons */}
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'AMEX', 'PayPal', 'BTC'].map((p) => (
              <span key={p} className="px-2 py-1 bg-[#0d1120] border border-white/10 rounded text-xs text-slate-400 font-medium">{p}</span>
            ))}
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