import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, X, HelpCircle } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts';
import PricingCalculatorTour from './PricingCalculatorTour';

const RETURN_PER_ENRICHMENT = 0.75;

const S = { muted: '#D9ECFF', mutedGreen: '#DFFFEF' };

const TIER_COLORS = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#f97316'];

const TIERS = [
  { label: 'Starter',     range: '0 – 5,000',         min: 0,      rate: 0.17, rateLabel: '$0.17 / enriched visit', cap: 5000,    color: TIER_COLORS[0] },
  { label: 'Growth',      range: '5,001 – 15,000',    min: 5000,   rate: 0.15, rateLabel: '$0.15 / enriched visit', cap: 10000,   color: TIER_COLORS[1] },
  { label: 'Scale',       range: '15,001 – 30,000',   min: 15000,  rate: 0.13, rateLabel: '$0.13 / enriched visit', cap: 15000,   color: TIER_COLORS[2] },
  { label: 'Business',    range: '30,001 – 50,000',   min: 30000,  rate: 0.11, rateLabel: '$0.11 / enriched visit', cap: 20000,   color: TIER_COLORS[3] },
  { label: 'Pro',         range: '50,001 – 100,000',  min: 50000,  rate: 0.10, rateLabel: '$0.10 / enriched visit', cap: 50000,   color: TIER_COLORS[4] },
  { label: 'Enterprise',  range: '100,001 – 250,000', min: 100000, rate: 0.09, rateLabel: '$0.09 / enriched visit', cap: 150000,  color: TIER_COLORS[5] },
  { label: 'Elite',       range: '250,001+',          min: 250000, rate: 0.08, rateLabel: '$0.08 / enriched visit', cap: Infinity,color: TIER_COLORS[6] },
];

function clamp(x, lo, hi) { return Math.min(Math.max(x, lo), hi); }

function calcTiers(v) {
  return TIERS.map(t => {
    const charged = t.cap === Infinity ? Math.max(0, v - t.min) : clamp(v - t.min, 0, t.cap);
    return { ...t, charged, subtotal: charged * t.rate };
  });
}

function calcCost(v) {
  return calcTiers(v).reduce((s, t) => s + t.subtotal, 0);
}

function fmt(n) { return Math.floor(n).toLocaleString('en-US'); }
function fmtUSD(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CHART_POINTS = [1000, 5000, 15000, 30000, 50000, 100000, 250000];

function buildChartData(ratePercent) {
  return CHART_POINTS.map(enriched => {
    const cost = calcCost(enriched);
    const cpe = enriched > 0 ? cost / enriched : 0;
    const visits = Math.round(enriched / (ratePercent / 100));
    const returnVal = RETURN_PER_ENRICHMENT;
    return { enriched, visits, cost, cpe: parseFloat(cpe.toFixed(4)), returnPerEnrichment: returnVal };
  });
}

function CpeTooltip({ active, payload, ratePercent }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: '#06162A', border: '1px solid rgba(26,92,168,0.6)', borderRadius: '8px', padding: '12px 16px', fontSize: '12px' }}>
      <p style={{ color: '#D9ECFF', fontWeight: 700, marginBottom: '6px' }}>{fmt(d.enriched)} enriched visits</p>
      <p style={{ color: '#4a6a9a', marginBottom: '3px' }}>~{fmt(d.visits)} website visits @ {ratePercent}%</p>
      <p style={{ color: '#22c55e', fontWeight: 700, marginBottom: '3px' }}>Cost / enriched visit: ${d.cpe.toFixed(4)}</p>
      <p style={{ color: '#fff', fontWeight: 800 }}>Monthly cost: {fmtUSD(d.cost)}</p>
    </div>
  );
}

function ReturnTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const totalReturn = d.enriched * RETURN_PER_ENRICHMENT;
  const totalCost = d.cost;
  const profit = totalReturn - totalCost;
  return (
    <div style={{ background: '#06162A', border: '1px solid rgba(26,92,168,0.6)', borderRadius: '8px', padding: '12px 16px', fontSize: '12px' }}>
      <p style={{ color: '#D9ECFF', fontWeight: 700, marginBottom: '6px' }}>{fmt(d.enriched)} enriched visits</p>
      <p style={{ color: '#f59e0b', fontWeight: 700, marginBottom: '3px' }}>Return / enriched visit: ${RETURN_PER_ENRICHMENT.toFixed(2)}</p>
      <p style={{ color: '#fff', fontWeight: 800, marginBottom: '3px' }}>Total return: {fmtUSD(totalReturn)}</p>
      <p style={{ color: profit >= 0 ? '#22c55e' : '#ef4444', fontWeight: 800 }}>Net: {fmtUSD(profit)}</p>
    </div>
  );
}

function CombinedTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const totalReturn = d.enriched * RETURN_PER_ENRICHMENT;
  const profit = totalReturn - d.cost;
  return (
    <div style={{ background: '#06162A', border: '1px solid rgba(26,92,168,0.6)', borderRadius: '8px', padding: '12px 16px', fontSize: '12px' }}>
      <p style={{ color: '#D9ECFF', fontWeight: 700, marginBottom: '8px' }}>{fmt(d.enriched)} enriched visits</p>
      <p style={{ color: '#3b82f6', fontWeight: 700, marginBottom: '3px' }}>Cost / visit: ${d.cpe.toFixed(4)}</p>
      <p style={{ color: '#f59e0b', fontWeight: 700, marginBottom: '3px' }}>Return / visit: ${RETURN_PER_ENRICHMENT.toFixed(2)}</p>
      <p style={{ color: profit >= 0 ? '#22c55e' : '#ef4444', fontWeight: 800, marginTop: '6px', borderTop: '1px solid rgba(26,92,168,0.3)', paddingTop: '6px' }}>
        Net per visit: ${(RETURN_PER_ENRICHMENT - d.cpe).toFixed(4)}
      </p>
    </div>
  );
}

