# Audience Builder — Layout & Chart-Loading Spec (port + verify)

**Purpose.** This is a complete, implementation-level spec of every layout rule and chart-loading
rule that was changed on the web-hosted iframed Audience Builder during the 2026-07 homepage-demo
work. Follow it to bring any *previous* version of the builder to parity, then verify each item.

**Two surfaces — read this first.** The builder ships in two modes and the changes split across them:

- **CORE builder** (`public/builder/index.html`): the real audience builder. All the *layout* rules
  and the `renderCharts`/`animateCharts` *loading* rules below apply to EVERY version.
- **SCRIPTED demo layer** (`public/builder/embed-script.js`, active only with `?script=1`): drives the
  homepage scroll story. The "per-stage live painting", "full-height native scroll", and "prewarm"
  items are demo-only. A plain builder version that has NO embed-script only needs the CORE items.

Each item is tagged **[CORE]** or **[DEMO]**. Port CORE to all versions; port DEMO only to versions
that host the scripted embed. Every item has **Rule**, **Where**, and **Verify**.

Terminology: the insights grid is a 12-column CSS grid (`.insights` / `#insightsGrid`). Card spans:
`.span2` = span 6 (half), thirds = span 4, quarters = span 3, firmo pair = span 12.

---

## A. INSIGHTS GRID LAYOUT RULES  [CORE]

### A1. Insights order is a standalone function (income ↔ home/family row swap)
- **Rule.** The B2C insights order must place **Age & Gender + Homeownership + Family Dynamics on row 1**
  and **Net Worth + Household Income on row 2**. (Two quarter cards = one half card, so both rows stay
  clean 12-col rows.) The ordering logic MUST live in a reusable function `applyInsightsOrder()`, called
  at the end of `renderCharts()` (and by the demo — see D-items), not inlined only in `renderCharts`.
- **Where.** `index.html`, new global `function applyInsightsOrder(){…}` + `window.applyInsightsOrder=…`.
  - B2C ORDER array: `['card-age','card-home','card-family','card-networth','card-income','card-cities','card-seniority','card-department','card-industry','card-titles','pair-firmo']`
  - B2B ORDER unchanged: `['card-seniority','card-department','card-cities','card-industry','card-titles','pair-firmo','card-home','card-family','card-age','card-income','card-networth']`
  - Applies `el.style.order = i` for each id in order.
- **Verify.** At the reveal on a B2C audience ≥821px wide: `#card-age`, `#card-home`, `#card-family`
  share the same `getBoundingClientRect().top` (row 1); `#card-networth`, `#card-income` share a lower
  top (row 2). `getComputedStyle(card).order` matches the array index.

### A2. Top States → Top Cities swap when a state filter is active
- **Rule.** In the **maprail geo card** (the card whose header is `#topStatesH`, body `#topStates`):
  if ANY geo group has a state selected, show **Top Cities** (header text `"Top cities"`, or
  `"Top cities (HQ)"` when `geoBasis==="company"`) built from `A.citiesPeople`/`A.citiesCompany`;
  otherwise show **Top States** as before. When cities is promoted here, the insights-grid
  `#card-cities` must be HIDDEN (no duplicate).
- **Where.** `index.html`:
  - New global helper `function hasStateSel(){ return ['personal','professional','company'].some(g => S.loc?.[g]?.state?.size>0); }` (wrap in try/catch → false).
  - In `renderCharts()` geo section: branch on `hasStateSel()` for `#topStates` content + header.
  - Same branch mirrored in the ESTIMATE path (the `if(!A&&window._mapRows…)` block).
  - `#card-cities` visibility: `SHOW('card-cities', !hasStateSel() && _citiesOn)`.
- **Verify.** Select a state → `#topStatesH` reads "Top cities", `#topStates` lists cities, `#card-cities`
  is `display:none`/`.hidden`. Clear the state → header reverts to "Top states", `#card-cities` returns.

### A3. Seniority/Department reflow to halves when cities is promoted
- **Rule.** When cities is promoted (A2), `#card-cities` leaves its 3-across row, stranding
  Seniority + Department as two narrow thirds. Reflow them to **span 6 each** (2 even columns) to match
  the Industries/Job-titles row. Only >820px (single-column below).
