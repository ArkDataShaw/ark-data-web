import React, { useEffect, useRef, useState } from 'react';

// Signal globe: sources (intent signals + website visitors) initialize as
// nodes, arc over the globe, and land on destinations (ad campaigns, CRM
// actions). Popups are HTML overlays tracked to the rotating 3D nodes.

const BRANDFETCH_CLIENT_ID = '1idqlTY69N6EdqhcU7n';
const symbolUrl = (domain) => `https://cdn.brandfetch.io/${domain}/symbol?c=${BRANDFETCH_CLIENT_ID}&fallback=404`;
const iconUrl = (domain) => `https://cdn.brandfetch.io/${domain}/icon?c=${BRANDFETCH_CLIENT_ID}&fallback=404`;
const faviconUrl = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

// Logos are resolved ONCE per destination at page load (symbol → icon →
// favicon → monogram) and cached module-wide. Cards render from the cache,
// so no network requests happen per card appearance — the chosen URL is
// also already in the browser's image cache from the probe.
const logoCache = new Map();    // destKey -> { src, rounded } | { monogram: true }
const logoPromises = new Map(); // destKey -> Promise of the above

const tryLoad = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(src);
  img.onerror = reject;
  img.src = src;
});

function resolveLogo(destKey) {
  if (logoPromises.has(destKey)) return logoPromises.get(destKey);
  const dest = DESTS[destKey];
  const start = dest.noSymbol
    ? Promise.reject(new Error('symbol skipped'))
    : tryLoad(symbolUrl(dest.domain)).then(src => ({ src, rounded: false }));
  const p = start
    .catch(() => tryLoad(iconUrl(dest.domain)).then(src => ({ src, rounded: true })))
    .catch(() => tryLoad(faviconUrl(dest.domain)).then(src => ({ src, rounded: true })))
    .catch(() => ({ monogram: true }))
    .then(result => { logoCache.set(destKey, result); return result; });
  logoPromises.set(destKey, p);
  return p;
}

const preloadAllLogos = () => Object.keys(DESTS).forEach(resolveLogo);

function DestLogo({ destKey, dest }) {
  const [logo, setLogo] = useState(logoCache.get(destKey) || null);
  useEffect(() => {
    if (logo) return;
    let alive = true;
    resolveLogo(destKey).then(r => { if (alive) setLogo(r); });
    return () => { alive = false; };
  }, [destKey, logo]);

  if (!logo) return <span style={{ width: 26, height: 26, flexShrink: 0 }} />;
  if (logo.monogram) {
    return (
      <span style={{ width: 26, height: 26, borderRadius: '6px', background: dest.color, color: dest.color === '#FFFC00' || dest.color === '#FFE01B' ? '#111' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px', fontWeight: 800 }}>
        {dest.name[0]}
      </span>
    );
  }
  return (
    <img src={logo.src} alt={dest.name}
      width="26" height="26"
      style={{
        objectFit: 'contain', flexShrink: 0,
        borderRadius: logo.rounded ? '6px' : 0,
        filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.28))',
      }} />
  );
}

// ---------------------------------------------------------------------------
// Scenarios — each is one coherent story: person + topic + destination.
// type 'intent' routes to ad platforms; type 'visitor' routes to CRM/email.
// ---------------------------------------------------------------------------
const DESTS = {
  // noSymbol: skip Brandfetch /symbol for brands where it serves a
  // placeholder (Meta, HighLevel) or an illegible transparent mark (Mailchimp)
  meta:       { name: 'Meta',        domain: 'meta.com',        color: '#0866FF', noSymbol: true },
  tiktok:     { name: 'TikTok',      domain: 'tiktok.com',      color: '#FE2C55' },
  googleads:  { name: 'Google Ads',  domain: 'google.com',      color: '#4285F4' },
  youtube:    { name: 'YouTube',     domain: 'youtube.com',     color: '#FF0000' },
  snapchat:   { name: 'Snapchat',    domain: 'snapchat.com',    color: '#FFFC00' },
  hubspot:    { name: 'HubSpot',     domain: 'hubspot.com',     color: '#FF7A59' },
  mailchimp:  { name: 'Mailchimp',   domain: 'mailchimp.com',   color: '#FFE01B', noSymbol: true },
  klaviyo:    { name: 'Klaviyo',     domain: 'klaviyo.com',     color: '#2BB673' },
  slack:      { name: 'Slack',       domain: 'slack.com',       color: '#E01E5A' },
  salesforce: { name: 'Salesforce',  domain: 'salesforce.com',  color: '#00A1E0' },
  ghl:        { name: 'HighLevel',   domain: 'gohighlevel.com', color: '#38A6F0', noSymbol: true },
};

