import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const plans = [
  {
    name: 'Starter',
    price: 499,
    desc: 'Small teams & startups',
    size: '1–50 employees',
    volume: 'Up to 5,000 enrichments/mo',
    features: ['Lost Traffic pixel (5k sessions)', 'Firmographic enrichment', 'CSV delivery', '1 CRM integration', 'Email support', '5-day match SLA'],
    datasets: ['Lost Traffic', 'Firmographics'],
    delivery: ['CSV'],
    support: 'Email',
    sla: 'Standard',
  },
  {
    name: 'Growth',
    price: 1499,
    desc: 'Mid-market revenue teams',
    size: '51–500 employees',
    volume: 'Up to 25,000 enrichments/mo',
    features: ['Lost Traffic + High Intent', 'Firmographic + Technographic', 'All CRM integrations', 'API access', 'Custom segments (basic)', 'Dedicated CSM', '2-day match SLA'],
    datasets: ['Lost Traffic', 'High Intent', 'Firmographics', 'Technographics'],
    delivery: ['CSV', 'API', 'CRM'],
    support: 'CSM + Slack',
    sla: 'Priority',
    highlight: true,
  },
  {
    name: 'Scale',
    price: 3999,
    desc: 'High-volume operators',
    size: '201–1,000 employees',
    volume: 'Up to 100,000 enrichments/mo',
    features: ['Everything in Growth', 'Advanced custom segments', 'Daily intent refresh', 'Ad platform audiences', 'Analyst support', 'SLA guarantee', '1-day match SLA'],
    datasets: ['Lost Traffic', 'High Intent', 'Custom Segments', 'Ad Audiences'],
    delivery: ['CSV', 'API', 'CRM', 'Ad Platforms'],
    support: 'Analyst + Priority',
    sla: 'Guaranteed',
  },
  {
    name: 'Enterprise',
    price: null,
    desc: 'Custom for complex orgs',
    size: '1,000+ employees',
    volume: 'Unlimited / custom contract',
    features: ['Everything in Scale', 'Custom data contracts', 'Data residency options', 'DPA + compliance review', 'Dedicated analyst team', 'Executive SLA', 'White-glove onboarding'],
    datasets: ['All datasets + custom'],
    delivery: ['All methods + custom'],
    support: 'Dedicated team',
    sla: 'Executive',
  },
];

const addons = [
  { name: 'Extra Intent Categories', price: '$299/mo', desc: 'Add up to 5 additional custom intent topic categories beyond your plan default.' },
  { name: 'Higher Frequency Refresh', price: '$499/mo', desc: 'Upgrade to hourly intent signal refresh for real-time in-market detection.' },
  { name: 'Dedicated Analyst', price: '$1,200/mo', desc: 'A dedicated data analyst to build segments, audit records, and optimize delivery.' },
  { name: 'Custom Segment Build', price: '$799 one-time', desc: 'We build a fully custom audience segment based on your ICP and intent signals.' },
  { name: 'List Quality Audit', price: '$499 one-time', desc: 'Submit your outreach list — we score, clean, enrich, and return it prioritized.' },
];

const industries = ['B2B SaaS', 'Healthcare', 'Financial Services', 'E-commerce', 'Logistics', 'Marketing Agency', 'Manufacturing', 'Home Services', 'Other'];
const useCases = ['Outbound SDR', 'Account-Based Marketing', 'Paid Ads / ROAS', 'RevOps / Data Ops', 'E-commerce Retention', 'Agency Client Services'];
const goals = ['Pipeline Generation', 'Lower CPL / Better ROAS', 'Lead Quality Improvement', 'CRM Enrichment', 'Conversion Rate Uplift'];
const deliveryPrefs = ['CSV Export', 'API', 'CRM Integration', 'Ad Platform Sync', 'All of the above'];

