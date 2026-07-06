import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, CheckCircle } from 'lucide-react';

const rungs = [
  {
    num: '01',
    name: 'Referral Partner',
    desc: 'Send clients our way, earn recurring commission on every account. No integration work, no support burden.',
    points: ['Recurring revenue share', 'Co-branded onboarding for your referrals', 'No volume commitment'],
  },
  {
    num: '02',
    name: 'Reseller',
    desc: 'Sell ArkData under your own line items. You own the client relationship and the invoice; we power the data.',
    points: ['Wholesale pricing, you set the markup', 'Client accounts under your agency workspace', 'Priority partner support'],
  },
  {
    num: '03',
    name: 'White-Label',
    desc: 'The full platform under your brand — your domain, your logo, your product. Clients never see ArkData.',
    points: ['Custom domain + full brand takeover', 'One dashboard for every client pixel', 'Deeper wholesale discounts at volume'],
  },
  {
    num: '04',
    name: 'Platform Partner',
    desc: 'For agencies operating at scale: custom economics, roadmap input, and co-built capabilities for your vertical.',
    points: ['Best-available wholesale economics', 'Dedicated partner manager', 'Early access to new platform features'],
  },
];

const useCases = [
  { title: 'Prove ROI with names, not charts', desc: 'Stop defending retainers with bounce rates. Show clients the actual people your campaigns brought in — name, title, company — and which ones converted.' },
  { title: 'A new recurring revenue line', desc: 'Visitor identity is a product every client needs and almost none of them buy directly. Package it into your retainer at your own margin.' },
  { title: 'Better retargeting for every client', desc: 'Build intent audiences from 12,000+ topics and sync them to client ad accounts on Meta, Google, and DV360 — without CSV uploads.' },
];

export default function Agencies() {
  return (
    <div style={{ background: '#060D1A', color: '#fff' }}>
      {/* HERO */}
      <section style={{ background: 'radial-gradient(1000px 500px at 50% 0%, rgba(25,195,125,0.08) 0%, transparent 60%), #060D1A', padding: '96px 0 72px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '16px' }}>ARKDATA FOR AGENCIES</p>
          <h1 className="ark-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.06, marginBottom: '20px' }}>
            Sell identity resolution.<br />Under <span style={{ color: '#C8102E' }}>your</span> brand.
          </h1>
          <p style={{ color: '#A9C1DC', fontSize: '17px', lineHeight: 1.7, margin: '0 auto 36px', maxWidth: '540px' }}>
            White-label the full ArkData platform — visitor identification, intent audiences, and ad sync — and deliver it to every client as your own product, at your own margin.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('Apply')}>
              <button className="ark-btn-red" style={{ padding: '15px 32px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Apply to partner <ArrowRight size={16} />
              </button>
            </Link>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-blue" style={{ padding: '15px 32px', fontSize: '15px' }}>Talk to us first</button>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY — light */}
      <section className="sp ark-light">
        <div className="sc">
          <div style={{ maxWidth: '560px', marginBottom: '48px' }}>
            <p className="ark-mono" style={{ color: '#C8102E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>WHY AGENCIES USE ARKDATA</p>
            <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              The retainer-defender.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {useCases.map(u => (
              <div key={u.title} className="ark-card-light" style={{ padding: '30px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '17px', marginBottom: '10px' }}>{u.title}</h3>
                <p className="ark-body" style={{ fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNER LADDER — dark */}
      <section className="sp" style={{ background: '#040912' }}>
        <div className="sc">
          <div style={{ maxWidth: '560px', marginBottom: '56px' }}>
            <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>THE PARTNER LADDER</p>
            <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Four rungs. Start anywhere.
            </h2>
            <p style={{ color: '#A9C1DC', fontSize: '16px', lineHeight: 1.7, margin: 0 }}>
              Economics improve at every rung. Most agencies start as resellers and move to white-label within a quarter.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {rungs.map(r => (
              <div key={r.num} className="ark-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
                <span className="ark-mono" style={{ color: '#C8102E', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>{r.num}</span>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '18px', marginBottom: '10px' }}>{r.name}</h3>
                <p style={{ color: '#A9C1DC', fontSize: '14px', lineHeight: 1.65, marginBottom: '18px' }}>{r.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {r.points.map(p => (
                    <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                      <CheckCircle size={14} style={{ color: '#19C37D', flexShrink: 0, marginTop: '2px' }} />
                      <span className="ark-mono" style={{ color: '#8FA9C7', fontSize: '12px' }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'radial-gradient(800px 400px at 50% 0%, rgba(200,16,46,0.12) 0%, transparent 60%), #060D1A', padding: '96px 0' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '620px' }}>
          <h2 className="ark-display" style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '18px' }}>
            Add identity resolution to your stack this week.
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '16px', lineHeight: 1.7, margin: '0 auto 36px', maxWidth: '460px' }}>
            Apply in five minutes. Our partnerships team responds within two business days.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('Apply')}>
              <button className="ark-btn-red" style={{ padding: '16px 36px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>Apply to partner <ArrowRight size={16} /></button>
            </Link>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-blue" style={{ padding: '16px 36px', fontSize: '16px' }}>Book a demo</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
