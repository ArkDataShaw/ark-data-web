# Desktop deal-story demo — design spec

**Date:** 2026-07-10
**Author:** arkdata-web-opus-3 (with Shaw)
**Repo:** `ark-data-web` (main) → arkdata.io
**Status:** Approved for planning

## 1. Goal

Bring the **DESKTOP** homepage builder demo (`src/components/home/BuilderScrollDemo.jsx`,
device viewport ≥960px) to the same **per-stage deal-story flow** as the shipped mobile/tablet
demo: the audience visibly narrows chapter-by-chapter, with map, coverage, count, and **every
visible chart** updating live per stage — but in the desktop's wide two-pane, chip-based shape,
driven by a bespoke caption + chip-fly-in overlay.

The current desktop path (apply-all-filters → chip-clone fly-in → generate one frozen final
snapshot → scroll-depth fade) is replaced by a beat-driven story that reuses mobile's proven
full-height scroll shell and the surface-agnostic paint engine in `public/builder/`.

**`src/components/home/MobileSentenceDemo.jsx` is NOT modified.** Mobile is shipped and stays
byte-for-byte as-is except where the global purple restyle (§7) touches shared builder CSS.

## 2. Views affected (standing instruction — log per change)

| Change | DESKTOP | TABLET | MOBILE | /Demo |
|---|---|---|---|---|
| Rewrite desktop path → beat-driven full-height story | ✅ | — | — | — |
| New `public/builder/stages-pool-desktop.json` (4 stages, full distributions) | ✅ | — | — | — |
| Additive desktop beat fns in `public/builder/embed-script.js` | ✅ | — | — | — |
| Caption + chip-fly-in overlay (new parent UI) | ✅ | — | — | — |
| Purple chip restyle (builder `.chip` + mobile sentence highlights + clone constants) | ✅ | ✅ | ✅ | ✅ |

