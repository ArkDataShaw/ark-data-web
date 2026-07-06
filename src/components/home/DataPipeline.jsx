import React, { useRef, useEffect, useState, useCallback } from 'react';

// Unified pipeline: intent signals AND website visitors converge into one
// resolution pipeline, then fan back out to ad platforms + CRM at activation.
// Scroll-driven track (RAF, no React re-renders per frame).

function useScrollProgress(containerRef, offsetPercentage = 0.75, onUpdate) {
  const drawHeightRef = useRef(0);
  const rafId = useRef(0);

  const tick = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const targetY = window.innerHeight * offsetPercentage;
    const height = Math.max(0, Math.min(targetY - rect.top, rect.height));
    if (height !== drawHeightRef.current) {
      drawHeightRef.current = height;
      onUpdate?.(height);
    }
  }, [containerRef, offsetPercentage, onUpdate]);

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    tick();
    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [tick]);

  return drawHeightRef;
}

const icons = {
  visitor: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
      <line x1="12" y1="2" x2="12" y2="4" opacity="0.4" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" opacity="0.4" />
      <line x1="2" y1="12" x2="4" y2="12" opacity="0.4" />
    </svg>
  ),
  identified: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="11" r="2.5" />
      <path d="M15 9h3" />
      <path d="M15 12h3" />
      <path d="M5.5 17c0-1.5 1.5-2.5 3.5-2.5s3.5 1 3.5 2.5" />
    </svg>
  ),
  enriched: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  filter: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  delivered: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

const INTENT = '#19C37D';
const VISITOR = '#4A9EFF';

// Special content rendered inside step 1: the two converging sources
function DualSources() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px', maxWidth: '460px', marginBottom: '12px' }}>
      <div style={{ background: 'rgba(25,195,125,0.06)', border: '1px solid rgba(25,195,125,0.3)', borderLeft: `3px solid ${INTENT}`, borderRadius: '8px', padding: '12px 14px' }}>
        <p className="ark-mono" style={{ color: INTENT, fontSize: '9px', letterSpacing: '0.12em', fontWeight: 600, margin: '0 0 5px' }}>● INTENT SIGNAL</p>
        <p style={{ color: '#C9DBEE', fontSize: '12.5px', lineHeight: 1.55, margin: 0 }}>
          Someone starts researching your category — anywhere on the web. One of 12,000+ topics lights up.
        </p>
      </div>
      <div style={{ background: 'rgba(74,158,255,0.06)', border: '1px solid rgba(74,158,255,0.3)', borderLeft: `3px solid ${VISITOR}`, borderRadius: '8px', padding: '12px 14px' }}>
        <p className="ark-mono" style={{ color: VISITOR, fontSize: '9px', letterSpacing: '0.12em', fontWeight: 600, margin: '0 0 5px' }}>● WEBSITE VISITOR</p>
        <p style={{ color: '#C9DBEE', fontSize: '12.5px', lineHeight: 1.55, margin: 0 }}>
          Someone lands on your site. No form fill, no login — a session about to vanish.
        </p>
      </div>
    </div>
  );
}

// Special content rendered inside step 5: the fan-out destinations
function FanOut() {
  const chip = (label, color) => (
    <span key={label} className="ark-mono" style={{
      border: `1px solid ${color}55`, background: `${color}12`, color: '#C9DBEE',
      borderRadius: '100px', padding: '4px 12px', fontSize: '11px',
    }}>{label}</span>
  );
  return (
    <div style={{ maxWidth: '460px', marginBottom: '12px' }}>
      <p className="ark-mono" style={{ color: INTENT, fontSize: '9px', letterSpacing: '0.12em', fontWeight: 600, margin: '0 0 6px' }}>INTENT AUDIENCES → AD PLATFORMS</p>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {['Meta', 'Google Ads', 'DV360', 'TikTok', 'YouTube'].map(l => chip(l, INTENT))}
      </div>
      <p className="ark-mono" style={{ color: VISITOR, fontSize: '9px', letterSpacing: '0.12em', fontWeight: 600, margin: '0 0 6px' }}>RESOLVED VISITORS → YOUR STACK</p>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {['HubSpot', 'Slack', 'Klaviyo', 'HighLevel', 'Webhooks'].map(l => chip(l, VISITOR))}
      </div>
    </div>
  );
}

