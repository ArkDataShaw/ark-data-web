import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const faqCategories = [
  {
    cat: 'Data & Intent',
    items: [
      { q: 'What is high-intent data?', a: 'High-intent data identifies businesses or individuals showing active buying signals — researching solutions, visiting competitor sites, downloading category guides, or engaging with in-category content. It tells you who is in-market right now.' },
      { q: 'How often is data refreshed?', a: 'Our intent signals are refreshed daily. Firmographic and contact data is verified on a rolling 30-day cycle. Enterprise plans include on-demand refresh capability.' },
      { q: 'What attributes are included in enrichment?', a: 'Domain, industry, employee count, revenue band, HQ location, technology stack, buyer role signals, buying stage, and contact-level data including verified work email and job title.' },
      { q: 'What intent categories do you cover?', a: 'We cover 10,000+ intent topics including CRM software, payroll tools, HR platforms, cybersecurity, logistics SaaS, marketing automation, analytics, and hundreds of vertical-specific categories.' },
      { q: 'Is this company-level or individual-level data?', a: 'Both. We offer account-level (company) firmographic enrichment and individual-level contact resolution for high-intent visitors, depending on the data available and your plan tier.' },
    ]
  },
  {
    cat: 'Lost Traffic',
    items: [
      { q: 'How is lost traffic recovered?', a: 'Our pixel captures anonymous sessions and cross-references against our identity graph. We resolve visitor identity using behavioral signals, IP resolution, device matching, and proprietary data partnerships, then deliver enriched leads to your CRM.' },
      { q: 'What match rates can I expect?', a: 'Match rates vary by traffic mix and industry. Most clients see 20-40% of traffic resolved to company-level, and 10-20% resolved to individual contact level with verified email.' },
      { q: 'What sources count as "lost traffic"?', a: 'Website visits, form partial completions, newsletter signups that bounced, chat widget interactions, PDF downloads without form fills, and any session that ended without conversion.' },
      { q: 'Will this slow down my website?', a: 'No. Our pixel is under 2KB and fully asynchronous. It has zero impact on page load performance or Core Web Vitals.' },
    ]
  },
  {
    cat: 'Integrations & Delivery',
    items: [
      { q: 'What CRMs do you integrate with?', a: 'We integrate natively with Salesforce, HubSpot, Pipedrive, Marketo, ActiveCampaign, Mailchimp, Klaviyo, and any platform supporting webhook or REST API delivery.' },
      { q: 'How is data delivered?', a: 'Real-time API push, batch CSV export, direct CRM/ESP integration via OAuth, or custom webhook delivery. Delivery format is configurable per integration.' },
      { q: 'Can I do custom field mapping?', a: 'Yes. We support fully custom field mapping to match your CRM schema, object structure, and naming conventions. Available on Growth+ plans.' },
      { q: 'Do you support ad platform activation?', a: 'Yes. We can push enriched audiences directly to Google Ads, Meta, LinkedIn, and Programmatic DSPs for retargeting and lookalike building.' },
    ]
  },
  {
    cat: 'Compliance & Security',
    items: [
      { q: 'How do you handle compliance?', a: 'Ark Data is designed to support GDPR, CCPA, and major privacy frameworks. We operate with privacy-first data handling, offer DPAs for enterprise clients, and support vendor security reviews.' },
      { q: 'Is a DPA available?', a: 'Yes. A Data Processing Agreement is available for all Growth and above plans. Contact our team to request a DPA review.' },
      { q: 'How do you source your data?', a: 'We aggregate from first-party consent networks, public business records, licensed data partnerships, and proprietary behavioral signal collection. All sources are screened for compliance.' },
      { q: 'What about data residency?', a: 'Enterprise plans include data residency configuration options. Contact us to discuss your jurisdiction requirements.' },
    ]
  },
  {
    cat: 'Onboarding & Support',
    items: [
      { q: 'What is the onboarding timeline?', a: 'Most clients are fully live in under 1 week. Pixel installation takes 15 minutes. CRM integration and field mapping typically takes 2–3 hours with our team.' },
      { q: 'What support is included?', a: 'Starter includes email support. Growth includes a dedicated CSM and Slack channel. Scale and Enterprise include analyst support, priority response SLAs, and quarterly business reviews.' },
      { q: 'Do you offer a trial?', a: 'We offer a guided proof-of-concept for qualified teams. Book a call to discuss what a trial would look like for your use case.' },
      { q: 'Can I do custom segment builds?', a: 'Yes. Custom segment construction (by intent category, firmographic filters, tech stack, or behavioral criteria) is available on Scale and Enterprise plans, and as an add-on for Growth.' },
    ]
  },
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>FAQ</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>Frequently Asked Questions</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7 }}>Everything you need to know about Ark Data's platform, pricing, compliance, and onboarding.</p>
        </div>
      </section>

      <div className="sc" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Category nav */}
          <div style={{ position: 'sticky', top: '84px' }}>
            <p style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Categories</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {faqCategories.map((cat, i) => (
                <button key={i} onClick={() => { setActiveCategory(i); setExpanded(null); }}
                  style={{ textAlign: 'left', background: activeCategory === i ? '#06162A' : 'none', border: `1px solid ${activeCategory === i ? '#0A2142' : 'transparent'}`, borderRadius: '6px', padding: '10px 14px', cursor: 'pointer', color: activeCategory === i ? '#fff' : S.muted, fontWeight: activeCategory === i ? 700 : 500, fontSize: '13px', transition: 'all 0.2s' }}>
                  {cat.cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '20px', marginBottom: '24px' }}>{faqCategories[activeCategory].cat}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqCategories[activeCategory].items.map((item, i) => (
                <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '8px', overflow: 'hidden' }}>
                  <button onClick={() => setExpanded(expanded === i ? null : i)}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', gap: '16px', textAlign: 'left' }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>{item.q}</span>
                    <span style={{ color: '#B1001A', flexShrink: 0, fontSize: '16px', transition: 'transform 0.2s', transform: expanded === i ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </button>
                  {expanded === i && (
                    <div style={{ borderTop: '1px solid #0A2142', padding: '16px 24px 20px' }}>
                      <p style={{ color: S.muted, fontSize: '14px', lineHeight: 1.75 }}>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: '60px', background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '10px' }}>Still have questions?</h3>
          <p style={{ color: S.muted, fontSize: '14px', marginBottom: '24px' }}>Our team responds within 1 business day.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '12px 28px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Book a Call <ArrowRight size={16} />
              </button>
            </Link>
            <Link to={createPageUrl('Contact')}>
              <button className="ark-btn-blue" style={{ padding: '12px 28px', fontSize: '14px' }}>Contact Us</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}