# Desktop Sentence-Overlays-Topbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On the DESKTOP scroll demo, have the dark sentence bar overlay the builder's own top bar (reclaiming that vertical space so the map/charts move up), with a three-phase scroll-in and a per-beat bar fade that reveals the real (functional) top bar between beats.

**Architecture:** All in `src/components/home/BuilderScrollDemo.jsx` + its inline `<style>`. The caption band STAYS at its sticky position; the builder slides UP behind it (its sticky `top` transitions from `NAV+SENTENCE_ZONE` → `NAV+BAR_OVERLAP`) on a `seated` state flip at the pin, so the builder's top bar tucks behind the dark bar. The dark bar gains an opaque dark background only when seated (via a `section.bsd-seated .bsd-cap` rule so the caption's own JS-rewritten className can't clobber it). Between beats, the whole bar fades to reveal the top bar, guarded by an idle-hold + re-seat-before-next-beat debounce.

**Tech Stack:** React (Vite), plain CSS transitions, headless Chrome + puppeteer-core probes for verification.

---

## Background: current geometry (read before starting)

In `BuilderScrollDemo.jsx` (desktop `≥960px` path):
- `NAV_PX = 70` (marketing nav height). `SENTENCE_ZONE = 54` (sentence band height).
- Render tree inside `<section ref={trackRef}>`:
  - `.bsd-cap` (caption band) — FIRST child, `position:sticky; top:70px; height:54px`, builder-width, centered. Transparent (dark comes from the section behind it). Holds `.bsd-cap-inner` (the crossfading sentence text).
  - `frameRef` (builder iframe wrapper) — SECOND child, `position:sticky; top: NAV_PX+SENTENCE_ZONE (124px)`, builder-width.
- During scroll-in both rise; caption pins at 70 (its band, 70–124), builder pins at 124 (adjacent below the band). The builder's own top bar (~44px, "Audiences › Create / Generate / Save") is the first row of the iframe, so it sits at 124.
- `frame()` (the scroll handler) sets `frameRef.style.opacity` and `captionRef.style.opacity` imperatively every tick. `preshowCaption(k)` crossfades the INNER text per beat. `sectionH` (React) carries a `+ SENTENCE_ZONE` term.

**The seat mechanic (key insight):** keep the caption band exactly where it is (sticky 70, 70–124). Slide the BUILDER up from `top:124` → `top:76` (`NAV_PX + BAR_OVERLAP`, BAR_OVERLAP=6). The builder's top bar (now 76–120) tucks BEHIND the caption band (70–124), which becomes an opaque dark cover over it. Everything inside the builder is ~48px higher on screen = the reclaimed space.

**Verification harness (used by every task):** local static server on `dist` + headless Chrome on :9222, driving the real homepage. Reusable launcher:
```bash
cd ~/repos/ark-data-web && NODE_OPTIONS="--max-old-space-size=6144" pnpm --config.verify-deps-before-run=false exec vite build >/tmp/b.log 2>&1; echo "build $?"
pkill -f "http.server 8799" 2>/dev/null; ( cd dist && python3 -m http.server 8799 >/tmp/http.log 2>&1 & ); sleep 2
CHROME=/home/shaw/.cache/puppeteer/chrome/linux-121.0.6167.85/chrome-linux64/chrome
nohup "$CHROME" --headless=new --remote-debugging-port=9222 --no-sandbox --disable-gpu --disable-dev-shm-usage --user-data-dir=/tmp/chrome-plan-$$ >/tmp/chrome.log 2>&1 & sleep 6
curl -s http://127.0.0.1:9222/json/version >/dev/null && echo "chrome up"
```
Probes are node ESM using `/home/shaw/node_modules/puppeteer-core`, `puppeteer.connect({browserURL:'http://127.0.0.1:9222'})`, viewport `{width:1280,height:1000}`. To reach the desktop demo: load `http://localhost:8799/`, scroll down in 700px steps until the builder iframe's `ArkEmbed._desktopStory` is ready, stub `f.contentWindow.ArkEmbed.mapReady=()=>true`, then scroll to `sectionTop + p*pin + 4` where `pin = 4.2 * clientHeight`. Filter noise with `grep -vE "brandfetch|ERR_FAILED|Base44|guidelines|status of"`.

---

## Task 1: Add `seated` state + constants (no behavior change yet)

**Files:**
- Modify: `src/components/home/BuilderScrollDemo.jsx`

- [ ] **Step 1: Add the `BAR_OVERLAP` constant.** After the `SENTENCE_ZONE` line (currently line 35), add:

```js
// When the demo pins, the builder slides UP so its own top bar tucks BEHIND the dark sentence bar,
// reclaiming the sentence-band space. BAR_OVERLAP = the gap left below the nav so the top bar's top
// border isn't flush against the nav (breathing room). The builder's pinned top goes from
// NAV_PX+SENTENCE_ZONE (band-above) to NAV_PX+BAR_OVERLAP (tucked behind the bar). Desktop only.
const BAR_OVERLAP = 6;
const SEAT_HOLD_MS = 280; // between beats, wait this long idle before fading the bar to reveal the top bar
```

- [ ] **Step 2: Add the `seated` React state + ref.** Find the state block (near `const [collapsed, setCollapsed] = useState(false);`). Add directly after it:

```js
  const [seated, setSeated] = useState(false); // pinned → builder slid up behind the dark bar (desktop overlay)
  const seatedRef = useRef(false);             // mirror for frame() without a stale closure
  const lastCapAtRef = useRef(0);              // performance.now() when the current beat's sentence was last shown
```

- [ ] **Step 3: Keep `seatedRef` synced with state.** Find the effects that sync refs (e.g. `useEffect(() => { armedRef.current = armed; }, [armed]);`). Add alongside:

```js
  useEffect(() => { seatedRef.current = seated; }, [seated]);
```

- [ ] **Step 4: Build to confirm no error.**

Run: `cd ~/repos/ark-data-web && NODE_OPTIONS="--max-old-space-size=6144" pnpm --config.verify-deps-before-run=false exec vite build 2>&1 | tail -3`
Expected: build completes, no error (bundle hash printed).

- [ ] **Step 5: Commit.**

```bash
git add src/components/home/BuilderScrollDemo.jsx
git commit -m "feat(desktop demo): add seated state + BAR_OVERLAP/SEAT_HOLD constants (no behavior yet)"
```

---

## Task 2: Slide the builder up on seat (the core geometry move)

**Files:**
- Modify: `src/components/home/BuilderScrollDemo.jsx`

- [ ] **Step 1: Flip `seated` in `frame()` based on pin state.** In `frame()`, right after the line `const entry = clamp((cssVh - r.top) / 420, 0, 1);` (currently ~line 519), add:

```js
    // SEAT: once the section is pinned to the top (its top has reached the nav), slide the builder up
    // behind the dark bar. Un-seat when scrolled back above the pin. Ref+state so the CSS transition
    // (on frameRef `top`) plays once per flip, not per scroll frame.
    const shouldSeat = !collapsedRef.current && r.top <= 1;
    if (shouldSeat !== seatedRef.current) { seatedRef.current = shouldSeat; setSeated(shouldSeat); }
```

- [ ] **Step 2: Make the builder's sticky `top` depend on `seated`, with a transition.** Find the `frameRef` div's inline `style` (currently line 697). Change the `top` and add a `transition` for `top`. Replace the `position`/`top` portion:

```jsx
          style={{ opacity: 0, position: collapsed ? 'relative' : 'sticky', top: collapsed ? 'auto' : `${seated ? NAV_PX + BAR_OVERLAP : NAV_PX + SENTENCE_ZONE}px`, transition: 'top .32s cubic-bezier(.4,0,.2,1)', height: frameH, width: 'min(1240px, calc(100vw - 40px))', margin: '0 auto', borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #1B3050', borderBottom: 'none', boxShadow: '0 30px 80px rgba(0,0,0,0.55)', background: '#f8fafc' }}>
```

- [ ] **Step 3: Adjust `sectionH` so the reclaimed space is real (builder ends ~48px higher when seated).** Find the `sectionH` computation (currently line 672-674). Replace with:

```js
  // Seated pins the builder BAR_OVERLAP below the nav (vs SENTENCE_ZONE); the pinned content is
  // (SENTENCE_ZONE - BAR_OVERLAP) shorter, so shrink the track by that much when seated.
  const seatOffset = seated ? SENTENCE_ZONE - BAR_OVERLAP : 0;
  const sectionH = collapsed
    ? `${(H > 0 ? H : 0) + NAV_PX}px`
    : (H > 0 ? `calc(420vh + ${H + NAV_PX + SENTENCE_ZONE - seatOffset}px)` : 'calc(520vh)');
```

- [ ] **Step 4: Build + launch the harness** (see Background). Then write `/tmp/probe-seat.mjs`:

