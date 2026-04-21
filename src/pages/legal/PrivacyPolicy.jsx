import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';

const sections = [
  {
    title: '1. Information We Collect',
    content: null,
    subsections: [
      {
        title: 'a. Personal Information',
        text: 'We may collect personal information you provide directly to us, including:',
        list: ['Name', 'Email address', 'Phone number', 'Billing and payment details', 'Account login credentials'],
      },
      {
        title: 'b. Usage Data',
        text: 'We may automatically collect limited technical and usage information, such as:',
        list: ['Device type and operating system', 'App usage statistics', 'IP address used temporarily for service functionality and security', 'Connection diagnostics and minimal service logs'],
      },
      {
        title: 'c. VPN-Specific Data Policy',
        text: 'We operate a strict no-activity-logs policy. We do not:',
        list: ['Log browsing activity', 'Store traffic content', 'Monitor websites visited'],
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    text: 'We use collected information to:',
    list: [
      'Provide, operate, and maintain our services',
      'Process payments through third-party payment providers',
      'Improve app performance and user experience',
      'Provide customer support',
      'Detect, prevent, and address fraud, abuse, and security issues',
      'Comply with applicable legal obligations',
    ],
  },
  {
    title: '3. Tracking, Analytics, and Permissions',
    paragraphs: [
      'Our apps may use analytics and diagnostic tools to understand app performance, improve service reliability, and enhance user experience.',
      'Where required, we will request permission before collecting or using data for tracking purposes. Users can manage permissions through their device settings.',
    ],
    note: 'If your iOS app includes tracking-related permissions or declarations, your App Store privacy answers must match your app\'s actual behavior and permissions.',
  },
  {
    title: '4. Sharing of Information',
    paragraphs: [
      'We do not sell personal information to third parties.',
      'We may share information with trusted third parties, including:',
    ],
    list: [
      'Payment processors, such as Stripe or other billing partners',
      'Cloud hosting and infrastructure providers',
      'Analytics and performance monitoring providers',
      'Legal or regulatory authorities when required by law',
    ],
    after: 'These third parties are expected to handle your information securely and only for authorized purposes.',
  },
  {
    title: '5. Data Retention',
    text: 'We retain information only for as long as necessary to fulfill the purposes described in this policy, including:',
    list: [
      'Account information: retained while your account remains active, or as needed to provide services',
      'Payment and transaction records: retained as required by law, tax, or accounting obligations',
      'Operational and security logs: retained only for limited periods as needed for service integrity',
    ],
  },
  {
    title: '6. Data Security',
    text: 'We use reasonable administrative, technical, and organizational measures to protect your information, including:',
    list: ['Encrypted connections (SSL/TLS)', 'Secure server infrastructure', 'Restricted access controls'],
    after: 'However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.',
  },
  {
    title: '7. Your Rights and Choices',
    text: 'Depending on your location and applicable laws, you may have the right to:',
    list: [
      'Access the personal data we hold about you',
      'Request correction of inaccurate information',
      'Request deletion of your data',
      'Withdraw consent where processing is based on consent',
    ],
    after: 'To make a privacy-related request, please contact us using the details below.',
  },
  {
    title: "8. Children's Privacy",
    paragraphs: [
      'Our services are not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13.',
      'If we become aware that a child has provided us with personal information, we will take reasonable steps to delete it.',
    ],
  },
  {
    title: '9. International Data Transfers',
    paragraphs: [
      'Your information may be processed and stored in countries outside your country of residence. Where this happens, we take reasonable steps to ensure appropriate safeguards are in place.',
    ],
  },
  {
    title: '10. Third-Party Services and Links',
    paragraphs: [
      'Our services may contain links to third-party websites, products, or services. We are not responsible for the privacy practices of those third parties.',
      'We encourage you to review the privacy policies of any third-party services you use.',
    ],
  },
  {
    title: '11. Changes to This Privacy Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. When we do, we will revise the Effective Date at the top of this page.',
      'Continued use of our services after updates become effective means you accept the revised policy.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />

      {/* Hero header */}
      <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">VoxDigits Communications LLC</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-400 text-base leading-relaxed">
            This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our apps, website, and services.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 sm:p-10 space-y-8">

          {/* Effective date badge */}
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold">
              Effective Date: March 29, 2026
            </span>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            VoxDigits Communications LLC ("we," "our," or "us") are committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
            when you use our mobile applications, websites, and related services.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            By using our services, you agree to the terms of this Privacy Policy.
          </p>

          {/* Sections */}
          {sections.map((sec) => (
            <div key={sec.title}>
              <h2 className="text-white font-bold text-lg border-b border-white/10 pb-2 mb-4">{sec.title}</h2>

              {sec.text && <p className="text-slate-400 text-sm mb-3">{sec.text}</p>}

              {sec.paragraphs && sec.paragraphs.map((p, i) => (
                <p key={i} className="text-slate-400 text-sm mb-3 leading-relaxed">{p}</p>
              ))}

              {sec.list && (
                <ul className="space-y-2 mb-4">
                  {sec.list.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-slate-400 text-sm">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {sec.subsections && sec.subsections.map((sub) => (
                <div key={sub.title} className="mb-5">
                  <h3 className="text-white font-semibold text-sm mb-2">{sub.title}</h3>
                  <p className="text-slate-400 text-sm mb-2">{sub.text}</p>
                  <ul className="space-y-2">
                    {sub.list.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-slate-400 text-sm">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {sec.note && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-300/80">
                  <strong className="text-amber-300">Important:</strong> {sec.note}
                </div>
              )}

              {sec.after && <p className="text-slate-400 text-sm mt-3 leading-relaxed">{sec.after}</p>}
            </div>
          ))}

          {/* Contact section */}
          <div>
            <h2 className="text-white font-bold text-lg border-b border-white/10 pb-2 mb-4">12. Contact Us</h2>
            <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-5 space-y-2 text-sm text-slate-300">
              <p><span className="text-white font-semibold">Company:</span> VoxDigits Communications LLC</p>
              <p><span className="text-white font-semibold">Email:</span>{' '}
                <a href="mailto:support@voxdigits.com" className="text-cyan-400 hover:underline">support@voxdigits.com</a>
              </p>
              <p><span className="text-white font-semibold">Website:</span>{' '}
                <a href="https://www.voxvpn.net" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">www.voxvpn.net</a>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">© 2026 VoxDigits Communications LLC. All rights reserved.</p>
      </div>

      <Footer />
    </div>
  );
}