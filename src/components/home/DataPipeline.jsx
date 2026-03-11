import React, { useRef, useEffect, useState, useCallback } from 'react';

// ── Scroll progress hook (RAF-driven, no React re-renders) ─────────────────
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

// ── SVG Icons (stroke-based, inherit currentColor) ─────────────────────────
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

// ── Step data ──────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'visitor',
    title: 'Anonymous Visitor',
    description: 'Someone lands on your site. No form fill, no login — just another session about to vanish.',
    detail: '97% of traffic leaves without identifying themselves.',
    icon: icons.visitor,
  },
  {
    id: 'identified',
    title: 'Identity Resolved',
    description: 'Our pixel matches the session against our identity graph. Name, company, role, verified email — resolved in under 60 seconds.',
    detail: 'Up to 60% resolution rate.',
    icon: icons.identified,
  },
  {
    id: 'enriched',
    title: 'Record Enriched',
    description: '74 fields appended: company data, contact info, demographics, and household attributes — all validated and deduplicated.',
    detail: '74 enrichment fields per record.',
    icon: icons.enriched,
  },
  {
    id: 'matched',
    title: 'ICP Matched',
    description: 'Your visitor is checked against your ideal customer profile — industry, title, company size, geography, household attributes. Only qualified matches move forward.',
    detail: 'Only qualified visitors activate your campaigns.',
    icon: icons.filter,
  },
  {
    id: 'delivered',
    title: 'Activated Everywhere',
    description: 'Matched visitors flow into living audiences that sync with Meta retargeting, CRM workflows, or outbound sequences. Always current, always qualified.',
    detail: 'Living audiences synced to your channels.',
    icon: icons.delivered,
  },
];

const BUFFER = 60;
const ACCENT = '#B1001A';
const ACCENT_DIM = 'rgba(177,0,26,0.55)';
const ACCENT_GLOW = 'rgba(177,0,26,0.5)';
const INACTIVE_BORDER = 'rgba(26,92,168,0.3)';
const INACTIVE_COLOR = '#4a6a9a';

// ── Component ──────────────────────────────────────────────────────────────
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
      const offsets = contentRefs.current.map(el => {
        if (!el || !containerRef.current) return 0;
        return el.offsetTop;
      });
      setStepOffsets(offsets);
    };
    const timer = setTimeout(updateOffsets, 100);
    window.addEventListener('resize', updateOffsets);
    return () => { clearTimeout(timer); window.removeEventListener('resize', updateOffsets); };
  }, []);

  const handleScrollUpdate = useCallback((height) => {
    if (lineRef.current) {
      lineRef.current.style.height = `${height}px`;
    }

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
          iconEl.style.background = 'rgba(177,0,26,0.08)';
        } else if (isPassed) {
          iconEl.style.borderColor = ACCENT;
          iconEl.style.color = ACCENT_DIM;
          iconEl.style.boxShadow = 'none';
          iconEl.style.transform = 'translateX(-50%) scale(1)';
          iconEl.style.background = '#06162A';
        } else {
          iconEl.style.borderColor = INACTIVE_BORDER;
          iconEl.style.color = INACTIVE_COLOR;
          iconEl.style.boxShadow = 'none';
          iconEl.style.transform = 'translateX(-50%) scale(0.9)';
          iconEl.style.background = '#06162A';
        }
      }

      const contentEl = contentRefs.current[i];
      if (contentEl) {
        contentEl.style.opacity = isHighlight ? '1' : '0.25';
        contentEl.style.transform = isHighlight ? 'translateX(0)' : 'translateX(1.5rem)';
        const title = contentEl.querySelector('h4');
        if (title) title.style.color = isHighlight ? '#fff' : '#4a6a9a';
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
    <section style={{ background: '#000002', padding: '96px 0' }}>
      <div className="sc">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ color: ACCENT, fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>
            How It Works
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', color: '#fff', marginBottom: '12px' }}>
            From Anonymous to Actionable.
          </h2>
          <p style={{ color: '#D9ECFF', fontSize: '16px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
            Every visitor that lands on your site goes through this pipeline — automatically.
          </p>
        </div>

        {/* Timeline */}
        <div
          ref={containerRef}
          style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', display: 'flex', gap: '48px', paddingLeft: '16px' }}
        >
          {/* Track */}
          <div style={{ position: 'relative', width: '4px', background: 'rgba(26,92,168,0.15)', borderRadius: '4px', flexShrink: 0 }}>
            {/* Progress line */}
            <div
              ref={lineRef}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%',
                background: `linear-gradient(180deg, ${ACCENT} 0%, rgba(177,0,26,0.6) 100%)`,
                borderRadius: '4px',
                height: 0,
                transition: 'height 0.12s ease-out',
                willChange: 'height',
              }}
            >
              {/* Glowing dot */}
              <div style={{
                position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
                width: '14px', height: '14px', background: ACCENT, borderRadius: '50%',
                boxShadow: `0 0 16px ${ACCENT_GLOW}, 0 0 32px rgba(177,0,26,0.25)`,
              }}>
                <div style={{
                  position: 'absolute', inset: '3px', background: '#fff', borderRadius: '50%',
                  animation: 'arkPulse 2s ease-in-out infinite',
                }} />
              </div>
            </div>

            {/* Step icons on track */}
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
                    background: '#06162A', zIndex: 10,
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
                  background: 'rgba(177,0,26,0.08)', border: '1px solid rgba(177,0,26,0.2)',
                  borderRadius: '100px', padding: '3px 12px', marginBottom: '12px',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACCENT, display: 'inline-block' }} />
                  <span style={{ color: '#ff8a99', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Step {i + 1}
                  </span>
                </div>
                <h4 style={{
                  fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800,
                  letterSpacing: '-0.5px', marginBottom: '8px',
                  transition: 'color 0.5s', color: '#4a6a9a',
                }}>
                  {step.title}
                </h4>
                <p style={{ color: '#D9ECFF', fontSize: '15px', lineHeight: 1.7, marginBottom: '12px', maxWidth: '440px' }}>
                  {step.description}
                </p>
                <div
                  ref={el => { detailRefs.current[i] = el; }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#06162A', border: '1px solid #0A2142', borderRadius: '6px',
                    padding: '6px 14px',
                    transition: 'opacity 0.6s, transform 0.6s',
                    opacity: 0, transform: 'translateY(8px)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 700 }}>{step.detail}</span>
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
