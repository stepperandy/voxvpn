import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { FileText, Mail, Globe } from 'lucide-react';

const sections = [
  {
    title: '1. Eligibility',
    text: 'Users must be at least 18 years old or have authorization from a parent or legal guardian. By using VoxVPN, you represent that you meet these requirements.',
  },
  {
    title: '2. Service Description',
    text: 'VoxVPN provides VPN services designed to enhance privacy and security while using the internet. Our services include encrypted VPN tunnels, DNS leak protection, kill switch functionality, and access to servers in 60+ countries.',
  },
  {
    title: '3. User Responsibilities',
    text: 'Users agree to use VoxVPN lawfully and responsibly. Specifically, users agree NOT to:',
    list: [
      'Violate any applicable local, national, or international law',
      'Distribute malware, ransomware, or other malicious software',
      'Conduct fraudulent, deceptive, or illegal financial activity',
      'Attempt unauthorized access to systems, networks, or accounts',
      'Abuse VoxVPN network resources or share credentials commercially',
      'Send spam, phishing, or unsolicited bulk communications',
      'Engage in harassment, stalking, or threatening behavior',
      'Infringe on intellectual property rights of others',
      'Use the service to harm minors in any way',
      'Circumvent VoxVPN security measures or infrastructure',
    ],
    note: 'See our Acceptable Use Policy for full details.',
  },
  {
    title: '4. Subscription Terms',
    text: 'Paid subscriptions provide access to premium features and VPN servers. Key terms include:',
    list: [
      'Subscription fees are billed according to the selected plan (1 month, 3 months, 6 months, 1 year, or 2 years).',
      'Subscriptions auto-renew at the end of each billing cycle unless cancelled. You can cancel anytime from your dashboard.',
      'Payment is processed securely by Stripe at the time of purchase or renewal.',
      'All prices are in USD. Taxes may apply depending on your jurisdiction.',
      'Price changes: We will notify you at least 30 days before any price increase. You may cancel before the new price takes effect.',
    ],
  },
  {
    title: '5. Account Termination',
    text: 'Both VoxVPN and the user have rights regarding account termination:',
    list: [
      'You may cancel your subscription at any time from your account dashboard. Access continues until the end of your billing period.',
      'You may request full account deletion by contacting info@voxdigits.com or using the Delete Account feature.',
      'VoxVPN may suspend or terminate accounts that violate these Terms, our Acceptable Use Policy, or applicable law.',
      'Upon termination, your right to use the service ends immediately. Data associated with your account will be deleted in accordance with our Privacy Policy.',
      'VoxVPN is not liable for any data loss resulting from account termination due to policy violations.',
    ],
  },
  {
    title: '6. Acceptable Use',
    text: 'Users must comply with our Acceptable Use Policy, which prohibits illegal activities, network abuse, and harmful behavior. Violations may result in immediate suspension without refund. View the full Acceptable Use Policy at /acceptable-use-policy.',
  },
  {
    title: '7. Refunds',
    text: 'VoxVPN offers a 30-day money-back guarantee on new subscriptions. Refund requests are reviewed according to our Refund Policy. See /refund-policy for full details including eligibility, processing time, and exceptions.',
  },
  {
    title: '8. Service Availability',
    text: 'We strive to maintain 99.9% uptime but do not guarantee uninterrupted operation. Service may be temporarily unavailable due to maintenance, updates, or factors beyond our control. We are not liable for downtime or data loss resulting from service interruptions.',
  },
  {
    title: '9. Limitation of Liability',
    text: 'VoxVPN is provided on an "as is" and "as available" basis. To the maximum extent permitted by law:',
    list: [
      'VoxDigits Communications LLC shall not be liable for indirect, incidental, special, or consequential damages.',
      'Our total liability shall not exceed the amount paid by the user in the 12 months preceding the claim.',
      'We are not liable for data loss, service interruption, or unauthorized access to your account.',
      'We are not liable for any content accessed through the VPN service.',
      'Users are responsible for maintaining the security of their account credentials.',
    ],
  },
  {
    title: '10. Governing Law',
    text: 'These Terms are governed by the laws of the Commonwealth of Virginia, United States of America, without regard to conflict of law principles. Any disputes shall be resolved in the state or federal courts located in Virginia. VoxVPN is operated by VoxDigits Communications LLC, registered at 16809 Capon Tree Ln, Woodbridge, VA 22191, USA.',
  },
  {
    title: '11. Intellectual Property',
    text: 'VoxVPN, its logo, website, software, and content are the property of VoxDigits Communications LLC. Users may not copy, modify, or distribute VoxVPN intellectual property without written permission.',
  },
  {
    title: '12. Modifications',
    text: 'We may update these Terms at any time. Material changes will be communicated via email or website notice at least 30 days before taking effect. Continued use of the service after changes constitutes acceptance of updated terms.',
  },
];

export default function TermsOfService() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <FileText size={28} className="text-cyan-400" />
            </div>
            <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight mb-3">VoxVPN Terms of Service</h1>
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
              By accessing or using VoxVPN, you agree to these Terms of Service.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i} className="rounded-2xl p-6"
                style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="text-white text-lg font-bold mb-4">{section.title}</h2>
                {section.text && <p className="text-slate-400 text-sm leading-relaxed mb-4">{section.text}</p>}
                {section.list && (
                  <ul className="space-y-1.5">
                    {section.list.map((item, k) => (
                      <li key={k} className="flex items-start gap-2 text-slate-400 text-sm">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Contact section */}
          <div className="rounded-2xl p-8 mt-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))', border: '1px solid rgba(0,212,255,0.2)' }}>
            <h2 className="text-white text-lg font-bold mb-2">13. Contact</h2>
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
              <a href="mailto:admin@voxdigits.com"
                className="flex items-center gap-2 text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                <Mail size={14} /> admin@voxdigits.com
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}