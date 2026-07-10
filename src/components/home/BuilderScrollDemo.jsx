import React, { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ArrowRight } from 'lucide-react';
import MobileSentenceDemo from './MobileSentenceDemo';

// ─────────────────────────────────────────────────────────────────────────────
// BuilderScrollDemo — DESKTOP (≥960px) scripted deal-story on the REAL builder.
//
// Beat-driven, per-stage narration (parity with the mobile/tablet demo but in the
// desktop two-pane, chip-based shape). As you scroll, the audience narrows
// chapter-by-chapter and the map, count, coverage, and EVERY visible chart update
// live per stage. Each beat shows a purple-chip caption whose filter chips fly down
// into the builder's real strip while the connecting words fade.
//
//   b0 (hero)  Show me all [Homeowners] searching for [Pool Construction]  · US map
//   b1         Who live in [Florida]                                       · FL / County-ZIP
//   b2         Specifically [Ft. Lauderdale] and [Miami]                   · South-FL
//   b3         with [Net Worth: $1M+]                                      · full-density release
//
// Scroll shell = mobile's proven full-height sticky-iframe model: the builder lays
// out at full content height (enableFullHeight), pins through the story, then
// releases to native page scroll through the remaining charts. Fully reversible:
// scrolling up unwinds every beat (beatOffDesktop) back to the hero.
//
// <960px delegates to MobileSentenceDemo (unchanged).
// ─────────────────────────────────────────────────────────────────────────────

const GREEN_BORDER = 'rgba(25,195,125,0.35)';
const NAV_PX = 80; // pin the builder 10px below the 70px fixed nav (matches mobile)

// beat thresholds over the pinned range. Beat 0 fires ~immediately; last ~0.72 so
// the density release + settle fit before the pin releases to native scroll.
const BEATS = [0.06, 0.28, 0.50, 0.72];
const T = { frameIn: [0.0, 0.05] };
const BEAT_MIN_GAP_MS = 420; // one fly-in at a time, even on a fast flick

// Caption per beat: ordered segments — plain strings are connectors, {chip} slots are
// filled from the beat's NEW strip chips (chipInfo diff), matched by value-substring hint
// so the caption chip text always mirrors the real chip. hero = the big opening line.
const CAPTIONS = [
  { hero: true, segs: [{ t: 'Show me all ' }, { chip: 'homeowner' }, { t: ' searching for ' }, { chip: 'pool' }] },
  { hero: false, segs: [{ t: 'Who live in ' }, { chip: 'florida' }] },
  { hero: false, segs: [{ t: 'Specifically ' }, { chip: 'lauderdale' }, { t: ' and ' }, { chip: 'miami' }] },
  { hero: false, segs: [{ t: 'with ' }, { chip: 'worth' }] },
];

const DEBUG = typeof window !== 'undefined' && /[?&]debugBeats=1/.test(window.location.search);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (p, [a, b]) => clamp((p - a) / (b - a), 0, 1);
const easeOut = t => 1 - Math.pow(1 - t, 3);

// purple filter chip (matches the builder's .chip / app .pk-chip). Used for the caption
// chips AND the flying clones so they're visually identical to the landed strip chip.
const CHIP_CSS = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '999px',
  padding: '4px 9px', fontSize: '12px', color: '#7c3aed', fontWeight: 600,
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  whiteSpace: 'nowrap', lineHeight: 'normal', boxSizing: 'border-box',
};

