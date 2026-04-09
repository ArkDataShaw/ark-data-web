import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight } from 'lucide-react';
import ParticleCanvas from '../components/home/ParticleCanvas';
import DataPipeline from '../components/home/DataPipeline';

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

function useTypewriter(text, speed = 55, start = false) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!start) return;
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, start]);
  return displayed;
}

function TwoPillarsSection({ S }) {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const typed = useTypewriter('One Goal: More Revenue.', 55, started);

  return (
    <section className="sp" style={{ background: '#020D1F' }}>
      <div className="sc">
        <div style={{ textAlign: 'center', marginBottom: '56px' }} ref={ref}>
          <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Two Powerful Engines</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px', minHeight: '1.2em' }}>
            {typed}<span style={{ opacity: started && typed.length < 'One Goal: More Revenue.'.length ? 1 : 0, borderRight: '2px solid #fff', marginLeft: '2px' }}>&nbsp;</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #0A2142, #1a5ca8)' }} />
            <div style={{ width: '48px', height: '48px', background: '#0A2142', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '22px' }}>🔍</div>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '12px', letterSpacing: '-0.5px' }}>Lost Traffic Recovery</h3>
            <p style={{ color: S.muted, fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>Convert anonymous website visitors into verified identities with company data, contact info, and behavioral signals. Route them to your CRM before they go dark.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Real person identification (not just company)', 'Verified contact data + work email', '11 behavioral event types captured per session', 'Real-time CRM + ESP routing'].map(item => (
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
  );
}



const painPoints = [
  { title: 'Anonymous Traffic', desc: 'Up to 97% of visitors never fill a form. Their intent disappears without a trace.' },
  { title: 'Incomplete CRM Records', desc: 'Missing firmographics, wrong contacts, stale data. Your reps are flying blind.' },
  { title: 'Wasted Outreach', desc: 'Blasting cold lists with no context kills reply rates and burns your sending reputation.' },
  { title: 'SDR Burnout', desc: "When reps don't know who visited or what they looked at, they work harder with diminishing results." },
];

const features = [
  { title: 'Real-Time Enrichment', desc: 'Enrich visitor sessions and CRM records with firmographic and contact data as signals emerge.' },
  { title: 'Behavioral Event Capture', desc: 'Track 11 on-site event types - page views, clicks, form fills, scroll depth, video engagement, exit intent, and more - to understand exactly how visitors interact with your site.' },
  { title: 'Deduplication + Normalization', desc: 'Every record cleaned, standardized, and deduplicated before it hits your stack. No manual data hygiene.' },
  { title: 'CRM & Platform Delivery', desc: 'Push enriched data directly to HubSpot, Klaviyo, Go High Level, and more - or use custom webhooks to connect any platform.' },
  { title: 'Data Quality Controls', desc: 'Validation, deduplication, bounce suppression, and normalization on every record before delivery.' },
  { title: 'Compliance & Governance', desc: 'Built with privacy in mind. Designed to support CCPA and major privacy frameworks with responsible data handling practices.' },
  { title: 'ICP Matching', desc: 'Your ideal customer profile is configured during onboarding, then runs automatically - only qualified visitors matching your criteria get delivered.' },
  { title: 'API + Batch Delivery', desc: 'Flexible delivery: real-time API, batch CSV export, or direct CRM/ESP integration.' },
];

