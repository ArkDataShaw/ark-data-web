import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, CheckCircle } from 'lucide-react';
import IntentGlobe from '../components/home/IntentGlobe';
import ResolutionCard from '../components/home/ResolutionCard';
import DataPipeline from '../components/home/DataPipeline';

const APP_URL = 'https://app.arkdata.io';

const heroStats = [
  ['12,000+', 'intent topics tracked'],
  ['650+', 'data points per person'],
  ['B2B + B2C', 'full market coverage'],
  ['Daily', 'signal refresh'],
];

const integrations = [
  'Meta Ads', 'Google Ads', 'DV360', 'HubSpot', 'Slack', 'Klaviyo', 'HighLevel', 'Salesforce*', 'Shopify*',
];

const problems = [
  {
    title: 'You pay to interrupt, not to connect',
    desc: 'Demographic and interest targeting shows your ads to people who fit a profile — not people researching a purchase. Most of your budget lands on an audience that was never in-market.',
  },
  {
    title: 'You have zero visibility into buyer intent',
    desc: "You can't see who is actively comparing solutions in your category right now. By the time they hit your website, they've already shortlisted your competitors.",
  },
  {
    title: "You're late to every deal",
    desc: 'Buyers research for weeks before they talk to anyone. Without intent signals, you enter the conversation last — and compete on price instead of fit.',
  },
];

const features = [
  { title: 'Intent Audience Builder', desc: 'Build custom audiences from 12,000+ live intent topics. Stack intent with demographic and firmographic filters for surgical precision.', link: null },
  { title: 'Ad Platform Sync', desc: 'Push audiences to Meta, Google Ads, and DV360 with one click. Native Meta Custom Audience sync is live and proven in production.', link: null },
  { title: 'Website Visitor Identification', desc: 'Resolve anonymous visitors into named people with full contact data — the moment they land. B2B and B2C.', link: null },
  { title: 'Instant Activation', desc: 'Audiences flow to ads, email, CRM, and Slack automatically. No CSV exports, no manual uploads, no delays.', link: null },
  { title: 'Conversion Attribution', desc: 'SalesMatch connects campaigns to resolved visitors and closed revenue, so you know exactly which intent audiences convert.', link: null },
  { title: 'White-Label for Agencies', desc: 'Run all of this under your own brand for every client — with wholesale pricing and a four-rung partner ladder.', link: 'Agencies' },
];

const faqs = [
  { q: 'What is intent data, exactly?', a: 'Intent data identifies people who are actively researching a product or service category — comparing vendors, reading reviews, searching for solutions. ArkData tracks intent across 12,000+ topics spanning both B2B (software, services, equipment) and B2C (home services, finance, healthcare, and more), refreshed daily.' },
  { q: 'How do I use intent audiences in my ads?', a: 'Build an audience in ArkData from the intent topics that match your product, then sync it to Meta, Google Ads, or DV360 as a custom audience with one click. Your campaigns target people already researching what you sell — instead of demographic lookalikes.' },
  { q: 'What does ArkData actually do?', a: 'Two things, one platform: it finds in-market buyers via 12,000+ intent topics and builds them into ad-ready audiences, and it resolves your anonymous website visitors into identified people with 650+ data points — delivered to your CRM, Slack, email tools, or ad platforms in real time.' },
  { q: 'How is this different from RB2B or Leadfeeder?', a: 'Those tools only tell you who visited your website — and only for B2B. ArkData covers the whole funnel: intent audiences of buyers who have never visited you, B2C as well as B2B coverage, native ad platform sync, and pricing 30–40% below RB2B at every published tier.' },
  { q: 'Is there a free plan?', a: 'Yes. Every account gets 200 free identity matches per month, forever — no credit card required. New accounts also get a 14-day free trial of the full Pro experience, including the Audience Builder.' },
  { q: 'How do you handle privacy and compliance?', a: 'ArkData is built with privacy in mind. Our identity graph is sourced exclusively from licensed data providers with opt-out compliance, and our data handling is designed to support CCPA and major privacy frameworks.' },
];

