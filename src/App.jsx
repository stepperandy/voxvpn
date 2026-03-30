import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ThemeProvider from '@/lib/ThemeProvider';
import { TabProvider } from '@/mobile/MobileTabContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard.jsx'));
const VpnUSA = lazy(() => import('./pages/vpn-countries/VpnUSA.jsx'));
const VpnUK = lazy(() => import('./pages/vpn-countries/VpnUK.jsx'));
const VpnCanada = lazy(() => import('./pages/vpn-countries/VpnCanada.jsx'));
const VpnAustralia = lazy(() => import('./pages/vpn-countries/VpnAustralia.jsx'));
const VpnGermany = lazy(() => import('./pages/vpn-countries/VpnGermany.jsx'));
const VpnFrance = lazy(() => import('./pages/vpn-countries/VpnFrance.jsx'));
const VpnJapan = lazy(() => import('./pages/vpn-countries/VpnJapan.jsx'));
const WindowsVPN = lazy(() => import('./pages/vpn-os/WindowsVPN.jsx'));
const MacVPN = lazy(() => import('./pages/vpn-os/MacVPN.jsx'));
const LinuxVPN = lazy(() => import('./pages/vpn-os/LinuxVPN.jsx'));
const iOSVPN = lazy(() => import('./pages/vpn-os/iOSVPN.jsx'));
const AndroidVPN = lazy(() => import('./pages/vpn-os/AndroidVPN.jsx'));
const RouterVPN = lazy(() => import('./pages/vpn-os/RouterVPN.jsx'));
const ChromeExtension = lazy(() => import('./pages/vpn-os/ChromeExtension.jsx'));
const NoLogsPolicy = lazy(() => import('./pages/features/NoLogsPolicy.jsx'));
const KillSwitch = lazy(() => import('./pages/features/KillSwitch.jsx'));
const SplitTunneling = lazy(() => import('./pages/features/SplitTunneling.jsx'));
const AES256 = lazy(() => import('./pages/features/AES256.jsx'));
const DNSLeakProtection = lazy(() => import('./pages/features/DNSLeakProtection.jsx'));
const IPv6LeakProtection = lazy(() => import('./pages/features/IPv6LeakProtection.jsx'));
const VpnStreaming = lazy(() => import('./pages/solutions/VpnStreaming.jsx'));
const VpnGaming = lazy(() => import('./pages/solutions/VpnGaming.jsx'));
const VpnTorrenting = lazy(() => import('./pages/solutions/VpnTorrenting.jsx'));
const VpnBusiness = lazy(() => import('./pages/solutions/VpnBusiness.jsx'));
const VpnTravel = lazy(() => import('./pages/solutions/VpnTravel.jsx'));
const WhatIsVPN = lazy(() => import('./pages/about/WhatIsVPN.jsx'));
const HowVPNWorks = lazy(() => import('./pages/about/HowVPNWorks.jsx'));
const VPNProtocols = lazy(() => import('./pages/about/VPNProtocols.jsx'));
const WireGuardVPN = lazy(() => import('./pages/about/WireGuardVPN.jsx'));
const OpenVPN = lazy(() => import('./pages/about/OpenVPN.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy.jsx'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService.jsx'));
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy.jsx'));
const RefundPolicy = lazy(() => import('./pages/legal/RefundPolicy.jsx'));
const ContactUs = lazy(() => import('./pages/help/ContactUs.jsx'));
const StatusPage = lazy(() => import('./pages/help/StatusPage.jsx'));
const BugBounty = lazy(() => import('./pages/help/BugBounty.jsx'));
const SetupPortal = lazy(() => import('./pages/SetupPortal.jsx'));
const FeaturesMobile = lazy(() => import('./pages/FeaturesMobile.jsx'));
const PricingMobile = lazy(() => import('./pages/PricingMobile.jsx'));
const AccountMobile = lazy(() => import('./pages/AccountMobile.jsx'));
const DeleteAccount = lazy(() => import('./pages/DeleteAccount.jsx'));

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const AuthenticatedApp = ({ isMobileDevice }) => {
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
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route path="/" element={<PageTransition>{isMobileDevice ? <FeaturesMobile /> : <Home />}</PageTransition>} />
          <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><CustomerDashboard /></PageTransition>} />
          <Route path="/vpn-for-usa" element={<PageTransition><VpnUSA /></PageTransition>} />
          <Route path="/vpn-for-uk" element={<PageTransition><VpnUK /></PageTransition>} />
          <Route path="/vpn-for-canada" element={<PageTransition><VpnCanada /></PageTransition>} />
          <Route path="/vpn-for-australia" element={<PageTransition><VpnAustralia /></PageTransition>} />
          <Route path="/vpn-for-germany" element={<PageTransition><VpnGermany /></PageTransition>} />
          <Route path="/vpn-for-france" element={<PageTransition><VpnFrance /></PageTransition>} />
          <Route path="/vpn-for-japan" element={<PageTransition><VpnJapan /></PageTransition>} />
          <Route path="/windows-vpn" element={<PageTransition><WindowsVPN /></PageTransition>} />
          <Route path="/mac-vpn" element={<PageTransition><MacVPN /></PageTransition>} />
          <Route path="/linux-vpn" element={<PageTransition><LinuxVPN /></PageTransition>} />
          <Route path="/ios-vpn" element={<PageTransition><iOSVPN /></PageTransition>} />
          <Route path="/android-vpn" element={<PageTransition><AndroidVPN /></PageTransition>} />
          <Route path="/router-vpn" element={<PageTransition><RouterVPN /></PageTransition>} />
          <Route path="/chrome-extension" element={<PageTransition><ChromeExtension /></PageTransition>} />
          <Route path="/no-logs-policy" element={<PageTransition><NoLogsPolicy /></PageTransition>} />
          <Route path="/kill-switch" element={<PageTransition><KillSwitch /></PageTransition>} />
          <Route path="/split-tunneling" element={<PageTransition><SplitTunneling /></PageTransition>} />
          <Route path="/aes-256-encryption" element={<PageTransition><AES256 /></PageTransition>} />
          <Route path="/dns-leak-protection" element={<PageTransition><DNSLeakProtection /></PageTransition>} />
          <Route path="/ipv6-leak-protection" element={<PageTransition><IPv6LeakProtection /></PageTransition>} />
          <Route path="/vpn-for-streaming" element={<PageTransition><VpnStreaming /></PageTransition>} />
          <Route path="/vpn-for-gaming" element={<PageTransition><VpnGaming /></PageTransition>} />
          <Route path="/vpn-for-torrenting" element={<PageTransition><VpnTorrenting /></PageTransition>} />
          <Route path="/vpn-for-business" element={<PageTransition><VpnBusiness /></PageTransition>} />
          <Route path="/vpn-for-travel" element={<PageTransition><VpnTravel /></PageTransition>} />
          <Route path="/what-is-a-vpn" element={<PageTransition><WhatIsVPN /></PageTransition>} />
          <Route path="/how-vpn-works" element={<PageTransition><HowVPNWorks /></PageTransition>} />
          <Route path="/vpn-protocols" element={<PageTransition><VPNProtocols /></PageTransition>} />
          <Route path="/wireguard-vpn" element={<PageTransition><WireGuardVPN /></PageTransition>} />
          <Route path="/openvpn" element={<PageTransition><OpenVPN /></PageTransition>} />
          <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
          <Route path="/cookie-policy" element={<PageTransition><CookiePolicy /></PageTransition>} />
          <Route path="/refund-policy" element={<PageTransition><RefundPolicy /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactUs /></PageTransition>} />
          <Route path="/status" element={<PageTransition><StatusPage /></PageTransition>} />
          <Route path="/bug-bounty" element={<PageTransition><BugBounty /></PageTransition>} />
          <Route path="/setup" element={<PageTransition><SetupPortal /></PageTransition>} />
          <Route path="/features-mobile" element={<PageTransition><FeaturesMobile /></PageTransition>} />
          <Route path="/pricing-mobile" element={<PageTransition><PricingMobile /></PageTransition>} />
          <Route path="/account-mobile" element={<PageTransition><AccountMobile /></PageTransition>} />
          <Route path="/delete-account" element={<PageTransition><DeleteAccount /></PageTransition>} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};


function App() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobileDevice(isMobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <ThemeProvider>
      <TabProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedAppWrapper isMobileDevice={isMobileDevice} />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </TabProvider>
    </ThemeProvider>
  )
}

function AuthenticatedAppWrapper({ isMobileDevice }) {
  return <AuthenticatedApp isMobileDevice={isMobileDevice} />
}

export default App