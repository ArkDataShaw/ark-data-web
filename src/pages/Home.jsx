import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, CheckCircle } from 'lucide-react';
import ResolutionCard from '../components/home/ResolutionCard';

const APP_URL = 'https://app.arkdata.io';

const heroStats = [
  ['650+', 'data points per person'],
  ['12,000+', 'intent topics'],
  ['B2B + B2C', 'full coverage'],
  ['30–40%', 'less than RB2B'],
];

const integrations = [
  'Meta Ads', 'Google Ads', 'DV360', 'HubSpot', 'Slack', 'Klaviyo', 'HighLevel', 'Salesforce*', 'Shopify*',
];

const steps = [
  { num: '01', title: 'Install the pixel', desc: 'One lightweight script. No SDK, no engineering project. Most teams are live in under 15 minutes.', time: '15 min' },
  { num: '02', title: 'Resolve identities', desc: 'Anonymous sessions become identified people — name, email, phone, and 650+ data points per resolved visitor.', time: 'Real-time' },
  { num: '03', title: 'Build audiences', desc: 'Layer 12,000+ intent topics across B2B and B2C to build audiences of people actively in-market — on your site or off it.', time: 'Minutes' },
  { num: '04', title: 'Activate everywhere', desc: 'Push audiences to Meta, Google Ads, and DV360 as custom audiences. Sync people to HubSpot, Slack, Klaviyo, or HighLevel.', time: 'Always on' },
];

const platform = [
  {
    title: 'Identity Pixel',
    desc: 'Resolve anonymous website visitors into identified people with full contact data — not just company names. Person-level, in real time.',
    bullets: ['Name, email, phone per match', '650+ data points appended', 'Works for B2B and B2C traffic'],
  },
  {
    title: 'Audience Builder',
    desc: 'Build intent-based audiences from 12,000+ topics. Find people researching your category this week — whether or not they have visited your site.',
    bullets: ['12,000+ B2B + B2C intent topics', 'Combine intent, demographic, and firmographic filters', 'Refreshed continuously'],
  },
  {
    title: 'Ad Platform Sync',
    desc: 'Push any audience straight to your ad accounts as a custom audience. Stop uploading CSVs and burning budget on lookalikes of nobody.',
    bullets: ['Native Meta Custom Audience sync — live today', 'Google Ads + DV360', 'Audiences stay in sync automatically'],
  },
  {
    title: 'Attribution',
    desc: 'SalesMatch ties campaigns to resolved visitors and closed revenue, so you can see which channels actually produce buyers — full-funnel.',
    bullets: ['Campaign → visitor → revenue', 'Works across ad platforms', 'No more last-click guessing'],
  },
];

const rb2bPoints = [
  { title: '30–40% less at every tier', desc: 'At every published RB2B tier, ArkData costs 30–40% less for the same volume. Run the numbers in our calculator — the formula is public.' },
  { title: 'B2C, not just B2B', desc: 'RB2B stops at business traffic. ArkData resolves consumer visitors too — with demographic and household data — so DTC and local businesses get the same superpower.' },
  { title: 'Audiences + ad sync built in', desc: 'ArkData is not just a pixel. Build intent audiences and push them to Meta, Google, and DV360 without leaving the platform.' },
];

const faqs = [
  { q: 'What does ArkData actually do?', a: 'You install a lightweight pixel on your website. ArkData resolves anonymous visitors into identified people — name, email, phone, and 650+ data points — and delivers them to your CRM, Slack, email tools, or ad platforms in real time. On top of that, the Audience Builder lets you build intent-based audiences from 12,000+ topics and sync them to Meta, Google Ads, and DV360.' },
  { q: 'How is this different from RB2B or Leadfeeder?', a: 'Three ways: ArkData resolves both B2B and B2C visitors (not just business traffic), it includes audience building and native ad platform sync (not just a pixel feed), and it costs 30–40% less than RB2B at every published tier.' },
  { q: 'What data comes with each resolved visitor?', a: 'Up to 650+ data points per person: identity and contact info (name, email, phone), professional data (title, seniority, company, industry, headcount), demographics, household attributes, and active intent topics.' },
  { q: 'Is there a free plan?', a: 'Yes. Every account gets 200 free identity matches per month, forever — no credit card required. New accounts also get a 14-day free trial of the full Pro experience.' },
  { q: 'What platforms do you integrate with?', a: 'Meta Ads, Google Ads, and DV360 for audience sync. HubSpot, Slack, Klaviyo, and HighLevel for delivery. Salesforce and Shopify are on the near-term roadmap, and anything else connects via webhook.' },
  { q: 'How do you handle privacy and compliance?', a: 'ArkData is built with privacy in mind. Our identity graph is sourced exclusively from licensed data providers with opt-out compliance, and our data handling is designed to support CCPA and major privacy frameworks.' },
];

