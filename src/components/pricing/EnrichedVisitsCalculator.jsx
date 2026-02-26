import React, { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF' };

const TIERS = [
  { label: 'A', range: '0 – 1,000',        min: 0,      max: 1000,   cap: 1000,   rate: 0,    rateLabel: 'FREE' },
  { label: 'B', range: '1,001 – 5,000',    min: 1000,   max: 5000,   cap: 4000,   rate: 0.16, rateLabel: '$0.16 / enriched visit' },
  { label: 'C', range: '5,001 – 15,000',   min: 5000,   max: 15000,  cap: 10000,  rate: 0.13, rateLabel: '$0.13 / enriched visit' },
  { label: 'D', range: '15,001 – 30,000',  min: 15000,  max: 30000,  cap: 15000,  rate: 0.11, rateLabel: '$0.11 / enriched visit' },
  { label: 'E', range: '30,001 – 50,000',  min: 30000,  max: 50000,  cap: 20000,  rate: 0.10, rateLabel: '$0.10 / enriched visit' },
  { label: 'F', range: '50,001 – 100,000', min: 50000,  max: 100000, cap: 50000,  rate: 0.09, rateLabel: '$0.09 / enriched visit' },
  { label: 'G', range: '100,001 – 250,000',min: 100000, max: 250000, cap: 150000, rate: 0.09, rateLabel: '$0.09 / enriched visit' },
  { label: 'H', range: '250,001+',         min: 250000, max: Infinity,cap: Infinity,rate: 0.08,rateLabel: '$0.08 / enriched visit' },
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
    const subtotal = charged * t.rate;
    return { ...t, charged, subtotal };
  });
}