```js
import puppeteer from '/home/shaw/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
const page = await b.newPage(); await page.setViewport({ width: 1280, height: 1000 });
await page.goto('http://localhost:8799/', { waitUntil: 'networkidle2', timeout: 60000 });
for (let y=0;y<8000;y+=700){await page.evaluate(yy=>window.scrollTo(0,yy),y);await new Promise(r=>setTimeout(r,120));}
await page.waitForFunction(()=>{const f=document.querySelector('iframe[src*="builder"]');try{return f&&f.contentWindow.ArkEmbed&&f.contentWindow.ArkEmbed.ready&&f.contentWindow.ArkEmbed._desktopStory;}catch(e){return false;}},{timeout:30000});
const st=await page.evaluate(()=>{const f=document.querySelector('iframe[src*="builder"]');f.contentWindow.ArkEmbed.mapReady=()=>true;return f.closest('section').getBoundingClientRect().top+window.scrollY;});
const vh=await page.evaluate(()=>document.documentElement.clientHeight);const pin=4.2*vh;
const frameTop=()=>page.evaluate(()=>{const f=document.querySelector('iframe[src*="builder"]');return Math.round(f.closest('div').getBoundingClientRect().top);});
// far above pin (rising): builder pinned low (~124)
await page.evaluate(y=>window.scrollTo(0,y),Math.round(st-600)); await new Promise(r=>setTimeout(r,500));
console.log('rising  builderTop =', await frameTop(), '(expect ~124-ish band-above)');
// pinned + a beat in: builder slid up (~76)
await page.evaluate(y=>window.scrollTo(0,y),Math.round(st+0.15*pin+4)); await new Promise(r=>setTimeout(r,700));
console.log('seated  builderTop =', await frameTop(), '(expect ~76)');
await page.close(); await b.disconnect();
```

Run: `node /tmp/probe-seat.mjs 2>&1 | grep -vE "brandfetch|ERR_FAILED|Base44|guidelines|status of"`
Expected: `rising builderTop` ≈ 124 (or higher while still rising); `seated builderTop` ≈ 76.

- [ ] **Step 5: Commit.**

```bash
git add src/components/home/BuilderScrollDemo.jsx
git commit -m "feat(desktop demo): slide builder up behind the sentence bar on seat"
```

---

## Task 3: Give the seated bar an opaque dark cover (so it hides the top bar)

**Files:**
- Modify: `src/components/home/BuilderScrollDemo.jsx`

- [ ] **Step 1: Toggle a `bsd-seated` class on the SECTION (not the caption — caption className is rewritten by JS).** Find the `<section ref={trackRef} ...>` (currently line 689). Add a `className`:

```jsx
      <section ref={trackRef} className={seated ? 'bsd-seated' : undefined} style={{ height: sectionH, position: 'relative', boxSizing: 'border-box', paddingTop: collapsed ? `${NAV_PX}px` : 0, background: '#060D1A', borderTop: '1px solid #101E33' }}>
```

- [ ] **Step 2: Add the seated-cover CSS.** In the inline `<style>` block, after the `.bsd-cap .bsd-chip{...}` rule (currently line 687), add:

```css
        /* SEATED: the bar covers the builder's top bar → it needs its OWN opaque dark fill (the
           unseated band is transparent, showing the dark page). Keyed off the SECTION class so the
           caption's own JS-rewritten className can't drop it. Shadow makes it read as a ribbon
           floating OVER the app, not a header row. Height grows to fully cover the ~44px top bar. */
        section.bsd-seated .bsd-cap{background:#060D1A;height:${SENTENCE_ZONE}px;box-shadow:0 8px 20px rgba(0,0,0,0.45);border-radius:10px}
```

- [ ] **Step 3: Build + relaunch harness. Write `/tmp/probe-cover.mjs`** (same boot preamble as probe-seat.mjs through the `pin` line, then):

```js
// pinned + beat 0 shown: the caption band should be opaque dark AND cover the builder top bar row
await page.evaluate(y=>window.scrollTo(0,y),Math.round(st+0.15*pin+4)); await new Promise(r=>setTimeout(r,700));
const s = await page.evaluate(() => {
  const cap = document.querySelector('.bsd-cap');
  const cs = getComputedStyle(cap);
  const capR = cap.getBoundingClientRect();
  const f = document.querySelector('iframe[src*="builder"]');
  // the builder top bar is the iframe's .topbar; its viewport top:
  let barTop=null,barBot=null; try{const tb=f.contentWindow.document.querySelector('.topbar');const br=tb.getBoundingClientRect();barTop=Math.round(f.getBoundingClientRect().top+br.top);barBot=Math.round(f.getBoundingClientRect().top+br.bottom);}catch(e){}
  return { bg: cs.backgroundColor, opacity: cs.opacity, capTop: Math.round(capR.top), capBot: Math.round(capR.bottom), barTop, barBot };
});
console.log(JSON.stringify(s));
console.log('cover check:', (s.bg!=='rgba(0, 0, 0, 0)' && s.capTop<=s.barTop && s.capBot>=s.barBot-2) ? '✅ bar fully covered by opaque dark cap' : '⚠️ not covered');
```

