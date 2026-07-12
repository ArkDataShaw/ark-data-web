# Desktop Beat-Snap Scroll Takeover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On the DESKTOP scroll demo (`≥960px` → `BuilderScrollDemo.jsx`), replace the raw scroll-position beat driver with a gesture-driven "scroll takeover" (Option B): the story parks at designed valleys, a small wheel/keyboard nudge plays the ENTIRE next-beat transition at a fixed, legible duration, and a hard scroll escapes the takeover.

**Architecture:** A thin controller layered OVER the existing `frame()` `p`-engine — `frame()`'s beat commit/reverse logic, chip morph, seat/overlay, sidebar choreography, and snap guard are UNCHANGED. The builder is sticky-pinned, so moving `window.scrollY` within the pin range advances `p` while the builder stays visually stationary. The controller listens to `wheel` (the only intent signal — `scrollTo` never fires `wheel`, so no feedback loop), and on a nudge eases `scrollTo` between valley scroll-depths over `TRANSITION_MS`; the eased sweep of `p` makes the existing engine commit/reverse exactly one beat. Attached to BOTH the parent window and the same-origin builder iframe (wheel over the iframe fires in the iframe's context).

**Tech Stack:** React (Vite), rAF-based eased scroll, plain `wheel`/`keydown` listeners, headless Chrome + puppeteer-core probes for verification.

---

## Background: current geometry + harness (read before starting)

In `src/components/home/BuilderScrollDemo.jsx` (desktop `≥960px` path):
- `frame()` (the scroll handler, ~line 513) computes `scrolled = max(0,-track.top)`, `storyPinPx = 4.2*cssVh`, `p = clamp(scrolled/storyPinPx,0,1)`. Beats commit forward when `p >= BEATS[i]` (`BEATS=[0.10,0.32,0.54,0.74]`) and unapply when `p < BEATS[i]`. It also flips `seated` when `r.top <= 1`, sets caption/frame opacity imperatively, and calls `snapStrayChips()`.
- `frame()` runs on every `scroll` event (via rAF, ~line 684) and on a 400ms heartbeat (~line 668).
- `topBeatRef` tracks the highest committed beat (`-1` = none/hero). `appliedRef` is the committed-beat set.
- The builder is a **same-origin** iframe (`iframeRef.current.contentWindow` is reachable; existing code calls `w.ArkEmbed.beatOnDesktop(i)` etc.).

**The takeover model (valleys):** 5 rest points at scroll fractions `REST_P = [0.05, 0.18, 0.42, 0.64, 0.85]` of `storyPinPx`, mapping to states `[hero(no beat), beat0, beat1, beat2, beat3]`. Valley index `k = topBeatRef + 1`. Each valley sits BETWEEN two `BEATS[]` thresholds, so a transition from valley `k` to `k+1` sweeps `p` across exactly one threshold → exactly one beat commit. Absolute page-Y: `restY(k) = A + REST_P[k]*storyPinPx`, where `A = track.getBoundingClientRect().top + window.scrollY`.

**Verification harness (used by every task).** Build, serve `dist`, launch headless Chrome:
```bash
cd ~/repos/ark-data-web && NODE_OPTIONS="--max-old-space-size=6144" pnpm --config.verify-deps-before-run=false exec vite build >/tmp/b.log 2>&1; echo "build $?"
pkill -f "http.server 8799" 2>/dev/null
( cd dist && python3 -m http.server 8799 >/tmp/http.log 2>&1 & ); sleep 2
CHROME=/home/shaw/.cache/puppeteer/chrome/linux-121.0.6167.85/chrome-linux64/chrome
nohup "$CHROME" --headless=new --remote-debugging-port=9222 --no-sandbox --disable-gpu --disable-dev-shm-usage --user-data-dir=/tmp/chrome-plan-$$ >/tmp/chrome.log 2>&1 & sleep 6
curl -s http://127.0.0.1:9222/json/version >/dev/null && echo "chrome up"
```
Note: run `pkill` on its OWN line (chained pkill trips exit 144 and aborts the rest). Vite often prints nothing on success — a fresh `dist/assets/index-*.js` hash means it built.