export default function Home() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div style={{ background: '#060D1A', color: '#fff' }}>
      <style>{`
        .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center; }
        @media (max-width: 960px) { .hero-grid { grid-template-columns: 1fr; gap: 40px; } .hero-card-wrap { justify-content: center !important; } }
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #14263F; border: 1px solid #14263F; border-radius: 10px; overflow: hidden; }
        @media (max-width: 720px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(1200px 600px at 75% 20%, rgba(20,60,110,0.22) 0%, transparent 60%), #060D1A' }}>
        <div className="sc" style={{ paddingTop: '96px', paddingBottom: '72px', position: 'relative', zIndex: 2 }}>
          <div className="hero-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(25,195,125,0.3)', borderRadius: '100px', padding: '6px 14px', marginBottom: '28px', background: 'rgba(25,195,125,0.05)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#19C37D', display: 'inline-block' }} />
                <span className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', letterSpacing: '0.08em' }}>VISITOR IDENTITY + INTENT DATA</span>
              </div>
              <h1 className="ark-display" style={{ fontSize: 'clamp(40px, 5.5vw, 68px)', fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.03em', margin: '0 0 22px', color: '#fff' }}>
                Your traffic<br />has <span style={{ color: '#C8102E' }}>names.</span>
              </h1>
              <p style={{ color: '#A9C1DC', fontSize: 'clamp(15px, 1.6vw, 18px)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: '480px' }}>
                ArkData resolves anonymous website visitors into real people — name, email, phone, and 650+ data points — then pushes them to your CRM and ad platforms automatically.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <a href={APP_URL} target="_blank" rel="noopener noreferrer">
                  <button className="ark-btn-red" style={{ padding: '15px 30px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Start free <ArrowRight size={16} />
                  </button>
                </a>
                <Link to={createPageUrl('BookADemo')}>
                  <button className="ark-btn-blue" style={{ padding: '15px 30px', fontSize: '15px' }}>Book a demo</button>
                </Link>
              </div>
              <p className="ark-mono" style={{ color: '#5B7699', fontSize: '12px' }}>
                200 free matches every month, forever · 14-day Pro trial · no credit card
              </p>
            </div>
            <div className="hero-card-wrap" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ResolutionCard />
            </div>
          </div>

          {/* stats */}
          <div className="stat-grid" style={{ marginTop: '72px' }}>
            {heroStats.map(([n, l]) => (
              <div key={l} style={{ background: '#081020', padding: '22px 24px' }}>
                <p className="ark-mono" style={{ color: '#fff', fontWeight: 600, fontSize: '22px', margin: '0 0 4px' }}>{n}</p>
                <p className="ark-mono" style={{ color: '#5B7699', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATION STRIP */}
      <section style={{ background: '#040912', borderTop: '1px solid #101E33', borderBottom: '1px solid #101E33', padding: '26px 0' }}>
        <div className="sc" style={{ display: 'flex', gap: '14px 36px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline' }}>
          <span className="ark-mono" style={{ color: '#3D5573', fontSize: '11px', letterSpacing: '0.12em' }}>SYNCS WITH</span>
          {integrations.map(name => (
            <span key={name} className="ark-display" style={{ color: '#7E97B5', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}>{name}</span>
          ))}
        </div>
        <p className="ark-mono" style={{ color: '#3D5573', fontSize: '10px', textAlign: 'center', margin: '10px 0 0' }}>* coming soon</p>
      </section>

      {/* HOW IT WORKS — light */}
      <section className="sp ark-light">
        <div className="sc">
          <div style={{ maxWidth: '560px', marginBottom: '56px' }}>
            <p className="ark-mono" style={{ color: '#C8102E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>HOW IT WORKS</p>
            <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              From anonymous click to active pipeline.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {steps.map(step => (
              <div key={step.num} className="ark-card-light" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px' }}>
                  <span className="ark-mono" style={{ color: '#C8102E', fontSize: '13px', fontWeight: 600 }}>{step.num}</span>
                  <span className="ark-mono" style={{ color: '#8296AE', fontSize: '11px' }}>{step.time}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '17px', marginBottom: '10px' }}>{step.title}</h3>
                <p className="ark-body" style={{ fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM — dark */}
      <section className="sp" style={{ background: '#060D1A' }}>
        <div className="sc">
          <div style={{ maxWidth: '620px', marginBottom: '56px' }}>
            <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>THE PLATFORM</p>
            <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
              A pixel is where it starts. Not where it ends.
            </h2>
            <p style={{ color: '#A9C1DC', fontSize: '16px', lineHeight: 1.7, margin: 0 }}>
              Most visitor-ID tools hand you a list and wish you luck. ArkData resolves identities, builds intent audiences, syncs them to your ad platforms, and proves what converted.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {platform.map(f => (
              <div key={f.title} className="ark-card" style={{ padding: '32px' }}>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '18px', marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ color: '#A9C1DC', fontSize: '14px', lineHeight: 1.65, marginBottom: '18px' }}>{f.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {f.bullets.map(b => (
                    <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                      <CheckCircle size={14} style={{ color: '#19C37D', flexShrink: 0, marginTop: '2px' }} />
                      <span className="ark-mono" style={{ color: '#8FA9C7', fontSize: '12px' }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RB2B COMPARISON — light */}
      <section className="sp ark-light">
        <div className="sc">
          <div style={{ maxWidth: '560px', marginBottom: '48px' }}>
            <p className="ark-mono" style={{ color: '#C8102E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>VS. RB2B</p>
            <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Why teams switch.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            {rb2bPoints.map(p => (
              <div key={p.title} className="ark-card-light" style={{ padding: '30px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '17px', marginBottom: '10px' }}>{p.title}</h3>
                <p className="ark-body" style={{ fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to={createPageUrl('Pricing') + '#pricing-calculator'}>
              <button className="ark-btn-dark" style={{ padding: '14px 28px', fontSize: '15px' }}>Compare pricing side by side →</button>
            </Link>
            <span className="ark-mono" style={{ color: '#8296AE', fontSize: '12px' }}>Usage-based. No tiers, no surprises.</span>
          </div>
        </div>
      </section>

      {/* AGENCIES — dark */}
      <section className="sp" style={{ background: '#040912', borderTop: '1px solid #101E33' }}>
        <div className="sc" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>FOR AGENCIES</p>
            <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Your brand. Your clients. Our engine.
            </h2>
            <p style={{ color: '#A9C1DC', fontSize: '16px', lineHeight: 1.7, marginBottom: '28px' }}>
              White-label ArkData under your agency's brand. Manage every client from one dashboard, set your own margins, and climb a four-rung partner ladder as you grow.
            </p>
            <Link to={createPageUrl('Agencies')}>
              <button className="ark-btn-green" style={{ padding: '14px 28px', fontSize: '15px' }}>Explore the partner program →</button>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['Fully white-labeled — your domain, your logo', 'One dashboard for every client pixel', 'Wholesale pricing, you set the markup', 'Partner ladder: better economics at every rung'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#081020', border: '1px solid #14263F', borderRadius: '8px', padding: '16px 20px' }}>
                <CheckCircle size={16} style={{ color: '#19C37D', flexShrink: 0 }} />
                <span style={{ color: '#C9DBEE', fontSize: '14px' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TEASER — dark */}
      <section className="sp" style={{ background: '#060D1A', borderTop: '1px solid #101E33' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <p className="ark-mono" style={{ color: '#C8102E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>PRICING</p>
          <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '14px' }}>
            Start free. Pay for what resolves.
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '16px', lineHeight: 1.7, marginBottom: '10px' }}>
            200 identity matches free every month, forever. Beyond that, pricing follows one smooth usage curve — always 30–40% below RB2B at every published tier.
          </p>
          <p className="ark-mono" style={{ color: '#5B7699', fontSize: '12px', marginBottom: '32px' }}>14-day free trial · full Pro experience · no credit card</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={APP_URL} target="_blank" rel="noopener noreferrer">
              <button className="ark-btn-red" style={{ padding: '14px 30px', fontSize: '15px' }}>Start free</button>
            </a>
            <Link to={createPageUrl('Pricing') + '#pricing-calculator'}>
              <button className="ark-btn-blue" style={{ padding: '14px 30px', fontSize: '15px' }}>Open the pricing calculator</button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ — light */}
      <section className="sp ark-light">
        <div className="sc" style={{ maxWidth: '760px' }}>
          <h2 className="ark-display" style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: '48px' }}>
            Questions, answered.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {faqs.map((faq, i) => (
              <div key={i} className="ark-card-light" style={{ overflow: 'hidden' }}>
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', color: '#0B1526', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', gap: '16px' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{faq.q}</span>
                  <span style={{ color: '#C8102E', flexShrink: 0, fontSize: '16px', transition: 'transform 0.2s', transform: expandedFaq === i ? 'rotate(180deg)' : 'none' }}>▾</span>
                </button>
                {expandedFaq === i && (
                  <div style={{ padding: '0 24px 20px' }}>
                    <p className="ark-body" style={{ fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link to={createPageUrl('FAQ')} style={{ color: '#46556B', fontSize: '14px', fontWeight: 600 }}>View all FAQs →</Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA — dark */}
      <section style={{ background: 'radial-gradient(800px 400px at 50% 0%, rgba(200,16,46,0.12) 0%, transparent 60%), #040912', padding: '96px 0' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <h2 className="ark-display" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '18px' }}>
            Find out who was on your site today.
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '17px', lineHeight: 1.65, margin: '0 auto 36px', maxWidth: '460px' }}>
            Install the pixel now and see your first resolved visitors before your next meeting ends.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={APP_URL} target="_blank" rel="noopener noreferrer">
              <button className="ark-btn-red" style={{ padding: '16px 36px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>Start free <ArrowRight size={16} /></button>
            </a>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-blue" style={{ padding: '16px 36px', fontSize: '16px' }}>Book a demo</button>
            </Link>
          </div>
          <p className="ark-mono" style={{ color: '#5B7699', fontSize: '12px', marginTop: '20px' }}>200 free matches/mo forever · 14-day Pro trial</p>
        </div>
      </section>
    </div>
  );
}