- **Where.** `index.html`:
  - CSS (inside `@media(min-width:821px)`): `.insights.cities-promoted #card-seniority,.insights.cities-promoted #card-department{grid-column:span 6}`.
  - In `renderCharts()`: `document.getElementById('insightsGrid').classList.toggle('cities-promoted', hasStateSel() && _citiesOn)`.
- **Verify.** State selected, ≥821px: `#card-seniority` and `#card-department` widths equal a half card
  (≈ `#card-industry` width), same row. State cleared: they return to third-width.

### A4. Sparse-vbar row rebalance (quarter / three-quarter)
- **Rule.** In a **2-column insights row**, if EXACTLY ONE card is a *sparse vertical-bar chart*
  (its `.vbars` has 1–3 `.vb` bars) and its neighbor is not sparse, shrink the sparse card to a
  **quarter** (`.ins-narrow` = span 3) and grow the neighbor to **three-quarters** (`.ins-wide` = span 9).
  If BOTH are sparse OR both dense → leave half/half. Only >820px. Idempotent.
- **Where.** `index.html`:
  - CSS (inside `@media(min-width:821px)`): `.insights .card.ins-narrow{grid-column:span 3}` and `.insights .card.ins-wide{grid-column:span 9}`.
  - New global `function balanceSparseRows(){…}` + `window.balanceSparseRows=…`. Algorithm:
    1. reset `.ins-narrow`/`.ins-wide` off all direct grid children.
    2. bail if `matchMedia('(max-width:820px)').matches` (single column).
    3. group visible cards into rows by rounded `getBoundingClientRect().top` (±6px).
    4. for each row with exactly 2 cards: `sparse = c => c.querySelector('.vbars') && [1..3].includes(#.vb)`; if exactly one sparse → sparse gets `.ins-narrow`, other gets `.ins-wide`.
  - Called at end of `renderCharts()`, at end of `prewarmInsightCharts()` (D3), and on `window resize`.
- **Verify.** On the millionaire audience (Net Worth = single "$1M+" bar next to a full Household Income):
  Net Worth width ≈ ¼ grid (`.ins-narrow`), Household Income ≈ ¾ (`.ins-wide`), same row. Nationwide
  (both dense) → equal halves, no `ins-*` classes. Mobile ≤820px → both full width, no `ins-*`.

### A5. Family Dynamics legend = 2 columns
- **Rule.** The Family Dynamics legend must be TWO columns: **Married** header top-left, **Single**
  header top-right, each stacking **+kids** / **no kids** with swatch + % beneath → 3 rows tall
  (was 4 wide lines).
- **Where.** `index.html`:
  - `renderFamily()` legend HTML: build `.famdo-leg` containing two `.famdo-col`, each = `.lbl` (Married/Single) + two `.famdo-item` (+kids / no kids). (Old `.famdo-row`/`.famdo-items` structure removed.)
  - CSS: `.famdo-leg{display:flex;justify-content:center;gap:22px}` `.famdo-col{display:flex;flex-direction:column;gap:5px}` `.famdo-col .lbl{font-weight:700}` + container-query tighten at `@container (max-width:230px)`.
- **Verify.** Family card: two headers "Married"/"Single" on the same row; "+kids"/"no kids" stacked
  under each with correct swatch color (purple pair = Married, grey = Single) and %.

### A6. Coverage stat icons → bottom-right
- **Rule.** The small SVG icon in each coverage stat tile sits **bottom-right**, not top-right (large
  numbers were clipping over the top-right icon).
- **Where.** `index.html` CSS: `.stat .stat-ico{position:absolute;bottom:11px;right:11px;…}` (was `top:11px`).
- **Verify.** On the widest coverage number (e.g. 132,404 / 363,852): the number's bounding box does not
  intersect the `.stat-ico` box; icon top is below the number bottom.

### A7. "Companies" label (was "Unique companies")
- **Rule.** The 4th coverage tile label reads **"Companies"**. The label doubles as the `STAT_ICONS`
  lookup key, so BOTH must change or the icon breaks.
