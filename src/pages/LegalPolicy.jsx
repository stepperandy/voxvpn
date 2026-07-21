import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Loader2 } from "lucide-react";

const POLICY_TYPES = {
  privacy: { label: "Privacy Policy" },
  terms: { label: "Terms of Service" },
  aup: { label: "Acceptable Use Policy" },
  cookies: { label: "Cookie Policy" },
  refund: { label: "Refund Policy" }
};

const ROUTE_TO_POLICY = {
  '/privacypolicy': 'privacy',
  '/termsofservice': 'terms',
  '/acceptableusepolicy': 'aup',
  '/cookiepolicy': 'cookies',
  '/refundpolicy': 'refund'
};

export default function LegalPolicy() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const routePolicy = ROUTE_TO_POLICY[location.pathname];
  const type = routePolicy || searchParams.get("type") || "privacy";
  const policy = POLICY_TYPES[type] || POLICY_TYPES.privacy;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState(type);

  useEffect(() => {
    setActiveType(type);
  }, [type]);

  const POLICY_CONTENT = {
    privacy: `VOXTELEFONY PRIVACY POLICY

Effective Date: 04/01/2026
Last Updated: 03/01/2026

1. INTRODUCTION

VoxTelefony ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application, website, and related services (collectively, the "Services").

By using VoxTelefony, you agree to the terms of this Privacy Policy.

2. INFORMATION WE COLLECT

2.1 Information You Provide

We may collect the following information when you use our Services:

• Name (if provided)
• Email address
• Phone number
• Account login credentials

2.2 Automatically Collected Information

We may collect limited technical data necessary for app functionality:

• Device type and model
• Operating system version
• IP address (used for service delivery and security)
• App usage logs (for troubleshooting and performance)

3. HOW WE USE YOUR INFORMATION

We use your information solely to:

• Provide and operate VoxTelefony services
• Enable voice calls, messaging, and virtual number services
• Authenticate users and maintain account security
• Process payments and subscriptions (via third-party providers)
• Improve app performance and reliability
• Provide customer support

4. TRACKING AND ADVERTISING

VoxTelefony:

• Does NOT track users across apps or websites
• Does NOT use third-party advertising networks
• Does NOT sell user data

We do not engage in cross-app tracking as defined by Apple's App Tracking Transparency framework.

5. SHARING OF INFORMATION

We do not sell or rent your personal data.

We may share limited data with trusted third parties only when necessary:

• Payment processors (e.g., Stripe, Paystack) for transactions
• Telecommunications providers for call routing and messaging
• Cloud service providers for hosting and infrastructure

All partners are required to maintain strict confidentiality and data protection standards.

6. DATA SECURITY

We implement appropriate technical and organizational measures to protect your data, including:

• Secure servers and encryption
• Access controls and authentication
• Continuous monitoring for security threats

However, no system is completely secure, and we cannot guarantee absolute security.

7. DATA RETENTION

We retain your data only for as long as necessary to:

• Provide our services
• Comply with legal obligations
• Resolve disputes and enforce agreements

You may request deletion of your data at any time.

8. YOUR RIGHTS

Depending on your location, you may have the right to:

• Access your personal data
• Request correction or deletion
• Object to or restrict processing
• Withdraw consent at any time

To exercise your rights, contact us at:
info@voxtelefony.com

9. CHILDREN'S PRIVACY

VoxTelefony is not intended for individuals under the age of 13.
We do not knowingly collect data from children.

10. INTERNATIONAL USERS

Your data may be processed in countries outside your residence, including jurisdictions that may have different data protection laws.

11. CHANGES TO THIS PRIVACY POLICY

We may update this Privacy Policy from time to time.
Changes will be posted with an updated "Last Updated" date.

12. SMS MESSAGING PROGRAM

VoxTelefony operates an SMS messaging program for account holders who opt in. By opting in, you agree to receive the following types of messages:

• Account notifications (e.g., payment confirmations, service updates)
• Verification codes (e.g., for account authentication)
• Customer-care messages (e.g., support responses)
• Messages you initiate through VoxTelefony (e.g., replies to your virtual number)

Message frequency varies based on your account activity and usage.

Message and data rates may apply from your mobile carrier.

Opt Out: Reply STOP to any message to opt out at any time.
Help: Reply HELP for help.

Support: support@voxtelefony.com or +1 207 387 1513.

Data Privacy: Your mobile opt-in and consent data is not sold or shared with third parties for their marketing purposes.

13. CONTACT US

If you have any questions or concerns, contact us:

VoxDigits Communications LLC
Email: support@voxtelefony.com
Phone: +1 207 387 1513
Website: https://voxtelefony.com

13. COMPLIANCE STATEMENT

This Privacy Policy is designed to comply with:

• Apple App Store Guidelines
• General Data Protection Regulation (GDPR)
• Applicable data protection laws

By using VoxTelefony, you acknowledge that you have read and understood this Privacy Policy.`,

    terms: `VoxDigits Communications LLC — Terms of Service

Effective Date: March 2026

By accessing or using VoxTelefony services, you agree to these Terms of Service.

1. Services

VoxTelefony provides telecommunications and communication-related services, including virtual numbers, eSIM solutions, and related tools.

2. Eligibility

You must provide accurate information and use the services only for lawful business or personal purposes.

3. Account Responsibility

You are responsible for safeguarding your account credentials and for activities conducted through your account.

4. Acceptable Use

You may not use VoxTelefony services for:
- Fraudulent, deceptive, or unlawful activity
- Spam or abusive communications
- Harassment or threats
- Circumventing identity verification requirements imposed by third parties
- Activities that violate telecom regulations or provider policies

5. Suspension and Termination

We may suspend or terminate access where misuse, fraud, non-payment, or regulatory concerns arise.

6. Fees and Payments

Certain services may require payment. Fees are subject to change with notice where applicable.

7. Third-Party Providers

Some services rely on third-party carriers, telecom providers, and infrastructure partners. Availability may vary by region and service type.

8. No Guarantee of Continuous Availability

We aim for reliable service but do not guarantee uninterrupted or error-free operation.

9. Limitation of Liability

To the maximum extent permitted by law, VoxTelefony will not be liable for indirect, incidental, special, or consequential damages.

10. SMS Messaging Program

VoxTelefony offers an optional SMS messaging program. By opting in, you agree to receive account notifications, verification codes, customer-care messages, and messages you initiate through VoxTelefony. Message frequency varies. Message and data rates may apply. Reply STOP to opt out and HELP for help. Consent is not a condition of purchase. Support: support@voxtelefony.com or +1 207 387 1513.

Your mobile opt-in and consent data is not sold or shared with third parties for their marketing purposes.

11. Contact

For service and legal inquiries, contact: support@voxtelefony.com`,

    aup: `VoxDigits Communications LLC — Acceptable Use Policy

VoxTelefony services must be used responsibly and lawfully.

Prohibited Activities

Users may not use the platform for:
- Fraud, impersonation, or deception
- Spam, robocalling abuse, or unauthorized bulk messaging
- Harassment, abuse, or illegal content distribution
- Evasion of third-party rules or service restrictions
- Unlawful financial schemes or scams
- Any activity that may cause reputational, legal, or network harm

Compliance

Users must comply with all applicable laws, telecom regulations, and service provider rules.

Enforcement

Violations may result in service suspension, number reclamation, account review, or permanent termination.

Contact

For compliance questions: info@voxtelefony.com`,

    refund: `VoxDigits Communications LLC — Refund Policy

Effective Date: March 2026

1. 30-Day Money-Back Guarantee

VoxTelefony offers a 30-day money-back guarantee on eligible subscription plans. If you are not satisfied with our services, you may request a full refund within 30 days of your initial purchase.

2. Eligibility

Refunds are available for:
- First-time subscription purchases (virtual numbers, eSIM plans)
- Monthly and annual subscription plans
- Credit purchases (within 30 days, unused credits only)

3. Exceptions

The following are NOT eligible for refunds:
- Usage-based charges (call minutes, SMS messages already sent)
- eSIM plans that have been activated or used
- Virtual numbers that have been assigned and used for more than 7 days
- Custom or enterprise plans
- Purchases beyond the 30-day window
- Services terminated due to violations of our Acceptable Use Policy

4. Processing Timeline

- Refund requests are processed within 5-10 business days
- Approved refunds are submitted to your original payment method
- Your bank may take an additional 3-5 business days to reflect the refund

5. Refund Method

Refunds are issued to the original payment method used for the purchase:
- Credit/debit card refunds via Stripe
- PayPal refunds to the original PayPal account
- Account credit (optional, at customer request)

6. How to Request a Refund

Contact our billing team at billing@voxtelefony.com with:
- Your account email
- Order/transaction ID
- Reason for refund

7. Subscription Cancellation

You may cancel your subscription at any time from your account settings. Cancellation stops future billing but does not automatically issue a refund. Refund requests must be made separately within the 30-day window.

8. Contact

For refund inquiries: billing@voxtelefony.com`,

  cookies: `VoxTelefony Cookie Policy

Last Updated: March 2026

This Cookie Policy explains how VoxTelefony ("we", "our", or "us") uses cookies and similar tracking technologies when you visit our website at https://voxtelefony.com or use our web application.

1. What Are Cookies?

Cookies are small text files placed on your device by a website when you visit it. They are widely used to make websites work more efficiently and to provide information to website owners.

Similar technologies include:
- Local Storage & Session Storage: Browser-based key-value storage for session data
- Pixels & Web Beacons: Tiny image files used to track page visits and email opens
- Fingerprinting: Technical device attributes used to identify returning visitors

2. How We Use Cookies

We use cookies and similar technologies for the following purposes:

2.1 Strictly Necessary Cookies
These cookies are essential for the website to function and cannot be disabled.
- Authentication tokens (keeping you logged in)
- Session identifiers
- Security cookies (CSRF protection)
- Load balancing cookies

Legal basis: Legitimate interest / contract performance

2.2 Functional Cookies
These cookies enable enhanced functionality and personalisation.
- Language and region preferences
- UI preferences (dark/light mode, layout)
- Remembered search filters

Legal basis: Legitimate interest / consent

2.3 Analytics Cookies
We use analytics to understand how visitors interact with our website.
- Page view tracking
- Feature usage statistics
- Error and crash reporting
- Performance monitoring

We may use third-party analytics tools such as Google Analytics. These tools may set their own cookies.

Legal basis: Consent

2.4 Marketing & Advertising Cookies
We may use cookies to deliver relevant advertisements and measure campaign performance.
- Retargeting pixels (e.g., Facebook Pixel, Google Ads)
- Conversion tracking
- A/B testing

Legal basis: Consent

3. Third-Party Cookies

Some cookies on our site are set by third-party services we integrate with:

| Provider         | Purpose                        | Privacy Policy                              |
|------------------|-------------------------------|----------------------------------------------|
| Google Analytics | Website analytics              | https://policies.google.com/privacy         |
| Stripe           | Payment processing             | https://stripe.com/privacy                  |
| Tawk.to          | Live chat support              | https://www.tawk.to/privacy-policy/         |
| Cloudflare       | Security & performance CDN     | https://www.cloudflare.com/privacypolicy/   |

4. Cookie Duration

- Session Cookies: Deleted when you close your browser
- Persistent Cookies: Remain on your device for a set period (typically 30 days to 2 years)

5. Managing Your Cookie Preferences

You have several options to control cookies:

5.1 Browser Settings
Most browsers allow you to refuse or delete cookies. Visit your browser's help section:
- Chrome: chrome://settings/cookies
- Firefox: about:preferences#privacy
- Safari: Preferences > Privacy
- Edge: edge://settings/privacy

Note: Disabling strictly necessary cookies may prevent the site from functioning correctly.

5.2 Opt-Out Links
- Google Analytics Opt-out: https://tools.google.com/dlpage/gaoptout
- Facebook Ads Preferences: https://www.facebook.com/ads/preferences

5.3 Do Not Track
We respect the "Do Not Track" browser signal where technically feasible and will not set analytics or marketing cookies if it is enabled.

6. Cookie Consent

When you first visit VoxTelefony, you will be presented with a cookie consent banner. By clicking "Accept All", you consent to all cookies described in this policy. You may select "Manage Preferences" to enable or disable specific categories.

You may withdraw consent at any time by clearing your browser cookies and re-visiting the site.

7. Updates to This Policy

We may update this Cookie Policy periodically to reflect changes in technology, regulation, or our practices. The "Last Updated" date at the top of this page will reflect the most recent revision.

8. Contact Us

If you have questions about our use of cookies, please contact:

VoxDigits Communications LLC
Email: privacy@voxtelefony.com
Website: https://voxtelefony.com
Address: 16809 Capon Tree Ln, Woodbridge, VA 22191, USA`
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setContent(POLICY_CONTENT[activeType] || "");
      setLoading(false);
    }, 300);
  }, [activeType]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex gap-2 mb-8 flex-wrap">
          {Object.entries(POLICY_TYPES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeType === key
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>

        <h1 className="text-3xl font-bold mb-2">{POLICY_TYPES[activeType].label}</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: March 2026</p>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
           {loading ? (
             <div className="flex flex-col items-center justify-center py-16 gap-4">
               <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
               <p className="text-gray-400 text-sm">Generating {POLICY_TYPES[activeType].label}...</p>
             </div>
           ) : (
             <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-gray-300 leading-relaxed text-sm">
               {content}
             </div>
           )}
         </div>

        <div className="mt-12 bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
          <div className="space-y-4 text-gray-300 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Email</p>
              <a href="mailto:support@voxtelefony.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                support@voxtelefony.com
              </a>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Phone</p>
              <a href="tel:+12073871513" className="text-purple-400 hover:text-purple-300 transition-colors">
                +1 207 387 1513
              </a>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Company</p>
              <p>VoxDigits Communications LLC</p>
            </div>
          </div>
        </div>
        </div>
        </div>
        );
        }