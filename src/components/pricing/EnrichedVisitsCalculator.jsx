import React, { useState, useMemo } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, ReferenceDot } from 'recharts';

// ── Rate tables ──────────────────────────────────────────────────────────────
const SELF_SERVE_TIERS = [
  { name: 'Starter',    min: 0,      max: 2500,    rate: 0.18,  color: '#22c55e' },
  { name: 'Growth',     min: 2501,   max: 10000,   rate: 0.15,  color: '#3b82f6' },
  { name: 'Scale',      min: 10001,  max: 25000,   rate: 0.12,  color: '#8b5cf6' },
  { name: 'Business',   min: 25001,  max: 50000,   rate: 0.10,  color: '#f59e0b' },
  { name: 'Pro',        min: 50001,  max: 100000,  rate: 0.09,  color: '#ef4444' },
  { name: 'Enterprise', min: 100001, max: Infinity, rate: 0.08, color: '#06b6d4' },
];

const COMMITTED_TIERS = [
  { name: 'Starter',    min: 0,      max: 2500,    rate: 0.153, color: '#22c55e' },
  { name: 'Growth',     min: 2501,   max: 10000,   rate: 0.128, color: '#3b82f6' },
  { name: 'Scale',      min: 10001,  max: 25000,   rate: 0.102, color: '#8b5cf6' },
  { name: 'Business',   min: 25001,  max: 50000,   rate: 0.085, color: '#f59e0b' },
  { name: 'Pro',        min: 50001,  max: 100000,  rate: 0.077, color: '#ef4444' },
  { name: 'Enterprise', min: 100001, max: Infinity, rate: 0.068, color: '#06b6d4' },
];

// ── Competitor reference data ─────────────────────────────────────────────
const COMPETITOR_POINTS = [
  { ev: 500,   rb2b: 129,   opensend: null },
  { ev: 1000,  rb2b: 249,   opensend: 500  },
  { ev: 2500,  rb2b: 524,   opensend: 500  },
  { ev: 5000,  rb2b: 1024,  opensend: 1000 },
  { ev: 10000, rb2b: 2274,  opensend: 2000 },
  { ev: 15000, rb2b: 3500,  opensend: 2500 },
  { ev: 25000, rb2b: 5949,  opensend: 5000 },
  { ev: 50000, rb2b: 10000, opensend: 10000},
];

function interpolate(ev, field) {
  if (ev > 50000) return null;
  const pts = COMPETITOR_POINTS.filter(p => p[field] != null);
  if (ev <= pts[0].ev) return pts[0][field];
  if (ev >= pts[pts.length-1].ev) return pts[pts.length-1][field];
  for (let i = 0; i < pts.length - 1; i++) {
    if (ev >= pts[i].ev && ev <= pts[i+1].ev) {
      const t = (ev - pts[i].ev) / (pts[i+1].ev - pts[i].ev);
      return pts[i][field] + t * (pts[i+1][field] - pts[i][field]);
    }
  }
  return null;
}

// ── Calculation engine ────────────────────────────────────────────────────
function calculateCost(enrichedVisits, tiers) {
  let remaining = enrichedVisits;
  let totalCost = 0;
  const breakdown = [];
  for (const tier of tiers) {
    if (remaining <= 0) break;
    const capacity = tier.max === Infinity ? remaining : (tier.max - tier.min + 1);
    const used = Math.min(remaining, capacity);
    const cost = used * tier.rate;
    breakdown.push({ ...tier, used, cost });
    totalCost += cost;
    remaining -= used;
  }
  const effectiveRate = enrichedVisits > 0 ? totalCost / enrichedVisits : 0;
  return { totalCost, effectiveRate, breakdown };
}