Run and expect: `bg` is a solid dark rgb (not transparent), and the caption's top/bottom span covers the builder `.topbar` row → "✅ bar fully covered".

- [ ] **Step 4: Commit.**

```bash
git add src/components/home/BuilderScrollDemo.jsx
git commit -m "feat(desktop demo): opaque dark cover on the seated sentence bar (hides top bar)"
```

---

## Task 4: Per-beat bar fade — reveal the top bar between beats (Option 2)

**Files:**
- Modify: `src/components/home/BuilderScrollDemo.jsx`

- [ ] **Step 1: Record when each beat's sentence is shown.** In `preshowCaption(k)` (find `const preshowCaption = useCallback((k) => {`), add at the top of the function body:

```js
    lastCapAtRef.current = performance.now();
```

- [ ] **Step 2: Replace the band-opacity logic in `frame()` to fade the whole bar between beats when seated.** Find the block (currently lines 539-545) starting with the comment `// BAND opacity: fades in on scroll-entry...`. Replace the whole `if (captionRef.current) { ... }` with:

```js
    // BAND opacity. Pre-seat (rising / hero): fade in with the builder on entry. Seated (Option 2):
    // the bar COVERS the real top bar, so between beats we fade the whole bar out to REVEAL the top
    // bar (Generate/Save) — reinforcing "full live app" — then re-cover for the next beat. Guards
    // against strobe: only reveal after SEAT_HOLD_MS idle since the last sentence AND when the next
    // beat isn't imminent (within CAPTION_LEAD of its threshold). Hidden entirely once explored/past.
    if (captionRef.current) {
      let capOp;
      if (collapsedRef.current || armedRef.current || p >= 0.90) capOp = 0;
      else if (topBeatRef.current < 0) capOp = String(entry); // pre-seat hero rise
      else if (!seatedRef.current) capOp = 1;
      else {
        const nextBeat = BEATS.find((b, i) => i > topBeatRef.current && p >= b - CAPTION_LEAD);
        const imminent = nextBeat !== undefined && !appliedRef.current.has(BEATS.indexOf(nextBeat));
        const idle = performance.now() - lastCapAtRef.current > SEAT_HOLD_MS;
        capOp = (idle && !imminent) ? 0 : 1; // reveal the top bar only when idle between beats
      }
      captionRef.current.style.opacity = String(capOp);
    }
```

- [ ] **Step 3: Ensure the bar re-covers before the next beat fires.** The beat pre-show already calls `preshowCaption` which sets `lastCapAtRef` (making the bar opaque again). No new code — verify in Step 4 that the top bar is covered again during each beat.

- [ ] **Step 4: Build + relaunch harness. Write `/tmp/probe-fade.mjs`** (boot preamble through `pin`, then sample the caption opacity over a slow scroll through beats):

```js
const capOp=()=>page.evaluate(()=>getComputedStyle(document.querySelector('.bsd-cap')).opacity);
const results=[];
for (const [lbl,p,settle] of [['beat0',0.12,400],['gap0-1',0.20,900],['beat1',0.33,400],['gap1-2',0.44,900],['beat2',0.56,400]]) {
  await page.evaluate((y)=>window.scrollTo(0,y),Math.round(st+p*pin+4));
  await new Promise(r=>setTimeout(r,settle));
  results.push(`${lbl} (p=${p}): capOpacity=${await capOp()}`);
}
results.forEach(r=>console.log(r));
```

Run and expect: at each `beatN` sample capOpacity ≈ 1 (bar covering the top bar); at each `gapN-N+1` sample (idle >280ms mid-gap) capOpacity ≈ 0 (top bar revealed). If a gap still reads 1, the idle/imminent guard needs tuning — acceptable to note for on-device.

- [ ] **Step 5: Commit.**

```bash
git add src/components/home/BuilderScrollDemo.jsx
git commit -m "feat(desktop demo): per-beat bar fade reveals the real top bar between beats (Option 2)"
```

---

## Task 5: Reverse + regression + full verify, then deploy

**Files:**
- Modify: none (verification + deploy)

