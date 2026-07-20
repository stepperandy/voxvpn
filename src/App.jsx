import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Pages that do NOT require login
const PUBLIC_PATHS = ['/', '/Home', '/LegalPolicy', '/privacypolicy'];

const RequireAuth = ({ children }) => {
  const { isLoadingAuth, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const [activated, setActivated] = React.useState(null);

  React.useEffect(() => {
    // 5s timeout so iPad never hangs indefinitely
    const timeout = setTimeout(() => setActivated(true), 5000);
    base44.auth.me().then(u => {
      clearTimeout(timeout);
      setActivated(u?.activated !== false);
    }).catch(() => {
      clearTimeout(timeout);
      setActivated(true);
    });
    return () => clearTimeout(timeout);
  }, []);

  if (isLoadingAuth) return null;

  if (authError?.type === 'auth_required' && !PUBLIC_PATHS.includes(location.pathname)) {
    navigateToLogin();
    return null;
  }

  if (activated === false) return <AccountPendingBlock />;

  return children;
};

const RequireAdmin = ({ children }) => {
  const { isLoadingAuth, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const [adminStatus, setAdminStatus] = React.useState(null); // null=loading, true=ok, false=denied

  React.useEffect(() => {
    const timeout = setTimeout(() => setAdminStatus(false), 5000);
    base44.auth.me().then(u => {
      clearTimeout(timeout);
      setAdminStatus(u?.role === 'admin');
    }).catch(() => {
      clearTimeout(timeout);
      setAdminStatus(false);
    });
    return () => clearTimeout(timeout);
  }, []);

  if (isLoadingAuth || adminStatus === null) return null;

  if (authError?.type === 'auth_required') {
    navigateToLogin();
    return null;
  }

  if (adminStatus === false) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg max-w-md">
          <span className="text-red-400 font-semibold">Access Denied: Admin only</span>
        </div>
      </div>
    );
  }

  return children;
};
import { base44 } from '@/api/base44Client';
import AccountPendingBlock from '@/components/AccountPendingBlock';
import TermsAgreement from './pages/TermsAgreement';
import { TwilioDeviceProvider } from '@/lib/TwilioDeviceContext';
import GlobalIncomingCallPopup from '@/components/GlobalIncomingCallPopup.jsx';
import Billing from './pages/Billing';
import LegalPolicy from './pages/LegalPolicy';
import ApplicationForm from './pages/ApplicationForm.jsx';
import DeviceCompatibility from './pages/DeviceCompatibility.jsx';
import ESimActivationGuide from './pages/ESimActivationGuide.jsx';
import SupportTickets from './pages/SupportTickets.jsx';
import ESimAvailability from './pages/ESimAvailability.jsx';
import PhoneNumberPorting from './pages/PhoneNumberPorting.jsx';
import NumberSettings from './pages/NumberSettings.jsx';
import DeleteAccount from './pages/DeleteAccount.jsx';
import CallForwarding from './pages/CallForwarding.jsx';
import VirtualNumbers from './pages/VirtualNumbers.jsx';
import ServicesDashboard from './pages/ServicesDashboard.jsx';
import SubscriptionManager from './pages/SubscriptionManager.jsx';
import UserTickets from './pages/UserTickets.jsx';
import UsageDashboard from './pages/UsageDashboard.jsx';
import AdminTickets from './pages/AdminTickets.jsx';
import LoyaltyProgram from './pages/LoyaltyProgram.jsx';
import MultiMessenger from './pages/MultiMessenger.jsx';
import KYCVerification from './pages/KYCVerification.jsx';
import WalletTransactions from './pages/WalletTransactions.jsx';
import AboutUs from './pages/AboutUs.jsx';
import ESimDashboard from './pages/ESimDashboard.jsx';
import Services from './pages/Services.jsx';
import Contact from './pages/Contact.jsx';
import Pricing from './pages/Pricing.jsx';
import ESimGuide from './pages/ESimGuide';
import PortingRequest from './pages/PortingRequest';
import ChatSupport from './pages/ChatSupport';
import AIAssistant from './pages/AIAssistant';
import Dialer from './pages/Dialer.jsx';
import SMSInbox from './pages/SMSInbox.jsx';
import AdminNumberRouting from './pages/AdminNumberRouting.jsx';
import AdminWebhookConfig from './pages/AdminWebhookConfig.jsx';
import AdminIOSSettings from './pages/AdminIOSSettings.jsx';
import AdminAndroidSettings from './pages/AdminAndroidSettings.jsx';
import Contacts from './pages/Contacts.jsx';
import Preferences from './pages/Preferences.jsx';
import AdminCallLogs from './pages/AdminCallLogs';
import AdminPanel from './pages/AdminPanel';
import AdminMarketing from './pages/AdminMarketing';
import BuyCredits from './pages/BuyCredits';
import AppErrorBoundary from '@/components/AppErrorBoundary';

