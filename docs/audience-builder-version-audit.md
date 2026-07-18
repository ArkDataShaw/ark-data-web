# Audience Builder — Four-Surface Version Audit

**Compiled:** 2026-07-13 (Audience-Builder-Audit agent) · originally read-only; §6 has since been EXECUTED.
**Parity update 2026-07-17:** the §6 porting plan shipped. #3 (app.arkdata.io) received A1–A4 + B1–B4
(main `618ba77`, `6e65d8a`, `391b99d`, `8c47f1b`, `7e291ea`, `bb63021` — all deployed & live-bundle-verified);
#2 (React standalone) received the full twin-port + breadcrumb fix (`f201e6a`, deployed). Matrix cells below
are updated to the new state — historical ✗ notes kept as ~~strikethrough~~ where useful. A4's root cause
turned out to be recharts' default `animationBegin=400` (a dead 400ms before every donut tween), not a
remount bug — bars already tweened; measured empirically with a DOM-sampling harness.
**Rule catalog (row axis):** `docs/audience-builder-chart-view-rules.md` (§0 P1–P10 + §1–§8, HEAD `31841a0`).
**Method:** every cell verified against **actual code** (grep/diff/read), not the guide's prose. Where the guide and code disagree, the code is reported and the discrepancy flagged. Prior art used as scaffold: `audience-builder-react/docs/2026-07-06-arkdata-parity-spec.md`, `HANDOFF_2026-07-06_datamoon-audience-api-15.md`, `ark-data-web/docs/2026-07-06-audience-builder-placement-decision.md`.

---

## Legend & columns

| Mark | Meaning |
|---|---|
| ✅ | Full fidelity — rule + Shaw's intent satisfied |
| ◑ | Partial — renders/behaves, but violates part of the rule or its intent |
| ✗ | Missing / violates the rule |
| ⊘ | N/A — rule is `[DEMO]`-scoped (scripted-story-only) or doesn't apply to this surface |

| Col | Surface | Ground truth |
|---|---|---|
| **#1 (HTML standalone)** | HTML vanilla standalone mockup | `~/repos/audience-builder-mockup/index.html` (266KB; deployed `arkdata-audience-builder-demo.netlify.app`) |
| **#2 (React standalone)** | React standalone | `~/repos/audience-builder-react/src/` (deployed `audience-builder-react.netlify.app`) |
| **#3 (app.arkdata.io)** | In-app (the real product) | `~/repos/arkdata/apps/web/src/pages/AudienceBuilder.jsx` + `components/audience/` + `lib/audience/` |
| **#4 (arkdata.io iframe)** | arkdata.io website | `~/repos/ark-data-web/public/builder/index.html` + `embed-script.js` (vendored builder, `?script=1`) driven by `BuilderScrollDemo.jsx`/`MobileSentenceDemo.jsx` |

---

## 1. Master per-feature matrix

### §0 Design philosophy (P1–P10 adherence)

