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
import FloatingAssistant from '@/components/FloatingAssistant';
import { LanguageProvider } from '@/lib/LanguageContext';

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
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess.jsx'));
const ReviewDemo = lazy(() => import('./pages/ReviewDemo.jsx'));
const OsSetupGuide = lazy(() => import('./pages/OsSetupGuide.jsx'));
const VpnLogin = lazy(() => import('./pages/VpnLogin.jsx'));
const VpnSignup = lazy(() => import('./pages/VpnSignup.jsx'));
const AuthLogin = lazy(() => import('./pages/AuthLogin.jsx'));
const AuthSignup = lazy(() => import('./pages/AuthSignup.jsx'));
const VpnDashboard = lazy(() => import('./pages/VpnDashboard.jsx'));
const AppSplash = lazy(() => import('./pages/mobile-app/Splash.jsx'));
const AppLogin = lazy(() => import('./pages/mobile-app/Login.jsx'));
const AppServerList = lazy(() => import('./pages/mobile-app/ServerList.jsx'));

const AppSubscription = lazy(() => import('./pages/mobile-app/Subscription.jsx'));
const AppSettings = lazy(() => import('./pages/mobile-app/Settings.jsx'));
const VpnServers = lazy(() => import('./pages/VpnServers.jsx'));
const UserProfile = lazy(() => import('./pages/UserProfile.jsx'));
const MobileSetupGuide = lazy(() => import('./pages/MobileSetupGuide.jsx'));
const VoxVPNApp = lazy(() => import('./pages/VoxVPNApp.jsx'));
const ReferralPage = lazy(() => import('./pages/ReferralPage.jsx'));
const ReferralDashboard = lazy(() => import('./pages/ReferralDashboard.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const ServersPage = lazy(() => import('./pages/ServersPage.jsx'));
const DownloadPage = lazy(() => import('./pages/Download.jsx'));
const UserDashboard = lazy(() => import('./pages/UserDashboard.jsx'));
const RenewSubscription = lazy(() => import('./pages/RenewSubscription.jsx'));
const AccountSettings = lazy(() => import('./pages/AccountSettings.jsx'));
const AffiliatePage = lazy(() => import('./pages/AffiliatePage.jsx'));
const AffiliateRegister = lazy(() => import('./pages/AffiliateRegister.jsx'));
const AffiliateDashboard = lazy(() => import('./pages/AffiliateDashboard.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'));
const Press = lazy(() => import('./pages/Press.jsx'));
const Pricing = lazy(() => import('./pages/Pricing.jsx'));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed.jsx'));

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
  const { isLoadingAuth } = useAuth();

  // Brief loading while checking auth token
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#080c18]">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app — always accessible (public site)
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
          <Route path="/customer-dashboard" element={<PageTransition><CustomerDashboard /></PageTransition>} />
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
          <Route path="/payment-success" element={<PageTransition><PaymentSuccess /></PageTransition>} />
          <Route path="/payment-failed" element={<PageTransition><PaymentFailed /></PageTransition>} />
          <Route path="/review" element={<ReviewDemo />} />
          <Route path="/setup-guide" element={<PageTransition><OsSetupGuide /></PageTransition>} />
          <Route path="/vpn-login" element={<PageTransition><VpnLogin /></PageTransition>} />
          <Route path="/vpn-signup" element={<PageTransition><VpnSignup /></PageTransition>} />
          <Route path="/auth-login" element={<PageTransition><AuthLogin /></PageTransition>} />
          <Route path="/auth-signup" element={<PageTransition><AuthSignup /></PageTransition>} />
          <Route path="/vpn-dashboard" element={<PageTransition><VpnDashboard /></PageTransition>} />
          <Route path="/app" element={<AppSplash />} />
          <Route path="/app/login" element={<AppLogin />} />
          <Route path="/app/servers" element={<AppServerList />} />

          <Route path="/app/subscription" element={<AppSubscription />} />
          <Route path="/app/settings" element={<AppSettings />} />
          <Route path="/vpn-servers" element={<VpnServers />} />
          <Route path="/profile" element={<PageTransition><UserProfile /></PageTransition>} />
          <Route path="/mobile-setup" element={<PageTransition><MobileSetupGuide /></PageTransition>} />
          <Route path="/vpn-app" element={<VoxVPNApp />} />
          <Route path="/referral" element={<PageTransition><ReferralPage /></PageTransition>} />
          <Route path="/referral-dashboard" element={<PageTransition><ReferralDashboard /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/servers" element={<PageTransition><ServersPage /></PageTransition>} />
          <Route path="/download" element={<PageTransition><DownloadPage /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><UserDashboard /></PageTransition>} />
          <Route path="/renew" element={<PageTransition><RenewSubscription /></PageTransition>} />
          <Route path="/account-settings" element={<PageTransition><AccountSettings /></PageTransition>} />
          <Route path="/affiliate" element={<PageTransition><AffiliatePage /></PageTransition>} />
          <Route path="/affiliate-register" element={<PageTransition><AffiliateRegister /></PageTransition>} />
          <Route path="/affiliate-dashboard" element={<PageTransition><AffiliateDashboard /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
          <Route path="/press" element={<PageTransition><Press /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
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
    <LanguageProvider>
      <ThemeProvider>
        <TabProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
              <Router>
                <AuthenticatedAppWrapper isMobileDevice={isMobileDevice} />
                <FloatingAssistant />
              </Router>
              <Toaster />
            </QueryClientProvider>
          </AuthProvider>
        </TabProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}

function AuthenticatedAppWrapper({ isMobileDevice }) {
  return <AuthenticatedApp isMobileDevice={isMobileDevice} />
}

export default App