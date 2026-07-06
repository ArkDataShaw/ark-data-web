import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

// "Intent Pulse" — industry insights derived from aggregate intent data,
// feeding a newsletter. Sandbox prototype: cards are illustrative; the signup
// form is non-functional.
const BRIEFS = [
  {
    industry: 'Home Services',
    date: 'Week of Jun 29',
    headline: 'Solar research surges 41% ahead of tax-credit deadline chatter',
    stat: '+41%',
    statLabel: 'solar tax credit topic, WoW',
    body: 'Homeowner research into solar tax credits jumped for the third straight week, concentrated in TX, FL, and AZ. Installers running credit-deadline creative are catching the wave early.',
  },
  {
    industry: 'B2B SaaS',
    date: 'Week of Jun 29',
    headline: '"HubSpot alternatives" hits a 6-month high among mid-market marketers',
    stat: '8.2K',
    statLabel: 'evaluators this week',
    body: 'Director-and-above marketers at 50–500 employee companies are comparison-shopping CRMs at unusual volume. Rip-and-replace season is early this year — attribution and CDP topics are moving with it.',
  },
  {
    industry: 'Finance',
    date: 'Week of Jun 29',
    headline: 'Refi intent climbs 18% as rate-watch topics heat up nationwide',
    stat: '52.9K',
    statLabel: 'refi researchers, 7 days',
    body: 'High-income households are back to comparing lenders. HELOC requirement research is up 27% alongside — a homeowner-liquidity story worth a dedicated campaign, not a generic rate ad.',
  },
];

export default function IntentPulse() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <section className="sp ark-light">
      <div className="sc">
        <div style={{ maxWidth: '640px', margin: '0 auto 48px', textAlign: 'center' }}>
          <p className="ark-mono" style={{ color: '#C8102E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>INTENT PULSE</p>
          <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '14px' }}>
            What 12,000 intent topics say about your industry this week.
          </h2>
          <p className="ark-body" style={{ fontSize: '16px', lineHeight: 1.7, margin: 0 }}>
            Every week we distill aggregate research behavior into short, actionable briefs — what's surging,
            where, and the campaign move it suggests.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {BRIEFS.map(b => (
            <article key={b.industry} className="ark-card-light" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                <span className="ark-mono" style={{ color: '#C8102E', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{b.industry}</span>
                <span className="ark-mono" style={{ color: '#8CA0B8', fontSize: '10px' }}>{b.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
                <span className="ark-display" style={{ fontSize: '34px', fontWeight: 900, letterSpacing: '-0.02em', color: '#0B1526' }}>{b.stat}</span>
                <span className="ark-mono" style={{ color: '#8CA0B8', fontSize: '10.5px', lineHeight: 1.3 }}>{b.statLabel}</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '16px', lineHeight: 1.4, marginBottom: '10px' }}>{b.headline}</h3>
              <p className="ark-body" style={{ fontSize: '13.5px', lineHeight: 1.65, margin: '0 0 16px', flex: 1 }}>{b.body}</p>
              <span style={{ color: '#C8102E', fontSize: '13px', fontWeight: 600 }}>Read the brief →</span>
            </article>
          ))}
        </div>

        {/* Newsletter capture */}
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', background: '#0B1526', borderRadius: '14px', padding: '36px 32px' }}>
          <h3 className="ark-display" style={{ color: '#fff', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Get Intent Pulse in your inbox.
          </h3>
          <p style={{ color: '#A9C1DC', fontSize: '14px', lineHeight: 1.6, marginBottom: '22px' }}>
            One email a week. The signals moving in your industry, and the play to run on them.
          </p>
          {done ? (
            <p className="ark-mono" style={{ color: '#19C37D', fontSize: '13px', margin: 0 }}>You're in. First Pulse lands this week.</p>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); if (email.includes('@')) setDone(true); }}
              style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{ flex: '1 1 240px', maxWidth: '300px', padding: '13px 16px', borderRadius: '8px', border: '1px solid #1B3050', background: '#081020', color: '#fff', fontSize: '14px', outline: 'none' }}
              />
              <button type="submit" className="ark-btn-red" style={{ padding: '13px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Subscribe <ArrowRight size={14} />
              </button>
            </form>
          )}
          <p className="ark-mono" style={{ color: '#5B7699', fontSize: '11px', marginTop: '14px', marginBottom: 0 }}>Free forever · unsubscribe anytime</p>
        </div>
      </div>
    </section>
  );
}
