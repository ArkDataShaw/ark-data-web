import React, { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// MobileSentenceDemo — the ≤1000px scripted builder story.
//
// On mobile the builder has NO chips: its strip renders the English sentence
// (renderSentence / specSentence, 15px → 13px → fold-to-rail). So every beat
// here is exactly one S mutation applied through ArkEmbed.applyStep(i) +
// sync() — the builder's own renderer grows the sentence. No chip DOM is ever
// touched. The fragment fly-in animation itself ships upstream (Goal 11);
// these beats will drive it the moment it's re-vendored.
//
// Beat order (Phase 2 design): reach number first, then topic, then filters
// left-to-right — homeowner → net worth → FL. Beats are spaced ~15% of the
// track (the scroll-equivalent of ~1.2-1.8s at typical thumb speed) so each
// fragment lands as its own moment. The scripted sentence stays within 3
// lines at 15px (verified fragment set); heavier free-play filters fold to
// the rail by design.
//
// Interactivity: pointer-events stay OFF through the story (page scroll never
// traps in the iframe). At the end a "Tap to explore" scrim arms the iframe;
// tapping enables full touch — an ✕ pill re-locks so the visitor can always
// get page scroll back.
// ─────────────────────────────────────────────────────────────────────────────

const GREEN_BORDER = 'rgba(25,195,125,0.35)';
// Pin the builder 10px below the 70px fixed marketing nav (matches desktop's paddingTop:80).
// Also the sticky `top` offset AND the collapsed-mode top gap — kept in one place so the
// story pin-range math (section − frame − NAV) and the scroll-compensation on collapse agree.
const NAV_PX = 80;

// beat thresholds within the track (index-aligned with ArkEmbed.STEPS)
// Beats spread across the FULL pinned range (Shaw bug 2026-07-07: they were
// compressed into 0.16-0.58 of a short track — the whole build landed in one
// flick). First beat fires essentially at pin-start; last ~70% so the
// generate + data fade still fit.
// Shaw's order v3 (2026-07-08): topic/US → FL zoom → County/ZIP flip → homeowners → metros/S-FL zoom → millionaires
// v4 (2026-07-08): FL-zoom + County/ZIP flip merged into one beat → 5 beats.
// topic/US → FL zoom+County/ZIP → homeowners → metros/S-FL zoom → millionaires
const BEATS = [0.05, 0.23, 0.44, 0.63, 0.79];
const T = { frameIn: [0.0, 0.05], reachAt: 0.02, generateAt: 0.78, dataReveal: [0.82, 0.99] };
const BEAT_MIN_GAP_MS = 350; // catch-up throttle: one fly-in at a time, even on a fast flick

const DEBUG = typeof window !== 'undefined' && /[?&]debugBeats=1/.test(window.location.search);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (p, [a, b]) => clamp((p - a) / (b - a), 0, 1);
const easeOut = t => 1 - Math.pow(1 - t, 3);

export default function MobileSentenceDemo() {
  const trackRef = useRef(null);
  const frameRef = useRef(null);
  const iframeRef = useRef(null);
  const scrimRef = useRef(null);
  const debugRef = useRef(null);
  const appliedRef = useRef(new Set());
  const lastBeatAtRef = useRef(0);
  const rafKickRef = useRef(false);
  const frameRef2 = useRef(null); // latest frame() for the catch-up self-kick
  const generatedRef = useRef(false);
  const storyDoneRef = useRef(false); // story is CURRENTLY complete (recomputed each frame, not latched)
  const armedRef = useRef(false);     // mirror of `armed` for frame()/heartbeat without a stale closure
  const collapsedRef = useRef(false); // mirror of `collapsed` for frame() without a stale closure
  const scrollCompRef = useRef(null); // target scrollY captured at collapse → applied in a layout effect (keeps the builder under the eye)
  const fullHRef = useRef(0);         // running MAX of the builder's full content height (monotonic → no shrink-jump)
  const covFillRef = useRef(-1);      // last coverage-card min-height (px) set into the iframe (fill below map on iPad)
  const measureRef = useRef(null);    // latest measure() for the heartbeat (expensive layout reads, off the scroll path)
  const [H, setH] = useState(0);      // builder full content height → iframe + section sizing (0 until measured)
  const [collapsed, setCollapsed] = useState(false); // explore tapped → drop the phantom pin-range (animation scroll no longer needed)
  const [mountIframe, setMountIframe] = useState(false);
  const [booted, setBooted] = useState(false);
  const [armed, setArmed] = useState(false); // scrim tapped → touch enabled
  const [iframeDead, setIframeDead] = useState(false); // load never fired → poster fallback
  const loadFiredRef = useRef(false);
  const bootT0 = useRef(0);

  // idle-mount: boot the iframe ~2s after page load so ArkEmbed is ready long
  // before the visitor reaches the track (fast-flick approach previously beat
  // the boot and the first beats lagged pin-start).
  useEffect(() => {
    const t = setTimeout(() => { bootT0.current = performance.now(); setMountIframe(true); }, 2000);
    return () => clearTimeout(t);
  }, []);

  // hard fallback: if the iframe load event hasn't fired in 10s (iOS Safari
  // can refuse offscreen/sticky-parent iframes), swap to a poster + retry —
  // the demo must NEVER hang blank.
  useEffect(() => {
    if (!mountIframe || iframeDead) return;
    const t = setTimeout(() => {
      if (!loadFiredRef.current) {
        if (DEBUG) console.log('[boot] iframe load NOT fired after 10s — poster fallback');
        setIframeDead(true);
      }
    }, 10000);
    return () => clearTimeout(t);
  }, [mountIframe, iframeDead]);

  const app = useCallback(() => {
    const w = iframeRef.current && iframeRef.current.contentWindow;
    try { return (w && w.ArkEmbed && w.ArkEmbed.ready) ? w : null; } catch { return null; }
  }, []);

  // boot: load snapshot only (steps apply on scroll)
  useEffect(() => {
    if (!mountIframe || booted) return;
    const dbg = m => { if (debugRef.current) debugRef.current.textContent = 'boot: ' + m; };
    const iv = setInterval(() => {
      const w = app();
      if (!w) { dbg('waiting for app'); return; }
      try {
        if (DEBUG) console.log(`[boot] ArkEmbed ready +${Math.round(performance.now() - bootT0.current)}ms`);
        w.ArkEmbed.loadSnapshot('/builder/snapshot-pool.json');
        w.ArkEmbed.loadStages('/builder/stages-pool.json');
        w.ArkEmbed.enableFullHeight(); // native-scroll: shell/main lay out at full content height; the iframe becomes a sticky, full-height, non-internally-scrolling surface
        w.ArkEmbed.holdGeo = true; // funnel: full FL density held until the last beat
        w.__arkScripted = true; // scripted story owns reach — suppress live re-agg so scroll-up fully reverses (Shaw 2026-07-08). Cleared when the visitor taps "explore".
        w.document.body.classList.add('ark-data-hidden');
        setBooted(true);
        dbg('OK');
        setTimeout(() => { if (debugRef.current) debugRef.current.style.display = 'none'; }, 3000);
        clearInterval(iv);
      } catch (e) { dbg('ERR ' + (e && e.message)); }
    }, 250);
    return () => clearInterval(iv);
  }, [mountIframe, booted, app]);

  const frame = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const r = track.getBoundingClientRect();
    const vh = window.innerHeight;
    if (!mountIframe && r.top < vh * 4) { setMountIframe(true); return; } // fallback if the idle timer hasn't fired
    // ── one native scroll (sticky full-height iframe) ───────────────────────────
    // The iframe is full content-height and `position:sticky; top:NAV_PX`. While the
    // section has slack below it (the story region), the iframe PINS at the top — map
    // + strip held, beats fire keyed to `p`. Once the pin range is used up the iframe
    // RELEASES and scrolls with the page NATIVELY (real momentum) through the charts /
    // records, then the section ends. Sticky's release is jump-free by construction —
    // no JS-driven .main.scrollTop, no snapping (Shaw 2026-07-08).
    const scrolled = Math.max(0, -r.top);
    // storyPinPx MUST use the CSS-vh reference (documentElement.clientHeight), NOT
    // window.innerHeight — under mobile emulation they differ (812 vs 1070), and the
    // section height is authored in CSS `vh`, so mixing units mis-paces the story.
    // 4.2 * cssVh == the section's `420vh` term == the sticky pin range (section
    // height − iframe height − NAV_PX = 420vh + H + NAV − H − NAV = 420vh). Beats stay
    // keyed to `p` over exactly the pin range.
    const cssVh = document.documentElement.clientHeight || vh;
    const storyPinPx = 4.2 * cssVh;
    const p = clamp(scrolled / storyPinPx, 0, 1);
    const w = app();
    if (DEBUG) {
      const pct = Math.round(p * 50) * 2;
      if (pct !== frame._dbgPct) { frame._dbgPct = pct; console.log(`[beats] p=${p.toFixed(3)} booted=${booted} ready=${!!w} applied=${appliedRef.current.size}`); }
    }

    if (frameRef.current) {
      // opacity-only fade-in (no translateY — a transform on the sticky element is
      // fine, but we keep it pure so nothing competes with the pin). Once collapsed the
      // story is frozen at its final state, so hold the frame fully visible (p≈0 now).
      frameRef.current.style.opacity = collapsedRef.current ? '1' : String(easeOut(seg(p, T.frameIn)));
    }
    if (!w || !booted) return;
    // NOTE: the expensive cross-iframe LAYOUT reads (full-height measurement + the tablet
    // --ark-cardh match) are NOT done here — they force a synchronous reflow of the huge
    // full-height iframe and running them on every scroll frame caused scroll jank
    // (Shaw 2026-07-08). They live in measure() on the 400ms heartbeat instead, since they
    // only change as the iframe boots/grows or on resize — never per scroll pixel.

    // ── explore CTA — a FIXED pill that TRAILS the viewport bottom and comes to rest
    // ~15px above the audience section's bottom edge (Shaw 2026-07-08). top follows the
    // lesser of the viewport bottom and the section bottom, so it settles at the section
    // end instead of overlapping the next section. It fades in as the story completes;
    // once collapsed it stays fully visible as the re-arm affordance.
    const dr = seg(p, T.dataReveal);
    const complete = collapsedRef.current || (generatedRef.current && dr >= 1);
    if (scrimRef.current) {
      // Glue the pill to the viewport bottom with pure CSS `bottom:15px` — while the section
      // bottom is off-screen this value never changes, so the compositor pins it perfectly
      // (no per-scroll JS = no skip on iOS momentum). Only once the section bottom enters the
      // view do we LIFT it (bottom += visH − sectionBottom) so it comes to rest 15px above
      // the section's bottom edge instead of floating over the next section. visH is the CSS
      // viewport (clientHeight), matching r.bottom's getBoundingClientRect space.
      const visH = document.documentElement.clientHeight || window.innerHeight;
      const lift = Math.max(0, visH - r.bottom); // >0 only when the section end is on-screen
      scrimRef.current.style.bottom = `${Math.round(15 + lift)}px`;
      scrimRef.current.style.opacity = String(collapsedRef.current ? 1 : dr);
      scrimRef.current.style.pointerEvents = complete ? 'auto' : 'none';
    }
    storyDoneRef.current = complete; // "story currently complete" — gates tap-to-arm (onExplore)

    // Collapsed = the animation is done and the phantom pin-range is gone; freeze the
    // story at its final state and never drive/reverse beats again.
    if (collapsedRef.current) return;
    // Once the visitor taps "explore" they drive the builder — freeze the scripted
    // story so page-scroll no longer applies/unapplies beats (Shaw 2026-07-08).
    if (armedRef.current) return;

    // sentence beats: one S mutation per beat, renderer does the rest.
    // Catch-up is throttled to one beat per BEAT_MIN_GAP_MS so a fast flick
    // still reads as a left-to-right build; scroll-up unapplies immediately.
    const now = performance.now();
    for (let i = 0; i < BEATS.length; i++) {
      if (p >= BEATS[i] && !appliedRef.current.has(i)) {
        if (now - lastBeatAtRef.current >= BEAT_MIN_GAP_MS) {
          // ORDER MATTERS: the intent gate blocks Generate until a topic is
          // applied, and the map only initializes ON Generate. So beat 0
          // applies the topic (sentence+reach need no map), Generate follows
          // below, and beats 1+ wait for the map (they're map moves).
          if (i >= 1 && (!generatedRef.current || !w.ArkEmbed.mapReady())) break; // heartbeat retries
          w.ArkEmbed.beatOn(i); appliedRef.current.add(i); lastBeatAtRef.current = now;
          if (DEBUG) console.log(`[beats] beatOn(${i}) p=${p.toFixed(3)}`);
          if (!rafKickRef.current) { rafKickRef.current = true; setTimeout(() => { rafKickRef.current = false; frameRef2.current && frameRef2.current(); }, BEAT_MIN_GAP_MS + 30); }
        }
        break; // never apply two beats in one frame
      }
    }
    // scroll-up ALWAYS unapplies (full reversibility) — the `armed` guard above already
    // froze the story once the visitor took over, so this only runs pre-explore.
    for (let i = BEATS.length - 1; i >= 0; i--) {
      if (p < BEATS[i] && appliedRef.current.has(i)) {
        w.ArkEmbed.beatOff(i); appliedRef.current.delete(i);
        if (DEBUG) console.log(`[beats] beatOff(${i}) p=${p.toFixed(3)}`);
      }
    }

    // generate as soon as beat 0 (topic) is applied — the intent gate passes now
    if (!generatedRef.current && appliedRef.current.has(0)) {
      generatedRef.current = !!w.ArkEmbed.generate();
    }
    // cheap per-tick re-asserts (late canned poll stomps reach / nulls geo)
    if (generatedRef.current) w.ArkEmbed.reassert();
    // staggered map→cards fade, driven by the same data-reveal fraction as the CTA
    if (generatedRef.current) w.ArkEmbed.setDataReveal(dr);

    // No explore-phase scroll driving: past the pin range the sticky iframe releases and
    // the page scrolls it natively through the charts/records. The CTA reveal + storyDone
    // are handled up top (before the beat gate) so they run even when collapsed.
  }, [mountIframe, booted, app]);

  // measure() — the EXPENSIVE cross-iframe layout reads, kept OFF the per-scroll path (they
  // force a synchronous reflow of the huge full-height iframe). Runs on the 400ms heartbeat +
  // resize; the values only change as the iframe boots/grows or the viewport resizes, never
  // per scroll pixel. This is the fix for the scroll slowdown (Shaw 2026-07-08).
  const measure = useCallback(() => {
    const w = app();
    if (!w || !booted) return;
    // full content height → iframe + section sizing. Monotonic (max) so a beat-off shrinking
    // charts can't shrink the section under the visitor (no shrink-jump).
    let fh = 0;
    try { fh = w.document.documentElement.scrollHeight; } catch (e) { return; }
    if (fh > fullHRef.current + 4) { fullHRef.current = fh; setH(fh); }
    // Tablet (iPad): match the maprail row height to the insight cards below it — measure one
    // insight card and publish --ark-cardh. Gated on the 680–1000px iframe width; phones compact.
    try {
      const idoc = w.document;
      const railW = idoc.documentElement.clientWidth || 0;
      const tablet = railW >= 680 && railW <= 1000;
      const cov = idoc.querySelector('.maprail .card:first-child');
      const topInFrame = cov ? cov.getBoundingClientRect().top : 0; // >200 ⇒ previewArea laid out
      if (cov && topInFrame > 200 && tablet) {
        const sample = idoc.querySelector('.insights .card');
        const cardH = sample ? Math.round(sample.getBoundingClientRect().height) : 0;
        if (cardH > 40 && cardH !== covFillRef.current) {
          covFillRef.current = cardH;
          idoc.documentElement.style.setProperty('--ark-cardh', cardH + 'px');
        }
        cov.classList.add('ark-cov-fill');
        cov.style.minHeight = '';
      } else if (cov && covFillRef.current !== 0) {
        covFillRef.current = 0; cov.style.minHeight = ''; cov.classList.remove('ark-cov-fill');
        idoc.documentElement.style.removeProperty('--ark-cardh');
      }
    } catch (e) { /* iframe not ready */ }
  }, [app, booted]);

  useEffect(() => { frameRef2.current = frame; }, [frame]);
  useEffect(() => { measureRef.current = measure; }, [measure]);
  useEffect(() => { armedRef.current = armed; }, [armed]); // keep the ref in sync both ways (tap-to-explore AND ✕ return)

  // tap-to-explore: hand live filtering to the visitor AND, the first time, COLLAPSE the
  // section — the 420vh pin-range is phantom scroll that only existed to drive the story
  // animation; once the visitor wants to explore it's dead weight ("scroll up forever").
  // We capture a target scrollY so the builder stays exactly under the eye across the
  // height change (the pin's frameTop is ~NAV_PX; after collapse the frame sits NAV_PX
  // below the section top, so scrollY = sectionAbsTop keeps it put).
  const onExplore = useCallback(() => {
    if (!storyDoneRef.current) return;
    if (!collapsedRef.current) {
      const track = trackRef.current, frameEl = frameRef.current;
      if (track && frameEl) {
        const A = track.getBoundingClientRect().top + window.scrollY; // section absolute top (unchanged by the collapse)
        const frameTopNow = frameEl.getBoundingClientRect().top;      // ~NAV_PX while pinned
        scrollCompRef.current = Math.max(0, Math.round(A + NAV_PX - frameTopNow));
      }
      collapsedRef.current = true;
      setCollapsed(true);
    }
    armedRef.current = true;
    const w = app(); if (w) w.__arkScripted = false; // live filtering back to the visitor
    setArmed(true);
  }, [app]);

  // Per-bar tooltips on TAP without arming. The iframe is pointer-events:none (so page scroll
  // passes through), so the bars never receive touch directly — the PARENT gets the touch on
  // the frame div and forwards a genuine TAP (small move, short duration) into the iframe via
  // ArkEmbed.tapTooltipAt. A swipe (move) is left alone → it scrolls the page as before. When
  // the visitor has armed the builder, the iframe handles its own touch, so we skip forwarding.
  const tapRef = useRef(null);
  const onFrameTouchStart = useCallback((e) => {
    if (armedRef.current) return;
    const t = e.touches && e.touches[0]; if (!t) return;
    tapRef.current = { x: t.clientX, y: t.clientY, at: performance.now() };
  }, []);
  const onFrameTouchEnd = useCallback((e) => {
    if (armedRef.current) return;
    const s = tapRef.current; tapRef.current = null; if (!s) return;
    const t = e.changedTouches && e.changedTouches[0]; if (!t) return;
    const moved = Math.hypot(t.clientX - s.x, t.clientY - s.y);
    if (moved > 10 || performance.now() - s.at > 500) return; // a swipe/scroll, not a tap — leave it
    const w = app(); const ifr = iframeRef.current;
    if (!w || !ifr) return;
    const r = ifr.getBoundingClientRect(); // iframe-viewport coords = client − iframe origin
    try { w.ArkEmbed.tapTooltipAt && w.ArkEmbed.tapTooltipAt(t.clientX - r.left, t.clientY - r.top); } catch (err) { /* noop */ }
  }, [app]);

  // apply the captured scroll target after the collapsed layout commits (pre-paint → no flash)
  useLayoutEffect(() => {
    if (collapsed && scrollCompRef.current != null) {
      window.scrollTo(0, scrollCompRef.current);
      scrollCompRef.current = null;
    }
  }, [collapsed]);

  // heartbeat — drains pending beats even with zero scroll events, and runs the expensive
  // layout measure() OFF the scroll path (once per 400ms is negligible; per scroll frame was not).
  useEffect(() => {
    const hb = setInterval(() => {
      measureRef.current && measureRef.current();
      const track = trackRef.current;
      if (!track || armedRef.current) return;
      const r = track.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) frameRef2.current && frameRef2.current();
    }, 400);
    return () => clearInterval(hb);
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    const onResize = () => { onScroll(); measureRef.current && measureRef.current(); }; // re-measure promptly on orientation/resize (NOT on scroll)
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [frame]);

  const frameH = H > 0 ? `${H}px` : '100vh';
  // EXPANDED: 420vh phantom pin-range + builder height + nav gap (the pin range drives the
  // scroll story). COLLAPSED (post-explore): just the builder + nav gap — the phantom scroll
  // is removed so the visitor doesn't have to "scroll up forever" past a dead animation.
  // border-box so the collapsed paddingTop (nav gap) doesn't add to the height.
  const sectionH = collapsed
    ? `${(H > 0 ? H : 0) + NAV_PX}px`
    : (H > 0 ? `calc(420vh + ${H + NAV_PX}px)` : 'calc(520vh)');
  return (
    <section ref={trackRef} style={{ height: sectionH, position: 'relative', boxSizing: 'border-box', paddingTop: collapsed ? `${NAV_PX}px` : 0, background: '#060D1A', borderTop: '1px solid #101E33' }}>
      {/* The frame is the STICKY full-content-height surface: pinned NAV_PX below the nav
          while the story plays (pin range = section − frame − NAV = 420vh), then it releases
          to native scroll. On explore we COLLAPSE → position:relative, so it sits inline in a
          builder-height section (phantom pin-range gone). Sticky/relative are both positioned
          containing blocks, so the absolute children (skeleton) resolve against it. */}
      <div ref={frameRef}
        onTouchStart={onFrameTouchStart}
        onTouchEnd={onFrameTouchEnd}
        style={{ opacity: 0, position: collapsed ? 'relative' : 'sticky', top: collapsed ? 'auto' : `${NAV_PX}px`, height: frameH, margin: '0 10px', borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #1B3050', borderBottom: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.55)', background: '#f8fafc', touchAction: 'pan-y' }}>
        <span ref={debugRef} className="ark-mono" style={{ position: 'absolute', top: '8px', left: '10px', zIndex: 9, color: '#FF8A9A', fontSize: '10px', background: 'rgba(0,0,0,0.6)', padding: '2px 7px', borderRadius: '6px' }}>boot: waiting…</span>

        {/* boot skeleton — never a blank frame. Only the pinned first viewport is visible,
            so a fixed-height skeleton (not flex-fill of the full-content frame) is correct. */}
        {!booted && !iframeDead && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh', display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px', background: '#f8fafc', zIndex: 2, pointerEvents: 'none' }}>
            <div style={{ height: '44px', borderRadius: '10px', background: 'linear-gradient(90deg,#eef2f7 25%,#e2e8f0 50%,#eef2f7 75%)', backgroundSize: '200% 100%', animation: 'arkShimmer 1.2s linear infinite' }} />
            <div style={{ height: '58px', borderRadius: '10px', background: 'linear-gradient(90deg,#eef2f7 25%,#e2e8f0 50%,#eef2f7 75%)', backgroundSize: '200% 100%', animation: 'arkShimmer 1.2s linear infinite' }} />
            <div style={{ flex: 1, borderRadius: '10px', background: 'linear-gradient(90deg,#eef2f7 25%,#e2e8f0 50%,#eef2f7 75%)', backgroundSize: '200% 100%', animation: 'arkShimmer 1.2s linear infinite' }} />
            <style>{`@keyframes arkShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        )}
        {iframeDead && (
          <button
            onClick={() => { loadFiredRef.current = false; setIframeDead(false); setMountIframe(false); setTimeout(() => setMountIframe(true), 50); }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh', zIndex: 2, border: 'none', cursor: 'pointer', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}
          >
            <span className="ark-display" style={{ color: '#0f172a', fontSize: '17px', fontWeight: 700 }}>The live builder didn't load</span>
            <span className="ark-mono" style={{ color: '#64748b', fontSize: '12px' }}>Tap to retry</span>
          </button>
        )}
        {mountIframe && !iframeDead && (
          <iframe
            ref={iframeRef}
            src="/builder/index.html?script=1"
            title="ArkData Audience Builder"
            loading="eager"
            scrolling="no"
            onLoad={() => { loadFiredRef.current = true; if (DEBUG) console.log(`[boot] iframe load +${Math.round(performance.now() - bootT0.current)}ms`); }}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: armed ? 'auto' : 'none' }}
          />
        )}

      </div>

      {/* explore CTA + ✕ live at the SECTION level as position:fixed so they TRAIL the
          viewport (not the tall frame). The CTA's `top` is driven in frame() to follow the
          viewport bottom and rest ~15px above the section's bottom edge; ✕ locks interaction
          so the page scrolls past the builder (escapes the map's touch-capture). */}
      {!armed && (
        <button
          ref={scrimRef}
          onClick={onExplore}
          style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: '15px', opacity: 0, pointerEvents: 'none', zIndex: 55, background: 'rgba(6,13,26,0.92)', border: `1px solid ${GREEN_BORDER}`, borderRadius: '100px', padding: '11px 22px', cursor: 'pointer' }}
        >
          <span className="ark-mono" style={{ color: '#6FE3B0', fontSize: '12px', letterSpacing: '0.08em' }}>● LIVE — tap to explore</span>
        </button>
      )}
      {armed && (
        <button
          onClick={() => { armedRef.current = false; setArmed(false); /* lock interaction; stays collapsed */ }}
          aria-label="Lock the builder and scroll the page"
          style={{ position: 'fixed', top: `${NAV_PX + 8}px`, right: '16px', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(6,13,26,0.85)', border: '1px solid #1B3050', color: '#A9C1DC', fontSize: '15px', cursor: 'pointer', zIndex: 56 }}
        >✕</button>
      )}
    </section>
  );
}
