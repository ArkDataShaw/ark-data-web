import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const caseStudies = [
  {
    id: 1,
    company: 'Meridian Capital Partners',
    industry: 'Financial Services',
    type: 'High Intent',
    problem: 'Meridian\'s SDR team was spending 70% of their time on research with no intent signals. Cold outbound had a 0.8% reply rate and CPL had grown 34% YoY.',
    solution: 'Deployed Ark Data\'s High Intent dataset across CRM software and financial technology categories. Daily signals fed directly into HubSpot with automated sequence triggers.',
    timeline: '3 weeks from contract to first qualified meeting',
    metrics: [{ v: '+22%', l: 'Reply Rate' }, { v: '-18%', l: 'Cost Per Lead' }, { v: '+31%', l: 'Qualified Meetings' }, { v: '4.1×', l: 'Pipeline ROI' }],
    quote: 'Ark Data changed how we think about outbound. We\'re no longer calling randomly — we\'re calling accounts actively evaluating solutions like ours.',
    author: 'Director of Revenue Operations, Meridian Capital Partners',
    color: 'blue',
  },
  {
    id: 2,
    company: 'Apex Logistics Group',
    industry: 'Logistics & Supply Chain',
    type: 'Lost Traffic',
    problem: 'Apex had a high-traffic site with a 0.4% form conversion rate. 96% of visitors were leaving without identifying themselves, including enterprise procurement teams.',
    solution: 'Ark Data pixel deployed in 15 minutes. Lost Traffic recovery began routing identified enterprise visitors to the Apex sales team via Salesforce with firmographic enrichment.',
    timeline: '15-minute install. First leads in dashboard within 48 hours.',
    metrics: [{ v: '+41%', l: 'Identified Sessions' }, { v: '3.8×', l: 'Lead Volume' }, { v: '-24%', l: 'Sales Cycle Length' }, { v: '+15%', l: 'Conversion Rate' }],
    quote: 'We went from flying blind to knowing exactly which enterprise accounts were evaluating us. The ROI in the first 30 days was undeniable.',
    author: 'VP of Sales, Apex Logistics Group',
    color: 'green',
  },
  {
    id: 3,
    company: 'NexGen Health Services',
    industry: 'Healthcare',
    type: 'High Intent',
    problem: 'NexGen was spending $180K/year on list purchases with no intent signals. Their outbound was generating poor-fit MQLs that never converted past first meeting.',
    solution: 'Replaced static list purchases with Ark Data High Intent segments for healthcare technology buyers. Custom segment built around NexGen\'s specific ICP and tech stack signals.',
    timeline: '2 weeks from kick-off to live segment delivery',
    metrics: [{ v: '-52%', l: 'Wasted Outreach' }, { v: '+28%', l: 'MQL-to-SQL Rate' }, { v: '$140K', l: 'Annual List Cost Saved' }, { v: '5.2×', l: 'Campaign ROI' }],
    quote: 'We cut our outbound list costs nearly in half and doubled our SQL rate. The quality difference between intent data and traditional lists is not subtle.',
    author: 'Head of Demand Generation, NexGen Health Services',
    color: 'blue',
  },
  {
    id: 4,
    company: 'Stratum Digital Agency',
    industry: 'Marketing Agency',
    type: 'Lost Traffic + High Intent',
    problem: 'Stratum\'s clients were seeing declining ROAS from ad campaigns using generic audience targeting. Client churn was increasing as performance dropped.',
    solution: 'Stratum white-labeled Ark Data enrichment for client websites. Lost Traffic recovery + intent-based audience segments deployed across Meta and Google Ads for 4 client accounts.',
    timeline: '4-week pilot across 4 client accounts',
    metrics: [{ v: '+36%', l: 'Client ROAS' }, { v: '-21%', l: 'CPL Across Accounts' }, { v: '100%', l: 'Pilot Client Retention' }, { v: '3 New', l: 'Clients from Referrals' }],
    quote: 'Ark Data became a core part of our agency\'s value proposition. Clients see real results and we have a clear differentiator over competitors.',
    author: 'CEO, Stratum Digital Agency',
    color: 'green',
  },
  {
    id: 5,
    company: 'CorePath B2B SaaS',
    industry: 'B2B SaaS',
    type: 'High Intent',
    problem: 'CorePath\'s product-led growth motion was generating signups but most were from non-ICP companies. Sales team was overwhelmed by low-fit trials and missing high-intent enterprise accounts.',
    solution: 'Ark Data High Intent deployed for CRM and workflow automation categories. Enriched enterprise accounts fed to sales Slack alerts with intent score and firmographic context.',
    timeline: '1 week from contract to first Slack alert',
    metrics: [{ v: '+19%', l: 'Enterprise Pipeline' }, { v: '-31%', l: 'Time Wasted on Low-Fit' }, { v: '+25%', l: 'Demo Close Rate' }, { v: '7.3×', l: 'ROI in 90 days' }],
    quote: 'We unlocked a whole layer of enterprise pipeline that was invisible to us before. High intent signals are now a core input into our sales prioritization.',
    author: 'VP of Growth, CorePath B2B SaaS',
    color: 'blue',
  },
];