const STEPS = [
  {
    id: 'sources',
    title: 'Two signals. One pipeline.',
    description: 'Whether they are researching your category across the web or sitting on your pricing page right now, both kinds of buyers enter the same pipeline.',
    detail: 'Intent + visitor data unified — no separate tools.',
    icon: icons.visitor,
    extra: <DualSources />,
  },
  {
    id: 'identified',
    title: 'Identity Resolved',
    description: 'The signal is matched against our licensed identity graph and becomes a real, reachable person — name, verified email, phone. Person-level, B2B and B2C.',
    detail: 'Up to 60% of site visitors resolved.',
    icon: icons.identified,
  },
  {
    id: 'enriched',
    title: 'Record Enriched',
    description: '650+ data points appended: contact, professional, company, demographic, and household attributes — plus the intent topics this person is actively researching this week.',
    detail: '650+ data points + live intent topics per record.',
    icon: icons.enriched,
  },
  {
    id: 'qualified',
    title: 'Qualified & Scored',
    description: 'Every person is checked against your ideal customer profile and scored on intent — how recently, how often, and how deeply they are researching. Only in-market, ICP-fit people move forward.',
    detail: 'Only qualified, in-market buyers activate your spend.',
    icon: icons.filter,
  },
  {
    id: 'delivered',
    title: 'Activated Everywhere',
    description: 'The pipeline fans back out: intent audiences sync to your ad platforms as custom audiences, resolved visitors flow to your CRM, email flows, and Slack — always current, always qualified.',
    detail: 'Living audiences, synced automatically.',
    icon: icons.delivered,
    extra: <FanOut />,
  },
];

const BUFFER = 60;
const ACCENT = INTENT;
const ACCENT_DIM = 'rgba(25,195,125,0.55)';
const ACCENT_GLOW = 'rgba(25,195,125,0.45)';
const INACTIVE_BORDER = 'rgba(61,85,115,0.4)';
const INACTIVE_COLOR = '#3D5573';
const NODE_BG = '#081020';