- **Where.** `index.html`: `STAT_ICONS` key `"Companies"` (was `"Unique companies"`); `coverageEntries()`
  entry `["Companies", c.uniqueCompanies ?? c.hasCompany]`.
- **Verify.** 4th tile label = "Companies", value unchanged, icon still renders.

### A8. Breadcrumb "Create" (was "Create New")
- **Rule.** Top-bar breadcrumb reads `Audiences › Create`.
- **Where.** `index.html`: `<div class="crumb">Audiences › <b>Create</b></div>`.
- **Verify.** Rendered breadcrumb bold text is "Create".

---

## B. CHART-LOADING RULES  [CORE]

### B1. Update animations APPEAR at target (no grow-from-zero)
- **Rule.** In `animateCharts(fromZero)`, on the **update path** (`fromZero===false`), a bar that has
  NO prior `_chartSnapshot` entry must START AT ITS TARGET value (appear in place), NOT at `0%`. Only the
  **intro** (`fromZero===true`) grows everything from zero. (The from-zero re-grow read as a spurious
  "loading phase" on already-populated charts.)
- **Where.** `index.html`, `animateCharts()` → `animBars()` inner loop. The start value line becomes:
  `var startV = i<old.length ? old[i] : (fromZero ? '0%' : targets[i]); bars[i].style[prop]=startV;`
  (was unconditional `i<old.length?old[i]:'0%'`).
- **Verify.** With `_chartSnapshot` missing a chart, call `renderCharts();animateCharts(false)` and sample
  a bar's rendered width ~40ms in: it is already at full size (mid/final ratio ≈ 1.0). With
  `animateCharts(true)`: bars start at ~0 (ratio ≈ 0.0).

### B2. Donut segments TWEEN in place (no clockwise re-sweep)
- **Rule.** `svgDonut()` must, when re-rendering the SAME donut (same segment-name signature + same
  segment count), **interpolate each segment's start/end angle** from its previous render to the new one
  (segments grow/shrink in place). Only a first render / changed segment set does the 420ms clockwise
  sweep-in. Cancel any in-flight animation on re-render.
- **Where.** `index.html`, `svgDonut()`:
  - Store on the container: `container._donut = { sig: segments.map(s=>s.name).join('|'), angles }`.
  - On entry compute `tween = prev && prev.sig===sig && prev.angles.length===angles.length`; `from = tween?prev.angles:null`.
  - In `draw(t)`: if tween, `a0 = from[i][0] + (a[0]-from[i][0])*t` (same for a1); else sweep `a[0]*t`.
  - `if(container._donutRaf)cancelAnimationFrame(container._donutRaf)` before starting; store the rAF id.
- **B2a (identity stability).** `renderHomeDonut()` must keep ALL three segments (Homeowner/Probable/Renter)
  in the ring **even when zero** (only the legend filters zeros), so the signature is stable across stages
  and Renter/Probable tween down to zero (instead of the segment set changing → re-sweep).
- **Verify.** Trigger a data change on a donut and sample total SVG path length ~90ms into the animation:
  ratio (mid/settled) ≈ 1.0 (ring stays full = tweening). Old behavior ≈ 0.2 (swept from ~0). Signature
  constant across stages.

---

## C. MAP RULE  [CORE]

### C1. Nationwide view fits the whole continental US
- **Rule.** The nationwide (no-scope) MapLibre view must `fitBounds` to a continental-US bbox, NOT a
  fixed zoom (a fixed `zoom:3.3` cropped the US on short/narrow map containers → the exact bug).
- **Where.** `index.html`, the MapLibre IIFE (`#mapFull`):
  - Const `var US_BOUNDS=[[-124.8,24.4],[-66.9,49.5]]`.
  - Map constructor: `bounds:US_BOUNDS, fitBoundsOptions:{padding:24}` (drop `center/zoom`).
  - On `map.on('load')` after `map.resize()`: `if(!_lastScopeKey||_lastScopeKey==='|') map.fitBounds(US_BOUNDS,{padding:24,duration:0})`.
  - `window.fitMapToScope(bbox,maxZoom,offset)` else-branch: `map.fitBounds(US_BOUNDS,{padding:24,duration:800})` (was `easeTo({center,zoom:3.3})`).