import Security from './pages/Security';
import TransparencyReport from './pages/TransparencyReport';
import ServerStatus from './pages/ServerStatus';
import Company from './pages/Company';
import Careers from './pages/Careers';
import Press from './pages/Press';
import Blog from './pages/Blog';
import GumroadStore from './pages/GumroadStore';
import ReferralDashboard from './pages/ReferralDashboard';
import LaunchCampaign from './pages/LaunchCampaign';
import SitemapXml from './pages/SitemapXml.jsx';
import ClientOnboarding from './pages/ClientOnboarding.jsx';
import ASOManager from './pages/ASOManager.jsx';
import Support from './pages/Support.jsx';
import USVirtualNumber from './pages/countries/USVirtualNumber';
import CanadaVirtualNumber from './pages/countries/CanadaVirtualNumber';
import UKVirtualNumber from './pages/countries/UKVirtualNumber';
import AustraliaVirtualNumber from './pages/countries/AustraliaVirtualNumber';



const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            PUBLIC_PATHS.includes(`/${path}`) ? (
              <LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>
            ) : (
              <RequireAuth>
                <LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>
              </RequireAuth>
            )
          }
        />
      ))}
      <Route path="/Billing" element={<RequireAuth><LayoutWrapper currentPageName="Billing"><Billing /></LayoutWrapper></RequireAuth>} />
      <Route path="/LegalPolicy" element={<LegalPolicy />} />
      <Route path="/privacypolicy" element={<LegalPolicy />} />
      <Route path="/termsofservice" element={<LegalPolicy />} />
      <Route path="/acceptableusepolicy" element={<LegalPolicy />} />
      <Route path="/cookiepolicy" element={<LegalPolicy />} />
      <Route path="/refundpolicy" element={<LegalPolicy />} />
      <Route path="/ApplicationForm" element={<ApplicationForm />} />
      <Route path="/DeviceCompatibility" element={<DeviceCompatibility />} />
      <Route path="/ESimActivationGuide" element={<RequireAuth><LayoutWrapper currentPageName="ESimActivationGuide"><ESimActivationGuide /></LayoutWrapper></RequireAuth>} />
      <Route path="/SupportTickets" element={<RequireAuth><LayoutWrapper currentPageName="SupportTickets"><SupportTickets /></LayoutWrapper></RequireAuth>} />
      <Route path="/ESimAvailability" element={<LayoutWrapper currentPageName="ESimAvailability"><ESimAvailability /></LayoutWrapper>} />
      <Route path="/PhoneNumberPorting" element={<RequireAuth><LayoutWrapper currentPageName="PhoneNumberPorting"><PhoneNumberPorting /></LayoutWrapper></RequireAuth>} />
      <Route path="/NumberSettings" element={<RequireAuth><LayoutWrapper currentPageName="NumberSettings"><NumberSettings /></LayoutWrapper></RequireAuth>} />
      <Route path="/DeleteAccount" element={<RequireAuth><LayoutWrapper currentPageName="DeleteAccount"><DeleteAccount /></LayoutWrapper></RequireAuth>} />
      <Route path="/VirtualNumbers" element={<LayoutWrapper currentPageName="VirtualNumbers"><VirtualNumbers /></LayoutWrapper>} />
      <Route path="/ServicesDashboard" element={<RequireAuth><LayoutWrapper currentPageName="ServicesDashboard"><ServicesDashboard /></LayoutWrapper></RequireAuth>} />
      <Route path="/SubscriptionManager" element={<RequireAuth><LayoutWrapper currentPageName="SubscriptionManager"><SubscriptionManager /></LayoutWrapper></RequireAuth>} />
      <Route path="/UserTickets" element={<RequireAuth><LayoutWrapper currentPageName="UserTickets"><UserTickets /></LayoutWrapper></RequireAuth>} />
      <Route path="/UsageDashboard" element={<RequireAuth><LayoutWrapper currentPageName="UsageDashboard"><UsageDashboard /></LayoutWrapper></RequireAuth>} />
      <Route path="/AdminTickets" element={<Navigate to="/AdminPanel#tickets" replace />} />
      <Route path="/LoyaltyProgram" element={<RequireAuth><LayoutWrapper currentPageName="LoyaltyProgram"><LoyaltyProgram /></LayoutWrapper></RequireAuth>} />
      <Route path="/MultiMessenger" element={<RequireAuth><LayoutWrapper currentPageName="MultiMessenger"><MultiMessenger /></LayoutWrapper></RequireAuth>} />
      <Route path="/KYCVerification" element={<RequireAuth><LayoutWrapper currentPageName="KYCVerification"><KYCVerification /></LayoutWrapper></RequireAuth>} />
      <Route path="/WalletTransactions" element={<RequireAuth><LayoutWrapper currentPageName="WalletTransactions"><WalletTransactions /></LayoutWrapper></RequireAuth>} />
      <Route path="/AboutUs" element={<LayoutWrapper currentPageName="AboutUs"><AboutUs /></LayoutWrapper>} />
      <Route path="/ESimDashboard" element={<RequireAuth><LayoutWrapper currentPageName="ESimDashboard"><ESimDashboard /></LayoutWrapper></RequireAuth>} />
      <Route path="/Services" element={<LayoutWrapper currentPageName="Services"><Services /></LayoutWrapper>} />
      <Route path="/Contact" element={<LayoutWrapper currentPageName="Contact"><Contact /></LayoutWrapper>} />
      <Route path="/Pricing" element={<Pricing />} />
      <Route path="/ESimGuide" element={<LayoutWrapper currentPageName="ESimGuide"><ESimGuide /></LayoutWrapper>} />
      <Route path="/PortingRequest" element={<RequireAuth><LayoutWrapper currentPageName="PortingRequest"><PortingRequest /></LayoutWrapper></RequireAuth>} />
      <Route path="/ChatSupport" element={<RequireAuth><LayoutWrapper currentPageName="ChatSupport"><ChatSupport /></LayoutWrapper></RequireAuth>} />
      <Route path="/AIAssistant" element={<LayoutWrapper currentPageName="AIAssistant"><AIAssistant /></LayoutWrapper>} />
      <Route path="/AdminNumberRouting" element={<Navigate to="/AdminPanel#number_routing" replace />} />
      <Route path="/AdminWebhookConfig" element={<Navigate to="/AdminPanel#webhooks" replace />} />
      <Route path="/Dialer" element={<RequireAuth><LayoutWrapper currentPageName="Dialer"><Dialer /></LayoutWrapper></RequireAuth>} />
      <Route path="/Contacts" element={<RequireAuth><LayoutWrapper currentPageName="Contacts"><Contacts /></LayoutWrapper></RequireAuth>} />
      <Route path="/Preferences" element={<RequireAuth><LayoutWrapper currentPageName="Preferences"><Preferences /></LayoutWrapper></RequireAuth>} />
      <Route path="/AdminIOSSettings" element={<Navigate to="/AdminPanel#ios_settings" replace />} />
      <Route path="/AdminAndroidSettings" element={<Navigate to="/AdminPanel#android_settings" replace />} />
      <Route path="/AdminCallLogs" element={<Navigate to="/AdminPanel#call_logs" replace />} />
      <Route path="/AdminPanel" element={<RequireAdmin><AdminPanel /></RequireAdmin>} />
      <Route path="/AdminMarketing" element={<Navigate to="/AdminPanel#marketing" replace />} />
      <Route path="/BuyCredits" element={<RequireAuth><LayoutWrapper currentPageName="BuyCredits"><BuyCredits /></LayoutWrapper></RequireAuth>} />
      <Route path="/SMSInbox" element={<RequireAuth><LayoutWrapper currentPageName="SMSInbox"><SMSInbox /></LayoutWrapper></RequireAuth>} />
      <Route path="/CallForwarding" element={<RequireAuth><LayoutWrapper currentPageName="CallForwarding"><CallForwarding /></LayoutWrapper></RequireAuth>} />

      {/* Redirect common native-app route names to correct paths */}
      <Route path="/Account" element={<RequireAuth><LayoutWrapper currentPageName="Preferences"><Preferences /></LayoutWrapper></RequireAuth>} />
      <Route path="/Numbers" element={<LayoutWrapper currentPageName="VirtualNumbers"><VirtualNumbers /></LayoutWrapper>} />
      <Route path="/Messages" element={<RequireAuth><LayoutWrapper currentPageName="SMSInbox"><SMSInbox /></LayoutWrapper></RequireAuth>} />
      <Route path="/eSIM" element={<RequireAuth><LayoutWrapper currentPageName="ESimDashboard"><ESimDashboard /></LayoutWrapper></RequireAuth>} />
      <Route path="/esim" element={<RequireAuth><LayoutWrapper currentPageName="ESimDashboard"><ESimDashboard /></LayoutWrapper></RequireAuth>} />
      <Route path="/Home" element={<LayoutWrapper currentPageName={mainPageKey}><MainPage /></LayoutWrapper>} />
      <Route path="/TermsAgreement" element={<TermsAgreement />} />
      <Route path="/downloads" element={<Navigate to="/Dashboard" replace />} />
      <Route path="/downloads/*" element={<Navigate to="/Dashboard" replace />} />
      <Route path="/Security" element={<LayoutWrapper currentPageName="Security"><Security /></LayoutWrapper>} />
      <Route path="/TransparencyReport" element={<LayoutWrapper currentPageName="TransparencyReport"><TransparencyReport /></LayoutWrapper>} />
      <Route path="/ServerStatus" element={<LayoutWrapper currentPageName="ServerStatus"><ServerStatus /></LayoutWrapper>} />
      <Route path="/Company" element={<LayoutWrapper currentPageName="Company"><Company /></LayoutWrapper>} />
      <Route path="/Careers" element={<LayoutWrapper currentPageName="Careers"><Careers /></LayoutWrapper>} />
      <Route path="/Press" element={<LayoutWrapper currentPageName="Press"><Press /></LayoutWrapper>} />
      <Route path="/Blog" element={<LayoutWrapper currentPageName="Blog"><Blog /></LayoutWrapper>} />
      <Route path="/GumroadStore" element={<LayoutWrapper currentPageName="GumroadStore"><GumroadStore /></LayoutWrapper>} />
      <Route path="/ReferralDashboard" element={<RequireAuth><LayoutWrapper currentPageName="ReferralDashboard"><ReferralDashboard /></LayoutWrapper></RequireAuth>} />
      <Route path="/LaunchCampaign" element={<LayoutWrapper currentPageName="LaunchCampaign"><LaunchCampaign /></LayoutWrapper>} />
      <Route path="/us-virtual-number" element={<USVirtualNumber />} />
      <Route path="/canada-virtual-number" element={<CanadaVirtualNumber />} />
      <Route path="/uk-virtual-number" element={<UKVirtualNumber />} />
      <Route path="/australia-virtual-number" element={<AustraliaVirtualNumber />} />
      <Route path="/sitemap" element={<SitemapXml />} />
      <Route path="/ClientOnboarding" element={<RequireAuth><LayoutWrapper currentPageName="ClientOnboarding"><ClientOnboarding /></LayoutWrapper></RequireAuth>} />
      <Route path="/ASOManager" element={<RequireAuth><LayoutWrapper currentPageName="ASOManager"><ASOManager /></LayoutWrapper></RequireAuth>} />
      <Route path="/support" element={<LayoutWrapper currentPageName="Support"><Support /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Allow public pages without login
      const publicPaths = ['/', '/Home', '/LegalPolicy', '/privacypolicy'];
      if (!publicPaths.includes(window.location.pathname)) {
        navigateToLogin();
        return null;
      }
    }
  }

  // Render the main app
  return <AnimatedRoutes />;
}

function App() {


  return (
    <AppErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <TwilioDeviceProvider>
            <Router>
              <AuthenticatedApp />
            </Router>
            <GlobalIncomingCallPopup />
          </TwilioDeviceProvider>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </AppErrorBoundary>
  )
}

export default App