function fmt(n) { return n.toLocaleString('en-US'); }
function fmtUSD(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EnrichedVisitsCalculator() {
  const [visitsRaw, setVisitsRaw] = useState('');
  const [rateRaw, setRateRaw] = useState('55');
  const [rateError, setRateError] = useState('');

  const visitsInt = Math.max(0, Math.floor(parseFloat(visitsRaw) || 0));
  const rateParsed = parseFloat(rateRaw) || 0;
  const ratePercent = clamp(rateParsed, 35, 70);
  const enrichedVisits = Math.floor(visitsInt * (ratePercent / 100));

  const tierRows = useMemo(() => calcTiers(enrichedVisits), [enrichedVisits]);
  const totalCost = tierRows.reduce((sum, t) => sum + t.subtotal, 0);

  const isRare = ratePercent < 45 || ratePercent > 60;

  const handleRateBlur = () => {
    const parsed = parseFloat(rateRaw) || 0;
    if (parsed < 35) {
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
    const val = e.target.value.replace('%', '').replace(/[^0-9.]/g, '');
    setRateRaw(val);
    setRateError('');
  };

  const handleVisitsChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setVisitsRaw(val);
  };

  const handleReset = () => {
    setVisitsRaw('');
    setRateRaw('55');
    setRateError('');
  };

  return (
    <div style={{ marginBottom: '60px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{ color: '#B1001A', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Cost Estimator</p>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(22px, 2.5vw, 30px)', letterSpacing: '-0.5px', marginBottom: '10px' }}>
          Estimate Your Monthly Cost
        </h2>
        <p style={{ color: S.muted, fontSize: '14px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
          Estimate your monthly cost using Enriched Visits (a percentage of your website visits).
        </p>
      </div>

      {/* Calculator Card */}
      <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '14px', padding: '36px', marginBottom: '24px', maxWidth: '860px', margin: '0 auto 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '17px' }}>Enter Your Estimated Monthly Website Visits</h3>
          <button onClick={handleReset}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #0A2142', borderRadius: '6px', padding: '7px 14px', color: S.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={12} /> Reset
          </button>
        </div>

        {/* Inputs Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
          {/* Visits Input */}
          <div>
            <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>
              Estimated Monthly Website Visits
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={visitsRaw}
              onChange={handleVisitsChange}
              placeholder="e.g., 12000"
              className="ark-input"
              style={{ fontSize: '16px', fontWeight: 700 }}
            />
            <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '6px', lineHeight: 1.5 }}>
              We bill based on Enriched Visits, calculated from your website visits using the enrichment rate.
            </p>
          </div>

          {/* Rate Input */}
          <div>
            <label style={{ color: S.muted, fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>
              Enrichment Rate <span style={{ color: '#4a6a9a', fontWeight: 400 }}>(35% – 70%)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                inputMode="decimal"
                value={rateRaw}
                onChange={handleRateChange}
                onBlur={handleRateBlur}
                className="ark-input"
                style={{ fontSize: '16px', fontWeight: 700, paddingRight: '36px' }}
              />
              <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4a6a9a', fontSize: '16px', fontWeight: 700, pointerEvents: 'none' }}>%</span>
            </div>
            <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '6px', lineHeight: 1.5 }}>
              This is the percent of visits that become billable Enriched Visits.
            </p>
            {rateError && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '5px', fontWeight: 600 }}>⚠ {rateError}</p>
            )}
            {isRare && !rateError && (
              <p style={{ color: '#f59e0b', fontSize: '11px', marginTop: '5px', fontWeight: 600 }}>
                Note: Enrichment rates below 45% or above 60% are rare.
              </p>
            )}
          </div>
        </div>

        {/* Computed Summary */}
        <div style={{ background: '#020D1F', border: '1px solid #0A2142', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '16px' }}>
            <div>
              <p style={{ color: '#4a6a9a', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>Website Visits Entered</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>{fmt(visitsInt)}</p>
            </div>
            <div>
              <p style={{ color: '#4a6a9a', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>Enrichment Rate</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>{ratePercent}%</p>
            </div>
            <div>
              <p style={{ color: '#4a6a9a', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>Estimated Enriched Visits</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>{fmt(enrichedVisits)}</p>
            </div>
          </div>
          <p style={{ color: '#4a6a9a', fontSize: '11px', fontFamily: 'monospace' }}>
            Calculation: floor({fmt(visitsInt)} × {ratePercent}%) = {fmt(enrichedVisits)}
          </p>
        </div>

        {/* Total Cost — Most Prominent */}
        <div style={{ background: 'linear-gradient(135deg, #0A2142 0%, #06162A 100%)', border: '1px solid #1a5ca8', borderRadius: '10px', padding: '28px', textAlign: 'center' }}>
          <p style={{ color: S.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Estimated Monthly Cost</p>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(36px, 5vw, 52px)', letterSpacing: '-2px', lineHeight: 1 }}>
            {fmtUSD(totalCost)}
          </p>
          <p style={{ color: '#4a6a9a', fontSize: '12px', marginTop: '8px' }}>Calculated on {fmt(enrichedVisits)} enriched visits via stacked tier pricing</p>
        </div>
      </div>

      {/* Tier Breakdown Table */}
      <div style={{ background: '#06162A', border: '1px solid #0A2142', borderRadius: '12px', overflow: 'hidden', maxWidth: '860px', margin: '0 auto 24px' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #0A2142' }}>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '16px', marginBottom: '2px' }}>Tier Breakdown</h3>
          <p style={{ color: '#4a6a9a', fontSize: '12px' }}>Based on {fmt(enrichedVisits)} enriched visits</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#020D1F' }}>
                {['Tier', 'Range (Enriched Visits)', 'Visits Charged', 'Rate', 'Subtotal'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', color: S.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: h === 'Tier' || h === 'Range (Enriched Visits)' ? 'left' : 'right', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tierRows.map((t, i) => {
                const isActive = t.charged > 0;
                return (
                  <tr key={t.label} style={{ borderBottom: i < tierRows.length - 1 ? '1px solid #0A2142' : 'none', background: isActive ? 'rgba(26,92,168,0.06)' : 'transparent' }}>
                    <td style={{ padding: '13px 20px', color: isActive ? '#fff' : '#2a3a5a', fontSize: '12px', fontWeight: 700 }}>Tier {t.label}</td>
                    <td style={{ padding: '13px 20px', color: isActive ? S.muted : '#2a3a5a', fontSize: '12px' }}>{t.range}</td>
                    <td style={{ padding: '13px 20px', color: isActive ? '#fff' : '#2a3a5a', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>{fmt(t.charged)}</td>
                    <td style={{ padding: '13px 20px', color: isActive ? '#22c55e' : '#2a3a5a', fontSize: '12px', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {t.label === 'A' ? 'FREE' : t.rateLabel}
                    </td>
                    <td style={{ padding: '13px 20px', color: isActive ? '#fff' : '#2a3a5a', fontSize: '12px', fontWeight: 700, textAlign: 'right', fontFamily: 'monospace' }}>
                      {fmtUSD(t.subtotal)}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: '#020D1F', borderTop: '2px solid #1a5ca8' }}>
                <td colSpan={4} style={{ padding: '14px 20px', color: '#fff', fontSize: '13px', fontWeight: 800 }}>Total Monthly Cost</td>
                <td style={{ padding: '14px 20px', color: '#fff', fontSize: '14px', fontWeight: 900, textAlign: 'right', fontFamily: 'monospace' }}>{fmtUSD(totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanation */}
      <div style={{ background: '#020D1F', border: '1px solid #0A2142', borderRadius: '10px', padding: '24px 28px', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{ color: '#4a6a9a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>How Pricing Works</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            'Billing is based on Enriched Visits, calculated as: floor(Website Visits × Enrichment Rate).',
            'Pricing is stacked: each tier rate applies only to the enriched visits within that tier.',
            'Your first 1,000 enriched visits are always free.',
          ].map((note, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ color: '#1a5ca8', fontWeight: 700, fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>→</span>
              <span style={{ color: S.muted, fontSize: '13px', lineHeight: 1.6 }}>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}