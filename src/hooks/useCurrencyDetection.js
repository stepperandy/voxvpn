import { useState, useEffect } from 'react';

const CURRENCY_SYMBOLS = {
  'CNY': '¥', 'USD': '$', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
  'BRL': 'R$', 'AUD': 'A$', 'EUR': '€', 'GHS': '₵', 'CAD': 'C$',
  'ZAR': 'R', 'NGN': '₦', 'KES': 'KSh', 'SGD': 'S$', 'HKD': 'HK$',
  'MXN': 'Mex$', 'AED': 'د.إ', 'RUB': '₽', 'KRW': '₩', 'THB': '฿',
  'IDR': 'Rp', 'MYR': 'RM', 'PHP': '₱', 'PKR': '₨', 'EGP': 'E£',
  'TRY': '₺', 'SAR': '﷼', 'QAR': '﷼', 'NZD': 'NZ$',
};

const COUNTRY_CURRENCY = {
  'CN': 'CNY', 'US': 'USD', 'GB': 'GBP', 'JP': 'JPY', 'IN': 'INR',
  'BR': 'BRL', 'AU': 'AUD', 'CA': 'CAD',
  'FR': 'EUR', 'DE': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
  'BE': 'EUR', 'AT': 'EUR', 'IE': 'EUR', 'PT': 'EUR', 'GR': 'EUR',
  'PL': 'EUR', 'SE': 'EUR', 'NO': 'EUR', 'CH': 'EUR', 'FI': 'EUR',
  'DK': 'EUR', 'LU': 'EUR',
  'GH': 'GHS', 'NG': 'NGN', 'KE': 'KES', 'ZA': 'ZAR', 'EG': 'EGP',
  'SG': 'SGD', 'HK': 'HKD', 'MX': 'MXN', 'AE': 'AED', 'RU': 'RUB',
  'KR': 'KRW', 'TH': 'THB', 'ID': 'IDR', 'MY': 'MYR', 'PH': 'PHP',
  'PK': 'PKR', 'TR': 'TRY', 'SA': 'SAR', 'QA': 'QAR', 'NZ': 'NZD',
};

const FALLBACK_RATES = {
  'CNY': 7.3, 'USD': 1, 'GBP': 0.79, 'JPY': 155, 'INR': 83,
  'BRL': 4.97, 'AUD': 1.50, 'EUR': 0.92, 'GHS': 12.5, 'CAD': 1.36,
  'ZAR': 18.5, 'NGN': 1500, 'KES': 129, 'SGD': 1.35, 'HKD': 7.8,
  'MXN': 18.5, 'AED': 3.67, 'RUB': 90, 'KRW': 1380, 'THB': 36,
  'IDR': 16300, 'MYR': 4.7, 'PHP': 58, 'PKR': 278, 'EGP': 48,
  'TRY': 32, 'SAR': 3.75, 'QAR': 3.64, 'NZD': 1.65,
};

// Detect China via browser timezone or locale — works even when geo APIs are blocked
function detectChinaFromLocale() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const locale = navigator.language || navigator.languages?.[0] || '';
    return tz === 'Asia/Shanghai' || tz === 'Asia/Urumqi' ||
           locale.toLowerCase().startsWith('zh') || locale.toLowerCase().includes('cn');
  } catch { return false; }
}

// Returns the set of payment methods available for a given country code
export function getPaymentMethods(countryCode) {
  const methods = ['stripe']; // Stripe (cards, Apple Pay, Google Pay) is always available

  if (countryCode === 'CN') {
    methods.push('wechat_pay', 'alipay');
  }
  if (countryCode === 'GH') {
    methods.push('hubtel');
  }

  return methods;
}

export function useCurrencyDetection() {
  const [currency, setCurrency] = useState({ code: 'USD', rate: 1, symbol: '$' });
  const [countryCode, setCountryCode] = useState('US');
  const [paymentMethods, setPaymentMethods] = useState(['stripe']);

  const detect = async () => {
    const fetchLiveRates = async () => {
      try {
        const cached = JSON.parse(localStorage.getItem('voxvpn_live_rates') || 'null');
        if (cached && Date.now() - cached.fetchedAt < 3600000) {
          return cached.rates;
        }
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data?.rates) {
          localStorage.setItem('voxvpn_live_rates', JSON.stringify({ rates: data.rates, fetchedAt: Date.now() }));
          return data.rates;
        }
      } catch { /* fall through to fallback rates */ }
      return null;
    };

    const makeCurrency = (currencyCode, rate) => ({
      code: currencyCode,
      rate: rate || FALLBACK_RATES[currencyCode] || 1,
      symbol: CURRENCY_SYMBOLS[currencyCode] || '$',
    });

    const [geoData, liveRates] = await Promise.all([
      fetch('https://ipapi.co/json/').then(r => r.json()).catch(() => ({})),
      fetchLiveRates(),
    ]);

    let code = geoData.country_code;
    // Fallback: if geo API failed (common in China), detect via timezone/locale
    if (!code && detectChinaFromLocale()) {
      code = 'CN';
    }
    code = code || 'US';
    setCountryCode(code);
    const currencyCode = COUNTRY_CURRENCY[code] || 'USD';
    const rate = liveRates
      ? liveRates[currencyCode] || FALLBACK_RATES[currencyCode] || 1
      : FALLBACK_RATES[currencyCode] || 1;
    setCurrency(makeCurrency(currencyCode, rate));
    setPaymentMethods(getPaymentMethods(code));
  };

  useEffect(() => { detect(); }, []);

  return { currency, countryCode, paymentMethods, refresh: detect };
}

export { CURRENCY_SYMBOLS, FALLBACK_RATES, COUNTRY_CURRENCY };