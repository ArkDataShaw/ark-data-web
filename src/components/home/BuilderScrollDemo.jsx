import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ArrowRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// BuilderScrollDemo v3 — pixel-perfect scripted story on the REAL builder.
//
// The vendored builder (/builder/index.html?script=1) exposes window.ArkEmbed.
// On iframe boot we applyAll() the solar filters; the real strip chips exist
// but are visibility:hidden. We clone their exact DOM (same markup, same
// computed style) into a parent overlay at ~2.6x scale — the "big bold"
// chips ARE the builder's chips. Scroll FLIPs each clone from center stage to
// its chip's precise rect (ending at scale(1) on the exact pixel), the real
// chip is revealed, the clone removed: an undetectable handoff.
// Generate is the app's real button served from a baked snapshot (same
// numbers, charts and colored ZIPs for every visitor, zero upstream cost);
// map + cards fade in with scroll depth, then the iframe unlocks — the user
// is inside a genuinely interactive builder whose NEXT Generate runs live.
// ─────────────────────────────────────────────────────────────────────────────

const GREEN_BORDER = 'rgba(25,195,125,0.35)';

// narrative order → chip groups in the builder strip
const STORY = [
  { group: 'homeowner', caption: null },
  { group: 'income', caption: null },
  { group: 'geo', caption: null },
  { group: 'topic', caption: 'SEARCHING FOR' },
];

const T = {
  chipIn: i => [0.04 + i * 0.05, 0.11 + i * 0.05],
  fly: i => [0.34 + i * 0.035, 0.47 + i * 0.035],
  builderIn: [0.24, 0.34],
  generateAt: 0.64,
  dataReveal: [0.68, 0.90],
  interactiveAt: 0.93,
};
const BIG_SCALE = 2.6;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (p, [a, b]) => clamp((p - a) / (b - a), 0, 1);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// exact .chip styles from the builder's stylesheet, applied inline to clones
const CHIP_STYLE = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '999px',
  padding: '4px 9px', fontSize: '12px', color: '#334155',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  whiteSpace: 'nowrap', lineHeight: 'normal', boxSizing: 'border-box',
};

