import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight } from 'lucide-react';

const DEMO_URL = 'https://arkdata-audience-builder-demo.netlify.app';
const APP_URL = 'https://app.arkdata.io';

// Dedicated full-bleed Audience Builder demo page.
export default function Demo() {
  return (
    <div style={{ background: '#060D1A', color: '#fff' }}>
      {/* Slim intro band */}
      <section style={{ background: 'radial-gradient(900px 400px at 50% 0%, rgba(25,195,125,0.08) 0%, transparent 60%), #060D1A', padding: '56px 0 32px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>
            INTERACTIVE DEMO · NO SIGNUP REQUIRED
          </p>
          <h1 className="ark-display" style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '14px' }}>
            The Audience Builder. Live.
          </h1>
          <p style={{ color: '#A9C1DC', fontSize: '16px', lineHeight: 1.7, margin: '0 auto 18px', maxWidth: '560px' }}>
            Pick intent topics, stack filters, hit Generate — and watch the map, insights, and a 500-row
            sample assemble. Contact details are masked in the demo; in your account, they're yours.
          </p>
          <p className="ark-mono" style={{ color: '#5B7699', fontSize: '12px', margin: 0 }}>
            Best experienced on desktop · every filter is real · data refreshes daily in production
          </p>
        </div>
      </section>

      {/* Full-bleed demo */}
      <section style={{ padding: '0 0 64px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #1B3050', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
            <iframe
              src={DEMO_URL}
              title="ArkData Audience Builder — interactive demo"
              style={{ width: '100%', height: 'min(86vh, 900px)', border: 'none', display: 'block', background: '#081020' }}
            />
          </div>
        </div>
      </section>

      {/* Exit CTA */}
      <section style={{ background: '#040912', borderTop: '1px solid #101E33', padding: '72px 0' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <h2 className="ark-display" style={{ fontSize: 'clamp(26px, 3.2vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '14px' }}>
            Like what you built? Make it real.
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '16px', lineHeight: 1.7, marginBottom: '32px' }}>
            Create a free account and this exact audience — full contact records, daily refresh,
            one-click sync to Meta and your CRM — is minutes away.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={APP_URL} target="_blank" rel="noopener noreferrer">
              <button className="ark-btn-red" style={{ padding: '15px 32px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Start free <ArrowRight size={16} />
              </button>
            </a>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-blue" style={{ padding: '15px 32px', fontSize: '15px' }}>Book a walkthrough</button>
            </Link>
          </div>
          <p className="ark-mono" style={{ color: '#5B7699', fontSize: '12px', marginTop: '20px' }}>200 free matches/mo forever · 14-day Pro trial · no credit card</p>
        </div>
      </section>
    </div>
  );
}
