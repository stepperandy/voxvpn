import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Phone, 
  MessageSquare, 
  Settings, 
  Shield, 
  Globe,
  CreditCard,
  FileText,
  Bot,
  Menu,
  X,
  Gift
} from "lucide-react";

const ADMIN_LINKS = [
  { label: "Overview", path: "/AdminPanel", icon: LayoutDashboard },
  { label: "Users", path: "/AdminPanel", icon: Users, section: "users" },
  { label: "Numbers", path: "/AdminPanel", icon: Phone, section: "numbers" },
  { label: "Tickets", path: "/AdminTickets", icon: MessageSquare },
  { label: "KYC", path: "/AdminPanel", icon: Shield, section: "kyc" },
  { label: "Fraud", path: "/AdminPanel", icon: Shield, section: "fraud" },
  { label: "Resellers", path: "/AdminPanel", icon: Users, section: "resellers" },
  { label: "Bundles", path: "/AdminPanel", icon: Gift, section: "bundles" },
  { label: "Pricing", path: "/AdminPanel", icon: CreditCard, section: "pricing" },
  { label: "Inventory", path: "/AdminPanel", icon: Globe, section: "inventory" },
  { label: "Webhooks", path: "/AdminWebhookConfig", icon: Settings },
  { label: "iOS Settings", path: "/AdminIOSSettings", icon: Settings },
  { label: "Android", path: "/AdminAndroidSettings", icon: Settings },
  { label: "Call Logs", path: "/AdminCallLogs", icon: Phone },
  { label: "Marketing", path: "/AdminMarketing", icon: FileText },
  { label: "AI Agent", path: "/AIAssistant", icon: Bot },
];

export default function AdminNavbar() {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const isActive = (link) => {
    if (link.section) {
      return location.pathname === "/AdminPanel" && location.hash === `#${link.section}`;
    }
    return location.pathname === link.path;
  };

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden lg:flex items-center gap-1 overflow-x-auto px-6 h-16 bg-[#0d2137] border-b border-gray-800 sticky top-0 z-40" style={{
          scrollbarWidth: 'auto',
          scrollbarColor: 'rgb(75 85 99) rgb(31 41 55)'
        }}>
          {ADMIN_LINKS.map(link => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.label}
                to={link.section ? `${link.path}#${link.section}` : link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {link.label}
              </Link>
            );
          })}
        <div className="ml-auto flex-shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            Back
          </Link>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 h-14 bg-[#0d2137] border-b border-gray-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-white">Admin</span>
        </div>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 text-gray-400 hover:text-white"
        >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-30 bg-[#0d2137] pt-16">
          <nav className="p-4 space-y-1 overflow-y-auto">
            {ADMIN_LINKS.map(link => {
              const Icon = link.icon;
              const active = isActive(link);
              return (
                <Link
                  key={link.label}
                  to={link.section ? `${link.path}#${link.section}` : link.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors mt-4 border-t border-gray-800"
            >
              <Globe className="w-4 h-4" />
              Back to App
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}