export default function BuilderScrollDemo() {
  const trackRef = useRef(null);
  const frameRef = useRef(null);
  const iframeRef = useRef(null);
  const overlayRef = useRef(null);
  const captionRef = useRef(null);
  const hintRef = useRef(null);
  const cloneRefs = useRef({});      // group -> [clone els]
  const chipData = useRef(null);     // ArkEmbed.chipInfo() result
  const homesRef = useRef({});       // clone el -> {hx, hy} overlay home position
  const revealedRef = useRef(new Set());
  const generatedRef = useRef(false);
  const interactiveRef = useRef(false);
  const debugRef = useRef(null);
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
    return (w && w.ArkEmbed && w.ArkEmbed.ready) ? w : null;
  }, []);

  // boot: wait for the app, apply filters, load snapshot, build clones
  useEffect(() => {
    if (!mountIframe || booted) return;
    let tries = 0;
    const dbg = (msg) => { if (debugRef.current) debugRef.current.textContent = 'boot: ' + msg; };
    const iv = setInterval(() => {
      tries++;
      const ifr = iframeRef.current;
      const w = ifr && ifr.contentWindow;
      if (!w) { dbg(`no iframe window (t${tries})`); return; }
      let emb;
      try { emb = w.ArkEmbed; } catch (e) { dbg('cross-origin? ' + e.message); return; }
      if (!emb) { dbg(`no ArkEmbed — embed-script not loaded? (t${tries})`); return; }
      if (!emb.ready) { dbg(`app not ready (t${tries})`); return; }
      try {
        emb.applyAll();
        emb.loadSnapshot('/builder/snapshot-solar.json');
        chipData.current = emb.chipInfo();
        if (!chipData.current || !chipData.current.length) { dbg(`applied but 0 chips found (t${tries})`); return; }
        buildClones(chipData.current);
        setBooted(true);
        dbg(`OK — ${chipData.current.length} chips`);
        setTimeout(() => { if (debugRef.current) debugRef.current.style.display = 'none'; }, 4000);
        clearInterval(iv);
      } catch (e) { dbg('ERR ' + (e && e.message)); }
    }, 250);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountIframe, booted]);

  const buildClones = (info) => {
    const overlay = overlayRef.current;
    if (!overlay || !info) return;
    overlay.innerHTML = '';
    cloneRefs.current = {};
    homesRef.current = new Map();

    STORY.forEach((step, si) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:10px;justify-content:center;align-items:center;';
      if (step.caption) {
        const cap = document.createElement('div');
        cap.textContent = step.caption;
        cap.className = 'ark-mono';
        cap.style.cssText = 'opacity:0;color:#A9C1DC;font-size:15px;letter-spacing:0.22em;text-align:center;margin:14px 0 6px;text-shadow:0 2px 12px rgba(0,0,0,0.6);';
        captionRef.current = cap;
        overlay.appendChild(cap);
      }
      const clones = [];
      info.filter(c => c.group === step.group).forEach(c => {
        const el = document.createElement('span');
        Object.assign(el.style, CHIP_STYLE);
        // chip markup is always "<b>Group:</b> value" — rebuild it safely
        const b = document.createElement('b');
        b.style.fontWeight = '700';
        b.textContent = c.label;
        el.appendChild(b);
        el.appendChild(document.createTextNode(' ' + c.value));
        el.style.opacity = '0';
        el.style.boxShadow = '0 12px 44px rgba(0,0,0,0.45)';
        el.dataset.w = c.rect.w; el.dataset.h = c.rect.h;
        el.dataset.rx = c.rect.x; el.dataset.ry = c.rect.y;
        row.appendChild(el);
        clones.push(el);
      });
      cloneRefs.current[step.group] = clones;
      overlay.appendChild(row);
      row.style.transform = `scale(${BIG_SCALE})`;
      row.style.transformOrigin = 'center';
      row.style.margin = `${si === 0 ? 0 : 26}px 0`;
    });
  };

  const frame = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const r = track.getBoundingClientRect();
    const vh = window.innerHeight;
    if (!mountIframe && r.top < vh * 2.5) { setMountIframe(true); return; }
    const p = clamp(-r.top / Math.max(r.height - vh, 1), 0, 1);
    const w = app();

    // builder frame reveal
    if (frameRef.current) {
      const t = easeOut(seg(p, T.builderIn));
      frameRef.current.style.opacity = String(t);
      frameRef.current.style.transform = `translateY(${(1 - t) * 48}px)`;
    }

    // chips: pop in big → FLIP to their exact rects
    const iframeBox = iframeRef.current ? iframeRef.current.getBoundingClientRect() : null;
    STORY.forEach((step, i) => {
      const clones = cloneRefs.current[step.group] || [];
      const tIn = seg(p, T.chipIn(i));
      const fly = seg(p, T.fly(i));

      clones.forEach(el => {
        if (fly <= 0) {
          const pop = easeOut(tIn);
          el.style.opacity = String(pop);
          el.style.transform = `translateY(${(1 - pop) * 14}px)`;
          if (revealedRef.current.has(step.group) && w) {
            w.ArkEmbed.hideGroup(step.group); // scrolled back up
            revealedRef.current.delete(step.group);
          }
        } else if (iframeBox) {
          // FLIP: from overlay home (scaled by row) to exact chip rect, ending scale(1/BIG_SCALE) within the scaled row = real size
          const t = easeInOut(fly);
          const b = el.getBoundingClientRect();
          const prev = el._t || { x: 0, y: 0, s: 1 };
          // overlay home = current rect minus the transform we last applied (stable across frames)
          if (!el._home) el._home = { x: b.left - prev.x, y: b.top - prev.y };
          const targetX = iframeBox.left + parseFloat(el.dataset.rx);
          const targetY = iframeBox.top + parseFloat(el.dataset.ry);
          const dx = (targetX - el._home.x) * t;
          const dy = (targetY - el._home.y) * t;
          const s = 1 + (1 / BIG_SCALE - 1) * t; // row is scaled BIG_SCALE; net ends at exactly 1.0
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

    if (captionRef.current) {
      const t = seg(p, T.chipIn(3));
      const gone = seg(p, T.fly(3));
      captionRef.current.style.opacity = String(easeOut(t) * (1 - gone));
    }

    // real Generate from snapshot
    if (p >= T.generateAt && !generatedRef.current && w && revealedRef.current.size === 4) {
      if (w.ArkEmbed.generate()) generatedRef.current = true;
    }

    // scroll-driven data fade
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
  }, [mountIframe, app]);

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

          {/* the REAL builder */}
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

          {/* overlay: exact clones of the real chips, scaled up */}
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
