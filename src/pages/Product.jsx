import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight, Zap, Shield, BarChart2, Database, Globe, Cpu } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const tabs = ['Overview', 'Lost Traffic Recovery', 'High Intent Data', 'Enrichment Engine', 'Delivery & Integrations'];

const features = [
  {
    icon: Globe,
    title: 'Lost Traffic Recovery',
    desc: 'Identify anonymous website visitors and resolve them to real people with verified contact data, company info, and behavioral signals.',
    bullets: ['Identity resolution at person-level', 'Verified work email + direct dial', 'On-site behavioral signals', 'Real-time CRM routing'],
    color: '#0A2142',
  },
  {
    icon: Zap,
    title: 'High Intent Data',
    desc: 'Access individuals actively researching your solution across 10,000+ data sources. Know who is in-market before your competitors.',
    bullets: ['Off-site intent signals', 'Individual-level (not just account)', 'Competitor & vendor research tracking', 'Daily refresh of in-market buyers'],
    color: '#063524',
  },
  {
    icon: Database,
    title: 'Enrichment Engine',
    desc: 'Enrich every record with firmographic, technographic, and contact data. Keep your CRM clean, complete, and actionable.',
    bullets: ['Firmographic & technographic data', 'Contact data with email validation', 'Deduplication & normalization', 'Bulk + real-time enrichment modes'],
    color: '#0A2142',
  },
  {
    icon: BarChart2,
    title: 'Intent Scoring & Segmentation',
    desc: 'AI-powered scoring models that rank leads by conversion readiness. Build segments by any combination of attributes.',
    bullets: ['AI conversion likelihood score', 'Custom scoring rules', 'Dynamic audience segments', 'Account-level aggregation'],
    color: '#063524',
  },
  {
    icon: Cpu,
    title: 'Delivery & Activation',
    desc: 'Push enriched, scored data to your CRM, ad platforms, ESPs, or custom endpoints. Real-time or batch.',
    bullets: ['Native CRM & ESP integrations', 'Ad platform audience sync', 'Webhook & REST API delivery', 'Custom field mapping'],
    color: '#0A2142',
  },
  {
    icon: Shield,
    title: 'Compliance & Security',
    desc: 'Privacy-first architecture designed for GDPR, CCPA, and enterprise security requirements.',
    bullets: ['GDPR & CCPA compliant', 'DPA available on Growth+', 'SOC 2 Type II (in progress)', 'Data residency options for Enterprise'],
    color: '#3d0a0a',
  },
];

const techSpecs = [
  { label: 'Identity Resolution', value: 'Person-level (not just company)' },
  { label: 'Data Refresh', value: 'Real-time to daily, by plan' },
  { label: 'Match Accuracy', value: '95%+ on verified records' },
  { label: 'Anonymous Match Rate', value: '20–40% of website traffic' },
  { label: 'Enrichment Fields', value: '120+ firmographic & contact fields' },
  { label: 'Intent Data Sources', value: '10,000+ publisher network' },
  { label: 'Pixel Install Time', value: 'Under 15 minutes' },
  { label: 'API Response Time', value: '<200ms (p99)' },
  { label: 'Uptime SLA', value: '99.9% (Scale+)' },
  { label: 'Data Retention', value: 'Configurable, up to 24 months' },
  { label: 'Compliance', value: 'GDPR, CCPA, CAN-SPAM' },
  { label: 'Delivery Methods', value: 'API, CRM push, Webhook, CSV' },
];

