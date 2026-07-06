import React, { useEffect, useRef } from 'react';

// Rotating dot-globe with pulsing intent signals and topic labels.
// Pure 2D canvas — no three.js payload needed for this effect.

const TOPICS = [
  'CRM Migration', 'Solar Installation', 'ABM Software', 'Medicare Plans',
  'Fleet Management', 'HVAC Repair', 'Payroll Software', 'Home Refinance',
  'Cybersecurity Audit', 'Estate Planning', 'ERP Selection', 'Dental Implants',
];

const DOT_COUNT = 700;
const ROT_SPEED = 0.00018; // radians per ms
const PULSE_EVERY_MS = 900;
const PULSE_LIFE_MS = 2600;

function buildSphere() {
  // Fibonacci sphere
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

export default function IntentGlobe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dots = buildSphere();
    const pulses = []; // { dotIndex, born, topic }
    let raf = 0;
    let lastPulse = 0;
    let topicIdx = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const size = Math.min(canvas.parentElement.clientWidth, 560);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    function draw(now) {
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const R = w * 0.36;
      const rot = reduced ? 0.6 : now * ROT_SPEED;

      ctx.clearRect(0, 0, w, h);

      // atmosphere glow
      const glow = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.45);
      glow.addColorStop(0, 'rgba(30,80,160,0.16)');
      glow.addColorStop(1, 'rgba(30,80,160,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // spawn pulses
      if (!reduced && now - lastPulse > PULSE_EVERY_MS) {
        lastPulse = now;
        // pick a front-facing dot
        for (let tries = 0; tries < 10; tries++) {
          const idx = Math.floor(Math.random() * DOT_COUNT);
          const d = dots[idx];
          const zr = d.x * Math.sin(rot) + d.z * Math.cos(rot);
          if (zr > 0.35) {
            pulses.push({ dotIndex: idx, born: now, topic: TOPICS[topicIdx++ % TOPICS.length] });
            break;
          }
        }
        while (pulses.length > 6) pulses.shift();
      }

      // draw dots
      for (const d of dots) {
        const xr = d.x * Math.cos(rot) - d.z * Math.sin(rot);
        const zr = d.x * Math.sin(rot) + d.z * Math.cos(rot);
        const px = cx + xr * R;
        const py = cy + d.y * R;
        const depth = (zr + 1) / 2; // 0 back, 1 front
        if (depth < 0.25) continue;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.6, depth * 1.5) * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(126,151,181,${0.08 + depth * 0.35})`;
        ctx.fill();
      }

      // draw pulses + labels
      ctx.textBaseline = 'middle';
      for (const p of pulses) {
        const age = now - p.born;
        if (age > PULSE_LIFE_MS) continue;
        const d = dots[p.dotIndex];
        const xr = d.x * Math.cos(rot) - d.z * Math.sin(rot);
        const zr = d.x * Math.sin(rot) + d.z * Math.cos(rot);
        if (zr < 0) continue;
        const px = cx + xr * R;
        const py = cy + d.y * R;
        const t = age / PULSE_LIFE_MS;
        const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;

        // expanding ring
        ctx.beginPath();
        ctx.arc(px, py, (3 + t * 16) * dpr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(25,195,125,${0.5 * fade})`;
        ctx.lineWidth = 1 * dpr;
        ctx.stroke();
        // core
        ctx.beginPath();
        ctx.arc(px, py, 2.2 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(25,195,125,${0.9 * fade})`;
        ctx.fill();
        // label
        const side = px > cx ? 1 : -1;
        const lx = px + side * 14 * dpr;
        ctx.font = `${10 * dpr}px "IBM Plex Mono", monospace`;
        ctx.textAlign = side > 0 ? 'left' : 'right';
        ctx.fillStyle = `rgba(111,227,176,${0.95 * fade})`;
        ctx.fillText(p.topic, lx, py);
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    }

    if (reduced) {
      // static frame with a few fixed pulses
      pulses.push(
        { dotIndex: 120, born: -400, topic: TOPICS[0] },
        { dotIndex: 350, born: -400, topic: TOPICS[1] },
        { dotIndex: 500, born: -400, topic: TOPICS[2] },
      );
      draw(0);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '560px', margin: '0 auto' }}>
      <canvas ref={canvasRef} aria-label="Live intent signals detected around the world" role="img" />
      <div className="ark-mono" style={{
        position: 'absolute', bottom: '6%', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
        background: 'rgba(8,16,32,0.85)', border: '1px solid #14263F', borderRadius: '100px',
        padding: '7px 16px', fontSize: '11px', color: '#8FA9C7', letterSpacing: '0.06em',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#19C37D', boxShadow: '0 0 8px rgba(25,195,125,0.8)' }} />
        12,000+ INTENT TOPICS · TRACKED DAILY
      </div>
    </div>
  );
}
