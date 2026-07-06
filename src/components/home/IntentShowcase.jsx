import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ArrowRight, TrendingUp } from 'lucide-react';

const INTENT = '#19C37D';

// Baked demo data styled as a live signal feed. In production this would be
// fed by a daily aggregate of real (non-PII) topic counts.
const USE_CASES = [
  {
    id: 'solar',
    label: 'Solar & Home Services',
    audience: 'Homeowners researching solar',
    sentence: ['38,412', 'homeowners', 'in TX, FL & AZ', 'searched for', 'solar installation cost', 'this week'],
    topics: [
      { t: 'Solar Installation Cost', n: '38.4K', d: '+23%' },
      { t: 'Solar Tax Credit 2026', n: '21.7K', d: '+41%' },
      { t: 'Home Battery Backup', n: '14.2K', d: '+9%' },
      { t: 'Roof Replacement Quotes', n: '11.8K', d: '+12%' },
    ],
    play: 'Sync to Meta as a custom audience and hit in-market homeowners at a fraction of lead-gen CPLs.',
    spark: [3, 4, 3, 5, 6, 5, 7, 8, 7, 9, 11, 12],
  },
  {
    id: 'mortgage',
    label: 'Mortgage & Finance',
    audience: 'Buyers comparing lenders',
    sentence: ['52,908', 'people with $100K+ income', 'nationwide', 'searched for', 'refinance rates', 'in the last 7 days'],
    topics: [
      { t: 'Mortgage Refinance Rates', n: '52.9K', d: '+18%' },
      { t: 'HELOC Requirements', n: '19.3K', d: '+27%' },
      { t: 'First-Time Buyer Programs', n: '24.6K', d: '+6%' },
      { t: 'Debt Consolidation Loans', n: '17.1K', d: '+15%' },
    ],
    play: 'Route high-income refi researchers straight to loan officers via CRM — before they fill out a competitor form.',
    spark: [5, 6, 8, 7, 9, 8, 10, 9, 11, 12, 11, 13],
  },
  {
    id: 'medspa',
    label: 'Med Spas & Aesthetics',
    audience: 'Local aesthetics researchers',
    sentence: ['9,240', 'women 30–55', 'within 25 miles of Dallas', 'searched for', 'CoolSculpting near me', 'this week'],
    topics: [
      { t: 'CoolSculpting Near Me', n: '9.2K', d: '+31%' },
      { t: 'Botox Pricing', n: '12.6K', d: '+14%' },
      { t: 'Laser Hair Removal Deals', n: '8.7K', d: '+22%' },
      { t: 'Morpheus8 Reviews', n: '5.1K', d: '+48%' },
    ],
    play: 'Geo-fenced intent audiences make local ad spend surgical — only people actively researching treatments.',
    spark: [2, 3, 2, 4, 3, 5, 6, 5, 7, 8, 10, 11],
  },
  {
    id: 'b2bsaas',
    label: 'B2B SaaS',
    audience: 'In-market software evaluators',
    sentence: ['6,318', 'VPs & Directors of Marketing', 'at US companies 50–500 employees', 'researched', 'marketing attribution software', 'in the last 14 days'],
    topics: [
      { t: 'Marketing Attribution Software', n: '6.3K', d: '+19%' },
      { t: 'CDP Comparison', n: '4.9K', d: '+11%' },
      { t: 'HubSpot Alternatives', n: '8.2K', d: '+26%' },
      { t: 'Intent Data Providers', n: '3.4K', d: '+35%' },
    ],
    play: 'Feed evaluators to outbound sequences while the shortlist is still open — not after the demo is booked elsewhere.',
    spark: [4, 4, 5, 6, 5, 7, 6, 8, 9, 8, 10, 12],
  },
  {
    id: 'auto',
    label: 'Auto Dealers',
    audience: 'Active vehicle shoppers',
    sentence: ['27,554', 'people', 'in the Atlanta metro', 'searched for', 'used truck financing', 'this week'],
    topics: [
      { t: 'Used Truck Financing', n: '27.5K', d: '+16%' },
      { t: 'Trade-In Value Estimator', n: '18.9K', d: '+8%' },
      { t: 'EV Lease Deals', n: '13.3K', d: '+29%' },
      { t: 'Certified Pre-Owned SUVs', n: '15.7K', d: '+12%' },
    ],
    play: 'Conquest audiences of shoppers researching the exact segment on your lot — synced to Meta and Google nightly.',
    spark: [6, 5, 7, 6, 8, 9, 8, 10, 9, 11, 10, 12],
  },
];