const faqs = [
  { q: 'What is high-intent data?', a: 'High-intent data identifies businesses or individuals showing active buying signals: researching solutions, visiting competitor sites, downloading guides, or engaging with in-category content. It tells you who is ready to buy now.' },
  { q: 'How is Lost Traffic recovered?', a: 'Our pixel captures anonymous sessions and cross-references them against our identity graph - sourced from 40+ licensed data brokers and validated via credit bureau skiptrace. We resolve visitor identity, enrich with 74+ fields of contact and demographic data, and deliver actionable leads to your CRM in real time.' },
  { q: 'What platforms do you integrate with?', a: 'We integrate with Resend, Instantly, Go High Level, Klaviyo, Clay, HubSpot, and HeyReach. Plus any platform via custom HTTP webhook.' },
  { q: 'What match rates can I expect?', a: 'Match rates vary by traffic mix and industry, but most clients see 40–60% of anonymous visitors resolved to verified identities. Roughly 72% of resolved visitors also include company data.' },
  { q: 'How do you handle compliance?', a: 'Ark Data is built with privacy in mind. We follow responsible data handling practices aligned with CCPA and major privacy frameworks.' },
  { q: 'What is the onboarding timeline?', a: 'Most clients are fully live in under 1 week. Pixel installation takes 15 minutes. CRM integration and field mapping typically takes 2–3 hours with our team.' },
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
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#042016', border: '1px solid #063524', borderRadius: '100px', padding: '6px 14px', marginBottom: '28px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 600 }}>High-Intent Data & Lost Traffic Recovery</span>
              </div>
              <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 58px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '24px', color: '#fff' }}>
                High-Intent Data<br />That <span style={{ color: '#B1001A' }}>Converts.</span>
              </h1>
              <p style={{ color: S.muted, fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.7, marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
                Ark Data turns unknown traffic into actionable identities and delivers enriched data to your CRM, sales team, and outbound tools. Built with privacy in mind, always.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px', justifyContent: 'center' }}>
                <Link to={createPageUrl('BookADemo')}>
                  <button className="ark-btn-red" style={{ padding: '14px 28px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Book a Call <ArrowRight size={16} />
                  </button>
                </Link>
                <Link to={createPageUrl('Pricing') + '#pricing-calculator'}>
                  <button className="ark-btn-blue" style={{ padding: '14px 28px', fontSize: '16px' }}>View Pricing</button>
                </Link>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '32px', justifyContent: 'center' }}>
                {['Fast onboarding', 'Compliance-first', 'Built for RevOps + Growth'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                    <span style={{ color: S.muted, fontSize: '13px' }}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '20px', borderTop: '1px solid #0A2142', justifyContent: 'center' }}>
                <div><p style={{ color: '#fff', fontWeight: 800, fontSize: '22px' }}>Up to 60%</p><p style={{ color: S.muted, fontSize: '12px' }}>Match rate</p></div>
                <div><p style={{ color: '#fff', fontWeight: 800, fontSize: '22px' }}>74</p><p style={{ color: S.muted, fontSize: '12px' }}>Enrichment fields</p></div>
                <div><p style={{ color: '#fff', fontWeight: 800, fontSize: '22px' }}>&lt;15min</p><p style={{ color: S.muted, fontSize: '12px' }}>Pixel install</p></div>
              </div>
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
          <p style={{ color: S.muted, fontSize: '12px', fontWeight: 600, textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>Serving revenue teams across</p>
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {['Healthcare', 'Financial Services', 'SaaS', 'Real Estate', 'Insurance', 'Agencies'].map(name => (
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
              95–98% of visitors never identify themselves. Most data tools show you what happened. Ark Data shows you <em>who</em> they are and <em>how to reach them</em>.
            </p>
          </div>
          <div style={{ background: 'linear-gradient(145deg, #03200F 0%, #011508 100%)', border: '1px solid rgba(15,80,45,0.6)', borderRadius: '16px', padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {painPoints.map((p, i) => (
                <div key={i} style={{ padding: '24px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid rgba(15,80,45,0.4)' }}>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{p.title}</h3>
                  <p style={{ color: '#9dcfb5', fontSize: '13px', lineHeight: 1.65 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TWO PILLARS */}
      <TwoPillarsSection S={S} />

      {/* FEATURES GRID */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Platform Capabilities</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px' }}>Everything You Need to Activate Your Data</h2>
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

      {/* DATA PIPELINE - scroll animation */}
      <DataPipeline />

      {/* HOW IT WORKS */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Simple Deployment</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>Go Live in Minutes. See Results Today.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { num: '01', title: 'Install Pixel', desc: 'Drop our lightweight script on your site. Under 2KB, zero performance impact.', time: '15 min' },
              { num: '02', title: 'Identify & Enrich', desc: 'Anonymous sessions resolved to real people. 74 fields appended per record.', time: 'Real-time' },
              { num: '03', title: 'ICP Match', desc: 'Visitors filtered against your ideal customer profile. Only qualified matches move forward.', time: 'Automatic' },
              { num: '04', title: 'Activate', desc: 'Matched visitors sync to your CRM, email sequences, or outbound workflows automatically.', time: 'Always on' },
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', margin: '0 auto 24px', maxWidth: '900px' }}>
            {[
              { name: 'HubSpot', logo: '/logos/hubspot-color.svg', h: 28, invert: false },
              { name: 'Klaviyo', logo: '/logos/klaviyo.svg', h: 22, invert: false },
              { name: 'HighLevel', logo: '/logos/ghl-color.png', h: 26, invert: false },
              { name: 'Instantly', logo: '/logos/instantly.svg', h: 22, invert: false },
              { name: 'Clay', logo: '/logos/clay-dark.png', h: 26, invert: false },
              { name: 'Resend', logo: '/logos/resend.svg', h: 20, invert: false },
              { name: 'HeyReach', logo: '/logos/heyreach.svg', h: 22, invert: false },
            ].map(({ name, logo, h, invert }) => (
              <img key={name} src={logo} alt={name} style={{ height: `${h}px`, objectFit: 'contain', opacity: 0.5, transition: 'opacity 0.2s', ...(invert ? { filter: 'brightness(0) invert(1)' } : {}) }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
              />
            ))}
            <span style={{ color: '#4a6a9a', fontSize: '13px', fontWeight: 600, opacity: 0.6 }}>+ Webhooks</span>
          </div>
          <p style={{ color: '#4a6a9a', fontSize: '12px', marginBottom: '16px' }}>Plus any platform via custom webhook</p>
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
          <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '14px', padding: '48px', textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ color: '#22c55e', fontWeight: 900, fontSize: 'clamp(42px, 5vw, 64px)', letterSpacing: '-2px', marginBottom: '8px' }}>$0 – $900/mo</p>
            <p style={{ color: S.muted, fontSize: '16px', marginBottom: '8px' }}>smooth exponential curve · usage-based · no tiers</p>
            <p style={{ color: '#4a6a9a', fontSize: '13px', marginBottom: '28px' }}>Free through 200 enriched visits. Your cost rises on a smooth curve that flattens as volume grows — never exceeds $900/mo.</p>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
              {[
                { vol: '200', cost: 'FREE' },
                { vol: '1,000', cost: '$117' },
                { vol: '5,000', cost: '$450' },
                { vol: '10,000', cost: '$675' },
              ].map((t, i) => (
                <div key={i} style={{ background: '#0A2142', borderRadius: '8px', padding: '12px 20px', minWidth: '120px' }}>
                  <p style={{ color: t.cost === 'FREE' ? '#22c55e' : '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '2px' }}>{t.cost}</p>
                  <p style={{ color: '#4a6a9a', fontSize: '11px' }}>{t.vol} enriched visits</p>
                </div>
              ))}
            </div>
            <Link to={createPageUrl('Pricing') + '#pricing-calculator'}>
              <button className="ark-btn-green" style={{ padding: '14px 32px', fontSize: '15px' }}>See Full Pricing Calculator →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ENRICHMENT OUTPUT - sample card */}
      <section style={{ background: '#020D1F', paddingBottom: '80px' }}>
        <div className="sc" style={{ maxWidth: '520px' }}>
          <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 40px rgba(10,33,66,0.6)' }}>
            <div style={{ background: '#020D1F', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #0A2142' }}>
              <span style={{ color: S.muted, fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Enrichment Output</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '11px', fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />SAMPLE
              </span>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #0A2142' }}>
                <p style={{ color: '#4a6a9a', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Before</p>
                <p style={{ color: '#4a6a9a', fontSize: '14px', fontStyle: 'italic' }}>Anonymous session from Dallas, TX - 3 pages viewed, 4m 12s on site</p>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <p style={{ color: '#22c55e', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>After Ark Data</p>
                {[
                  ['Name', 'James Thornton'],
                  ['Title', 'VP of Revenue Operations'],
                  ['Company', 'Meridian Growth Partners'],
                  ['Industry', 'Financial Services'],
                  ['Headcount', '150–250'],
                  ['Email', 'j.thornton@m*****n.com'],
                  ['Net Worth', '$500k – $749k'],
                  ['Income Range', '$100k – $149k'],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 7 ? '1px solid rgba(10,33,66,0.6)' : 'none' }}>
                    <span style={{ color: '#4a6a9a', fontSize: '12px' }}>{k}</span>
                    <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', padding: '8px 12px', textAlign: 'center' }}>
                <p style={{ color: '#86efac', fontSize: '11px', fontWeight: 600 }}>74 fields enriched in &lt;60 seconds</p>
              </div>
            </div>
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
            Turn Lost Traffic Into<br />Revenue. Starting Now.
          </h2>
          <p style={{ color: S.muted, fontSize: '18px', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.65 }}>Get a personalized walkthrough and see how Ark Data fits into your stack.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '16px 36px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>Book a Call <ArrowRight size={16} /></button>
            </Link>
            <Link to={createPageUrl('Pricing') + '#pricing-calculator'}>
              <button className="ark-btn-green" style={{ padding: '16px 36px', fontSize: '16px' }}>Get a Package Recommendation</button>
            </Link>
          </div>
          <p style={{ color: S.muted, fontSize: '12px', marginTop: '20px' }}>We respond within 1 business day. Compliance-first.</p>
        </div>
      </section>
    </div>
  );
}