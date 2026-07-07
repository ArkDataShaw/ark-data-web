import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ArrowRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// BuilderScrollDemo v4 — pixel-perfect scripted story on the REAL builder,
// now with dynamic replay.
//
// Boot: iframe (/builder/index.html?script=1) applies the solar filters; the
// real strip chips are hidden; exact DOM clones fly in from center stage and
// land on the chips' true rects. Generate replays a frozen snapshot; map +
// charts fade with scroll depth; then the iframe unlocks for free-play.
//
// REPLAY: if the user scrolls back above the story after interacting, we
// re-capture whatever chips are CURRENTLY selected (their filters, not the
// script's), rebuild the clones, and the story replays with their audience.
// Replay never re-clicks Generate (no live upstream builds from scrolling) —
// it re-animates the chips and re-fades the data already on screen.
// ─────────────────────────────────────────────────────────────────────────────

const GREEN_BORDER = 'rgba(25,195,125,0.35)';
const BIG_SCALE = 2.6;
const REPLAY_AT = 0.28; // scrolling above this after unlock re-arms the story

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (p, [a, b]) => clamp((p - a) / (b - a), 0, 1);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// timing windows distributed across N steps
const chipInT = (i, n) => { const s = 0.05 + i * (0.18 / Math.max(n, 1)); return [s, s + 0.07]; };
const flyT = (i, n) => { const s = 0.34 + i * (0.15 / Math.max(n, 1)); return [s, s + 0.12]; };
const T = { builderIn: [0.24, 0.34], generateAt: 0.64, dataReveal: [0.68, 0.90], interactiveAt: 0.93 };

