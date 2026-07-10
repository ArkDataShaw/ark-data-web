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
// The sentence lives on the DARK PAGE surface, in its own band ABOVE the builder (NOT inside the
// app — natural-language-to-audience isn't a builder feature yet; it'll live on a separate surface
// like a chat bubble). We reserve this band by pinning the builder SENTENCE_ZONE px lower, so the
// sentence has room to display, the filters fly out of it into the strip, and the rest fades.
const SENTENCE_ZONE = 118;

// beat COMMIT thresholds (data update + chip fly) over the pinned range. Each beat's sentence
// fades in CAPTION_LEAD earlier, so the sentence always reads a moment BEFORE its data lands.
const CAPTION_LEAD = 0.05;
const BEATS = [0.10, 0.32, 0.54, 0.74];
// builder is visible from the start (Shaw 2026-07-10): sentence + builder appear together in their
// pre-pin positions, then pin as you scroll. A quick fade as the section enters, not gated on beats.
const T = { frameIn: [0.0, 0.02] };
const BEAT_MIN_GAP_MS = 380; // one fly-in at a time, even on a fast flick

// Caption per beat: ordered segments — plain strings are connectors, {chip} slots are
// filled from the beat's NEW strip chips (chipInfo diff), matched by value-substring hint
// so the caption chip text always mirrors the real chip. hero = the big opening line.
// chip slots are filled from the beat's NEW strip chips (matched by `chip` hint against the real
// chip value/label). `show` overrides the caption display text (Shaw's exact wording) while the
// clone still flies into the real strip chip — the builder's own chip keeps its native label.
const CAPTIONS = [
  { hero: true, segs: [{ t: 'Show me all ' }, { chip: 'homeowner', show: 'Homeowners' }, { t: ' searching for ' }, { chip: 'pool', show: 'Pool Construction' }] },
  { hero: false, segs: [{ t: 'Who live in ' }, { chip: 'fl', show: 'Florida' }] },
  { hero: false, segs: [{ t: 'Specifically ' }, { chip: 'lauderdale', show: 'Ft. Lauderdale' }, { t: ' and ' }, { chip: 'miami', show: 'Miami' }] },
  { hero: false, segs: [{ t: 'with ' }, { chip: 'worth', show: 'Net Worth: $1M+' }] },
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
  const captionRef = useRef(null);   // the sticky sentence BAND (opacity = scroll-entry / pin)
  const capInnerRef = useRef(null);  // inner wrapper — per-beat sentence crossfade lives here
  const flyRef = useRef(null);       // fixed overlay hosting flying chip clones
  const scrimRef = useRef(null);
  const debugRef = useRef(null);

  const appliedRef = useRef(new Set());  // committed beat indices (data landed)
  const capShownRef = useRef(new Set()); // beats whose sentence has faded in (pre-commit)
  const beatSpansRef = useRef({});       // beat index → caption chip spans (built at pre-show, flown at commit)
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
  // The parent has same-origin access to the iframe, so we drive chip visibility per-ELEMENT
  // (not by group — FL + the metros share the "location" group). Each beat: re-reveal chips that
  // already landed (tagChips re-hides ALL chips every beat), render the caption for beat k, and
  // fly a purple clone of each NEW chip down into its real strip rect, revealing the real chip on
  // landing. Fully reversible: reverseTo() re-hides chips owned by beats > k and restores the rest.
  const parseChip = (el) => {
    const b = el.querySelector('b');
    const label = b ? b.textContent : '';
    const value = (el.textContent || '').replace(label, '').replace(/\u2715\s*$/, '').trim();
    return { el, group: el.dataset.arkGroup || '', label, value, key: (el.dataset.arkGroup || '') + '|' + value };
  };
  const readChips = (w) => { try { return [...w.document.querySelectorAll('#chips .chip')].map(parseChip); } catch { return []; } };
  // which beat owns a chip (lowest caption whose hint matches its value/label)
  const ownerOf = (c) => {
    const hay = (c.value + ' ' + c.label).toLowerCase();
    let owner = -1;
    CAPTIONS.forEach((cap2, bi) => (cap2.segs || []).forEach(sgm => { if (sgm.chip && owner === -1 && hay.includes(sgm.chip.toLowerCase())) owner = bi; }));
    return owner;
  };

  // Build the FULL caption for beat k in the sentence zone: connectors (white) + inline purple
  // chip spans (using the beat's `show` wording — works even before the strip chips exist, so the
  // hero can pre-display before the builder arrives). Returns the chip spans + their hint, for
  // flying. Does NOT fly — that's a separate phase so the sentence stays readable first.
  const buildCaption = useCallback((k) => {
    const cap = captionRef.current, inner = capInnerRef.current;
    if (!cap || !inner) return [];
    const spec = CAPTIONS[k] || { segs: [] };
    cap.className = 'bsd-cap ark-display' + (spec.hero ? ' bsd-hero' : '');
    inner.innerHTML = '';
    const chipSpans = []; // {span, hint}
    spec.segs.forEach(sgm => {
      if (sgm.t != null) {
        const s = document.createElement('span');
        s.textContent = sgm.t; s.className = 'bsd-join';
        inner.appendChild(s);
      } else if (sgm.chip != null) {
        const span = document.createElement('span');
        Object.assign(span.style, CHIP_CSS); span.className = 'bsd-chip';
        span.textContent = sgm.show || sgm.chip;
        inner.appendChild(span);
        chipSpans.push({ span, hint: sgm.chip.toLowerCase() });
      }
    });
    return chipSpans;
  }, []);

  // Fly the caption's chip spans down into their real strip rects, then fade the connectors.
  // Real strip chips must already exist (beatOnDesktop applied) — matched by hint.
  const flyChips = useCallback((w, k, chipSpans) => {
    const cap = captionRef.current, fly = flyRef.current, ifr = iframeRef.current;
    if (!cap || !fly || !ifr) return;
    if (topBeatRef.current !== k) return; // scrolled away during the readable pause — skip
    const chips = readChips(w);
    chips.forEach(c => { if (landedRef.current.has(c.key)) c.el.classList.remove('ark-hidden'); });
    const fresh = chips.filter(c => !landedRef.current.has(c.key));
    const used = new Set();
    const ifrBox = ifr.getBoundingClientRect();
    chipSpans.forEach(({ span, hint }) => {
      let fi = fresh.findIndex((c, i) => !used.has(i) && (c.value + ' ' + c.label).toLowerCase().includes(hint));
      if (fi < 0) fi = fresh.findIndex((c, i) => !used.has(i));
      if (fi < 0) return;
      used.add(fi);
      const chip = fresh[fi];
      const from = span.getBoundingClientRect();
      const tr = chip.el.getBoundingClientRect();      // iframe-viewport space
      const tx = ifrBox.left + tr.left, ty = ifrBox.top + tr.top;
      const clone = span.cloneNode(true);
      Object.assign(clone.style, CHIP_CSS, {
        position: 'fixed', left: from.left + 'px', top: from.top + 'px', margin: 0,
        zIndex: 6, transition: 'transform .62s cubic-bezier(.22,.61,.36,1), box-shadow .62s',
        boxShadow: '0 12px 40px rgba(124,58,237,0.35)', pointerEvents: 'none',
      });
      fly.appendChild(clone);
      span.style.visibility = 'hidden';
      requestAnimationFrame(() => {
        clone.style.transform = `translate(${tx - from.left}px, ${ty - from.top}px)`;
        clone.style.boxShadow = '0 2px 10px rgba(124,58,237,0.12)';
      });
      const done = () => {
        landedRef.current.add(chip.key);
        readChips(w).forEach(rc => { if (rc.key === chip.key) rc.el.classList.remove('ark-hidden'); }); // renderChips rebuilds #chips
        clone.remove();
        clone.removeEventListener('transitionend', done);
      };
      clone.addEventListener('transitionend', done);
      setTimeout(done, 950);
    });
    // the connecting words fade as the filters leave for the strip
    cap.querySelectorAll('.bsd-join').forEach(el => { el.style.transition = 'opacity .55s'; el.style.opacity = '0'; });
  }, []);

  // Pre-show beat k's sentence and stash its chip spans — called a CAPTION_LEAD before the beat's
  // data commit, so the sentence fades in a moment BEFORE the audience updates. The new sentence is
  // swapped in while invisible (transition off) then faded 0→1, so you never see the old text
  // cross-dissolve into the new one — each sentence cleanly fades in right before its beat.
  const preshowCaption = useCallback((k) => {
    const inner = capInnerRef.current;
    if (inner) { inner.style.transition = 'none'; inner.style.opacity = '0'; }
    beatSpansRef.current[k] = buildCaption(k);
    capShownRef.current.add(k);
    if (inner) {
      void inner.offsetWidth; // commit opacity:0 with no transition
      inner.style.transition = 'opacity .35s ease-out';
      requestAnimationFrame(() => { if (capInnerRef.current) capInnerRef.current.style.opacity = '1'; });
    }
  }, [buildCaption]);

  // scroll-up: hide chips owned by beats > k, keep the rest revealed, restore beat k's caption.
  const reverseTo = useCallback((w, k) => {
    readChips(w).forEach(c => {
      if (ownerOf(c) > k) { c.el.classList.add('ark-hidden'); landedRef.current.delete(c.key); }
      else { c.el.classList.remove('ark-hidden'); landedRef.current.add(c.key); }
    });
    // beats above k are no longer shown/committed → allow them to pre-show + fly again on re-descent
    CAPTIONS.forEach((_, bi) => { if (bi > k) { capShownRef.current.delete(bi); delete beatSpansRef.current[bi]; } });
    if (k < 0) { capShownRef.current.delete(0); preshowCaption(0); return; } // back above beat 0 → restore the hero
    renderCaptionOnly(k);
  }, [preshowCaption]);

  // restore beat k's caption text on reverse (connectors only — chips already landed in the strip).
  const renderCaptionOnly = useCallback((k) => {
    const cap = captionRef.current, inner = capInnerRef.current;
    if (!cap || !inner) return;
    const spec = CAPTIONS[k]; if (!spec) { inner.innerHTML = ''; return; }
    cap.className = 'bsd-cap ark-display' + (spec.hero ? ' bsd-hero' : '');
    inner.style.transition = 'none'; inner.style.opacity = '1';
    inner.innerHTML = spec.segs.filter(s => s.t != null).map(s => `<span class="bsd-join" style="opacity:0">${s.t}</span>`).join('');
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

    // builder + sentence fade in on VIEWPORT ENTRY (as the section scrolls up into view), NOT on the
    // pin fraction p — so they're fully visible DURING the scroll-in, then pin (sticky) as you reach
    // them, then the first beat starts. entry: 0 when the section top is a viewport below, 1 by the
    // time it has risen ~420px up.
    const entry = clamp((cssVh - r.top) / 420, 0, 1);
    if (frameRef.current) frameRef.current.style.opacity = collapsedRef.current ? '1' : String(easeOut(entry));
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

    // BAND opacity: fades in on scroll-entry with the builder (hero phase), stays visible through
    // the story, hidden once explored or scrolled past the beats. The per-beat sentence fade is on
    // the INNER wrapper (preshowCaption), independent of this.
    if (captionRef.current) {
      const hideCap = collapsedRef.current || armedRef.current || p >= 0.90;
      captionRef.current.style.opacity = hideCap ? '0' : (topBeatRef.current < 0 ? String(entry) : '1');
    }
    if (collapsedRef.current || armedRef.current) return; // frozen once explored

    // ── caption pre-show: each beat's sentence fades in CAPTION_LEAD before its data commit ──
    // hero (beat 0) is present as soon as the section is in view (rendered on boot / here) so the
    // sentence + builder read together during the scroll-in, before any beat commits.
    if (!capShownRef.current.has(0) && topBeatRef.current < 0) preshowCaption(0);
    // beats 1-3: pre-show once the previous beat has committed and we're within the lead window.
    for (let i = 1; i < BEATS.length; i++) {
      if (topBeatRef.current === i - 1 && !appliedRef.current.has(i) && !capShownRef.current.has(i) && p >= BEATS[i] - CAPTION_LEAD) {
        preshowCaption(i); break;
      }
    }

    // ── beats: COMMIT forward (throttled) at the threshold, unapply on scroll-up (fully reversible) ──
    const now = performance.now();
    for (let i = 0; i < BEATS.length; i++) {
      if (p >= BEATS[i] && !appliedRef.current.has(i)) {
        if (now - lastBeatAtRef.current >= BEAT_MIN_GAP_MS) {
          if (i >= 1 && (!generatedRef.current || !w.ArkEmbed.mapReady())) break; // wait for map
          let spans = beatSpansRef.current[i];
          if (!spans) { spans = buildCaption(i); beatSpansRef.current[i] = spans; capShownRef.current.add(i); } // fast scroll skipped the pre-show
          w.ArkEmbed.beatOnDesktop(i);      // data updates a moment AFTER the sentence appeared
          appliedRef.current.add(i);
          topBeatRef.current = i;
          lastBeatAtRef.current = now;
          // generate on beat 0 BEFORE the fly (the strip chips + map need the generate flow)
          if (i === 0 && !generatedRef.current) { generatedRef.current = !!w.ArkEmbed.generate(); if (generatedRef.current) { w.ArkEmbed.setDataReveal(1); revealedRef.current = true; } }
          flyChips(w, i, spans);            // filters fly into the strip, connectors fade
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

    if (!appliedRef.current.has(0) && revealedRef.current) { // scrolled fully back above the hero
      w.document.body.classList.add('ark-data-hidden'); revealedRef.current = false;
      capShownRef.current.delete(0); // let the hero pre-show again on the next descent
    }
    if (generatedRef.current) w.ArkEmbed.reassert();
    // keep all landed chips revealed — the builder's renderChips rebuilds + re-hides #chips on
    // every sync (per-stage repaint), which would otherwise drop already-flown chips for a frame.
    if (landedRef.current.size) { readChips(w).forEach(c => { if (landedRef.current.has(c.key)) c.el.classList.remove('ark-hidden'); }); }
  }, [mountIframe, booted, app, buildCaption, flyChips, preshowCaption, reverseTo]);

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
  // render the hero sentence as soon as the builder boots, so it's present (in the sticky band) while
  // the section scrolls up into view — before frame()/any beat runs. Opacity is driven by frame().
  useEffect(() => { if (booted && topBeatRef.current < 0) { preshowCaption(0); if (captionRef.current) captionRef.current.style.opacity = '0'; } }, [booted, preshowCaption]);

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
  // expanded height also carries the SENTENCE_ZONE (the builder pins that much lower).
  const sectionH = collapsed
    ? `${(H > 0 ? H : 0) + NAV_PX}px`
    : (H > 0 ? `calc(420vh + ${H + NAV_PX + SENTENCE_ZONE}px)` : 'calc(520vh)');

  return (
    <>
      <style>{`
        /* the sentence band: STICKY on the dark page surface, ABOVE the builder. In normal flow it
           sits at the section top and scrolls UP into view with the builder, then PINS at top:NAV
           (just under the header) as the builder pins below it. NOT part of the app. */
        .bsd-cap{position:sticky;top:${NAV_PX}px;height:${SENTENCE_ZONE}px;width:min(1240px,calc(100vw - 40px));margin:0 auto;z-index:5;display:flex;align-items:center;justify-content:center;padding:0 28px;box-sizing:border-box;text-align:center;pointer-events:none;transition:opacity .3s}
        /* inner wrapper: the per-beat sentence crossfade (opacity 0→1 right before each beat). */
        .bsd-cap-inner{display:flex;flex-wrap:wrap;gap:10px 11px;align-items:center;justify-content:center}
        /* every sentence is the SAME big/bold size as the hero (Shaw 2026-07-10). */
        .bsd-cap .bsd-join{color:#fff;font-weight:700;font-size:32px;letter-spacing:-.015em}
        .bsd-cap .bsd-chip{font-size:17px !important;padding:8px 15px !important;font-weight:700 !important}
      `}</style>
      <section ref={trackRef} style={{ height: sectionH, position: 'relative', boxSizing: 'border-box', paddingTop: collapsed ? `${NAV_PX}px` : 0, background: '#060D1A', borderTop: '1px solid #101E33' }}>
        {/* sentence band FIRST in flow (above the builder): sticky, so it scrolls up into view with
            the builder and pins with it. display:none once collapsed so it doesn't hold flow space. */}
        <div ref={captionRef} className="bsd-cap" style={{ opacity: 0, display: collapsed ? 'none' : undefined }}>
          <div ref={capInnerRef} className="bsd-cap-inner" />
        </div>

        <div ref={frameRef}
          style={{ opacity: 0, position: collapsed ? 'relative' : 'sticky', top: collapsed ? 'auto' : `${NAV_PX + SENTENCE_ZONE}px`, height: frameH, width: 'min(1240px, calc(100vw - 40px))', margin: '0 auto', borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #1B3050', borderBottom: 'none', boxShadow: '0 30px 80px rgba(0,0,0,0.55)', background: '#f8fafc' }}>
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