**Reusable probe boot preamble** (prepend to every probe `.mjs`; reaches the desktop demo, stubs `mapReady`, computes `st`/`pin`, and defines a `wheel` dispatch helper + readers):
```js
import puppeteer from '/home/shaw/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
const page = await b.newPage(); await page.setViewport({ width: 1280, height: 1000 });
await page.goto('http://localhost:8799/', { waitUntil: 'networkidle2', timeout: 60000 });
for (let y=0;y<8000;y+=700){await page.evaluate(yy=>window.scrollTo(0,yy),y);await new Promise(r=>setTimeout(r,120));}
await page.waitForFunction(()=>{const f=document.querySelector('iframe[src*="builder"]');try{return f&&f.contentWindow.ArkEmbed&&f.contentWindow.ArkEmbed.ready&&f.contentWindow.ArkEmbed._desktopStory;}catch(e){return false;}},{timeout:30000});
const st=await page.evaluate(()=>{const f=document.querySelector('iframe[src*="builder"]');f.contentWindow.ArkEmbed.mapReady=()=>true;return f.closest('section').getBoundingClientRect().top+window.scrollY;});
const vh=await page.evaluate(()=>document.documentElement.clientHeight);const pin=4.2*vh;
const REST_P=[0.05,0.18,0.42,0.64,0.85];
const restY=(k)=>Math.round(st+REST_P[k]*pin);
// dispatch a wheel gesture on the iframe contentWindow (where a real scroll-over-builder lands):
const wheel=(dy)=>page.evaluate((d)=>{const f=document.querySelector('iframe[src*="builder"]');f.contentWindow.dispatchEvent(new WheelEvent('wheel',{deltaY:d,cancelable:true,bubbles:true}));},dy);
// read story state from inside the builder:
const read=()=>page.evaluate(()=>{const f=document.querySelector('iframe[src*="builder"]');const d=f.contentWindow.document;const checked=[...d.querySelectorAll('.cbrow input:checked')].map(i=>i.parentElement.textContent.trim());return{reach:f.contentWindow._reach,checked,scrollY:Math.round(window.scrollY)};});
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const NOISE='brandfetch|ERR_FAILED|Base44|guidelines|status of';
```
Run each probe with: `node /tmp/<probe>.mjs 2>&1 | grep -vE "brandfetch|ERR_FAILED|Base44|guidelines|status of"`.

---

## Task 1: Add takeover constants + refs (no behavior change yet)

**Files:**
- Modify: `src/components/home/BuilderScrollDemo.jsx`

- [ ] **Step 1: Add the takeover constants.** After the `SEAT_HOLD_MS` line (currently line 41), add:

```js
// ── beat-snap scroll takeover (Option B), DESKTOP only ──────────────────────────────────────────
// Valley (rest-point) scroll fractions of the pinned range, one per state:
// [hero(no beat), beat0, beat1, beat2, beat3]. Each sits BETWEEN two BEATS[] thresholds so a
// transition sweeps p across exactly one threshold → exactly one beat. Tunable (Shaw tunes on-device).
const REST_P = [0.05, 0.18, 0.42, 0.64, 0.85];
const TRANSITION_MS = 1100; // fixed, scroll-speed-independent duration of ONE beat transition
const INTENT_PX = 50;       // accumulated wheel delta (one burst) that fires a beat; 2× queues one more
const EXIT_PX = 300;        // accumulated burst that ESCAPES the takeover (native scroll carries out)
const SETTLE_MS = 250;      // ease duration for settle-to-rest (the ball rolls into the valley)
const IDLE_MS = 150;        // idle after last wheel before settling / resetting the burst / re-arming
```

- [ ] **Step 2: Add the controller refs.** Find `const lastCapAtRef = useRef(0);` (currently line 132). Add directly after it:

```js
  const engagedRef = useRef(false);   // takeover active (set on seat, cleared on escape/unseat/explore)
  const progRef = useRef(false);      // an eased programmatic scroll is running (gates settle)
  const transitionRef = useRef(null); // {dir} while a beat-transition ease is in flight, else null
  const queuedDirRef = useRef(0);     // one queued beat direction (-1/0/+1) — "queue exactly one"
  const burstRef = useRef(0);         // signed accumulated wheel delta for the current gesture burst
  const burstDirRef = useRef(0);      // direction of the current burst (accumulation resets on flip)
  const idleTimerRef = useRef(0);     // idle debounce → settle / burst reset / re-arm
  const rafScrollRef = useRef(0);     // rAF handle for the eased scroll
```

- [ ] **Step 3: Build to confirm no error.**

Run: `cd ~/repos/ark-data-web && NODE_OPTIONS="--max-old-space-size=6144" pnpm --config.verify-deps-before-run=false exec vite build 2>&1 | tail -3; echo "exit=$?"`
Expected: exit=0, a fresh `dist/assets/index-*.js` hash (build succeeds).

- [ ] **Step 4: Commit.**

```bash
git add src/components/home/BuilderScrollDemo.jsx
git commit -m "feat(desktop demo): add beat-snap takeover constants + controller refs (no behavior yet)"
```

---

## Task 2: Engage-on-seat + the takeover controller (forward nudge + escape)

**Files:**
- Modify: `src/components/home/BuilderScrollDemo.jsx`

- [ ] **Step 1: Engage/release the takeover on the seat flip in `frame()`.** Find (currently lines 534-535):

```js
    const shouldSeat = !collapsedRef.current && r.top <= 1;
    if (shouldSeat !== seatedRef.current) { seatedRef.current = shouldSeat; setSeated(shouldSeat); }
```

Replace the second line with:

```js
    if (shouldSeat !== seatedRef.current) {
      seatedRef.current = shouldSeat; setSeated(shouldSeat);
      // ENGAGE the takeover when the section pins; RELEASE it when it un-pins (scrolled back above).
      // Escape (mid-section) clears engagedRef WITHOUT a seat flip, so it stays released until re-entry.
      // Reset the burst on engage so the scroll-in momentum doesn't instantly advance past the hero.
      if (shouldSeat && !armedRef.current) { engagedRef.current = true; burstRef.current = 0; }
      else if (!shouldSeat) { engagedRef.current = false; }
    }
```

- [ ] **Step 2: Add the takeover controller effect.** Find the existing scroll-listener effect that ends with `}, [frame, isDesktop]);` (currently line 694), immediately before `if (!isDesktop) return;` (currently line 696). Insert this new effect right after that `}, [frame, isDesktop]);` line:

