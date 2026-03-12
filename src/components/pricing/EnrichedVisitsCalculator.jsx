import React, { useState, useMemo } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';

// ── Exponential pricing formula ─────────────────────────────────────────────
// Free through 200 EV, then 900 * (1 - e^(-0.000138629 * EV))
// Asymptote: $900/mo
const FREE_THRESHOLD = 200;
const ASYMPTOTE = 900;
const DECAY = 0.000138629;

function calculateCost(enrichedVisits) {
  if (enrichedVisits <= FREE_THRESHOLD) return 0;
  return ASYMPTOTE * (1 - Math.exp(-DECAY * enrichedVisits));
}

// ── RB2B pricing (from rb2b.com/pricing + support article) ──────────────────
// Starter: $0.45/res overage. Pro & Pro+: $0.25/res overage.
const RB2B_PLANS = [
  { credits: 150,   price: 0,   overage: null, plan: 'Free' },
  { credits: 300,   price: 79,  overage: 0.45, plan: 'Starter' },
  { credits: 600,   price: 149, overage: 0.25, plan: 'Pro 600' },
  { credits: 1250,  price: 249, overage: 0.25, plan: 'Pro 1,250' },
  { credits: 2500,  price: 349, overage: 0.25, plan: 'Pro 2,500' },
  { credits: 5000,  price: 499, overage: 0.25, plan: 'Pro+ 5,000' },
  { credits: 7500,  price: 649, overage: 0.25, plan: 'Pro+ 7,500' },
  { credits: 10000, price: 799, overage: 0.25, plan: 'Pro+ 10,000' },
  { credits: 12500, price: 849, overage: 0.25, plan: 'Pro+ 12,500' },
];

function rb2bCheapest(ev) {
  if (ev <= 0) return { price: 0, plan: 'Free' };
  let bestCost = Infinity;
  let bestPlan = null;
  for (const p of RB2B_PLANS) {
    let total;
    if (ev <= p.credits) {
      // Plan covers it fully
      total = p.price;
    } else if (p.overage !== null) {
      // Plan + overage for excess
      total = p.price + (ev - p.credits) * p.overage;
    } else {
      continue; // Free plan has no overage option
    }
    if (total < bestCost) {
      bestCost = total;
      bestPlan = p.plan + (ev > p.credits ? ' + overage' : '');
    }
  }
  if (bestCost === Infinity) return null;
  return { price: bestCost, plan: bestPlan };
}

// ── OpenSend bucket pricing (from opensend.com/pricing) ─────────────────────
function opensendCheapest(ev) {
  if (ev <= 2000)  return { price: 500,  plan: 'Tier 1' };
  if (ev <= 4300)  return { price: 1000, plan: 'Tier 2' };
  if (ev <= 9500)  return { price: 2000, plan: 'Tier 3' };
  return null; // Enterprise
}

