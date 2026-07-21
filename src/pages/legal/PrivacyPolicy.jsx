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
  {
    title: '11. GDPR Compliance (EU/EEA/UK Users)',
    text: 'VoxVPN complies with the General Data Protection Regulation (GDPR). For users in the European Union, European Economic Area, and the United Kingdom:',
    list: [
      'Lawful Basis: We process personal data based on consent, contract performance, and legitimate interests.',
      'Right to Access: You may request a copy of your personal data we hold.',
      'Right to Rectification: You may request correction of inaccurate personal data.',
      'Right to Erasure ("Right to Be Forgotten"): You may request deletion of your personal data and account.',
      'Right to Data Portability: You may request your data in a machine-readable format.',
      'Right to Object: You may object to processing of your data based on legitimate interests.',
      'Right to Withdraw Consent: You may withdraw consent for data processing at any time.',
      'Data Protection Officer: Contact admin@voxdigits.com for GDPR-related requests.',
    ],
  },
  {
    title: '12. CCPA Compliance (California Residents)',
    text: 'Under the California Consumer Privacy Act (CCPA), California residents have the following rights:',
    list: [
      'Right to Know: What personal information we collect and how it is used.',
      'Right to Delete: Request deletion of your personal information.',
      'Right to Opt-Out: Opt out of the "sale" or "sharing" of personal information. VoxVPN does not sell personal information.',
      'Right to Non-Discrimination: Equal service regardless of exercising privacy rights.',
      'How to Exercise Rights: Email admin@voxdigits.com with your request.',
    ],
  },
  {
    title: '13. Data Deletion',
    text: 'You have the right to request deletion of your account and all associated personal data at any time.',
    list: [
      'Account Deletion: Use the "Delete Account" feature in the app or dashboard, or email info@voxdigits.com.',
      'VPN Activity Data: No VPN activity data is stored, so there is nothing to delete — we have no logs to remove.',
      'Processing Time: Account deletion requests are processed within 30 days.',
      'Verification: We may verify your identity before processing deletion requests to protect account security.',
      'Residual Data: Some data may be retained as required by law (e.g., billing records for tax compliance).',
    ],
  },
  {
    title: '14. No-Log Policy',
    text: 'VoxVPN operates under a strict, independently audited no-logs policy:',
    list: [
      'We do not log browsing history, visited websites, or URLs.',
      'We do not log DNS queries or DNS resolution requests.',
      'We do not log connection timestamps, session durations, or disconnection events.',
      'We do not log user IP addresses on VPN servers.',
      'We do not log bandwidth usage, traffic volume, or data transferred per user.',
      'We do not log the servers or locations a user connects to.',
      'Servers operate in RAM-only mode — all data is wiped on reboot.',
      'Our no-logs policy is verified by independent third-party security audits. See our Security Audit page.',
    ],
  },
  {
    title: '15. Encryption',
    text: 'All VPN connections are encrypted with AES-256 encryption, the same standard used by governments and financial institutions.',
    list: [
      'AES-256-GCM encryption on all OpenVPN connections.',
      'ChaCha20 encryption on WireGuard connections.',
      'TLS 1.3 for website and API communications.',
      'Perfect Forward Secrecy (PFS) on all connections.',
    ],
  },
  {
    title: '16. Third-Party Processors',
    text: 'We work with the following third-party service providers who may process limited personal data:',
    list: [
      'Stripe — Payment processing (PCI-DSS compliant). We do not store full card numbers.',
      'Cloud Infrastructure Providers — Server hosting for VPN servers and web infrastructure.',
      'Email Service Providers — Transactional and support email delivery.',
      'Analytics Providers — Aggregated, anonymized usage analytics only (no personally identifiable browsing data).',
    ],
    note: 'Third-party processors are bound by data processing agreements and may only use data to provide services to VoxVPN. We do not share data for advertising purposes.',
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
            <p className="text-slate-300 text-sm font-semibold mb-1">VoxDigits Communications LLC</p>
            <p className="text-slate-500 text-xs mb-1">16809 Capon Tree Ln, Woodbridge, VA 22191, USA</p>
            <p className="text-slate-500 text-xs mb-4">Registration No. 11986542</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://voxvpn.net" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                <Globe size={14} /> voxvpn.net
              </a>
              <a href="mailto:info@voxdigits.com"
                className="flex items-center gap-2 text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                <Mail size={14} /> info@voxdigits.com
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}