// ── Formatters ────────────────────────────────────────────────────────────
function fmt(n) { return Math.floor(n).toLocaleString('en-US'); }
function fmtUSD(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtRate(r) { return r < 0.10 ? `$${r.toFixed(4)}` : `$${r.toFixed(2)}`; }
function fmtK(v) {
  if (v >= 1000000) return `${(v/1000000).toFixed(0)}M`;
  if (v >= 1000) return `${(v/1000).toFixed(0)}k`;
  return String(v);
}

// ── Staircase chart data ──────────────────────────────────────────────────
function buildStaircaseData(tiers) {
  const pts = [];
  const boundaries = [0, 2500, 10000, 25000, 50000, 100000, 250000];
  boundaries.forEach(x => {
    const tier = [...tiers].reverse().find(t => x >= t.min) || tiers[0];
    pts.push({ x, rate: tier.rate, color: tier.color });
  });
  return pts;
}

// ── Tooltip ───────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: '#06162A', border: '1px solid rgba(26,92,168,0.6)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <p style={{ color: '#D9ECFF', fontWeight: 700 }}>{fmtK(d.x)} enriched visits</p>
      <p style={{ color: '#22c55e', fontWeight: 700, marginTop: '4px' }}>Rate: {fmtRate(d.rate)} / visit</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function EnrichedVisitsCalculator() {
  const [visitsRaw, setVisitsRaw] = useState('');
  const [rateRaw, setRateRaw] = useState('55');
  const [committed, setCommitted] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const [formData, setFormData] = useState({ email: '', phone: '', company: '', url: '', monthlyVisits: '' });

  const tiers = committed ? COMMITTED_TIERS : SELF_SERVE_TIERS;
  const visitsInt = Math.max(0, Math.floor(parseFloat(visitsRaw.replace(/,/g, '')) || 0));
  const ratePercent = Math.min(80, Math.max(20, parseFloat(rateRaw) || 55));
  const enrichedVisits = Math.floor(visitsInt * (ratePercent / 100));
  const { totalCost, effectiveRate, breakdown } = useMemo(() => calculateCost(enrichedVisits, tiers), [enrichedVisits, tiers]);

  // Self-serve cost for savings comparison
  const selfServeCost = useMemo(() => calculateCost(enrichedVisits, SELF_SERVE_TIERS).totalCost, [enrichedVisits]);
  const monthlySavings = committed ? selfServeCost - totalCost : 0;

  // Competitor estimates
  const rb2bEst = interpolate(enrichedVisits, 'rb2b');
  const opensendEst = interpolate(enrichedVisits, 'opensend');

  // Chart data
  const chartData = useMemo(() => buildStaircaseData(tiers), [tiers]);

  // Active tier
  const activeTier = useMemo(() => {
    return [...tiers].reverse().find(t => enrichedVisits >= t.min) || tiers[0];
  }, [enrichedVisits, tiers]);

  const handleFormSubmit = (e) => { e.preventDefault(); setModalStep(2); };

  return (
    <div>
      {/* ── Toggle ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(6,18,42,0.9)', border: '1px solid rgba(26,92,168,0.4)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
          {[
            { label: 'Pay As You Go', value: false },
            { label: 'Annual Commitment (save 15–20%)', value: true },
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => setCommitted(opt.value)}
              style={{
                padding: '10px 20px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '13px', transition: 'all 0.2s',
                background: committed === opt.value ? (opt.value ? 'linear-gradient(135deg,#064e2a,#0a6e3b)' : 'rgba(26,92,168,0.5)') : 'transparent',
                color: committed === opt.value ? '#fff' : '#4a6a9a',
                boxShadow: committed === opt.value ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {committed && (
        <div style={{ background: 'rgba(6,53,36,0.3)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '14px 20px', marginBottom: '24px', textAlign: 'center' }}>
          <p style={{ color: '#86efac', fontSize: '13px', fontWeight: 600 }}>
            Annual commitments include a monthly minimum spend. Talk to our team to set up your commitment.
          </p>
        </div>
      )}

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
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(36px, 5vw, 54px)', letterSpacing: '-2.5px', lineHeight: 1 }}>{fmtUSD(totalCost)}</p>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#4a6a9a', fontSize: '11px' }}>Effective rate</p>
              <p style={{ color: '#22c55e', fontWeight: 800, fontSize: '20px' }}>{fmtRate(effectiveRate)} / enriched visit</p>
              <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '3px' }}>{fmt(enrichedVisits)} enriched visits</p>
            </div>
          </div>

          {committed && monthlySavings > 0 && (
            <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px' }}>
              <p style={{ color: '#86efac', fontSize: '13px', fontWeight: 700 }}>
                You save {fmtUSD(monthlySavings)}/mo ({fmtUSD(monthlySavings * 12)}/year) with an annual commitment
              </p>
            </div>
          )}
        </div>

        {/* Tier breakdown table */}
        {enrichedVisits > 0 && (
          <div style={{ background: 'rgba(2,13,31,0.6)', border: '1px solid rgba(10,33,66,0.8)', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(10,33,66,0.5)' }}>
                  {['Tier', 'Range', 'Visits', 'Rate', 'Subtotal'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 16px', color: '#7eb8ff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: i < 2 ? 'left' : 'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {breakdown.filter(t => t.used > 0).map((t, i) => (
                  <tr key={t.name} style={{ borderTop: i > 0 ? '1px solid rgba(10,33,66,0.6)' : 'none', background: `${t.color}0d` }}>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{t.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', color: '#4a6a9a', fontSize: '12px' }}>
                      {t.max === Infinity ? `${fmtK(t.min)}+` : `${fmtK(t.min)}–${fmtK(t.max)}`}
                    </td>
                    <td style={{ padding: '11px 16px', color: '#D9ECFF', fontSize: '13px', fontWeight: 600, textAlign: 'right', fontFamily: 'monospace' }}>{fmt(t.used)}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                      <span style={{ color: t.color, fontSize: '12px', fontWeight: 700, background: `${t.color}15`, border: `1px solid ${t.color}33`, borderRadius: '4px', padding: '2px 7px' }}>{fmtRate(t.rate)}</span>
                    </td>
                    <td style={{ padding: '11px 16px', color: '#fff', fontSize: '13px', fontWeight: 700, textAlign: 'right', fontFamily: 'monospace' }}>{fmtUSD(t.cost)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid rgba(26,92,168,0.4)', background: 'rgba(10,33,66,0.4)' }}>
                  <td colSpan={4} style={{ padding: '13px 16px', color: '#7eb8ff', fontSize: '13px', fontWeight: 800 }}>Total Monthly Cost</td>
                  <td style={{ padding: '13px 16px', color: '#fff', fontSize: '16px', fontWeight: 900, textAlign: 'right', fontFamily: 'monospace' }}>{fmtUSD(totalCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Competitor comparison */}
        {enrichedVisits > 0 && enrichedVisits <= 50000 && (rb2bEst || opensendEst) && (
          <div style={{ background: 'rgba(10,33,66,0.3)', border: '1px solid rgba(26,92,168,0.3)', borderRadius: '10px', padding: '18px 22px', marginBottom: '20px' }}>
            <p style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Compared To</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rb2bEst && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ color: '#D9ECFF', fontSize: '13px' }}>RB2B at this volume:</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>~{fmtUSD(rb2bEst)}/mo</span>
                    <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '2px 8px' }}>
                      You save {Math.round((1 - totalCost / rb2bEst) * 100)}%
                    </span>
                  </div>
                </div>
              )}
              {opensendEst && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ color: '#D9ECFF', fontSize: '13px' }}>OpenSend at this volume:</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>~{fmtUSD(opensendEst)}/mo</span>
                    <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '2px 8px' }}>
                      You save {Math.round((1 - totalCost / opensendEst) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {enrichedVisits > 50000 && (
          <div style={{ background: 'rgba(10,33,66,0.3)', border: '1px solid rgba(26,92,168,0.3)', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px' }}>
            <p style={{ color: '#4a6a9a', fontSize: '13px', fontStyle: 'italic' }}>Enterprise pricing — competitors don't publish rates at this volume.</p>
          </div>
        )}

        {/* CTA */}
        <button onClick={() => setModalStep(1)} style={{ width: '100%', background: 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)', border: '1px solid rgba(34,197,94,0.45)', borderRadius: '10px', padding: '18px 32px', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 24px rgba(34,197,94,0.2)', transition: 'all 0.25s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #0a6e3b 0%, #0d8f4c 50%, #0a6e3b 100%)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          Start Your Free 30-Day Trial — No Credit Card Required
        </button>
        <p style={{ color: '#4a6a9a', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>Cancel anytime</p>
      </div>

      {/* ── Staircase Chart ── */}
      <div style={{ background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)', border: '1px solid rgba(26,92,168,0.4)', borderRadius: '14px', padding: '28px', marginBottom: '28px' }}>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '17px', marginBottom: '6px' }}>Rate per Enriched Visit by Volume</h2>
        <p style={{ color: '#4a6a9a', fontSize: '12px', marginBottom: '20px', lineHeight: 1.6 }}>
          Your rate drops automatically as your volume increases. Each tier only applies to visits within that range — you never lose your rate on earlier visits.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '480px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 8, left: 0 }}>
                <defs>
                  <linearGradient id="stairGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a5ca8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1a5ca8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,33,66,0.9)" />
                <XAxis dataKey="x" tickFormatter={fmtK} tick={{ fill: '#4a6a9a', fontSize: 10 }} axisLine={{ stroke: '#0A2142' }} tickLine={false} />
                <YAxis tickFormatter={v => `$${v.toFixed(2)}`} tick={{ fill: '#4a6a9a', fontSize: 10 }} axisLine={{ stroke: '#0A2142' }} tickLine={false} width={52} domain={[0.06, 0.20]} ticks={[0.08, 0.09, 0.10, 0.12, 0.15, 0.18]} />
                <Tooltip content={<ChartTooltip />} />
                {enrichedVisits > 0 && (
                  <ReferenceLine x={enrichedVisits} stroke="#B1001A" strokeDasharray="4 3" strokeWidth={2}
                    label={{ value: 'You', fill: '#ff8a99', fontSize: 11, fontWeight: 700, position: 'insideTopRight', dy: 30 }} />
                )}
                <Area type="stepAfter" dataKey="rate" stroke="#3b82f6" strokeWidth={2.5} fill="url(#stairGrad)" dot={false} activeDot={{ r: 5, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier legend */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(10,33,66,0.8)' }}>
          {tiers.map((t, i) => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: activeTier.name === t.name ? `${t.color}22` : 'rgba(255,255,255,0.03)', border: `1px solid ${activeTier.name === t.name ? t.color + '66' : 'rgba(255,255,255,0.08)'}`, borderRadius: '5px', padding: '4px 10px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ color: activeTier.name === t.name ? '#fff' : '#4a6a9a', fontSize: '10px', fontWeight: activeTier.name === t.name ? 700 : 400 }}>
                {t.name} {fmtRate(t.rate)}
              </span>
            </div>
          ))}
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