- [ ] **Step 1: Build + relaunch harness. Write `/tmp/probe-reverse.mjs`** (boot preamble through `pin`) to confirm un-seat on scroll-up and that the deal story is intact:

```js
const read=()=>page.evaluate(()=>{
  const f=document.querySelector('iframe[src*="builder"]');
  const d=f.contentWindow.document;
  const checked=[...d.querySelectorAll('.cbrow input:checked')].map(i=>i.parentElement.textContent.trim());
  return { builderTop:Math.round(f.closest('div').getBoundingClientRect().top), reach:f.contentWindow._reach, checked };
});
// forward through all beats
for (const [lbl,p] of [['b0',0.15],['b1',0.34],['b2',0.56],['b3',0.76]]) { await page.evaluate(y=>window.scrollTo(0,y),Math.round(st+p*pin+4)); await new Promise(r=>setTimeout(r,1600)); const s=await read(); console.log(`${lbl}: builderTop=${s.builderTop} reach=${s.reach} checked=[${s.checked}]`); }
// scroll back ABOVE the pin → un-seat
await page.evaluate(y=>window.scrollTo(0,y),Math.round(st-600)); await new Promise(r=>setTimeout(r,700));
const up=await read(); console.log('above pin: builderTop =', up.builderTop, '(expect back to ~124 band-above, un-seated)');
```

Run and expect: reach steps `395936 → 28928 → 4360 → 128`, checked filters accumulate (Homeowner → +FL etc.), `builderTop` ≈ 76 while seated, and back to ≈ 124 above the pin.

- [ ] **Step 2: Confirm mobile/tablet + standalone untouched.** Write `/tmp/probe-mobile.mjs`:

```js
import puppeteer from '/home/shaw/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
const page = await b.newPage(); await page.setViewport({ width: 800, height: 900 }); // <960 → mobile path
await page.goto('http://localhost:8799/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r=>setTimeout(r,1500));
const s=await page.evaluate(()=>({ hasBsdCap: !!document.querySelector('.bsd-cap'), hasMobileSentence: !!document.querySelector('iframe[src*="builder"]') }));
console.log('mobile (<960): bsd-cap present =', s.hasBsdCap, '(expect false — MobileSentenceDemo path, no desktop band)');
await page.close(); await b.disconnect();
```

Run and expect: `bsd-cap present = false` (the `<960px` path renders `MobileSentenceDemo`, which has no `.bsd-cap`). Confirms desktop-only.

- [ ] **Step 3: Deploy to production** (unblocked `shawcole` site) and verify live:

```bash
cd ~/repos/ark-data-web && netlify deploy --prod --dir=dist --no-build --site d38e2137-d97d-42ae-b719-d6581902f5a2 2>&1 | grep -iE "Production URL|Finished uploading [0-9]|Error"
cb=$(date +%s); echo "live bundle:"; curl -s "https://arkdata.io/?cb=$cb" | grep -oE 'index-[^"]+\.js' | head -1
```
Expected: Production URL `https://arkdata.io`; live bundle hash matches the local `dist/assets/index-*.js`.

- [ ] **Step 4: Stop the harness.**

```bash
pkill -f "http.server 8799" 2>/dev/null; for pid in $(pgrep -f "chrome-linux64/chrome"); do kill "$pid" 2>/dev/null; done; echo done
```

- [ ] **Step 5: Hand off to Shaw for on-device judgment.** Report: seat slide (~48px reclaim), the per-beat reveal cadence (SEAT_HOLD_MS=280 tunable), and the seated bar's shadow/breathing (BAR_OVERLAP=6 tunable). These feel-values are Shaw's call on a real desktop screen.

---

## Notes for the implementer

- **Do NOT touch** `MobileSentenceDemo.jsx`, the `<960px` branch, or `public/builder/*`. The top bar is covered by a parent-page element only; it is never hidden or removed (Generate/Save stay functional).
- The caption's own className is rewritten by `buildCaption`/`renderCaptionOnly`/`preshowCaption` — that is WHY the seated background is keyed off `section.bsd-seated` and not a class on `.bsd-cap`. Do not move it onto `.bsd-cap`.
- `frame()` sets `frameRef`/`captionRef` opacity imperatively every tick; React re-renders (from `seated`/`collapsed` state) only change `top`/className/height — the next `frame()` re-applies opacity. This is the existing pattern for `collapsed`; follow it.
- Feel-values to leave easily tunable at the top of the file: `BAR_OVERLAP` (6), `SEAT_HOLD_MS` (280), the seat transition duration (`.32s`).
