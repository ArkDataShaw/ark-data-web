import React from 'react';
import EnrichedVisitsCalculator from '../components/pricing/EnrichedVisitsCalculator';

export default function Pricing() {
  return (
    <div style={{ background: '#00000F', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #00000F 60%)', borderBottom: '1px solid rgba(20,60,110,0.4)', padding: '80px 0 56px' }}>
        <div className="sc" style={{ maxWidth: '760px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(177,0,26,0.12)', border: '1px solid rgba(177,0,26,0.3)', borderRadius: '100px', padding: '5px 14px', marginBottom: '20px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B1001A', display: 'inline-block' }} />
            <span style={{ color: '#ffb3be', fontSize: '12px', fontWeight: 600 }}>Usage-Based Pricing</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '18px' }}>
            Pricing That <span style={{ color: '#B1001A' }}>Scales</span> With You.
          </h1>
          <p style={{ color: '#D9ECFF', fontSize: '17px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '540px' }}>
            Estimate your monthly cost using Enriched Visits (a percentage of your website visits).
          </p>

          <div style={{ background: 'rgba(10,33,66,0.4)', border: '1px solid rgba(26,92,168,0.3)', borderRadius: '10px', padding: '20px 24px' }}>
            <p style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>How it works</p>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { num: '1.', text: 'Enter your monthly website visits.' },
                { num: '2.', text: 'Choose an enrichment rate (default 55%).' },
                { num: '3.', text: 'We calculate Enriched Visits = floor(visits × rate).' },
                { num: '4.', text: 'Pricing is stacked by tier; you only pay each tier rate for visits within that tier.' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#B1001A', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>{item.num}</span>
                  <span style={{ color: '#D9ECFF', fontSize: '13px', lineHeight: 1.6 }}>{item.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section style={{ padding: '56px 0 80px' }}>
        <div className="sc" style={{ maxWidth: '960px' }}>
          <EnrichedVisitsCalculator />
        </div>
      </section>
    </div>
  );
}