function RecommenderWidget() {
  const [form, setForm] = useState({ size: '', industry: '', useCase: '', volume: 10000, delivery: '', goal: '' });
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const getRecommendation = () => {
    const { size, useCase, volume, goal } = form;
    let plan = 'Growth';
    let reasons = [];

    if (volume < 5000 || size === '1–10') { plan = 'Starter'; reasons = ['Your monthly volume fits the Starter tier', 'Small team focused on quick pipeline wins', 'Low-cost entry with clear upgrade path']; }
    else if (volume > 50000 || size === '1,000+') { plan = 'Scale'; reasons = ['Your volume requires Scale-tier capacity', 'Complex activation needs (API + ad platforms)', 'Frequent refresh critical for your use case']; }
    else if (size === '1,000+' && (useCase === 'RevOps / Data Ops' || goal === 'CRM Enrichment')) { plan = 'Enterprise'; reasons = ['Enterprise-grade governance requirements', 'Custom data contracts and DPA needed', 'Dedicated analyst support required']; }
    else { reasons = ['Your volume fits Growth perfectly', `${useCase || 'Your use case'} + daily refresh`, 'API + CSM support included']; }

    const addOnsRec = [];
    if (useCase === 'Paid Ads / ROAS') addOnsRec.push('Ad Platform Audiences');
    if (volume > 20000) addOnsRec.push('Higher Frequency Refresh');
    if (goal === 'CRM Enrichment') addOnsRec.push('CRM Enrichment Workflow');

    setResult({ plan, reasons, addOnsRec });
  };

  const planDetails = { Starter: { price: '$499/mo', features: ['Up to 5k enrichments', 'Lost Traffic pixel', '1 CRM integration', 'Email support'] }, Growth: { price: '$1,499/mo', features: ['Up to 25k enrichments', 'Lost Traffic + High Intent', 'All CRM + API', 'CSM + Slack'] }, Scale: { price: '$3,999/mo', features: ['Up to 100k enrichments', 'Custom segments', 'Ad platform sync', 'Analyst support'] }, Enterprise: { price: 'Custom', features: ['Unlimited enrichments', 'DPA + compliance', 'Custom data contracts', 'Dedicated team'] } };

  return (
    <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ background: '#020D1F', padding: '24px 32px', borderBottom: '1px solid #0A2142' }}>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '20px', marginBottom: '6px' }}>Package Recommendation Checker</h2>
        <p style={{ color: S.muted, fontSize: '13px' }}>Answer 6 questions — get an instant recommendation.</p>
      </div>
      <div style={{ padding: '32px' }}>
        {!result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Company Size</label>
                <select className="ark-select" value={form.size} onChange={e => set('size', e.target.value)}>
                  <option value="">Select size</option>
                  {['1–10', '11–50', '51–200', '201–1,000', '1,000+'].map(s => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Industry</label>
                <select className="ark-select" value={form.industry} onChange={e => set('industry', e.target.value)}>
                  <option value="">Select industry</option>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Primary Use Case</label>
                <select className="ark-select" value={form.useCase} onChange={e => set('useCase', e.target.value)}>
                  <option value="">Select use case</option>
                  {useCases.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Data Delivery Preference</label>
                <select className="ark-select" value={form.delivery} onChange={e => set('delivery', e.target.value)}>
                  <option value="">Select delivery</option>
                  {deliveryPrefs.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Primary Goal</label>
                <select className="ark-select" value={form.goal} onChange={e => set('goal', e.target.value)}>
                  <option value="">Select goal</option>
                  {goals.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Monthly Volume Needed: <span style={{ color: '#fff', fontWeight: 800 }}>{form.volume.toLocaleString()}</span></label>
                <input type="range" min="1000" max="200000" step="1000" value={form.volume} onChange={e => set('volume', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#B1001A', height: '4px', background: '#0A2142', borderRadius: '4px', outline: 'none', cursor: 'pointer', marginTop: '12px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ color: S.muted, fontSize: '10px' }}>1,000</span>
                  <span style={{ color: S.muted, fontSize: '10px' }}>200,000+</span>
                </div>
              </div>
            </div>
            <button onClick={getRecommendation} className="ark-btn-red" style={{ padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Get My Recommendation <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div>
            <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '10px', padding: '28px', marginBottom: '20px', textAlign: 'center' }}>
              <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Recommended Plan</p>
              <p style={{ color: '#fff', fontWeight: 900, fontSize: '40px', letterSpacing: '-1.5px', marginBottom: '6px' }}>{result.plan}</p>
              <p style={{ color: '#22c55e', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>{planDetails[result.plan]?.price}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', marginBottom: '20px' }}>
                {result.reasons.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ color: '#DFFFEF', fontSize: '13px' }}>{r}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '8px', padding: '16px', textAlign: 'left', marginBottom: '20px' }}>
                <p style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>What You Get</p>
                {planDetails[result.plan]?.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <CheckCircle size={12} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: S.muted, fontSize: '12px' }}>{f}</span>
                  </div>
                ))}
              </div>
              {result.addOnsRec.length > 0 && (
                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                  <p style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Suggested Add-ons</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.addOnsRec.map(a => <span key={a} style={{ background: '#0A2142', border: '1px solid #1a4a8a', borderRadius: '100px', padding: '4px 12px', color: S.muted, fontSize: '12px', fontWeight: 600 }}>{a}</span>)}
                  </div>
                </div>
              )}
              <p style={{ color: S.muted, fontSize: '11px', marginBottom: '20px', fontStyle: 'italic' }}>Recommendation is directional; confirm with our team.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to={createPageUrl('BookADemo')} style={{ flex: 1 }}>
                  <button className="ark-btn-red" style={{ width: '100%', padding: '12px', fontSize: '14px' }}>Book a Call</button>
                </Link>
                <button onClick={() => setResult(null)} className="ark-btn-blue" style={{ flex: 1, padding: '12px', fontSize: '14px' }}>Start Over</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Pricing() {
  const [billing, setBilling] = useState('monthly');
  const [activePlan, setActivePlan] = useState(null);

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Pricing</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>
            Transparent Pricing. Clear Value.
          </h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 28px' }}>
            Productized packages with no hidden fees. Pay for outcomes, not overhead.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#06162A', border: '1px solid #0A2142', borderRadius: '8px', padding: '4px' }}>
            {[['monthly', 'Monthly'], ['annual', 'Annual (Save 20%)']].map(([val, label]) => (
              <button key={val} onClick={() => setBilling(val)}
                style={{ padding: '8px 20px', borderRadius: '6px', background: billing === val ? '#0A2142' : 'none', border: 'none', color: billing === val ? '#fff' : S.muted, fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '48px' }}>
            {plans.map((plan, i) => {
              const price = plan.price ? (billing === 'annual' ? Math.floor(plan.price * 0.8) : plan.price) : null;
              return (
                <div key={i} style={{ background: plan.highlight ? '#06162A' : '#020D1F', border: `1px solid ${plan.highlight ? '#1a5ca8' : '#0A2142'}`, borderRadius: '12px', padding: '32px', position: 'relative', boxShadow: plan.highlight ? '0 0 32px rgba(26,92,168,0.2)' : 'none' }}>
                  {plan.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#B1001A', borderRadius: '100px', padding: '3px 14px', fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>Most Popular</div>}
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '20px', marginBottom: '4px' }}>{plan.name}</h3>
                  <p style={{ color: S.muted, fontSize: '12px', marginBottom: '4px' }}>{plan.size}</p>
                  <p style={{ color: '#DFFFEF', fontSize: '11px', marginBottom: '16px', fontWeight: 600 }}>{plan.volume}</p>
                  <div style={{ marginBottom: '24px' }}>
                    {price ? (
                      <>
                        <span style={{ color: '#fff', fontWeight: 900, fontSize: '40px', letterSpacing: '-1.5px' }}>${price.toLocaleString()}</span>
                        <span style={{ color: S.muted, fontSize: '14px' }}>/mo</span>
                        {billing === 'annual' && <p style={{ color: '#22c55e', fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>Billed annually</p>}
                      </>
                    ) : (
                      <span style={{ color: '#fff', fontWeight: 900, fontSize: '32px', letterSpacing: '-1px' }}>Custom</span>
                    )}
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: S.muted, fontSize: '13px' }}>
                        <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />{f}
                      </li>
                    ))}
                  </ul>
                  <Link to={createPageUrl('BookADemo')}>
                    <button className={plan.highlight ? 'ark-btn-red' : 'ark-btn-blue'} style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
                      {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Add-ons */}
          <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', padding: '40px', marginBottom: '60px' }}>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '20px', marginBottom: '6px' }}>Add-ons</h2>
            <p style={{ color: S.muted, fontSize: '13px', marginBottom: '28px' }}>Extend any plan with premium capabilities.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {addons.map((a, i) => (
                <div key={i} style={{ background: '#020D1F', border: '1px solid #0A2142', borderRadius: '8px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{a.name}</h4>
                    <span style={{ color: '#B1001A', fontWeight: 800, fontSize: '13px', flexShrink: 0, marginLeft: '8px' }}>{a.price}</span>
                  </div>
                  <p style={{ color: S.muted, fontSize: '12px', lineHeight: 1.6 }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation widget */}
          <RecommenderWidget />
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#06162A', borderTop: '1px solid #0A2142', padding: '60px 0' }}>
        <div className="sc" style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 900, fontSize: '28px', letterSpacing: '-0.8px', marginBottom: '12px' }}>Ready to get started?</h2>
          <p style={{ color: S.muted, fontSize: '15px', marginBottom: '28px' }}>Book a call and we'll confirm the right package for your team.</p>
          <Link to={createPageUrl('BookADemo')}>
            <button className="ark-btn-red" style={{ padding: '14px 36px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Book a Call <ArrowRight size={16} />
            </button>
          </Link>
          <p style={{ color: S.muted, fontSize: '11px', marginTop: '12px' }}>We respond within 1 business day · Compliance-first</p>
        </div>
      </section>
    </div>
  );
}