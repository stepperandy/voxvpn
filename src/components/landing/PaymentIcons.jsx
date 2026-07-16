const PAYMENT_METHODS = [
  // Row 1 — 5 items
  { name: 'Visa', url: 'https://www.visa.com', row: 1, col: 0, cols: 5 },
  { name: 'Mastercard', url: 'https://www.mastercard.com', row: 1, col: 1, cols: 5 },
  { name: 'American Express', url: 'https://www.americanexpress.com', row: 1, col: 2, cols: 5 },
  { name: 'Apple Pay', url: 'https://www.apple.com/apple-pay', row: 1, col: 3, cols: 5 },
  { name: 'American Express Gold', url: 'https://www.americanexpress.com', row: 1, col: 4, cols: 5 },
  // Row 2 — 4 items
  { name: 'Discover', url: 'https://www.discover.com', row: 2, col: 0, cols: 4 },
  { name: 'Google Pay', url: 'https://pay.google.com', row: 2, col: 1, cols: 4 },
  { name: 'Alipay', url: 'https://www.alipay.com', row: 2, col: 2, cols: 4 },
  { name: 'WeChat Pay', url: 'https://pay.weixin.qq.com', row: 2, col: 3, cols: 4 },
];

const IMAGE_URL = 'https://media.base44.com/images/public/69b202c06dc5b1988efe9645/a95a7a81d_image.png';

export default function PaymentIcons() {
  return (
    <div className="relative w-full max-w-[320px] mx-auto" style={{ isolation: 'isolate' }}>
      <img
        src={IMAGE_URL}
        alt="Payment Methods: Visa, Mastercard, Amex, Apple Pay, Discover, Google Pay, Alipay, WeChat Pay"
        className="w-full h-auto object-contain select-none"
        style={{ mixBlendMode: 'screen' }}
        draggable={false}
      />
      {PAYMENT_METHODS.map((method) => {
        const top = method.row === 1 ? 0 : 50;
        const height = 50;
        const width = 100 / method.cols;
        return (
          <a
            key={method.name + method.col}
            href={method.url}
            target="_blank"
            rel="noopener noreferrer"
            title={method.name}
            aria-label={method.name}
            className="absolute hover:bg-cyan-400/10 rounded-lg transition-colors"
            style={{
              top: `${top}%`,
              height: `${height}%`,
              left: `${method.col * width}%`,
              width: `${width}%`,
            }}
          />
        );
      })}
    </div>
  );
}