import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle, ArrowRight, X } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF', red: '#B1001A' };

const plans = [
  {
    name: 'Starter',
    price: 499,
    desc: 'For small teams validating the channel.',
    who: 'Startups & early-stage teams',
    features: [
      'Up to 5,000 enrichments/mo',
      'Lost Traffic pixel',
      'CSV export',
      '1 CRM integration',
      'Email support',
      'Standard data refresh (weekly)',
    ],
    notIncluded: ['High Intent data', 'API access', 'Custom segments', 'Dedicated CSM'],
    cta: 'Get Started',
    color: '#0A2142',
  },
  {
    name: 'Growth',
    price: 1499,
    desc: 'For revenue teams scaling outbound and inbound.',
    who: 'Mid-market B2B companies',
    features: [
      'Up to 25,000 enrichments/mo',
      'Lost Traffic + High Intent data',
      'All CRM + ESP integrations',
      'API access',
      'Custom field mapping',
      'Daily data refresh',
      'Dedicated CSM',
      'Slack support channel',
    ],
    notIncluded: ['Custom segment builds', 'SLA guarantee', 'Analyst support'],
    cta: 'Get Started',
    highlight: true,
    color: '#1a5ca8',
  },
  {
    name: 'Scale',
    price: 3999,
    desc: 'For high-volume operators and growth-stage teams.',
    who: 'High-volume B2B + enterprise',
    features: [
      'Up to 100,000 enrichments/mo',
      'Lost Traffic + High Intent data',
      'All integrations + ad platform sync',
      'Custom segment builds',
      'Priority data refresh (real-time)',
      'SLA guarantee',
      'Analyst support',
      'Quarterly business reviews',
    ],
    notIncluded: [],
    cta: 'Get Started',
    color: '#063524',
  },
  {
    name: 'Enterprise',
    price: null,
    desc: 'Custom contracts for complex requirements.',
    who: 'Large enterprise & regulated industries',
    features: [
      'Unlimited enrichments',
      'Custom data model',
      'Dedicated infrastructure',
      'Data residency options',
      'Custom compliance review',
      'DPA + MSA',
      'Executive support',
      'Priority SLA',
    ],
    notIncluded: [],
    cta: 'Contact Us',
    color: '#3d0a0a',
  },
];

const checkerQuestions = [
  {
    id: 'team_size',
    question: 'How large is your revenue team?',
    options: [
      { label: '1–5 people', value: 'tiny' },
      { label: '6–25 people', value: 'small' },
      { label: '26–100 people', value: 'mid' },
      { label: '100+ people', value: 'large' },
    ],
  },
  {
    id: 'monthly_traffic',
    question: 'What is your estimated monthly website traffic?',
    options: [
      { label: 'Under 5,000 visits', value: 'low' },
      { label: '5,000–25,000 visits', value: 'mid' },
      { label: '25,000–100,000 visits', value: 'high' },
      { label: '100,000+ visits', value: 'very_high' },
    ],
  },
  {
    id: 'use_case',
    question: 'What is your primary use case?',
    options: [
      { label: 'Recover lost traffic leads', value: 'lost_traffic' },
      { label: 'Outbound prospecting', value: 'outbound' },
      { label: 'Both traffic recovery + intent data', value: 'both' },
      { label: "I'm not sure yet", value: 'unsure' },
    ],
  },
  {
    id: 'crm',
    question: 'Which CRM do you use?',
    options: [
      { label: 'Salesforce', value: 'salesforce' },
      { label: 'HubSpot', value: 'hubspot' },
      { label: 'Pipedrive / Other', value: 'other' },
      { label: "We don't have a CRM yet", value: 'none' },
    ],
  },
];

function getRecommendation(answers) {
  const { team_size, monthly_traffic, use_case } = answers;
  if (team_size === 'large' || monthly_traffic === 'very_high') return 'Scale';
  if (team_size === 'mid' || monthly_traffic === 'high' || use_case === 'both') return 'Growth';
  if (team_size === 'tiny' || monthly_traffic === 'low') return 'Starter';
  return 'Growth';
}

