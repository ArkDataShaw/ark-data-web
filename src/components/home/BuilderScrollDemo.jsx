import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ArrowRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// BuilderScrollDemo — flagship scroll sequence.
// Phases (p = progress through the tall track):
//   P1  chips punch in big:  Homeowners · TX, FL & AZ · $100K+ income
//   P2  "searching for" + intent topic chip
//   P3  blank builder fades in; chips fly (FLIP) into their slots
//   P4  map clusters bloom, charts grow, reach counts up
//   P5  freeze on the builder's top half; pin releases; the rest of the
//       charts scroll past as normal page content below.
// All frame work is imperative (refs + RAF), zero React re-renders per frame.
// The frozen builder is the future cross-fade target for the live
// ?embed=home iframe (see fable-html-audience-builder embed-mode spec).
// ─────────────────────────────────────────────────────────────────────────────

const GREEN = '#19C37D';
const GREEN_SOFT = 'rgba(25,195,125,0.12)';
const GREEN_BORDER = 'rgba(25,195,125,0.35)';
const PANEL = '#0B1526';
const PANEL_2 = '#081020';
const LINE = '#14263F';
const REACH = 38412;

const CHIPS = [
  { id: 'homeowners', label: 'Homeowners' },
  { id: 'geo', label: 'TX, FL & AZ' },
  { id: 'income', label: '$100K+ income' },
  { id: 'topic', label: 'Solar Installation Cost', topic: true },
];

// timings within the track
const T = {
  chipIn: i => [0.03 + i * 0.04, 0.09 + i * 0.04], // chips 0..2 pop in
  searching: [0.17, 0.22],                          // "searching for" + topic chip
  builderIn: [0.28, 0.38],                          // builder frame fade/rise
  fly: i => [0.34 + i * 0.02, 0.46 + i * 0.02],     // chips fly to slots
  data: [0.52, 0.78],                               // map + charts + reach
  hold: [0.78, 1],                                  // frozen
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (p, [a, b]) => clamp((p - a) / (b - a), 0, 1);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// deterministic pseudo-random (seeded) for map dots
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// glowing signal clusters (stylized map — the real embed shows true counties)
function makeDots() {
  const rand = mulberry32(42);
  const clusters = [
    { label: 'AZ', cx: 18, cy: 52, n: 22, rx: 9, ry: 11 },
    { label: 'TX', cx: 46, cy: 62, n: 38, rx: 13, ry: 12 },
    { label: 'FL', cx: 84, cy: 74, n: 26, rx: 8, ry: 9 },
  ];
  const dots = [];
  clusters.forEach(c => {
    for (let i = 0; i < c.n; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand());
      dots.push({
        x: c.cx + Math.cos(a) * r * c.rx,
        y: c.cy + Math.sin(a) * r * c.ry,
        s: 1.6 + rand() * 2.6,
        o: 0.35 + rand() * 0.65,
        at: rand(), // stagger position within the data phase
      });
    }
  });
  return { clusters, dots };
}
const MAP = makeDots();

const AGE_BARS = [18, 42, 88, 100, 64, 30];
const AGE_LABELS = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const INCOME_BARS = [52, 100, 78, 41];
const INCOME_LABELS = ['100-150K', '150-200K', '200-250K', '250K+'];
// second row (below the fold — revealed by natural scroll after the pin)
const NW_BARS = [34, 71, 100, 58, 26];
const NW_LABELS = ['<100K', '100-250K', '250K-500K', '500K-1M', '1M+'];
const HOME_BARS = [100, 9];
const HOME_LABELS = ['Owner', 'Renter'];
const CHILD_BARS = [58, 100];
const CHILD_LABELS = ['Kids at home', 'No kids'];

function SlotChip({ label, slotRef, topic }) {
  return (
    <span
      ref={slotRef}
      className="ark-mono"
      style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: '100px',
        fontSize: '11px', whiteSpace: 'nowrap', opacity: 0,
        background: topic ? GREEN_SOFT : 'rgba(74,158,255,0.10)',
        border: `1px solid ${topic ? GREEN_BORDER : 'rgba(74,158,255,0.3)'}`,
        color: topic ? '#6FE3B0' : '#8FBFFF',
      }}
    >{label}</span>
  );
}

