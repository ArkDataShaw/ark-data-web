import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import {
  computeCost,
  isEnterprise,
  formatCents,
  formatRatePerRes,
  FREE_TIER,
  ENTERPRISE_THRESHOLD,
} from '@/lib/billingPricing';

const RB2B_PLANS = [
  { credits: 150,   price: 0,   overage: null },
  { credits: 300,   price: 79,  overage: 0.45 },
  { credits: 600,   price: 149, overage: 0.25 },
  { credits: 1250,  price: 249, overage: 0.25 },
  { credits: 2500,  price: 349, overage: 0.25 },
  { credits: 5000,  price: 499, overage: 0.25 },
  { credits: 7500,  price: 649, overage: 0.25 },
  { credits: 10000, price: 799, overage: 0.25 },
  { credits: 12500, price: 849, overage: 0.25 },
];

function rb2bCheapest(ev) {
  if (ev <= 0) return { price: 0 };
  let best = Infinity;
  for (const p of RB2B_PLANS) {
    let total;
    if (ev <= p.credits) total = p.price;
    else if (p.overage !== null) total = p.price + (ev - p.credits) * p.overage;
    else continue;
    if (total < best) best = total;
  }
  return best === Infinity ? null : { price: best };
}

function opensendCheapest(ev) {
  if (ev <= 2000) return { price: 500 };
  if (ev <= 4300) return { price: 1000 };
  if (ev <= 9500) return { price: 2000 };
  return null;
}

