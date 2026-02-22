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
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #000002 !important; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        .ark-link:hover { color: #fff !important; }
        .ark-btn-red { background: #B1001A; color: #fff; border: none; border-radius: 4px; font-weight: 700; cursor: pointer; transition: background 0.2s; letter-spacing: 0.01em; }
        .ark-btn-red:hover { background: #E00025; }
        .ark-btn-blue { background: transparent; color: #D9ECFF; border: 1.5px solid #0A2142; border-radius: 4px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .ark-btn-blue:hover { border-color: #1a4a8a; color: #fff; background: rgba(10,33,66,0.4); }
        .ark-btn-green { background: transparent; color: #DFFFEF; border: 1.5px solid #063524; border-radius: 4px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .ark-btn-green:hover { border-color: #0a6640; color: #fff; background: rgba(6,53,36,0.4); }
        .ark-card { background: #06162A; border: 1px solid #0A2142; border-radius: 8px; }
        .ark-card:hover { border-color: #1a4a8a; }
        .ark-card-green { background: #042016; border: 1px solid #063524; border-radius: 8px; }
        .ark-card-green:hover { border-color: #0a6640; }
        .ark-input { background: #06162A !important; border: 1px solid #0A2142 !important; border-radius: 4px; color: #fff !important; padding: 12px 16px; font-size: 14px; width: 100%; outline: none; transition: border-color 0.2s; }
        .ark-input::placeholder { color: #4a6a9a !important; }
        .ark-input:focus { border-color: #063524 !important; }
        .ark-select { background: #06162A; border: 1px solid #0A2142; border-radius: 4px; color: #fff; padding: 12px 16px; font-size: 14px; width: 100%; outline: none; appearance: none; cursor: pointer; transition: border-color 0.2s; }
        .ark-select:focus { border-color: #063524; }
        .ark-select option { background: #06162A; color: #fff; }
        .ark-textarea { background: #06162A; border: 1px solid #0A2142; border-radius: 4px; color: #fff; padding: 12px 16px; font-size: 14px; width: 100%; outline: none; transition: border-color 0.2s; resize: vertical; font-family: inherit; }
        .ark-textarea::placeholder { color: #4a6a9a; }
        .ark-textarea:focus { border-color: #063524; }
        .sc { max-width: 1280px; margin: 0 auto; padding: 0 32px; }
        @media (max-width: 768px) { .sc { padding: 0 16px; } }
        .sp { padding: 80px 0; }
        @media (max-width: 768px) { .sp { padding: 48px 0; } }
        .d-none-mobile { display: flex; }
        .d-none-desktop { display: none; }
        @media (max-width: 1024px) {
          .d-none-mobile { display: none !important; }
          .d-none-desktop { display: flex !important; }
        }
        .ark-fade { animation: arkFadeUp 0.5s ease-out both; }
        @keyframes arkFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        details summary { list-style: none; }
        details summary::-webkit-details-marker { display: none; }
      `}</style>

      {/* Nav */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: isScrolled ? 'rgba(0,0,2,0.97)' : 'rgba(0,0,2,0.82)',
        borderBottom: `1px solid ${isScrolled ? '#0A2142' : 'transparent'}`,
        backdropFilter: 'blur(16px)', transition: 'all 0.3s',
      }}>
        <div className="sc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
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
          <div style={{ background: '#06162A', borderTop: '1px solid #0A2142', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map(link => (
              <Link key={link.label} to={createPageUrl(link.page)} onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#D9ECFF', fontSize: '15px', fontWeight: 500, padding: '12px 0', borderBottom: '1px solid #0A2142', display: 'block' }}>
                {link.label}
              </Link>
            ))}
            <Link to={createPageUrl('BookADemo')} onClick={() => setMobileMenuOpen(false)} style={{ marginTop: '12px' }}>
              <button className="ark-btn-red" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>Book a Call</button>
            </Link>
          </div>
        )}
      </header>

      <main style={{ paddingTop: '64px' }}>{children}</main>

      {/* Footer */}
      <footer style={{ background: '#06162A', borderTop: '1px solid #0A2142' }}>
        <div className="sc" style={{ paddingTop: '64px', paddingBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '32px', marginBottom: '48px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#fff', marginBottom: '14px', letterSpacing: '-0.3px' }}>Ark Data</div>
              <p style={{ color: '#D9ECFF', fontSize: '13px', lineHeight: 1.75, maxWidth: '220px', marginBottom: '16px' }}>
                High-intent data enrichment for outbound, demand gen, RevOps, and growth.
              </p>
              <a href="mailto:hello@arkdata.io" style={{ color: '#DFFFEF', fontSize: '13px' }}>hello@arkdata.io</a>
            </div>

            {[
              { title: 'Platform', links: [['Platform', 'Product'], ['How It Works', 'HowItWorks'], ['Integrations', 'Integrations'], ['Security', 'Security']] },
              { title: 'Solutions', links: [['By Company Size', 'Solutions'], ['By Role', 'Solutions'], ['By Industry', 'Solutions'], ['Services', 'Services']] },
              { title: 'Company', links: [['About', 'About'], ['Case Studies', 'CaseStudies'], ['Blog', 'Resources'], ['Apply / Partner', 'Apply']] },
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
          <div style={{ borderTop: '1px solid #0A2142', paddingTop: '32px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Intelligence in your inbox</p>
              <p style={{ color: '#D9ECFF', fontSize: '13px' }}>Intent data insights, enrichment playbooks, RevOps strategies.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input className="ark-input" placeholder="your@email.com" style={{ minWidth: '220px', flex: 1 }} />
              <button className="ark-btn-red" style={{ padding: '12px 20px', fontSize: '13px', whiteSpace: 'nowrap' }}>Subscribe</button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #0A2142', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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