export default function DataPipeline() {
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const iconRefs = useRef([]);
  const contentRefs = useRef([]);
  const detailRefs = useRef([]);
  const [stepOffsets, setStepOffsets] = useState([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateOffsets = () => {
      setStepOffsets(contentRefs.current.map(el => (el ? el.offsetTop : 0)));
    };
    const timer = setTimeout(updateOffsets, 100);
    window.addEventListener('resize', updateOffsets);
    return () => { clearTimeout(timer); window.removeEventListener('resize', updateOffsets); };
  }, []);

  const handleScrollUpdate = useCallback((height) => {
    if (lineRef.current) lineRef.current.style.height = `${height}px`;

    stepOffsets.forEach((stepTop, i) => {
      const iconTop = stepTop + 12;
      const distance = height - iconTop;
      const isAtDot = distance >= 0 && distance < BUFFER;
      const isPassed = distance >= BUFFER;
      const isHighlight = distance >= 0;

      const iconEl = iconRefs.current[i];
      if (iconEl) {
        if (isAtDot) {
          iconEl.style.borderColor = ACCENT;
          iconEl.style.color = ACCENT;
          iconEl.style.boxShadow = `0 0 24px ${ACCENT_GLOW}`;
          iconEl.style.transform = 'translateX(-50%) scale(1.15)';
          iconEl.style.background = '#091E27'; // opaque: NODE_BG + 8% green tint, so the track never shows through
        } else if (isPassed) {
          iconEl.style.borderColor = ACCENT;
          iconEl.style.color = ACCENT_DIM;
          iconEl.style.boxShadow = 'none';
          iconEl.style.transform = 'translateX(-50%) scale(1)';
          iconEl.style.background = NODE_BG;
        } else {
          iconEl.style.borderColor = INACTIVE_BORDER;
          iconEl.style.color = INACTIVE_COLOR;
          iconEl.style.boxShadow = 'none';
          iconEl.style.transform = 'translateX(-50%) scale(0.9)';
          iconEl.style.background = NODE_BG;
        }
      }

      const contentEl = contentRefs.current[i];
      if (contentEl) {
        contentEl.style.opacity = isHighlight ? '1' : '0.25';
        contentEl.style.transform = isHighlight ? 'translateX(0)' : 'translateX(1.5rem)';
        const title = contentEl.querySelector('h4');
        if (title) title.style.color = isHighlight ? '#fff' : '#3D5573';
      }

      const detailEl = detailRefs.current[i];
      if (detailEl) {
        detailEl.style.opacity = isHighlight ? '1' : '0';
        detailEl.style.transform = isHighlight ? 'translateY(0)' : 'translateY(8px)';
      }
    });
  }, [stepOffsets]);

  useScrollProgress(containerRef, 0.55, handleScrollUpdate);

  return (
    <section style={{ background: '#060D1A', padding: '96px 0' }}>
      <div className="sc">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>
            HOW IT WORKS
          </p>
          <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: '12px' }}>
            From signal to campaign. Automatically.
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '16px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.65 }}>
            Intent signals and website visitors run through one pipeline — resolved, enriched, qualified, and activated without anyone touching a CSV.
          </p>
        </div>

        <div
          ref={containerRef}
          style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', display: 'flex', gap: '48px', paddingLeft: '16px' }}
        >
          {/* Track */}
          <div style={{ position: 'relative', width: '4px', background: 'rgba(61,85,115,0.2)', borderRadius: '4px', flexShrink: 0 }}>
            <div
              ref={lineRef}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%',
                background: `linear-gradient(180deg, ${VISITOR} 0%, ${INTENT} 30%, ${INTENT} 100%)`,
                borderRadius: '4px',
                height: 0,
                transition: 'height 0.12s ease-out',
                willChange: 'height',
              }}
            >
              <div style={{
                position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
                width: '14px', height: '14px', background: ACCENT, borderRadius: '50%',
                boxShadow: `0 0 16px ${ACCENT_GLOW}, 0 0 32px rgba(25,195,125,0.22)`,
              }}>
                <div style={{
                  position: 'absolute', inset: '3px', background: '#fff', borderRadius: '50%',
                  animation: 'arkPulse 2s ease-in-out infinite',
                }} />
              </div>
            </div>

            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {STEPS.map((step, i) => (
                <div
                  key={step.id + '-icon'}
                  ref={el => { iconRefs.current[i] = el; }}
                  style={{
                    position: 'absolute', left: '50%',
                    width: '56px', height: '56px', borderRadius: '50%',
                    border: `2px solid ${INACTIVE_BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: NODE_BG, zIndex: 10,
                    color: INACTIVE_COLOR,
                    top: `${stepOffsets[i] || 0}px`,
                    marginTop: '12px',
                    transition: 'border-color 0.5s, color 0.5s, box-shadow 0.5s, transform 0.5s, background 0.5s',
                    transform: 'translateX(-50%) scale(0.9)',
                  }}
                >
                  {step.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '96px', padding: '40px 0' }}>
            {STEPS.map((step, i) => (
              <div
                key={step.id}
                ref={el => { contentRefs.current[i] = el; }}
                style={{
                  paddingLeft: '16px',
                  transition: 'opacity 0.5s, transform 0.5s',
                  opacity: 0.25,
                  transform: 'translateX(1.5rem)',
                }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(25,195,125,0.07)', border: '1px solid rgba(25,195,125,0.22)',
                  borderRadius: '100px', padding: '3px 12px', marginBottom: '12px',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACCENT, display: 'inline-block' }} />
                  <span className="ark-mono" style={{ color: '#6FE3B0', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em' }}>
                    STEP {i + 1}
                  </span>
                </div>
                <h4 className="ark-display" style={{
                  fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800,
                  letterSpacing: '-0.02em', marginBottom: '8px',
                  transition: 'color 0.5s', color: '#3D5573',
                }}>
                  {step.title}
                </h4>
                <p style={{ color: '#A9C1DC', fontSize: '15px', lineHeight: 1.7, marginBottom: '12px', maxWidth: '460px' }}>
                  {step.description}
                </p>
                {step.extra}
                <div
                  ref={el => { detailRefs.current[i] = el; }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#081020', border: '1px solid #14263F', borderRadius: '6px',
                    padding: '6px 14px',
                    transition: 'opacity 0.6s, transform 0.6s',
                    opacity: 0, transform: 'translateY(8px)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INTENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="ark-mono" style={{ color: '#6FE3B0', fontSize: '12px', fontWeight: 500 }}>{step.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes arkPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.6); }
        }
      `}</style>
    </section>
  );
}