function fmt(n) { return Math.floor(n).toLocaleString('en-US'); }
function fmtUSD(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function EnrichedVisitsCalculator() {
  const [visitsRaw, setVisitsRaw] = useState('');
  const [rateRaw, setRateRaw] = useState('55');
  const [modalStep, setModalStep] = useState(0);
  const [formData, setFormData] = useState({ email: '', phone: '', company: '', url: '', monthlyVisits: '' });

  const visitsInt = Math.max(0, Math.floor(parseFloat(visitsRaw.replace(/,/g, '')) || 0));
  const ratePercent = Math.min(80, Math.max(20, parseFloat(rateRaw) || 55));
  const enrichedVisits = Math.floor(visitsInt * (ratePercent / 100));

  const cost = useMemo(() => computeCost(enrichedVisits), [enrichedVisits]);
  const totalCents = cost.total_cents;
  const totalDollars = totalCents / 100;
  const effectiveRate = enrichedVisits > 0 && totalDollars > 0 ? totalDollars / enrichedVisits : 0;
  const enterprise = isEnterprise(enrichedVisits);

  const rb2b = useMemo(() => (enterprise ? null : rb2bCheapest(enrichedVisits)), [enrichedVisits, enterprise]);
  const opensend = useMemo(() => (enterprise ? null : opensendCheapest(enrichedVisits)), [enrichedVisits, enterprise]);

  const handleFormSubmit = (e) => { e.preventDefault(); setModalStep(2); };

  return (
    <div id="pricing-calculator" style={{ scrollMarginTop: '80px' }}>
      <div style={{ background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)', border: '1px solid rgba(26,92,168,0.5)', borderRadius: '16px', padding: '36px', marginBottom: '28px', boxShadow: '0 0 60px rgba(26,92,168,0.1)' }}>
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #B1001A 0%, #1a5ca8 100%)', borderRadius: '2px', marginBottom: '28px' }} />

        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '24px' }}>Enter Your Estimated Monthly Website Visits</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '28px' }}>
          <div>
            <label style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Monthly Website Visitors</label>
            <input type="text" inputMode="numeric" value={visitsRaw} onChange={e => setVisitsRaw(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g., 50,000" className="ark-input" style={{ fontSize: '17px', fontWeight: 700 }} />
            <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '6px' }}>Total monthly website traffic.</p>
          </div>
          <div>
            <label style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Enrichment Rate: <span style={{ color: '#22c55e' }}>{ratePercent}%</span>
            </label>
            <input type="range" min="20" max="80" value={ratePercent}
              onChange={e => setRateRaw(e.target.value)}
              style={{ width: '100%', accentColor: '#22c55e', marginBottom: '6px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4a6a9a', fontSize: '10px' }}>20%</span>
              <span style={{ color: '#4a6a9a', fontSize: '10px' }}>80%</span>
            </div>
            <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '2px' }}>% of visits that become billable enriched visits.</p>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(10,33,66,0.8) 0%, rgba(4,14,26,0.9) 100%)', border: '1px solid rgba(26,92,168,0.5)', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px' }}>
          <p style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {enterprise ? 'Enterprise Volume' : 'Your Estimated Monthly Cost'}
          </p>

          {enterprise ? (
            <div>
              <p style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '8px' }}>
                Contact Sales
              </p>
              <p style={{ color: '#D9ECFF', fontSize: '13px', lineHeight: 1.6, marginBottom: '18px', maxWidth: '520px' }}>
                For volumes above {fmt(ENTERPRISE_THRESHOLD)} enriched visits per month, contact our team for custom pricing including annual prepay, SLA, and dedicated support.
              </p>
              <a href="https://app.arkdata.io" target="_blank" rel="noopener noreferrer">
                <button style={{ background: 'linear-gradient(135deg, #C8001E 0%, #8B0015 100%)', border: 'none', borderRadius: '8px', padding: '14px 32px', color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(177,0,26,0.4)' }}>
                  Talk to Our Team
                </button>
              </a>
              <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '10px' }}>{fmt(enrichedVisits)} enriched visits / month</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
              <p style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(36px, 5vw, 54px)', letterSpacing: '-2.5px', lineHeight: 1 }}>
                {enrichedVisits <= FREE_TIER ? 'FREE' : formatCents(totalCents)}
              </p>
              <div style={{ textAlign: 'right' }}>
                {enrichedVisits > FREE_TIER && (
                  <>
                    <p style={{ color: '#4a6a9a', fontSize: '11px' }}>Effective rate</p>
                    <p style={{ color: '#22c55e', fontWeight: 800, fontSize: '20px' }}>{formatRatePerRes(effectiveRate)} / enriched visit</p>
                  </>
                )}
                <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '3px' }}>{fmt(enrichedVisits)} enriched visits</p>
                {enrichedVisits <= FREE_TIER && enrichedVisits > 0 && (
                  <p style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>First {FREE_TIER} enriched visits are free every month</p>
                )}
              </div>
            </div>
          )}
        </div>

        {!enterprise && enrichedVisits > FREE_TIER && (rb2b || opensend) && (
          <div style={{ background: 'rgba(10,33,66,0.3)', border: '1px solid rgba(26,92,168,0.3)', borderRadius: '10px', padding: '18px 22px', marginBottom: '20px' }}>
            <p style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Compared To</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rb2b && rb2b.price > 0 && totalDollars > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ color: '#D9ECFF', fontSize: '13px' }}>RB2B:</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>{fmtUSD(rb2b.price)}/mo</span>
                    {rb2b.price > totalDollars && (
                      <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '2px 8px' }}>
                        You save {fmtUSD(rb2b.price - totalDollars)} ({Math.round((1 - totalDollars / rb2b.price) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              )}
              {opensend && totalDollars > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ color: '#D9ECFF', fontSize: '13px' }}>OpenSend:</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>{fmtUSD(opensend.price)}/mo</span>
                    {opensend.price > totalDollars && (
                      <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '2px 8px' }}>
                        You save {fmtUSD(opensend.price - totalDollars)} ({Math.round((1 - totalDollars / opensend.price) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!enterprise && enrichedVisits > 12500 && (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px' }}>
            <p style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>
              At {fmt(enrichedVisits)} enriched visits, RB2B and most competitors stop publishing pricing. Ark Data stays transparent at {formatCents(totalCents)}/mo, all the way through {fmt(ENTERPRISE_THRESHOLD)}.
            </p>
          </div>
        )}

        {!enterprise && (
          <>
            <button onClick={() => setModalStep(1)} style={{ width: '100%', background: 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)', border: '1px solid rgba(34,197,94,0.45)', borderRadius: '10px', padding: '18px 32px', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 24px rgba(34,197,94,0.2)', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #0a6e3b 0%, #0d8f4c 50%, #0a6e3b 100%)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Start Your Free 30-Day Trial - No Credit Card Required
            </button>
            <p style={{ color: '#4a6a9a', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>Cancel anytime</p>
          </>
        )}
      </div>

      {modalStep > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,15,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setModalStep(0)}>
          <div style={{ background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '480px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalStep(0)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#4a6a9a', cursor: 'pointer', padding: '4px' }}><X size={20} /></button>
            {modalStep === 1 && (
              <>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '6px' }}>Start Your Free Trial</h3>
                <p style={{ color: '#4a6a9a', fontSize: '13px', marginBottom: '24px' }}>Tell us a bit about yourself to get started.</p>
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: 'Email', key: 'email', type: 'email', placeholder: 'you@company.com' },
                    { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1 (555) 000-0000' },
                    { label: 'Company Name', key: 'company', type: 'text', placeholder: 'Acme Inc.' },
                    { label: 'Company URL', key: 'url', type: 'url', placeholder: 'https://yourcompany.com' },
                    { label: 'Estimated Monthly Visitors', key: 'monthlyVisits', type: 'text', placeholder: 'e.g. 50,000' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label style={{ color: '#D9ECFF', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{label}</label>
                      <input required type={type} placeholder={placeholder} value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} className="ark-input" />
                    </div>
                  ))}
                  <button type="submit" style={{ marginTop: '8px', width: '100%', background: 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)', border: '1px solid rgba(34,197,94,0.45)', borderRadius: '8px', padding: '14px', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: 'pointer' }}>Continue →</button>
                </form>
              </>
            )}
            {modalStep === 2 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '10px' }}>You're all set!</h3>
                <p style={{ color: '#4a6a9a', fontSize: '14px', marginBottom: '28px' }}>Click below to access the Ark Data platform and start your free trial.</p>
                <a href="https://app.arkdata.io" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', width: '100%', background: 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)', border: '1px solid rgba(34,197,94,0.45)', borderRadius: '8px', padding: '16px', color: '#fff', fontSize: '16px', fontWeight: 800, textDecoration: 'none' }}>
                  Go to app.arkdata.io →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