// ── Formatters ──────────────────────────────────────────────────────────────
function fmt(n) { return Math.floor(n).toLocaleString('en-US'); }
function fmtUSD(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtRate(r) { return r < 0.01 ? `$${r.toFixed(4)}` : `$${r.toFixed(2)}`; }
function fmtK(v) {
  if (v >= 1000000) return `${(v/1000000).toFixed(0)}M`;
  if (v >= 1000) return `${(v/1000).toFixed(0)}k`;
  return String(v);
}

// ── Build comparison chart data ─────────────────────────────────────────────
function buildChartData() {
  const pts = [];
  // Dense points to show RB2B overage ramps between tier boundaries
  const steps = [
    0, 150, 200, 300, 400, 500, 600, 750, 1000, 1250,
    1500, 1750, 2000, 2500, 3000, 3500, 4000, 5000,
    6000, 7500, 8500, 10000, 11000, 12500,
  ];
  for (const ev of steps) {
    const ark = calculateCost(ev);
    const rb = rb2bCheapest(ev);
    pts.push({
      x: ev,
      ark,
      rb2b: rb ? rb.price : null,
    });
  }
  return pts;
}

// ── Tooltips ────────────────────────────────────────────────────────────────
function ComparisonTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: '#06162A', border: '1px solid rgba(26,92,168,0.6)', borderRadius: '8px', padding: '12px 16px', fontSize: '12px' }}>
      <p style={{ color: '#D9ECFF', fontWeight: 700, marginBottom: '6px' }}>{fmt(d.x)} enriched visits</p>
      <p style={{ color: '#22c55e', fontWeight: 700 }}>Ark Data: {d.ark === 0 ? 'FREE' : fmtUSD(d.ark)}</p>
      {d.rb2b !== null && <p style={{ color: '#f97316', fontWeight: 700, marginTop: '3px' }}>RB2B: {d.rb2b === 0 ? 'FREE' : fmtUSD(d.rb2b)}</p>}
      {d.rb2b !== null && d.ark > 0 && d.rb2b > 0 && (
        <p style={{ color: '#22c55e', fontSize: '11px', marginTop: '5px' }}>You save {fmtUSD(d.rb2b - d.ark)} ({Math.round((1 - d.ark / d.rb2b) * 100)}%)</p>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function EnrichedVisitsCalculator() {
  const [visitsRaw, setVisitsRaw] = useState('');
  const [rateRaw, setRateRaw] = useState('55');
  const [modalStep, setModalStep] = useState(0);
  const [formData, setFormData] = useState({ email: '', phone: '', company: '', url: '', monthlyVisits: '' });

  const visitsInt = Math.max(0, Math.floor(parseFloat(visitsRaw.replace(/,/g, '')) || 0));
  const ratePercent = Math.min(80, Math.max(20, parseFloat(rateRaw) || 55));
  const enrichedVisits = Math.floor(visitsInt * (ratePercent / 100));
  const totalCost = useMemo(() => calculateCost(enrichedVisits), [enrichedVisits]);
  const effectiveRate = enrichedVisits > 0 && totalCost > 0 ? totalCost / enrichedVisits : 0;

  // Competitor pricing
  const rb2b = useMemo(() => rb2bCheapest(enrichedVisits), [enrichedVisits]);
  const opensend = useMemo(() => opensendCheapest(enrichedVisits), [enrichedVisits]);

  // Chart data
  const chartData = useMemo(() => buildChartData(), []);

  const handleFormSubmit = (e) => { e.preventDefault(); setModalStep(2); };

  return (
    <div id="pricing-calculator" style={{ scrollMarginTop: '80px' }}>
      {/* ── Calculator Card ── */}
      <div style={{ background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)', border: '1px solid rgba(26,92,168,0.5)', borderRadius: '16px', padding: '36px', marginBottom: '28px', boxShadow: '0 0 60px rgba(26,92,168,0.1)' }}>
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #B1001A 0%, #1a5ca8 100%)', borderRadius: '2px', marginBottom: '28px' }} />

        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '24px' }}>Enter Your Estimated Monthly Website Visits</h2>

        {/* Inputs */}
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

        {/* Cost output */}
        <div style={{ background: 'linear-gradient(135deg, rgba(10,33,66,0.8) 0%, rgba(4,14,26,0.9) 100%)', border: '1px solid rgba(26,92,168,0.5)', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px' }}>
          <p style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Your Estimated Monthly Cost</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(36px, 5vw, 54px)', letterSpacing: '-2.5px', lineHeight: 1 }}>
              {enrichedVisits <= FREE_THRESHOLD ? 'FREE' : fmtUSD(totalCost)}
            </p>
            <div style={{ textAlign: 'right' }}>
              {enrichedVisits > FREE_THRESHOLD && (
                <>
                  <p style={{ color: '#4a6a9a', fontSize: '11px' }}>Effective rate</p>
                  <p style={{ color: '#22c55e', fontWeight: 800, fontSize: '20px' }}>{fmtRate(effectiveRate)} / enriched visit</p>
                </>
              )}
              <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '3px' }}>{fmt(enrichedVisits)} enriched visits</p>
              {enrichedVisits <= FREE_THRESHOLD && enrichedVisits > 0 && (
                <p style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>First {FREE_THRESHOLD} enriched visits are free every month</p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing details */}
        {enrichedVisits > FREE_THRESHOLD && (
          <div style={{ background: 'rgba(2,13,31,0.6)', border: '1px solid rgba(10,33,66,0.8)', borderRadius: '10px', padding: '18px 22px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#7eb8ff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Monthly Cost</p>
                <p style={{ color: '#fff', fontSize: '20px', fontWeight: 800, fontFamily: 'monospace' }}>{fmtUSD(totalCost)}</p>
              </div>
              <div>
                <p style={{ color: '#7eb8ff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Effective Rate</p>
                <p style={{ color: '#22c55e', fontSize: '20px', fontWeight: 800, fontFamily: 'monospace' }}>{fmtRate(effectiveRate)}</p>
              </div>
            </div>
            <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '12px' }}>Your rate decreases automatically as volume increases.</p>
          </div>
        )}

        {/* Competitor comparison */}
        {enrichedVisits > FREE_THRESHOLD && (rb2b || opensend) && (
          <div style={{ background: 'rgba(10,33,66,0.3)', border: '1px solid rgba(26,92,168,0.3)', borderRadius: '10px', padding: '18px 22px', marginBottom: '20px' }}>
            <p style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Compared To</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rb2b && rb2b.price > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ color: '#D9ECFF', fontSize: '13px' }}>RB2B:</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>{fmtUSD(rb2b.price)}/mo</span>
                    <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '2px 8px' }}>
                      You save {fmtUSD(rb2b.price - totalCost)} ({Math.round((1 - totalCost / rb2b.price) * 100)}%)
                    </span>
                  </div>
                </div>
              )}
              {opensend && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ color: '#D9ECFF', fontSize: '13px' }}>OpenSend:</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>{fmtUSD(opensend.price)}/mo</span>
                    <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '2px 8px' }}>
                      You save {fmtUSD(opensend.price - totalCost)} ({Math.round((1 - totalCost / opensend.price) * 100)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {enrichedVisits > 12500 && (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px' }}>
            <p style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>
              At {fmt(enrichedVisits)} enriched visits, competitors either don't publish pricing or force you into enterprise contracts. Ark Data stays transparent at {fmtUSD(totalCost)}/mo.
            </p>
          </div>
        )}

        {/* CTA */}
        <button onClick={() => setModalStep(1)} style={{ width: '100%', background: 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)', border: '1px solid rgba(34,197,94,0.45)', borderRadius: '10px', padding: '18px 32px', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 24px rgba(34,197,94,0.2)', transition: 'all 0.25s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #0a6e3b 0%, #0d8f4c 50%, #0a6e3b 100%)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          Start Your Free 30-Day Trial - No Credit Card Required
        </button>
        <p style={{ color: '#4a6a9a', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>Cancel anytime</p>
      </div>

      {/* ── Comparison Chart: Ark Data vs RB2B ── */}
      <div style={{ background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)', border: '1px solid rgba(26,92,168,0.4)', borderRadius: '14px', padding: '28px', marginBottom: '28px' }}>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '17px', marginBottom: '6px' }}>Ark Data vs RB2B Pricing</h2>
        <p style={{ color: '#4a6a9a', fontSize: '12px', marginBottom: '20px', lineHeight: 1.6 }}>
          Your cost scales smoothly with volume. No tiers, no buckets, no surprises. Free through {FREE_THRESHOLD} enriched visits.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '480px' }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 8, left: 10 }}>
                <defs>
                  <linearGradient id="arkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,33,66,0.9)" />
                <XAxis dataKey="x" type="number" domain={[0, 12500]} tickFormatter={fmtK} tick={{ fill: '#4a6a9a', fontSize: 10 }} axisLine={{ stroke: '#0A2142' }} tickLine={false} ticks={[0, 1000, 2500, 5000, 7500, 10000, 12500]} />
                <YAxis tickFormatter={v => `$${v}`} tick={{ fill: '#4a6a9a', fontSize: 10 }} axisLine={{ stroke: '#0A2142' }} tickLine={false} width={52} domain={[0, 900]} ticks={[0, 100, 200, 300, 400, 500, 600, 700, 800, 900]} />
                <Tooltip content={<ComparisonTooltip />} />
                {enrichedVisits > 0 && enrichedVisits <= 12500 && (
                  <ReferenceLine x={enrichedVisits} stroke="#B1001A" strokeDasharray="4 3" strokeWidth={2}
                    label={{ value: 'You', fill: '#ff8a99', fontSize: 11, fontWeight: 700, position: 'insideTopRight', dy: 30 }} />
                )}
                <Line type="monotone" dataKey="ark" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: '#fff', stroke: '#22c55e', strokeWidth: 2 }} name="Ark Data" />
                <Line type="monotone" dataKey="rb2b" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#fff', stroke: '#f97316', strokeWidth: 2 }} name="RB2B" connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(10,33,66,0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 12, height: 3, background: '#22c55e', display: 'inline-block', borderRadius: '2px' }} />
            <span style={{ color: '#D9ECFF', fontSize: '11px', fontWeight: 600 }}>Ark Data</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 12, height: 3, background: '#f97316', display: 'inline-block', borderRadius: '2px' }} />
            <span style={{ color: '#D9ECFF', fontSize: '11px', fontWeight: 600 }}>RB2B Pro+ (flat bucket tiers, "Contact Us" above 12,500)</span>
          </div>
        </div>
      </div>

      {/* Modal */}
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