- **Verify.** Nationwide, at multiple viewport heights (e.g. iPad 1024, phone 844): `map.getBounds()`
  covers W≤−124.5, E≥−67, S≤24.6, N≥49.3. Selecting a state still zooms to that state; clearing re-fits US.

---

## D. SCRIPTED-DEMO LOADING RULES  [DEMO]  (only for versions hosting `embed-script.js`)

### D1. Per-stage LIVE painting of the story charts
- **Rule.** During the scripted story the embed paints, per stage, from baked stage data (not just at the
  final reveal): **Coverage** counts, **Top States/Cities** (state-aware, see A2), **Age & Gender** pyramid,
  **Homeownership** donut, **Family Dynamics** donut. All must update every chapter.
- **Where.** `embed-script.js`, `_paintStageCharts(idx)` + `_setStageMeta(idx)`:
  - Top states/cities: mirror `hasStateSel()`; state selected + `st.cities` → `hbars('topStates', st.cities)`, header "Top cities"; else states. Also `SHOW('card-cities', false)` + toggle `insightsGrid.cities-promoted` in sync (A2/A3 during story).
  - Age: `renderPyramid({ageGender: scaledAgeGender(st.ageGender, st.reach)})`.
  - Home/Family: `renderHomeDonut({homeowner: st.homeowner})`, `renderFamily({family: st.family})`.
  - Guard with `_paintedMetaKey` so per-tick reasserts don't re-trigger animations.
  - `reassert()` blank-check must cover Top States, `#agePyramid`, `#homeownerBars`, `#familyDonut` — if
    any is blank mid-story, force `_paintedMetaKey=-1` and repaint ALL.
- **Data.** Stages (`stages-pool.json`) must carry per-stage `ageGender`, `cities`, `homeowner`, `family`
  (baked from the DataMoon insights endpoint `distributions`). Homeowner/family render as % → raw baked
  counts are fine; age is scaled to `st.reach`.
- **Verify.** Scroll each chapter: coverage narrows, top states→FL cities, age shape shifts (millionaire
  skews older/male), homeowner donut flips to 100% at the homeowner beat, family mix shifts. Reverse on
  scroll-up mirrors.

### D2. Insights order applied DURING the story
- **Rule.** The demo skips `renderCharts`, so it must call `applyInsightsOrder()` (A1) itself during the
  per-stage paint — otherwise the grid stays in default DOM order (income beside Age instead of Home/Family).
- **Where.** `embed-script.js`, end of `_paintStageCharts`: `if(typeof applyInsightsOrder==='function') applyInsightsOrder();`.
- **Verify.** At every stage (not just reveal): Age's row = `[Age | Home | Family]`, never Household Income.

### D3. Prewarm static below-fold charts (no "Calculating…" on scroll)
- **Rule.** Charts whose data is final-audience-only (income, net worth, seniority, department, industries,
  job titles, company size, company revenue) must be **pre-rendered from the baked snapshot agg at
  generate**, so they're already populated (just hidden by opacity) before the visitor scrolls to them —
  no loading placeholder then load.
- **Where.**
  - `index.html`: new global `window.prewarmInsightCharts(A)` — renders ONLY those 8 static charts from a
    supplied agg (NOT coverage/topStates/age/home/family, which are per-stage/story-owned), then calls
    `applyInsightsOrder()` + `balanceSparseRows()`.
  - `embed-script.js`, in `generate()`: once, retry until `canned.responses.geoPoll.body.agg` + the helper
    exist, then `prewarmInsightCharts(agg)`; guard with `_prewarmed`.
- **Verify.** Early in the story (stage 0/1) all 8 charts are populated (no `.pk-empty`), and stay populated
  through the reveal. Story charts remain per-stage (unaffected).

### D4. Reveal opacity keeps story charts visible; skips them in setDataReveal
- **Rule.** Full-height demo: the maprail card, Age & Gender, Homeownership, Family Dynamics are the LIVE
  narration — visible the whole story (CSS opacity:1), not faded in only at the end. The insights grid below
  fades in at the reveal as before.
