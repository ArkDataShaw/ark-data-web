# Brief: Light/Heavy Insights — Audience-Builder Impact Audit

**From:** Shaw (via transcript-player agent) · **Date:** 2026-07-16 · **Type:** read-only audit, no builder code touched.

## What changed (the trigger)
DataMoon (Sami) is splitting the insights endpoint into **two tiers via a request parameter** (`include`/`sections`),
NOT a new endpoint:
- **LIGHT (fast, ~50-few-hundred ms):** reach + distributions + coverage + `geo.{layer}.states` — everything
  EXCEPT the per-ZIP/per-county geo. State choropleth paints instantly.
- **HEAVY (~3-4s):** today's full response — adds `geo.{layer}.zips` (+`counties`). Upgrades the map state→county/ZIP.

The ~3-4s latency today is dominated by the ZIP arrays (×3 layers, ~38k ZIPs). Light strips them.

**Full spec + both JSON templates + shared additions:**
`/home/shaw/repos/audience-builder-react/docs/insights-endpoint-investigation.md` (Parts 2/3/4/5/7). Read it first.

## Constraint from Sami (2026-07-16) — do NOT design around this being available
`company_description` + `education` (and the "company description contains" keyword filter) are only carried on
**non-intent (advanced_search)** audiences today, NOT on **intent (topic-based)** audiences. Insights **requires
`topic_ids`** (intent) → the company_description filter **cannot land on insights yet** (flagged to DataMoon's data
team, awaiting rollout). So: scope the insights light/heavy work as if that filter does NOT exist on insights.
The fast/heavy split and fast-500 endpoint are unaffected and proceeding.

## The ask — audit how the builder must change to exploit light-then-heavy
Apply your 4-surface method (#1 HTML standalone, #2 React standalone, #3 app.arkdata.io, #4 arkdata.io iframe).
For each surface + the shared API/adapter layer, verify against actual code and answer:

1. **Fetch path today.** Where each surface calls insights (`api.ts` / netlify fns / Firebase callables), whether
   it's one blocking call, and what currently gates first paint. Confirm which surfaces even hit live insights vs.
   baked pools (the iframe/demo surfaces are baked — likely N/A for the two-phase fetch).
2. **Two-phase readiness.** What it takes to fire LIGHT on every filter change and HEAVY staggered after (or HEAVY
   directly when a geo filter is present up front — the geo-first exception). Does the adapter already tolerate
   `zips:[]`/missing counties (per the investigation doc, `insightsToAgg`/`geoLayer()` defaults them to `[]` → light
   should render with no adapter change)? Verify that claim in `insightsAdapter.ts` and the app's equivalent.
3. **Map upgrade path.** Can the map render a state choropleth from `geo.*.states` first, then auto-transition to
   county/ZIP when heavy resolves — without a re-grow/snap? Cross-reference your §7 map findings and the A4 tween work.
4. **What blocks on geo that shouldn't.** Any chart/coverage/distribution rendering currently waiting on the full
   insights response that could paint at light-tier speed instead.
5. **The `tier` echo field + request param.** Where the `sections`/`include` param and the `tier` response field wire
   in per surface.
6. **Shared additions (Part 5) that ARE in scope for insights:** `tier` field; unique-companies count in coverage
   (`coverage.uniqueCompanies` is 0 today, filled from CSV — where would `unique_companies`/`has_company` wire into
   the coverage block + `insightsToAgg`). EXCLUDE the company_description filter per the constraint above.

## Deliverable
`docs/audience-builder-lightheavy-audit.md` — same rigor/format as `docs/audience-builder-version-audit.md`:
a per-surface matrix of current fetch behavior + a prioritized change list (effort/risk/verify) for adopting
light-then-heavy, plus explicit "already handled / no change needed" and "blocked (company_description)" callouts.
Read-only — do not modify builder code. Sequence this AFTER you finish the current A-tier porting work unless it
conflicts; flag any overlap with A4 (map/chart tween) since heavy→light map transition depends on the same remount fix.
