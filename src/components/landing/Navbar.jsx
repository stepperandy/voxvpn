import React, { useState, useEffect } from "react";
import { Signal, Menu, X, LogIn, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => {
      setIsAuthenticated(!!user);
    }).catch(() => {
      setIsAuthenticated(false);
    });
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await base44.auth.logout();
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    try {
      base44.auth.redirectToLogin(window.location.href);
    } catch (err) {
      console.error('Login redirect failed:', err);
      setIsLoading(false);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto relative z-50">
      <div className="flex items-center flex-1">
        <img src="https://media.base44.com/images/public/69b202c06dc5b1988efe9645/e6163c0d6_TELLOGO11.png" alt="VoxDigits" style={{height: "72px", width: "auto"}} />
      </div>

      <div className="hidden md:flex space-x-8 font-semibold text-sm tracking-widest uppercase">
         <Link to={createPageUrl("Home")} className="text-purple-400 hover:text-purple-300 transition-colors">Home</Link>
         <Link to="/Services" className="text-white/80 hover:text-white transition-colors">Services</Link>
         <Link to="/AboutUs" className="text-white/80 hover:text-white transition-colors">About</Link>
         <Link to="/Contact" className="text-white/80 hover:text-white transition-colors">Contact</Link>
         <a href="#pricing" className="text-white/80 hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a>
         <a href="https://voxvpn.net" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">VoxVPN</a>
       </div>

      <div className="hidden sm:flex items-center space-x-3">
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-400 font-medium text-sm rounded-full border border-red-500/40 hover:border-red-500/60 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-cyan-500 hover:text-cyan-400 font-medium text-sm rounded-full border border-cyan-500/40 hover:border-cyan-500/60 transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        )}
        <Link to={createPageUrl("Dashboard")} className="text-white/80 hover:text-white transition-colors font-medium text-sm px-4 py-2 rounded-full border border-white/20 hover:border-white/40">Dashboard</Link>
        <Link to={createPageUrl("NumberSearch")} className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2 rounded-full font-bold text-sm transition-all duration-200 shadow-lg shadow-orange-500/30">
          Get Started
        </Link>
      </div>

      <button className="sm:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-purple-900 border-t border-purple-700 p-6 flex flex-col space-y-4 sm:hidden z-50">
          <Link to="/Services" className="text-white/80 hover:text-white font-medium">Services</Link>
          <Link to="/AboutUs" className="text-white/80 hover:text-white font-medium">About Us</Link>
          <Link to="/Contact" className="text-white/80 hover:text-white font-medium">Contact</Link>
          <a href="#pricing" className="text-white/80 hover:text-white font-medium" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a>
          <a href="#faq" className="text-white/80 hover:text-white font-medium" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }}>FAQ</a>
          <a href="https://voxvpn.net" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 font-medium">VoxVPN</a>
          <hr className="border-purple-700" />
          <Link to={createPageUrl("Dashboard")} className="text-white/80 hover:text-white font-medium">Dashboard</Link>
          <Link to={createPageUrl("NumberSearch")} className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-full font-bold w-fit">Get Started</Link>
        </div>
      )}
    </nav>
  );
}