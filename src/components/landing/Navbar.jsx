import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'Servers', href: '#servers' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'eSIM', href: '#esim' },
  { label: 'Virtual Numbers', href: '#virtual-numbers' },
  { label: 'Admin', href: '/admin' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activeHash, setActiveHash] = useState('');
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const onHash = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    setActiveHash(window.location.hash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/' && !activeHash;
    if (href.startsWith('#')) return activeHash === href;
    if (href.startsWith('/')) return location.pathname === href;
    return false;
  };

  const handleNavClick = (href) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 w-full z-50">
      {/* Main nav */}
      <nav className="bg-[#0a0e1c] border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-6">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/60e9935e0_b1efe46e-2927-4692-89eb-53a6f756c8a6.png"
                alt="VoxVPN"
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop nav — centered */}
            <div className="hidden md:flex items-center justify-center gap-1 flex-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const cls = `px-3 py-1.5 rounded text-sm font-semibold transition-all ${
                  active
                    ? 'text-cyan-400 underline underline-offset-4 decoration-cyan-400'
                    : 'text-slate-300 hover:text-cyan-400'
                }`;
                if (link.href.startsWith('/') && !link.href.startsWith('#')) {
                  return <Link key={link.label} to={link.href} className={cls}>{link.label}</Link>;
                }
                return (
                  <a key={link.label} href={link.href} onClick={() => handleNavClick(link.href)} className={cls}>
                    {link.label}
                  </a>
                );
              })}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              {user ? (
                <span className="text-slate-300 text-sm">{user.full_name}</span>
              ) : (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="text-slate-300 hover:text-white text-sm transition-colors"
                >
                  Log in
                </button>
              )}
              <a
                href="#pricing"
                onClick={() => handleNavClick('#pricing')}
                className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-sm font-bold rounded-full transition-all"
              >
                Get Protected
              </a>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden text-white ml-auto" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden pb-4 space-y-1 pt-2 border-t border-white/10">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                if (link.href.startsWith('/') && !link.href.startsWith('#')) {
                  return (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
                    >
                      {link.label}
                    </Link>
                  );
                }
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <a href="#pricing" onClick={() => handleNavClick('#pricing')} className="block mt-2 py-2 text-center bg-cyan-400 text-black text-sm font-bold rounded-full">
                Get Protected
              </a>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}