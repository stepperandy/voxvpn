import Navbar from '@/components/landing/Navbar.jsx';
import Hero from '@/components/landing/Hero.jsx';
import Stats from '@/components/landing/Stats.jsx';
import Features from '@/components/landing/Features.jsx';
import Servers from '@/components/landing/Servers';
import Pricing from '@/components/landing/Pricing.jsx';
import Footer from '@/components/landing/Footer';
import TrustBadges from '@/components/landing/TrustBadges';
import Testimonials from '@/components/landing/Testimonials';

export default function Home() {
  return (
    <div className="bg-[#080c18]">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Servers />
      <Pricing />
      <Testimonials />
      <TrustBadges />
      <Footer />
    </div>
  );
}