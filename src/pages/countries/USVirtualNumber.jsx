import React from "react";
import CountryLanding from "@/components/landing/CountryLanding";

const US_DATA = {
  country: "the United States",
  countryCode: "US",
  flag: "🇺🇸",
  slug: "us-virtual-number",
  monthlyPrice: 0.89,
  annualPrice: 8.99,
  setupFee: 0.89,
  monthlyPriceId: "price_1TsN0ZAj5jZA8C2yweoirVXL",
  annualPriceId: "price_1TsN0ZAj5jZA8C2yRz15gXzC",
};

export default function USVirtualNumber() {
  return <CountryLanding data={US_DATA} />;
}