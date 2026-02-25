import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { ReplyRateChart, LeadFunnelChart } from '../components/charts/RevenueCharts';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const caseStudies = [
  {
    company: 'Meridian Financial',
    industry: 'Financial Services',
    tag: 'Lost Traffic Recovery',
    tagColor: '#0A2142',
    challenge: 'Meridian was running significant paid search spend driving high-intent traffic to their site, but converting less than 1.2% of visitors. Their CRM had no visibility into who was visiting and leaving.',
    approach: 'Ark Data deployed the pixel and integration with Salesforce. Within 48 hours, identified sessions were being enriched with firmographic data and routed to the right SDRs based on company size and segment.',
    outcomes: [
      '+38% qualified pipeline from web traffic within 60 days',
      'Identified 4,200+ anonymous visitors in first month',
      '22% of identified visitors accepted a follow-up touchpoint',
      'CRM records enriched with verified contact + firmographic data',
    ],
    metrics: [
      { label: 'Pipeline Increase', value: '+38%' },
      { label: 'Visitors Identified', value: '4,200+' },
      { label: 'Follow-up Rate', value: '22%' },
      { label: 'Time to Live', value: '48 hrs' },
    ],
    quote: 'We had no idea how much pipeline was walking out our front door every month. Ark Data made our traffic visible and actionable within days.',
    quoteAuthor: 'VP of Revenue, Meridian Financial',
  },
  {
    company: 'Apex Logistics Group',
    industry: 'Logistics & Supply Chain',
    tag: 'High Intent Data',
    tagColor: '#063524',
    challenge: 'Apex\'s outbound team was burning hours prospecting cold lists with low reply rates. They had no way to identify which companies were actively evaluating logistics software or in-market for their services.',
    approach: 'Implemented Ark Data\'s High Intent data feed filtered for logistics, freight, and supply chain intent categories. Intent scores were synced to HubSpot and used to build daily priority sequences.',
    outcomes: [
      '+29% reply rate increase on outbound sequences',
      'SDR productivity up 2.1× (same headcount, more meetings)',
      '61% of intent-flagged accounts engaged within 14 days',
      'CAC reduced 18% over 90-day period',
    ],
    metrics: [
      { label: 'Reply Rate Increase', value: '+29%' },
      { label: 'SDR Productivity', value: '2.1×' },
      { label: 'Engagement Rate', value: '61%' },
      { label: 'CAC Reduction', value: '-18%' },
    ],
    quote: "Intent data completely changed how our SDRs prioritize their day. They're now calling people who are already looking for what we do.",
    quoteAuthor: 'Head of Sales Development, Apex Logistics',
  },
  {
    company: 'Nexus Software Co.',
    industry: 'B2B SaaS',
    tag: 'Full Platform',
    tagColor: '#3d0a0a',
    challenge: 'Nexus had strong organic traffic and a decent inbound motion, but their demand gen team struggled to convert MQLs and had zero visibility into who was visiting the pricing page and not converting.',
    approach: 'Deployed both Lost Traffic Recovery (for site session identification) and High Intent data (for off-site prospecting). Integrated with Klaviyo for email sequences and Salesforce for CRM routing.',
    outcomes: [
      'Pricing page visitors identified and routed to sales in real time',
      '+44% increase in sales-accepted leads quarter-over-quarter',
      'Email sequences to intent-identified accounts 3× higher open rates',
      'Full-funnel attribution now visible across paid + organic',
    ],
    metrics: [
      { label: 'SAL Increase', value: '+44%' },
      { label: 'Email Open Rate', value: '3× higher' },
      { label: 'Pricing page identified', value: '1,800+/mo' },
      { label: 'ROI at 90 days', value: '6.2×' },
    ],
    quote: 'We finally closed the loop between traffic and revenue. Ark Data is the connective tissue our revenue team was missing.',
    quoteAuthor: 'Director of Demand Generation, Nexus Software',
  },
  {
    company: 'Vantage Health',
    industry: 'Healthcare Technology',
    tag: 'Lost Traffic Recovery',
    tagColor: '#0A2142',
    challenge: 'Vantage Health operates in a highly regulated space where outbound prospecting is difficult and costly. They needed a compliant way to identify and re-engage high-value visitors to their platform.',
    approach: 'Implemented a GDPR and HIPAA-aligned pixel deployment with Ark Data\'s compliance team. Enriched sessions were routed to a dedicated enterprise sales workflow in Salesforce with full audit trails.',
    outcomes: [
      'Compliant identification of 2,800+ enterprise visitors in Q1',
      '14 enterprise deals sourced from identified traffic within 90 days',
      'Full compliance posture maintained — no regulatory friction',
      'Average deal size of identified leads: 2.4× higher than inbound',
    ],
    metrics: [
      { label: 'Enterprise Visitors ID\'d', value: '2,800+' },
      { label: 'Deals Sourced', value: '14' },
      { label: 'Avg Deal Size Delta', value: '2.4×' },
      { label: 'Compliance Issues', value: '0' },
    ],
    quote: "In healthcare, compliance isn't optional. Ark Data gave us a way to unlock web intelligence without compromising our regulatory standing.",
    quoteAuthor: 'Chief Revenue Officer, Vantage Health',
  },
];