export default function BuilderScrollDemo() {
  const trackRef = useRef(null);
  const frameRef = useRef(null);
  const iframeRef = useRef(null);
  const captionRef = useRef(null);   // the sentence/caption element above the builder
  const flyRef = useRef(null);       // fixed overlay hosting flying chip clones
  const scrimRef = useRef(null);
  const debugRef = useRef(null);

  const appliedRef = useRef(new Set());  // applied beat indices (data)
  const landedRef = useRef(new Set());   // chip keys (group|value) already flown into the strip
  const lastBeatAtRef = useRef(0);
  const rafKickRef = useRef(false);
  const frameRef2 = useRef(null);
  const measureRef = useRef(null);
  const generatedRef = useRef(false);
  const revealedRef = useRef(false);     // data (map/charts) revealed after beat 0
  const topBeatRef = useRef(-1);         // highest applied beat whose caption is showing
  const armedRef = useRef(false);
  const collapsedRef = useRef(false);
  const scrollCompRef = useRef(null);
  const fullHRef = useRef(0);
  const storyDoneRef = useRef(false);

  const [H, setH] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [mountIframe, setMountIframe] = useState(false);
  const [booted, setBooted] = useState(false);
  const [armed, setArmed] = useState(false);
  const [iframeDead, setIframeDead] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const loadFiredRef = useRef(false);
  const bootT0 = useRef(0);

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

  // idle-mount ~2s after load so ArkEmbed is ready before the visitor reaches the track
  useEffect(() => {
    const t = setTimeout(() => { bootT0.current = performance.now(); setMountIframe(true); }, 2000);
    return () => clearTimeout(t);
  }, []);

  // poster fallback if the iframe load never fires (10s)
  useEffect(() => {
    if (!mountIframe || iframeDead) return;
    const t = setTimeout(() => { if (!loadFiredRef.current) setIframeDead(true); }, 10000);
    return () => clearTimeout(t);
  }, [mountIframe, iframeDead]);

  // boot: load snapshot + DESKTOP stages, full-height, hold geo, scripted-owns-reach,
  // desktop-story flag (skips prewarm), data hidden until beat 0.
  useEffect(() => {
    if (!mountIframe || booted) return;
    const dbg = m => { if (debugRef.current) debugRef.current.textContent = 'boot: ' + m; };
    const iv = setInterval(() => {
      const w = app();
      if (!w) { dbg('waiting for app'); return; }
      try {
        w.ArkEmbed.loadSnapshot('/builder/snapshot-pool.json');
        w.ArkEmbed.loadStages('/builder/stages-pool-desktop.json');
        w.ArkEmbed.enableFullHeight();
        w.ArkEmbed.holdGeo = true;
        w.ArkEmbed._desktopStory = true;
        w.__arkScripted = true;
        w.document.body.classList.add('ark-data-hidden');
        setBooted(true);
        dbg('OK');
        setTimeout(() => { if (debugRef.current) debugRef.current.style.display = 'none'; }, 3000);
        clearInterval(iv);
      } catch (e) { dbg('ERR ' + (e && e.message)); }
    }, 250);
    return () => clearInterval(iv);
  }, [mountIframe, booted, app]);

  // ── caption + chip fly-in ────────────────────────────────────────────────────
  // Render the caption for beat k (connectors + purple chip spans built from the beat's
  // NEW chips), then fly a clone of each chip span down into its real strip rect and
  // reveal the real chip on landing. Connectors fade as the chips fly.
  const chipKey = c => `${c.group}|${c.value}`;

  const renderAndFly = useCallback((w, k) => {
    const cap = captionRef.current, fly = flyRef.current, ifr = iframeRef.current;
    if (!cap || !fly || !ifr) return;
    let info;
    try { info = w.ArkEmbed.chipInfo() || []; } catch { return; }
    const fresh = info.filter(c => !landedRef.current.has(chipKey(c)));
    const spec = CAPTIONS[k] || { segs: [] };

    // Build the caption: connectors as faded spans, chip slots matched to fresh chips by hint.
    cap.innerHTML = '';
    cap.style.opacity = '1';
    cap.className = 'ark-display' + (spec.hero ? ' bsd-hero' : '');
    const used = new Set();
    const chipSpans = []; // {span, chip}
    spec.segs.forEach(sgm => {
      if (sgm.t != null) {
        const s = document.createElement('span');
        s.textContent = sgm.t;
        s.className = 'bsd-join';
        cap.appendChild(s);
      } else if (sgm.chip != null) {
        // pick the fresh chip whose value/label contains the hint
        const hint = sgm.chip.toLowerCase();
        let chip = fresh.find((c, i) => !used.has(i) && ((c.value || '') + ' ' + (c.label || '')).toLowerCase().includes(hint));
        if (!chip) chip = fresh.find((c, i) => !used.has(i));
        if (!chip) return;
        used.add(fresh.indexOf(chip));
        const span = document.createElement('span');
        Object.assign(span.style, CHIP_CSS);
        span.className = 'bsd-chip';
        if (chip.label) { const b = document.createElement('b'); b.style.opacity = '0.75'; b.textContent = chip.label; span.appendChild(b); span.appendChild(document.createTextNode(' ')); }
        span.appendChild(document.createTextNode(chip.value));
        cap.appendChild(span);
        chipSpans.push({ span, chip });
      }
    });

    // Fly each chip span → its real strip rect, then reveal the real chip.
    const ifrBox = ifr.getBoundingClientRect();
    requestAnimationFrame(() => {
      chipSpans.forEach(({ span, chip }, idx) => {
        const from = span.getBoundingClientRect();
        const tx = ifrBox.left + chip.rect.x;      // chipInfo rects are iframe-viewport space
        const ty = ifrBox.top + chip.rect.y;
        const clone = span.cloneNode(true);
        Object.assign(clone.style, CHIP_CSS, {
          position: 'fixed', left: from.left + 'px', top: from.top + 'px', margin: 0,
          zIndex: 6, transition: 'transform .62s cubic-bezier(.22,.61,.36,1), opacity .62s',
          boxShadow: '0 12px 40px rgba(124,58,237,0.35)', pointerEvents: 'none',
        });
        fly.appendChild(clone);
        span.style.visibility = 'hidden';
        // next frame → animate to the strip
        requestAnimationFrame(() => {
          clone.style.transform = `translate(${tx - from.left}px, ${ty - from.top}px)`;
          clone.style.boxShadow = '0 2px 10px rgba(124,58,237,0.12)';
        });
        const done = () => {
          try { w.ArkEmbed.reveal(chip.group); } catch { /* noop */ }
          landedRef.current.add(chipKey(chip));
          clone.remove();
          clone.removeEventListener('transitionend', done);
        };
        clone.addEventListener('transitionend', done);
        setTimeout(done, 900); // safety if transitionend is missed
      });
      // fade connectors slightly after the chips launch
      setTimeout(() => {
        if (topBeatRef.current !== k) return;
        cap.querySelectorAll('.bsd-join').forEach(el => { el.style.transition = 'opacity .5s'; el.style.opacity = '0'; });
      }, 520);
    });
  }, []);

  // reverse to beat k's state (scroll-up): hide chips added ABOVE beat k, re-show beat k's caption.
  const reverseTo = useCallback((w, k) => {
    // hide any real chips whose beat index > k
    let info;
    try { info = w.ArkEmbed.chipInfo() || []; } catch { info = []; }
    // Hide any real chips whose owning beat index > k, then re-show beat k's caption.
    if (k < 0) {
      if (captionRef.current) { captionRef.current.innerHTML = ''; captionRef.current.style.opacity = '0'; }
      landedRef.current = new Set();
      return;
    }
    // hide chips that are NOT part of beats 0..k by re-deriving: a chip belongs to the lowest beat
    // whose hint matches it. Hide those matching only beats > k.
    info.forEach(c => {
      const hay = ((c.value || '') + ' ' + (c.label || '')).toLowerCase();
      let owner = -1;
      CAPTIONS.forEach((cap2, bi) => { (cap2.segs || []).forEach(sgm => { if (sgm.chip && hay.includes(sgm.chip.toLowerCase()) && owner === -1) owner = bi; }); });
      if (owner > k) { try { w.ArkEmbed.hideGroup(c.group); } catch { /* noop */ } landedRef.current.delete(chipKey(c)); }
    });
    // re-show beat k's caption (chips already landed for ≤k stay revealed in the strip)
    renderCaptionOnly(k);
  }, []);

  // render just the caption text for beat k (no fly) — used on reverse so the sentence returns.
  const renderCaptionOnly = useCallback((k) => {
    const cap = captionRef.current;
    if (!cap) return;
    const spec = CAPTIONS[k]; if (!spec) { cap.innerHTML = ''; cap.style.opacity = '0'; return; }
    cap.className = 'ark-display' + (spec.hero ? ' bsd-hero' : '');
    cap.style.opacity = '1';
    cap.innerHTML = spec.segs.map(sgm => sgm.t != null
      ? `<span class="bsd-join" style="opacity:0">${sgm.t}</span>`
      : `<span class="bsd-chip" style="display:inline-flex;align-items:center;gap:6px;background:#f5f3ff;border:1px solid #ede9fe;border-radius:999px;padding:4px 9px;font-size:12px;color:#7c3aed;font-weight:600;visibility:hidden">·</span>`
    ).join('');
  }, []);

  const frame = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const r = track.getBoundingClientRect();
    const vh = window.innerHeight;
    if (!mountIframe && r.top < vh * 4) { setMountIframe(true); return; }
    const scrolled = Math.max(0, -r.top);
    const cssVh = document.documentElement.clientHeight || vh;
    const storyPinPx = 4.2 * cssVh;
    const p = clamp(scrolled / storyPinPx, 0, 1);
    const w = app();

    if (frameRef.current) frameRef.current.style.opacity = collapsedRef.current ? '1' : String(easeOut(seg(p, T.frameIn)));
    if (!w || !booted) return;

    if (DEBUG) {
      const pct = Math.round(p * 50) * 2;
      if (pct !== frame._pct) { frame._pct = pct; console.log(`[bsd] p=${p.toFixed(3)} applied=[${[...appliedRef.current]}] landed=${landedRef.current.size} gen=${generatedRef.current}`); }
    }

    // explore CTA — trails the viewport bottom, rests ~15px above the section end
    const complete = collapsedRef.current || (generatedRef.current && p >= BEATS[BEATS.length - 1]);
    if (scrimRef.current) {
      const visH = document.documentElement.clientHeight || window.innerHeight;
      const lift = Math.max(0, visH - r.bottom);
      scrimRef.current.style.bottom = `${Math.round(15 + lift)}px`;
      scrimRef.current.style.opacity = String(collapsedRef.current ? 1 : (complete ? 1 : 0));
      scrimRef.current.style.pointerEvents = complete ? 'auto' : 'none';
    }
    storyDoneRef.current = complete;

    if (collapsedRef.current || armedRef.current) return; // frozen once explored

    // ── beats: apply forward (throttled), unapply on scroll-up (fully reversible) ──
    const now = performance.now();
    for (let i = 0; i < BEATS.length; i++) {
      if (p >= BEATS[i] && !appliedRef.current.has(i)) {
        if (now - lastBeatAtRef.current >= BEAT_MIN_GAP_MS) {
          if (i >= 1 && (!generatedRef.current || !w.ArkEmbed.mapReady())) break; // wait for map
          w.ArkEmbed.beatOnDesktop(i);
          appliedRef.current.add(i);
          topBeatRef.current = i;
          lastBeatAtRef.current = now;
          renderAndFly(w, i);
          if (!rafKickRef.current) { rafKickRef.current = true; setTimeout(() => { rafKickRef.current = false; frameRef2.current && frameRef2.current(); }, BEAT_MIN_GAP_MS + 30); }
        }
        break; // one beat per frame
      }
    }
    for (let i = BEATS.length - 1; i >= 0; i--) {
      if (p < BEATS[i] && appliedRef.current.has(i)) {
        w.ArkEmbed.beatOffDesktop(i);
        appliedRef.current.delete(i);
        topBeatRef.current = i - 1;
        reverseTo(w, i - 1);
      }
    }

    // generate as soon as beat 0 (topic) applied; then reveal the data (map/charts) once.
    if (!generatedRef.current && appliedRef.current.has(0)) generatedRef.current = !!w.ArkEmbed.generate();
    if (generatedRef.current && !revealedRef.current && appliedRef.current.has(0)) {
      w.ArkEmbed.setDataReveal(1); revealedRef.current = true;
    }
    if (!appliedRef.current.has(0) && revealedRef.current) { // scrolled fully back above the hero
      w.document.body.classList.add('ark-data-hidden'); revealedRef.current = false;
    }
    if (generatedRef.current) w.ArkEmbed.reassert();
  }, [mountIframe, booted, app, renderAndFly, reverseTo]);

  const measure = useCallback(() => {
    const w = app();
    if (!w || !booted) return;
    let fh = 0;
    try { fh = w.document.documentElement.scrollHeight; } catch { return; }
    if (fh > fullHRef.current + 4) { fullHRef.current = fh; setH(fh); }
  }, [app, booted]);

  useEffect(() => { frameRef2.current = frame; }, [frame]);
  useEffect(() => { measureRef.current = measure; }, [measure]);
  useEffect(() => { armedRef.current = armed; }, [armed]);

  const onExplore = useCallback(() => {
    if (!storyDoneRef.current) return;
    if (!collapsedRef.current) {
      const track = trackRef.current, frameEl = frameRef.current;
      if (track && frameEl) {
        const A = track.getBoundingClientRect().top + window.scrollY;
        const frameTopNow = frameEl.getBoundingClientRect().top;
        scrollCompRef.current = Math.max(0, Math.round(A + NAV_PX - frameTopNow));
      }
      collapsedRef.current = true;
      setCollapsed(true);
    }
    armedRef.current = true;
    const w = app(); if (w) w.__arkScripted = false;
    setArmed(true);
  }, [app]);

  useLayoutEffect(() => {
    if (collapsed && scrollCompRef.current != null) { window.scrollTo(0, scrollCompRef.current); scrollCompRef.current = null; }
  }, [collapsed]);

  // heartbeat — drains pending beats with zero scroll + runs the expensive measure off the scroll path
  useEffect(() => {
    if (!isDesktop) return;
    const hb = setInterval(() => {
      measureRef.current && measureRef.current();
      const track = trackRef.current;
      if (!track || armedRef.current) return;
      const r = track.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) frameRef2.current && frameRef2.current();
    }, 400);
    return () => clearInterval(hb);
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    const onResize = () => { onScroll(); measureRef.current && measureRef.current(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [frame, isDesktop]);

  if (!isDesktop) return <MobileSentenceDemo />;

  const frameH = H > 0 ? `${H}px` : '100vh';
  const sectionH = collapsed
    ? `${(H > 0 ? H : 0) + NAV_PX}px`
    : (H > 0 ? `calc(420vh + ${H + NAV_PX}px)` : 'calc(520vh)');

  return (
    <>
      <style>{`
        .bsd-cap{position:absolute;left:0;right:0;top:${NAV_PX + 12}px;z-index:5;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;padding:0 24px;text-align:center;pointer-events:none;transition:opacity .5s}
        .bsd-cap .bsd-join{color:#C9DBEE;font-weight:500;font-size:22px;letter-spacing:-.01em}
        .bsd-cap.bsd-hero .bsd-join{font-size:34px;font-weight:600}
        .bsd-cap.bsd-hero .bsd-chip{font-size:16px !important;padding:7px 14px !important}
      `}</style>
      <section ref={trackRef} style={{ height: sectionH, position: 'relative', boxSizing: 'border-box', paddingTop: collapsed ? `${NAV_PX}px` : 0, background: '#060D1A', borderTop: '1px solid #101E33' }}>
        <div ref={frameRef}
          style={{ opacity: 0, position: collapsed ? 'relative' : 'sticky', top: collapsed ? 'auto' : `${NAV_PX}px`, height: frameH, width: 'min(1240px, calc(100vw - 40px))', margin: '0 auto', borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #1B3050', borderBottom: 'none', boxShadow: '0 30px 80px rgba(0,0,0,0.55)', background: '#f8fafc' }}>
          <span ref={debugRef} className="ark-mono" style={{ position: 'absolute', top: '8px', left: '10px', zIndex: 9, color: '#FF8A9A', fontSize: '11px', background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '6px' }}>boot: waiting for iframe…</span>

          {!booted && !iframeDead && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh', display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px', background: '#f8fafc', zIndex: 2, pointerEvents: 'none' }}>
              <div style={{ height: '44px', borderRadius: '10px', background: 'linear-gradient(90deg,#eef2f7 25%,#e2e8f0 50%,#eef2f7 75%)', backgroundSize: '200% 100%', animation: 'arkShimmer 1.2s linear infinite' }} />
              <div style={{ height: '58px', borderRadius: '10px', background: 'linear-gradient(90deg,#eef2f7 25%,#e2e8f0 50%,#eef2f7 75%)', backgroundSize: '200% 100%', animation: 'arkShimmer 1.2s linear infinite' }} />
              <div style={{ flex: 1, borderRadius: '10px', background: 'linear-gradient(90deg,#eef2f7 25%,#e2e8f0 50%,#eef2f7 75%)', backgroundSize: '200% 100%', animation: 'arkShimmer 1.2s linear infinite' }} />
              <style>{`@keyframes arkShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            </div>
          )}
          {iframeDead && (
            <button onClick={() => { loadFiredRef.current = false; setIframeDead(false); setMountIframe(false); setTimeout(() => setMountIframe(true), 50); }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh', zIndex: 2, border: 'none', cursor: 'pointer', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
              <span className="ark-display" style={{ color: '#0f172a', fontSize: '17px', fontWeight: 700 }}>The live builder didn't load</span>
              <span className="ark-mono" style={{ color: '#64748b', fontSize: '12px' }}>Click to retry</span>
            </button>
          )}
          {mountIframe && !iframeDead && (
            <iframe
              ref={iframeRef}
              src="/builder/index.html?script=1"
              title="ArkData Audience Builder"
              loading="eager"
              scrolling="no"
              onLoad={() => { loadFiredRef.current = true; }}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: armed ? 'auto' : 'none' }}
            />
          )}
        </div>

        {/* caption above the builder (chips fly out of it into the strip) */}
        <div ref={captionRef} className="bsd-cap" style={{ opacity: 0 }} />
        {/* fixed layer hosting the flying chip clones */}
        <div ref={flyRef} style={{ position: 'fixed', inset: 0, zIndex: 6, pointerEvents: 'none' }} />

        {!armed && (
          <button ref={scrimRef} onClick={onExplore}
            style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: '15px', opacity: 0, pointerEvents: 'none', zIndex: 55, background: 'rgba(6,13,26,0.92)', border: `1px solid ${GREEN_BORDER}`, borderRadius: '100px', padding: '11px 22px', cursor: 'pointer' }}>
            <span className="ark-mono" style={{ color: '#6FE3B0', fontSize: '12px', letterSpacing: '0.08em' }}>● LIVE — click to explore</span>
          </button>
        )}
        {armed && (
          <button onClick={() => { armedRef.current = false; setArmed(false); }}
            aria-label="Lock the builder and scroll the page"
            style={{ position: 'fixed', top: `${NAV_PX + 8}px`, right: '16px', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(6,13,26,0.85)', border: '1px solid #1B3050', color: '#A9C1DC', fontSize: '15px', cursor: 'pointer', zIndex: 56 }}>✕</button>
        )}
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
