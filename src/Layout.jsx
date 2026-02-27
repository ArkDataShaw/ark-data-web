import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { createPageUrl } from './utils';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.idpixel.app/v1/idp-analytics-69a10b8d81c12e22bc59638e.min.js';
    script.defer = true;
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const navLinks = [
    { label: 'Platform', page: 'Product' },
    { label: 'Solutions', page: 'Solutions' },
    { label: 'Services', page: 'Services' },
    { label: 'Pricing', page: 'Pricing' },
    { label: 'Case Studies', page: 'CaseStudies' },
    { label: 'Resources', page: 'Resources' },
    { label: 'Blog', page: 'Blog' },
  ];

  return (
    <div style={{ background: '#00000F', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #00000F !important; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        a { text-decoration: none; color: inherit; }
        .ark-link:hover { color: #fff !important; }

        /* Buttons */
        .ark-btn-red {
          background: linear-gradient(135deg, #C8001E 0%, #8B0015 100%);
          color: #fff; border: none; border-radius: 6px; font-weight: 700;
          cursor: pointer; transition: all 0.25s; letter-spacing: 0.02em;
          box-shadow: 0 2px 12px rgba(177,0,26,0.35);
        }
        .ark-btn-red:hover {
          background: linear-gradient(135deg, #E8002A 0%, #A8001C 100%);
          box-shadow: 0 4px 20px rgba(177,0,26,0.55);
          transform: translateY(-1px);
        }
        .ark-btn-blue {
          background: rgba(10,33,66,0.5); color: #C8DFFF;
          border: 1px solid rgba(40,90,160,0.5); border-radius: 6px;
          font-weight: 600; cursor: pointer; transition: all 0.25s;
          backdrop-filter: blur(8px);
        }
        .ark-btn-blue:hover {
          border-color: rgba(80,140,220,0.7); color: #fff;
          background: rgba(20,55,110,0.6);
          box-shadow: 0 4px 16px rgba(30,80,180,0.2);
          transform: translateY(-1px);
        }
        .ark-btn-green {
          background: rgba(6,53,36,0.5); color: #C8FFE0;
          border: 1px solid rgba(20,100,60,0.5); border-radius: 6px;
          font-weight: 600; cursor: pointer; transition: all 0.25s;
          backdrop-filter: blur(8px);
        }
        .ark-btn-green:hover {
          border-color: rgba(30,140,80,0.7); color: #fff;
          background: rgba(10,80,45,0.6);
          box-shadow: 0 4px 16px rgba(10,100,50,0.2);
          transform: translateY(-1px);
        }

        /* Cards */
        .ark-card {
          background: linear-gradient(145deg, #071829 0%, #040E1A 100%);
          border: 1px solid rgba(20,60,110,0.6); border-radius: 12px;
          transition: all 0.25s;
        }
        .ark-card:hover {
          border-color: rgba(50,120,200,0.5);
          box-shadow: 0 8px 32px rgba(10,33,66,0.4);
          transform: translateY(-2px);
        }
        .ark-card-green {
          background: linear-gradient(145deg, #051A0F 0%, #030E08 100%);
          border: 1px solid rgba(15,70,40,0.6); border-radius: 12px;
          transition: all 0.25s;
        }
        .ark-card-green:hover {
          border-color: rgba(20,120,65,0.5);
          box-shadow: 0 8px 32px rgba(6,53,36,0.4);
          transform: translateY(-2px);
        }

        /* Inputs */
        .ark-input {
          background: rgba(6,18,42,0.8) !important;
          border: 1px solid rgba(20,60,110,0.6) !important;
          border-radius: 6px; color: #fff !important;
          padding: 12px 16px; font-size: 14px; width: 100%;
          outline: none; transition: all 0.2s;
          backdrop-filter: blur(8px);
        }
        .ark-input::placeholder { color: #4a6a9a !important; }
        .ark-input:focus {
          border-color: rgba(30,120,70,0.7) !important;
          box-shadow: 0 0 0 3px rgba(10,100,50,0.12) !important;
        }
        .ark-select {
          background: rgba(6,18,42,0.9);
          border: 1px solid rgba(20,60,110,0.6);
          border-radius: 6px; color: #fff;
          padding: 12px 16px; font-size: 14px; width: 100%;
          outline: none; appearance: none; cursor: pointer; transition: all 0.2s;
        }
        .ark-select:focus {
          border-color: rgba(30,120,70,0.7);
          box-shadow: 0 0 0 3px rgba(10,100,50,0.12);
        }
        .ark-select option { background: #071829; color: #fff; }
        .ark-textarea {
          background: rgba(6,18,42,0.8);
          border: 1px solid rgba(20,60,110,0.6);
          border-radius: 6px; color: #fff;
          padding: 12px 16px; font-size: 14px; width: 100%;
          outline: none; transition: all 0.2s; resize: vertical; font-family: inherit;
        }
        .ark-textarea::placeholder { color: #4a6a9a; }
        .ark-textarea:focus {
          border-color: rgba(30,120,70,0.7);
          box-shadow: 0 0 0 3px rgba(10,100,50,0.12);
        }

        /* Layout */
        .sc { max-width: 1300px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .sc { padding: 0 20px; } }
        .sp { padding: 96px 0; }
        @media (max-width: 768px) { .sp { padding: 56px 0; } }
        .d-none-mobile { display: flex; }
        .d-none-desktop { display: none; }
        @media (max-width: 1024px) {
          .d-none-mobile { display: none !important; }
          .d-none-desktop { display: flex !important; }
        }

        /* Animations */
        .ark-fade { animation: arkFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes arkFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* Typography upgrades */
        h1, h2, h3, h4, h5, h6 { letter-spacing: -0.02em; }
        
        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #00000F; }
        ::-webkit-scrollbar-thumb { background: #0A2142; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #1a4a8a; }

        details summary { list-style: none; }
        details summary::-webkit-details-marker { display: none; }

        /* Selection */
        ::selection { background: rgba(177,0,26,0.3); color: #fff; }
      `}</style>

      {/* Nav */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: isScrolled ? 'rgba(0,0,15,0.97)' : 'rgba(0,0,15,0.75)',
        borderBottom: `1px solid ${isScrolled ? 'rgba(20,60,110,0.6)' : 'transparent'}`,
        backdropFilter: 'blur(24px)', transition: 'all 0.3s',
        boxShadow: isScrolled ? '0 1px 40px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div className="sc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
          <Link to={createPageUrl('Home')} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989af7aa56af5f62af3065e/35cf97429_image.png" alt="Ark Data" style={{ height: '32px' }} />
            <span style={{ fontWeight: 800, fontSize: '17px', color: '#fff', letterSpacing: '-0.3px' }}>Ark Data</span>
          </Link>

          <nav className="d-none-mobile" style={{ alignItems: 'center', gap: '26px' }}>
            {navLinks.map(link => (
              <Link key={link.label} to={createPageUrl(link.page)} className="ark-link"
                style={{ color: '#D9ECFF', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to={createPageUrl('Contact')} className="d-none-mobile ark-link"
              style={{ color: '#D9ECFF', fontSize: '13px', fontWeight: 500 }}>Contact</Link>
            <a href="https://app.arkdata.io" target="_blank" rel="noopener noreferrer" className="d-none-mobile">
              <button style={{ padding: '9px 20px', fontSize: '14px', background: '#064e2a', color: '#fff', border: '1px solid rgba(34,197,94,0.45)', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Free Trial</button>
            </a>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '9px 20px', fontSize: '14px' }}>Book a Call</button>
            </Link>
            <button className="d-none-desktop" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', alignItems: 'center' }}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div style={{ background: 'rgba(5,14,28,0.98)', borderTop: '1px solid rgba(20,60,110,0.5)', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: '4px', backdropFilter: 'blur(24px)' }}>
            {navLinks.map(link => (
              <Link key={link.label} to={createPageUrl(link.page)} onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#D9ECFF', fontSize: '15px', fontWeight: 500, padding: '12px 0', borderBottom: '1px solid rgba(20,60,110,0.4)', display: 'block' }}>
                {link.label}
              </Link>
            ))}
            <a href="https://app.arkdata.io" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} style={{ marginTop: '12px', display: 'block' }}>
              <button style={{ width: '100%', padding: '14px', fontSize: '15px', background: '#064e2a', color: '#fff', border: '1px solid rgba(34,197,94,0.45)', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Start Free Trial</button>
            </a>
            <Link to={createPageUrl('BookADemo')} onClick={() => setMobileMenuOpen(false)} style={{ marginTop: '8px' }}>
              <button className="ark-btn-red" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>Book a Call</button>
            </Link>
          </div>
        )}
      </header>

      <main style={{ paddingTop: '70px' }}>{children}</main>

      {/* Footer */}
      <footer style={{ background: 'linear-gradient(180deg, #050F1E 0%, #020A12 100%)', borderTop: '1px solid rgba(20,60,110,0.4)' }}>
        <div className="sc" style={{ paddingTop: '64px', paddingBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '40px', marginBottom: '56px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#fff', marginBottom: '14px', letterSpacing: '-0.3px' }}>Ark Data</div>
              <p style={{ color: '#D9ECFF', fontSize: '13px', lineHeight: 1.75, maxWidth: '220px', marginBottom: '16px' }}>
                High-intent data enrichment for outbound, demand gen, RevOps, and growth.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ color: '#DFFFEF', fontSize: '13px', fontWeight: 600 }}>Noah</div>
                  <div style={{ color: '#D9ECFF', fontSize: '12px' }}>CEO</div>
                  <a href="mailto:noah@arkdata.io" style={{ color: '#DFFFEF', fontSize: '13px', textDecoration: 'underline' }}>noah@arkdata.io</a>
                </div>
                <div>
                  <div style={{ color: '#DFFFEF', fontSize: '13px', fontWeight: 600 }}>Shaw</div>
                  <div style={{ color: '#D9ECFF', fontSize: '12px' }}>CTO</div>
                  <a href="mailto:shaw@arkdata.io" style={{ color: '#DFFFEF', fontSize: '13px', textDecoration: 'underline' }}>shaw@arkdata.io</a>
                </div>
              </div>
            </div>

            {[
              { title: 'Platform', links: [['Platform', 'Product'], ['How It Works', 'HowItWorks'], ['Integrations', 'Integrations'], ['Security', 'Security']] },
              { title: 'Solutions', links: [['By Company Size', 'Solutions'], ['By Role', 'Solutions'], ['By Industry', 'Solutions'], ['Services', 'Services']] },
              { title: 'Company', links: [['About', 'About'], ['Case Studies', 'CaseStudies'], ['Blog', 'Blog'], ['Apply / Partner', 'Apply']] },
              { title: 'Legal', links: [['Privacy Policy', 'PrivacyPolicy'], ['Terms of Service', 'Terms'], ['Cookie Policy', 'Cookies'], ['Contact Us', 'Contact']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0 }}>
                  {col.links.map(([label, page]) => (
                    <li key={label}>
                      <Link to={createPageUrl(page)} className="ark-link" style={{ color: '#D9ECFF', fontSize: '13px', transition: 'color 0.2s' }}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div style={{ borderTop: '1px solid rgba(20,60,110,0.4)', paddingTop: '36px', marginBottom: '36px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Intelligence in your inbox</p>
              <p style={{ color: '#D9ECFF', fontSize: '13px' }}>Intent data insights, enrichment playbooks, RevOps strategies.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input className="ark-input" placeholder="your@email.com" style={{ minWidth: '220px', flex: 1 }} />
              <button className="ark-btn-red" style={{ padding: '12px 20px', fontSize: '13px', whiteSpace: 'nowrap' }}>Subscribe</button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(20,60,110,0.4)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: '#D9ECFF', fontSize: '12px' }}>© 2026 Ark Data. All rights reserved. Compliance-first data, built for operators.</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
                <a key={s} href="#" className="ark-link" style={{ color: '#D9ECFF', fontSize: '12px' }}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}