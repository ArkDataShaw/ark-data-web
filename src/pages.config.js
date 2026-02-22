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
import Cookies from './pages/Cookies';
import Integrations from './pages/Integrations';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Apply from './pages/Apply';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Solutions from './pages/Solutions';
import Services from './pages/Services';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import CaseStudies from './pages/CaseStudies';
import Resources from './pages/Resources';
import Product from './pages/Product';
import Contact from './pages/Contact';
import Security from './pages/Security';
import BookADemo from './pages/BookADemo';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Cookies": Cookies,
    "Integrations": Integrations,
    "PrivacyPolicy": PrivacyPolicy,
    "Settings": Settings,
    "Terms": Terms,
    "Apply": Apply,
    "About": About,
    "FAQ": FAQ,
    "Solutions": Solutions,
    "Services": Services,
    "Home": Home,
    "HowItWorks": HowItWorks,
    "Pricing": Pricing,
    "CaseStudies": CaseStudies,
    "Resources": Resources,
    "Product": Product,
    "Contact": Contact,
    "Security": Security,
    "BookADemo": BookADemo,
}

export const pagesConfig = {
    mainPage: "Cookies",
    Pages: PAGES,
    Layout: __Layout,
};