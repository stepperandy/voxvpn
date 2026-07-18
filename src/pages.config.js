/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AboutUs from './pages/AboutUs';
import ESimGuide from './pages/ESimGuide';
import PortingRequest from './pages/PortingRequest';
import ApplicationForm from './pages/ApplicationForm';
import Billing from './pages/Billing';
import BundleMarketplace from './pages/BundleMarketplace';
import Contact from './pages/Contact';
import Contacts from './pages/Contacts';
import Credits from './pages/Credits';
import Dashboard from './pages/Dashboard';
import DeleteAccount from './pages/DeleteAccount';
import DeviceCompatibility from './pages/DeviceCompatibility';
import ESimActivationGuide from './pages/ESimActivationGuide';
import ESimAvailability from './pages/ESimAvailability';
import ESimDashboard from './pages/ESimDashboard';
import ESimStore from './pages/ESimStore';
import Home from './pages/Home';
import Inbox from './pages/Inbox';
import KYCVerification from './pages/KYCVerification';
import LegalPolicy from './pages/LegalPolicy';
import LoyaltyProgram from './pages/LoyaltyProgram';
import MultiMessenger from './pages/MultiMessenger';
import MyESims from './pages/MyESims';
import NumberSearch from './pages/NumberSearch';
import NumberSettings from './pages/NumberSettings';
import PhoneNumberPorting from './pages/PhoneNumberPorting';
import Pricing from './pages/Pricing';
import ResellerDashboard from './pages/ResellerDashboard';
import Services from './pages/Services';
import ServicesDashboard from './pages/ServicesDashboard';
import Settings from './pages/Settings';
import SubscriptionManager from './pages/SubscriptionManager';
import SupportTickets from './pages/SupportTickets';
import Usage from './pages/Usage';
import UsageDashboard from './pages/UsageDashboard';
import UserTickets from './pages/UserTickets';
import VirtualNumbers from './pages/VirtualNumbers';
import WalletTransactions from './pages/WalletTransactions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutUs": AboutUs,
    "ESimGuide": ESimGuide,
    "PortingRequest": PortingRequest,
    "ApplicationForm": ApplicationForm,
    "Billing": Billing,
    "BundleMarketplace": BundleMarketplace,
    "Contact": Contact,
    "Contacts": Contacts,
    "Credits": Credits,
    "Dashboard": Dashboard,
    "DeleteAccount": DeleteAccount,
    "DeviceCompatibility": DeviceCompatibility,
    "ESimActivationGuide": ESimActivationGuide,
    "ESimAvailability": ESimAvailability,
    "ESimDashboard": ESimDashboard,
    "ESimStore": ESimStore,
    "Home": Home,
    "Inbox": Inbox,
    "KYCVerification": KYCVerification,
    "LegalPolicy": LegalPolicy,
    "LoyaltyProgram": LoyaltyProgram,
    "MultiMessenger": MultiMessenger,
    "MyESims": MyESims,
    "NumberSearch": NumberSearch,
    "NumberSettings": NumberSettings,
    "PhoneNumberPorting": PhoneNumberPorting,
    "Pricing": Pricing,
    "ResellerDashboard": ResellerDashboard,
    "Services": Services,
    "ServicesDashboard": ServicesDashboard,
    "Settings": Settings,
    "SubscriptionManager": SubscriptionManager,
    "SupportTickets": SupportTickets,
    "Usage": Usage,
    "UsageDashboard": UsageDashboard,
    "UserTickets": UserTickets,
    "VirtualNumbers": VirtualNumbers,
    "WalletTransactions": WalletTransactions,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};