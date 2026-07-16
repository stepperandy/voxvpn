import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder, Digital Agency",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    text: "VoxDigits transformed how we manage client communications. The reliability and ease of use are unmatched. We've cut our telecom costs by 40%.",
    rating: 5
  },
  {
    name: "Marcus Johnson",
    role: "CEO, E-commerce Platform",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    text: "The virtual numbers work seamlessly across all markets we operate in. Customer support is exceptional and genuinely cares about our success.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Product Manager, SaaS Startup",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    text: "Best decision we made for international customer support. The SMS and voice API integration was painless and our team was live within hours.",
    rating: 5
  },
  {
    name: "David Park",
    role: "Operations Director, Tech Company",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    text: "Scaling our communication infrastructure with VoxDigits was so simple. The eSIM data plans are perfect for our field teams across regions.",
    rating: 5
  }
];

export default function TestimonialSection() {
  return (
    <section className="py-20 px-6 md:px-10" style={{ background: "linear-gradient(180deg, #120827 0%, #1a0a35 100%)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Thousands of businesses worldwide rely on VoxDigits for their communication needs. See what our customers have to say.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl p-8 hover:border-orange-500/40 transition-all duration-300"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-400 text-base mb-8 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-white font-semibold text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-500 text-xs">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Metrics */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">50K+</div>
            <p className="text-gray-400 text-sm">Active Users</p>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">180+</div>
            <p className="text-gray-400 text-sm">Countries Supported</p>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">99.9%</div>
            <p className="text-gray-400 text-sm">Uptime SLA</p>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">24/7</div>
            <p className="text-gray-400 text-sm">Support Available</p>
          </div>
        </div>
      </div>
    </section>
  );
}