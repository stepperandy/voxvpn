import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const POLICIES = {
  privacy: `PRIVACY POLICY

Last Updated: March 2026

1. Introduction
VoxDigits provides virtual phone numbers and communication services. This Privacy Policy explains how we collect, use, and protect your information.

2. Information We Collect
- Email address for account creation and communication
- Phone usage data (calls, SMS, forwarding logs)
- Payment information processed through Stripe
- Device and IP address information
- Cookies and tracking data

3. How We Use Your Information
- To provide and maintain our services
- To process payments and billing
- To improve our platform and user experience
- To send service notifications and updates
- To comply with legal obligations
- To prevent fraud and abuse

4. Data Sharing
We do not sell your personal data. We may share information with:
- Stripe (for payment processing)
- Service providers who assist us
- Law enforcement when required by law
- Third parties with your explicit consent

5. Cookies
We use cookies to enhance your experience, including session management, analytics, and preference storage.

6. Data Retention
We retain your data as long as necessary to provide services and comply with legal requirements. You can request deletion of your account at any time.

7. Your Rights
You have the right to:
- Access your personal data
- Correct inaccurate information
- Request deletion of your data
- Opt-out of marketing communications
- Data portability

8. Security
We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.

9. Children's Privacy
Our services are not directed to children under 13. We do not knowingly collect data from children.

10. Third-Party Links
Our website may contain links to third-party services. We are not responsible for their privacy practices.

11. Changes to This Policy
We may update this policy periodically. We will notify you of significant changes via email.

12. Contact Us
If you have questions about this privacy policy, contact us at info@voxdigits.com or +1 207 387 1513.`,

  terms: `TERMS OF SERVICE

Last Updated: March 2026

1. Acceptance of Terms
By using VoxDigits, you accept and agree to be bound by these Terms of Service.

2. Description of Service
VoxDigits provides virtual phone numbers and communication services including SMS and voice calling capabilities across multiple countries.

3. Account Registration
- You must provide accurate information during registration
- You are responsible for maintaining the confidentiality of your account credentials
- You agree to notify us of unauthorized access
- You must be at least 18 years old

4. Subscription & Billing
- Virtual numbers are provided on a monthly subscription basis
- Billing occurs on the same day each month
- You can cancel anytime; no refunds for partial months
- We use Stripe for secure payment processing
- Failed payments may result in service suspension

5. Acceptable Use Policy
You agree not to:
- Use services for illegal activities
- Harass, threaten, or abuse others
- Send spam or unsolicited messages
- Violate intellectual property rights
- Interfere with service functionality
- Resell services without authorization

6. Prohibited Activities
We prohibit use for:
- Phishing, fraud, or scams
- Marketing without consent
- Robocalls or automated abuse
- Adult or explicit content
- Hate speech or discrimination
- Any activity violating local laws

7. Intellectual Property
- All content and trademarks are VoxDigits property
- You retain rights to your uploaded content
- You grant us a license to use your content for service provision

8. Disclaimers
- Services provided "as-is" without warranties
- We do not guarantee uninterrupted service
- We are not liable for lost data or third-party services
- Communication may not always be completely private

9. Limitation of Liability
- Our liability is limited to the amount you paid in the last 12 months
- We are not liable for indirect or consequential damages
- Some jurisdictions don't allow liability limitations

10. Termination
- We may terminate accounts for policy violations
- You may cancel anytime through account settings
- Upon termination, all data is deleted after 30 days

11. Governing Law
These terms are governed by the laws of Wyoming, USA.

12. Contact Information
For questions, contact info@voxdigits.com or call +1 207 387 1513.`,

  cookies: `COOKIE POLICY

Last Updated: March 2026

1. What Are Cookies
Cookies are small text files stored on your device that help us remember your preferences and improve your experience.

2. Types of Cookies We Use

Essential Cookies:
- Authentication and session management
- Security and fraud prevention
- Account functionality

Analytics Cookies:
- User behavior and traffic analysis
- Feature usage tracking
- Performance monitoring

Marketing Cookies:
- Personalized advertising
- Campaign effectiveness tracking
- User engagement metrics

3. Third-Party Cookies
We use cookies from:
- Stripe (payment processing)
- Analytics providers
- Third-party advertising networks

4. How to Control Cookies
You can control cookies through your browser settings:
- Most browsers allow you to refuse cookies
- You can delete existing cookies
- Some features may not work without essential cookies
- Disabling cookies may affect service functionality

5. Data from Cookies
Collected information includes:
- Device information
- IP address
- Browsing behavior
- User preferences
- Purchase history

6. Updates to This Policy
We may update this policy periodically. Your continued use constitutes acceptance of changes.

7. Contact Information
For privacy questions, contact info@voxdigits.com or +1 207 387 1513.`
};

Deno.serve(async (req) => {
  try {
    const { type } = await req.json();
    const content = POLICIES[type] || POLICIES.privacy;
    return Response.json({ content });
  } catch (error) {
    console.error("generatePolicy error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});