- **Where.** `embed-script.js`:
  - Reveal CSS: `body.ark-fullheight.ark-data-hidden #previewArea .maprail .card{opacity:1}` and same for
    `#card-age`, `#card-home`, `#card-family`.
  - `setDataReveal()`: for `body.ark-fullheight`, skip (clear inline opacity) any card matching
    `.maprail`, `#card-age`, `#card-home`, `#card-family` — inline opacity would override the reveal CSS.
- **Verify.** Sweep opacity across the pin range: map/coverage/topStates/age/home/family = 1 the whole
  story; income/networth/etc. fade in only near the reveal.

---

## E. FULL-HEIGHT NATIVE-SCROLL MODE  [DEMO]  (mobile scroll host only)

### E1. `ark-fullheight` body class
- **Rule.** `ArkEmbed.enableFullHeight()` adds `body.ark-fullheight`; CSS `body.ark-fullheight .shell{height:auto}`
  and `.main{overflow:visible;height:auto}` make the builder lay out at full content height (so the parent
  can host it as a sticky, full-height, non-internally-scrolling iframe). Also gates all the tablet layout
  rules below.
- **Where.** `index.html` CSS + `embed-script.js` `enableFullHeight()`/`fullHeight()`.
- **Verify.** With the class, `.main` `overflow-y` is `visible` and `documentElement.scrollHeight` = full content.

### E2. Tablet maprail row + coverage fill (iframe width 680–1000px)
- **Rule.** `@media (min-width:680px) and (max-width:1000px)` under `body.ark-fullheight`:
  - `.maprail{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:stretch}` — Coverage + Top States/Cities side by side (Intent dropped: `body.ark-fullheight #card-intent{display:none}`).
  - `.maprail .card{height:var(--ark-cardh,182px);min-height:0}` — the parent measures one `.insights .card` and sets `--ark-cardh` so the maprail row matches the insight cards' height.
  - Coverage-fill class `.ark-cov-fill` (parent-applied on tablet): `.statrow{flex:1;grid-auto-rows:1fr}` + enlarged numbers `.stat .n{font-size:28px}` so the Coverage card fills below the map.
- **Verify.** iPad (iframe ≈680–1000px): maprail is 2 equal columns; row height == an insight card's height;
  coverage numbers 28px filling the card. Phone (<680px): maprail stacked.

### E3. Demo declutter (hidden in `ark-fullheight`)
- **Rule.** In the demo, hide: `.pvtop` (auto-name title bar), `.notebar` (map caption), `#card-intent`.
- **Where.** `index.html` CSS under `body.ark-fullheight`.
- **Verify.** None of these render in the demo; they DO render in the standalone builder.

---

## F. TOOLTIPS  [CORE for tipBind; DEMO for tap-forward]

### F1. Tap tooltips on every chart type
- **Rule.** Every chart bar/segment binds BOTH hover (`mouseenter`) AND a tap handler, via a shared
  `tipBind(el, ctl, dataFn)`. Applies to hbars `.fill`, vbars `.vb` (both variants), pyramid `.pyr-bar`,
  donut `path`.
- **Where.** `index.html`: `function tipBind(el,ctl,dFn)` — binds mouseenter + stores `el._tapTip` + a
  `touchstart` listener. All chart render fns use `tipBind` instead of raw `addEventListener('mouseenter')`.
  `chartTipCtl` gains a touch-anchored `enter(d, el)` + auto-dismiss.
- **F1a [DEMO].** Because the demo iframe is `pointer-events:none` (scroll passes through), the PARENT
  forwards genuine taps: `ArkEmbed.tapTooltipAt(x,y)` does `elementFromPoint` and calls the hit bar's
  `_tapTip()`. `ArkEmbed.dismissTip()` clears. Parent detects tap = touchend with <10px move & <500ms.
- **Verify.** Tap any bar (hover on desktop) → tooltip with `label / value (pct%)`; auto-dismiss ~2.6s or
  on tap elsewhere. All chart types covered.

### F2. Bar-thickness ladder must ignore the tooltip node
- **Rule.** The `.hbars-wrap` row-count thickness selectors must NOT use `:last-child` (the tooltip is
  appended as a trailing child and broke the match → bars snapped thinner on hover). Use
  `:has(> .bar:nth-child(N)):not(:has(> .bar:nth-child(N+1)))`.
