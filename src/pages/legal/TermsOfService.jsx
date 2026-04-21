import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';

export default function TermsOfService() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: January 1, 2024</p>
        <div className="space-y-8 text-slate-400 text-sm leading-relaxed">
          {[
            { title: '1. Acceptance of Terms', content: 'By using VoxVPN, you agree to these Terms of Service. If you do not agree, please discontinue use of our service.' },
            { title: '2. Service Description', content: 'VoxVPN provides a Virtual Private Network service that encrypts your internet connection and masks your IP address. The service is provided as-is and we reserve the right to modify, suspend or discontinue it at any time.' },
            { title: '3. Acceptable Use', content: 'You agree to use VoxVPN only for lawful purposes. You may not use the service for: illegal activities, accessing child exploitation material, spamming or network attacks, infringing intellectual property rights, or circumventing legal orders against you specifically.' },
            { title: '4. Subscriptions & Payments', content: 'VoxVPN subscriptions are billed on a monthly or annual basis. All payments are processed securely by Stripe. Prices are listed in USD and may change with 30 days notice.' },
            { title: '5. Refund Policy', content: 'We offer a 30-day money-back guarantee for new subscribers. Refund requests after 30 days will be considered on a case-by-case basis. Contact support@voxvpn.net for refund requests.' },
            { title: '6. Limitation of Liability', content: 'VoxDigits Communications LLC is not liable for indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the amount you paid in the last 12 months.' },
            { title: '7. Contact', content: 'VoxDigits Communications LLC — support@voxvpn.net — www.voxvpn.net' },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-white font-bold text-base mb-3">{title}</h2>
              <p>{content}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}