export default function CaseStudies() {
  const [active, setActive] = useState(0);
  const cs = caseStudies[active];

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <p style={{ color: S.red, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Case Studies</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>Real Results from Real Revenue Teams.</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7 }}>See how B2B companies use Ark Data to identify lost traffic, source high-intent leads, and drive measurable pipeline growth.</p>
        </div>
      </section>

      {/* Summary Cards */}
      <section style={{ background: '#000002', padding: '48px 0', borderBottom: '1px solid #0A2142' }}>
        <div className="sc">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {caseStudies.map((c, i) => (
              <button key={i} onClick={() => setActive(i)}
                style={{
                  background: active === i ? '#06162A' : '#020D1F',
                  border: `1px solid ${active === i ? '#1a5ca8' : '#0A2142'}`,
                  borderRadius: '10px', padding: '24px', textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: active === i ? '0 0 20px rgba(26,92,168,0.15)' : 'none',
                }}>
                <span style={{ background: c.tagColor + '44', border: `1px solid ${c.tagColor}88`, color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '10px' }}>{c.tag}</span>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{c.company}</p>
                <p style={{ color: S.muted, fontSize: '12px' }}>{c.industry}</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {c.metrics.slice(0, 2).map((m, mi) => (
                    <div key={mi}>
                      <p style={{ color: '#B1001A', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>{m.value}</p>
                      <p style={{ color: S.muted, fontSize: '10px' }}>{m.label}</p>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Detail View */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
            {/* Left */}
            <div>
              <span style={{ background: cs.tagColor + '44', border: `1px solid ${cs.tagColor}88`, color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '16px' }}>{cs.tag}</span>
              <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-1px', marginBottom: '6px' }}>{cs.company}</h2>
              <p style={{ color: S.muted, fontSize: '14px', marginBottom: '32px' }}>{cs.industry}</p>

              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: '#B1001A', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>The Challenge</p>
                <p style={{ color: S.muted, fontSize: '14px', lineHeight: 1.75 }}>{cs.challenge}</p>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: '#DFFFEF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>The Approach</p>
                <p style={{ color: S.muted, fontSize: '14px', lineHeight: 1.75 }}>{cs.approach}</p>
              </div>

              {/* Quote */}
              <div style={{ background: '#06162A', border: '1px solid #0A2142', borderLeft: '3px solid #B1001A', borderRadius: '0 8px 8px 0', padding: '20px 24px', marginTop: '32px' }}>
                <p style={{ color: '#fff', fontSize: '14px', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '10px' }}>"{cs.quote}"</p>
                <p style={{ color: S.muted, fontSize: '12px', fontWeight: 600 }}>{cs.quoteAuthor}</p>
              </div>
            </div>

            {/* Right */}
            <div>
              {/* Metrics */}
              <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
                <p style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>Key Results</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {cs.metrics.map((m, mi) => (
                    <div key={mi} style={{ background: '#020D1F', border: '1px solid #0A2142', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                      <p style={{ color: '#B1001A', fontWeight: 900, fontSize: '32px', letterSpacing: '-1px', marginBottom: '4px' }}>{m.value}</p>
                      <p style={{ color: S.muted, fontSize: '12px' }}>{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outcomes */}
              <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '12px', padding: '28px' }}>
                <p style={{ color: '#DFFFEF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Outcomes</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cs.outcomes.map((o, oi) => (
                    <li key={oi} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <CheckCircle size={15} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />
                      <span style={{ color: '#DFFFEF', fontSize: '13px', lineHeight: 1.6 }}>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section style={{ background: '#020D1F', borderTop: '1px solid #0A2142', padding: '64px 0' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>By the Numbers</p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-1px' }}>Revenue Impact Across the Customer Base</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <ReplyRateChart />
            <LeadFunnelChart />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#06162A', borderTop: '1px solid #0A2142', padding: '64px 0' }}>
        <div className="sc" style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 900, fontSize: '30px', letterSpacing: '-0.8px', marginBottom: '12px' }}>Want results like these?</h2>
          <p style={{ color: S.muted, fontSize: '15px', marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px' }}>Book a call and we'll walk through how Ark Data would work for your specific use case.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '14px 32px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Book a Call <ArrowRight size={16} />
              </button>
            </Link>
            <Link to={createPageUrl('Pricing')}>
              <button className="ark-btn-blue" style={{ padding: '14px 32px', fontSize: '15px' }}>View Pricing</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}