- **Where.** `index.html` CSS: `.hbars-wrap:has(> .bar:nth-child(4)):not(:has(> .bar:nth-child(5))) .track{height:22px;…}` and the `:nth-child(5)/(6)` variant for 19px.
- **Verify.** A 4-bar chart's `.track` height stays 22px before AND after a tooltip is inserted.

### F3. Remove the "◌" glyph from the Generating button
- **Rule.** `setGenerating(true)` sets the button text to `"Generating…"` — NOT `"◌ Generating…"` (the
  dotted-circle glyph wrapped to its own line on the narrow mobile button, looking like a stray spinner).
- **Where.** `index.html`, `setGenerating`: `gb.textContent = on ? "Generating…" : "▶ Generate"`.
- **Verify.** During generate the button reads "Generating…" with no leading glyph; single line.

---

## G. PORT CHECKLIST (per builder version)

1. Determine surface: does this version host `embed-script.js`? If NO → implement only [CORE] items
   (A1–A8, B1–B2, C1, F1(core)/F2/F3). If YES → also implement [DEMO] items (D1–D4, E1–E3, F1a).
2. CORE structural: add `applyInsightsOrder()`, `hasStateSel()`, `balanceSparseRows()`,
   `prewarmInsightCharts()` (if demo) as globals; wire calls at end of `renderCharts()` + resize.
3. CORE CSS: add `.ins-narrow/.ins-wide` (in the ≥821px media block), `.cities-promoted` reflow,
   `.famdo-col` legend, `.stat-ico` bottom-right, the `:has():not()` thickness ladder. Update
   `renderFamily` legend HTML, `renderHomeDonut` (keep zero segments), `svgDonut` (tween), `animateCharts`
   (appear-at-target), `coverageEntries`/`STAT_ICONS` ("Companies"), map IIFE (`US_BOUNDS`).
4. DEMO: `_paintStageCharts` per-stage age/home/family/cities + `applyInsightsOrder`; `generate()` prewarm;
   reveal CSS + `setDataReveal` skips; `ark-fullheight` + tablet maprail; tap-forward (`tapTooltipAt`).
5. Data: ensure `stages-pool.json` carries `ageGender`, `cities`, `homeowner`, `family` per stage.
6. Run every **Verify** above. A change is DONE only when its Verify passes.

## H. Reference implementation
The canonical, verified implementation of all of the above is the current
`public/builder/index.html` + `public/builder/embed-script.js` on `main`
(`ArkDataShaw/ark-data-web`, merged 2026-07-09/10). Diff a target version against these two files to
see the exact deltas; this doc is the human-readable rulebook for that diff.

---

## I. ADDENDUM — Width Tiers & Sentence Geo Rule (answers to fable-html-audience-builder, 2026-07-10)

Two under-specified areas, answered against the canonical `public/builder/index.html` on `main`.

### I.1 WIDTH TIERS — which builder width each rule applies to

