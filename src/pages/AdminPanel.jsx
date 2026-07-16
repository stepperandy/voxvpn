import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  AlertCircle, Loader2, Users, Package, DollarSign, TrendingUp, MessageSquare,
  BarChart3, Phone, Share2, Zap, Settings, Wifi, Download, Shield,
  LayoutDashboard, ShieldCheck, Gift, Globe, Menu, X, LogOut, Search, Route,
  ChevronDown, Bell, Store, Activity, Rocket, Archive
} from 'lucide-react';
import AdminResellers from '@/components/admin/AdminResellers.jsx';
import AdminBundles from '@/components/admin/AdminBundles.jsx';
import AdminPriceControl from '@/components/admin/AdminPriceControl.jsx';
import AdminSupportTickets from '@/components/admin/AdminSupportTickets.jsx';
import AdminUsers from '@/components/admin/AdminUsers.jsx';
import AdminNumbersManager from '@/components/admin/AdminNumbersManager.jsx';
import AdminKYC from '@/components/admin/AdminKYC.jsx';
import AdminFraudAlerts from '@/components/admin/AdminFraudAlerts.jsx';
import AdminPricingRules from '@/components/admin/AdminPricingRules.jsx';
import AdminNumberArchive from '@/components/admin/AdminNumberArchive.jsx';
import AdminInventory from '@/components/admin/AdminInventory.jsx';
import AdminOverview from '@/components/admin/AdminOverview.jsx';
import AdminEsimGoSettings from '@/components/admin/AdminEsimGoSettings.jsx';
import AdminDownloads from '@/components/admin/AdminDownloads.jsx';
import AdminWebhookConfig from './AdminWebhookConfig.jsx';
import AdminIOSSettings from './AdminIOSSettings.jsx';
import AdminAndroidSettings from './AdminAndroidSettings.jsx';
import AdminCallLogs from './AdminCallLogs.jsx';
import AdminNumberRouting from './AdminNumberRouting.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEOManager from '@/components/marketing/SEOManager.jsx';
import SMOManager from '@/components/marketing/SMOManager.jsx';
import PPCManager from '@/components/marketing/PPCManager.jsx';
import LaunchManager from '@/components/marketing/LaunchManager.jsx';
import MarketingDashboard from '@/components/marketing/MarketingDashboard.jsx';
import SitemapManager from '@/components/marketing/SitemapManager.jsx';

const ADMIN_LOGO = "https://media.base44.com/images/public/69b202c06dc5b1988efe9645/e6163c0d6_TELLOGO11.png";

const NAV_GROUPS = [
  {
    group: "Dashboard",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
    ],
  },
  {
    group: "Customers",
    items: [
      { id: "users", label: "Users", icon: Users },
      { id: "tickets", label: "Support Tickets", icon: MessageSquare },
      { id: "kyc", label: "KYC Verification", icon: ShieldCheck },
      { id: "fraud", label: "Fraud Alerts", icon: AlertCircle },
    ],
  },
  {
    group: "Telecom",
    items: [
      { id: "numbers", label: "Virtual Numbers", icon: Phone },
      { id: "inventory", label: "Number Inventory", icon: Globe },
      { id: "call_logs", label: "Call Logs", icon: BarChart3 },
      { id: "number_routing", label: "Number Routing", icon: Route },
      { id: "number_archive", label: "Number Archive", icon: Archive },
      { id: "esim_go", label: "eSIM Go", icon: Wifi },
    ],
  },
  {
    group: "Commerce",
    items: [
      { id: "resellers", label: "Resellers", icon: Users },
      { id: "bundles", label: "Bundles", icon: Gift },
      { id: "pricing", label: "Pricing Control", icon: DollarSign },
      { id: "pricing_rules", label: "Rate Rules", icon: BarChart3 },
    ],
  },
  {
    group: "Marketing",
    items: [
      { id: "marketing", label: "Campaigns", icon: TrendingUp },
    ],
  },
  {
    group: "System",
    items: [
      { id: "webhooks", label: "Webhooks", icon: Zap },
      { id: "ios_settings", label: "iOS Settings", icon: Settings },
      { id: "android_settings", label: "Android Settings", icon: Settings },
      { id: "downloads", label: "Downloads", icon: Download },
    ],
  },
];

