import React, { useRef, useEffect, useCallback, useState } from 'react';

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

// beat thresholds within the track (index-aligned with ArkEmbed.STEPS)
// Beats spread across the FULL pinned range (Shaw bug 2026-07-07: they were
// compressed into 0.16-0.58 of a short track — the whole build landed in one
// flick). First beat fires essentially at pin-start; last ~70% so the
// generate + data fade still fit.
const BEATS = [0.06, 0.27, 0.48, 0.69]; // topic, homeowner, networth, geo(FL)
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
  const storyDoneRef = useRef(false);
  const [mountIframe, setMountIframe] = useState(false);
  const [booted, setBooted] = useState(false);
  const [armed, setArmed] = useState(false); // scrim tapped → touch enabled

  // idle-mount: boot the iframe ~2s after page load so ArkEmbed is ready long
  // before the visitor reaches the track (fast-flick approach previously beat
  // the boot and the first beats lagged pin-start).
  useEffect(() => {
    const t = setTimeout(() => setMountIframe(true), 2000);
    return () => clearTimeout(t);
  }, []);

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
        w.ArkEmbed.loadSnapshot('/builder/snapshot-pool.json');
        w.ArkEmbed.loadStages('/builder/stages-pool.json');
        w.ArkEmbed.holdGeo = true; // funnel: full FL density held until the last beat
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
    const p = clamp(-r.top / Math.max(r.height - vh, 1), 0, 1);
    const w = app();
    if (DEBUG) {
      const pct = Math.round(p * 50) * 2;
      if (pct !== frame._dbgPct) { frame._dbgPct = pct; console.log(`[beats] p=${p.toFixed(3)} booted=${booted} ready=${!!w} applied=${appliedRef.current.size}`); }
    }

    if (frameRef.current) {
      const t = easeOut(seg(p, T.frameIn));
      frameRef.current.style.opacity = String(t);
      frameRef.current.style.transform = `translateY(${(1 - t) * 36}px)`;
    }
    if (!w || !booted) return;


    // sentence beats: one S mutation per beat, renderer does the rest.
    // Catch-up is throttled to one beat per BEAT_MIN_GAP_MS so a fast flick
    // still reads as a left-to-right build; scroll-up unapplies immediately.
    const now = performance.now();
    for (let i = 0; i < BEATS.length; i++) {
      if (p >= BEATS[i] && !appliedRef.current.has(i)) {
        if (now - lastBeatAtRef.current >= BEAT_MIN_GAP_MS) {
          w.ArkEmbed.applyStep(i); appliedRef.current.add(i); lastBeatAtRef.current = now;
          if (i === 0 && !generatedRef.current) { if (w.ArkEmbed.generate()) generatedRef.current = true; }
          w.ArkEmbed.setStage(i);            // reach + state density + coverage for this stage
          if (i === BEATS.length - 1) w.ArkEmbed.releaseGeo(); // FL: full density + county/ZIP + fit
          if (DEBUG) console.log(`[beats] APPLY step ${i} at p=${p.toFixed(3)} innerH=${window.innerHeight} vv=${window.visualViewport ? Math.round(window.visualViewport.height) : 'n/a'}`);
          if (!rafKickRef.current) { rafKickRef.current = true; setTimeout(() => { rafKickRef.current = false; frameRef2.current && frameRef2.current(); }, BEAT_MIN_GAP_MS + 30); }
        }
        break; // never apply two beats in one frame
      }
    }
    BEATS.forEach((at, i) => {
      if (p < at && appliedRef.current.has(i) && !storyDoneRef.current) {
        w.ArkEmbed.unapplyStep(i); appliedRef.current.delete(i);
        if (appliedRef.current.size > 0) w.ArkEmbed.setStage(appliedRef.current.size - 1);
      }
    });

    // re-assert the active stage (canned poll lands late and would otherwise
    // stick stage-4 reach/density over an earlier stage)
    if (generatedRef.current && appliedRef.current.size > 0 && !storyDoneRef.current) {
      w.ArkEmbed.setStage(appliedRef.current.size - 1);
    }
    let fadeDone = false;
    if (generatedRef.current) {
      const x = seg(p, T.dataReveal);
      w.ArkEmbed.setDataReveal(x);
      fadeDone = x >= 1;
    }
    if (fadeDone && !storyDoneRef.current) {
      storyDoneRef.current = true;
      if (scrimRef.current) scrimRef.current.style.opacity = '1';
    }
  }, [mountIframe, booted, app]);

  useEffect(() => { frameRef2.current = frame; }, [frame]);

  // heartbeat — drains pending beats even with zero scroll events
  useEffect(() => {
    const hb = setInterval(() => {
      const track = trackRef.current;
      if (!track || storyDoneRef.current) return;
      const r = track.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) frameRef2.current && frameRef2.current();
    }, 400);
    return () => clearInterval(hb);
  }, []);

  useEffect(() => {
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
  }, [frame]);

  return (
    <section ref={trackRef} style={{ height: '520vh', position: 'relative', background: '#060D1A', borderTop: '1px solid #101E33' }}>
      {/* dvh-safe stage height: iOS address bar makes 100vh taller than the visible viewport */}
      <style>{`.ark-msd-stage{height:100vh}@supports (height:100dvh){.ark-msd-stage{height:100dvh}}`}</style>
      <div className="ark-msd-stage" style={{ position: 'sticky', top: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingTop: '80px', boxSizing: 'border-box' }}>
        <span ref={debugRef} className="ark-mono" style={{ position: 'absolute', top: '8px', left: '10px', zIndex: 9, color: '#FF8A9A', fontSize: '10px', background: 'rgba(0,0,0,0.6)', padding: '2px 7px', borderRadius: '6px' }}>boot: waiting…</span>

        <div ref={frameRef} style={{ opacity: 0, margin: '0 10px', flex: 1, minHeight: 0, borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #1B3050', borderBottom: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.55)', background: '#f8fafc', position: 'relative', touchAction: 'pan-y' }}>
          {mountIframe && (
            <iframe
              ref={iframeRef}
              src="/builder/index.html?script=1"
              title="ArkData Audience Builder"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: armed ? 'auto' : 'none' }}
            />
          )}

          {/* tap-to-explore scrim (appears when the story completes) */}
          {!armed && (
            <button
              ref={scrimRef}
              onClick={() => { if (storyDoneRef.current) setArmed(true); }}
              style={{ position: 'absolute', left: '50%', bottom: '18px', transform: 'translateX(-50%)', opacity: 0, transition: 'opacity 0.5s', background: 'rgba(6,13,26,0.92)', border: `1px solid ${GREEN_BORDER}`, borderRadius: '100px', padding: '11px 22px', cursor: 'pointer' }}
            >
              <span className="ark-mono" style={{ color: '#6FE3B0', fontSize: '12px', letterSpacing: '0.08em' }}>● LIVE — tap to explore</span>
            </button>
          )}
          {armed && (
            <button
              onClick={() => setArmed(false)}
              aria-label="Return to page scrolling"
              style={{ position: 'absolute', top: '10px', right: '10px', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(6,13,26,0.85)', border: '1px solid #1B3050', color: '#A9C1DC', fontSize: '15px', cursor: 'pointer', zIndex: 5 }}
            >✕</button>
          )}
        </div>
      </div>
    </section>
  );
}
