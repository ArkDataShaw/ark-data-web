import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const coreServices = [
  {
    id: 'lost-traffic',
    name: 'Lost Traffic Recovery',
    tagline: 'Recover anonymous visitors before they disappear.',
    desc: 'Up to 97% of your website visitors leave without identifying themselves. Ark Data\'s pixel captures every session across 11 event types, resolves identity using our identity graph sourced from 40+ licensed data brokers, and enriches each visitor with 74+ fields — spanning contact, demographic, professional, company, and social data.',
    color: 'blue',
    icon: '🔍',
    features: [
      { title: 'Anonymous Session Capture', desc: 'Track every session with our lightweight async pixel across 11 event types — page views, clicks, form submissions, scroll depth, and more.' },
      { title: 'Identity Resolution', desc: 'Match sessions to real individuals and companies via our identity graph, validated through credit bureau skiptrace.' },
      { title: '74+ Field Enrichment', desc: 'Identity, demographics, contact, professional, company, and social data auto-appended to every resolved visitor.' },
      { title: 'ICP Matching', desc: 'We configure your ideal customer profile during onboarding — then it runs automatically on every new visitor.' },
      { title: '40–60% Resolution Rate', desc: 'Resolve 40–60% of anonymous sessions to real identities. ~72% of resolved visitors also include company data.' },
      { title: 'Real-Time CRM Routing', desc: 'Leads flow to your stack via Resend, Instantly, Go High Level, Klaviyo, Clay, HubSpot, HeyReach, or custom webhook.' },
    ],
    useCases: ['SDR outbound prioritization', 'Form abandonment recovery', 'Re-engagement campaigns', 'Territory enrichment'],
  },
  {
    id: 'high-intent',
    name: 'High Intent Data',
    tagline: 'Find buyers actively in-market — before your competition.',
    desc: 'High Intent Data is a separate product that surfaces individuals and companies showing active buying signals. Layer intent data on top of your visitor intelligence to prioritize outreach toward prospects already researching your category.',
    color: 'green',
    icon: '⚡',
    features: [
      { title: 'In-Market Segments', desc: 'Pre-built and custom intent segments by category and vertical.' },
      { title: 'Intent Score Levels', desc: 'Filter prospects by high or medium intent based on recency and engagement depth.' },
      { title: 'Category-Level Targeting', desc: 'Target by wealth management, CRM, consulting, cybersecurity, and more.' },
      { title: 'Competitor Signal Detection', desc: 'Know when prospects are evaluating your competitors.' },
      { title: 'Individual + Account Level', desc: 'Signals at person level, not just company level.' },
      { title: 'Layer with Visitor Data', desc: 'Combine intent signals with your resolved visitor data for precision outbound.' },
    ],
    useCases: ['Account-based marketing (ABM)', 'Outbound sequence triggers', 'Pipeline prioritization', 'Sales team routing'],
  },
];

const supportingServices = [
  { name: 'List Quality Audit', icon: '📋', desc: 'Submit your existing outreach list and we\'ll flag bad records, enrich missing fields, and return a cleaned version ready for outreach.', available: 'All plans' },
  { name: 'ICP Segment Configuration', icon: '🎛️', desc: 'We define your ideal customer profile during onboarding — by industry, title, geography, company size, and more. Once set, it runs automatically on every new visitor.', available: 'All plans' },
  { name: 'CRM Enrichment', icon: '⚙️', desc: 'Enrich your existing CRM records with 74+ fields from our identity graph — filling gaps in contact, company, and demographic data.', available: 'Growth+' },
  { name: 'Audience Building for Ads', icon: '🎯', desc: 'Push enriched audiences to Meta for ad targeting, or route to any platform via Go High Level, Klaviyo, Clay, HubSpot, or custom webhook.', available: 'Growth+' },
  { name: 'Intent Category Research', icon: '🔬', desc: 'We identify the right intent categories for your ICP — so you know which buying signals matter most for your pipeline.', available: 'Growth+' },
  { name: 'Custom Integration Setup', icon: '🔗', desc: 'We connect your enriched data to Resend, Instantly, Go High Level, Klaviyo, Clay, HubSpot, HeyReach — plus any platform via custom webhook.', available: 'All plans' },
];

export default function Services() {
  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Services</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.1 }}>
            Data Services Built for Revenue.
          </h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            Two core pillars. Six supporting services. All designed to fill your pipeline with high-quality, actionable data.
          </p>
        </div>
      </section>

      {/* Core Services */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {coreServices.map((service, si) => (
              <div key={si} style={{ background: service.color === 'blue' ? '#06162A' : '#042016', border: `1px solid ${service.color === 'blue' ? '#0A2142' : '#063524'}`, borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '48px', borderBottom: `1px solid ${service.color === 'blue' ? '#0A2142' : '#063524'}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '32px' }}>{service.icon}</span>
                        <span style={{ background: '#B1001A', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Core Service</span>
                      </div>
                      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.8px', marginBottom: '8px' }}>{service.name}</h2>
                      <p style={{ color: service.color === 'blue' ? S.muted : '#DFFFEF', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>{service.tagline}</p>
                      <p style={{ color: service.color === 'blue' ? S.muted : '#DFFFEF', fontSize: '14px', lineHeight: 1.75 }}>{service.desc}</p>
                    </div>
                    <div>
                      <p style={{ color: service.color === 'blue' ? S.muted : '#DFFFEF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Use Cases</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                        {service.useCases.map(u => (
                          <span key={u} style={{ background: service.color === 'blue' ? '#0A2142' : '#063524', border: `1px solid ${service.color === 'blue' ? '#1a4a8a' : '#0a6640'}`, borderRadius: '100px', padding: '4px 12px', color: service.color === 'blue' ? S.muted : '#DFFFEF', fontSize: '12px', fontWeight: 600 }}>{u}</span>
                        ))}
                      </div>
                      <Link to={createPageUrl('BookADemo')}>
                        <button className={service.color === 'blue' ? 'ark-btn-blue' : 'ark-btn-green'} style={{ padding: '12px 24px', fontSize: '14px' }}>Get Started →</button>
                      </Link>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '32px 48px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {service.features.map((f, fi) => (
                      <div key={fi} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <CheckCircle size={15} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px', marginBottom: '3px' }}>{f.title}</p>
                          <p style={{ color: service.color === 'blue' ? S.muted : '#DFFFEF', fontSize: '12px', lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supporting Services */}
      <section className="sp" style={{ background: '#020D1F', borderTop: '1px solid #0A2142' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Supporting Services</p>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px' }}>Extend Your Data Stack</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {supportingServices.map((s, i) => (
              <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '28px', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '24px' }}>{s.icon}</span>
                  <span style={{ background: '#042016', border: '1px solid #063524', borderRadius: '100px', padding: '2px 10px', color: '#DFFFEF', fontSize: '10px', fontWeight: 600 }}>{s.available}</span>
                </div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '10px' }}>{s.name}</h3>
                <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#000002', borderTop: '1px solid #0A2142', padding: '80px 0' }}>
        <div className="sc" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px' }}>Not Sure Which Service Fits?</h2>
          <p style={{ color: S.muted, fontSize: '16px', marginBottom: '32px', maxWidth: '440px', margin: '0 auto 32px' }}>Book a call and we'll recommend the right combination for your use case.</p>
          <Link to={createPageUrl('BookADemo')}>
            <button className="ark-btn-red" style={{ padding: '15px 36px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Book a Call <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}