export default function Home() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div style={{ background: '#060D1A', color: '#fff' }}>
      <style>{`
        .hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 48px; align-items: center; }
        @media (max-width: 960px) { .hero-grid { grid-template-columns: 1fr; gap: 24px; } }
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #14263F; border: 1px solid #14263F; border-radius: 10px; overflow: hidden; }
        @media (max-width: 720px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
        .vid-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        @media (max-width: 960px) { .vid-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* HERO — intent-first */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(1100px 550px at 78% 30%, rgba(20,60,110,0.28) 0%, transparent 60%), #060D1A' }}>
        <div className="sc" style={{ paddingTop: '80px', paddingBottom: '64px', position: 'relative', zIndex: 2 }}>
          <div className="hero-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(25,195,125,0.3)', borderRadius: '100px', padding: '6px 14px', marginBottom: '26px', background: 'rgba(25,195,125,0.05)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#19C37D', display: 'inline-block' }} />
                <span className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', letterSpacing: '0.08em' }}>INTENT-BASED AUDIENCE DATA</span>
              </div>
              <h1 className="ark-display" style={{ fontSize: 'clamp(36px, 4.8vw, 60px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.03em', margin: '0 0 22px', color: '#fff' }}>
                Stop advertising to people who <em style={{ fontStyle: 'italic', color: '#7E97B5' }}>might</em> buy.
              </h1>
              <p style={{ color: '#A9C1DC', fontSize: 'clamp(15px, 1.6vw, 18px)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: '500px' }}>
                ArkData finds the people actively researching what you sell — across 12,000+ intent topics, B2B and B2C — and puts your ads, emails, and sales team in front of them while they're still deciding.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
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
            <IntentGlobe />
          </div>

          <div className="stat-grid" style={{ marginTop: '56px' }}>
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
          <span className="ark-mono" style={{ color: '#3D5573', fontSize: '11px', letterSpacing: '0.12em' }}>SYNC AUDIENCES TO</span>
          {integrations.map(name => (
            <span key={name} className="ark-display" style={{ color: '#7E97B5', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}>{name}</span>
          ))}
        </div>
        <p className="ark-mono" style={{ color: '#3D5573', fontSize: '10px', textAlign: 'center', margin: '10px 0 0' }}>* coming soon</p>
      </section>

      {/* PROBLEM — light */}
      <section className="sp ark-light">
        <div className="sc">
          <div style={{ maxWidth: '620px', margin: '0 auto 56px', textAlign: 'center' }}>
            <p className="ark-mono" style={{ color: '#C8102E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>THE PROBLEM</p>
            <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Traditional ad targeting is guessing.
            </h2>
            <p className="ark-body" style={{ fontSize: '16px', lineHeight: 1.7, margin: 0 }}>
              While you target demographics and interests, your competitors are targeting actual buying behavior. The difference shows up in your CPA.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {problems.map(p => (
              <div key={p.title} className="ark-card-light" style={{ padding: '30px', borderTop: '3px solid #C8102E' }}>
                <h3 style={{ fontWeight: 700, fontSize: '17px', marginBottom: '10px' }}>{p.title}</h3>
                <p className="ark-body" style={{ fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATEMENT BAND — dark */}
      <section style={{ background: 'radial-gradient(900px 400px at 50% 50%, rgba(25,195,125,0.08) 0%, transparent 65%), #040912', padding: '80px 0', borderTop: '1px solid #101E33', borderBottom: '1px solid #101E33' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '760px' }}>
          <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.8vw, 46px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '18px' }}>
            ArkData puts you in front of <span style={{ color: '#19C37D' }}>active buyers.</span>
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '17px', lineHeight: 1.7, margin: '0 auto', maxWidth: '620px' }}>
            We track daily research behavior across 12,000+ intent topics and resolve it to real, reachable people — so you enter the conversation while the buying decision is still open, not after it's made.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS — unified pipeline scroll animation */}
      <DataPipeline />

      {/* FEATURE GRID — light */}
      <section className="sp ark-light">
        <div className="sc">
          <div style={{ maxWidth: '620px', margin: '0 auto 56px', textAlign: 'center' }}>
            <p className="ark-mono" style={{ color: '#C8102E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>THE PLATFORM</p>
            <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Turn intent into revenue.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {features.map(f => (
              <div key={f.title} className="ark-card-light" style={{ padding: '30px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '10px' }}>{f.title}</h3>
                <p className="ark-body" style={{ fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                {f.link && (
                  <Link to={createPageUrl(f.link)} style={{ color: '#C8102E', fontSize: '13px', fontWeight: 600, display: 'inline-block', marginTop: '12px' }}>
                    Learn more →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISITOR ID SPOTLIGHT — dark */}
      <section className="sp" style={{ background: '#060D1A' }}>
        <div className="sc">
          <div className="vid-grid">
            <div>
              <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>AND ON YOUR OWN SITE</p>
              <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
                Every visitor, by name.
              </h2>
              <p style={{ color: '#A9C1DC', fontSize: '16px', lineHeight: 1.7, marginBottom: '24px' }}>
                Your highest-intent audience is already on your website. ArkData's pixel resolves anonymous visitors into identified people — with contact info, 650+ data points, and the intent topics they're researching — then routes them to your CRM before they go dark.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Person-level identity, not just company names', 'Works on B2C traffic, not just B2B', 'Real-time delivery to HubSpot, Slack, Klaviyo, HighLevel'].map(t => (
                  <li key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle size={15} style={{ color: '#19C37D', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: '#C9DBEE', fontSize: '14px' }}>{t}</span>
                  </li>
                ))}
              </ul>
              <Link to={createPageUrl('Product')}>
                <button className="ark-btn-green" style={{ padding: '13px 26px', fontSize: '14px' }}>See the full platform →</button>
              </Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ResolutionCard />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TEASER — dark band */}
      <section className="sp" style={{ background: '#040912', borderTop: '1px solid #101E33' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <p className="ark-mono" style={{ color: '#C8102E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>PRICING</p>
          <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '14px' }}>
            Start free. Pay for what resolves.
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '16px', lineHeight: 1.7, marginBottom: '10px' }}>
            200 identity matches free every month, forever. Beyond that, one smooth usage curve — always 30–40% below RB2B at every published tier.
          </p>
          <p className="ark-mono" style={{ color: '#5B7699', fontSize: '12px', marginBottom: '32px' }}>14-day free trial · full Pro experience · no credit card</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={APP_URL} target="_blank" rel="noopener noreferrer">
              <button className="ark-btn-red" style={{ padding: '14px 30px', fontSize: '15px' }}>Start free</button>
            </a>
            <Link to={createPageUrl('Pricing') + '#pricing-calculator'}>
              <button className="ark-btn-blue" style={{ padding: '14px 30px', fontSize: '15px' }}>Compare against RB2B</button>
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
            Your buyers are researching right now.
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '17px', lineHeight: 1.65, margin: '0 auto 36px', maxWidth: '480px' }}>
            Start free and see who's in-market for what you sell — and who's already on your site — before your next campaign goes live.
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