function PackageChecker({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleAnswer = (qId, val) => {
    const newAnswers = { ...answers, [qId]: val };
    setAnswers(newAnswers);
    if (step < checkerQuestions.length - 1) {
      setStep(step + 1);
    } else {
      setResult(getRecommendation(newAnswers));
    }
  };

  const recommended = plans.find(p => p.name === result);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,2,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '14px', width: '100%', maxWidth: '560px', padding: '40px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#D9ECFF', cursor: 'pointer' }}><X size={20} /></button>

        {!result ? (
          <>
            <p style={{ color: S.red, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Package Recommendation Checker</p>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>{checkerQuestions[step].question}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>
              {checkerQuestions.map((_, i) => (
                <div key={i} style={{ height: '3px', flex: 1, borderRadius: '2px', background: i <= step ? '#B1001A' : '#0A2142' }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {checkerQuestions[step].options.map(opt => (
                <button key={opt.value} onClick={() => handleAnswer(checkerQuestions[step].id, opt.value)}
                  style={{ background: '#020D1F', border: '1px solid #0A2142', borderRadius: '8px', padding: '14px 20px', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#1a5ca8'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#0A2142'}>
                  {opt.label}
                </button>
              ))}
            </div>
            <p style={{ color: S.muted, fontSize: '12px', marginTop: '20px' }}>Question {step + 1} of {checkerQuestions.length}</p>
          </>
        ) : (
          <>
            <p style={{ color: '#22c55e', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Your Recommended Package</p>
            <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.8px', marginBottom: '8px' }}>{recommended?.name}</h3>
            <p style={{ color: S.muted, fontSize: '14px', marginBottom: '24px' }}>{recommended?.desc}</p>
            {recommended?.price ? (
              <p style={{ color: '#fff', fontWeight: 900, fontSize: '36px', letterSpacing: '-1px', marginBottom: '24px' }}>
                ${recommended.price.toLocaleString()}<span style={{ color: S.muted, fontSize: '14px', fontWeight: 400 }}>/mo</span>
              </p>
            ) : (
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '20px', marginBottom: '24px' }}>Custom Pricing</p>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recommended?.features.slice(0, 5).map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: S.muted, fontSize: '13px' }}>
                  <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0 }} />{f}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={createPageUrl('BookADemo')} onClick={onClose}>
                <button className="ark-btn-red" style={{ padding: '12px 24px', fontSize: '14px' }}>Book a Call</button>
              </Link>
              <button onClick={() => { setStep(0); setAnswers({}); setResult(null); }}
                className="ark-btn-blue" style={{ padding: '12px 24px', fontSize: '14px' }}>Retake</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [showChecker, setShowChecker] = useState(false);

  return (
    <div style={{ background: '#000002', minHeight: '100vh', color: '#fff' }}>
      {showChecker && <PackageChecker onClose={() => setShowChecker(false)} />}

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #06162A 0%, #000002 60%)', borderBottom: '1px solid #0A2142', padding: '80px 0 60px' }}>
        <div className="sc" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Pricing</p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>Pricing That Scales With You.</h1>
          <p style={{ color: S.muted, fontSize: '17px', lineHeight: 1.7, marginBottom: '32px' }}>Productized packages with clear value. No hidden fees. Custom contracts available for enterprise.</p>

          {/* Toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#06162A', border: '1px solid #0A2142', borderRadius: '100px', padding: '6px 6px 6px 16px', marginBottom: '32px' }}>
            <span style={{ color: annual ? S.muted : '#fff', fontSize: '13px', fontWeight: 600 }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)}
              style={{ width: '44px', height: '24px', background: annual ? '#B1001A' : '#0A2142', border: 'none', borderRadius: '100px', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <span style={{ position: 'absolute', top: '3px', left: annual ? '22px' : '3px', width: '18px', height: '18px', background: '#fff', borderRadius: '50%', transition: 'left 0.2s', display: 'block' }} />
            </button>
            <span style={{ color: annual ? '#fff' : S.muted, fontSize: '13px', fontWeight: 600 }}>Annual</span>
            {annual && <span style={{ background: '#042016', border: '1px solid #063524', borderRadius: '100px', padding: '2px 10px', color: '#DFFFEF', fontSize: '11px', fontWeight: 700 }}>Save 20%</span>}
          </div>

          <div>
            <button onClick={() => setShowChecker(true)}
              className="ark-btn-blue" style={{ padding: '12px 28px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Not sure which plan? Take the Package Checker →
            </button>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="sp" style={{ background: '#000002' }}>
        <div className="sc">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '60px' }}>
            {plans.map((plan, i) => {
              const price = plan.price ? (annual ? Math.round(plan.price * 0.8) : plan.price) : null;
              return (
                <div key={i} style={{
                  background: plan.highlight ? '#06162A' : '#020D1F',
                  border: `1px solid ${plan.highlight ? '#1a5ca8' : '#0A2142'}`,
                  borderRadius: '12px', padding: '36px', position: 'relative',
                  boxShadow: plan.highlight ? '0 0 32px rgba(26,92,168,0.2)' : 'none',
                }}>
                  {plan.highlight && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#B1001A', borderRadius: '100px', padding: '3px 16px', fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>Most Popular</div>
                  )}
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '20px', marginBottom: '4px' }}>{plan.name}</h3>
                  <p style={{ color: S.muted, fontSize: '12px', marginBottom: '6px' }}>{plan.who}</p>
                  <p style={{ color: '#4a6a9a', fontSize: '12px', marginBottom: '20px' }}>{plan.desc}</p>

                  {price ? (
                    <p style={{ color: '#fff', fontWeight: 900, fontSize: '40px', letterSpacing: '-1.5px', marginBottom: '24px' }}>
                      ${price.toLocaleString()}<span style={{ color: S.muted, fontSize: '14px', fontWeight: 400 }}>/mo</span>
                    </p>
                  ) : (
                    <p style={{ color: '#fff', fontWeight: 800, fontSize: '24px', marginBottom: '24px' }}>Custom</p>
                  )}

                  <Link to={createPageUrl(plan.cta === 'Contact Us' ? 'Contact' : 'BookADemo')}>
                    <button className={plan.highlight ? 'ark-btn-red' : 'ark-btn-blue'} style={{ width: '100%', padding: '12px', fontSize: '14px', marginBottom: '28px' }}>
                      {plan.cta}
                    </button>
                  </Link>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Included</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {plan.features.map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: S.muted, fontSize: '13px' }}>
                          <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />{f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.notIncluded.length > 0 && (
                    <div>
                      <p style={{ color: '#4a6a9a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Not included</p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {plan.notIncluded.map(f => (
                          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4a6a9a', fontSize: '13px' }}>
                            <X size={14} style={{ flexShrink: 0, marginTop: '1px' }} />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feature Comparison Table */}
          <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', overflow: 'hidden', marginBottom: '60px' }}>
            <div style={{ padding: '28px 32px', borderBottom: '1px solid #0A2142' }}>
              <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '20px' }}>Full Feature Comparison</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#020D1F' }}>
                    <th style={{ textAlign: 'left', padding: '16px 24px', color: S.muted, fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', width: '35%' }}>Feature</th>
                    {plans.map(p => <th key={p.name} style={{ textAlign: 'center', padding: '16px 12px', color: p.highlight ? '#fff' : S.muted, fontSize: '13px', fontWeight: 700 }}>{p.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Enrichments / mo', vals: ['5,000', '25,000', '100,000', 'Unlimited'] },
                    { label: 'Lost Traffic Recovery', vals: [true, true, true, true] },
                    { label: 'High Intent Data', vals: [false, true, true, true] },
                    { label: 'CRM Integrations', vals: ['1', 'All', 'All', 'All + Custom'] },
                    { label: 'API Access', vals: [false, true, true, true] },
                    { label: 'Custom Field Mapping', vals: [false, true, true, true] },
                    { label: 'Custom Segments', vals: [false, false, true, true] },
                    { label: 'Ad Platform Sync', vals: [false, false, true, true] },
                    { label: 'Data Refresh', vals: ['Weekly', 'Daily', 'Real-time', 'Real-time'] },
                    { label: 'CSM / Support', vals: ['Email', 'Dedicated CSM', 'Analyst', 'Executive'] },
                    { label: 'SLA Guarantee', vals: [false, false, true, true] },
                    { label: 'DPA Available', vals: [false, true, true, true] },
                    { label: 'Data Residency', vals: [false, false, false, true] },
                  ].map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: '1px solid #0A2142' }}>
                      <td style={{ padding: '14px 24px', color: S.muted, fontSize: '13px' }}>{row.label}</td>
                      {row.vals.map((v, vi) => (
                        <td key={vi} style={{ textAlign: 'center', padding: '14px 12px' }}>
                          {typeof v === 'boolean' ? (
                            v ? <CheckCircle size={16} style={{ color: '#22c55e', margin: '0 auto' }} /> : <X size={16} style={{ color: '#2a3a5a', margin: '0 auto' }} />
                          ) : (
                            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{v}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Package Checker CTA */}
          <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '12px', padding: '48px', textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: '#DFFFEF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>Not Sure Which Plan?</p>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.8px', marginBottom: '12px' }}>Take the Package Recommendation Checker</h2>
            <p style={{ color: '#DFFFEF', fontSize: '14px', marginBottom: '28px' }}>Answer 4 quick questions and we'll recommend the right plan for your team size, traffic, and use case.</p>
            <button onClick={() => setShowChecker(true)} className="ark-btn-red" style={{ padding: '14px 36px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Find My Plan <ArrowRight size={16} />
            </button>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '24px', textAlign: 'center' }}>Pricing FAQs</h2>
            {[
              { q: 'What counts as an "enrichment"?', a: 'Each unique record that we enrich with firmographic, contact, or intent data counts as one enrichment. Duplicate records or re-enrichments within the same billing cycle are not double-counted.' },
              { q: 'Can I upgrade or downgrade mid-cycle?', a: 'Yes. You can upgrade at any time and the change takes effect immediately with prorated billing. Downgrades take effect at the next billing cycle.' },
              { q: 'Is there a setup fee?', a: 'No. There are no setup fees on any plan. Onboarding support is included.' },
              { q: 'What happens if I exceed my monthly limit?', a: 'You will be notified at 80% usage. If you exceed your limit, enrichments continue at a per-record rate and you will be offered an upgrade.' },
              { q: 'Do you offer a trial?', a: 'We offer a guided proof-of-concept for qualified teams. Book a call to discuss what this would look like for your use case.' },
            ].map((faq, i) => {
              const [open, setOpen] = React.useState(false);
              return (
                <div key={i} style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
                  <button onClick={() => setOpen(!open)} style={{ width: '100%', background: 'none', border: 'none', padding: '18px 24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '16px', textAlign: 'left' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{faq.q}</span>
                    <span style={{ color: '#B1001A', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </button>
                  {open && <div style={{ borderTop: '1px solid #0A2142', padding: '14px 24px 18px' }}><p style={{ color: S.muted, fontSize: '13px', lineHeight: 1.7 }}>{faq.a}</p></div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: '#06162A', borderTop: '1px solid #0A2142', padding: '60px 0' }}>
        <div className="sc" style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 900, fontSize: '30px', letterSpacing: '-0.8px', marginBottom: '12px' }}>Ready to get started?</h2>
          <p style={{ color: S.muted, fontSize: '15px', marginBottom: '28px' }}>Book a 30-minute call. We'll walk through your use case and recommend the right plan.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-red" style={{ padding: '14px 32px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Book a Call <ArrowRight size={16} />
              </button>
            </Link>
            <Link to={createPageUrl('Contact')}>
              <button className="ark-btn-blue" style={{ padding: '14px 32px', fontSize: '15px' }}>Contact Sales</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}