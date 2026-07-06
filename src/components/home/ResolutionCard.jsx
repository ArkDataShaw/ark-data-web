import React, { useState, useEffect, useRef } from 'react';

// The signature element: an anonymous session resolving into a full identity,
// rendered like a matching-engine log. Loops forever.

const SESSION_LINES = [
  ['visitor_id', 'anon_8f3c21e0'],
  ['location', 'Dallas, TX'],
  ['pages', '/pricing → /integrations'],
  ['time_on_site', '4m 12s'],
];

const IDENTITY_FIELDS = [
  ['Name', 'James Thornton'],
  ['Title', 'VP Revenue Operations'],
  ['Company', 'Meridian Growth Partners'],
  ['Email', 'j.thornton@m•••••n.com'],
  ['Phone', '(214) •••-••41'],
  ['LinkedIn', '/in/jthornton-revops'],
];

const INTENT_TOPICS = ['CRM Migration', 'Sales Intelligence', 'ABM Software'];

const RESOLVE_START_MS = 1400; // pause on anonymous state
const FIELD_INTERVAL_MS = 380;
const HOLD_MS = 5200; // hold resolved state before looping

export default function ResolutionCard() {
  const [step, setStep] = useState(0); // 0 = anonymous, 1..N fields revealed
  const [cycle, setCycle] = useState(0);
  const reduced = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const totalSteps = IDENTITY_FIELDS.length + 1; // fields + intent topics row

  useEffect(() => {
    if (reduced.current) { setStep(totalSteps); return; }
    let timers = [];
    setStep(0);
    for (let i = 1; i <= totalSteps; i++) {
      timers.push(setTimeout(() => setStep(i), RESOLVE_START_MS + i * FIELD_INTERVAL_MS));
    }
    timers.push(setTimeout(() => setCycle(c => c + 1), RESOLVE_START_MS + totalSteps * FIELD_INTERVAL_MS + HOLD_MS));
    return () => timers.forEach(clearTimeout);
  }, [cycle, totalSteps]);

  const resolved = step >= totalSteps;

  return (
    <div style={{
      background: '#081020', border: '1px solid #14263F', borderRadius: '14px',
      overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(25,195,125,0.05)',
      width: '100%', maxWidth: '440px',
    }}>
      {/* title bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #14263F', background: '#060C18' }}>
        <span className="ark-mono" style={{ color: '#5B7699', fontSize: '11px', letterSpacing: '0.08em' }}>arkdata · live session</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: resolved ? '#19C37D' : '#E8B93B',
            boxShadow: resolved ? '0 0 8px rgba(25,195,125,0.8)' : '0 0 8px rgba(232,185,59,0.6)',
            transition: 'all 0.4s',
          }} />
          <span className="ark-mono" style={{ color: resolved ? '#19C37D' : '#E8B93B', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', transition: 'color 0.4s' }}>
            {resolved ? 'RESOLVED' : step > 0 ? 'RESOLVING' : 'ANONYMOUS'}
          </span>
        </span>
      </div>

      {/* anonymous session block */}
      <div style={{ padding: '16px 18px', borderBottom: '1px solid #14263F', opacity: resolved ? 0.45 : 1, transition: 'opacity 0.5s' }}>
        {SESSION_LINES.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: '12px', padding: '3px 0' }}>
            <span className="ark-mono" style={{ color: '#3D5573', fontSize: '12px', minWidth: '110px' }}>{k}</span>
            <span className="ark-mono" style={{ color: '#8FA9C7', fontSize: '12px' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* resolved identity */}
      <div style={{ padding: '16px 18px 18px' }}>
        <p className="ark-mono" style={{ color: '#19C37D', fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', margin: '0 0 10px' }}>
          IDENTITY MATCH
        </p>
        {IDENTITY_FIELDS.map(([k, v], i) => {
          const shown = step > i;
          return (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '5px 0',
              borderBottom: i < IDENTITY_FIELDS.length - 1 ? '1px solid rgba(20,38,63,0.6)' : 'none',
              opacity: shown ? 1 : 0.18,
              transform: shown ? 'translateX(0)' : 'translateX(-4px)',
              transition: 'opacity 0.35s, transform 0.35s',
            }}>
              <span className="ark-mono" style={{ color: '#5B7699', fontSize: '12px' }}>{k}</span>
              <span className="ark-mono" style={{ color: shown ? '#EAF2FB' : '#3D5573', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>
                {shown ? v : '•••••••'}
              </span>
            </div>
          );
        })}

        {/* intent topics */}
        <div style={{ marginTop: '14px', opacity: step > IDENTITY_FIELDS.length ? 1 : 0.18, transition: 'opacity 0.4s' }}>
          <p className="ark-mono" style={{ color: '#5B7699', fontSize: '10px', letterSpacing: '0.12em', margin: '0 0 8px' }}>ACTIVE INTENT · THIS WEEK</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {INTENT_TOPICS.map(t => (
              <span key={t} className="ark-mono" style={{
                background: 'rgba(25,195,125,0.08)', border: '1px solid rgba(25,195,125,0.25)',
                color: '#6FE3B0', fontSize: '11px', padding: '3px 10px', borderRadius: '100px',
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{
          marginTop: '16px', padding: '8px 12px', borderRadius: '6px', textAlign: 'center',
          background: resolved ? 'rgba(25,195,125,0.07)' : 'rgba(91,118,153,0.06)',
          border: `1px solid ${resolved ? 'rgba(25,195,125,0.22)' : 'rgba(91,118,153,0.15)'}`,
          transition: 'all 0.4s',
        }}>
          <span className="ark-mono" style={{ color: resolved ? '#6FE3B0' : '#5B7699', fontSize: '11px', fontWeight: 500, transition: 'color 0.4s' }}>
            {resolved ? '650+ data points appended · synced to CRM' : 'matching against identity graph…'}
          </span>
        </div>
      </div>
    </div>
  );
}
