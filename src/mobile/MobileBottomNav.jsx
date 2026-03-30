import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Zap, DollarSign, User } from 'lucide-react';
import { useTabContext } from '@/mobile/MobileTabContext';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'features', label: 'Features', icon: Zap, path: '/features-mobile' },
  { id: 'pricing', label: 'Pricing', icon: DollarSign, path: '/pricing-mobile' },
  { id: 'account', label: 'Account', icon: User, path: '/account-mobile' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeTab, setActiveTab, saveScrollPosition, saveTabState } = useTabContext();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (!isMobile) return null;

  const handleTabChange = (tab) => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      saveScrollPosition(activeTab, mainContent.scrollTop);
    }
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-[#060910] z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors select-none touch-target ${
                isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={24} />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}