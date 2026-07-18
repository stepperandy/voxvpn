import React from "react";
import CountryLanding from "@/components/landing/CountryLanding";

const AU_DATA = {
  country: "Australia",
  countryCode: "AU",
  flag: "🇦🇺",
  slug: "australia-virtual-number",
  monthlyPrice: 6.29,
  annualPrice: 53.99,
  setupFee: 0.89,
  monthlyPriceId: "price_1TsN0ZAj5jZA8C2ya2fmtMyX",
  annualPriceId: "price_1TsN0ZAj5jZA8C2yc8zArSb0",
};

export default function AustraliaVirtualNumber() {
  return <CountryLanding data={AU_DATA} />;
}