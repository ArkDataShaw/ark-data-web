import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { createPageUrl } from './utils';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Product', href: createPageUrl('Product') },
    { label: 'How It Works', href: createPageUrl('HowItWorks') },
    { label: 'Integrations', href: createPageUrl('Integrations') },
    { label: 'Pricing', href: createPageUrl('Pricing') },
    { label: 'Case Studies', href: createPageUrl('CaseStudies') },
    { label: 'Resources', href: createPageUrl('Resources') },
  ];

  const footerColumns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: createPageUrl('Product') },
        { label: 'Pricing', href: createPageUrl('Pricing') },
        { label: 'Integrations', href: createPageUrl('Integrations') },
        { label: 'Security', href: createPageUrl('Security') },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', href: createPageUrl('Resources') },
        { label: 'How It Works', href: createPageUrl('HowItWorks') },
        { label: 'Case Studies', href: createPageUrl('CaseStudies') },
        { label: 'Contact', href: createPageUrl('Contact') },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: createPageUrl('PrivacyPolicy') },
        { label: 'Terms of Service', href: createPageUrl('Terms') },
        { label: 'Cookie Policy', href: createPageUrl('Cookies') },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Contact Us', href: createPageUrl('Contact') },
        { label: 'Email: hello@arkdata.io', href: 'mailto:hello@arkdata.io' },
        { label: 'Status Page', href: '#' },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <style>{`
        :root {
          --color-primary: #0066FF;
          --color-primary-dark: #0052CC;
          --color-secondary: #7C3AED;
          --color-neutral-50: #F9FAFB;
          --color-neutral-100: #F3F4F6;
          --color-neutral-200: #E5E7EB;
          --color-neutral-900: #111827;
        }

        .dark {
          --color-neutral-50: #111827;
          --color-neutral-100: #1F2937;
          --color-neutral-200: #374151;
          --color-neutral-900: #F9FAFB;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .button-primary {
          background-color: var(--color-primary);
          color: white;
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .button-primary:hover {
          background-color: var(--color-primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0, 102, 255, 0.2);
        }

        .button-secondary {
          border: 1.5px solid var(--color-neutral-200);
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .button-secondary:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white dark:bg-black shadow-lg' : 'bg-white/95 dark:bg-black/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 flex-shrink-0">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989af7aa56af5f62af3065e/35cf97429_image.png" alt="Ark Data" className="h-10 w-auto" />
              <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:inline">Ark Data</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Right CTAs */}
            <div className="hidden sm:flex items-center gap-3">
              <button className="button-secondary text-sm">
                <Link to="/login">Login</Link>
              </button>
              <button className="button-primary text-sm">
                <Link to={createPageUrl('BookADemo')} className="text-white">Book a Demo</Link>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="button-secondary text-sm block text-center"
                >
                  Login
                </Link>
                <Link
                  to={createPageUrl('BookADemo')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="button-primary text-sm block text-center"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-grow pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="font-semibold text-white mb-4">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 dark:border-gray-900 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2026 Ark Data. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}