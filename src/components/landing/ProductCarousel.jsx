import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const products = [
  {
    id: 1,
    title: "eSIM Card",
    image: "https://images.unsplash.com/photo-1609034227505-5876f6aa4e90?w=500&h=500&fit=crop",
    description: "Ultra-thin digital SIM"
  },
  {
    id: 2,
    title: "Smartphone",
    image: "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop",
    description: "5G ready device"
  },
  {
    id: 3,
    title: "Tablet",
    image: "https://images.unsplash.com/photo-1526408529819-201b02de3212?w=500&h=500&fit=crop",
    description: "Connected everywhere"
  },
  {
    id: 4,
    title: "Smartwatch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    description: "Stay connected"
  },
  {
    id: 5,
    title: "Hotspot Device",
    image: "https://images.unsplash.com/photo-1565633200849-f8d4c8561ff2?w=500&h=500&fit=crop",
    description: "Mobile connectivity"
  }
];

export default function ProductCarousel() {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [autoplay]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % products.length);
    setAutoplay(false);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + products.length) % products.length);
    setAutoplay(false);
  };

  return (
    <div className="w-full bg-gradient-to-b from-purple-900 to-indigo-900 py-16 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-12">
          Compatible Devices
        </h2>

        {/* Carousel Container */}
        <div className="relative rounded-3xl overflow-hidden bg-black/30 backdrop-blur-sm border border-white/10">
          <div className="aspect-square md:aspect-video flex items-center justify-center">
            <AnimatePresence mode="fade">
              <motion.div
                key={products[current].id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center p-8"
              >
                <div className="flex flex-col md:flex-row items-center gap-8 w-full h-full">
                  <img
                    src={products[current].image}
                    alt={products[current].title}
                    className="w-48 h-48 md:w-96 md:h-96 object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {products[current].title}
                    </h3>
                    <p className="text-lg text-purple-200 mb-4">
                      {products[current].description}
                    </p>
                    <div className="flex gap-2 justify-center md:justify-start">
                      {products.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrent(idx);
                            setAutoplay(false);
                          }}
                          className={`h-2 rounded-full transition-all ${
                            idx === current
                              ? "bg-cyan-400 w-8"
                              : "bg-white/30 w-2 hover:bg-white/50"
                          }`}
                          aria-label={`Go to product ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all min-h-[2.75rem] min-w-[2.75rem] flex items-center justify-center"
            aria-label="Previous product"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all min-h-[2.75rem] min-w-[2.75rem] flex items-center justify-center"
            aria-label="Next product"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Product Counter */}
        <div className="text-center mt-6 text-purple-200 text-sm">
          {current + 1} / {products.length}
        </div>
      </div>
    </div>
  );
}