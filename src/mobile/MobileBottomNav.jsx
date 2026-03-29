import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Zap, DollarSign, User } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'features', label: 'Features', icon: Zap, path: '/features-mobile' },
  { id: 'pricing', label: 'Pricing', icon: DollarSign, path: '/pricing-mobile' },
  { id: 'account', label: 'Account', icon: User, path: '/account-mobile' },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabPress = (path, tabId) => {
    if (location.pathname === path) {
      // Reset to root of stack if re-selecting
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#080c18] border-t border-white/5 flex justify-around items-center h-20"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabPress(tab.path, tab.id)}
            className={`flex flex-col items-center justify-center w-16 h-16 transition-colors user-select-none ${
              isActive
                ? 'text-cyan-400'
                : 'text-slate-500 active:text-cyan-400'
            }`}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={24} strokeWidth={1.5} />
            <span className="text-xs mt-1 font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}