import { Mail, Phone } from 'lucide-react';
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
    title: 'VPN Download by OS',
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
      { label: 'Live Chat', to: '/contact' },
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
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/4c008ebc8_image.png"
              alt="VoxVPN"
              className="h-10 w-auto mb-4"
            />
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Your privacy is our priority. Stay protected, stay unrestricted.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Mail size={13} className="text-cyan-500" />
                <a href="mailto:support@voxvpn.net" className="hover:text-cyan-400 transition-colors">support@voxvpn.net</a>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Phone size={13} className="text-cyan-500" />
                <span>+1 (555) 123-4567</span>
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
                    {link.hash ? (
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
                    {link.hash ? (
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
            <a href="#" className="hover:opacity-90 transition-opacity">
              <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/500ebc6c2_generated_image.png" alt="Apple App Store" className="h-10 w-auto" />
            </a>
            <a href="#" className="hover:opacity-90 transition-opacity">
              <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/04eefca08_generated_image.png" alt="Google Play Store" className="h-10 w-auto" />
            </a>
          </div>

          {/* Payment icons */}
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'AMEX', 'PayPal', 'BTC'].map((p) => (
              <span key={p} className="px-2 py-1 bg-[#0d1120] border border-white/10 rounded text-xs text-slate-400 font-medium">{p}</span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 text-center text-slate-600 text-xs flex flex-col sm:flex-row justify-between">
          <span>© 2024 VoxVPN. All rights reserved.</span>
          <div className="flex gap-4 justify-center mt-2 sm:mt-0">
            <Link to="/privacy-policy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}