**Foundational fact: all `@media` in the builder are CONTAINER-width, not device-width.**
The builder runs inside an `<iframe>`. An iframe establishes its own viewport, so every `@media
(min/max-width…)` inside `index.html` evaluates against **the iframe's own rendered width = the
container width** (the width the host gives the iframe). There is NO separate "device viewport"
inside the builder. So when this spec says "builder width" it means the iframe/container width, and
every `@media` here is effectively container-based. (The lone true CSS **container query** is the
family legend: `.famdo{container-type:inline-size}` + `@container (max-width:230px)` — keyed to the
`.famdo` card's own inline size, NOT the iframe. See A5.)

**The tiers (by builder/iframe width):**

| Tier | Width range | What changes |
|---|---|---|
| **Desktop** | **≥ 1001px** | Two-pane shell (`243px` sidebar + main), chips strip, insights `.span2` = half (span 6), maprail cards stacked in the rail. |
| **Mobile block** | **≤ 1000px** (`@media(max-width:1000px)`) | Single-column shell (`.shell{grid-template-columns:1fr}`), sentence strip replaces chips, mobile sidebar drawer, chip ✕ hidden, `#modeSwitch`/`.nameinput`/`.account` hidden. |
| **Insights single-column** | **≤ 820px** (`@media(max-width:820px)`) | `.insights{grid-template-columns:1fr}` — every insight card full-width, stacked. |
| **Insights multi-column (reflows enabled)** | **≥ 821px** (`@media(min-width:821px)`) | The 12-col insights grid is active, so A3 `.cities-promoted` reflow AND A4 `.ins-narrow/.ins-wide` sparse rebalance are **only meaningful/allowed here**. |
| **Tablet maprail 2-col** | **680–1000px** (`@media (min-width:680px) and (max-width:1000px)`) **AND `body.ark-fullheight`** | See I.1a — DEMO-only. |

**Per-rule width gating (cross-reference to sections A–F):**

| Rule | Applies at builder width | Gate |
|---|---|---|
| A1 insights order (`applyInsightsOrder`) | all widths (order set unconditionally; only *visible* as multi-row ≥821px) | none |
| A2 Top States→Cities swap | all widths (content swap is width-independent) | `hasStateSel()` |
| A3 seniority/dept reflow → halves | **≥ 821px only** | `@media(min-width:821px)` + `.cities-promoted` |
| A4 sparse-vbar quarter/three-quarter | **≥ 821px only** (`balanceSparseRows` early-returns if `matchMedia('(max-width:820px)')`) | `@media(min-width:821px)` + runtime guard |
| A5 family legend 2-col | all widths; container-query tighten at **famdo card ≤230px** | `@container` (card-based, not iframe) |
| A6 coverage icons bottom-right | all widths | none |
| A7/A8 labels | all widths | none |
| B1/B2 chart loading (appear-at-target, donut tween) | all widths | none |
| C1 map fits US | all widths | none |
| E2 tablet maprail 2-col + `--ark-cardh` + `.ark-cov-fill` | **680–1000px** | `body.ark-fullheight` (DEMO) |
| E3 declutter (`.pvtop`/`.notebar`/`#card-intent` hidden) | all demo widths | `body.ark-fullheight` (DEMO) |

**I.1a — iPad / tablet, answered precisely (Shaw's question): the 680–1000px 2-col Coverage+TopCities
maprail row is `ark-fullheight`-ONLY. A plain standalone builder at tablet width does NOT get it, by
design.**

- Proof: in `@media (min-width:680px) and (max-width:1000px)`, **every** selector is prefixed
  `body.ark-fullheight` (`.maprail{grid…2 cols}`, `.maprail .card{height:var(--ark-cardh…)}`, and the
  `.ark-cov-fill` fill rules). Without the `ark-fullheight` body class the whole block is inert.
- Why it's demo-only, and correct: the 2-col maprail exists to fill the horizontal space of the
  **full-height sticky native-scroll layout** (map has a fixed `360px` height there; the parent measures
  an insight card and pushes `--ark-cardh` so the maprail row matches it). A **plain standalone builder**
  at 680–1000px is in the **mobile block (≤1000px)**: single-column shell, and the maprail cards stack
  vertically in the rail — which is the intended standalone tablet presentation. There is no bug to fix;
  the 2-col row is a demo-layout optimization, not a general tablet rule.
- **Porting guidance:** if a target builder does NOT host the scripted embed (no `ark-fullheight`), do
  **not** port E2 — leave the maprail stacked at tablet width. If Shaw later wants standalone tablets to
  get the 2-col maprail, that's a NEW rule: drop the `body.ark-fullheight` prefix from the E2 block AND
  supply `--ark-cardh` from a resize handler in the core builder (currently only the demo parent sets it).
  Until then, standalone tablet = stacked maprail.

### I.2 SENTENCE GEO RULE — state-chip replacement by cities/metros

**As-implemented today (exact canonical code, `index.html` ~L2773–2782):**
```js
["personal","professional","company"].forEach(function(g){
  var l=S.loc[g];if(!l)return;
  // metros REPLACE the state chip (metro implies its state). Display-only; map scoping still reads S.loc.state.
  if(!(l.metro&&l.metro.size))l.state.forEach(function(s){geoParts.push(s);});
  l.city.forEach(function(c){geoParts.push(String(c).split("|")[0]);});
  if(l.metro)l.metro.forEach(function(m){geoParts.push(String(m).split("|")[0].replace(/\s+metro(\s+area)?$/i,"").replace(/^Fort\s+/i,"Ft. "));});
  ...
});
```
Precise semantics of the current code (be honest about the gap):
- It runs **per loc group** (personal/professional/company), independently.
- It drops **ALL** states in a group **iff that group has ≥1 metro** (`l.metro.size`).
- It does **NOT** consider cities at all for the drop (a selected city never drops a state).
- It is **NOT per-state**: one metro drops *every* state in the group, even unrelated ones.
- City rendering: `split("|")[0]` — cities stored `"City, ST"` (no `|`) render **WITH** the `", ST"`
  suffix; cities stored `"City|meta"` render bare. Metros render **bare** ("… metro" stripped, `Fort→Ft.`).

**Intended rule (Shaw, broader — the target to implement):** a selected **city OR metro that lies within
a selected state replaces that specific state's chip** (space preservation, per-state). Keep states that
no selected city/metro covers. Precise algorithm, per loc group `g`:

1. **Compute implied states** from this group's selected cities + metros:
   - City `"City, ST"` → implied state = the 2-letter `ST` suffix (uppercased). City `"City|…"` or bare →
     resolve via the city→state lookup if available, else no implied state.
   - Metro (bare name) → implied state = the metro's home state via `US_METROS` (`m.st`, or the modal
     state of `m.z`/`m.c`). (Demo metros Miami/Ft. Lauderdale → `FL`.)
   - `impliedStates(g) = { those STs }`.
2. **States:** for each `s` in `l.state`, push `s` to `geoParts` **only if `s ∉ impliedStates(g)`**
   (drop states that a selected city/metro already represents; keep unrelated ones).
3. **Cities:** push the **bare city name** (strip `", ST"` and `"|…"` → just `"City"`) when its state was
   dropped/implied; keep `", ST"` only to disambiguate a city whose state is NOT selected (or when the
   same bare city name appears under two different selected states). Rationale: the narrative sentence
   reads "in Miami", not "in Miami, FL", once FL is implied.
4. **Metros:** unchanged — bare place name, `"…metro"` stripped, `Fort→Ft.` (already correct).
5. **Cross-state city (Shaw's edge case):** a city/metro in a state **NOT** in `l.state` (e.g. state=`FL`
   + city=`Austin, TX`): `TX ∉ l.state`, so nothing is dropped — `FL` stays, and the city shows as its own
   chip. Because it's a different state, keep its `", ST"` for clarity → sentence reads
   "in FL, Austin, TX". Only same-state cities/metros collapse their state.
6. **Scope unchanged:** this is **display-only**. Map scoping / reach still read `S.loc.*.state` directly
   (`updateMapScope`, `_metroScopeKey`) — never derive scope from the sentence.

**Delta to implement (current → intended):** replace the coarse
`if(!(l.metro&&l.metro.size))l.state.forEach(push)` with the per-state `impliedStates(g)` filter above,
and extend the drop trigger from **metros-only** to **metros OR cities**. Suggested shape:
```js
var implied = new Set();
l.city.forEach(function(c){ var st=cityState(c); if(st) implied.add(st); });      // "City, ST" → ST, else lookup
if(l.metro) l.metro.forEach(function(m){ var st=metroState(m); if(st) implied.add(st); });
l.state.forEach(function(s){ if(!implied.has(s)) geoParts.push(s); });            // per-state keep/drop
l.city.forEach(function(c){ geoParts.push(cityLabel(c, implied)); });            // bare if state implied, else "City, ST"
if(l.metro) l.metro.forEach(function(m){ geoParts.push(metroLabel(m)); });        // bare, Fort→Ft.
```
**Verify:** (a) state=FL + metros=Miami,FtLaud → "in Miami & Ft. Lauderdale" (FL dropped). (b) state=FL +
city="Miami, FL" → "in Miami" (FL dropped, city bare). (c) state=FL + state=GA + city="Miami, FL" →
"in GA, Miami" (FL dropped as implied, GA kept). (d) state=FL + city="Austin, TX" → "in FL, Austin, TX"
(FL kept, cross-state city keeps its ST). (e) map scope/reach identical in all cases (display-only).