function Bars({ bars, labels, barRefs, color = GREEN }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', height: '92px', padding: '0 4px' }}>
      {bars.map((h, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
          <div
            ref={el => { if (barRefs) barRefs.current[i] = el; }}
            style={{ width: '100%', borderRadius: '4px 4px 0 0', background: `linear-gradient(180deg, ${color} 0%, rgba(25,195,125,0.35) 100%)`, height: `${h}%`, transformOrigin: 'bottom', transform: barRefs ? 'scaleY(0)' : 'none' }}
          />
          <span className="ark-mono" style={{ color: '#5B7699', fontSize: '8.5px', whiteSpace: 'nowrap' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function BuilderScrollDemo() {
  const trackRef = useRef(null);
  const bigChipRefs = useRef([]);
  const slotRefs = useRef([]);
  const searchingRef = useRef(null);
  const builderRef = useRef(null);
  const stageRef = useRef(null);
  const dotRefs = useRef([]);
  const clusterLabelRefs = useRef([]);
  const ageBarRefs = useRef([]);
  const incomeBarRefs = useRef([]);
  const reachRef = useRef(null);
  const sentenceRef = useRef(null);
  const genBtnRef = useRef(null);
  const flyBase = useRef(null); // cached start/target rects
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    const set = () => setIsDesktop(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const sr = stage.getBoundingClientRect();
    const pairs = CHIPS.map((_, i) => {
      const big = bigChipRefs.current[i];
      const slot = slotRefs.current[i];
      if (!big || !slot) return null;
      const b = big.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      return {
        dx: s.left - b.left, dy: s.top - b.top,
        scale: s.height / b.height,
      };
    });
    return { top: sr.top, pairs };
  }, []);

  const frame = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const r = track.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = clamp(-r.top / Math.max(total, 1), 0, 1);

    // P1/P2 — big chips + "searching for"
    CHIPS.forEach((c, i) => {
      const el = bigChipRefs.current[i];
      if (!el) return;
      const tIn = c.topic ? seg(p, T.searching) : seg(p, T.chipIn(i));
      const pop = easeOut(tIn);
      const fly = seg(p, T.fly(i));
      if (fly <= 0) {
        el.style.opacity = String(pop);
        el.style.transform = `translateY(${(1 - pop) * 26}px) scale(${0.7 + pop * 0.3})`;
      } else {
        // FLIP toward slot
        if (!flyBase.current) flyBase.current = measure();
        const pair = flyBase.current && flyBase.current.pairs[i];
        if (pair) {
          const t = easeInOut(fly);
          el.style.opacity = fly >= 1 ? '0' : '1';
          el.style.transformOrigin = 'top left';
          el.style.transform = `translate(${pair.dx * t}px, ${pair.dy * t}px) scale(${1 + (pair.scale - 1) * t})`;
        }
        const slot = slotRefs.current[i];
        if (slot) slot.style.opacity = fly >= 1 ? '1' : '0';
      }
    });
    if (searchingRef.current) {
      const t = seg(p, T.searching);
      const gone = seg(p, T.fly(3));
      searchingRef.current.style.opacity = String(easeOut(t) * (1 - gone));
    }

    // P3 — builder frame
    if (builderRef.current) {
      const t = easeOut(seg(p, T.builderIn));
      builderRef.current.style.opacity = String(t);
      builderRef.current.style.transform = `translateY(${(1 - t) * 40}px)`;
    }

    // P4 — data theater
    const d = seg(p, T.data);
    if (genBtnRef.current) {
      const active = d > 0 && d < 1;
      genBtnRef.current.textContent = d >= 1 ? '✓ Generated' : active ? 'Generating…' : 'Generate';
      genBtnRef.current.style.background = d >= 1 ? GREEN_SOFT : '#C8102E';
      genBtnRef.current.style.color = d >= 1 ? '#6FE3B0' : '#fff';
      genBtnRef.current.style.border = d >= 1 ? `1px solid ${GREEN_BORDER}` : '1px solid transparent';
    }
    MAP.dots.forEach((dot, i) => {
      const el = dotRefs.current[i];
      if (!el) return;
      const t = easeOut(seg(d, [dot.at * 0.7, dot.at * 0.7 + 0.25]));
      el.style.opacity = String(dot.o * t);
      el.style.transform = `scale(${t})`;
    });
    clusterLabelRefs.current.forEach(el => {
      if (el) el.style.opacity = String(easeOut(seg(d, [0.55, 0.85])));
    });
    const growBars = (refs, from, to) => refs.current.forEach((el, i) => {
      if (!el) return;
      const t = easeOut(seg(d, [from + i * 0.04, to + i * 0.04]));
      el.style.transform = `scaleY(${t})`;
    });
    growBars(ageBarRefs, 0.35, 0.7);
    growBars(incomeBarRefs, 0.45, 0.8);
    if (reachRef.current) {
      const t = easeOut(seg(d, [0.15, 0.9]));
      reachRef.current.textContent = Math.round(REACH * t).toLocaleString();
    }
    if (sentenceRef.current) {
      sentenceRef.current.style.opacity = String(easeOut(seg(d, [0, 0.3])));
    }
  }, [measure]);

  useEffect(() => {
    if (!isDesktop) return;
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    const onResize = () => { flyBase.current = null; onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [frame, isDesktop]);

  // ── the builder mock (shared by pin + mobile static) ──────────────────────
  const builderTopHalf = (
    <div ref={builderRef} style={{ width: 'min(1160px, calc(100vw - 48px))', opacity: 0, borderRadius: '14px 14px 0 0', border: `1px solid #1B3050`, borderBottom: 'none', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', background: PANEL_2 }}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', background: PANEL, borderBottom: `1px solid ${LINE}` }}>
        <span className="ark-display" style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>Audience Builder</span>
        <span className="ark-mono" style={{ color: '#5B7699', fontSize: '10px', letterSpacing: '0.1em' }}>DRAFT · SOLAR PROSPECTS</span>
        <button ref={genBtnRef} className="ark-mono" style={{ marginLeft: 'auto', padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: '#C8102E', color: '#fff', border: '1px solid transparent', cursor: 'default' }}>Generate</button>
      </div>

      <div style={{ display: 'flex', minHeight: '440px' }}>
        {/* sidebar */}
        <div style={{ width: '230px', flexShrink: 0, borderRight: `1px solid ${LINE}`, background: PANEL, padding: '14px 0' }}>
          {[
            ['Intent', <SlotChip key="t" label="Solar Installation Cost" topic slotRef={el => { slotRefs.current[3] = el; }} />],
            ['Personal', <span key="p" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
              <SlotChip label="Homeowners" slotRef={el => { slotRefs.current[0] = el; }} />
              <SlotChip label="$100K+ income" slotRef={el => { slotRefs.current[2] = el; }} />
            </span>],
            ['Geographics', <SlotChip key="g" label="TX, FL & AZ" slotRef={el => { slotRefs.current[1] = el; }} />],
            ['Firmographics', null],
            ['Career', null],
            ['Contact details', null],
          ].map(([name, chips]) => (
            <div key={name} style={{ padding: '10px 16px', borderBottom: `1px solid rgba(20,38,63,0.5)` }}>
              <p className="ark-mono" style={{ color: '#7E97B5', fontSize: '11px', letterSpacing: '0.06em', margin: chips ? '0 0 8px' : 0 }}>{name}</p>
              {chips}
            </div>
          ))}
        </div>

        {/* main */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* sentence strip */}
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${LINE}`, background: 'rgba(25,195,125,0.03)' }}>
            <p ref={sentenceRef} style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: '#C9DBEE', opacity: 0 }}>
              <strong style={{ color: '#fff' }}><span ref={reachRef}>0</span></strong>{' '}
              <span style={{ color: '#8FBFFF', fontWeight: 600 }}>homeowners</span> in <span style={{ color: '#8FBFFF', fontWeight: 600 }}>TX, FL & AZ</span> with{' '}
              <span style={{ color: '#8FBFFF', fontWeight: 600 }}>$100K+ income</span> searched for{' '}
              <span style={{ background: GREEN_SOFT, border: `1px solid ${GREEN_BORDER}`, borderRadius: '6px', padding: '0 7px', color: '#6FE3B0', fontWeight: 600 }}>Solar Installation Cost</span> this week
            </p>
          </div>

          {/* map + first charts row */}
          <div style={{ flex: 1, display: 'flex', gap: 0, minHeight: 0 }}>
            <div style={{ flex: '1.35', borderRight: `1px solid ${LINE}`, position: 'relative', background: `radial-gradient(700px 300px at 50% 40%, rgba(20,60,110,0.18) 0%, transparent 70%), ${PANEL_2}`, minHeight: '340px', overflow: 'hidden' }}>
              {/* grid */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(61,85,115,0.18) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
              {/* signal dots */}
              {MAP.dots.map((dot, i) => (
                <span key={i} ref={el => { dotRefs.current[i] = el; }} style={{ position: 'absolute', left: `${dot.x}%`, top: `${dot.y}%`, width: `${dot.s * 2}px`, height: `${dot.s * 2}px`, borderRadius: '50%', background: GREEN, boxShadow: `0 0 ${dot.s * 4}px rgba(25,195,125,0.5)`, opacity: 0, transform: 'scale(0)' }} />
              ))}
              {MAP.clusters.map((c, i) => (
                <span key={c.label} ref={el => { clusterLabelRefs.current[i] = el; }} className="ark-mono" style={{ position: 'absolute', left: `${c.cx}%`, top: `${c.cy - c.ry - 7}%`, transform: 'translateX(-50%)', color: '#6FE3B0', fontSize: '10px', letterSpacing: '0.1em', opacity: 0 }}>{c.label}</span>
              ))}
              <span className="ark-mono" style={{ position: 'absolute', left: '14px', bottom: '10px', color: '#3D5573', fontSize: '9px', letterSpacing: '0.1em' }}>SIGNAL DENSITY · LAST 7 DAYS</span>
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 18px 10px', borderBottom: `1px solid ${LINE}`, flex: 1 }}>
                <p className="ark-mono" style={{ color: '#5B7699', fontSize: '9.5px', letterSpacing: '0.12em', margin: '0 0 12px' }}>AGE</p>
                <Bars bars={AGE_BARS} labels={AGE_LABELS} barRefs={ageBarRefs} />
              </div>
              <div style={{ padding: '16px 18px 10px', flex: 1 }}>
                <p className="ark-mono" style={{ color: '#5B7699', fontSize: '9.5px', letterSpacing: '0.12em', margin: '0 0 12px' }}>HOUSEHOLD INCOME</p>
                <Bars bars={INCOME_BARS} labels={INCOME_LABELS} barRefs={incomeBarRefs} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isDesktop) {
    // Mobile: no pin/cross-fade (per embed spec, <960px gets a static treatment)
    return (
      <section className="sp" style={{ background: '#060D1A', borderTop: '1px solid #101E33' }}>
        <div className="sc" style={{ textAlign: 'center' }}>
          <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', marginBottom: '14px' }}>THE FLAGSHIP · AUDIENCE BUILDER</p>
          <h2 className="ark-display" style={{ fontSize: 'clamp(28px, 6vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: '12px' }}>
            Describe your buyer.<br />Watch the audience build itself.
          </h2>
          <p style={{ color: '#A9C1DC', fontSize: '15px', lineHeight: 1.7, margin: '0 0 24px' }}>
            <strong style={{ color: '#fff' }}>38,412 homeowners</strong> in TX, FL & AZ with $100K+ income searched for{' '}
            <span style={{ color: '#6FE3B0', fontWeight: 600 }}>Solar Installation Cost</span> this week. Build audiences like this in seconds — then sync them to Meta, Google, and your CRM.
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
      {/* tall track — the pin lasts for its height minus one viewport */}
      <section ref={trackRef} style={{ height: '420vh', position: 'relative', background: '#060D1A', borderTop: '1px solid #101E33' }}>
        <div ref={stageRef} style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* header label */}
          <p className="ark-mono" style={{ color: '#6FE3B0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', margin: '34px 0 0' }}>
            THE FLAGSHIP · AUDIENCE BUILDER
          </p>

          {/* big chip stack (P1/P2) — absolutely centered overlay */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px', pointerEvents: 'none', zIndex: 3 }}>
            {CHIPS.slice(0, 3).map((c, i) => (
              <span key={c.id} ref={el => { bigChipRefs.current[i] = el; }} className="ark-display" style={{ opacity: 0, fontSize: 'clamp(30px, 3.6vw, 46px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', background: 'rgba(74,158,255,0.08)', border: '1px solid rgba(74,158,255,0.35)', borderRadius: '100px', padding: '10px 34px', whiteSpace: 'nowrap' }}>
                {c.label}
              </span>
            ))}
            <span ref={searchingRef} className="ark-mono" style={{ opacity: 0, color: '#7E97B5', fontSize: '15px', letterSpacing: '0.22em', margin: '10px 0 0' }}>SEARCHING FOR</span>
            <span ref={el => { bigChipRefs.current[3] = el; }} className="ark-display" style={{ opacity: 0, fontSize: 'clamp(30px, 3.6vw, 46px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#6FE3B0', background: GREEN_SOFT, border: `1px solid ${GREEN_BORDER}`, borderRadius: '100px', padding: '10px 34px', whiteSpace: 'nowrap', boxShadow: '0 0 50px rgba(25,195,125,0.25)' }}>
              Solar Installation Cost
            </span>
          </div>

          {/* builder frame (P3+) pinned to the bottom — top half visible */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', zIndex: 2 }}>
            {builderTopHalf}
          </div>
        </div>
      </section>

      {/* continuation — rest of the charts scroll naturally after the pin */}
      <section style={{ background: '#060D1A', paddingBottom: '80px' }}>
        <div style={{ width: 'min(1160px, calc(100vw - 48px))', margin: '0 auto', border: '1px solid #1B3050', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden', background: PANEL_2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', borderTop: `1px solid ${LINE}` }}>
            {[['NET WORTH', NW_BARS, NW_LABELS], ['HOMEOWNER STATUS', HOME_BARS, HOME_LABELS], ['CHILDREN AT HOME', CHILD_BARS, CHILD_LABELS]].map(([label, bars, labels]) => (
              <div key={label} style={{ padding: '18px 20px 12px', borderRight: `1px solid ${LINE}` }}>
                <p className="ark-mono" style={{ color: '#5B7699', fontSize: '9.5px', letterSpacing: '0.12em', margin: '0 0 12px' }}>{label}</p>
                <Bars bars={bars} labels={labels} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', padding: '18px 22px', borderTop: `1px solid ${LINE}`, background: PANEL }}>
            {[['Email coverage', '92%'], ['Phone coverage', '81%'], ['Avg. home value', '$412K'], ['Data points / person', '650+']].map(([k, v]) => (
              <div key={k}>
                <p className="ark-mono" style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: '0 0 2px' }}>{v}</p>
                <p className="ark-mono" style={{ color: '#5B7699', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>{k}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '44px' }}>
          <p style={{ color: '#A9C1DC', fontSize: '16px', margin: '0 0 20px' }}>
            That took four filters and one click. Now build yours.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={createPageUrl('Demo')}>
              <button className="ark-btn-green" style={{ padding: '14px 30px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Try the live builder <ArrowRight size={15} />
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
