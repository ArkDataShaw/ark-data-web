import React from 'react';
import EnrichedVisitsCalculator from '../components/pricing/EnrichedVisitsCalculator';

const S = { muted: '#D9ECFF' };

export default function Pricing() {
  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>

      {/* SECTION 1: Hero / Header */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 65%)', borderBottom: '1px solid #0A2142', padding: '80px 0 56px' }}>
        <div className="sc" style={{ maxWidth: '720px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Pricing</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.1 }}>
            Pricing That Scales With You.
          </h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '560px' }}>
            Estimate your monthly cost using Enriched Visits (a percentage of your website visits).
          </p>

          {/* How it works bullets */}
          <div style={{ background: 'rgba(10,33,66,0.4)', border: '1px solid #0A2142', borderRadius: '10px', padding: '20px 24px' }}>
            <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>How it works</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Enter your monthly website visits.',
                'Choose an enrichment rate (default 55%).',
                'We calculate Enriched Visits = floor(visits × rate).',
                'Pricing is stacked by tier; first 1,000 enriched visits are free.',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#22c55e', fontWeight: 900, fontSize: '13px', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: S.muted, fontSize: '13px', lineHeight: 1.55 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTIONS 2–4: Calculator */}
      <section style={{ padding: '56px 0 80px', background: '#000002' }}>
        <div className="sc" style={{ maxWidth: '900px' }}>
          <EnrichedVisitsCalculator />
        </div>
      </section>

    </div>
  );
}