const SCENARIOS = [
  // --- intent signals → ad campaigns ---
  { type: 'intent', name: 'Sarah Whitfield', title: 'Director of Ops', company: 'Corestack Logistics', topic: 'Fleet Management Software', email: 's•••••@c•••••••••.com', phone: '(312) •••-••83', dest: 'googleads', campaign: 'Fleet SaaS — High-Intent Search', action: 'Added to campaign' },
  { type: 'intent', name: 'Marcus Reid', title: 'Project Manager', company: 'Turner & Vale', topic: 'Solar Installation', email: 'm••••@t•••••••••.com', phone: '(480) •••-••27', dest: 'meta', campaign: 'Solar Leads — Q3 Retargeting', action: 'Added to Custom Audience' },
  { type: 'intent', name: 'Alicia Zhang', title: 'Head of Marketing', company: 'Bloomly', topic: 'Email Marketing Platforms', email: 'a•••••@b••••••.com', phone: '(646) •••-••19', dest: 'tiktok', campaign: 'DTC Growth — Prospecting', action: 'Added to campaign' },
  { type: 'intent', name: 'Tom Brenner', title: 'Financial Advisor', company: 'Meridian Wealth', topic: 'Estate Planning', email: 't•••••••@m•••••••.com', phone: '(214) •••-••41', dest: 'youtube', campaign: 'Estate Webinar — In-Market', action: 'Added to campaign' },
  { type: 'intent', name: 'Dana Okafor', title: 'Practice Manager', company: 'Lakeside Dental', topic: 'Dental Implants', email: 'd••••••@l••••••••.com', phone: '(206) •••-••65', dest: 'snapchat', campaign: 'Implant Consults — Local Reach', action: 'Added to campaign' },
  // --- website visitors → CRM / email / alerts ---
  { type: 'visitor', name: 'James Thornton', title: 'VP Revenue Operations', company: 'Meridian Growth Partners', topic: 'ABM Software', email: 'j••••••••@m•••••••.com', phone: '(214) •••-••41', dest: 'hubspot', campaign: 'Enterprise Nurture — Wave 2', action: 'Enrolled in workflow' },
  { type: 'visitor', name: 'Priya Natarajan', title: 'Head of Growth', company: 'Loopwell', topic: 'Sales Intelligence', email: 'p••••@l•••••••.com', phone: '(415) •••-••92', dest: 'slack', campaign: '#hot-visitors', action: 'Alert sent' },
  { type: 'visitor', name: 'Kevin Ortiz', title: 'Owner', company: 'Ortiz Roofing Co.', topic: 'Roofing Leads', email: 'k••••@o••••••••••.com', phone: '(713) •••-••38', dest: 'ghl', campaign: 'Estimate Follow-Up Sequence', action: 'Contact created' },
  { type: 'visitor', name: 'Emily Sasaki', title: 'Ecommerce Manager', company: 'Harbor & Pine', topic: 'Retention Software', email: 'e••••••@h••••••••••.com', phone: '(503) •••-••74', dest: 'klaviyo', campaign: 'Abandoned Browse Flow', action: 'Profile synced' },
  { type: 'visitor', name: 'Rachel Kim', title: 'Demand Gen Manager', company: 'NorthPeak Software', topic: 'CRM Migration', email: 'r•••@n•••••••••.com', phone: '(720) •••-••56', dest: 'mailchimp', campaign: 'Product Tour Drip', action: 'Subscriber added' },
  { type: 'visitor', name: 'Luis Herrera', title: 'Sales Director', company: 'Vantage Freight', topic: 'Freight Brokerage', email: 'l••••••••@v••••••.com', phone: '(305) •••-••12', dest: 'salesforce', campaign: 'MQL Fast-Track', action: 'Trigger fired' },
];

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------
const DOT_COUNT = 700;
const ROT_SPEED = 0.00012;
const ARC_LIFT = 0.32;

