import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  Globe, Wifi, Phone, LayoutDashboard, MoreHorizontal,
  X, Settings, CreditCard, MessageSquare, Shield, Gift,
  LogIn, LogOut, ChevronRight, Zap, Menu, Bot, Palette, UserPlus
} from "lucide-react";
import AIAssistantWidget from "@/components/AIAssistantWidget";
import ReferralClaimChecker from "@/components/referral/ReferralClaimChecker";


const TABS = [
  { name: "Home",      path: "/",                    icon: Globe },
  { name: "Buy eSIM",      path: "/ESimStore",            icon: Wifi },
  { name: "Buy Virtual Number",   path: "/VirtualNumbers",       icon: Phone },
  { name: "More",      path: null,                    icon: MoreHorizontal },
];

// App name constant for easy updates
const APP_NAME = "VoxDigits";

const MORE_LINKS = [
  { label: "SMS Messages",    path: "/SMSInbox",           icon: MessageSquare,  authRequired: true },
  { label: "Credits",     path: "/Credits",         icon: CreditCard,     authRequired: true },
  { label: "My eSIMs",   path: "/ESimDashboard",   icon: Wifi,           authRequired: true },
  { label: "My Virtual Numbers", path: "/ServicesDashboard", icon: Phone, authRequired: true },
  { label: "AI Assistant", path: "/AIAssistant",    icon: Bot,            authRequired: false },
  { label: "Dialer",      path: "/Dialer",          icon: Phone,          authRequired: true },
  { label: "Contacts",    path: "/Contacts",        icon: Phone,          authRequired: true },

  { label: "Refer & Earn",  path: "/ReferralDashboard", icon: UserPlus,     authRequired: true },
  { label: "Rewards",     path: "/LoyaltyProgram",  icon: Gift,           authRequired: true },
  { label: "Support",     path: "/UserTickets",     icon: MessageSquare,  authRequired: true },
  { label: "Preferences", path: "/Preferences",     icon: Settings,       authRequired: true },
  { label: "Settings",    path: "/Settings",        icon: Settings,       authRequired: true },
  { label: "Admin Panel", path: "/AdminPanel",      icon: Shield,         adminOnly: true },
];

const ROOT_PATHS = ['/', '/Home', '/VirtualNumbers', '/Services', '/Pricing', '/Contact', '/AboutUs', '/ESimGuide', '/ApplicationForm', '/DeviceCompatibility', '/ESimAvailability'];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootPath = ROOT_PATHS.includes(location.pathname);
  const [showMore, setShowMore] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setIsAuthenticated(true);
        setCredits(u?.credits || 0);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  // Close overlays on navigation
  useEffect(() => {
    setShowMore(false);
    setShowSidebar(false);
  }, [location.pathname]);

  const pathname = location.pathname;

  const activeTab = TABS.find(t => {
    if (!t.path) return false;
    if (t.path === "/") return pathname === "/" || pathname === "/Home";
    return pathname.startsWith(t.path);
  })?.name || null;

  const handleTabClick = (tab) => {
    if (tab.path === null) {
      setShowMore(true);
    } else {
      navigate(tab.path);
    }
  };

  const handleLogin = () => {
    const next = encodeURIComponent(window.location.origin + '/Dashboard');
    window.location.href = `/TermsAgreement?next=${next}`;
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const visibleMoreLinks = MORE_LINKS.filter(l => {
    if (l.adminOnly) return user?.role === "admin";
    if (l.authRequired) return isAuthenticated;
    return true;
  });

  // Sidebar for desktop — shows all tabs as a vertical list
  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800">
        <Link to="/" onClick={onClose}>
          <img
            src="https://media.base44.com/images/public/69b202c06dc5b1988efe9645/e6163c0d6_TELLOGO11.png"
            alt="VoxDigits"
            className="h-24 w-auto"
          />
        </Link>
      </div>

      {/* Credits */}
      {isAuthenticated && (
        <div className="px-4 py-3">
          <Link to="/Credits" onClick={onClose} className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-xl text-sm text-white font-semibold w-full">
            <Zap className="w-4 h-4 text-cyan-400" />
            Balance: ${credits.toFixed(2)}
          </Link>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-auto">
        {TABS.filter(t => t.path && (!t.authRequired || isAuthenticated) && (!t.adminOnly || user?.role === "admin")).map(tab => {
          const Icon = tab.icon;
          const isActive = tab.path === "/" ? (pathname === "/" || pathname === "/Home") : pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.name}
              to={tab.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {tab.name}
            </Link>
          );
        })}

        <div className="pt-2 border-t border-gray-800 mt-2 space-y-1">
          {visibleMoreLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Auth */}
      <div className="px-3 py-4 border-t border-gray-800">
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors font-semibold"
          >
            <LogIn className="w-5 h-5" />
            Login / Sign Up
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a1628] text-white overflow-hidden">

      {/* ── DESKTOP SIDEBAR (md+) ── */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-[#0a1f33] border-r border-cyan-900/30">
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {showSidebar && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setShowSidebar(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-[#0a1f33] border-r border-cyan-900/30 z-50 md:hidden overflow-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
              <span className="font-bold text-white text-sm">Menu</span>
              <button onClick={() => setShowSidebar(false)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent onClose={() => setShowSidebar(false)} />
          </div>
        </>
      )}

      {/* ── RIGHT SIDE: header + content + bottom nav ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar (mobile only — desktop uses sidebar) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0a1f33] border-b border-cyan-900/30 flex-shrink-0" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
          {!isRootPath ? (
            <button onClick={() => navigate(-1)} className="p-1 text-gray-300 select-none">
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={() => setShowSidebar(true)} className="p-1 text-gray-300 select-none">
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to="/">
            <img
              src="https://media.base44.com/images/public/69b202c06dc5b1988efe9645/e6163c0d6_TELLOGO11.png"
              alt="VoxDigits"
              className="h-[72px] w-auto"
            />
          </Link>
          {isAuthenticated ? (
            <Link to="/Credits" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-lg text-xs font-semibold text-white">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              ${credits.toFixed(2)}
            </Link>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 rounded-lg text-xs font-bold text-gray-950"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </button>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Bottom nav (mobile only) */}
        <nav
          className="md:hidden flex-shrink-0 flex bg-[#0a1f33] border-t border-cyan-900/30 fixed bottom-0 left-0 right-0 z-40"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {TABS.filter(t => (!t.authRequired || isAuthenticated) && (!t.adminOnly || user?.role === "admin")).map(tab => {
            const Icon = tab.icon;
            const isActive = tab.path
              ? (tab.path === "/" ? (pathname === "/" || pathname === "/Home") : pathname.startsWith(tab.path))
              : showMore;
            return (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors min-h-[56px] select-none ${
                  isActive ? "text-cyan-400" : "text-gray-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* More drawer (mobile) */}
      {showMore && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setShowMore(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a1f33] border-t border-cyan-500/20 rounded-t-2xl md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <span className="font-bold text-white">Menu</span>
              <button onClick={() => setShowMore(false)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 space-y-1 max-h-[60vh] overflow-auto">
              {visibleMoreLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setShowMore(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors select-none"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-white">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-gray-800 mt-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => { setShowMore(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowMore(false); handleLogin(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-cyan-500/10 text-cyan-400 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <LogIn className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Login / Sign Up</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    {currentPageName !== "Dialer" && <AIAssistantWidget currentPageName={currentPageName} />}
    <ReferralClaimChecker />
    </div>
  );
}