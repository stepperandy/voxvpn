import React, { useState } from "react";
import { Globe, MapPin, Wifi, Filter, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const REGIONS = {
  north_america: {
    name: "North America",
    countries: [
      { code: "US", name: "United States", plans: ["1GB - 7 days", "5GB - 30 days"], color: "bg-blue-500" },
      { code: "CA", name: "Canada", plans: ["1GB - 7 days", "5GB - 30 days"], color: "bg-blue-500" },
    ]
  },
  europe: {
    name: "Europe",
    countries: [
      { code: "GB", name: "United Kingdom", plans: ["1GB - 7 days", "5GB - 30 days"], color: "bg-green-500" },
      { code: "FR", name: "France", plans: ["2GB - 15 days"], color: "bg-green-500" },
      { code: "DE", name: "Germany", plans: ["2GB - 15 days"], color: "bg-green-500" },
      { code: "ES", name: "Spain", plans: ["2GB - 15 days"], color: "bg-green-500" },
      { code: "IT", name: "Italy", plans: ["2GB - 15 days"], color: "bg-green-500" },
    ]
  },
  asia_pacific: {
    name: "Asia Pacific",
    countries: [
      { code: "AU", name: "Australia", plans: ["1GB - 7 days", "5GB - 30 days"], color: "bg-purple-500" },
      { code: "JP", name: "Japan", plans: ["1GB - 7 days"], color: "bg-purple-500" },
      { code: "SG", name: "Singapore", plans: ["1GB - 7 days"], color: "bg-purple-500" },
      { code: "NZ", name: "New Zealand", plans: ["1GB - 7 days"], color: "bg-purple-500" },
    ]
  },
  coming_soon: {
    name: "Coming Soon",
    countries: [
      { code: "MX", name: "Mexico", plans: [], color: "bg-gray-500" },
      { code: "BR", name: "Brazil", plans: [], color: "bg-gray-500" },
      { code: "IN", name: "India", plans: [], color: "bg-gray-500" },
      { code: "ZA", name: "South Africa", plans: [], color: "bg-gray-500" },
    ]
  }
};

const REGION_COLORS = {
  north_america: "from-blue-500 to-blue-600",
  europe: "from-green-500 to-green-600",
  asia_pacific: "from-purple-500 to-purple-600",
  coming_soon: "from-gray-500 to-gray-600"
};

export default function ESimAvailability() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showFiltered, setShowFiltered] = useState(false);

  const filteredCountries = showFiltered
    ? Object.entries(REGIONS).flatMap(([key, region]) =>
        region.countries.filter(c => c.plans.length > 0).map(c => ({ ...c, regionKey: key }))
      )
    : [];

  const displayMode = showFiltered ? "filtered" : "regions";

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={createPageUrl("ESimStore")}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to eSIM Store
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">eSIM Coverage Map</h1>
          <p className="text-gray-400">Explore where our eSIM services are available worldwide</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl">
            <MapPin className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">14</p>
            <p className="text-sm text-blue-300">Countries Available</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl">
            <Wifi className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">4+</p>
            <p className="text-sm text-green-300">Active Regions</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl">
            <Globe className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">7</p>
            <p className="text-sm text-purple-300">Coming Soon</p>
          </div>
        </div>

        {/* Filter Button */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowFiltered(!showFiltered)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showFiltered
                ? "bg-cyan-500 text-gray-950 hover:bg-cyan-400"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Filter className="w-4 h-4" />
            {showFiltered ? "Show All" : "Available Plans Only"}
          </button>
        </div>

        {/* Regional Grid */}
        {displayMode === "regions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(REGIONS).map(([key, region]) => (
              <div
                key={key}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors cursor-pointer"
                onClick={() => setSelectedRegion(key)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{region.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{region.countries.length} countries</p>
                  </div>
                  <Globe className={`w-8 h-8 ${region.countries[0].color}`} />
                </div>
                <div className="space-y-2">
                  {region.countries.slice(0, 3).map(country => (
                    <div key={country.code} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{country.name}</span>
                      {country.plans.length > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <span className="text-xs text-gray-600">Coming soon</span>
                      )}
                    </div>
                  ))}
                  {region.countries.length > 3 && (
                    <p className="text-xs text-cyan-400 pt-2">+{region.countries.length - 3} more</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Region Detail */}
        {selectedRegion && (
          <div className="mb-8 p-6 bg-gradient-to-r from-white/5 to-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{REGIONS[selectedRegion].name}</h2>
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {REGIONS[selectedRegion].countries.map(country => (
                <div key={country.code} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">{country.name}</h4>
                    <span className="text-xs font-mono text-gray-500">{country.code}</span>
                  </div>
                  {country.plans.length > 0 ? (
                    <div className="space-y-2">
                      {country.plans.map((plan, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">{plan}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Coming soon</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtered View */}
        {displayMode === "filtered" && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Available Plans by Country</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCountries.map((country, idx) => (
                <div key={idx} className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-green-400" />
                    </div>
                    <h4 className="font-semibold text-white">{country.name}</h4>
                  </div>
                  <div className="space-y-1.5">
                    {country.plans.map((plan, pIdx) => (
                      <p key={pIdx} className="text-xs text-green-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        {plan}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Ready to stay connected?</h3>
              <p className="text-gray-300 text-sm mb-4">Get instant eSIM activation in any available country</p>
              <Link
                to={createPageUrl("ESimStore")}
                className="inline-block px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg font-semibold text-sm transition-colors"
              >
                Browse Plans
              </Link>
            </div>
            <Globe className="w-12 h-12 text-cyan-400 opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}