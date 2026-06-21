const methods = [
  {
    href: 'https://visa.com',
    label: 'Visa',
    cls: 'bg-[#0057B8]',
    icon: (
      <svg viewBox="0 0 48 16" className="h-4 w-auto" fill="white">
        <text x="0" y="13" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="15" fontStyle="italic" fill="white">VISA</text>
      </svg>
    ),
  },
  {
    href: 'https://mastercard.com',
    label: 'Mastercard',
    cls: 'bg-black',
    icon: (
      <svg viewBox="0 0 36 24" className="h-5 w-auto">
        <circle cx="13" cy="12" r="9" fill="#EB001B" />
        <circle cx="23" cy="12" r="9" fill="#F79E1B" opacity="0.85" />
      </svg>
    ),
  },
  {
    href: 'https://americanexpress.com',
    label: 'AMEX',
    cls: 'bg-[#007CC3]',
    icon: (
      <svg viewBox="0 0 40 16" className="h-3.5 w-auto" fill="white">
        <text x="0" y="13" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="white">AMEX</text>
      </svg>
    ),
  },
  {
    href: 'https://discover.com',
    label: 'Discover',
    cls: 'bg-black',
    icon: (
      <svg viewBox="0 0 56 16" className="h-3.5 w-auto">
        <text x="0" y="13" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="12" fill="white">DISCOVER</text>
        <circle cx="50" cy="11" r="3.5" fill="#FF6B00" />
      </svg>
    ),
  },
  {
    href: 'https://apple.com/apple-pay',
    label: 'Apple Pay',
    cls: 'bg-black',
    icon: (
      <svg viewBox="0 0 48 20" className="h-4 w-auto">
        <path d="M7.2 3.1c.4-.5.7-1.2.6-1.9-.6 0-1.3.4-1.7.9-.4.4-.7 1.1-.6 1.8.7.1 1.3-.3 1.7-.8zm.6 1.6c-1 0-1.5.6-2.3.6-.8 0-1.4-.5-2.3-.5-1.2 0-2.9 1-2.9 3.5 0 2.2 1.8 4.7 2.8 4.7.9 0 1.4-.6 2.4-.6s1.4.6 2.4.6c1 0 2-1.7 2.5-3-.8-.3-2-1.1-2-2.7 0-1.4 1.1-2.2 1.2-2.3-.7-1-1.7-1.1-2.1-1.1-.9-.1-1.6.5-2.1.5s-1.2-.5-1.9-.5z" fill="white" transform="translate(0 2)"/>
        <text x="12" y="13" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="11" fill="white">Pay</text>
      </svg>
    ),
  },
  {
    href: 'https://pay.google.com',
    label: 'Google Pay',
    cls: 'bg-white',
    icon: (
      <svg viewBox="0 0 52 20" className="h-4 w-auto">
        <path d="M12 6.1c0-.3 0-.6-.1-.9H7.2v1.7h2.7c-.1.7-.5 1.3-1 1.7v1.4h1.6c.9-.9 1.5-2.2 1.5-3.9z" fill="#4285F4"/>
        <path d="M7.2 12c1.4 0 2.5-.5 3.4-1.3L9 9.3c-.5.3-1 .5-1.8.5-1.3 0-2.5-.9-2.9-2.1H2.7v1.5C3.6 11 5.2 12 7.2 12z" fill="#34A853"/>
        <path d="M4.3 7.7c-.1-.3-.2-.7-.2-1s.1-.7.2-1V4.2H2.7C2.3 5 2 5.8 2 6.7s.3 1.7.7 2.5l1.6-1.5z" fill="#FBBC05"/>
        <path d="M7.2 3.6c.7 0 1.3.3 1.8.7l1.3-1.3C9.7 2.2 8.5 1.7 7.2 1.7c-2 0-3.6 1-4.5 2.5l1.6 1.5c.4-1.2 1.6-2.1 2.9-2.1z" fill="#EA4335"/>
        <text x="16" y="11" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="11" fill="#5F6368">Pay</text>
      </svg>
    ),
  },
  {
    href: 'https://hubtel.com',
    label: 'Hubtel',
    cls: 'bg-white',
    icon: (
      <svg viewBox="0 0 48 20" className="h-4 w-auto">
        <path d="M2 14 L6 6 L10 10 L14 4" fill="none" stroke="#0099CC" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M6 14 L10 8 L14 12 L18 7" fill="none" stroke="#FF6600" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M10 14 L14 10 L18 13 L22 9" fill="none" stroke="#33AA55" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        <text x="24" y="13" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="10" fill="#0a3d62">Hubtel</text>
      </svg>
    ),
  },
  {
    href: 'https://alipay.com',
    label: 'Alipay',
    cls: 'bg-[#0060C7]',
    icon: (
      <svg viewBox="0 0 48 20" className="h-4 w-auto">
        <text x="0" y="9" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="white">支</text>
        <text x="13" y="9" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="white">付</text>
        <text x="0" y="18" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7" fill="white">Alipay</text>
      </svg>
    ),
  },
  {
    href: 'https://wechat.com',
    label: 'WeChat Pay',
    cls: 'bg-[#00C250]',
    icon: (
      <svg viewBox="0 0 52 20" className="h-4 w-auto" fill="white">
        <path d="M9 3C4.6 3 1 5.9 1 9.5c0 2 1.1 3.8 2.9 5l-.7 2.2 2.6-1.3c1 .3 2 .4 3.2.4h.9c-.1-.4-.2-.9-.2-1.3 0-3.3 3.2-6 7.2-6h.7C16.9 5.4 13.4 3 9 3zm-3 4.5c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm6 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z" fill="white"/>
        <text x="20" y="13" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" fill="white">WeChat Pay</text>
      </svg>
    ),
  },
  {
    href: 'https://mtn.com/momo',
    label: 'MTN MoMo',
    cls: 'bg-[#FFCC00]',
    icon: (
      <svg viewBox="0 0 52 20" className="h-4 w-auto">
        <ellipse cx="13" cy="7" rx="7" ry="4" fill="none" stroke="#000" strokeWidth="1.5" />
        <text x="9" y="9" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="6" fill="black">MTN</text>
        <text x="6" y="17" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7" fill="black">MoMo</text>
      </svg>
    ),
  },
];

export default function PaymentIcons() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {methods.map(({ href, label, cls, icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={`h-9 px-2.5 rounded-lg flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:-translate-y-0.5 ${cls}`}
          style={{ boxShadow: '0 4px 10px -3px rgba(0,80,200,0.3), inset 0 1px 1px rgba(255,255,255,0.3)' }}
        >
          {icon}
        </a>
      ))}
    </div>
  );
}