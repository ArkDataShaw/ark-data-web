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
import About from './pages/About';
import Apply from './pages/Apply';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import BookADemo from './pages/BookADemo';
import CaseStudies from './pages/CaseStudies';
import Contact from './pages/Contact';
import Cookies from './pages/Cookies';
import FAQ from './pages/FAQ';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Integrations from './pages/Integrations';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Product from './pages/Product';
import Resources from './pages/Resources';
import Security from './pages/Security';
import Services from './pages/Services';
import Settings from './pages/Settings';
import Solutions from './pages/Solutions';
import Terms from './pages/Terms';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Apply": Apply,
    "Blog": Blog,
    "BlogPost": BlogPost,
    "BookADemo": BookADemo,
    "CaseStudies": CaseStudies,
    "Contact": Contact,
    "Cookies": Cookies,
    "FAQ": FAQ,
    "Home": Home,
    "HowItWorks": HowItWorks,
    "Integrations": Integrations,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "Product": Product,
    "Resources": Resources,
    "Security": Security,
    "Services": Services,
    "Settings": Settings,
    "Solutions": Solutions,
    "Terms": Terms,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};