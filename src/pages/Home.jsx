import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import ScrollingDevices from "../components/landing/ScrollingDevices";
import StayConnected from "../components/landing/StayConnected";
import UseCaseBanner from "../components/landing/UseCaseBanner";
import PricingSection from "../components/landing/PricingSection";
import VIPBanner from "../components/landing/VIPBanner";
import TestimonialSection from "../components/landing/TestimonialSection";
import BusinessTestimonials from "../components/landing/BusinessTestimonials";
import FAQSection from "../components/landing/FAQSection";
import Footer from "../components/landing/Footer";
import CheckoutBanner from "../components/landing/CheckoutBanner";
import SearchSection from "../components/landing/SearchSection";
import ESimBenefitsBanner from "../components/landing/ESimBenefitsBanner";
import StatsTrustBadge from "../components/landing/StatsTrustBadge";
import LaunchBanner from "../components/landing/LaunchBanner";
import MacOSDownloadSection from "../components/landing/MacOSDownloadSection";


export default function Home() {
  return (
    <div className="font-sans overflow-x-hidden" style={{ background: "linear-gradient(135deg, #0d1b2f 0%, #001f3f 50%, #00264d 100%)" }}>
      <LaunchBanner />
      <CheckoutBanner />
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #0a2342 0%, #001a33 50%, #001f4d 100%)" }}>
        <div className="hidden md:block">
          <Navbar />
        </div>
        <HeroSection />
        <ScrollingDevices />
      </div>
      <StatsTrustBadge />
      <ESimBenefitsBanner />
      <StayConnected />
      <UseCaseBanner />
      <MacOSDownloadSection />
      <BusinessTestimonials />
      <SearchSection />
      <PricingSection />
      <VIPBanner />
      <TestimonialSection />
      <FAQSection />
      <Footer />
    </div>
  );
}