| Principle | #1 HTML standalone | #2 React standalone | #3 app.arkdata.io | #4 arkdata.io iframe |
|---|---|---|---|---|
| P1 Real data, never mock | ✅ live DataMoon insights via its own netlify fns | ✅ *(2026-07-17)* est-mode mock removed — real sample `score_category` tally, `Calc` fallback (`f201e6a`) | ✅ *(2026-07-17)* same fix (`8c47f1b`) | ✅ baked real captures (`stages-pool*.json`, `snapshot-pool.json`) |
| P2 Rerun-safe / no over-promise | ✅ shows live numbers → trivially rerun-safe | ✅ *(2026-07-17)* est-mode over-promise removed | ✅ *(2026-07-17)* same | ✅ Intent Phase 4 verified in code (1% floor, `embed-script.js:383–386`) |
| P3 No live data before demo ends | ⊘ (no scripted story) | ⊘ | ⊘ | ✅ `holdGeo`, `__arkScripted`, `ark-funnel-hold`, baked pools |
| P4 App-parity | ◑ high, but **strip is the pre-parity design** (see §1 rows) | ✅ near-copy of in-app components | ⊘ (it *is* the reference) | ✅ vendored + opus [CORE] passes |
| P5 Declutter demo | ⊘ (standalone keeps labels — correct per guide) | ⊘ | ⊘ | ✅ pvtop hidden, notebar dropped, glyph removed, "Create" crumb |
| P6 Charts visibly change per beat | ⊘ | ⊘ | ⊘ | ✅ per-stage baked paint + universal tween |
| P7 No glitchy jumping | ✅ donut sig-tween, `:not(:has())` ladder, flex-grow vbars | ✅ *(2026-07-17)* ladder fixed + donut `animationBegin=0` (recharts' 400ms dead lag killed) | ✅ *(2026-07-17)* same (`618ba77`, `391b99d`) | ✅ full tween suite + ladder fix |
| P8 Surface discipline ([CORE]/[DEMO], container-width) | ◑ receives [CORE] ports ad hoc; drifting (see divergence log) | ✗ outside the tagging system; misses designated-universal [CORE] items | ✗ outside the system; misses designated-universal [CORE] items | ✅ origin of the tagged specs |
| P9 Most relevant insight to top | ✅ `hasStateSel` states→cities swap | ✅ *(2026-07-17)* swap ported (`citiesPromoted`) | ✅ *(2026-07-17)* swap ported (`6e65d8a`) | ✅ swap + per-stage mirror |
| P10 Full reversibility | ⊘ | ⊘ | ⊘ | ✅ `__arkScripted` guard, `beatOff` reverse path |

### §1 Filter chips / strip

| Rule | #1 HTML standalone | #2 React standalone | #3 app.arkdata.io | #4 arkdata.io iframe |
|---|---|---|---|---|
| Strip `nowrap` + internal chip wrap, `wrapchips` deleted | ✗ **still the old design**: `.strip{flex-wrap:wrap;padding:12px…}` + `wrapchips` reflow at >3 filters (`index.html:1503`) | ✅ (`index.css` .strip nowrap; this is the pattern Shaw cited as the model) | ✅ (`audience.css:1300` identical) | ✅ `f2069fc` |
| M1 55px floor (0 vertical padding, grows row 3) | ✗ (12px padding steals the floor; no `min-height` on `.strip`) | ✅ `min-height:55px`, `padding:0 20px` | ✅ same | ✅ `d9c8cc5`, verified 55/55/77 |
| Chip always `inline-block` (load-jump fix) | ✅ | ⊘ (React chips are block-level pills; no fly-in load path) | ⊘ | ✅ |
| Purple `--violet` chips | ✅ `#f5f3ff/#7c3aed` | ✅ | ✅ (origin of the convention) | ✅ `22a725d` |
| Exclusion chips red | ✅ | ✅ | ✅ | ✅ |
| K-tier / grouped-state densification | ✅ (shipped here first) | ✅ (`bandShort`/`mergeRanges` merged-range chips) | ✅ | ✅ |
| Presence dot `.sub-dot` on subcategories | ✗ absent | ✅ | ✅ | ✅ `6ec44d7` |
| Sentence-geo: metro implies state, per-state `impliedStates` | ✅ **ahead of everyone** — implements spec §I.2 per-state logic (`dbadfde`, `e95e0db`) | ⊘ different system (`specSentence.ts` grammar owns geo phrasing) | ⊘ same | ◑ blunter metro-drops-all-states rule (guide itself flags this as short of Shaw's documented target) |
| `.pvtop` title bar hidden during story | ⊘ (standalone correctly shows it) | ⊘ | ⊘ | ✅ |
| Breadcrumb "Audiences › **Create**" | ✅ (`:506`) | ✅ *(2026-07-17)* fixed (`f201e6a`) | ✅ ("Create", `TopBar.tsx:58`) | ✅ (`:559`) |
| "Generating" ◌ glyph removed | ✅ | ⊘ | ⊘ | ✅ |
| Mobile builder = sentence strip, no chips | ✅ (`c915048` parity pass) | ✅ `SentenceStrip` + overflow rail | ✅ (origin) | ✅ |

### §2 Three-quarter / quarter charts

| Rule | #1 HTML standalone | #2 React standalone | #3 app.arkdata.io | #4 arkdata.io iframe |
|---|---|---|---|---|
| B2C order: Age(6)\|Home(3)\|Family(3) / NetWorth(6)\|Income(6) via `applyInsightsOrder` | ✅ | ✅ *(2026-07-17)* order ported | ✅ *(2026-07-17)* (`618ba77`) | ✅ both render paths |
| ≤820px single-column tier | ✅ | ◑ own breakpoints (≤1000px app-mobile); not the 820 container tier — intent (cards stack on narrow) holds | ◑ same | ✅ |
| Sparse-vbar rebalance (`balanceSparseRows`, span 3/9) | ✅ | ✅ *(2026-07-17)* computed from entry counts at render | ✅ *(2026-07-17)* (`bb63021`) | ✅ |
| B2C hides B2B cards | ✅ | ✗ consumer `ORDER` still *renders* seniority/department/industry/titles/firmo (reordered last, "No data"/empty when absent) | ✗ same | ✅ |
| Pyramid fixed age order + "65+" | ✅ | ✅ `AGE_ORDER` in `aggToSample.ts:48` | ✅ | ✅ |
| Pyramid neutral gender gradients (`#5a7aab`/`#c07a80`) | ✅ | ✅ | ✅ | ✅ |
| Real per-stage age/gender painted per beat | ⊘ | ⊘ | ⊘ | ✅ (`reassert()` guarded) |
| Home donut keeps all 3 segments at 0% | ✅ `renderHomeDonut` doesn't pre-filter | ✅ `homeSegments` maps unfiltered; recharts tweens | ✅ | ✅ |
| Family 2-col legend (Married/Single headers, container query) | ✅ | ✅ `FamilyDoughnut` + `.famdo-*` container queries | ✅ | ✅ |
| vbars via `flex-grow`, never inline height% | ✅ | ◑ vmode uses `flexGrow` ✅ but `VBars.tsx:69` sets inline `height:%` (container has definite height, so the bug it guards against can't fire — letter violated, intent safe) | ◑ same | ✅ |
| Bar-thickness ladder `:has(:nth-child(N)):not(:has(:nth-child(N+1)))` | ✅ (`:316`) | ✅ *(2026-07-17)* fixed | ✅ *(2026-07-17)* fixed (`618ba77`) | ✅ (`:343`) |
| NW/Income high-first compact labels **in charts** | ✅ `nwLabel`/`incLabel` | ✅ (`aggToSample.ts:35,94`) | ✅ | ✅ |
| Same compact labels **in sidebar options** | ◑ partially applied (5 refs vs #4's 7) | ✅ *(2026-07-17)* CheckList display-maps + high-first; raw key untouched | ✅ *(2026-07-17)* (`7e291ea`; merged around segment-locks; 27-case harness re-run clean) | ✅ `7f5ce0c` |
| Tooltips in estimate AND live modes (`tipBind`, dark) | ✅ | ✅ `useChartTip` bound on all chart types | ✅ | ✅ |
| Touch tap-forward (`tapTooltipAt`) | ⊘ | ⊘ | ⊘ | ✅ |

### §3 State → Cities replacement — *designated `[CORE]`, "all versions", by Shaw*

| Rule | #1 HTML standalone | #2 React standalone | #3 app.arkdata.io | #4 arkdata.io iframe |
|---|---|---|---|---|
| `hasStateSel()` → maprail swaps Top States→Top Cities, `#card-cities` hidden | ✅ | ✅ *(2026-07-17)* `citiesPromoted` | ✅ *(2026-07-17)* (`6e65d8a`) | ✅ + per-stage mirror |
| Header "Top states" ↔ "Top cities (HQ)" | ✅ | ✅ *(2026-07-17)* | ✅ *(2026-07-17)* | ✅ |
| Seniority/Department reflow to halves (`cities-promoted`) | ✅ | ✅ *(2026-07-17)* span 4→6 | ✅ *(2026-07-17)* | ✅ |
| States→Cities positional bar tween | ◑ has the FLIP tween machinery; swap-specific row-index tween unverified here | ⊘ | ⊘ | ✅ [opus-4] |

### §4 Coverage card

| Rule | #1 HTML standalone | #2 React standalone | #3 app.arkdata.io | #4 arkdata.io iframe |
|---|---|---|---|---|
| 4 tiles; label = `STAT_ICONS` key; "Companies" label | ✅ "Companies" | ✅ *(2026-07-17)* "Companies" (`42f950b`) | ✅ *(2026-07-17)* "Companies" (`8430d09`) | ✅ |
| Golden rule: absent → null → "—", never 0 | ✅ | ✅ *(2026-07-17)* `?? null` throughout + null-safe patchCoverage/geo scaling + nullable StatRow (`f201e6a`) | ✅ *(2026-07-17)* `orDash` (`618ba77`; Shaw's call: "—" for old reaggs) | ✅ |
| Icons **bottom-right** (11px) | ✅ (`:307`) | ⊘ Shaw's call 2026-07-17: app-side icons **stay in their current corner** — the bottom-right rule is #1/#4-only | ⊘ same call | ✅ (`:334`) |
| Parallel non-blocking coverage fetch, seq-guarded | ✅ (`b20167c` instant fill from insights response) | ✅ equivalent (`patchCoverage` + `baselineCoverageRef`, api-14 fixes) | ✅ (origin of the pattern) | ✅ `d29003d` |
| Narrowing scales from locked Generate baseline; nulls stay null | ✅ | ✅ | ✅ | ✅ |
| Per-stage baked counts, `__arkScripted` scroll-up guard | ⊘ | ⊘ | ⊘ | ✅ `_setStageMeta` ×19 in embed |
| iPad coverage-fill below map | ⊘ | ⊘ | ⊘ | ✅ |

### §5 Intent Strength (4-phase evolution; final = real Low/Med + 1% High floor)

| Aspect | #1 HTML standalone | #2 React standalone | #3 app.arkdata.io | #4 arkdata.io iframe |
|---|---|---|---|---|
| Phase reached | **Hybrid**: live = real `score_category`; estimate = Phase-1 25/45/30 mock | ✅ *(2026-07-17)* live real; est = real sample tally (mock removed, `f201e6a`) | ✅ *(2026-07-17)* same (`8c47f1b`) | **Phase 4 verified**: `_isplit` real Low/Med + High pinned 1% (`embed-script.js:383`) |
| Card placement | ✅ maprail `#card-intent` (standalone keeps it — per rule) | ✅ maprail card | ✅ | ✅ standalone; ✅ dropped under `ark-fullheight #card-intent{display:none}` (`:514`) |
| Rerun-safety of what's shown | ✅ live (real) / ◑ estimate mock | ✅ *(2026-07-17)* | ✅ *(2026-07-17)* | ✅ |

*Note: for #1 (HTML standalone)/#2 (React standalone)/#3 (app.arkdata.io) the live path is P1-correct (real data, whatever it shows — no floor needed or wanted); the ◑ is strictly the estimate-mode mock.*

### §6 Chart loading, animation & tween

| Rule | #1 HTML standalone | #2 React standalone | #3 app.arkdata.io | #4 arkdata.io iframe |
|---|---|---|---|---|
| Donut same-signature in-place tween | ✅ `svgDonut` + `_donut={sig,angles}` | ✅ recharts `animationDuration={420}` (different mechanism, same no-resweep intent) | ✅ | ✅ |
| Universal beat tween (FLIP, 300ms update / 500ms intro) | ✅ machinery present (`snapshotCharts`/`animateCharts`/`--chart-dur`, counts match #4 (arkdata.io iframe)) | ◑ React re-render + CSS transitions; no FLIP — but no beat story to tween | ◑ same | ✅ |
| No grow-from-zero on update path | ✅ | ✅ `mounted` flag gates only first mount | ✅ | ✅ |
| Prewarm below-fold charts (demo) | ⊘ | ⊘ | ⊘ | ✅ (desktop skips, per spec D3) |
| `reassert()` net, `_preSetReach`, boot hardening, re-entry fix, heartbeat | ⊘ | ⊘ | ⊘ | ✅ all in `embed-script.js` (reassert ×6, `_preSetReach` ×17; re-entry `31841a0` = HEAD) |

### §7 Map / geo

| Rule | #1 HTML standalone | #2 React standalone | #3 app.arkdata.io | #4 arkdata.io iframe |
|---|---|---|---|---|
| MapLibre county/ZIP `#mapFull`, Leaflet hidden, always dark | ✅ | ✅ own `mapEngine.ts`, dark style, county/ZIP | ✅ | ✅ |
| Nationwide `fitBounds` continental US (not fixed zoom) | ✅ `[-124.8,24.4]…` pad 24 | ✅ `LOWER48 [[-125.0,24.4],[-66.9,49.4]]` pad 12 (`mapEngine.ts:33,102`) — same intent, different constants | ✅ | ✅ |
| County↔ZIP zoom cross-fade, baked per-stage ZIP density | ✅ (cross-fade; live density) | ◑ own zoom/bbox logic; no baked stages (live) | ◑ same | ✅ |
| Beat merge (FL zoom + county/ZIP flip), `SFL_OFFSET`, West Palm dropped, density-on-stage-change, `ark-funnel-hold` pill, `releaseGeo` latch | ⊘ | ⊘ (West Palm still in metro *data* — fine; the rule was demo selection) | ⊘ | ✅ all verified in embed (`SFL_OFFSET` ×4, `ark-funnel-hold` ×5, `releaseGeo` ×5) |
| Map caption `.notebar`: removed in demo, **kept in standalone** | ✅ kept (3 refs — per rule) | ◑ has a notebar-equivalent (1 ref) | ✗/⊘ caption absent (0 refs) — acceptable, product context | ✅ removed under demo, desktop bottom-align |
| `us-cities.js` (796KB) mobile-gated | ◑ loads full data set (standalone free-play — acceptable, but no payload diet) | ⊘ (bundled JSON) | ⊘ | ✅ |

### §8 Global / cross-cutting

| Rule | #1 HTML standalone | #2 React standalone | #3 app.arkdata.io | #4 arkdata.io iframe |
|---|---|---|---|---|
| Container-width (iframe) media queries | ✅ (same file lineage) | ⊘ not iframed — device-width is correct there | ⊘ | ✅ |
| [CORE]/[DEMO] tag discipline | ◑ receives ports, no tags in-repo | ✗ outside the system | ✗ outside the system | ✅ (tags live in the specs) |
| All demo data real & baked; revenue==headcount accepted | ✅ (live real) | ✅ (live real; revenue derives 1:1 — rendered as-is) | ✅ | ✅ |
| Chart colors hardcoded, never accent-derived | ✅ | ✅ | ✅ | ✅ (revert `0aea698` locked) |
| Stage-0 CA/VA dedup (`8310747`) | ⊘ | ⊘ | ⊘ | ✅ **verified**: both pools 51 states, CA×1, VA×1 |
| Reach ladder 395,936 → 28,928 → 4,360 → 128 | ⊘ | ⊘ | ⊘ | ✅ **verified** in `stages-pool-desktop.json` |

---

## 2. Per-version summary

### #1 (HTML standalone) — HTML vanilla standalone mockup
Single-file vanilla JS (~266KB) + baked data files + MapLibre/Leaflet/PMTiles, with **its own netlify functions hitting the live DataMoon insights API** (recent commits: instant per-state totals, instant headline reach, instant coverage from the insights response). Deployed `arkdata-audience-builder-demo.netlify.app`. **Role: the free-play demo** — it is what the website's homepage teaser (`BuilderShowcase.jsx`) and `/Demo` page iframe. Data model: live-real (P1 ✅). It carries most [CORE] chart rules (insights order, sparse rebalance, states→cities, donut/FLIP tween, ladder fix, coverage golden rule) via the `b04ad13` "CORE parity" pass, and is *ahead* of #4 (arkdata.io iframe) on the per-state sentence-geo logic — but its **filter strip is still the pre-parity design** (wrap + `wrapchips`, no 55px floor) and it lacks the sub-dot.

### #2 (React standalone) — React standalone
Vite React/TS re-implementation with netlify-function live API; the datamoon-api-9→15 lineage; deployed `audience-builder-react.netlify.app`. **Role: the porting bridge** — it was brought to in-app parity (parity spec Phase 1) so features could flow app ↔ demo. Data model: live-real + estimate mode from the 500-row sample. Its components are near byte-identical to the in-app builder's (only import paths differ, plus in-app has newer StatRow/tooltip touches). It therefore shares every in-app divergence below, plus one of its own: the stale "Create New" breadcrumb.

### #3 (app.arkdata.io) — In-app builder (app.arkdata.io) — the real product
`AudienceBuilder.jsx` + `components/audience/` + `lib/audience/`; Firebase callables, two-tier Generate/Save, ClientRec narrowing, full workbench (list/detail/modals). **Source of truth for product behavior** — and the origin of several conventions the demo adopted (purple chips, coverage semantics, sentence grammar). Data model: fully real. However, on the **chart/view rules the guide catalogs, it has NOT received the opus-era universal `[CORE]` improvements**: no states→cities swap (Shaw: "should be used in all versions"), old B2C grid order, no sparse rebalance, hover-thinning bar ladder, top-right coverage icons, verbose sidebar band labels.

### #4 (arkdata.io iframe) — arkdata.io website (this repo)
Two distinct pieces:
1. **`public/builder/` vendored builder** — a snapshot of the #1 (HTML standalone) mockup (git trail: "re-vendor at mockup `<hash>`", last full re-vendor at mockup `c674da1`) plus all opus-1→4 `[CORE]`+`[DEMO]` work applied directly to the copy. `embed-script.js` is the `?script=1` demo layer (per-stage paint, beats, reassert, tap-forward). `BuilderScrollDemo.jsx` / `MobileSentenceDemo.jsx` iframe it same-origin at `/builder/index.html?script=1` and drive it via `window.ArkEmbed` (loadSnapshot/loadStages/enableFullHeight/holdGeo/landSel).
2. **`BuilderShowcase.jsx` + `Demo.jsx`** — click-to-load iframes of the **remote #1 (HTML standalone) mockup** for free-play.

Data model: baked-real pools for the scripted story (P1/P2/P3 ✅), remote live demo for free-play. **Role: the marketing story.** This surface is at 100% of the guide by construction — the guide was mined from its lineage — and every spot-check verified (1% intent floor, CA dedup, reach ladder, 55px strip, `ark-fullheight #card-intent`, icons bottom-right, `:not(:has())` ladder).

---

## 3. Divergence log (the drifts that matter)

Ordered by severity against Shaw's stated intent.
**2026-07-17 status:** items 1, 3, 4 (order+rebalance; B2B-card *hiding* dropped by Shaw's "reorganize, never hide" call), 5, 6 (golden rule fixed; icons kept-as-is by Shaw's call; "Companies" label = open B5), 7, and 9 are **RESOLVED** — shipped to #3 and twin-ported to #2 (commits in the header). Still open: 2 (mockup strip), 8 (#1↔#4 re-vendor reconciliation, HOLD), 10 (guide notes).

1. **States→Cities swap missing from the product (#2 (React standalone)+#3 (app.arkdata.io)) — P9/P4 violation of an explicit Shaw universal.** Shaw: *"I feel this is actually a really good idea and should be used in all versions of the audience builder."* The mockup and vendored builder have it; the actual product still pins Top States in the maprail and always renders a redundant Top Cities grid card. A prospect who watches the demo then uses the app sees different behavior — the exact P4 mental-model break the rules exist to prevent.
2. **#1 (HTML standalone) mockup strip is pre-parity (P4/P7).** The free-play demo that the website itself iframes still has `flex-wrap:wrap` + `wrapchips` reflow + 12px padding (no 55px floor) — the design opus-3 explicitly deleted ("app-parity… no wrapchips"). So the *site's own free-play surface* contradicts the site's scripted demo strip.
3. **Hover-thinning bar ladder in #2 (React standalone)+#3 (app.arkdata.io) (P7).** `.hbars-wrap:has(> .bar:nth-child(4):last-child)` + `ChartTooltip` mounting as trailing sibling reproduces exactly the "bars immediately get thinner… looks glitchy" bug Shaw reported; the fix (`:not(:has())` form) shipped only in the HTML lineage.
4. **B2C insights order + sparse rebalance + B2B-card hiding absent in #2 (React standalone)+#3 (app.arkdata.io) (P6/P9).** `ORDER.consumer` still puts Income beside Age; a 1-bar Net Worth still wastes a half-width beside a dense Income chart; consumer audiences still render B2B cards. All three were opus-2/3 rules motivated by real screenshots.
5. **Estimate-mode Intent mock in #2 (React standalone)+#3 (app.arkdata.io) (P1/P2).** `Insights.tsx` literally comments it's "vanilla's reach-proportional mock (Low 25 / Med 45 / High 30)" — Phase 1 of the saga, showing up to 30% High intent that a Generate immediately contradicts. Live mode is real (fine); only the pre-Generate estimate lies.
6. **Coverage card cosmetics in #2 (React standalone)+#3 (app.arkdata.io):** icons top-right 9px (Shaw's clipping screenshot drove the bottom-right rule), label "Unique companies" (P5 shortened it to "Companies"), and `orZero` mapping *undefined→0* — the letter-inversion of the golden rule "absent → — , never 0" (intent partially preserved: explicit nulls do render "—").
7. **Sidebar band labels verbose + low-first in #2 (React standalone)+#3 (app.arkdata.io) (P4-consistency).** `filters.ts` still shows "-$20,000 to -$2,500 … more than $1,000,000" while the charts show `$1M+ … -$20K-$2.5K` — the sidebar and charts speak different languages, the exact thing `7f5ce0c` fixed in #4 (arkdata.io iframe). #1 (HTML standalone) is partially through the same port.
8. **Bidirectional #1 (HTML standalone)↔#4 (arkdata.io iframe) drift since the last re-vendor.** #4 (arkdata.io iframe) gained (not in #1 (HTML standalone)): strip nowrap+M1 floor, sub-dot, sidebar band labels (complete), extra `nwLabel` call sites, DEMO layer. #1 (HTML standalone) gained (not in #4 (arkdata.io iframe)): per-state `impliedStates` sentence-geo (spec §I.2 target — #4 (arkdata.io iframe) still uses the blunt rule the guide flags), instant insights-response fills (headline reach / per-state totals / coverage). Neither side is a superset; a naive re-vendor of #4 (arkdata.io iframe) from #1 (HTML standalone) HEAD would **regress the strip and sub-dot**, while never re-vendoring means #4 (arkdata.io iframe)'s sentence-geo stays below Shaw's documented target.
9. **#2 (React standalone) stale breadcrumb** ("Create New") — trivial, but it's the surface most likely to be copy-pasted from.
10. **Guide-vs-code notes:** (a) the guide's claim that the per-state sentence-geo logic is "documented target, shipped code blunter" is now only true of **#4 (arkdata.io iframe)** — #1 (HTML standalone) shipped the target logic; (b) the universal-tween machinery (`snapshotCharts` etc.) exists in #1 (HTML standalone) at identical ref-counts to #4 (arkdata.io iframe), so [opus-4 `5c48353`] is effectively present in both HTML surfaces.

---

## 4. The #4 relationship finding (mockup-iframe vs re-creation)

**BuilderScrollDemo is NOT a React re-creation of the builder, and the site does not iframe the live mockup for the scroll demo. Both things exist, separately:**

- **The scripted scroll demo** (`BuilderScrollDemo.jsx`, desktop ≥960px; `MobileSentenceDemo.jsx` below) iframes the **locally vendored copy** at `src="/builder/index.html?script=1"` (same-origin), and drives it through the `window.ArkEmbed` API exposed by `embed-script.js` (`loadSnapshot('/builder/snapshot-pool.json')`, `loadStages('/builder/stages-pool-desktop.json')`, `enableFullHeight()`, `holdGeo`, `_desktopStory`, `landSel`). The React components own only the *takeover mechanics* (beat-snap scroll, sentence overlay, chip fly/FLIP into the iframe's strip); every pixel of builder UI is the vendored HTML engine.
- **The free-play surfaces** (`BuilderShowcase.jsx` homepage teaser, `Demo.jsx` page) iframe the **remote #1 (HTML standalone) mockup** `https://arkdata-audience-builder-demo.netlify.app` (click-to-load, per the placement decision doc).
- **Lineage:** `public/builder/index.html` is a periodic vendor of the mockup ("re-vendor at mockup `d68c1bb→…→c674da1`" commits) that has since been edited **in place** by opus-1→4. It is 371 diff-lines ahead/apart from mockup HEAD, in both directions (see divergence #8). Memory note: re-vendoring is currently **on HOLD** pending Shaw's go signal — correct call given the bidirectional drift.

**Consequence:** the website ships *two different builder builds simultaneously* — a visitor who finishes the scroll demo and then clicks "Load the interactive demo" moves from the opus-current vendored engine to mockup HEAD, and can see the strip change design (nowrap/55px vs wrapchips) between them.

---

## 5. Recommendations

1. **Canonical reference:** keep **#4 (arkdata.io iframe)'s vendored builder + the tagged specs** as the canonical reference for *chart/view rules* (it is the only surface at guide-HEAD and the only one with [CORE]/[DEMO] discipline), while **#3 (app.arkdata.io) stays canonical for product behavior/data contract** (per the parity spec). Do not treat #1 (HTML standalone) or #2 (React standalone) as reference for anything except: #1 (HTML standalone)'s per-state sentence-geo (`dbadfde`) and instant insights fills, which are the best implementations of their rules anywhere.
2. **Highest-value parity work is app-side (#3 (app.arkdata.io), then #2 (React standalone)):** port the four designated-universal `[CORE]` items Shaw explicitly universalized — states→cities swap (+cities-promoted reflow), B2C insights order, sparse rebalance, thickness-ladder `:not(:has())` fix — plus the low-cost coverage cosmetics (bottom-right icons, "Companies", tooltip). These directly serve P4: the demo currently *over-represents* the product's polish.
3. **Kill the Phase-1 intent mock in #2 (React standalone)/#3 (app.arkdata.io) estimate mode** (P2): use the real sample `score` tally or show `···` — the one place the product itself can over-promise.
4. **Reconcile #1 (HTML standalone)↔#4 (arkdata.io iframe) before any re-vendor:** first backport #4 (arkdata.io iframe)'s strip (f2069fc + d9c8c5), sub-dot, and remaining band-label call sites to the mockup; forward-port #1 (HTML standalone)'s per-state `impliedStates` to #4 (arkdata.io iframe). Only then re-vendor. A re-vendor from current mockup HEAD would regress the strip the guide calls out by commit hash. (Re-vendor HOLD stands.)
5. **Fix #2 (React standalone)'s breadcrumb** ("Create New"→"Create") whenever it's next touched — one-liner.
6. **Update the guide** on the two guide-vs-code notes (divergence #10) so the "documented target" framing of the sentence-geo rule points at #4 (arkdata.io iframe) specifically, and the mockup's possession of the tween suite is recorded.

---

## 6. Porting plan — which #4 (arkdata.io iframe) additions go into #3 (app.arkdata.io)

Scope per Shaw: charts, chart order, non-demo animations, chart replacements, spacing, titles, divs, map positioning, bar behavior on update, and other visual/UX features. i.e. **only `[CORE]`-class rules** — the scripted-story `[DEMO]` layer is explicitly out.

### 6.1 Decision criteria (applied to every candidate)

1. **Did Shaw already universalize it?** ("all versions of the audience builder") → adopt, no debate.
2. **Which P-principle does it serve?** P7 (glitch) and P9 (relevance) fixes rank above P5 (labels).
3. **Blast radius in the live product.** app.arkdata.io is production with tenants; CSS-only < component-local < store/data-shape changes. Deploy rule: hosting never alone — `--only "functions:domainRewrite,hosting"`.
4. **Does the React idiom already deliver the intent by other means?** (e.g. recharts donut tween ≈ `svgDonut` sig-tween → nothing to port). Port intent, not implementation.
5. **Media-query translation:** the iframe builder's rules are container-width; the app is NOT iframed — thresholds must be re-expressed against the app's real layout (sidebar open/closed changes effective width), and every change tagged DESKTOP/TABLET/MOBILE per Shaw's standing P8 instruction.

### 6.2 Tier A — ✅ SHIPPED 2026-07-17 (all five, live on app.arkdata.io + twin-ported to #2)

A1 `618ba77` · A2 `618ba77` · A3 `6e65d8a` · A4 `391b99d` (root cause: recharts default `animationBegin=400` — bars already tweened; empirical DOM-sampling harness) · A5 `f201e6a`.

**Shaw's framing:** the three cards to the right of the map on desktop are reserved for the **highest-impact charts: Coverage, Location, Intent** (both surfaces already have this trio — the States→Cities swap is what makes the Location slot high-impact instead of a trivial one-bar chart). And the grid principle is **reorganize, never hide**: most relevant data to the top, B2B cards stay rendered for B2C audiences, just ordered below.

| # | Feature | Where in #3 (app.arkdata.io) | Effort | Risk | Verify |
|---|---|---|---|---|---|
| A1 | **Bar-thickness ladder fix** — `:has(> .bar:nth-child(4):last-child)` → `:has(> .bar:nth-child(4)):not(:has(> .bar:nth-child(5)))`. **Confirmed live on the app** (Shaw asked): default track 17px, 4-bar rule 22px keyed on `:last-child`; `ChartTooltip` mounts as trailing sibling on hover → 22→17px snap (5-bar: 19→17) | `audience.css:171–172` (2 lines) | trivial | none | hover a 4-bar and a 5-bar hbars card; bars must not change thickness |
| A2 | **B2C insights grid order** — Age(6)\|Home(3)\|Family(3) row 1, NetWorth(6)\|Income(6) row 2 ("two quarter cards = one half card", Shaw 2026-07-09). B2B rows already match the website exactly — B2C rows 1–2 are the only grid-order divergence. B2B cards below stay rendered (reorganize, never hide) | `Insights.tsx:41` `ORDER.consumer` → `['age','home','family','networth','income','cities','seniority','department','industry','titles','firmo']` | trivial | none | consumer audience: Income no longer beside Age; both rows clean 12-col; B2B cards still present below |
| A3 | **States→Cities replacement** — Shaw (re-confirmed 2026-07-13): *"the States+Cities swap should always happen."* When any `loc.*.state` selected: maprail Top States card → Top Cities (+"(HQ)" on company basis), drop the grid `cities` card, seniority/department span 4→6. React version is *simpler* than the DOM one: conditional render + computed spans. Cities will never be empty (Shaw) — no empty-state fallback needed | `Insights.tsx` (maprail block `:110–117`, `CARDS`/`ORDER`), `hasStateSel` from store `loc` | small | medium — touches the always-visible maprail | select FL → maprail shows Top Cities, grid cities card gone, seniority/dept two-across; clear FL → reverts |
| A4 | **Charts must tween on ClientRec narrowing — vertical, horizontal, AND donut** (Shaw: they don't today, but they should). Note: the CSS transitions already exist (`--chart-dur:650ms` on `.fill` width / vbar height / flex-grow, `audience.css:178/231/298/352`) and donuts are recharts `animationDuration=420` — so if bars snap, the transition is being **defeated by remounts** (each remount re-runs `useMounted` → re-grow-from-zero or instant-jump; likely suspects: est→live tree swap, changing keys, `Calc`↔chart swaps). Fix the remounts; do NOT port the FLIP engine | `Insights.tsx` / `HBars/VBars/Pyramid/Donut` mount behavior | small–medium (diagnosis first) | low | narrow a generated audience (pure ClientRec path): every bar chart + both donuts morph in place; nothing re-grows from zero or snaps |
| A5 | **#2 (React standalone) breadcrumb** "Create New" → "Create" (Shaw: yes) | `audience-builder-react src/components/TopBar.tsx:36` | one-liner | none | crumb reads "Audiences › Create" |

### 6.3 Tier B — B1 `7e291ea` ✅ · B2 `8c47f1b` ✅ · B3 `618ba77` ✅ · B4 `bb63021` ✅ · B5 `8430d09`/`42f950b` ✅ ("Companies", Shaw's call 2026-07-17) — all shipped + twin-ported

| # | Feature | Notes | Effort |
|---|---|---|---|
| B1 | **Sidebar band labels: compact + high-first** (`$1M+ … -$20K to -$2.5K`) matching the chart bars — Shaw asked for exactly this in #4 (`7f5ce0c`) | Display-only via `nwLabel`/`incLabel` (already in `aggToSample.ts`); **raw option string must stay the state key** (spec/resolver untouched). Reverse render order high-first. ⚠ these labels feed chips → re-run the 27-case sentence harness | small |
| B2 | **Kill the estimate-mode Intent mock** (25/45/30, Phase 1 of the saga) — the one rerun-unsafe number left in the product (P2) | Replace with the real sample `score` tally, or render `···` until live data lands. Do NOT port the 1% floor — that's a baked-demo decision; the live app shows real values | small |
| B3 | **Coverage golden rule: old reaggs with absent fields render "—", not 0** (Shaw decided 2026-07-13) | `aggToSample.ts:115` `orZero` — undefined → `null` (→ "—" + tooltip) instead of `0` | trivial |
| B4 | **Sparse-vbar rebalance** (1–3-bar card → quarter, dense neighbor → three-quarter; motivating case: 1-bar `$1M+` Net Worth beside 9-bar Income) | React-idiomatic: compute spans from `entries.length` at render (no DOM measurement / `balanceSparseRows` port needed). Only in the ≥2-col grid tier; both-sparse → equal halves, per Shaw's rule | medium |
| B5 | **"Companies" vs "Unique companies" tile label** — pending Shaw's call (he flagged the ambiguity 2026-07-13). App says "Unique companies" (`aggToSample.ts:120`); website/mockup say "Companies" (Shaw's earlier P5 rename). ⚠ if changed: label doubles as the `STAT_ICONS` key — change both or the icon vanishes | `aggToSample.ts:120` + `StatRow.tsx` `STAT_ICONS` | trivial |

### 6.4 Tier C — ✅ CLOSED 2026-07-17 (C1 verified N/A; see row note)

| # | Question | How to verify |
|---|---|---|
| C1 | **Map bottom aligned to last maprail card** (desktop) | ⊘ **CLOSED 2026-07-17 — N/A for the app.** Verified: app map column = `.mapwrap` 590px + `.mapnote` caption (kept, per guide §7 "removed in the demo, kept in standalone"); maprail = natural-height flex, no alignment mechanism. The alignment requirement was explicitly consequent to the demo's caption removal — a surface that keeps its caption was never subject to it. No change. |

### 6.5 Explicitly NOT ported / explicitly kept as-is

**[DEMO] layer (never ports):** per-stage baked paint / beats / `_setStageMeta`, prewarm, `reassert()`, `_preSetReach`, `__arkScripted`, `ark-funnel-hold`, `releaseGeo` latch, `SFL_OFFSET` scoot, tap-forward tooltips, `.pvtop` hiding (the app *should* show the title bar), map-caption removal, 1% Intent floor, container-width media queries (the app is not iframed — device/layout-width is correct there).

**Kept as-is by Shaw's call (2026-07-13):** coverage icons stay in their current top corner on the app (the bottom-right rule remains #4-only).

**Reverse-direction note:** Shaw's stated principle is *reorganize, never hide* — but the **website** (#4/#1) currently hides all B2B cards for B2C audiences. That now diverges from the stated intent in the other direction; whether the website should switch to render-and-reorder is a separate (website-side) decision, out of this porting plan's scope.

### 6.6 Sequencing & process

1. **Order:** A1 (CSS one-liner) → A2 (order array) → A5 (breadcrumb one-liner) → A4 (tween diagnosis) → A3 (states→cities) → B3 → B1 → B2 → B4 → B5 (pending call) → C1 alongside.
2. **Where:** implementation happens in the `arkdata` repo (out of this audit's read-only scope) by a separate implementation agent/session; Shaw sign-off per tier before it starts.
3. **Twin-port:** every item that lands in #3 (app.arkdata.io) should land in #2 (React standalone) in the same pass — the components are near byte-identical and #2 is the designated porting bridge; skipping it recreates today's drift.
4. **Per-change discipline (P8):** tag each change with the views it touches (DESKTOP/TABLET/MOBILE), verify at all three app breakpoints, and check with the sidebar both open and collapsed (effective content width changes the grid).
5. **Guardrails:** no store/spec-shape changes anywhere in Tier A/B; sentence-grammar-adjacent change (B1) requires the 27-case harness; deploy only as `--only "functions:domainRewrite,hosting"`.
6. **Close the loop:** on completion, update the chart-view-rules guide's per-surface claims and this audit's matrix cells (§2/§3/§4 columns for #2 and #3).

### 6.7 Shaw's decisions (2026-07-13) + remaining open question

Decided:
1. States→Cities swap: **always** — the maprail trio right of the map on desktop is reserved for the highest-impact charts: **Coverage, Location, Intent**. Cities will never be empty (no fallback needed).
2. B2B cards for B2C: **keep them, reorganize** — most relevant to the top, never hide. (The app already keeps them; only B2C rows 1–2 need reordering.)
3. Old reaggs with absent coverage fields: **"—"**, not 0.
4. #2 (React standalone) breadcrumb "Create New" → "Create": **yes**.
5. Coverage icons: **stay as-is** on the app.
6. Bars/donuts **must tween** on ClientRec narrowing (Shaw observes they don't today).

**Post-plan additions (2026-07-18):** ZIP radius search + tri-state geo excludes + seniority hierarchy landed in the mockup (`af0db86`, `3cb06ff`, `563930c`), closing its popover gaps vs the app. **Radius-default Zip sub-mode** shipped to app (`b64453a`), react standalone (`781b57b`), and mockup (`bb640e2`) — consistent everywhere except the vendored #4 copy (no radius mode; re-vendor HOLD, now further behind: flat seniority, no tri-excludes, no radius).

Open: *(none — B5 resolved 2026-07-17: Shaw chose "Companies"; shipped to both React surfaces, `8430d09`/`42f950b`)*

---

*Audit complete. All ✅/✗ cells above are grep/read-verified against code as of 2026-07-13 (ark-data-web HEAD `31841a0`, mockup HEAD `fc5be20`). No builder code was modified.*