export default function EnrichedVisitsCalculator() {
    const [visitsRaw, setVisitsRaw] = useState('');
    const [rateRaw, setRateRaw] = useState('55');
    const [rateError, setRateError] = useState('');
    const [showPrompt, setShowPrompt] = useState(true);
    const [promptInput, setPromptInput] = useState('');
    const [modalStep, setModalStep] = useState(0); // 0=closed, 1=form, 2=confirmation
    const [formData, setFormData] = useState({ email: '', phone: '', company: '', url: '', monthlyVisits: '' });
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
      // Check if user has seen the tour before
      const hasSeenTour = localStorage.getItem('pricingCalcTourSeen');
      if (!hasSeenTour && visitsRaw === '') {
        // Show tour on first load (optional - set to false if you want manual trigger only)
        // setShowTour(true);
      }
    }, []);

   const handlePromptSubmit = () => {
     if (promptInput.trim()) {
       setVisitsRaw(promptInput.replace(/[^0-9]/g, ''));
       setShowPrompt(false);
       setPromptInput('');
     }
   };

   const handlePromptClose = () => {
     setShowPrompt(false);
   };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setModalStep(2);
  };

  const visitsInt = Math.max(0, Math.floor(parseFloat(visitsRaw.replace(/,/g, '')) || 0));

  const parseRate = (raw) => {
    const cleaned = String(raw).replace('%', '').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 55;
    if (num > 0 && num <= 1) return num * 100;
    return num;
  };

  const rateParsed = parseRate(rateRaw);
  const ratePercent = clamp(isNaN(rateParsed) ? 55 : rateParsed, 35, 70);
  const enrichedVisits = Math.floor(visitsInt * (ratePercent / 100));

  const tierRows = useMemo(() => calcTiers(enrichedVisits), [enrichedVisits]);
  const totalCost = tierRows.reduce((sum, t) => sum + t.subtotal, 0);
  const cpeAvg = enrichedVisits > 0 ? totalCost / enrichedVisits : 0;
  const isRare = ratePercent < 45 || ratePercent > 60;

  const chartData = useMemo(() => buildChartData(ratePercent), [ratePercent]);

  // Find the closest chart point to the user's enriched visits for the reference line
  const refX = useMemo(() => {
    if (enrichedVisits === 0) return null;
    let closest = chartData[0];
    chartData.forEach(d => {
      if (Math.abs(d.enriched - enrichedVisits) < Math.abs(closest.enriched - enrichedVisits)) closest = d;
    });
    return closest.enriched;
  }, [enrichedVisits, chartData]);

  const activeTierIdx = useMemo(() => {
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (enrichedVisits > TIERS[i].min) return i;
    }
    return 0;
  }, [enrichedVisits]);

  const handleRateBlur = () => {
    const parsed = parseRate(rateRaw);
    if (isNaN(parsed) || parsed < 35) { setRateRaw('35'); setRateError('Minimum enrichment rate is 35%.'); }
    else if (parsed > 70) { setRateRaw('70'); setRateError('Maximum enrichment rate is 70%.'); }
    else setRateError('');
  };

  const handleRateChange = (e) => { setRateRaw(e.target.value.replace('%', '')); setRateError(''); };
  const handleVisitsChange = (e) => { setVisitsRaw(e.target.value.replace(/[^0-9]/g, '')); };
  const handleReset = () => { setVisitsRaw(''); setRateRaw('55'); setRateError(''); };

  return (
    <div>
      {showPrompt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)',
            border: '1px solid rgba(26,92,168,0.6)', borderRadius: '16px', padding: '36px',
            maxWidth: '400px', width: '90%'
          }}>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '20px', marginBottom: '12px' }}>
              Calculate Your Pricing
            </h3>
            <p style={{ color: '#D9ECFF', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
              Enter your estimated monthly website visits to see your personalized pricing and ROI.
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g., 12,000"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyPress={(e) => e.key === 'Enter' && handlePromptSubmit()}
              className="ark-input"
              style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handlePromptSubmit}
                disabled={!promptInput.trim()}
                className="ark-btn-green"
                style={{
                  flex: 1, padding: '12px 20px', fontSize: '14px', fontWeight: 700,
                  opacity: promptInput.trim() ? 1 : 0.5, cursor: promptInput.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Calculate
              </button>
              <button
                onClick={handlePromptClose}
                style={{
                  padding: '12px 20px', fontSize: '14px', fontWeight: 700,
                  background: 'transparent', border: '1px solid rgba(212,212,216,0.3)',
                  color: '#D9ECFF', borderRadius: '6px', cursor: 'pointer'
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CALCULATOR CARD */}
      <div style={{
        background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)',
        border: '1px solid rgba(26,92,168,0.5)',
        borderRadius: '16px', padding: '36px', marginBottom: '28px',
        boxShadow: '0 0 60px rgba(26,92,168,0.1)',
      }}>
        {/* Color accent bar */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #B1001A, #1a5ca8, #22c55e)', borderRadius: '2px', marginBottom: '28px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.3px' }}>
            Enter Your Estimated Monthly Website Visits
          </h2>
          <button
            onClick={() => {
              setShowTour(true);
              localStorage.removeItem('pricingCalcTourSeen');
            }}
            style={{
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#22c55e',
              borderRadius: '6px',
              padding: '8px 14px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.25)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'; }}
          >
            <HelpCircle size={16} /> Tour
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '28px' }}>
          <div data-tour="visits-input">
            <label style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Monthly Website Visits
            </label>
            <input type="text" inputMode="numeric" value={visitsRaw} onChange={handleVisitsChange}
              placeholder="e.g., 12,000" className="ark-input"
              style={{ fontSize: '17px', fontWeight: 700, borderColor: 'rgba(26,92,168,0.6)' }} />
            <p style={{ color: '#3ab870', fontSize: '11px', marginTop: '6px', lineHeight: 1.55 }}>
              Total website traffic. Billing is based on Enriched Visits.
            </p>
          </div>
          <div data-tour="enrichment-rate">
            <label style={{ color: '#7eb8ff', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Enrichment Rate <span style={{ color: '#4a6a9a', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(35% – 70%)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input type="text" inputMode="decimal" value={rateRaw} onChange={handleRateChange} onBlur={handleRateBlur}
                className="ark-input" style={{ fontSize: '17px', fontWeight: 700, paddingRight: '34px', borderColor: 'rgba(26,92,168,0.6)' }} />
              <span style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#4a6a9a', fontSize: '16px', fontWeight: 700, pointerEvents: 'none' }}>%</span>
            </div>
            <p style={{ color: '#3ab870', fontSize: '11px', marginTop: '6px', lineHeight: 1.55 }}>
              Percent of visits that become billable Enriched Visits.
            </p>
            {rateError && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '5px', fontWeight: 600 }}>⚠ {rateError}</p>}
            {!rateError && isRare && <p style={{ color: '#f59e0b', fontSize: '11px', marginTop: '5px', fontWeight: 600, lineHeight: 1.5 }}>Note: Enrichment rates below 45% or above 60% are rare.</p>}
          </div>
        </div>


        {/* Total cost */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(177,0,26,0.15) 0%, rgba(10,33,66,0.6) 60%, rgba(4,32,22,0.4) 100%)',
          border: '1px solid rgba(177,0,26,0.4)', borderRadius: '12px', padding: '28px 28px',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
        }}>
          <div>
            <p style={{ color: '#ff8a99', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Estimated Monthly Cost After Free Trial</p>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(36px, 5vw, 54px)', letterSpacing: '-2.5px', lineHeight: 1 }}>{fmtUSD(totalCost)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#4a6a9a', fontSize: '11px', marginBottom: '6px' }}>Avg. cost per enriched visit</p>
            <p style={{ color: '#22c55e', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.5px' }}>${cpeAvg.toFixed(4)}</p>
            <p style={{ color: '#4a6a9a', fontSize: '11px', marginTop: '4px' }}>{fmt(enrichedVisits)} enriched visits</p>
          </div>
        </div>

        {/* Free Trial CTA */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={() => setModalStep(1)} style={{
              width: '100%',
              background: 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)',
              border: '1px solid rgba(34,197,94,0.45)',
              borderRadius: '10px',
              padding: '18px 32px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '-0.2px',
              boxShadow: '0 4px 24px rgba(34,197,94,0.2)',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #0a6e3b 0%, #0d8f4c 50%, #0a6e3b 100%)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(34,197,94,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(34,197,94,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Start Your Free 30-Day Trial
            </button>
          <p style={{ color: '#3ab870', fontSize: '14px', marginTop: '8px' }}>No credit card required · Cancel anytime</p>
        </div>

        {/* Modal */}
        {modalStep > 0 && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,15,0.85)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }} onClick={() => setModalStep(0)}>
            <div style={{
              background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)',
              border: '1px solid rgba(34,197,94,0.35)', borderRadius: '16px',
              padding: '36px', width: '100%', maxWidth: '480px', position: 'relative',
            }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setModalStep(0)} style={{
                position: 'absolute', top: '16px', right: '16px', background: 'none',
                border: 'none', color: '#4a6a9a', cursor: 'pointer', padding: '4px',
              }}>
                <X size={20} />
              </button>

              {modalStep === 1 && (
                <>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '6px', letterSpacing: '-0.5px' }}>Start Your Free Trial</h3>
                  <p style={{ color: '#4a6a9a', fontSize: '13px', marginBottom: '24px' }}>Tell us a bit about yourself to get started.</p>
                  <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Email', key: 'email', type: 'email', placeholder: 'you@company.com' },
                      { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1 (555) 000-0000' },
                      { label: 'Company Name', key: 'company', type: 'text', placeholder: 'Acme Inc.' },
                      { label: 'Company URL', key: 'url', type: 'url', placeholder: 'https://yourcompany.com' },
                      { label: 'Estimated Monthly Website Visits', key: 'monthlyVisits', type: 'text', placeholder: 'e.g. 50,000' },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <label style={{ color: '#D9ECFF', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{label}</label>
                        <input
                          required
                          type={type}
                          placeholder={placeholder}
                          value={formData[key]}
                          onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                          className="ark-input"
                        />
                      </div>
                    ))}
                    <button type="submit" style={{
                      marginTop: '8px', width: '100%',
                      background: 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)',
                      border: '1px solid rgba(34,197,94,0.45)', borderRadius: '8px',
                      padding: '14px', color: '#fff', fontSize: '15px', fontWeight: 800,
                      cursor: 'pointer',
                    }}>Continue →</button>
                  </form>
                </>
              )}

              {modalStep === 2 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎉</div>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', marginBottom: '10px' }}>You're all set!</h3>
                  <p style={{ color: '#4a6a9a', fontSize: '14px', marginBottom: '28px' }}>Click below to access the Ark Data platform and start your free trial.</p>
                  <a
                    href="https://app.arkdata.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block', width: '100%',
                      background: 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)',
                      border: '1px solid rgba(34,197,94,0.45)', borderRadius: '8px',
                      padding: '16px', color: '#fff', fontSize: '16px', fontWeight: 800,
                      textDecoration: 'none', letterSpacing: '-0.2px',
                      boxShadow: '0 4px 24px rgba(34,197,94,0.2)',
                    }}
                  >
                    Go to app.arkdata.io →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CHART 1 — Cost per Enriched Visit */}
      <div style={{ background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)', border: '1px solid rgba(26,92,168,0.4)', borderRadius: '14px', padding: '28px', marginBottom: '28px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '17px', marginBottom: '4px' }}>
            Cost per Enriched Visit <span style={{ color: '#4a6a9a', fontWeight: 400 }}>vs. Monthly Volume</span>
          </h2>
          <p style={{ color: '#4a6a9a', fontSize: '12px' }}>
            Shows how your effective cost per enriched visit drops as volume increases.
            {enrichedVisits > 0 && (
              <span style={{ color: '#22c55e', fontWeight: 600 }}> Your position: {fmt(enrichedVisits)} enriched visits @ ${cpeAvg.toFixed(4)}/visit.</span>
            )}
          </p>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="cpeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1a5ca8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1a5ca8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,33,66,0.9)" />
            <XAxis
              dataKey="enriched"
              tickFormatter={v => v >= 1000000 ? `${v/1000000}M` : v >= 1000 ? `${v/1000}k` : v}
              tick={{ fill: '#4a6a9a', fontSize: 10 }}
              axisLine={{ stroke: '#0A2142' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => `$${v.toFixed(2)}`}
              tick={{ fill: '#4a6a9a', fontSize: 10 }}
              axisLine={{ stroke: '#0A2142' }}
              tickLine={false}
              width={52}
              domain={[0.10, 0.20]}
              ticks={[0.10, 0.12, 0.14, 0.16, 0.18, 0.20]}
            />
            <Tooltip content={<CpeTooltip ratePercent={ratePercent} />} />
            {refX !== null && (
              <ReferenceLine x={refX} stroke="#B1001A" strokeDasharray="4 3" strokeWidth={2}
                label={{ value: 'You', fill: '#ff8a99', fontSize: 11, fontWeight: 700, position: 'insideTopRight', dy: 60 }} />
            )}
            <Area type="monotone" dataKey="cpe" stroke="#3b82f6" strokeWidth={2.5}
              fill="url(#cpeGradient)" dot={false}
              activeDot={{ r: 5, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>

        {/* Tier legend */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(10,33,66,0.8)' }}>
          {TIERS.map((t, i) => (
            <div key={t.label} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: i === activeTierIdx ? `${t.color}22` : 'transparent',
              border: `1px solid ${i === activeTierIdx ? t.color + '66' : 'transparent'}`,
              borderRadius: '5px', padding: '3px 8px', transition: 'all 0.2s',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ color: i === activeTierIdx ? '#fff' : '#4a6a9a', fontSize: '10px', fontWeight: i === activeTierIdx ? 700 : 400 }}>
                {t.label} ${t.rate}
              </span>
            </div>
          ))}
        </div>
      </div>

{/* CHART 3 — ROI Growth Over Time */}
<div style={{ background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '14px', padding: '28px', marginBottom: '28px' }}>
  <div style={{ marginBottom: '20px' }}>
    <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '17px', marginBottom: '4px' }}>
      Return Growth Over Time <span style={{ color: '#4a6a9a', fontWeight: 400 }}>— Stacked Monthly View</span>
    </h2>
    <p style={{ color: '#4a6a9a', fontSize: '12px' }}>
      Your return per enriched visit grows monthly, while costs remain stable. This compounds your margins as you scale.
    </p>
  </div>

  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={[
      { month: 'Month 1', cost: 0.17, return: 0.30 },
      { month: 'Month 2', cost: 0.17, return: 0.45 },
      { month: 'Month 3', cost: 0.17, return: 0.60 },
      { month: 'Month 4', cost: 0.17, return: 0.75 },
      { month: 'Month 5', cost: 0.17, return: 0.80 },
      { month: 'Month 6', cost: 0.17, return: 0.85 },
    ]} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,33,66,0.9)" />
      <XAxis
        dataKey="month"
        tick={{ fill: '#4a6a9a', fontSize: 10 }}
        axisLine={{ stroke: '#0A2142' }}
        tickLine={false}
      />
      <YAxis
        tickFormatter={v => `$${v.toFixed(2)}`}
        tick={{ fill: '#4a6a9a', fontSize: 10 }}
        axisLine={{ stroke: '#0A2142' }}
        tickLine={false}
        width={52}
      />
      <Tooltip
        contentStyle={{ background: 'rgba(2,13,31,0.95)', border: '1px solid rgba(26,92,168,0.6)', borderRadius: '6px', padding: '8px 12px' }}
        formatter={(value) => `$${value.toFixed(2)}`}
        labelStyle={{ color: '#D9ECFF', fontSize: '12px' }}
      />
      <Legend
        formatter={(val) => <span style={{ color: '#D9ECFF', fontSize: '11px' }}>{val}</span>}
        wrapperStyle={{ paddingTop: '12px' }}
      />
      <Bar dataKey="cost" name="Cost Per Visit" fill="#ef4444" stackId="a" />
      <Bar dataKey="return" name="Return Per Enrichment" fill="#22c55e" stackId="a" />
    </BarChart>
  </ResponsiveContainer>
