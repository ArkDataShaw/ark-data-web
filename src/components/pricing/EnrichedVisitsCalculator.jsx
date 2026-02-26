import React, { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF' };

const TIERS = [
  { label: 'A', range: '0 – 1,000',         min: 0,      rate: 0,    rateLabel: 'FREE',                  cap: 1000   },
  { label: 'B', range: '1,001 – 5,000',     min: 1000,   rate: 0.16, rateLabel: '$0.16 / enriched visit', cap: 4000   },
  { label: 'C', range: '5,001 – 15,000',    min: 5000,   rate: 0.13, rateLabel: '$0.13 / enriched visit', cap: 10000  },
  { label: 'D', range: '15,001 – 30,000',   min: 15000,  rate: 0.11, rateLabel: '$0.11 / enriched visit', cap: 15000  },
  { label: 'E', range: '30,001 – 50,000',   min: 30000,  rate: 0.10, rateLabel: '$0.10 / enriched visit', cap: 20000  },
  { label: 'F', range: '50,001 – 100,000',  min: 50000,  rate: 0.09, rateLabel: '$0.09 / enriched visit', cap: 50000  },
  { label: 'G', range: '100,001 – 250,000', min: 100000, rate: 0.09, rateLabel: '$0.09 / enriched visit', cap: 150000 },
  { label: 'H', range: '250,001+',          min: 250000, rate: 0.08, rateLabel: '$0.08 / enriched visit', cap: Infinity },
];

function clamp(x, lo, hi) { return Math.min(Math.max(x, lo), hi); }

function calcTiers(v) {
  return TIERS.map(t => {
    let charged;
    if (t.label === 'A') {
      charged = clamp(v, 0, 1000);
    } else if (t.label === 'H') {
      charged = Math.max(0, v - 250000);
    } else {
      charged = clamp(v - t.min, 0, t.cap);
    }
    return { ...t, charged, subtotal: charged * t.rate };
  });
}

function fmt(n) { return Math.floor(n).toLocaleString('en-US'); }
function fmtUSD(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EnrichedVisitsCalculator() {
  const [visitsRaw, setVisitsRaw] = useState('');
  const [rateRaw, setRateRaw] = useState('55');
  const [rateError, setRateError] = useState('');

  // Parse visits
  const visitsInt = Math.max(0, Math.floor(parseFloat(visitsRaw.replace(/,/g, '')) || 0));

  // Parse rate: handle "0.55" => 55, "55" => 55, "55%" => 55
  const parseRate = (raw) => {
    const cleaned = String(raw).replace('%', '').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 55;
    if (num > 0 && num <= 1) return num * 100; // decimal input like 0.55
    return num;
  };

  const rateParsed = parseRate(rateRaw);
  const ratePercent = clamp(isNaN(rateParsed) ? 55 : rateParsed, 35, 70);
  const enrichedVisits = Math.floor(visitsInt * (ratePercent / 100));

  const tierRows = useMemo(() => calcTiers(enrichedVisits), [enrichedVisits]);
  const totalCost = tierRows.reduce((sum, t) => sum + t.subtotal, 0);
  const isRare = ratePercent < 45 || ratePercent > 60;

  const handleRateBlur = () => {
    const parsed = parseRate(rateRaw);
    if (isNaN(parsed) || parsed < 35) {
      setRateRaw('35');
      setRateError('Minimum enrichment rate is 35%.');
    } else if (parsed > 70) {
      setRateRaw('70');
      setRateError('Maximum enrichment rate is 70%.');
    } else {
      setRateError('');
    }
  };

  const handleRateChange = (e) => {
    setRateRaw(e.target.value.replace('%', ''));
    setRateError('');
  };

  const handleVisitsChange = (e) => {
    setVisitsRaw(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handleReset = () => {
    setVisitsRaw('');
    setRateRaw('55');
    setRateError('');
  };

  return (
    <div>
      {/* SECTION 2: Calculator Card */}
      <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '14px', padding: '36px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.3px' }}>
            Enter Your Estimated Monthly Website Visits
          </h2>
          <button onClick={handleReset}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #0A2142', borderRadius: '6px', padding: '7px 14px', color: S.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <RefreshCw size={12} /> Reset
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '28px' }}>
          {/* Visits */}
          <div>
            <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '7px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Monthly Website Visits
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={visitsRaw}
              onChange={handleVisitsChange}
              placeholder="e.g., 12,000"
              className="ark-input"
              style={{ fontSize: '17px', fontWeight: 700 }}
            />
            <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '6px', lineHeight: 1.55 }}>
              This is your total website traffic. Billing is based on Enriched Visits.
            </p>
          </div>

          {/* Rate */}
          <div>
            <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '7px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Enrichment Rate <span style={{ color: '#4a6a9a', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(35% – 70%)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                inputMode="decimal"
                value={rateRaw}
                onChange={handleRateChange}
                onBlur={handleRateBlur}
                className="ark-input"
                style={{ fontSize: '17px', fontWeight: 700, paddingRight: '34px' }}
              />
              <span style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#4a6a9a', fontSize: '16px', fontWeight: 700, pointerEvents: 'none' }}>%</span>
            </div>
            <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '6px', lineHeight: 1.55 }}>
              Percent of visits that become billable Enriched Visits.
            </p>
            {rateError && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '5px', fontWeight: 600 }}>⚠ {rateError}</p>
            )}
            {!rateError && isRare && (
              <p style={{ color: '#f59e0b', fontSize: '11px', marginTop: '5px', fontWeight: 600, lineHeight: 1.5 }}>
                Note: Enrichment rates below 45% or above 60% are rare.
              </p>
            )}
          </div>
        </div>

        {/* Computed Summary Panel */}
        <div style={{ background: '#020D1F', border: '1px solid #0A2142', borderRadius: '10px', padding: '22px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '18px', marginBottom: '14px' }}>
            {[
              { label: 'Website Visits Entered', val: fmt(visitsInt) },
              { label: 'Enrichment Rate', val: `${ratePercent}%` },
              { label: 'Estimated Enriched Visits', val: fmt(enrichedVisits), note: 'rounded down' },
            ].map(item => (
              <div key={item.label}>
                <p style={{ color: '#4a6a9a', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {item.label}
                </p>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>{item.val}</p>
                {item.note && <p style={{ color: '#4a6a9a', fontSize: '10px', marginTop: '2px' }}>{item.note}</p>}
              </div>
            ))}
          </div>
          <p style={{ color: '#4a6a9a', fontSize: '11px', fontFamily: 'monospace', borderTop: '1px solid #0A2142', paddingTop: '12px' }}>
            floor({fmt(visitsInt)} × {ratePercent}%) = {fmt(enrichedVisits)}
          </p>
        </div>

        {/* Total Cost — Most Prominent */}
        <div style={{ background: 'linear-gradient(135deg, #0A2142 0%, #06162A 100%)', border: '2px solid #1a5ca8', borderRadius: '10px', padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Estimated Monthly Cost
          </p>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(40px, 6vw, 60px)', letterSpacing: '-2.5px', lineHeight: 1, marginBottom: '10px' }}>
            {fmtUSD(totalCost)}
          </p>
          <p style={{ color: '#4a6a9a', fontSize: '12px' }}>
            Based on {fmt(enrichedVisits)} enriched visits with stacked tier pricing
          </p>
        </div>
      </div>

      {/* SECTION 3: Tier Breakdown Table */}
      <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', overflow: 'hidden', marginBottom: '28px' }}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #0A2142' }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '17px', marginBottom: '3px' }}>
            Tier Breakdown <span style={{ color: '#4a6a9a', fontWeight: 400 }}>(Based on Enriched Visits)</span>
          </h2>
          <p style={{ color: '#4a6a9a', fontSize: '12px' }}>
            {fmt(enrichedVisits)} enriched visits · Total: {fmtUSD(totalCost)}
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
            <thead>
              <tr style={{ background: '#020D1F' }}>
                <th style={{ padding: '12px 20px', color: S.muted, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'left' }}>Tier Range (Enriched Visits)</th>
                <th style={{ padding: '12px 16px', color: S.muted, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'right' }}>Visits in Tier</th>
                <th style={{ padding: '12px 16px', color: S.muted, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'right' }}>Rate</th>
                <th style={{ padding: '12px 20px', color: S.muted, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {tierRows.map((t, i) => {
                const isActive = t.charged > 0;
                return (
                  <tr key={t.label} style={{
                    borderBottom: i < tierRows.length - 1 ? '1px solid #0A2142' : 'none',
                    background: isActive ? 'rgba(26,92,168,0.07)' : 'transparent',
                  }}>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ color: isActive ? '#fff' : '#2a3a5a', fontSize: '13px', fontWeight: 700, marginRight: '8px' }}>Tier {t.label}</span>
                      <span style={{ color: isActive ? '#4a6a9a' : '#1e2a3a', fontSize: '12px' }}>{t.range}</span>
                    </td>
                    <td style={{ padding: '13px 16px', color: isActive ? '#fff' : '#2a3a5a', fontSize: '13px', fontWeight: 600, textAlign: 'right', fontFamily: 'monospace' }}>
                      {fmt(t.charged)}
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span style={{ color: t.label === 'A' ? '#22c55e' : (isActive ? '#22c55e' : '#2a3a5a'), fontSize: '12px', fontWeight: 600 }}>
                        {t.label === 'A' ? 'FREE' : t.rateLabel}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', color: isActive ? '#fff' : '#2a3a5a', fontSize: '13px', fontWeight: 700, textAlign: 'right', fontFamily: 'monospace' }}>
                      {fmtUSD(t.subtotal)}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: '#020D1F', borderTop: '2px solid #1a5ca8' }}>
                <td colSpan={3} style={{ padding: '15px 20px', color: '#fff', fontSize: '14px', fontWeight: 800 }}>
                  Total Monthly Cost
                </td>
                <td style={{ padding: '15px 20px', color: '#fff', fontSize: '15px', fontWeight: 900, textAlign: 'right', fontFamily: 'monospace' }}>
                  {fmtUSD(totalCost)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: Notes + Dynamic Example */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Important Notes */}
        <div style={{ background: '#020D1F', border: '1px solid #0A2142', borderRadius: '10px', padding: '24px 28px' }}>
          <p style={{ color: '#B1001A', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
            Important Notes
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Billing is based on Enriched Visits, not raw website visits.',
              'Enriched Visits are calculated as floor(Website Visits × Enrichment Rate).',
              'Pricing is stacked: you only pay each tier\'s rate for visits inside that tier.',
              'Your first 1,000 enriched visits are always free.',
            ].map((note, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#1a5ca8', fontWeight: 700, fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>→</span>
                <span style={{ color: S.muted, fontSize: '13px', lineHeight: 1.6 }}>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Example */}
        <div style={{ background: '#042016', border: '1px solid #063524', borderRadius: '10px', padding: '24px 28px' }}>
          <p style={{ color: '#22c55e', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
            Example with Your Current Inputs
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Website Visits', val: fmt(visitsInt) },
              { label: 'Enrichment Rate', val: `${ratePercent}%` },
              { label: 'Enriched Visits', val: fmt(enrichedVisits) },
              { label: 'Estimated Monthly Cost', val: fmtUSD(totalCost), highlight: true },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(6,53,36,0.8)' }}>
                <span style={{ color: '#DFFFEF', fontSize: '13px' }}>{row.label}</span>
                <span style={{ color: row.highlight ? '#22c55e' : '#fff', fontWeight: row.highlight ? 900 : 700, fontSize: row.highlight ? '15px' : '13px', fontFamily: 'monospace' }}>
                  {row.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}