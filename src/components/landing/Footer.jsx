import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Facebook, Instagram, Mail, ChevronRight } from "lucide-react";

const navigationLinks = {
  Services: [
    { label: "Virtual Numbers", href: "/VirtualNumbers", internal: true },
    { label: "eSIM Connectivity", href: "/ESimStore", internal: true },
    { label: "Call Routing", href: "/Services", internal: true },
    { label: "Business Communication", href: "/Services", internal: true },
  ],
  Company: [
    { label: "About Us", href: "/AboutUs", internal: true },
    { label: "Company", href: "/Company", internal: true },
    { label: "Careers", href: "/Careers", internal: true },
    { label: "Press", href: "/Press", internal: true },
    { label: "Blog", href: "/Blog", internal: true },
    { label: "Contact", href: "/Contact", internal: true },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacypolicy", internal: true },
    { label: "Terms of Service", href: "/termsofservice", internal: true },
    { label: "Cookie Policy", href: "/cookiepolicy", internal: true },
    { label: "Refund Policy", href: "/refundpolicy", internal: true },
    { label: "Acceptable Use Policy", href: "/acceptableusepolicy", internal: true },
  ],
  Resources: [
    { label: "Server Status", href: "/ServerStatus", internal: true },
    { label: "Security", href: "/Security", internal: true },
    { label: "Transparency Report", href: "/TransparencyReport", internal: true },
  ],
};

const CONTACT_EMAILS = [
  { label: "Support", email: "support@voxtelefony.com" },
  { label: "Admin", email: "admin@voxtelefony.com" },
  { label: "Privacy", email: "privacy@voxtelefony.com" },
  { label: "Billing", email: "billing@voxtelefony.com" },
  { label: "Legal", email: "legal@voxtelefony.com" },
];

export default function Footer() {
  return (
    <footer className="text-gray-400 py-8 px-6 md:px-10" style={{ background: "#0d0620" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-8">
          <div className="col-span-2 md:col-span-2">
            <div className="mb-3">
              <img src="https://media.base44.com/images/public/69b202c06dc5b1988efe9645/e6163c0d6_TELLOGO11.png" alt="VoxTelefony" style={{height: "48px", width: "auto"}} />
            </div>
            <p className="text-xs leading-relaxed text-gray-500 mb-4">VoxDigits Communications LLC — Virtual phone numbers, eSIM connectivity, and cloud-based communication solutions for businesses and individuals.</p>
            <div className="space-y-1">
              {CONTACT_EMAILS.map(({ label, email }) => (
                <a key={email} href={`mailto:${email}`} className="block text-xs text-gray-500 hover:text-cyan-400 transition-colors">
                  <span className="text-gray-600">{label}:</span> {email}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(navigationLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-3 text-xs">{title}</h4>
              <ul className="space-y-1.5">
                {links.map(link => (
                  <li key={link.label}>
                    {link.internal ? (
                      <Link to={link.href} className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 pb-6 mb-4">
          <div className="flex justify-center mb-6">
            <img src="https://media.base44.com/images/public/69b202c06dc5b1988efe9645/5b9de6796_payeeicon.png" alt="Accepted Payment Methods" className="h-16 w-auto max-w-full" />
          </div>
          <p className="text-center text-xs text-gray-500 mb-4 font-medium uppercase tracking-widest">Download the App</p>
          <div className="flex justify-center items-center gap-4 flex-wrap px-4">
            <a
              href="https://play.google.com/store/apps/details?id=com.base69b202c06dc5b1988efe9645.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity active:scale-95"
              aria-label="Get it on Google Play"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                className="h-10 w-auto"
                loading="lazy"
              />
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity active:scale-95"
              aria-label="Download on the App Store"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="Download on the App Store"
                className="h-10 w-auto"
                loading="lazy"
              />
            </a>
          </div>
        </div>

        {/* Company Identity */}
        <div className="border-t border-gray-800 pt-6 pb-4">
          <div className="text-center text-xs text-gray-600 space-y-1 mb-4">
            <p>VoxDigits Communications LLC</p>
            <p>16809 Capon Tree Ln, Woodbridge, VA 22191, USA</p>
            <p>Registered in the United States of America · Company Registration No. 11986542</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-600">© 2026 VoxDigits Communications LLC. All Rights Reserved.</p>
            <div className="flex gap-2">
              {[
                { Icon: Twitter, url: "https://twitter.com" },
                { Icon: Linkedin, url: "https://linkedin.com" },
                { Icon: Facebook, url: "https://web.facebook.com/profile.php?id=61582260432219" },
                { Icon: Instagram, url: "https://instagram.com" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-cyan-400 transition-colors rounded"
                >
                  <social.Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}