const TAB_LABELS = {
  overview: "Overview",
  users: "Users",
  tickets: "Support Tickets",
  numbers: "Virtual Numbers",
  inventory: "Number Inventory",
  kyc: "KYC Verification",
  fraud: "Fraud Alerts",
  pricing_rules: "Rate Rules",
  resellers: "Resellers",
  bundles: "Bundles",
  pricing: "Pricing Control",
  marketing: "Marketing Campaigns",
  webhooks: "Webhooks",
  ios_settings: "iOS Settings",
  android_settings: "Android Settings",
  esim_go: "eSIM Go",
  downloads: "Downloads",
  call_logs: "Call Logs",
  number_routing: "Number Routing",
  number_archive: "Number Archive",
};

function renderTabContent(activeTab) {
  switch (activeTab) {
    case "overview": return <AdminOverview />;
    case "users": return <AdminUsers />;
    case "tickets": return <AdminSupportTickets />;
    case "numbers": return <AdminNumbersManager />;
    case "inventory": return <AdminInventory />;
    case "resellers": return <AdminResellers />;
    case "bundles": return <AdminBundles />;
    case "kyc": return <AdminKYC />;
    case "fraud": return <AdminFraudAlerts />;
    case "pricing_rules": return <AdminPricingRules />;
    case "pricing": return <AdminPriceControl />;
    case "webhooks": return <AdminWebhookConfig />;
    case "ios_settings": return <AdminIOSSettings />;
    case "android_settings": return <AdminAndroidSettings />;
    case "esim_go": return <AdminEsimGoSettings />;
    case "downloads": return <AdminDownloads />;
    case "call_logs": return <AdminCallLogs />;
    case "number_routing": return <AdminNumberRouting />;
    case "number_archive": return <AdminNumberArchive />;
    case "marketing":
      return (
        <Tabs defaultValue="performance">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 mb-6 flex-wrap h-auto">
            <TabsTrigger value="performance" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"><BarChart3 className="w-4 h-4" /> Performance</TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"><TrendingUp className="w-4 h-4" /> SEO</TabsTrigger>
            <TabsTrigger value="smo" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"><Share2 className="w-4 h-4" /> SMO</TabsTrigger>
            <TabsTrigger value="ppc" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"><Zap className="w-4 h-4" /> PPC</TabsTrigger>
            <TabsTrigger value="launch" className="flex items-center gap-2 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300"><Rocket className="w-4 h-4" /> Launch</TabsTrigger>
            <TabsTrigger value="sitemap" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"><Globe className="w-4 h-4" /> Sitemap</TabsTrigger>
          </TabsList>
          <TabsContent value="performance"><MarketingDashboard /></TabsContent>
          <TabsContent value="seo"><SEOManager /></TabsContent>
          <TabsContent value="smo"><SMOManager /></TabsContent>
          <TabsContent value="ppc"><PPCManager /></TabsContent>
          <TabsContent value="launch"><LaunchManager /></TabsContent>
          <TabsContent value="sitemap"><SitemapManager /></TabsContent>
        </Tabs>
      );
    default: return <AdminOverview />;
  }
}

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => location.hash.replace('#', '') || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const u = await base44.auth.me();
        if (u?.role !== 'admin') throw new Error('Admin access required');
        setUser(u);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    setActiveTab(hash || 'overview');
    setSidebarOpen(false);
  }, [location.hash]);

  const handleNavClick = (id) => {
    setActiveTab(id);
    navigate(`/AdminPanel#${id}`);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-slate-500">Loading admin console…</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl max-w-md">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-semibold">Admin access required</p>
            <p className="text-red-400/60 text-sm mt-1">You don't have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-800 flex-shrink-0">
        <Link to="/" className="flex-shrink-0">
          <img src={ADMIN_LOGO} alt="VoxDigits" className="h-9 w-auto object-contain" />
        </Link>
        <div className="min-w-0 border-l border-slate-700 pl-3">
          <p className="text-sm font-bold text-white truncate">Admin Console</p>
          <p className="text-[10px] text-cyan-400 font-medium">VoxDigits</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5" style={{ scrollbarWidth: 'thin' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{group.group}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-cyan-400" : ""}`} />
                    <span className="truncate">{item.label}</span>
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-800 p-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user.full_name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user.full_name || 'Admin'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
          </div>
          <button onClick={handleLogout} title="Logout" className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const currentGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === activeTab))?.group || '';

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-64 z-50 lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-3 h-16 px-4 md:px-6 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider leading-none">{currentGroup}</p>
              <h1 className="text-sm md:text-base font-bold text-white leading-tight mt-0.5 truncate">{TAB_LABELS[activeTab]}</h1>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 ml-auto px-3 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 w-56">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search…"
              className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </Link>
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
            </button>
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderTabContent(activeTab)}
          </div>
        </main>
      </div>
    </div>
  );
}