</div>

      {/* TIER BREAKDOWN TABLE */}
      <div style={{ background: 'linear-gradient(145deg, #071829 0%, #040E1A 100%)', border: '1px solid rgba(26,92,168,0.4)', borderRadius: '14px', overflow: 'hidden', marginBottom: '28px' }}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #0A2142', background: 'rgba(10,33,66,0.3)' }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '17px', marginBottom: '3px' }}>
            Tier Breakdown <span style={{ color: '#4a6a9a', fontWeight: 400 }}>(Based on Enriched Visits)</span>
          </h2>
          <p style={{ color: '#4a6a9a', fontSize: '12px' }}>
            {fmt(enrichedVisits)} enriched visits · Total: <span style={{ color: '#ff8a99', fontWeight: 700 }}>{fmtUSD(totalCost)}</span>
          </p>
          <p style={{ color: '#7eb8ff', fontSize: '11px', marginTop: '8px' }}>
            <em>Estimate based on historical data from past clients. Actual results may vary.</em>
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
            <thead>
              <tr style={{ background: 'rgba(2,13,31,0.8)' }}>
                {['Tier Range', 'Visits in Tier', 'Rate', 'Subtotal'].map((h, i) => (
                  <th key={h} style={{ padding: '12px 20px', color: '#7eb8ff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tierRows.map((t, i) => {
                const isActive = t.charged > 0;
                return (
                  <tr key={t.label} style={{ borderBottom: i < tierRows.length - 1 ? '1px solid rgba(10,33,66,0.8)' : 'none', background: isActive ? `${t.color}0d` : 'transparent' }}>
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? t.color : '#1e2a3a', flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ color: isActive ? '#fff' : '#2a3a5a', fontSize: '13px', fontWeight: 700, marginRight: '4px' }}>Tier {t.label}</span>
                        <span style={{ color: isActive ? '#4a6a9a' : '#1e2a3a', fontSize: '12px' }}>{t.range}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', color: isActive ? '#fff' : '#2a3a5a', fontSize: '13px', fontWeight: 600, textAlign: 'right', fontFamily: 'monospace' }}>{fmt(t.charged)}</td>
                    <td style={{ padding: '13px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span style={{ color: isActive ? t.color : '#2a3a5a', fontSize: '12px', fontWeight: 700, background: isActive ? `${t.color}15` : 'transparent', border: `1px solid ${isActive ? t.color + '33' : 'transparent'}`, borderRadius: '4px', padding: '2px 7px' }}>
                        {t.rateLabel}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', color: isActive ? '#fff' : '#2a3a5a', fontSize: '13px', fontWeight: 700, textAlign: 'right', fontFamily: 'monospace' }}>{fmtUSD(t.subtotal)}</td>
                  </tr>
                );
              })}
              <tr style={{ background: 'rgba(177,0,26,0.1)', borderTop: '2px solid rgba(177,0,26,0.4)' }}>
                <td colSpan={3} style={{ padding: '15px 20px', color: '#ff8a99', fontSize: '13px', fontWeight: 800 }}>Total Monthly Cost</td>
                <td style={{ padding: '15px 20px', color: '#fff', fontSize: '16px', fontWeight: 900, textAlign: 'right', fontFamily: 'monospace' }}>{fmtUSD(totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* NOTES + EXAMPLE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(177,0,26,0.07)', border: '1px solid rgba(177,0,26,0.25)', borderRadius: '12px', padding: '24px 28px' }}>
          <p style={{ color: '#ff8a99', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Important Notes</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Billing is based on Enriched Visits, not raw website visits.',
              'Enriched Visits = floor(Website Visits x Enrichment Rate).',
              "Pricing is stacked: you only pay each tier's rate for visits inside that tier.",
              'All enriched visits are billed at the applicable tier rate.',
            ].map((note, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#ff8a99', fontWeight: 700, fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>→</span>
                <span style={{ color: S.muted, fontSize: '13px', lineHeight: 1.6 }}>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '12px', padding: '24px 28px' }}>
          <p style={{ color: '#22c55e', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
            Example with Your Current Inputs
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { label: 'Website Visits',             val: fmt(visitsInt),              color: '#7eb8ff', tour: 'visits-example' },
              { label: 'Enrichment Rate',            val: `${ratePercent}%`,           color: '#a78bfa', tour: 'enrichment-example' },
              { label: 'Enriched Visits',            val: fmt(enrichedVisits),         color: '#34d399', tour: 'contacts-row' },
              { label: 'Avg. Cost / Enriched Visit', val: `$${cpeAvg.toFixed(4)}`,    color: '#fbbf24' },
              { label: 'Estimated Monthly Cost',     val: fmtUSD(totalCost),           color: '#ff8a99', large: true, tour: 'cost-row' },
            ].map((row, i, arr) => (
              <div key={row.label} data-tour={row.tour} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(34,197,94,0.12)' : 'none' }}>
                <span style={{ color: S.mutedGreen, fontSize: '13px' }}>{row.label}</span>
                <span style={{ color: row.color, fontWeight: row.large ? 900 : 700, fontSize: row.large ? '16px' : '13px', fontFamily: 'monospace' }}>{row.val}</span>
              </div>
            ))}
          </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: '48px', borderTop: '1px solid rgba(34,197,94,0.15)', paddingTop: '36px', paddingBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <button data-tour="trial-button" onClick={() => setModalStep(1)} style={{
                display: 'block',
                width: '100%',
                background: 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)',
                border: '1px solid rgba(34,197,94,0.45)',
                borderRadius: '10px',
                padding: '18px 32px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: '-0.2px',
                boxShadow: '0 4px 24px rgba(34,197,94,0.2)',
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #0a6e3b 0%, #0d8f4c 50%, #0a6e3b 100%)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(34,197,94,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #064e2a 0%, #0a6e3b 50%, #064e2a 100%)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(34,197,94,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Start Your Free 30-Day Trial
              </button>
            <p style={{ color: '#3ab870', fontSize: '14px', marginTop: '8px' }}>No credit card required · Cancel anytime</p>
              </div>
              </div>

              <PricingCalculatorTour 
              isOpen={showTour} 
              onClose={() => {
              setShowTour(false);
              localStorage.setItem('pricingCalcTourSeen', 'true');
              }} 
              />
              </div>
              );
          }