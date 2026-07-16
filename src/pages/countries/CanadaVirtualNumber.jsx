import React from "react";
import CountryLanding from "@/components/landing/CountryLanding";

const CA_DATA = {
  country: "Canada",
  countryCode: "CA",
  flag: "🇨🇦",
  slug: "canada-virtual-number",
  monthlyPrice: 1.79,
  annualPrice: 13.5,
  setupFee: 0.89,
  monthlyPriceId: "price_1TsN0ZAj5jZA8C2ylcI6jx4E",
  annualPriceId: "price_1TsN0ZAj5jZA8C2yBl02DpKf",
};

export default function CanadaVirtualNumber() {
  return <CountryLanding data={CA_DATA} />;
}