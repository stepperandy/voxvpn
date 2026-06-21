import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Lock, FileText, Mail, Globe } from 'lucide-react';

const sections = [
  {
    title: '1. Information We Collect',
    subsections: [
      {
        title: 'Account Information',
        text: 'When you create an account, we may collect:',
        list: ['Name', 'Email address', 'Username', 'Subscription information', 'Billing and payment details'],
      },
      {
        title: 'Device Information',
        text: 'We may collect:',
        list: ['Device model', 'Operating system version', 'Application version', 'Crash reports', 'Diagnostic information'],
      },
      {
        title: 'VPN Service Information',
        text: 'VoxVPN operates under a strict no-logs policy. We do not collect, monitor, record, or store:',
        list: ['Browsing history', 'DNS requests', 'Traffic destinations', 'VPN session contents', 'Data transmitted through the VPN tunnel'],
      },
    ],
  },
  {
    title: '2. How We Use Information',
    text: 'We use information to:',
    list: [
      'Create and manage accounts',
      'Process subscriptions and payments',
      'Provide customer support',
      'Improve service reliability',
      'Detect abuse, fraud, and security threats',
      'Comply with legal obligations',
    ],
  },
  {
    title: '3. VPN Permission Usage',
    text: 'VoxVPN uses Android VPNService and related VPN technologies solely to establish encrypted VPN connections between user devices and VoxVPN servers.',
    list: ['VPN permissions are not used for:'],
    nestedList: ['Advertising', 'User tracking', 'Traffic manipulation', 'Selling user information', 'Monitoring browsing activity'],
  },
  {
    title: '4. Third-Party Services',
    text: 'We may use trusted third-party providers for:',
    list: ['Payment processing', 'Analytics', 'Customer support', 'Infrastructure and hosting'],
    note: 'These providers only receive information necessary to perform their services.',
  },
  {
    title: '5. Data Sharing',
    text: 'VoxVPN does not sell personal information. We may disclose information only:',
    list: [
      'To comply with legal obligations',
      'To protect users and service integrity',
      'To investigate fraud or abuse',
      'To trusted service providers operating on our behalf',
    ],
  },
  {
    title: '6. Data Retention',
    text: 'Account and billing information are retained only as necessary to provide services, comply with legal requirements, resolve disputes, and enforce agreements.',
  },
  {
    title: '7. Security',
    text: 'We implement industry-standard administrative, technical, and physical safeguards including:',
    list: ['TLS/SSL encryption', 'Secure authentication systems', 'Access controls', 'Infrastructure monitoring'],
    note: 'No system can guarantee absolute security.',
  },
  {
    title: "8. Children's Privacy",
    text: 'VoxVPN is not directed to children under 13 years of age. We do not knowingly collect personal information from children.',
  },
  {
    title: '9. International Transfers',
    text: 'Information may be processed in countries where our service providers operate. We take reasonable steps to protect transferred information.',
  },
  {
    title: '10. Changes to This Policy',
    text: 'We may update this Privacy Policy from time to time. Continued use of VoxVPN constitutes acceptance of updated terms.',
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Shield size={28} className="text-cyan-400" />
            </div>
            <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight mb-3">VoxVPN Privacy Policy</h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <FileText size={13} className="text-cyan-400" />
              <span className="text-cyan-400 text-xs font-semibold">Effective Date: June 21, 2026</span>
            </div>
          </div>

          {/* Intro */}
          <div className="rounded-2xl p-6 mb-8"
            style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              VoxVPN ("VoxVPN", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard information when you use the VoxVPN mobile applications,
              desktop applications, website, and related services.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i} className="rounded-2xl p-6"
                style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="text-white text-lg font-bold mb-4">{section.title}</h2>
                {section.text && <p className="text-slate-400 text-sm leading-relaxed mb-4">{section.text}</p>}

                {section.subsections && (
                  <div className="space-y-4">
                    {section.subsections.map((sub, j) => (
                      <div key={j} className="pl-4 border-l-2 border-cyan-500/20">
                        <h3 className="text-cyan-400 text-sm font-bold mb-2">{sub.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-2">{sub.text}</p>
                        <ul className="space-y-1.5">
                          {sub.list.map((item, k) => (
                            <li key={k} className="flex items-start gap-2 text-slate-400 text-sm">
                              <span className="text-cyan-400 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {section.list && (
                  <ul className={`space-y-1.5 ${section.nestedList ? 'mb-4' : ''}`}>
                    {section.list.map((item, k) => (
                      <li key={k} className="flex items-start gap-2 text-slate-400 text-sm">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.nestedList && (
                  <ul className="space-y-1.5 pl-4">
                    {section.nestedList.map((item, k) => (
                      <li key={k} className="flex items-start gap-2 text-slate-400 text-sm">
                        <span className="text-slate-600 mt-1">○</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.note && (
                  <p className="text-slate-500 text-sm leading-relaxed mt-3 italic">{section.note}</p>
                )}
              </div>
            ))}
          </div>

          {/* Contact section */}
          <div className="rounded-2xl p-8 mt-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))', border: '1px solid rgba(0,212,255,0.2)' }}>
            <h2 className="text-white text-lg font-bold mb-2">11. Contact</h2>
            <p className="text-slate-300 text-sm font-semibold mb-4">VoxDigits Communications LLC</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://voxvpn.net" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                <Globe size={14} /> voxvpn.net
              </a>
              <a href="mailto:support@voxvpn.net"
                className="flex items-center gap-2 text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                <Mail size={14} /> support@voxvpn.net
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}