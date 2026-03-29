import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import Admin from './pages/Admin.jsx';
import VpnUSA from './pages/vpn-countries/VpnUSA.jsx';
import VpnUK from './pages/vpn-countries/VpnUK.jsx';
import VpnCanada from './pages/vpn-countries/VpnCanada.jsx';
import VpnAustralia from './pages/vpn-countries/VpnAustralia.jsx';
import VpnGermany from './pages/vpn-countries/VpnGermany.jsx';
import VpnFrance from './pages/vpn-countries/VpnFrance.jsx';
import VpnJapan from './pages/vpn-countries/VpnJapan.jsx';
import WindowsVPN from './pages/vpn-os/WindowsVPN.jsx';
import MacVPN from './pages/vpn-os/MacVPN.jsx';
import LinuxVPN from './pages/vpn-os/LinuxVPN.jsx';
import iOSVPN from './pages/vpn-os/iOSVPN.jsx';
import AndroidVPN from './pages/vpn-os/AndroidVPN.jsx';
import RouterVPN from './pages/vpn-os/RouterVPN.jsx';
import ChromeExtension from './pages/vpn-os/ChromeExtension.jsx';
import NoLogsPolicy from './pages/features/NoLogsPolicy.jsx';
import KillSwitch from './pages/features/KillSwitch.jsx';
import SplitTunneling from './pages/features/SplitTunneling.jsx';
import AES256 from './pages/features/AES256.jsx';
import DNSLeakProtection from './pages/features/DNSLeakProtection.jsx';
import IPv6LeakProtection from './pages/features/IPv6LeakProtection.jsx';
import VpnStreaming from './pages/solutions/VpnStreaming.jsx';
import VpnGaming from './pages/solutions/VpnGaming.jsx';
import VpnTorrenting from './pages/solutions/VpnTorrenting.jsx';
import VpnBusiness from './pages/solutions/VpnBusiness.jsx';
import VpnTravel from './pages/solutions/VpnTravel.jsx';
import WhatIsVPN from './pages/about/WhatIsVPN.jsx';
import HowVPNWorks from './pages/about/HowVPNWorks.jsx';
import VPNProtocols from './pages/about/VPNProtocols.jsx';
import WireGuardVPN from './pages/about/WireGuardVPN.jsx';
import OpenVPN from './pages/about/OpenVPN.jsx';
import PrivacyPolicy from './pages/legal/PrivacyPolicy.jsx';
import TermsOfService from './pages/legal/TermsOfService.jsx';
import CookiePolicy from './pages/legal/CookiePolicy.jsx';
import RefundPolicy from './pages/legal/RefundPolicy.jsx';
import ContactUs from './pages/help/ContactUs.jsx';
import StatusPage from './pages/help/StatusPage.jsx';
import BugBounty from './pages/help/BugBounty.jsx';
import SetupPortal from './pages/SetupPortal.jsx';
import FeaturesMobile from './pages/FeaturesMobile.jsx';
import PricingMobile from './pages/PricingMobile.jsx';
import AccountMobile from './pages/AccountMobile.jsx';

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
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/vpn-for-usa" element={<VpnUSA />} />
      <Route path="/vpn-for-uk" element={<VpnUK />} />
      <Route path="/vpn-for-canada" element={<VpnCanada />} />
      <Route path="/vpn-for-australia" element={<VpnAustralia />} />
      <Route path="/vpn-for-germany" element={<VpnGermany />} />
      <Route path="/vpn-for-france" element={<VpnFrance />} />
      <Route path="/vpn-for-japan" element={<VpnJapan />} />
      <Route path="/windows-vpn" element={<WindowsVPN />} />
      <Route path="/mac-vpn" element={<MacVPN />} />
      <Route path="/linux-vpn" element={<LinuxVPN />} />
      <Route path="/ios-vpn" element={<iOSVPN />} />
      <Route path="/android-vpn" element={<AndroidVPN />} />
      <Route path="/router-vpn" element={<RouterVPN />} />
      <Route path="/chrome-extension" element={<ChromeExtension />} />
      <Route path="/no-logs-policy" element={<NoLogsPolicy />} />
      <Route path="/kill-switch" element={<KillSwitch />} />
      <Route path="/split-tunneling" element={<SplitTunneling />} />
      <Route path="/aes-256-encryption" element={<AES256 />} />
      <Route path="/dns-leak-protection" element={<DNSLeakProtection />} />
      <Route path="/ipv6-leak-protection" element={<IPv6LeakProtection />} />
      <Route path="/vpn-for-streaming" element={<VpnStreaming />} />
      <Route path="/vpn-for-gaming" element={<VpnGaming />} />
      <Route path="/vpn-for-torrenting" element={<VpnTorrenting />} />
      <Route path="/vpn-for-business" element={<VpnBusiness />} />
      <Route path="/vpn-for-travel" element={<VpnTravel />} />
      <Route path="/what-is-a-vpn" element={<WhatIsVPN />} />
      <Route path="/how-vpn-works" element={<HowVPNWorks />} />
      <Route path="/vpn-protocols" element={<VPNProtocols />} />
      <Route path="/wireguard-vpn" element={<WireGuardVPN />} />
      <Route path="/openvpn" element={<OpenVPN />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/status" element={<StatusPage />} />
      <Route path="/bug-bounty" element={<BugBounty />} />
      <Route path="/setup" element={<SetupPortal />} />
      <Route path="/features-mobile" element={<FeaturesMobile />} />
      <Route path="/pricing-mobile" element={<PricingMobile />} />
      <Route path="/account-mobile" element={<AccountMobile />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App