// exact .chip styles from the builder's stylesheet, applied inline to clones
const CHIP_STYLE = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '999px',
  padding: '4px 9px', fontSize: '12px', color: '#334155',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  whiteSpace: 'nowrap', lineHeight: 'normal', boxSizing: 'border-box',
};
// red exclusion chips (⊘) — match .chip.excl
const CHIP_STYLE_EXCL = { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' };

export default function BuilderScrollDemo() {
  const trackRef = useRef(null);
  const frameRef = useRef(null);
  const iframeRef = useRef(null);
  const overlayRef = useRef(null);
  const captionRef = useRef(null);
  const hintRef = useRef(null);
  const debugRef = useRef(null);
  const stepsRef = useRef([]);       // [{group, caption}]
  const cloneRefs = useRef({});      // group -> [clone els]
  const revealedRef = useRef(new Set());
  const generatedRef = useRef(false);
  const interactiveRef = useRef(false);
  const [mountIframe, setMountIframe] = useState(false);
  const [booted, setBooted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    const set = () => setIsDesktop(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  const app = useCallback(() => {
    const w = iframeRef.current && iframeRef.current.contentWindow;
    try { return (w && w.ArkEmbed && w.ArkEmbed.ready) ? w : null; } catch { return null; }
  }, []);

  // build story steps + overlay clones from the CURRENT chip set
  const buildStory = useCallback((info) => {
    const overlay = overlayRef.current;
    if (!overlay || !info || !info.length) return false;

    // step order: every non-topic group in DOM order, topic last (with caption)
    const groups = [];
    info.forEach(c => { if (c.group !== 'topic' && !groups.includes(c.group)) groups.push(c.group); });
    const steps = groups.map(g => ({ group: g, caption: null }));
    if (info.some(c => c.group === 'topic')) steps.push({ group: 'topic', caption: 'SEARCHING FOR' });
    stepsRef.current = steps;

    overlay.innerHTML = '';
    cloneRefs.current = {};
    captionRef.current = null;

    steps.forEach((step, si) => {
      if (step.caption) {
        const cap = document.createElement('div');
        cap.textContent = step.caption;
        cap.className = 'ark-mono';
        cap.style.cssText = 'opacity:0;color:#A9C1DC;font-size:15px;letter-spacing:0.22em;text-align:center;margin:14px 0 6px;text-shadow:0 2px 12px rgba(0,0,0,0.6);';
        captionRef.current = cap;
        overlay.appendChild(cap);
      }
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap;max-width:38vw;';
      const clones = [];
      info.filter(c => c.group === step.group).forEach(c => {
        const el = document.createElement('span');
        Object.assign(el.style, CHIP_STYLE, c.exclude ? CHIP_STYLE_EXCL : {});
        const b = document.createElement('b');
        b.style.fontWeight = '700';
        b.textContent = c.label;
        el.appendChild(b);
        el.appendChild(document.createTextNode(' ' + c.value));
        el.style.opacity = '0';
        el.style.boxShadow = '0 12px 44px rgba(0,0,0,0.45)';
        el.dataset.rx = c.rect.x; el.dataset.ry = c.rect.y;
        el._home = null; el._t = null;
        row.appendChild(el);
        clones.push(el);
      });
      cloneRefs.current[step.group] = clones;
      overlay.appendChild(row);
      row.style.transform = `scale(${BIG_SCALE})`;
      row.style.transformOrigin = 'center';
      row.style.margin = `${si === 0 ? 0 : 26}px 0`;
    });
    return true;
  }, []);

  // boot: wait for the app, apply solar filters, load snapshot, build clones
  useEffect(() => {
    if (!mountIframe || booted) return;
    let tries = 0;
    const dbg = (msg) => { if (debugRef.current) debugRef.current.textContent = 'boot: ' + msg; };
    const iv = setInterval(() => {
      tries++;
      const w = app();
      if (!w) { dbg(`waiting for app (t${tries})`); return; }
      try {
        w.ArkEmbed.applyAll();
        w.ArkEmbed.loadSnapshot('/builder/snapshot-solar.json');
        const info = w.ArkEmbed.chipInfo();
        if (!info || !info.length) { dbg(`applied but 0 chips (t${tries})`); return; }
        buildStory(info);
        setBooted(true);
        dbg(`OK — ${info.length} chips`);
        setTimeout(() => { if (debugRef.current) debugRef.current.style.display = 'none'; }, 4000);
        clearInterval(iv);
      } catch (e) { dbg('ERR ' + (e && e.message)); }
    }, 250);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountIframe, booted]);

  // re-arm the story with the user's CURRENT filters
  const replay = useCallback((w) => {
    let info;
    try {
      w.ArkEmbed.retag();          // tag + hide whatever chips exist now
      info = w.ArkEmbed.chipInfo();
    } catch { return; }
    if (!info || !info.length) return; // no filters left — nothing to replay; stay live
    if (!buildStory(info)) return;
    revealedRef.current = new Set();
    interactiveRef.current = false;
    if (iframeRef.current) iframeRef.current.style.pointerEvents = 'none';
    if (overlayRef.current) overlayRef.current.style.display = 'flex';
    if (hintRef.current) hintRef.current.style.opacity = '0';
  }, [buildStory]);

  const frame = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const r = track.getBoundingClientRect();
    const vh = window.innerHeight;
    if (!mountIframe && r.top < vh * 2.5) { setMountIframe(true); return; }
    const p = clamp(-r.top / Math.max(r.height - vh, 1), 0, 1);
    const w = app();

    // scrolled back above the story after interacting → replay with current filters
    if (interactiveRef.current && p < REPLAY_AT && w) replay(w);

    if (frameRef.current) {
      const t = easeOut(seg(p, T.builderIn));
      frameRef.current.style.opacity = String(t);
      frameRef.current.style.transform = `translateY(${(1 - t) * 48}px)`;
    }
    if (interactiveRef.current) return; // free-play: hands off the iframe

    const steps = stepsRef.current;
    const n = steps.length;
    const iframeBox = iframeRef.current ? iframeRef.current.getBoundingClientRect() : null;

    steps.forEach((step, i) => {
      const clones = cloneRefs.current[step.group] || [];
      const tIn = seg(p, chipInT(i, n));
      const fly = seg(p, flyT(i, n));

      clones.forEach(el => {
        if (fly <= 0) {
          const pop = easeOut(tIn);
          el.style.opacity = String(pop);
          el.style.transform = `translateY(${(1 - pop) * 14}px)`;
          el._home = null; el._t = null;
          if (revealedRef.current.has(step.group) && w) {
            w.ArkEmbed.hideGroup(step.group);
            revealedRef.current.delete(step.group);
          }
        } else if (iframeBox) {
          const t = easeInOut(fly);
          const b = el.getBoundingClientRect();
          const prev = el._t || { x: 0, y: 0, s: 1 };
          if (!el._home) el._home = { x: b.left - prev.x, y: b.top - prev.y };
          const targetX = iframeBox.left + parseFloat(el.dataset.rx);
          const targetY = iframeBox.top + parseFloat(el.dataset.ry);
          const dx = (targetX - el._home.x) * t;
          const dy = (targetY - el._home.y) * t;
          const s = 1 + (1 / BIG_SCALE - 1) * t;
          el._t = { x: dx, y: dy, s };
          el.style.transformOrigin = 'top left';
          el.style.transform = `translate(${dx / BIG_SCALE}px, ${dy / BIG_SCALE}px) scale(${s})`;
          el.style.opacity = String(1 - seg(fly, [0.93, 1]));
          el.style.boxShadow = `0 ${12 * (1 - t)}px ${44 * (1 - t)}px rgba(0,0,0,${0.45 * (1 - t)})`;
          if (fly >= 0.97 && w && !revealedRef.current.has(step.group)) {
            w.ArkEmbed.reveal(step.group);
            revealedRef.current.add(step.group);
          }
        }
      });
    });

    if (captionRef.current && n) {
      const t = seg(p, chipInT(n - 1, n));
      const gone = seg(p, flyT(n - 1, n));
      captionRef.current.style.opacity = String(easeOut(t) * (1 - gone));
    }

    // real Generate from snapshot — FIRST run only; replays never re-fire it
    if (p >= T.generateAt && !generatedRef.current && w && revealedRef.current.size === stepsRef.current.length) {
      if (w.ArkEmbed.generate()) generatedRef.current = true;
    }

    // scroll-driven data fade (works on replays too — data is already rendered)
    if (generatedRef.current && w) {
      w.ArkEmbed.setDataReveal(seg(p, T.dataReveal));
    }

    // unlock
    if (p >= T.interactiveAt && !interactiveRef.current) {
      interactiveRef.current = true;
      if (iframeRef.current) iframeRef.current.style.pointerEvents = 'auto';
      if (overlayRef.current) overlayRef.current.style.display = 'none';
      if (hintRef.current) hintRef.current.style.opacity = '1';
    }
  }, [mountIframe, app, replay]);

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
      <section ref={trackRef} style={{ height: '480vh', position: 'relative', background: '#060D1A', borderTop: '1px solid #101E33' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', margin: '24px 0 12px', flexShrink: 0 }}>
            THE FLAGSHIP · AUDIENCE BUILDER
          </p>
          <span ref={debugRef} className="ark-mono" style={{ position: 'absolute', top: '8px', left: '10px', zIndex: 9, color: '#FF8A9A', fontSize: '11px', background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '6px' }}>boot: waiting for iframe…</span>

          <div ref={frameRef} style={{ opacity: 0, width: 'min(1240px, calc(100vw - 40px))', flex: 1, minHeight: 0, borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #1B3050', borderBottom: 'none', boxShadow: '0 30px 80px rgba(0,0,0,0.55)', background: '#f8fafc', position: 'relative' }}>
            {mountIframe && (
              <iframe
                ref={iframeRef}
                src="/builder/index.html?script=1"
                title="ArkData Audience Builder"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: 'none' }}
              />
            )}
            <div ref={hintRef} style={{ position: 'absolute', bottom: '14px', right: '16px', opacity: 0, transition: 'opacity 0.6s', pointerEvents: 'none', background: 'rgba(6,13,26,0.85)', border: `1px solid ${GREEN_BORDER}`, borderRadius: '100px', padding: '7px 16px' }}>
              <span className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', letterSpacing: '0.08em' }}>● LIVE — edit any filter, then Generate</span>
            </div>
          </div>

          <div ref={overlayRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 3 }} />
        </div>
      </section>

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
