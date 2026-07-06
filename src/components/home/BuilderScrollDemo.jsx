import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ArrowRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// BuilderScrollDemo v2 — drives the REAL builder.
// The actual demo app is vendored at /builder/index.html (same-origin), so we
// script it directly: as the user scrolls, big ICP chips punch in, then fly
// into the real strip while we apply the real filters (S + sync()), then we
// click the real Generate button — real map, real charts, real reach. When the
// pin releases, the visitor is left with the genuine interactive builder.
// No mock, no swap seam.
// ─────────────────────────────────────────────────────────────────────────────

const GREEN = '#19C37D';
const GREEN_SOFT = 'rgba(25,195,125,0.12)';
const GREEN_BORDER = 'rgba(25,195,125,0.35)';

const CHIPS = [
  { id: 'homeowners', label: 'Homeowners' },
  { id: 'income', label: '$100K+ income' },
  { id: 'geo', label: 'TX, FL & AZ' },
  { id: 'topic', label: 'Solar Panel Installation', topic: true },
];

const INCOME_100K = ['$100,000 to $149,999', '$150,000 to $199,999', '$200,000 to $249,999', '$250,000+'];

// scroll-track timings
const T = {
  chipIn: i => [0.03 + i * 0.045, 0.10 + i * 0.045],
  searching: [0.19, 0.24],
  builderIn: [0.28, 0.38],
  fly: i => [0.36 + i * 0.03, 0.48 + i * 0.03],
  generateAt: 0.60,
  interactiveAt: 0.94,
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (p, [a, b]) => clamp((p - a) / (b - a), 0, 1);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function BuilderScrollDemo() {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);     // builder container (reveal transform)
  const iframeRef = useRef(null);
  const overlayRef = useRef(null);   // big-chip overlay layer
  const bigChipRefs = useRef([]);
  const searchingRef = useRef(null);
  const hintRef = useRef(null);
  const appliedRef = useRef(new Set());
  const generatedRef = useRef(false);
  const interactiveRef = useRef(false);
  const [mountIframe, setMountIframe] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    const set = () => setIsDesktop(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  // ── real-builder scripting (same-origin) ──────────────────────────────────
  const getApp = useCallback(() => {
    const w = iframeRef.current && iframeRef.current.contentWindow;
    if (!w || !w.S || !w.sync || !w.renderSidebar) return null;
    return w;
  }, []);

  const applyStep = useCallback((k) => {
    const w = getApp();
    if (!w || appliedRef.current.has(k)) return;
    try {
      if (k === 0) w.S.checks.homeowner = new w.Set(['Homeowner']);
      if (k === 1) w.S.checks.income = new w.Set(INCOME_100K);
      if (k === 2) ['TX', 'FL', 'AZ'].forEach(c => w.S.loc.personal.state.add(c));
      if (k === 3) { w.S.topics.add('Solar Panel Installation'); w.S.topicMeta['Solar Panel Installation'] = { id: 7270, kind: 'b2c' }; }
      w.renderSidebar(); w.sync();
      appliedRef.current.add(k);
    } catch { /* app not ready yet — retried next frame */ }
  }, [getApp]);

  const unapplyStep = useCallback((k) => {
    const w = getApp();
    if (!w || !appliedRef.current.has(k)) return;
    try {
      if (k === 0) delete w.S.checks.homeowner;
      if (k === 1) delete w.S.checks.income;
      if (k === 2) w.S.loc.personal.state.clear();
      if (k === 3) { w.S.topics.clear(); w.S.topicMeta = {}; }
      w.renderSidebar(); w.sync();
      appliedRef.current.delete(k);
    } catch { /* ignore */ }
  }, [getApp]);

  const chipTarget = useCallback((k) => {
    // land on the real strip-chips row inside the iframe
    const w = getApp();
    const iframe = iframeRef.current;
    if (!w || !iframe) return null;
    const chipsEl = w.document.getElementById('chips');
    if (!chipsEl) return null;
    const ir = iframe.getBoundingClientRect();
    const cr = chipsEl.getBoundingClientRect();
    return { x: ir.left + cr.left + 8 + k * 120, y: ir.top + cr.top + 4 };
  }, [getApp]);

  const frame = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const r = track.getBoundingClientRect();
    const vh = window.innerHeight;
    if (!mountIframe && r.top < vh * 2) setMountIframe(true);
    const p = clamp(-r.top / Math.max(r.height - vh, 1), 0, 1);

    // builder container reveal
    if (frameRef.current) {
      const t = easeOut(seg(p, T.builderIn));
      frameRef.current.style.opacity = String(t);
      frameRef.current.style.transform = `translateY(${(1 - t) * 48}px)`;
    }

    // big chips: pop in → fly to the real strip
    CHIPS.forEach((c, i) => {
      const el = bigChipRefs.current[i];
      if (!el) return;
      const tIn = c.topic ? seg(p, T.searching) : seg(p, T.chipIn(i));
      const fly = seg(p, T.fly(i));

      if (fly <= 0) {
        const pop = easeOut(tIn);
        el.style.opacity = String(pop);
        el.style.transform = `translateY(${(1 - pop) * 26}px) scale(${0.7 + pop * 0.3})`;
        el._fx = 0; el._fy = 0;
        if (appliedRef.current.has(i)) unapplyStep(i); // scrolled back up
      } else {
        const b = el.getBoundingClientRect();
        const tgt = chipTarget(i);
        if (tgt) {
          const t = easeInOut(fly);
          // measure the un-transformed origin by removing current transform contribution
          const baseX = b.left - (el._fx || 0);
          const baseY = b.top - (el._fy || 0);
          const fx = (tgt.x - baseX) * t;
          const fy = (tgt.y - baseY) * t;
          el._fx = fx; el._fy = fy;
          el.style.transformOrigin = 'top left';
          el.style.transform = `translate(${fx}px, ${fy}px) scale(${1 - 0.72 * t})`;
          el.style.opacity = String(1 - seg(fly, [0.82, 1]));
        } else {
          el.style.opacity = String(1 - seg(fly, [0.5, 1]));
        }
        if (fly >= 0.96) applyStep(i); // the real chip appears as the ghost lands
      }
    });

    if (searchingRef.current) {
      const t = seg(p, T.searching);
      const gone = seg(p, T.fly(3));
      searchingRef.current.style.opacity = String(easeOut(t) * (1 - gone));
    }

    // real Generate
    if (p >= T.generateAt && !generatedRef.current && appliedRef.current.size === 4) {
      const w = getApp();
      if (w) {
        const btn = w.document.getElementById('generateBtn');
        if (btn) { btn.click(); generatedRef.current = true; }
      }
    }

    // unlock interactivity near the end of the track (one-way)
    if (p >= T.interactiveAt && !interactiveRef.current) {
      interactiveRef.current = true;
      if (iframeRef.current) iframeRef.current.style.pointerEvents = 'auto';
      if (overlayRef.current) overlayRef.current.style.display = 'none';
      if (hintRef.current) hintRef.current.style.opacity = '1';
    }
  }, [mountIframe, applyStep, unapplyStep, chipTarget, getApp]);

  useEffect(() => {
    if (!isDesktop) return;
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [frame, isDesktop]);

  if (!isDesktop) {
    return (
      <section className="sp" style={{ background: '#060D1A', borderTop: '1px solid #101E33' }}>
        <div className="sc" style={{ textAlign: 'center' }}>
          <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>THE FLAGSHIP · AUDIENCE BUILDER</p>
          <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 6vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: '12px' }}>
            Describe your buyer.<br />Watch the audience build itself.
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '15px', lineHeight: 1.7, margin: '0 0 24px' }}>
            Homeowners in TX, FL & AZ with $100K+ income researching{' '}
            <span style={{ color: '#6FE3B0', fontWeight: 600 }}>Solar Panel Installation</span> — built into an
            ad-ready audience in seconds. Try the full builder on desktop, or open the live demo.
          </p>
          <Link to={createPageUrl('Demo')}>
            <button className="ark-btn-green" style={{ padding: '14px 28px', fontSize: '15px' }}>Try the live builder →</button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section ref={trackRef} style={{ height: '460vh', position: 'relative', background: '#060D1A', borderTop: '1px solid #101E33' }}>
        <div ref={stageRef} style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', margin: '26px 0 12px', flexShrink: 0 }}>
            THE FLAGSHIP · AUDIENCE BUILDER
          </p>

          {/* the REAL builder (same-origin, scripted) */}
          <div ref={frameRef} style={{ opacity: 0, width: 'min(1240px, calc(100vw - 40px))', flex: 1, minHeight: 0, marginBottom: 0, borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #1B3050', borderBottom: 'none', boxShadow: '0 30px 80px rgba(0,0,0,0.55)', background: '#f8fafc', position: 'relative' }}>
            {mountIframe && (
              <iframe
                ref={iframeRef}
                src="/builder/index.html"
                title="ArkData Audience Builder"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: 'none' }}
              />
            )}
            {/* interactivity hint (appears when unlocked) */}
            <div ref={hintRef} style={{ position: 'absolute', bottom: '14px', right: '16px', opacity: 0, transition: 'opacity 0.6s', pointerEvents: 'none', background: 'rgba(6,13,26,0.85)', border: `1px solid ${GREEN_BORDER}`, borderRadius: '100px', padding: '7px 16px' }}>
              <span className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', letterSpacing: '0.08em' }}>● LIVE — edit any filter</span>
            </div>
          </div>

          {/* big-chip overlay (above the builder while the story plays) */}
          <div ref={overlayRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', pointerEvents: 'none', zIndex: 3 }}>
            {CHIPS.slice(0, 3).map((c, i) => (
              <span key={c.id} ref={el => { bigChipRefs.current[i] = el; }} className="ark-display" style={{ opacity: 0, fontSize: 'clamp(28px, 3.4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', background: 'rgba(74,158,255,0.10)', border: '1px solid rgba(74,158,255,0.4)', borderRadius: '100px', padding: '10px 32px', whiteSpace: 'nowrap', textShadow: '0 2px 20px rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
                {c.label}
              </span>
            ))}
            <span ref={searchingRef} className="ark-mono" style={{ opacity: 0, color: '#A9C1DC', fontSize: '15px', letterSpacing: '0.22em', margin: '8px 0 0', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>SEARCHING FOR</span>
            <span ref={el => { bigChipRefs.current[3] = el; }} className="ark-display" style={{ opacity: 0, fontSize: 'clamp(28px, 3.4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#6FE3B0', background: GREEN_SOFT, border: `1px solid ${GREEN_BORDER}`, borderRadius: '100px', padding: '10px 32px', whiteSpace: 'nowrap', boxShadow: '0 0 50px rgba(25,195,125,0.3)', backdropFilter: 'blur(6px)' }}>
              Solar Panel Installation
            </span>
          </div>
        </div>
      </section>

      {/* post-sequence CTA */}
      <section style={{ background: '#060D1A', padding: '56px 0 80px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#A9C1DC', fontSize: '16px', margin: '0 0 20px' }}>
            That's the real builder — keep playing with it above, or take it full-screen.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('Demo')}>
              <button className="ark-btn-green" style={{ padding: '14px 30px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Open full-screen <ArrowRight size={15} />
              </button>
            </Link>
            <Link to={createPageUrl('BookADemo')}>
              <button className="ark-btn-blue" style={{ padding: '14px 30px', fontSize: '15px' }}>Book a walkthrough</button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