export default function CaseStudies() {
  const [activeType, setActiveType] = useState('All');
  const types = ['All', 'Lost Traffic', 'High Intent', 'Lost Traffic + High Intent'];
  const filtered = activeType === 'All' ? caseStudies : caseStudies.filter(c => c.type === activeType);

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Case Studies</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.1 }}>Real Results. Real Revenue.</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>How revenue teams are using Ark Data to fill pipeline, cut costs, and win faster.</p>
        </div>
      </section>

      {/* Aggregate results */}
      <section style={{ background: '#06162A', borderBottom: '1px solid #0A2142', padding: '40px 0' }}>
        <div className="sc">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0' }}>
            {[{ v: '+28%', l: 'Avg Reply Rate Increase' }, { v: '-20%', l: 'Avg CPL Reduction' }, { v: '4.8×', l: 'Average ROI (90 days)' }, { v: '<2wk', l: 'Avg Time to First Result' }].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '16px', borderRight: i < 3 ? '1px solid #0A2142' : 'none' }}>
                <p style={{ color: '#B1001A', fontWeight: 900, fontSize: '32px', letterSpacing: '-1.5px', marginBottom: '4px' }}>{s.v}</p>
                <p style={{ color: S.muted, fontSize: '12px' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sc" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {types.map(t => (
            <button key={t} onClick={() => setActiveType(t)}
              style={{ padding: '8px 18px', background: activeType === t ? '#B1001A' : '#06162A', border: `1px solid ${activeType === t ? '#B1001A' : '#0A2142'}`, borderRadius: '100px', color: '#fff', fontSize: '13px', fontWeight: activeType === t ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {filtered.map((cs, i) => (
            <div key={cs.id} style={{ background: cs.color === 'blue' ? '#06162A' : '#042016', border: `1px solid ${cs.color === 'blue' ? '#0A2142' : '#063524'}`, borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '40px 48px', borderBottom: `1px solid ${cs.color === 'blue' ? '#0A2142' : '#063524'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <span style={{ background: '#0A2142', border: '1px solid #1a4a8a', borderRadius: '100px', padding: '3px 10px', color: S.muted, fontSize: '11px', fontWeight: 600 }}>{cs.industry}</span>
                      <span style={{ background: '#B1001A22', border: '1px solid #B1001A44', borderRadius: '100px', padding: '3px 10px', color: '#B1001A', fontSize: '11px', fontWeight: 700 }}>{cs.type}</span>
                    </div>
                    <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.5px' }}>{cs.company}</h2>
                  </div>
                  <p style={{ color: cs.color === 'blue' ? S.muted : '#DFFFEF', fontSize: '12px', fontStyle: 'italic', flexShrink: 0 }}>⏱ {cs.timeline}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <div>
                    <p style={{ color: '#B1001A', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>The Problem</p>
                    <p style={{ color: cs.color === 'blue' ? S.muted : '#DFFFEF', fontSize: '14px', lineHeight: 1.7 }}>{cs.problem}</p>
                  </div>
                  <div>
                    <p style={{ color: '#DFFFEF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>The Solution</p>
                    <p style={{ color: cs.color === 'blue' ? S.muted : '#DFFFEF', fontSize: '14px', lineHeight: 1.7 }}>{cs.solution}</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '32px 48px', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                  {cs.metrics.map((m, mi) => (
                    <div key={mi} style={{ textAlign: 'center' }}>
                      <p style={{ color: '#B1001A', fontWeight: 900, fontSize: '28px', letterSpacing: '-1px', marginBottom: '2px' }}>{m.v}</p>
                      <p style={{ color: cs.color === 'blue' ? S.muted : '#DFFFEF', fontSize: '11px' }}>{m.l}</p>
                    </div>
                  ))}
                </div>
                <div style={{ maxWidth: '360px', background: cs.color === 'blue' ? '#020D1F' : '#06162A', border: `1px solid ${cs.color === 'blue' ? '#0A2142' : '#0A2142'}`, borderRadius: '8px', padding: '20px', fontStyle: 'italic' }}>
                  <p style={{ color: cs.color === 'blue' ? S.muted : '#DFFFEF', fontSize: '13px', lineHeight: 1.7, marginBottom: '8px' }}>"{cs.quote}"</p>
                  <p style={{ color: cs.color === 'blue' ? '#4a7aaa' : '#4a9a6a', fontSize: '11px', fontStyle: 'normal', fontWeight: 600 }}>{cs.author}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <Link to={createPageUrl('BookADemo')}>
            <button className="ark-btn-red" style={{ padding: '14px 36px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              See How It Works for Your Team <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}