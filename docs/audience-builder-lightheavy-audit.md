# Audience Builder — LIGHT/HEAVY Insights Tier Readiness Audit

**Compiled:** 2026-07-16 (Audience-Builder-Audit agent) · **Read-only audit — no builder code touched.**
**Trigger:** DataMoon splitting `/audiences/insights` into LIGHT (reach + distributions + coverage + `geo.*.states`, ~50–few-hundred ms) vs HEAVY (adds `geo.*.zips`+`counties`, ~3–4s) via a request param (`sections`/`include`), per `~/repos/audience-builder-react/docs/insights-endpoint-investigation.md`.
**Scope constraint (Sami, 2026-07-16):** `company_description` (+`education`) are NOT carried on intent audiences; insights requires `topic_ids` → **the company_description filter is OUT OF SCOPE for insights** here. The light/heavy split itself is unaffected.
**Surfaces:** the four from `docs/audience-builder-version-audit.md` — #1 HTML standalone (mockup), #2 React standalone, #3 app.arkdata.io, #4 arkdata.io iframe.

---

## 0. Headline findings

1. **#1 (HTML standalone) already implements the light-tier pattern — client-side, against the heavy endpoint.** Its `insightsCoverage` netlify action calls full insights, **strips ZIPs server-side** and returns `{coverage, reach, geoStates}` ("ZIPs deliberately stripped to keep this payload light… County/ZIP density stays the slow pull's job — Shaw 2026-07-10", `netlify/functions/audience.js:444–462`). The client fires it in parallel with Generate and paints **instant headline reach, exact state choropleth, and coverage tiles** (`index.html:1950+`), with the heavy geoPoll upgrading the map later. **DataMoon's LIGHT tier makes the vendor side of this exact call fast — for #1 it's a one-param adoption.**
2. **#2/#3 make ONE blocking heavy insights call per filter change** (debounced 600ms) and everything — charts, coverage, reach, state choropleth — waits ~2–4s on ZIP arrays the charts never use. This is the surface where light-then-heavy pays the most.
3. **The adapters are already light-ready.** Verified in BOTH `insightsAdapter.ts` copies (#2 `src/lib/`, #3 `lib/audience/`): `geoLayer()` defaults missing `zips`/`counties` to `[]` (`:87–95`) and `insightsToAgg` never requires them. A light response renders every chart + the state choropleth **with zero adapter changes**.
4. **The map engine (#2/#3) already has the two-mode architecture the upgrade needs** — `Mode = 'state' | 'full'`, state-fill layer painted from `geo.*.states` (`mapEngine.ts:197–221`), county/ZIP layers behind `setMode('full')`. The needed change is small: the drill gate is `!!geoData` / `canDrill = !!liveGeo`, which under light-first becomes true **before ZIPs exist** — it must instead gate on ZIP presence.
5. **#4 (arkdata.io iframe) is N/A for two-phase fetch** — P3 (no live data before demo ends) is verified: scripted story reads baked `stages-pool*.json`/`snapshot-pool.json`; free-play iframes #1, which brings its own adoption.
6. **A4 overlap (flagged per the brief):** when HEAVY lands after LIGHT, `insightsToAgg` re-runs and the React tree re-renders with **identical distribution values** (only geo differs). If the A4 remount bug is real (charts remounting on data change → `useMounted` restarts → re-grow from zero), the heavy landing will make every chart visibly re-grow ~3s after a clean light paint — the exact P7 "spurious loading" glitch. **The A4 fix is a prerequisite for a glitch-free light→heavy handoff in #2/#3.**

---

## 1. Per-surface matrix

Legend: ✅ ready as-is · ◔ small change · ◑ moderate change · ⊘ N/A

| Question (brief §) | #1 HTML standalone | #2 React standalone | #3 app.arkdata.io | #4 arkdata.io iframe |
|---|---|---|---|---|
| **1. Fetch path today** | TWO paths: heavy build→`geoAttach`/`geoPoll` (CSV stream, 10–20s) for map density + records, AND parallel `insightsCoverage` (full insights, ZIPs stripped server-side) for instant reach/states/coverage. `callProxy({action:'insightsCoverage'})` → netlify fn → DataMoon | ONE debounced (600ms) blocking call per filter change: `App.tsx:callInsights` → `api.ts:fetchInsights` → netlify fn `action:'insights'` (`audience.js:456`) → DataMoon, full response + server-side ZIP→county join (`:469`) | Same pattern: `AudienceBuilder.jsx:callInsights` (600ms debounce, `:232/:280`) → `api.ts:fetchInsights` → Firebase callable `getAudienceInsights` (`audience-insights.ts:42`) → `dmFetchInsights` (`datamoon-client.ts:192`), full response + server-side county join | ⊘ scripted story = baked pools only (`P3` verified); free-play = iframe of #1 |
| **2. Two-phase readiness** | ◔ **pattern already shipped** — light call exists, fires in parallel, race-guarded (`genSeq`), late-reply-can't-clobber guards (`_buildReachSeen`, `!window._geoData`). Change = pass the tier param through so the vendor side is actually fast | ◑ single-call today; needs light-on-every-change + staggered heavy (or heavy-direct on geo-filter). Race machinery already exists to reuse: `geoSeqRef` monotonic guard, AbortController on `fetchInsights(spec, ac.signal)`, `shouldSkipInsights` | ◑ same as #2 (the files are near-identical); has `geoSeqRef` + `shouldSkipInsights` + `isOnlyGeoChange` client-narrowing already | ⊘ |
| **Adapter tolerates `zips:[]`/missing counties** | ✅ N/A-by-design — the light path never parses zips (`geoStates` only); heavy density comes from the geoPoll CSV, not insights | ✅ **verified** `insightsAdapter.ts:87–95` — `geoLayer()` → `{states:[],counties:[],zips:[]}` on missing layer; `zips \|\| []`, `counties \|\| []` | ✅ **verified** — byte-identical `geoLayer()` in `lib/audience/insightsAdapter.ts:87–95` | ⊘ |
| **3. Map upgrade path (state → county/ZIP without snap)** | ✅ already does it: `applyStateWithPhase1Anim` paints exact states instantly; the heavy pull upgrades density later (separate pipeline) | ◔ engine ready: state-fill from `set.states` (`mapEngine.ts:197`), county/ZIP `setMode('full')` with source-load guards + tuned fades; **gate fix needed**: `setMode('full')` requires only `!!this.geoData` (`:572`) and `GeoMap.tsx` `canDrill = !!liveGeo` (`:60`) — under light-first both go truthy with empty zips → empty drill. Gate on `geoData.people.zips.length` (any layer). Auto-upgrade on heavy = `setGeoData(heavyGeo)` (existing `:81` effect re-fires it) | ◔ identical engine + identical gates → identical fix | ⊘ (scripted map = baked per-stage density; already "instant") |
| **4. What blocks on geo that shouldn't** | ✅ nothing — charts/coverage/reach already paint from the stripped call | ✗→◔ **everything**: all 14 distribution blocks, coverage tiles, reach, AND the state choropleth wait the full ~2–4s for ZIP arrays no chart consumes | ✗→◔ identical | ⊘ |
| **5. `sections`/`include` param + `tier` echo wiring points** | fn: `audience.js:451` (`dm('POST','preview','/audiences/insights', {...basePayload})` → add param); client: `callProxy` payload + optionally read `tier` | fn: `audience.js:462` same call-site; client: `api.ts:fetchInsights` signature + `callInsights` two-phase logic; `InsightsResponse` interface gains `tier?` | callable: `audience-insights.ts` (pass param through), `datamoon-client.ts:192` `dmFetchInsights` payload; client: `lib/audience/api.ts:18` + `AudienceBuilder.jsx:callInsights`; `InsightsResponse` gains `tier?` | ⊘ |
| **6. `unique_companies` in coverage** | ✅ **already wired**: `if(cov.unique_companies!=null)m.uniqueCompanies=…` with `has_company_name→hasCompany` fallback (`index.html` fetchInsightsCoverage) | ◔ `insightsToAgg` hardcodes `uniqueCompanies: 0 // populated from CSV` (`insightsAdapter.ts:161`) → change to `cov.unique_companies ?? 0` (or `?? null` per golden rule) when DataMoon ships it | ◔ identical hardcoded 0 (`lib/audience/insightsAdapter.ts:163`) → same change; note #3's adapter already uses `?? null` for the other coverage keys (post-golden-rule), #2 still uses `\|\| 0` | ⊘ (baked snapshot already carries real coverage) |

---

## 2. Change list (prioritized, with effort/risk/verify)

### Blocked / out of scope
- **`company_description` keyword filter on insights** — intent-gated vendor-side; do not design for it. (It DOES work on non-intent advanced_search + fast-500 — separate track.)
- **`education` filter** — Sami still testing; track separately.
- **#4 scripted demo** — no change ever (P3); if pools are re-captured, capture with heavy (full geo) as today.

### Already handled — no change needed
- Both adapters' `geoLayer()` zip/county defaults (light renders as-is).
- #1's parallel light-pattern call, race guards, instant reach/state/coverage paints.
- #1's `unique_companies` coverage wiring.
- Map engines' state-choropleth-from-states path and state↔full transition animations.
- `shouldSkipInsights` / `isOnlyGeoChange` / `geoSeqRef` in #2/#3 — the race machinery the two-phase scheduler needs already exists.

### L1 — ✅ SHIPPED 2026-07-17 (mockup `c033d53`, deployed to arkdata-audience-builder-demo.netlify.app)
`sections:'light'` added to the `insightsCoverage` fn's DataMoon call. Live smoke test with the param in place: fn returns coverage/reach/geoStates(51) normally — inert as designed until DataMoon ships the tier. ⚠ Param name per the templates doc; if Sami's final param lands as `include` instead of `sections`, update this one call site. Note: the repo's `.netlify/state.json` points at the STALE mock-6380 site — always deploy via `deploy.sh` (targets the real demo site id).

### L2 — #2/#3: two-phase fetch in `callInsights` (the core work)
In both `App.tsx` (#2) and `AudienceBuilder.jsx` (#3), same shape:
1. `fetchInsights(spec, {tier:'light'})` on every debounced filter change → `insightsToAgg` → charts + reach + coverage + state choropleth paint at light speed.
2. Stagger `fetchInsights(spec, {tier:'heavy'})` immediately after light resolves (same `geoSeqRef` guard — a newer light must invalidate an older heavy). On heavy resolve: `insightsGeoRef`/`setGeoData` update only — distributions are identical, don't re-set chart state (see L4).
3. **Geo-first exception (investigation doc Part 4):** if the spec has any geo filter when the call fires, skip light and call heavy directly (county/ZIP shading is needed up front for the selection zoom).
4. Plumb the param: `api.ts` (#2 netlify body / #3 callable data) → fn/callable → `dmFetchInsights`/`dm(...)` payload; surface `tier` on `InsightsResponse`.
**Effort:** small-medium per surface (the scheduler; plumbing is mechanical). **Risk:** medium — race-condition surface; mitigated by reusing `geoSeqRef`/abort patterns already in the file. **Verify:** filter change → charts/reach/state-map repaint in <300ms; map drill upgrades ~3s later; rapid filter changes never show stale heavy data (spam-click test); geo-filtered spec goes straight to county/ZIP.

### L3 — #2/#3: drill gate on ZIP presence (map correctness under light)
`mapEngine.ts:572` `if (m === 'full' && !this.geoData) return` → also require `geoData` to contain any zips; `GeoMap.tsx:60` `canDrill = !!liveGeo` → `!!liveGeo?.people.zips.length` (any layer). Auto-transition: when heavy's `setGeoData` lands and the user is zoomed past the state tier, existing `applyDensity` + source-load guards handle the paint.
**Effort:** small. **Risk:** low. **Verify:** under light-only, the county/ZIP mode toggle is disabled (not an empty map); enables itself when heavy lands; no re-grow/snap on the state layer during the handoff.

### L4 — ✅ DONE 2026-07-17 (`391b99d` on app main, twin-ported to #2 in `f201e6a`)
A4 diagnosis (empirical DOM-sampling harness against the real components): **there was no remount bug** — hbars/vbars/pyramid already tween in place on data change (CSS `--chart-dur` transitions, label-keyed rows, `agg` replaced in place, `useMounted` persists). The one real defect was recharts' default `animationBegin=400`: every donut update sat dead for 400ms before its 420ms tween, reading as a snap. Fixed with `animationBegin={0}` on `Donut`/`FamilyDoughnut`. **Consequence for light→heavy:** the handoff is already glitch-safe — when heavy lands with identical distributions, bar/donut elements keep identity and don't re-animate; the L2 guidance "don't re-set chart state on heavy" remains good hygiene but is no longer a blocking prerequisite.

### L5 — #2/#3: `unique_companies` coverage wiring (when DataMoon ships it)
`insightsToAgg`: `uniqueCompanies: cov.unique_companies ?? null` (dash until vendor ships — golden rule), keep `hasCompany` fallback like #1. Note: #2's other coverage keys still use `\|\| 0` (pre-golden-rule) while #3 uses `?? null` — bring #2 to `?? null` in the same touch (twin-port rule).
**Effort:** trivial. **Risk:** none. **Verify:** Companies tile fills from insights pre-Save; absent field renders "—". *(2026-07-17: the "#2 still uses `\|\| 0`" half of this item is DONE — `f201e6a` brought #2 to `?? null` + null-safe scaling; only the `unique_companies` wiring itself still waits on DataMoon.)*

### Sequencing
**~~L1~~ (✅ shipped 2026-07-17, `c033d53`) → ~~L4~~ (✅ done 2026-07-17) → L2+L3 together per surface (#3 first, #2 twin-port same pass) → L5 when DataMoon ships the metric.** Nothing here blocks Sami — the templates doc (investigation Parts 3–4) is the only vendor dependency, and it's already written. *(2026-07-17: vendor side not live yet — Sami still building; the `sections` param currently changes nothing on `/insights`.)*

---

## 2b. Proposals surface (proposals.arkdata.io) — ADDED 2026-07-17

A fifth consumer of the builder appeared mid-plan: proposals.arkdata.io's Audience tab iframes #1's netlify demo with `?embed=insights`. Shaw's directive: **insights-only surface — never wait for the full audience pull.** Shipped same day (mockup `c63e744` → `af0db86`, all live + browser-verified):

- **`insightsAgg` fn action**: ONE stateless insights call returns the geoPoll-shaped payload (distributions converted server-side to `streamAggregate`'s agg shape; ZIPs county-joined; states deduped; coverage per the golden rule with `unique_companies` fallback). Client publishes via `__abPublishInsightsAgg` through the existing geoPoll-success pipeline. Generate ≈ 4s (was 15–25s build+CSV); no upstream audience, no PII. One **retry on 5xx** — the endpoint intermittently 500s on valid payloads (Shaw's Tennis-shoes spec failed once, passed 3/3 on retry).
- **Live re-agg on EVERY filter change** (narrowing AND widening): debounced 600ms insights re-call, no regen button, no ClientRec limits. Verified both directions (74,183 ⇄ 1,067,016).
- **Embed layout**: Intent Strength restored (`body.embed-insights #card-intent{display:block}` — the <1000px iframe was inheriting the mobile hide) with real score data; maprail reordered Coverage | Intent side-by-side, Top States full-width below (`2a806a6`).
- **Geo capability gaps closed** (global, not embed-gated — the api-15 porting-list items that never landed in the mockup): tri-state include/exclude toggles for states + cities (red ⊘ chips), ZIP radius search (haversine over `ZIP_LOOKUP.centroids`, resolved ZIP list rides `spec.loc.zip`), resolver `not_in` exclude block ported from the react fn.
- **Light/heavy note**: `insightsAgg` must stay HEAVY (map needs `geo.*.zips`); its ~4s is ZIP-transport-dominated and drops materially when the vendor tier ships. Deploy: netlify demo site alone reaches proposals (the gcp deploy only stages `proposal-builder.html`).

## 3. Notes & discrepancies

- The investigation doc's "audience.js:444 insightsCoverage" describes **#1's** fn; **#2's** fn has only the full `insights` action (`:456`, case `:522`) — the two repos' netlify fns have diverged. #2 never adopted the stripped parallel call; it went straight to full-insights-as-primary. Under L2 this difference disappears (both speak tiers).
- #3's callable does the ZIP→county join server-side (`audience-insights.ts` `joinCounties`) — under light there are no zips to join; the join must no-op cleanly (it's guarded on `d.geo.<layer>` presence, but verify it tolerates a layer without `.zips` — same `\|\| []` pattern needed if not).
- `coverage.uniqueCompanies` golden-rule tension: today's hardcoded `0` renders a lying zero on the pre-Save coverage card in #2/#3 wherever CSV agg hasn't landed — L5 fixes this as a side effect (`?? null` → "—").
- The `tier` echo is nice-to-have for the client (log/telemetry + belt-and-braces guard that a heavy response isn't applied as light); the request param is the load-bearing piece.

*All cells verified against code as of 2026-07-16 (#1 `fc5be20`, #2 HEAD, #3 main `6e65d8a`, #4 `31841a0`). Read-only; no builder code modified.*