```jsx
  // ── DESKTOP beat-snap scroll takeover (Option B) ────────────────────────────────────────────────
  // The builder is sticky-pinned, so moving window.scrollY within the pin range advances p while the
  // builder stays visually stationary. This controller decides WHEN (a wheel/key nudge) and how fast
  // (TRANSITION_MS, fixed) scrollY moves between valleys; the existing frame() p-engine commits/
  // reverses the ONE beat the eased scroll sweeps across. wheel is the only intent signal — scrollTo
  // never fires wheel, so there is no feedback loop (frame() still runs on the resulting scroll to
  // commit beats; progRef only stops two eases from fighting). Attached to BOTH the parent window and
  // the same-origin builder iframe (wheel over the iframe fires in the iframe's own context).
  useEffect(() => {
    if (!isDesktop) return;
    const geom = () => {
      const t = trackRef.current; if (!t) return null;
      const A = t.getBoundingClientRect().top + window.scrollY;
      const pin = 4.2 * (document.documentElement.clientHeight || window.innerHeight);
      return { A, pin };
    };
    const pNow = () => { const g = geom(); return g ? clamp((window.scrollY - g.A) / g.pin, 0, 1) : 0; };
    const restY = (k) => { const g = geom(); return g ? g.A + REST_P[k] * g.pin : null; };
    const currentValley = () => clamp(topBeatRef.current + 1, 0, REST_P.length - 1);
    const seatedNow = () => { const t = trackRef.current; if (!t) return false; const r = t.getBoundingClientRect(); return r.top <= 1 && r.bottom > 0; };

    const easeTo = (toY, dur, done) => {
      cancelAnimationFrame(rafScrollRef.current);
      progRef.current = true;
      const fromY = window.scrollY, t0 = performance.now();
      const step = () => {
        const t = Math.min(1, (performance.now() - t0) / dur);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
        window.scrollTo(0, Math.round(fromY + (toY - fromY) * e));
        if (t < 1) rafScrollRef.current = requestAnimationFrame(step);
        else { progRef.current = false; rafScrollRef.current = 0; if (done) done(); }
      };
      rafScrollRef.current = requestAnimationFrame(step);
    };

    const doEscape = () => {
      engagedRef.current = false;
      cancelAnimationFrame(rafScrollRef.current); rafScrollRef.current = 0;
      progRef.current = false; transitionRef.current = null; queuedDirRef.current = 0; burstRef.current = 0;
    };

    const startTransition = (dir) => {
      const to = currentValley() + dir;
      if (to < 0 || to >= REST_P.length) { doEscape(); return; } // off the ends → let them leave
      const ty = restY(to); if (ty == null) return;
      transitionRef.current = { dir };
      easeTo(ty, TRANSITION_MS, () => {
        transitionRef.current = null;
        const q = queuedDirRef.current; queuedDirRef.current = 0;
        if (q && engagedRef.current) startTransition(q);
      });
    };

    const settle = () => {
      if (!engagedRef.current || progRef.current || transitionRef.current || !seatedNow()) return;
      const ty = restY(currentValley()); if (ty == null || Math.abs(window.scrollY - ty) < 3) return;
      easeTo(ty, SETTLE_MS);
    };

    const resetIdle = () => {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        burstRef.current = 0; burstDirRef.current = 0;
        if (armedRef.current || collapsedRef.current) return;
        if (!engagedRef.current) { // re-arm after an escape, but only INSIDE the valley band (not exiting an end)
          const p = pNow();
          if (seatedNow() && p >= REST_P[0] && p <= REST_P[REST_P.length - 1]) { engagedRef.current = true; settle(); }
          return;
        }
        settle();
      }, IDLE_MS);
    };

    const onWheel = (e) => {
      if (armedRef.current || collapsedRef.current || !engagedRef.current || !seatedNow()) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      if (dir !== burstDirRef.current) { burstRef.current = 0; burstDirRef.current = dir; }
      burstRef.current += e.deltaY;
      resetIdle();
      const mag = Math.abs(burstRef.current);
      if (mag >= EXIT_PX) { doEscape(); return; } // let native scroll carry them out (do NOT preventDefault)
      e.preventDefault();
      if (transitionRef.current) {
        if (!queuedDirRef.current && dir === transitionRef.current.dir && mag >= 2 * INTENT_PX) queuedDirRef.current = dir;
        return;
      }
      if (mag >= INTENT_PX) startTransition(dir);
    };

    const onKey = (e) => {
      if (armedRef.current || collapsedRef.current || !engagedRef.current || !seatedNow() || transitionRef.current) return;
      const down = ['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key);
      const up = ['ArrowUp', 'PageUp'].includes(e.key);
      if (!down && !up) return;
      e.preventDefault();
      startTransition(down ? 1 : -1);
    };

    const targets = [window];
    try { const iw = iframeRef.current && iframeRef.current.contentWindow; if (iw && iw !== window) targets.push(iw); } catch { /* same-origin always; guard anyway */ }
    targets.forEach(w => { w.addEventListener('wheel', onWheel, { passive: false }); w.addEventListener('keydown', onKey); });
    return () => {
      targets.forEach(w => { try { w.removeEventListener('wheel', onWheel); w.removeEventListener('keydown', onKey); } catch { /* */ } });
      clearTimeout(idleTimerRef.current);
      cancelAnimationFrame(rafScrollRef.current);
    };
  }, [isDesktop, booted]);
```

- [ ] **Step 3: Build + launch the harness** (see Background). Then write `/tmp/probe-forward.mjs` (boot preamble, then):

