import React from 'react';
import EnrichedVisitsCalculator from '../components/pricing/EnrichedVisitsCalculator';

const S = { muted: '#D9ECFF' };

export default function Pricing() {
  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>

      {/* SECTION 1: Hero / Header */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 65%)', borderBottom: '1px solid #0A2142', padding: '80px 0 56px', position: 'relative', overflow: 'hidden' }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: '-60px', right: '10%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(177,0,26,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '5%', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,92,168,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="sc" style={{ maxWidth: '720px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(177,0,26,0.12)', border: '1px solid rgba(177,0,26,0.35)', borderRadius: '100px', padding: '5px 14px', marginBottom: '20px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B1001A', display: 'inline-block' }} />
            <span style={{ color: '#ff8a99', fontSize: '12px', fontWeight: 600 }}>Usage-Based Pricing</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.1 }}>
            Pricing That <span style={{ color: '#B1001A' }}>Scales</span> With You.
          </h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '560px' }}>
            Estimate your monthly cost using Enriched Visits (a percentage of your website visits).
          </p>

          {/* How it works bullets */}
          <div style={{ background: 'rgba(10,33,66,0.5)', border: '1px solid rgba(26,92,168,0.3)', borderRadius: '12px', padding: '20px 24px' }}>
            <p style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>How it works</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { text: 'Enter your monthly website visits.', color: '#7eb8ff' },
                { text: 'Choose an enrichment rate (default 55%).', color: '#a78bfa' },
                { text: 'We calculate Enriched Visits = floor(visits × rate).', color: '#34d399' },
                { text: 'Pricing is stacked by tier; you only pay each tier rate for visits within that tier.', color: '#fbbf24' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: item.color, fontWeight: 900, fontSize: '13px', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: S.muted, fontSize: '13px', lineHeight: 1.55 }}>{item.text}</span>
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