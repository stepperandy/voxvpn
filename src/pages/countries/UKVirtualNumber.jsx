import React from "react";
import CountryLanding from "@/components/landing/CountryLanding";

const UK_DATA = {
  country: "the United Kingdom",
  countryCode: "GB",
  flag: "🇬🇧",
  slug: "uk-virtual-number",
  monthlyPrice: 1.79,
  annualPrice: 13.5,
  setupFee: 0.89,
  monthlyPriceId: "price_1TsN0ZAj5jZA8C2yrVzE7dQj",
  annualPriceId: "price_1TsN0ZAj5jZA8C2yki7FVDNG",
};

export default function UKVirtualNumber() {
  return <CountryLanding data={UK_DATA} />;
}