import { Menu, X, LogOut, Shield, Globe } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { LanguageContext } from '@/lib/LanguageContext';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'Servers', href: '#servers' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'eSIM', href: 'https://www.voxdigits.net', external: true },
  { label: 'Virtual Numbers', href: 'https://www.voxdigits.net', external: true },
  { label: 'Support', href: '/contact' },
  { label: 'Buy VPN', href: '/pricing' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export default function Navbar() {
  const { language, changeLanguage } = useContext(LanguageContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activeHash, setActiveHash] = useState('');
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
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
    if (href.startsWith('/') && !href.startsWith('//')) return location.pathname === href;
    return false;
  };

  const handleNavClick = (href) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname === '/') {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.assign('/' + href);
      }
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="fixed top-0 w-full z-50">
      {/* Main nav */}
      <nav className="bg-[#080c18]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center h-[88px] gap-4">
            {/* Logo — 100% bigger */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/13431de73_VoxICON.png"
                alt="VoxVPN"
                className="h-20 w-auto"
              />
            </Link>

            {/* Desktop nav — centered */}
            <div className="hidden md:flex items-center justify-center gap-1 flex-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const cls = `px-2.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                  active ? 'text-white' : 'text-slate-400 hover:text-white'
                }`;
                if (link.external) {
                  return (
                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
                      {link.label}
                    </a>
                  );
                }
                if (link.href.startsWith('/')) {
                  return <Link key={link.label} to={link.href} className={cls}>{link.label}</Link>;
                }
                return (
                  <a key={link.label} href={link.href} onClick={() => handleNavClick(link.href)} className={cls}>
                    {link.label}
                  </a>
                );
              })}
              {/* Admin link — only for admins */}
              {isAdmin && (
                <Link to="/admin" className={`px-3 py-1.5 text-sm font-medium transition-all ${isActive('/admin') ? 'text-cyan-400' : 'text-violet-400 hover:text-violet-300'}`}>
                  Admin
                </Link>
              )}

              {/* Language dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-all"
                >
                  <Globe size={14} /> {language.toUpperCase()}
                </button>
                {langDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-[#0d1120] border border-white/10 rounded-lg shadow-lg z-50 min-w-40">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                          language === lang.code
                            ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{lang.flag}</span> {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="hidden md:flex items-center gap-1.5 ml-auto flex-shrink-0">
              {user && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full transition-all"
                >
                  <Shield size={14} /> My Dashboard
                </Link>
              )}
              {user ? (
                <>
                  <span className="text-slate-400 text-xs hidden lg:block">{user.full_name}</span>
                  <button
                    onClick={() => base44.auth.logout('/')}
                    className="flex items-center gap-1.5 px-2 py-1.5 text-slate-400 hover:text-white text-xs transition-colors"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/vpn-login"
                    className="px-3 py-1.5 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-white/10 hover:border-white/20 rounded-full"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/vpn-signup"
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-full transition-all border border-white/10"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <Link
                to="/pricing"
                className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold rounded-full transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap"
              >
                Choose a Plan
              </Link>
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
                const cls = `block px-3 py-2 rounded text-sm font-medium transition-colors ${active ? 'text-cyan-400' : 'text-slate-300 hover:text-white'}`;
                if (link.external) {
                  return <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>{link.label}</a>;
                }
                if (link.href.startsWith('/')) {
                  return <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)} className={cls}>{link.label}</Link>;
                }
                return <a key={link.label} href={link.href} onClick={() => handleNavClick(link.href)} className={cls}>{link.label}</a>;
              })}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
                  Admin Panel
                </Link>
              )}
              
              {/* Language dropdown mobile */}
              <div className="px-3 py-2">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Language</p>
                <div className="space-y-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                        language === lang.code
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{lang.flag}</span> {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded text-sm font-bold text-cyan-400"
                >
                  <Shield size={15} /> My Dashboard
                </Link>
              )}
              <div className="flex gap-2 pt-2">
                {user ? (
                  <button onClick={() => base44.auth.logout('/')} className="flex-1 py-2 border border-white/10 text-slate-300 text-sm font-medium rounded-full">Log Out</button>
                ) : (
                  <>
                    <Link to="/vpn-login" onClick={() => setMobileOpen(false)} className="flex-1 py-2 text-center border border-white/10 text-slate-300 text-sm font-medium rounded-full">Log In</Link>
                    <Link to="/vpn-signup" onClick={() => setMobileOpen(false)} className="flex-1 py-2 text-center bg-white/10 text-white text-sm font-semibold rounded-full">Sign Up</Link>
                  </>
                )}
              </div>
              <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block mt-1 py-2 text-center bg-cyan-400 text-black text-sm font-bold rounded-full">
                Choose a Plan
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Announcement bar */}
      {announcementVisible && (
        <div className="bg-[#0a1a1f] border-b border-cyan-500/20 py-2 px-4 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-slate-300 relative text-center">
          <span className="leading-tight">🌐 📱 <span className="text-white font-semibold">Global Communication, Simplified</span>{' '}·{' '}
            <a href="https://www.voxdigits.net" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-medium">Get eSIM</a>{' '}and{' '}
            <a href="https://www.voxdigits.net" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-medium">Virtual Numbers</a>
          </span>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
    </header>
  );
}