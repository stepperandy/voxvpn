const PAYMENT_METHODS = [
  { name: 'Visa', url: 'https://www.visa.com' },
  { name: 'Mastercard', url: 'https://www.mastercard.com' },
  { name: 'American Express', url: 'https://www.americanexpress.com' },
  { name: 'Discover', url: 'https://www.discover.com' },
  { name: 'Apple Pay', url: 'https://www.apple.com/apple-pay' },
  { name: 'Google Pay', url: 'https://pay.google.com' },
  { name: 'Hubtel', url: 'https://hubtel.com' },
  { name: 'Alipay', url: 'https://www.alipay.com' },
  { name: 'WeChat Pay', url: 'https://pay.weixin.qq.com' },
];

const IMAGE_URL = 'https://media.base44.com/images/public/69b202c06dc5b1988efe9645/c4c0a79d6_paymenticons.png';

export default function PaymentIcons() {
  const iconWidthPct = 100 / PAYMENT_METHODS.length;

  return (
    <div className="relative w-full max-w-[640px] mx-auto">
      <img
        src={IMAGE_URL}
        alt="Payment Methods: Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay, Hubtel, Alipay, WeChat Pay"
        className="w-full h-auto object-contain mix-blend-screen select-none"
        draggable={false}
      />
      {PAYMENT_METHODS.map((method, i) => (
        <a
          key={method.name}
          href={method.url}
          target="_blank"
          rel="noopener noreferrer"
          title={method.name}
          aria-label={method.name}
          className="absolute top-0 bottom-0 hover:bg-cyan-400/10 rounded-lg transition-colors"
          style={{ left: `${i * iconWidthPct}%`, width: `${iconWidthPct}%` }}
        />
      ))}
    </div>
  );
}