// flow timeline (ms since flow start)
const T_SRC_POPUP = 250;
const T_ARC_START = 450;
const T_ARC_END = 1250;
const T_FADE_START = 4600;
const T_END = 5200;
const SPAWN_EVERY = 4200;

function buildSphere() {
  const pts = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < DOT_COUNT; i++) {
    const y = 1 - (i / (DOT_COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return pts;
}

const rotXZ = (p, rot) => ({
  x: p.x * Math.cos(rot) - p.z * Math.sin(rot),
  y: p.y,
  z: p.x * Math.sin(rot) + p.z * Math.cos(rot),
});

function slerp(a, b, t) {
  let dot = a.x * b.x + a.y * b.y + a.z * b.z;
  dot = Math.min(1, Math.max(-1, dot));
  const omega = Math.acos(dot);
  if (omega < 1e-4) return { ...a };
  const so = Math.sin(omega);
  const ka = Math.sin((1 - t) * omega) / so;
  const kb = Math.sin(t * omega) / so;
  return { x: ka * a.x + kb * b.x, y: ka * a.y + kb * b.y, z: ka * a.z + kb * b.z };
}

function randomPoint(minZ, rot, xSign) {
  // random unit vector whose *rotated* z exceeds minZ (front-facing),
  // avoiding the poles; optional preference for one horizontal side.
  for (let i = 0; i < 60; i++) {
    const y = (Math.random() * 2 - 1) * 0.72;
    const ang = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    const p = { x: Math.cos(ang) * r, y, z: Math.sin(ang) * r };
    const pr = rotXZ(p, rot);
    if (pr.z > minZ && (!xSign || Math.sign(pr.x) === xSign || Math.abs(pr.x) < 0.15)) return p;
  }
  return { x: 0, y: 0, z: 1 };
}

const angleBetween = (a, b) =>
  Math.acos(Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z)));

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// Color ramp along the arc: pure source color until 25%, smooth gradation
// through the middle, pure destination color from 60% onward.
const arcColorAt = (t, srcRgb, dstRgb) => {
  const m = Math.min(1, Math.max(0, (t - 0.25) / 0.35));
  return [
    Math.round(srcRgb[0] + (dstRgb[0] - srcRgb[0]) * m),
    Math.round(srcRgb[1] + (dstRgb[1] - srcRgb[1]) * m),
    Math.round(srcRgb[2] + (dstRgb[2] - srcRgb[2]) * m),
  ];
};