```js
// park at the hero valley (seats the section → frame() engages the takeover)
await page.evaluate(y=>window.scrollTo(0,y),restY(0)); await sleep(500);
console.log('hero  :', JSON.stringify(await read()));
// nudge 1 (deltaY 60 ≥ INTENT 50, < 2×INTENT so no queue) → exactly beat 0
await wheel(60); await sleep(TRANSITION_MS_WAIT());
console.log('beat0 :', JSON.stringify(await read()), '(expect reach=395936, scrollY≈'+restY(1)+')');
// nudge 2 → exactly beat 1
await wheel(60); await sleep(TRANSITION_MS_WAIT());
console.log('beat1 :', JSON.stringify(await read()), '(expect reach=28928, scrollY≈'+restY(2)+')');
// ESCAPE: a single big event (deltaY 350 ≥ EXIT 300) → escape BEFORE any transition; page must NOT move
const before = (await read()).scrollY;
await wheel(350); await sleep(120);
const afterEsc = await read();
console.log('escape:', JSON.stringify(afterEsc), '(expect UNCHANGED scrollY≈'+before+', reach=28928)');
// re-arm (idle) then confirm a nudge advances again → beat 2
await sleep(300);
await wheel(60); await sleep(TRANSITION_MS_WAIT());
console.log('beat2 :', JSON.stringify(await read()), '(expect reach=4360, scrollY≈'+restY(3)+')');
await page.close(); await b.disconnect();
function TRANSITION_MS_WAIT(){return 1500;}
```

Run: `node /tmp/probe-forward.mjs 2>&1 | grep -vE "brandfetch|ERR_FAILED|Base44|guidelines|status of"`
Expected:
- `beat0` reach `395936`, `scrollY` within ~15px of `restY(1)`.
- `beat1` reach `28928`, `scrollY` ≈ `restY(2)`.
- `escape` `scrollY` unchanged from `before` and reach still `28928` (the EXIT branch skipped the transition entirely).
- `beat2` reach `4360`, `scrollY` ≈ `restY(3)` (re-arm works).

If `beat0` did NOT fire, the most likely cause is the wheel listener not reaching the iframe — confirm `targets` includes the iframe contentWindow (Step 2) and the effect re-ran on `booted`.

- [ ] **Step 4: Commit.**

```bash
git add src/components/home/BuilderScrollDemo.jsx
git commit -m "feat(desktop demo): gesture-driven beat-snap takeover — nudge plays one full beat, big scroll escapes"
```

---

## Task 3: Verify reverse, queue-one, morph-intact, and mobile untouched

**Files:**
- Modify: none unless a probe reveals a regression (then fix minimally and re-run).

- [ ] **Step 1: Build + relaunch harness. Write `/tmp/probe-reverse.mjs`** (boot preamble, then drive forward to beat 2, then reverse with up-nudges):

```js
await page.evaluate(y=>window.scrollTo(0,y),restY(0)); await sleep(500);
for (const dy of [60,60]) { await wheel(dy); await sleep(1500); } // → beat1
console.log('fwd beat1:', JSON.stringify(await read()), '(expect reach=28928)');
await wheel(-60); await sleep(1500); // up-nudge → beat0
console.log('rev beat0:', JSON.stringify(await read()), '(expect reach=395936, scrollY≈'+restY(1)+')');
await wheel(-60); await sleep(1500); // up-nudge → hero (all filters off)
const hero = await read();
console.log('rev hero :', JSON.stringify(hero), '(expect scrollY≈'+restY(0)+', checked back to base)');
await page.close(); await b.disconnect();
```

Run and expect: reverse steps reach back UP `28928 → 395936`, `scrollY` returns to `restY(1)` then `restY(0)`, and the checked-filter list shrinks each step (fully reversible).

- [ ] **Step 2: Write `/tmp/probe-queue.mjs`** (boot preamble) — one burst ≥ 2×INTENT queues exactly one extra beat (2 beats from one gesture):