TABLET = builder iframe width 680–1000px (mobile component's `ark-fullheight` 2-col tier).
MOBILE = builder iframe width <680px. All builder `@media` are container/iframe-width, not
device-width. The only device-viewport query is the ≥960px React switch in `BuilderScrollDemo.jsx`.

## 3. The deal story — beats, captions, chips

Four beats, discrete replacing captions. Beat 0 is the big/bold hero centered over the stage
(pre-data-load); beats 1–3 are a smaller caption line above the builder. Each caption's **purple
filter chips fly down into the builder's real strip** while the connecting words fade out; the
next caption then comes in.

| Beat | Caption (chips in `[ ]`) | Chips → strip | Map | Reach |
|---|---|---|---|---|
| 0 (hero) | *"Show me all `[Homeowners]` searching for `[Pool Construction]`"* | Homeowners, Pool Construction | US state choropleth | **395,936** |
| 1 | *"Who live in `[Florida]`"* | Florida | zoom FL + flip to County/ZIP | **23,283** |
| 2 | *"Specifically `[Ft. Lauderdale]` and `[Miami]`"* | Ft. Lauderdale, Miami | zoom South-FL | **3,477** |
| 3 | *"with `[Net Worth: $1M+]`"* | Net Worth $1M+ | full-density release (stays framed on SFL) | **95** |

Beats keyed to pin-fraction `p` over the pin range. Starting spacing to tune on staging:
`[0.05, 0.30, 0.52, 0.72]`. A per-beat min-gap throttle (mobile uses 350ms) prevents two
fly-ins colliding on a fast scroll.

### Chip-fly-in mechanism
Adapt the existing clone machinery (`chipInfo()` rects, clone els, fly transforms) from
"all chips at once keyed to scroll windows" to "one caption's chips per beat, triggered by the
beat." On `beatOn(k)`:
1. Render the caption — connecting words + inline purple chip span(s) (big/bold for the hero).
2. Chip span(s) fly from caption position → real target rect in the strip (`chipInfo()`).
3. Connecting words fade out.
4. On landing, reveal the real strip chip (already placed by `applyStep`→`tagChips`, kept
   hidden); remove the flying clone. Map/coverage/count/charts have already updated via the
   beat's stage paint.

## 4. Reversibility (HARD REQUIREMENT)

The entire story must be fully reversible on scroll-up, matching mobile. On `beatOff(k)`:
- The strip chip for beat `k` hides; a clone flies back up into the reappearing caption, then
  the caption fades as scroll continues up.
- Map reverses (SFL→FL→US, County/ZIP→State), reach/coverage/count revert to the prior stage,
  and every chart repaints to the prior stage's distribution.
- `__arkScripted=true` keeps the scripted funnel owning reach/coverage so live re-agg cannot
  stomp baked per-stage numbers on scroll-up.
- Reversal holds all the way back to beat 0 and out (empty → hero caption again).

No latched one-way state during the story phase. State only latches when the visitor taps
"explore" (collapse + hand off live filtering); before that, scroll direction is authoritative.

## 5. Data — `public/builder/stages-pool-desktop.json`

Re-capture **all 4 desktop stages fresh** in a single pass, baking the full `distributions`
object per stage + geo + coverage + reach. The insights endpoint
(`https://audience-builder-react.netlify.app/.netlify/functions/audience`, `action:insights`)
returns per query: `reach`, `geo.people.{states,counties,zips}`, `coverage.*`, and
`distributions.{age_gender, gender, married, children, homeowner, family, income_range,
net_worth, cities_people, ...}`. One call per stage yields everything each visible chart needs —
no patch scripts.

Stage specs (BASE = topic 7676 Pool Construction, consumer, 7days):

| idx | filters | reach |
|---|---|---|
| 0 | `checks.homeowner=[Homeowner]`, no loc | 395,936 (confirmed live) |
| 1 | `+ loc.personal.state=[FL]` | 23,283 |
| 2 | `+ loc.personal.zip=SFL_ZIPS` (Miami+FtLaud metros) | 3,477 |
| 3 | `+ checks.networth=[more than $1,000,000]` | 95 |

Bake per-ZIP density (`zips`) only for the zip-scoped stages (2, 3) — those beats zoom to ZIP
level and need immediate shading; nationwide/FL stages stay state/county zoom (spec §5 of
capture script). `snapshot-pool.json` (final audience, with baked real geoPoll) is UNCHANGED —
desktop reuses it for `generate()` prewarm + the beat-3 full-density release.

Capture: extend `/tmp/capture-pool-funnel.py` (the 4-stage subset with `distributions` stored)
→ `public/builder/stages-pool-desktop.json`. Commit the final capture script to `scripts/` for
reproducibility.

## 6. Engine — additive desktop beats in `public/builder/embed-script.js`

Mobile `beatOn`/`beatOff` are untouched. Desktop and mobile never co-exist (device switch), and
each iframe loads its own stages file, so `_stages` is independent per iframe. Add
`beatOnDesktop(k)` / `beatOffDesktop(k)` (or a selectable beat script) that reuse every existing
primitive: `_preSetReach`, `applyStep` (composing topic+homeowner for b0), `_setStageMeta`,
`_paintStage`, `fitMapToScope`, `_flipToFull`/`_flipToState`, `releaseGeo`.

Desktop beat map:
- **b0** → apply `topic` + `homeowner`; paint stage 0; nationwide State choropleth.
- **b1** → apply `FL`; paint stage 1; zoom FL + flip to County/ZIP.
- **b2** → apply `metros`; paint stage 2; zoom South-FL.
- **b3** → apply `networth`; paint stage 3; `releaseGeo()`.

### All visible charts update per beat (desktop requirement)
Desktop shows more charts than mobile, so the desktop stage paint must repaint **every
consumer-visible card** each beat, not just mobile's four. Extend the per-stage chart paint to
cover:
- Top States / Top Cities (`hbars` — existing)
- Age & Gender pyramid (`renderPyramid` — existing)
- **Household Income** (`incomeBars` vbars — NEW per-stage)
- **Net Worth** (`networthBars` vbars — NEW per-stage; collapses to 100% >$1M at b3)
- Homeownership donut (`renderHomeDonut` — existing; 100% owner from b0)
- Family Dynamics donut (`renderFamily` — existing)

B2B cards (company size, revenue, seniority, department, industry, titles) stay hidden for the
b2c audience. Each chart is guarded (paint-once-per-stage key) so per-tick reasserts don't
re-trigger grow animations. Chart update animations appear-at-target, not grow-from-zero
(builder spec B1); donuts tween (B2). Reasserts repaint any chart a stray render blanked
mid-story (mobile's `reassert` pattern, extended to income + net worth).

## 7. Purple restyle (builder CSS — all surfaces + /Demo)

Match the real app's chip color (`.pk-chip`: bg `--violet-50 #f5f3ff`, text `--violet #7c3aed`):
- `public/builder/index.html` `.chip` → bg `#f5f3ff`, text `#7c3aed`, group-label bold (0.75
  opacity). Exclusion chips keep their red treatment.
- Mobile sentence filter highlights → same purple.
- Parent fly-in clone constants (`CHIP_STYLE` in `BuilderScrollDemo.jsx`) → purple to match.
- Free-play chips inherit the new style. Affects DESKTOP + TABLET + MOBILE + full-screen /Demo.

## 8. Parent rewrite — `BuilderScrollDemo.jsx` (desktop path)

Replace the fixed-viewport pin (`440vh` + sticky `100vh`) with mobile's full-height model:
- Boot: `loadSnapshot` + `loadStages('/builder/stages-pool-desktop.json')` + `enableFullHeight`
  + `holdGeo=true` + `__arkScripted=true` + `ark-data-hidden`.
- Section = full-content-height sticky iframe: pins through the story (strip + map + coverage +
  first insights visible, beats updating everything), then releases to native page scroll
  through the remaining charts + records. Section height = pin-range + builder-H + nav gap.
- Scroll `frame()`: compute `p` over the pin range (use `documentElement.clientHeight`, not
  `innerHeight`); drive `beatOnDesktop`/`beatOffDesktop` with the min-gap throttle; `generate()`
  after beat 0; `reassert()` + `setDataReveal()` per tick; `releaseGeo()` at b3.
- Caption + chip-fly-in overlay (§3) layered over the pinned stage.
- Explore/collapse/CTA ported from mobile: "● LIVE — click to explore" → collapse phantom
  pin-range + `__arkScripted=false`; ✕ re-locks. Desktop uses pointer events (no touch-forward
  tap-tooltip needed; the iframe can take pointer events directly once armed).

Verify `ark-fullheight` applies no mobile-only rule at desktop iframe widths before shipping;
if it does, gate those rules by width so desktop gets full-height layout without the mobile
2-col tablet tier.

## 9. Verification

Iterate on **staging** (`arkdata-brainstorm-761.netlify.app`, site
`6553894a-410f-44b4-87e5-82dc8aa472ec`) first. Headless probe (Chrome :9222, viewport
1280×1000, reach into the same-origin builder iframe, stub `mapReady`, drive
`beatOnDesktop(k)` / scroll):
- Each beat narrows: reach 395,936 → 23,283 → 3,477 → 95; coverage drops; map US→FL→SFL;
  County/ZIP from b1; full-density at b3.
- **Every visible chart shifts each beat** (Top states→cities, Age, Income, Net Worth,
  Homeownership 100% owner from b0, Family); Net Worth 100% >$1M at b3.
- Chips are purple; fly-in lands on strip rects; captions replace correctly.
- **Full reversibility**: scroll-up unwinds every beat back to the hero.
Scroll FEEL (momentum/pacing) is judged by Shaw on-device — headless verifies MECHANICS only.
Deploy to arkdata.io only after staging + on-device sign-off (note the Netlify billing blocker).

## 10. Risks / open items

- `ark-fullheight` desktop-width behavior (verify; gate mobile-only rules by width if needed).
- Insights API availability at capture time (confirmed live 2026-07-10).
- Net Worth chart at b3 must read as a clean 100% >$1M collapse, not a broken single bar.
- Deploy blocked by arkdata.io Netlify credit 403 until Shaw adds credits (out of scope here).