function Sparkline({ data, width = 120, height = 32 }) {
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * (height - 4) - 2}`).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={INTENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}

export default function IntentShowcase() {
  const [active, setActive] = useState(USE_CASES[0]);

  return (
    <section className="sp" style={{ background: '#040912', borderTop: '1px solid #101E33' }}>
      <div className="sc">
        <div style={{ maxWidth: '680px', margin: '0 auto 44px', textAlign: 'center' }}>
          <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: INTENT, marginRight: 8, animation: 'arkPulse 2s ease-in-out infinite' }} />
            LIVE SIGNAL FEED · REFRESHED DAILY
          </p>
          <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: '14px' }}>
            Whatever you sell, someone is researching it right now.
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '16px', lineHeight: 1.7, margin: 0 }}>
            A sample of what ArkData is tracking across 12,000+ intent topics this week — and what you'd do with it.
          </p>
        </div>

        {/* Industry tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '28px' }}>
          {USE_CASES.map(uc => (
            <button
              key={uc.id}
              onClick={() => setActive(uc)}
              className="ark-mono"
              style={{
                padding: '9px 18px', borderRadius: '100px', fontSize: '12px', cursor: 'pointer',
                border: `1px solid ${active.id === uc.id ? INTENT : '#1B3050'}`,
                background: active.id === uc.id ? 'rgba(25,195,125,0.10)' : 'transparent',
                color: active.id === uc.id ? '#6FE3B0' : '#7E97B5',
                transition: 'all 0.2s',
              }}
            >
              {uc.label}
            </button>
          ))}
        </div>

        {/* Active use case panel */}
        <div style={{ maxWidth: '960px', margin: '0 auto', background: '#081020', border: '1px solid #14263F', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Audience sentence bar */}
          <div style={{ padding: '22px 26px', borderBottom: '1px solid #14263F', background: 'rgba(25,195,125,0.03)' }}>
            <p className="ark-mono" style={{ color: '#5B7699', fontSize: '10px', letterSpacing: '0.12em', margin: '0 0 10px' }}>AUDIENCE PREVIEW</p>
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.6, margin: 0, color: '#C9DBEE' }}>
              <strong style={{ color: '#fff' }}>{active.sentence[0]}</strong>{' '}
              <span style={{ color: INTENT, fontWeight: 600 }}>{active.sentence[1]}</span>{' '}
              {active.sentence[2]}{' '}{active.sentence[3]}{' '}
              <span style={{ background: 'rgba(25,195,125,0.12)', border: '1px solid rgba(25,195,125,0.3)', borderRadius: '6px', padding: '1px 8px', color: '#6FE3B0', fontWeight: 600 }}>
                {active.sentence[4]}
              </span>{' '}
              {active.sentence[5]}
            </p>
          </div>

          {/* Topic rows */}
          <div style={{ padding: '10px 0' }}>
            {active.topics.map(row => (
              <div key={row.t} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '13px 26px', borderBottom: '1px solid rgba(20,38,63,0.5)' }}>
                <span style={{ color: '#C9DBEE', fontSize: '14px', fontWeight: 600, flex: 1, minWidth: 0 }}>{row.t}</span>
                <Sparkline data={active.spark} />
                <span className="ark-mono" style={{ color: '#fff', fontSize: '14px', fontWeight: 600, width: '56px', textAlign: 'right' }}>{row.n}</span>
                <span className="ark-mono" style={{ color: INTENT, fontSize: '12px', width: '52px', textAlign: 'right', display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                  <TrendingUp size={11} /> {row.d}
                </span>
              </div>
            ))}
          </div>

          {/* The play + CTA */}
          <div style={{ padding: '20px 26px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', background: 'rgba(8,16,32,0.6)' }}>
            <p style={{ color: '#A9C1DC', fontSize: '13.5px', lineHeight: 1.6, margin: 0, flex: 1, minWidth: '260px' }}>
              <span className="ark-mono" style={{ color: '#6FE3B0', fontSize: '10px', letterSpacing: '0.12em', display: 'block', marginBottom: '4px' }}>THE PLAY</span>
              {active.play}
            </p>
            <Link to={createPageUrl('Demo')}>
              <button className="ark-btn-green" style={{ padding: '12px 22px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                Build this audience <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>

        <p className="ark-mono" style={{ color: '#3D5573', fontSize: '10px', textAlign: 'center', margin: '18px 0 0' }}>
          Illustrative sample of weekly topic volume. Live counts available in your account.
        </p>
      </div>
    </section>
  );
}