```js
await page.evaluate(y=>window.scrollTo(0,y),restY(0)); await sleep(500);
// single burst deltaY 140 ≥ 2×INTENT(100): fires beat0 AND queues beat1
await wheel(140); await sleep(TRANSITION_MS_WAIT_2());
const s = await read();
console.log('queue:', JSON.stringify(s), '(expect reach=28928 = beat1, scrollY≈'+restY(2)+' — two beats from one burst)');
// a THIRD is NOT queued (queue-exactly-one): should still be at beat1, not beat2
await sleep(400);
const s2 = await read();
console.log('cap  :', JSON.stringify(s2), '(expect still reach=28928, NOT 4360 — only one queued)');
await page.close(); await b.disconnect();
function TRANSITION_MS_WAIT_2(){return 2600;} // ~2 transitions
```

Run and expect: after the single 140-delta burst, reach = `28928` (beat1) — beat0 played then the queued beat1 played — and it stops there (no third beat). Confirms "queue exactly one."

- [ ] **Step 3: Write `/tmp/probe-morph.mjs`** (boot preamble) — confirm the chip morph plays fully under programmatic scrolling (no orphan clone; the snap guard did not abort it):

```js
await page.evaluate(y=>window.scrollTo(0,y),restY(0)); await sleep(500);
await wheel(60); // fire beat0 → chip fly + morph during the eased transition
// sample the fixed fly-overlay clone count mid-transition and after settle
await sleep(400);
const mid = await page.evaluate(()=>document.querySelectorAll('[style*="position: fixed"] *').length);
await sleep(1400);
const after = await page.evaluate(()=>{const f=document.querySelector('iframe[src*="builder"]');const d=f.contentWindow.document;return {chips:[...d.querySelectorAll('.chip,.pk-chip')].map(c=>c.textContent.trim()).filter(Boolean), reach:f.contentWindow._reach};});
console.log('mid clones:', mid, '(expect >0 — a chip was flying)');
console.log('after     :', JSON.stringify(after), '(expect the beat-0 filter chip landed in the strip, reach=395936)');
await page.close(); await b.disconnect();
```

Run and expect: `mid clones` > 0 (a clone was in flight during the transition), and `after` shows the beat-0 filter chip present in the strip with reach `395936` — the morph landed, not aborted. If the chip is missing / stuck floating, the snap guard regressed under programmatic scroll (it should not, because the builder stays sticky-pinned) — investigate before proceeding.

- [ ] **Step 4: Write `/tmp/probe-mobile.mjs`** — the `<960px` path is untouched:

```js
import puppeteer from '/home/shaw/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
const page = await b.newPage(); await page.setViewport({ width: 800, height: 900 }); // <960 → mobile path
await page.goto('http://localhost:8799/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r=>setTimeout(r,1500));
const s = await page.evaluate(()=>({ hasBsdCap: !!document.querySelector('.bsd-cap') }));
console.log('mobile (<960): bsd-cap present =', s.hasBsdCap, '(expect false — MobileSentenceDemo path)');
await page.close(); await b.disconnect();
```

Run and expect: `bsd-cap present = false` (the `<960px` React path renders `MobileSentenceDemo`, no desktop band / no takeover). Confirms desktop-only.

- [ ] **Step 5: Confirm `MobileSentenceDemo.jsx` and `public/builder/*` are unchanged.**

Run: `cd ~/repos/ark-data-web && git status --short src/components/home/MobileSentenceDemo.jsx public/builder/`
Expected: no output (no modifications to the mobile component or shared builder files).

- [ ] **Step 6: Commit** (only if a fix was needed in Steps 1-4; otherwise skip — this task is verification).

```bash
git add src/components/home/BuilderScrollDemo.jsx
git commit -m "fix(desktop demo): <one-line description of the regression the probes caught>"
```

---

## Task 4: Deploy to production + hand FEEL to Shaw

**Files:**
- Modify: none (deploy).

- [ ] **Step 1: Final build.**

Run: `cd ~/repos/ark-data-web && NODE_OPTIONS="--max-old-space-size=6144" pnpm --config.verify-deps-before-run=false exec vite build 2>&1 | tail -3; echo "exit=$?"`
Expected: exit=0, fresh `dist/assets/index-*.js` hash.

- [ ] **Step 2: Deploy to the unblocked `shawcole` prod site and verify the live bundle matches local `dist`.**