// ---------------------------------------------------------------------------
export default function IntentGlobe() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const popupEls = useRef(new Map()); // `${id}-src` / `${id}-dst` -> element
  const flowsRef = useRef([]);
  const [mounted, setMounted] = useState([]); // flows that need popup DOM

  useEffect(() => { preloadAllLogos(); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dots = buildSphere();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let lastSpawn = -SPAWN_EVERY;
    let scenarioIdx = Math.floor(Math.random() * SCENARIOS.length);
    let flowId = 0;
    let cssSize = 0;

    function resize() {
      cssSize = Math.min(wrapRef.current.clientWidth, 560);
      canvas.width = cssSize * dpr;
      canvas.height = cssSize * dpr;
      canvas.style.width = cssSize + 'px';
      canvas.style.height = cssSize + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    function project(p, rot, R, cx, cy) {
      const pr = rotXZ(p, rot);
      return { x: cx + pr.x * R, y: cy + pr.y * R, z: pr.z };
    }

    function spawnFlow(now, rot) {
      const scenario = SCENARIOS[scenarioIdx++ % SCENARIOS.length];
      // spread sources/destinations to opposite horizontal sides
      const srcSide = Math.random() < 0.5 ? -1 : 1;
      const src = randomPoint(0.45, rot, srcSide);
      let dst = randomPoint(0.2, rot, -srcSide);
      for (let i = 0; i < 30; i++) {
        const a = angleBetween(src, dst);
        if (a > 1.0 && a < 2.1) break;
        dst = randomPoint(0.2, rot, -srcSide);
      }
      // Lock each card's side of its node at spawn — never flips afterwards.
      const spx = rotXZ(src, rot).x;
      const dpx = rotXZ(dst, rot).x;
      let cardSrcSide = spx >= 0 ? 1 : -1;
      let cardDstSide = dpx >= 0 ? 1 : -1;
      const flow = { id: flowId++, scenario, src, dst, born: now, srcCardSide: cardSrcSide, dstCardSide: cardDstSide };
      flowsRef.current = [...flowsRef.current.filter(f => now - f.born < T_END), flow];
      setMounted(flowsRef.current.map(f => ({ id: f.id, scenario: f.scenario })));
    }

    // Place a card on its locked side of the node; returns its rect.
    function computePlacement(el, x, y, side, w) {
      const pw = el.offsetWidth || 190;
      const ph = el.offsetHeight || 110;
      let left = side > 0 ? x + 14 : x - 14 - pw;
      left = Math.min(Math.max(left, -24), w - pw + 24);
      const top = Math.min(Math.max(y - 30, 0), w - ph);
      return { left, top, w: pw, h: ph };
    }

    const rectsOverlap = (a, b, pad) =>
      a.left < b.left + b.w + pad && b.left < a.left + a.w + pad &&
      a.top < b.top + b.h + pad && b.top < a.top + a.h + pad;

    // Position a flow's source + destination cards, guaranteeing the pair
    // never overlaps each other (destination yields, sliding vertically).
    function placePair(f, sx, sy, dx, dy, srcOp, dstOp, w) {
      const srcEl = popupEls.current.get(`${f.id}-src`);
      const dstEl = popupEls.current.get(`${f.id}-dst`);
      let srcRect = null;
      if (srcEl) {
        srcRect = computePlacement(srcEl, sx, sy, f.srcCardSide, w);
        srcEl.style.transform = `translate(${srcRect.left}px, ${srcRect.top}px)`;
        srcEl.style.opacity = srcOp;
      }
      if (dstEl) {
        const dstRect = computePlacement(dstEl, dx, dy, f.dstCardSide, w);
        // once a slide direction is chosen it sticks for the whole flow,
        // so the card never snaps back mid-animation
        if (!f.dstSlide && srcRect && srcOp > 0.01 && dstOp > 0.01 && rectsOverlap(srcRect, dstRect, 8)) {
          f.dstSlide = dstRect.top + dstRect.h / 2 >= srcRect.top + srcRect.h / 2 ? 'below' : 'above';
        }
        if (f.dstSlide && srcRect) {
          if (f.dstSlide === 'below') {
            dstRect.top = srcRect.top + srcRect.h + 10;
          } else {
            dstRect.top = srcRect.top - dstRect.h - 10;
          }
          dstRect.top = Math.min(Math.max(dstRect.top, -12), w - dstRect.h + 12);
          // if clamping pushed it back into the source card, resolve horizontally
          if (rectsOverlap(srcRect, dstRect, 0)) {
            dstRect.left = f.dstCardSide > 0
              ? Math.min(srcRect.left + srcRect.w + 10, w - dstRect.w + 24)
              : Math.max(srcRect.left - dstRect.w - 10, -24);
          }
        }
        dstEl.style.transform = `translate(${dstRect.left}px, ${dstRect.top}px)`;
        dstEl.style.opacity = dstOp;
      }
    }

    function draw(now) {
      const w = canvas.width, h = canvas.height;
      const cw = cssSize;
      const cx = w / 2, cy = h / 2;
      const R = w * 0.36;
      const rot = reduced ? 0.6 : now * ROT_SPEED;

      ctx.clearRect(0, 0, w, h);

      // atmosphere
      const glow = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.45);
      glow.addColorStop(0, 'rgba(30,80,160,0.16)');
      glow.addColorStop(1, 'rgba(30,80,160,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // dots
      for (const d of dots) {
        const pr = rotXZ(d, rot);
        const depth = (pr.z + 1) / 2;
        if (depth < 0.25) continue;
        ctx.beginPath();
        ctx.arc(cx + pr.x * R, cy + pr.y * R, Math.max(0.6, depth * 1.5) * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(126,151,181,${0.08 + depth * 0.35})`;
        ctx.fill();
      }

      // spawn
      if (!reduced && now - lastSpawn > SPAWN_EVERY) {
        lastSpawn = now;
        spawnFlow(now, rot);
      }

      // flows
      const alive = [];
      for (const f of flowsRef.current) {
        const age = now - f.born;
        if (age > T_END) {
          popupEls.current.delete(`${f.id}-src`);
          popupEls.current.delete(`${f.id}-dst`);
          continue;
        }
        alive.push(f);
        const { scenario } = f;
        const flowColor = scenario.type === 'intent' ? '25,195,125' : '74,158,255';
        const destColor = DESTS[scenario.dest].color;
        const fade = age > T_FADE_START ? 1 - (age - T_FADE_START) / (T_END - T_FADE_START) : 1;

        const sp = project(f.src, rot, R, cx, cy);
        const dp = project(f.dst, rot, R, cx, cy);

        // source node
        const srcIn = Math.min(1, age / 400);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 3 * dpr * srcIn, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${flowColor},${0.95 * fade})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, (4 + 5 * Math.abs(Math.sin(age / 500))) * dpr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${flowColor},${0.4 * fade * srcIn})`;
        ctx.lineWidth = 1 * dpr;
        ctx.stroke();

        // arc + streak — stroked per-segment so the color grades from the
        // source color into the destination's brand color along the arc
        if (age > T_ARC_START) {
          const p = Math.min(1, (age - T_ARC_START) / (T_ARC_END - T_ARC_START));
          const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          const srcRgb = scenario.type === 'intent' ? [25, 195, 125] : [74, 158, 255];
          const dstRgb = hexToRgb(destColor);
          const arcPoint = (t) => {
            const u = slerp(f.src, f.dst, t);
            const lift = 1 + ARC_LIFT * Math.sin(Math.PI * t);
            const pr = rotXZ({ x: u.x * lift, y: u.y * lift, z: u.z * lift }, rot);
            return [cx + pr.x * R, cy + pr.y * R];
          };
          const drawSeg = (t0, t1, alpha) => {
            const STEPS = 36;
            let prev = arcPoint(t0);
            for (let s = 1; s <= STEPS; s++) {
              const t = t0 + (t1 - t0) * (s / STEPS);
              const pt = arcPoint(t);
              const c = arcColorAt(t, srcRgb, dstRgb);
              ctx.beginPath();
              ctx.moveTo(prev[0], prev[1]);
              ctx.lineTo(pt[0], pt[1]);
              ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha * fade})`;
              ctx.lineWidth = 1.4 * dpr;
              ctx.stroke();
              prev = pt;
            }
          };
          if (p < 1) {
            drawSeg(0, ease, 0.16); // faint trail behind head
            drawSeg(Math.max(0, ease - 0.16), ease, 0.85); // bright streak
            // head — takes on the blended color at its position
            const [hx, hy] = arcPoint(ease);
            const hc = arcColorAt(ease, srcRgb, dstRgb);
            ctx.beginPath();
            ctx.arc(hx, hy, 2.4 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${hc[0]},${hc[1]},${hc[2]},${fade})`;
            ctx.fill();
          } else {
            drawSeg(0, 1, 0.22);
          }
        }

        // destination node (after arrival)
        if (age > T_ARC_END) {
          const dIn = Math.min(1, (age - T_ARC_END) / 350);
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, 3.2 * dpr * dIn, 0, Math.PI * 2);
          ctx.fillStyle = destColor;
          ctx.globalAlpha = fade;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, (4 + 10 * (1 - dIn)) * dpr + 4 * dpr * Math.abs(Math.sin(age / 450)), 0, Math.PI * 2);
          ctx.strokeStyle = destColor;
          ctx.globalAlpha = 0.45 * fade * dIn;
          ctx.lineWidth = 1 * dpr;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // popups (CSS pixel space)
        // source card stays up alongside the destination card; both share `fade`
        const srcOp = age < T_SRC_POPUP ? 0 : Math.min(1, (age - T_SRC_POPUP) / 300) * fade;
        const dstOp = age < T_ARC_END ? 0 : Math.min(1, (age - T_ARC_END) / 300) * fade;
        placePair(f, sp.x / dpr, sp.y / dpr, dp.x / dpr, dp.y / dpr, srcOp, dstOp, cw);
      }
      flowsRef.current = alive;

      if (!reduced) raf = requestAnimationFrame(draw);
    }

    if (reduced) {
      // static: one intent + one visitor flow, both fully arrived
      const rot = 0.6;
      const f1 = { id: flowId++, scenario: SCENARIOS[1], src: randomPoint(0.5, rot, -1), dst: randomPoint(0.3, rot, 1), born: -T_ARC_END - 500 };
      const f2 = { id: flowId++, scenario: SCENARIOS[6], src: randomPoint(0.5, rot, 1), dst: randomPoint(0.3, rot, -1), born: -T_ARC_END - 500 };
      flowsRef.current = [f1, f2];
      setMounted([{ id: f1.id, scenario: f1.scenario }, { id: f2.id, scenario: f2.scenario }]);
      // draw once now and once after popups mount
      draw(0);
      setTimeout(() => draw(0), 100);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const setPopupRef = (key) => (el) => {
    if (el) popupEls.current.set(key, el);
    else popupEls.current.delete(key);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', maxWidth: '560px', margin: '0 auto' }}>
      <canvas ref={canvasRef} aria-label="Live intent signals and website visitors routing to ad campaigns and CRM destinations" role="img" />

      {/* popup overlays */}
      {mounted.map(({ id, scenario }) => {
        const dest = DESTS[scenario.dest];
        const isIntent = scenario.type === 'intent';
        const srcAccent = isIntent ? '#19C37D' : '#4A9EFF';
        return (
          <React.Fragment key={id}>
            {/* SOURCE: person surfacing the signal */}
            <div ref={setPopupRef(`${id}-src`)} style={{
              position: 'absolute', top: 0, left: 0, opacity: 0, width: '196px',
              transition: 'opacity 0.3s', pointerEvents: 'none', zIndex: 10 + id * 2,
              background: 'rgba(8,16,32,0.94)', border: `1px solid ${srcAccent}55`,
              borderLeft: `3px solid ${srcAccent}`, borderRadius: '8px', padding: '10px 12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
            }}>
              <p className="ark-mono" style={{ color: srcAccent, fontSize: '8.5px', letterSpacing: '0.12em', margin: '0 0 6px', fontWeight: 600 }}>
                {isIntent ? '● INTENT SIGNAL' : '● WEBSITE VISITOR'}
              </p>
              <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, margin: '0 0 1px' }}>{scenario.name}</p>
              <p style={{ color: '#8FA9C7', fontSize: '10px', margin: '0 0 6px' }}>{scenario.title} · {scenario.company}</p>
              <p className="ark-mono" style={{ color: srcAccent, fontSize: '9.5px', margin: '0 0 6px' }}>
                {isIntent ? '⌕ ' : '↳ '}{scenario.topic}
              </p>
              <p className="ark-mono" style={{ color: '#5B7699', fontSize: '9px', margin: 0, lineHeight: 1.6 }}>
                {scenario.email}<br />{scenario.phone}
              </p>
            </div>

            {/* DESTINATION: where the signal goes */}
            <div ref={setPopupRef(`${id}-dst`)} style={{
              position: 'absolute', top: 0, left: 0, opacity: 0, width: '190px',
              transition: 'opacity 0.3s', pointerEvents: 'none', zIndex: 11 + id * 2,
              background: `linear-gradient(135deg, ${dest.color}26 0%, rgba(8,16,32,0.94) 55%)`,
              border: `1px solid ${dest.color}88`, borderLeft: `3px solid ${dest.color}`,
              borderRadius: '8px', padding: '10px 12px',
              boxShadow: `0 8px 24px rgba(0,0,0,0.45), 0 0 18px ${dest.color}22`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                <DestLogo destKey={scenario.dest} dest={dest} />
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>{dest.name}</span>
              </div>
              <p className="ark-mono" style={{ color: '#D7E5F5', fontSize: '10px', margin: '0 0 4px' }}>{scenario.campaign}</p>
              <p className="ark-mono" style={{ color: dest.color === '#FFFC00' || dest.color === '#FFE01B' ? '#E8E4A0' : dest.color, fontSize: '8.5px', letterSpacing: '0.1em', margin: 0, fontWeight: 600 }}>
                ✓ {scenario.action.toUpperCase()}
              </p>
            </div>
          </React.Fragment>
        );
      })}

      <div className="ark-mono" style={{
        position: 'absolute', bottom: '4%', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
        background: 'rgba(8,16,32,0.85)', border: '1px solid #14263F', borderRadius: '100px',
        padding: '7px 16px', fontSize: '10.5px', color: '#8FA9C7', letterSpacing: '0.06em', zIndex: 2,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#19C37D', boxShadow: '0 0 8px rgba(25,195,125,0.8)' }} />
        SIGNALS
        <span style={{ color: '#3D5573' }}>→</span>
        PEOPLE
        <span style={{ color: '#3D5573' }}>→</span>
        CAMPAIGNS
      </div>
    </div>
  );
}
