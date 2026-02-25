import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight } from 'lucide-react';
import ParticleCanvas from '../components/home/ParticleCanvas';
import { PipelineGrowthChart, ReplyRateChart, ROIOverTimeChart } from '../components/charts/RevenueCharts';

const S = {
  red: '#B1001A',
  blue: '#06162A',
  blueMid: '#0A2142',
  green: '#042016',
  greenMid: '#063524',
  white: '#FFFFFF',
  muted: '#D9ECFF',
  mutedGreen: '#DFFFEF',
};

function useCountUp(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
}

function MetricsPanel() {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const sessions = useCountUp(14982, 1600, started);
  const identified = useCountUp(5975, 1600, started);
  const highIntent = useCountUp(3201, 1600, started);
  const conversions = useCountUp(1271, 1600, started);
  const fmt = (n) => n.toLocaleString();

  return (
    <div ref={ref} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 40px rgba(10,33,66,0.6)' }}>
      <div style={{ background: '#020D1F', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #0A2142' }}>
        <span style={{ color: S.muted, fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ark Data Intelligence</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '11px', fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />LIVE
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {[
          { label: 'Total Sessions', val: fmt(sessions), delta: '+12%' },
          { label: 'Identified', val: fmt(identified), delta: '+15%' },
          { label: 'High Intent', val: fmt(highIntent), delta: '+8%' },
          { label: 'Conversions', val: fmt(conversions), delta: '+5%' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '20px', borderRight: i % 2 === 0 ? '1px solid #0A2142' : 'none', borderBottom: i < 2 ? '1px solid #0A2142' : 'none' }}>
            <p style={{ color: S.muted, fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{s.label}</p>
            <p style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px' }}>{s.val}</p>
            <p style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600 }}>↑ {s.delta} this week</p>
          </div>
        ))}
      </div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #0A2142' }}>
        <p style={{ color: S.muted, fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Daily Intent Trend</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '40px' }}>
          {[60,72,58,80,90,75,88,94,70,85,92,78,88,96,82,90,88,95,80,92,98,84,90,96].map((h, i) => (
            <div key={i} style={{ flex: 1, background: i > 18 ? '#1a5ca8' : '#063524', height: `${h}%`, borderRadius: '2px 2px 0 0', minWidth: '4px' }} />
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <p style={{ color: S.muted, fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Recent Identifications</p>
        {[
          { company: 'Meridian Financial', intent: 'High', color: '#B1001A' },
          { company: 'Apex Logistics Group', intent: 'High', color: '#B1001A' },
          { company: 'Nexus Software Co.', intent: 'Medium', color: '#1a5ca8' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid #0A2142' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 500 }}>{r.company}</span>
            </div>
            <span style={{ background: r.color + '22', border: `1px solid ${r.color}44`, color: r.color, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>{r.intent}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}

const painPoints = [
  { title: 'Anonymous Traffic', desc: 'Up to 97% of visitors never fill a form. Their intent disappears without a trace.' },
  { title: 'Incomplete CRM Records', desc: 'Missing firmographics, wrong contacts, stale data — your reps are flying blind.' },
  { title: 'Low-Quality Lists', desc: 'Scraped data with no intent signals wastes SDR hours and burns domain reputation.' },
  { title: 'Wasted Ad Spend', desc: 'Retargeting anonymous audiences with no context kills ROAS and CPL efficiency.' },
  { title: 'SDR Burnout', desc: "When reps can't prioritize by intent, they work harder with diminishing results." },
];

const features = [
  { title: 'Real-Time Enrichment', desc: 'Enrich visitor sessions and CRM records with firmographic, technographic, and contact data as signals emerge.' },
  { title: 'Intent Signals & Scoring', desc: 'AI-scored intent across 10,000+ data points. Know who is in-market before your competitors do.' },
  { title: 'Firmographic + Technographic', desc: 'Industry, headcount, revenue band, tech stack, HQ location, decision-maker roles — all enriched automatically.' },
  { title: 'CRM & Platform Delivery', desc: 'Push enriched, scored data directly to Salesforce, HubSpot, Klaviyo, ad platforms, or custom webhooks.' },
  { title: 'Data Quality Controls', desc: 'Validation, deduplication, bounce suppression, and normalization on every record before delivery.' },
  { title: 'Compliance & Governance', desc: 'Designed to support GDPR, CCPA, and enterprise data governance requirements. DPA available.' },
  { title: 'Custom Segments', desc: 'Build audience segments by industry, intent category, tech stack, or any combination of attributes.' },
  { title: 'API + Batch Delivery', desc: 'Flexible delivery: real-time API, batch CSV export, or direct CRM/ESP integration.' },
  { title: 'Deduplication + Normalization', desc: 'Every record cleaned, standardized, and deduplicated before it hits your stack.' },
];

const faqs = [
  { q: 'What is high-intent data?', a: 'High-intent data identifies businesses or individuals showing active buying signals — researching solutions, visiting competitor sites, downloading guides, or engaging with in-category content. It tells you who is ready to buy now.' },
  { q: 'How is Lost Traffic recovered?', a: 'Our pixel captures anonymous sessions and cross-references them against our identity graph. We resolve visitor identity, enrich with firmographic and contact data, and deliver actionable leads to your CRM in real time.' },
  { q: 'What CRMs do you integrate with?', a: 'We integrate natively with Salesforce, HubSpot, Pipedrive, Klaviyo, ActiveCampaign, Mailchimp, Marketo, and any platform supporting webhook or API delivery.' },
  { q: 'What match rates can I expect?', a: 'Match rates vary by traffic mix and industry, but most clients see 20–40% of anonymous traffic resolved to company-level, with 10–20% resolved to individual contact level.' },
  { q: 'How do you handle compliance?', a: 'Ark Data is designed to support GDPR, CCPA, and major privacy frameworks. We operate with privacy-first data handling, offer DPAs, and support vendor security reviews.' },
  { q: 'What is the onboarding timeline?', a: 'Most clients are fully live in under 1 week. Pixel installation takes 15 minutes. CRM integration and field mapping typically takes 2–3 hours with our team.' },
];

const results = [
  { metric: '+31%', label: 'Qualified Meetings', who: 'B2B SaaS, Mid-Market' },
  { metric: '-18%', label: 'Cost Per Lead', who: 'Demand Gen, Enterprise' },
  { metric: '+22%', label: 'Reply Rate', who: 'SDR Outbound, SMB' },
  { metric: '4.2×', label: 'Pipeline Attribution', who: 'RevOps, Growth Stage' },
];

export default function Home() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div style={{ background: '#000002', color: '#fff' }}>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #000002 0%, #020D1F 50%, #000D08 100%)' }}>
        <ParticleCanvas />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(10,33,66,0.25) 0%, transparent 60%)' }} />
        <div className="sc sp" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#042016', border: '1px solid #063524', borderRadius: '100px', padding: '6px 14px', marginBottom: '28px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 600 }}>High-Intent Data & Lost Traffic Recovery</span>
              </div>
              <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 58px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '24px', color: '#fff' }}>
                High-Intent Data<br />That <span style={{ color: '#B1001A' }}>Converts.</span>
              </h1>
              <p style={{ color: S.muted, fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.7, marginBottom: '32px', maxWidth: '480px' }}>
                Ark Data turns unknown traffic into actionable identities and delivers intent-rich data to your CRM, sales team, and ad platforms — compliance-first, always.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <Link to={createPageUrl('BookADemo')}>
                  <button className="ark-btn-red" style={{ padding: '14px 28px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Book a Call <ArrowRight size={16} />
                  </button>
                </Link>
                <Link to={createPageUrl('Pricing')}>
                  <button className="ark-btn-blue" style={{ padding: '14px 28px', fontSize: '16px' }}>View Pricing</button>
                </Link>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '32px' }}>
                {['Fast onboarding', 'Compliance-first', 'Built for RevOps + Growth'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                    <span style={{ color: S.muted, fontSize: '13px' }}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '20px', borderTop: '1px solid #0A2142' }}>
                <div><p style={{ color: '#fff', fontWeight: 800, fontSize: '22px' }}>10M+</p><p style={{ color: S.muted, fontSize: '12px' }}>Records enriched/mo</p></div>
                <div><p style={{ color: '#fff', fontWeight: 800, fontSize: '22px' }}>95%</p><p style={{ color: S.muted, fontSize: '12px' }}>Match accuracy</p></div>
                <div><p style={{ color: '#fff', fontWeight: 800, fontSize: '22px' }}>&lt;15min</p><p style={{ color: S.muted, fontSize: '12px' }}>Pixel install</p></div>
              </div>
            </div>
            <div><MetricsPanel /></div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '24px', zIndex: 2 }}>
          {[['How It Works', 'HowItWorks'], ['Pricing', 'Pricing'], ['Security', 'Security']].map(([label, page]) => (
            <Link key={page} to={createPageUrl(page)} className="ark-link" style={{ color: S.muted, fontSize: '12px', fontWeight: 500 }}>{label} →</Link>
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ background: '#06162A', borderTop: '1px solid #0A2142', borderBottom: '1px solid #0A2142', padding: '24px 0' }}>
        <div className="sc">
          <p style={{ color: S.muted, fontSize: '12px', fontWeight: 600, textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>Trusted by revenue teams at</p>
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {['Meridian Financial', 'Apex Logistics', 'Nexus SaaS', 'Vantage Health', 'Stratum Capital', 'CoreBridge Agency'].map(name => (
              <span key={name} style={{ color: '#4a7aaa', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>The Problem</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px' }}>Your Best Leads Are Invisible.</h2>
            <p style={{ color: S.muted, fontSize: '17px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.65 }}>
              95–98% of visitors never identify themselves. Most data tools show you what happened — Ark Data shows you <em>who</em> and <em>why</em>.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {painPoints.map((p, i) => (
              <div key={i} className="ark-card" style={{ padding: '28px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0A2142', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <span style={{ color: '#B1001A', fontWeight: 900, fontSize: '15px' }}>✕</span>
                </div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{p.title}</h3>
                <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TWO PILLARS */}
      <section className="sp" style={{ background: '#020D1F' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Two Powerful Engines</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px' }}>One Goal: More Revenue.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #0A2142, #1a5ca8)' }} />
              <div style={{ width: '48px', height: '48px', background: '#0A2142', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '22px' }}>🔍</div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '12px', letterSpacing: '-0.5px' }}>Lost Traffic Recovery</h3>
              <p style={{ color: S.muted, fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>Convert anonymous website visitors into verified identities with company data, contact info, and behavioral signals. Route them to your CRM before they go dark.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Real person identification (not just company)', 'Verified contact data + work email', 'Intent signals from on-site behavior', 'Real-time CRM + ESP routing'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle size={15} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ color: S.muted, fontSize: '13px' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to={createPageUrl('Services')}><button className="ark-btn-blue" style={{ padding: '10px 20px', fontSize: '13px' }}>Learn More →</button></Link>
            </div>
            <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '12px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #063524, #0a6640)' }} />
              <div style={{ width: '48px', height: '48px', background: '#063524', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '22px' }}>⚡</div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '12px', letterSpacing: '-0.5px' }}>High Intent Data</h3>
              <p style={{ color: '#DFFFEF', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>Access verified individuals actively researching your solution category across the web. Know who is in-market today, what they're evaluating, and reach them first.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Off-site research signals across 10k+ topics', 'Individual-level (not account-level) data', 'Daily refresh of in-market intent signals', 'Competitor + vendor comparison tracking'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle size={15} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ color: '#DFFFEF', fontSize: '13px' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to={createPageUrl('Services')}><button className="ark-btn-green" style={{ padding: '10px 20px', fontSize: '13px' }}>Learn More →</button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Platform Capabilities</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px' }}>Command-Center Grade Data Infrastructure</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {features.map((f, i) => (
              <div key={i} className={i % 2 === 0 ? 'ark-card' : 'ark-card-green'} style={{ padding: '28px' }}>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ color: i % 2 === 0 ? S.muted : '#DFFFEF', fontSize: '13px', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS STRIP */}
      <section style={{ background: '#06162A', borderTop: '1px solid #0A2142', borderBottom: '1px solid #0A2142', padding: '60px 0' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 900, letterSpacing: '-0.5px' }}>Real Results from Revenue Teams</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2px', marginBottom: '48px' }}>
            {results.map((r, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '32px 24px', borderRight: i < results.length - 1 ? '1px solid #0A2142' : 'none' }}>
                <p style={{ color: '#B1001A', fontSize: '44px', fontWeight: 900, letterSpacing: '-2px', marginBottom: '6px' }}>{r.metric}</p>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{r.label}</p>
                <p style={{ color: S.muted, fontSize: '12px' }}>{r.who}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <PipelineGrowthChart />
            <ReplyRateChart />
            <ROIOverTimeChart />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Simple Deployment</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>Go Live in Minutes. See Results Today.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { num: '01', title: 'Connect Sources', desc: 'Install our lightweight pixel on your site in 15 minutes. No complex setup.', time: '15 min' },
              { num: '02', title: 'Capture & Enrich', desc: 'We identify sessions, enrich with firmographic and intent data in real time.', time: 'Ongoing' },
              { num: '03', title: 'Score & Segment', desc: 'AI scores leads by intent, fit, and buying stage. Segments built automatically.', time: 'Real-time' },
              { num: '04', title: 'Activate', desc: 'Leads flow to your CRM, ad platforms, or outbound sequences automatically.', time: 'Instant' },
            ].map((step, i) => (
              <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '10px', padding: '32px' }}>
                <div style={{ color: '#1a4a8a', fontSize: '36px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>{step.num}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '16px', marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.65, marginBottom: '16px' }}>{step.desc}</p>
                <span style={{ background: '#042016', border: '1px solid #063524', borderRadius: '100px', padding: '3px 10px', color: '#DFFFEF', fontSize: '11px', fontWeight: 600 }}>{step.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section style={{ background: '#000002', borderTop: '1px solid #0A2142', padding: '60px 0' }}>
        <div className="sc" style={{ textAlign: 'center' }}>
          <p style={{ color: S.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>Integrates with your entire stack</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
            {['Salesforce', 'HubSpot', 'Klaviyo', 'Marketo', 'Pipedrive', 'ActiveCampaign', 'Zapier', 'Segment', 'Slack', 'Webhooks API'].map(name => (
              <span key={name} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '6px', padding: '8px 16px', color: S.muted, fontSize: '13px', fontWeight: 600 }}>{name}</span>
            ))}
          </div>
          <Link to={createPageUrl('Integrations')}><button className="ark-btn-blue" style={{ padding: '10px 24px', fontSize: '13px' }}>View all integrations →</button></Link>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="sp" style={{ background: '#020D1F', borderTop: '1px solid #0A2142' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Pricing</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>Pricing That Scales With You.</h2>
            <p style={{ color: S.muted, fontSize: '16px', maxWidth: '440px', margin: '0 auto' }}>Productized packages with clear value. No hidden fees. Custom available for enterprise.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {[
              { name: 'Starter', price: '$499', desc: 'Small teams & startups', features: ['Up to 5k enrichments/mo', 'Lost Traffic pixel', 'CSV + 1 CRM integration', 'Email support'] },
              { name: 'Growth', price: '$1,499', desc: 'Mid-market revenue teams', features: ['Up to 25k enrichments/mo', 'Lost Traffic + High Intent', 'All CRM integrations', 'API access', 'Dedicated CSM'], highlight: true },
              { name: 'Scale', price: '$3,999', desc: 'High-volume operators', features: ['Up to 100k enrichments/mo', 'Custom segments', 'Priority data refresh', 'SLA guarantee', 'Analyst support'] },
            ].map((plan, i) => (
              <div key={i} style={{ background: plan.highlight ? '#06162A' : '#000002', border: `1px solid ${plan.highlight ? '#1a5ca8' : '#0A2142'}`, borderRadius: '10px', padding: '32px', position: 'relative', boxShadow: plan.highlight ? '0 0 24px rgba(26,92,168,0.2)' : 'none' }}>
                {plan.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#B1001A', borderRadius: '100px', padding: '3px 14px', fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>Most Popular</div>}
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>{plan.name}</h3>
                <p style={{ color: S.muted, fontSize: '12px', marginBottom: '16px' }}>{plan.desc}</p>
                <p style={{ color: '#fff', fontWeight: 900, fontSize: '36px', letterSpacing: '-1.5px', marginBottom: '20px' }}>{plan.price}<span style={{ color: S.muted, fontSize: '14px', fontWeight: 400 }}>/mo</span></p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {plan.features.map(f => <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: S.muted, fontSize: '13px' }}><CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />{f}</li>)}
                </ul>
                <Link to={createPageUrl('BookADemo')}><button className={plan.highlight ? 'ark-btn-red' : 'ark-btn-blue'} style={{ width: '100%', padding: '12px', fontSize: '14px' }}>Get Started</button></Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link to={createPageUrl('Pricing')} style={{ color: '#D9ECFF', fontSize: '14px', fontWeight: 600 }}>See full pricing + Package Recommendation Checker →</Link>
          </div>
        </div>
      </section>

      {/* FAQ TEASER */}
      <section className="sp" style={{ background: '#000002', borderTop: '1px solid #0A2142' }}>
        <div className="sc" style={{ maxWidth: '760px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1px' }}>Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', gap: '16px' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{faq.q}</span>
                  <span style={{ color: '#B1001A', flexShrink: 0, fontSize: '18px', transition: 'transform 0.2s', transform: expandedFaq === i ? 'rotate(180deg)' : 'none' }}>▼</span>
                </button>
                {expandedFaq === i && (
                  <div style={{ padding: '0 24px 20px', borderTop: '1px solid #0A2142' }}>
                    <p style={{ color: S.muted, fontSize: '14px', lineHeight: 1.7, paddingTop: '16px' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link to={createPageUrl('FAQ')} style={{ color: '#D9ECFF', fontSize: '14px', fontWeight: 600 }}>View all FAQs →</Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 40%, #042016 100%)', borderTop: '1px solid #0A2142', padding: '80px 0' }}>
        <div className="sc" style={{ textAlign: 'center' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>Ready to Activate?</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.1 }}>
            Turn Lost Traffic Into<br />Revenue — Starting Now.
          </h2>
          <p style={{ color: S.muted, fontSize: '18px', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.65 }}>Get a personalized walkthrough and see how Ark Data fits into your stack.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '16px 36px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>Book a Call <ArrowRight size={16} /></button>
            </Link>
            <Link to={createPageUrl('Pricing')}>
              <button className="ark-btn-green" style={{ padding: '16px 36px', fontSize: '16px' }}>Get a Package Recommendation</button>
            </Link>
          </div>
          <p style={{ color: S.muted, fontSize: '12px', marginTop: '20px' }}>We respond within 1 business day · Compliance-first</p>
        </div>
      </section>
    </div>
  );
}