```bash
cd ~/repos/ark-data-web
netlify deploy --prod --dir=dist --no-build --site d38e2137-d97d-42ae-b719-d6581902f5a2 2>&1 | grep -iE "Production URL|Website URL|Finished|Error"
echo "local :"; ls dist/assets/index-*.js | sed 's#.*/##'
cb=$(date +%s); echo "live  :"; curl -s "https://arkdata.io/?cb=$cb" | grep -oE 'index-[^"]+\.js' | head -1
```
Expected: Production URL `https://arkdata.io`; the live `index-*.js` hash equals the local one. (`--no-build` is REQUIRED — the site's own build cmd fails on a pnpm TTY purge.)

- [ ] **Step 3: Register the deploy in the client asset registry** (per CLAUDE.md):

```bash
python3 ~/scripts/agent-orchestra/scripts/asset-registry.py register-url arkdata "https://arkdata.io" "beat-snap scroll takeover live" 2>&1 | tail -2 || true
```

- [ ] **Step 4: Stop the harness.**

```bash
pkill -f "http.server 8799" 2>/dev/null
for pid in $(pgrep -f "chrome-linux64/chrome"); do kill "$pid" 2>/dev/null; done
echo done
```

- [ ] **Step 5: Hand off to Shaw for on-device judgment.** Report that headless verified MECHANICS only (one nudge = one full beat, escape, reverse, queue-one, morph intact, mobile untouched) and that FEEL is his call on a real desktop/trackpad. The tunable seeds (top of `BuilderScrollDemo.jsx`): `TRANSITION_MS=1100` (transition pace), `REST_P` spacing (dwell/scroll budget per beat), `INTENT_PX=50` (nudge sensitivity), `EXIT_PX=300` (how hard you must scroll to escape — **flag the trackpad-momentum consideration**: a firm two-finger swipe accumulates delta quickly, so if it escapes too easily on his Mac, raise `EXIT_PX`), `SETTLE_MS=250`, `IDLE_MS=150`.

---

## Notes for the implementer

- **Do NOT touch** `frame()`'s beat commit/reverse loops, `beatOnDesktop`/`beatOffDesktop`, `flipChips`/`flyChips`, the chip `morph`, `preshowCaption`/`buildCaption`, `setSidebarStage`/`landSel`, `snapStrayChips`, `reverseTo`, the seat/overlay + per-beat bar fade, `measure`, or the heartbeat. The ONLY edits to existing code are the two-line seat-flip engage/release in `frame()` (Task 2 Step 1). Everything else is the new additive controller effect.
- **Do NOT touch** `MobileSentenceDemo.jsx`, the `<960px` branch, or `public/builder/*`. The iframe wheel listener is attached at runtime from the parent (same-origin) — that does NOT modify the builder's source files.
- **Why `wheel`, not `scroll`, for intent:** `scrollTo` fires `scroll` but never `wheel`, so using `wheel` for intent detection sidesteps the programmatic-scroll feedback loop. `frame()` still runs on the resulting `scroll` events to commit beats — that is intended.
- **Why the iframe listener:** the builder iframe fills most of the section; wheel events with the cursor over it fire in the iframe's context, so the parent-window listener alone would miss them. Attach to both (Task 2 Step 2, `targets`).
- **snap guard:** unchanged and must stay anchored on the builder's on-screen top (`iframeRef.current.getBoundingClientRect().top`), NOT `window.scrollY`. During a transition the builder is sticky-pinned (its rect top is stable), so the guard must NOT fire — Task 3 Step 3 verifies the morph still lands.
- **mapReady gate:** the existing engine won't commit beat ≥1 until `generatedRef && mapReady()`. If a forward transition to valley 2+ starts before the map is ready, the ease lands at the valley and the beat commits a frame later via the heartbeat. Acceptable; if it reads poorly on-device, hold the transition start until `mapReady()`.
- **Tunables** live at the top of the file (`REST_P`, `TRANSITION_MS`, `INTENT_PX`, `EXIT_PX`, `SETTLE_MS`, `IDLE_MS`) so Shaw can adjust feel without touching logic.