export default function Product() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <p style={{ color: S.red, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>The Platform</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>
            Command-Center Grade<br />Data Infrastructure.
          </h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, marginBottom: '32px' }}>
            Two powerful engines, Lost Traffic Recovery and High Intent Data, unified in a single platform built for revenue operators.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '13px 28px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Book a Call <ArrowRight size={15} />
              </button>
            </Link>
            <Link to={createPageUrl('Pricing')}>
              <button className="ark-btn-blue" style={{ padding: '13px 28px', fontSize: '15px' }}>View Pricing</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tab Nav */}
      <div style={{ background: '#06162A', borderBottom: '1px solid #0A2142', overflowX: 'auto' }}>
        <div className="sc" style={{ display: 'flex', gap: '0' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#B1001A' : 'transparent'}`,
                color: activeTab === tab ? '#fff' : S.muted, padding: '16px 20px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="sc" style={{ paddingTop: '64px', paddingBottom: '80px' }}>

        {activeTab === 'Overview' && (
          <>
            {/* Feature Cards */}
            <div style={{ marginBottom: '72px' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>Everything You Need to Activate Revenue.</h2>
                <p style={{ color: S.muted, fontSize: '16px', maxWidth: '520px', margin: '0 auto' }}>From anonymous visitor to enriched, scored, delivered — all in one platform.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} style={{ background: i % 2 === 0 ? '#06162A' : '#042016', border: `1px solid ${i % 2 === 0 ? '#0A2142' : '#063524'}`, borderRadius: '12px', padding: '32px' }}>
                      <div style={{ width: '44px', height: '44px', background: f.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                        <Icon size={20} style={{ color: '#fff' }} />
                      </div>
                      <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '17px', marginBottom: '10px' }}>{f.title}</h3>
                      <p style={{ color: i % 2 === 0 ? S.muted : S.mutedGreen, fontSize: '13px', lineHeight: 1.65, marginBottom: '18px' }}>{f.desc}</p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {f.bullets.map(b => (
                          <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <CheckCircle size={13} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ color: i % 2 === 0 ? S.muted : S.mutedGreen, fontSize: '13px' }}>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tech Specs */}
            <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', overflow: 'hidden', marginBottom: '64px' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #0A2142' }}>
                <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '18px' }}>Platform Specifications</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {techSpecs.map((spec, i) => (
                  <div key={i} style={{ padding: '18px 32px', borderBottom: '1px solid #0A2142', borderRight: i % 2 === 0 ? '1px solid #0A2142' : 'none' }}>
                    <p style={{ color: '#4a6a9a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>{spec.label}</p>
                    <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'Lost Traffic Recovery' && (
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#06162A', border: '1px solid #0A2142', borderRadius: '100px', padding: '6px 14px', marginBottom: '20px' }}>
                <Globe size={14} style={{ color: '#1a5ca8' }} />
                <span style={{ color: S.muted, fontSize: '12px', fontWeight: 600 }}>Lost Traffic Recovery</span>
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px' }}>Turn Anonymous Traffic Into Pipeline.</h2>
              <p style={{ color: S.muted, fontSize: '16px', lineHeight: 1.7 }}>Up to 97% of website visitors leave without identifying themselves. Ark Data's pixel captures these sessions and resolves them to real people — with verified contact data and company intelligence — before they go dark.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
              {[
                { title: 'Person-Level Identity', desc: 'We resolve sessions to individual people — not just companies. Get name, work email, role, and company.' },
                { title: 'Behavioral Signals', desc: 'Pages viewed, time on site, scroll depth, and repeated visits — all captured and scored for intent.' },
                { title: 'Real-Time Routing', desc: 'Identified visitors are pushed to your CRM, ESP, or outbound sequence within minutes of identification.' },
                { title: 'Match Rate Optimization', desc: 'Continuous improvements to our identity graph improve match rates over time for your specific traffic mix.' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '24px' }}>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '28px', marginBottom: '40px' }}>
              <p style={{ color: '#4a6a9a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Typical Results</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[['20–40%', 'of anonymous traffic identified'], ['&lt;15min', 'pixel install time'], ['Real-time', 'CRM delivery']].map(([val, label], i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <p style={{ color: '#B1001A', fontWeight: 900, fontSize: '28px', letterSpacing: '-1px', marginBottom: '4px' }} dangerouslySetInnerHTML={{ __html: val }} />
                    <p style={{ color: S.muted, fontSize: '12px' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'High Intent Data' && (
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#042016', border: '1px solid #063524', borderRadius: '100px', padding: '6px 14px', marginBottom: '20px' }}>
                <Zap size={14} style={{ color: '#22c55e' }} />
                <span style={{ color: S.mutedGreen, fontSize: '12px', fontWeight: 600 }}>High Intent Data</span>
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px' }}>Reach In-Market Buyers Before Your Competitors.</h2>
              <p style={{ color: S.muted, fontSize: '16px', lineHeight: 1.7 }}>Ark Data monitors 10,000+ data sources to identify individuals actively researching your solution category. Get daily feeds of in-market buyers with verified contact data — ready for outbound sequences.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
              {[
                { title: 'Off-Site Research Signals', desc: 'We track research activity across content sites, review platforms, comparison tools, and industry publications.' },
                { title: 'Individual-Level Data', desc: 'Intent matched to individuals — not just accounts. Know exactly who on the buying committee is active.' },
                { title: 'Competitor Tracking', desc: 'See when prospects are researching competitor solutions and get notified before they make a decision.' },
                { title: 'Daily Refresh', desc: 'Intent feeds updated daily. Your SDR queue always reflects who is in-market right now, not last month.' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#042016', border: '1px solid #063524', borderRadius: '10px', padding: '24px' }}>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: S.mutedGreen, fontSize: '13px', lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Enrichment Engine' && (
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px' }}>120+ Fields. Always Clean. Always Current.</h2>
            <p style={{ color: S.muted, fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>Every record enriched with firmographic, technographic, and contact data. Deduplication, validation, and normalization built in — so your CRM stays clean without manual work.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {[
                { category: 'Company Data', fields: ['Company name & domain', 'Industry & sub-industry', 'Headcount band', 'Revenue range', 'HQ location & region', 'Funding stage & investors'] },
                { category: 'Contact Data', fields: ['Full name & job title', 'Work email (validated)', 'Direct phone number', 'LinkedIn profile URL', 'Seniority & department', 'Decision-maker flag'] },
                { category: 'Technology', fields: ['CRM & marketing stack', 'Analytics & ad platforms', 'Ecommerce platform', 'Infrastructure & cloud', 'Security tools', 'Communication tools'] },
                { category: 'Intent & Behavior', fields: ['In-market intent score', 'Research topics', 'Competitor activity', 'Content engagement', 'On-site behavior', 'Historical signals'] },
              ].map((cat, i) => (
                <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '24px' }}>
                  <p style={{ color: '#4a6a9a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>{cat.category}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {cat.fields.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={12} style={{ color: '#22c55e', flexShrink: 0 }} />
                        <span style={{ color: S.muted, fontSize: '13px' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Delivery & Integrations' && (
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px' }}>Deliver Data Where Your Team Works.</h2>
            <p style={{ color: S.muted, fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>Enriched, scored leads delivered directly to your CRM, ESP, ad platforms, or custom endpoints. Real-time or batch — you choose.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '40px' }}>
              {[
                { name: 'Salesforce', type: 'CRM' },
                { name: 'HubSpot', type: 'CRM' },
                { name: 'Pipedrive', type: 'CRM' },
                { name: 'Klaviyo', type: 'ESP' },
                { name: 'ActiveCampaign', type: 'ESP' },
                { name: 'Mailchimp', type: 'ESP' },
                { name: 'Marketo', type: 'Marketing' },
                { name: 'Google Ads', type: 'Ad Platform' },
                { name: 'Meta Ads', type: 'Ad Platform' },
                { name: 'Zapier', type: 'Automation' },
                { name: 'Webhook / API', type: 'Custom' },
                { name: 'CSV Export', type: 'Manual' },
              ].map((int, i) => (
                <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '8px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{int.name}</span>
                  <span style={{ background: '#0A2142', color: S.muted, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>{int.type}</span>
                </div>
              ))}
            </div>
            <Link to={createPageUrl('Integrations')}>
              <button className="ark-btn-blue" style={{ padding: '12px 24px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                View All Integrations <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: '80px', background: 'linear-gradient(135deg, #06162A 0%, #000002 50%, #042016 100%)', border: '1px solid #0A2142', borderRadius: '16px', padding: '56px', textAlign: 'center' }}>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-1px', marginBottom: '12px' }}>See It In Action.</h2>
          <p style={{ color: S.muted, fontSize: '15px', marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px' }}>Book a 30-minute walkthrough and see how Ark Data fits into your stack.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '14px 32px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Book a Call <ArrowRight size={15} />
              </button>
            </Link>
            <Link to={createPageUrl('Pricing')}>
              <button className="ark-btn-blue" style={{ padding: '14px 32px', fontSize: '15px' }}>View Pricing</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}