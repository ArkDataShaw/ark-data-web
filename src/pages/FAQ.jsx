import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const faqCategories = [
  {
    cat: 'Data & Enrichment',
    items: [
      { q: 'What does Ark Data do?', a: 'Ark Data is a visitor intelligence platform. You install a lightweight pixel on your site, and we identify your anonymous visitors by cross-referencing sessions against our identity graph — sourced from 40+ licensed data brokers and validated against credit bureau records. Resolved visitors are enriched with 74+ data fields and delivered to your CRM or outreach tools.' },
      { q: 'What attributes are included in enrichment?', a: 'We provide 74+ enrichment fields across several categories: identity and demographics, contact info (phone and email), professional data (job title, department, seniority level), company data (name, domain, revenue, headcount, industry), social profiles (LinkedIn), and skiptrace-validated fields like credit rating and exact age.' },
      { q: 'Do you offer intent data?', a: 'High-intent data is available as a separate add-on product powered by IntentCore. It is not part of the standard Ark Data enrichment. Book a call if you want to learn more about adding intent signals to your workflow.' },
      { q: 'Is this company-level or individual-level data?', a: 'We resolve visitors at the individual level. Of resolved visitors, roughly 72% also include company-level data such as company name, domain, revenue, headcount, and industry.' },
      { q: 'How do you source your data?', a: 'Our identity graph is aggregated from 40+ licensed data sources and validated against credit bureau records. This gives us broad coverage across consumer and professional data points.' },
    ]
  },
  {
    cat: 'Lost Traffic',
    items: [
      { q: 'How is lost traffic recovered?', a: 'Our pixel captures anonymous visitor sessions and cross-references them against our identity graph, which is powered by 40+ licensed data sources. Resolved visitors are enriched with 74+ fields and delivered directly to your CRM or outreach platform.' },
      { q: 'What match rates can I expect?', a: 'Most clients see a 40–60% visitor resolution rate, meaning 40–60% of your anonymous traffic is identified and enriched. Actual rates vary by traffic mix and industry.' },
      { q: 'What does the pixel track?', a: 'The pixel captures 11 event types with rich behavioral data: page views, clicks, form submissions, scroll depth, file downloads, video play/pause/complete, text copy, user idle, and exit intent.' },
      { q: 'Will this slow down my website?', a: 'No. Our pixel is lightweight and fully asynchronous. It has zero impact on page load performance or Core Web Vitals.' },
    ]
  },
  {
    cat: 'Integrations & Delivery',
    items: [
      { q: 'What platforms do you integrate with?', a: 'We integrate with Resend, Instantly, Go High Level, Klaviyo, Clay, HubSpot, and HeyReach. We also support custom HTTP webhooks, so you can connect to virtually any platform that accepts inbound data.' },
      { q: 'How is data delivered?', a: 'Data can be delivered via direct platform integrations, batch CSV export, or custom webhook. Delivery format is configurable per integration.' },
      { q: 'Can I do custom field mapping?', a: 'Yes. We support custom field mapping to match your CRM schema and naming conventions.' },
    ]
  },
  {
    cat: 'Privacy & Data Handling',
    items: [
      { q: 'How do you handle privacy?', a: 'Ark Data is built with privacy in mind. All data is sourced from licensed, reputable data providers and validated against credit bureau records. We practice privacy-conscious data handling across our entire pipeline.' },
      { q: 'How do you source your data?', a: 'Our identity graph is aggregated from 40+ licensed data sources and validated against credit bureau records for accuracy. We do not scrape or collect data from unauthorized sources.' },
    ]
  },
  {
    cat: 'Onboarding & Support',
    items: [
      { q: 'What is the onboarding timeline?', a: 'Most clients are fully live in under a week. Pixel installation takes about 15 minutes. Integration setup is straightforward and we provide hands-on help to get you connected.' },
      { q: 'What support is included?', a: 'All plans include direct email support with fast response times. We are a hands-on team and will work with you to get the most out of the platform.' },
      { q: 'Do you offer a trial?', a: 'We offer a guided proof-of-concept for qualified teams. Book a call to discuss what a trial would look like for your use case.' },
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