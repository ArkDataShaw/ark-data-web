# Coverage Card — Parallel Insights-Coverage Fetch (complete parity spec)

**Scope of this doc.** ONE feature only: how the four Coverage-card counts —
**Business email · Mobile phone · LinkedIn URLs · Companies** — get populated as fast as possible,
via a dedicated `insightsCoverage` endpoint call fired **in parallel** with Generate (independent of
the slow full-density geo pull). Nothing else. If you implement exactly what is below, the Coverage
card fills the instant the insights endpoint replies, narrows correctly under client-side filtering,
and never shows a fake number.

**Where this lives.** `public/builder/index.html` in the canonical repo `ArkDataShaw/ark-data-web`
(`main`). This is a **[CORE]** feature: it works in the standalone builder, not just the scripted
demo. Line numbers below are approximate anchors — match by function name, not line.

---

## 0. TL;DR of the mechanism (read this first)

1. User clicks Generate. The heavy path (build → poll → geoAttach → geoPoll full density) is SLOW.
2. **In the same click handler, BEFORE anything blocks, we fire `fetchInsightsCoverage(spec, seq)`** —
   a separate, non-blocking `insightsCoverage` proxy call that returns ONLY the contact-fill coverage.
3. When it resolves (fast, parallel), it maps the endpoint fields to the four card values, merges them
   into `window._geoAgg.coverage` (whatever is on screen) AND into the narrowing baseline, then repaints
   the Coverage card via `renderCoverage`.
4. When the slow geoPoll finally lands, it ALSO merges `window._insightsCov` into its agg so the counts
   survive, and it snapshots the Generate-time baseline for scaling.
5. On client-side narrowing (subtractive filters), coverage is scaled from that LOCKED baseline, not
   recomputed — so the counts stay coherent as the audience narrows.

The point: coverage counts do NOT wait for the density pull. They come from a fast side-channel call
that runs concurrently.

---

## 1. The proxy action: `insightsCoverage`

The builder talks to a backend through `callProxy({action, ...})`. Coverage uses a dedicated action
`insightsCoverage`. Its response body carries a `coverage` object with these fields (superset; only
the four mapped below are used by the card):

```
r.body.coverage = {
  total, has_email, has_business_email, has_personal_email, has_mobile_phone,
  has_direct_number, has_personal_phone, has_linkedin, unique_companies, has_company_name, ...
}
```

**Field → card-value mapping (EXACT — do not improvise):**

| Card value key | Endpoint field | Fallback |
|---|---|---|
| `businessEmail` | `has_business_email` | none → `null` if absent |
| `mobilePhone` | `has_mobile_phone` | none → `null` if absent |
| `linkedinPresent` | `has_linkedin` | `c.linkedin` (in `coverageEntries` only) |
| `uniqueCompanies` | `unique_companies` | streamed `hasCompany` if absent |

**Golden rule on absence:** a MISSING key means "the endpoint didn't compute this" → the value MUST be
`null` → the card renders an em-dash `—`. A real `0` stays `0`. NEVER coerce absent → 0 (that's a lie).

---

## 2. `fetchInsightsCoverage(spec, seq)` — the exact function

Copy this verbatim (names, guards, and order all matter):

```js
// ---- pre-Save contact-fill coverage from the insights endpoint ----
// Same source the in-app builder uses pre-Save. Fired in PARALLEL with Generate; never blocks the
// preview flow; topicless specs / failures resolve to null → the card shows "—". genSeq race-guarded.
function fetchInsightsCoverage(spec, seq){
  window._insightsCov = null;                                  // (a) clear any prior result immediately
  callProxy({ action: "insightsCoverage", spec: spec }).then(function(r){
    if (seq !== genSeq) return;                                // (b) a NEWER Generate superseded this → drop
    var cov = (r.status === 200 && r.body && r.body.coverage) || null;
    if (!cov) return;                                          // (c) no coverage → stays null → "—"
    // absent key = "endpoint didn't say" → null → "—"; a real 0 stays 0
    var m = {
      businessEmail:   (cov.has_business_email != null ? cov.has_business_email : null),
      mobilePhone:     (cov.has_mobile_phone   != null ? cov.has_mobile_phone   : null),
      linkedinPresent: (cov.has_linkedin       != null ? cov.has_linkedin       : null)
    };
    if (cov.unique_companies != null) m.uniqueCompanies = cov.unique_companies; // else hasCompany fallback stands
    window._insightsCov = m;                                   // (d) publish for the slow-pull merge (§4)
    // merge into whatever is on screen + the narrowing baseline, then repaint
    if (window._geoAgg && window._geoAgg.coverage) Object.assign(window._geoAgg.coverage, m);   // (e)
    if (window.mergeInsightsCovIntoBaseline) window.mergeInsightsCovIntoBaseline(m);            // (f)
    if (window.specDrifted && window.specDrifted()) {          // (g) user already narrowed → re-scale
      if (window.onFilterChange) window.onFilterChange();
    } else if (window._geoAgg) {                               // (h) else just repaint the card
      renderCoverage(window._geoAgg, false);
    }
  }).catch(function(){});                                       // (i) swallow errors → card stays "—"
}
```

**Why each guard exists (do not remove any):**
- **(a)** Clearing `window._insightsCov` up front prevents a stale prior value from being merged by the
  slow pull if this new fetch fails.
- **(b)** `seq !== genSeq`: the race guard. Every Generate does `const seq = ++genSeq`. If the user
  clicks Generate again, `genSeq` advances; a slow in-flight coverage response with the old `seq` is
  dropped so it can't overwrite the newer audience's numbers.
- **(c)** Endpoint 500 / topicless spec / empty body → return early → `window._insightsCov` stays null →
  card shows `—`. (The vendor returns 500 on topicless requests; this must not throw.)
- **(d)** `window._insightsCov` is the shared handoff to the slow geoPoll path (§4).
- **(e)** Merge into the on-screen agg so if the map/agg already rendered, the card updates now.
- **(f)** Merge into the LOCKED Generate-time baseline so subsequent client-side narrowing scales from
  real coverage (§5).
- **(g)/(h)** If the user already changed filters since Generate (`specDrifted()`), re-run the client
  narrowing path (which calls `patchCoverage`); otherwise just repaint the card directly.
- **(i)** Any network/parse error is swallowed → card stays `—`, never breaks the preview.

---

## 3. The call site (parallel, non-blocking) — inside the Generate handler

In `document.getElementById("generateBtn").onclick`:

```js
const seq = ++genSeq;                 // MUST be captured before the fetch
clearTimeout(pollTimer);
const spec = buildSpec();
window._lastSpec = spec;
// ... reset _mapRows/_gotMap/_geoPullDone, show previewArea, setGenerating(true) ...
fetchInsightsCoverage(spec, seq);     // ← PARALLEL, NON-BLOCKING. Fires here, before the slow pull.
// ... then onNewGenerate() / the slow build→poll→geoAttach→geoPoll path continues ...
```

**Critical ordering rules:**
- `const seq = ++genSeq` happens ONCE per Generate, and the SAME `seq` is passed to
  `fetchInsightsCoverage` AND used by the slow poll path's own `seq !== genSeq` guards. They share one
  monotonic counter. Do not give coverage its own separate counter.
- `fetchInsightsCoverage` is called with **no `await`** — it is fire-and-forget. It must NOT be awaited,
  or you serialize it behind the slow path and defeat the whole point.
- It is fired AFTER `previewArea` is shown (so the `#coverageStats` element exists to repaint) but
  BEFORE the slow build/poll begins.

---

## 4. The slow-pull merge (so coverage survives when density lands)

When the full geoPoll finally resolves and builds `window._geoAgg`, it must fold in the
already-fetched insights coverage. In the geoPoll success handler:

```js
window._geoData = geoData; window._geoAgg = d.agg || null;
// merge the parallel insights contact-fill coverage into the streamed agg (the CSV-derived agg
// only has email/company; the four contact-fill counts come from insightsCoverage)
if (window._geoAgg && window._geoAgg.coverage && window._insightsCov)
  Object.assign(window._geoAgg.coverage, window._insightsCov);
// snapshot the Generate-time coverage baseline (includes total) for patchCoverage scaling
_baselineCoverage = (d.agg && d.agg.coverage) ? Object.assign({}, d.agg.coverage) : null;
```

Two things happen here, both required:
1. **Merge** `_insightsCov` onto the density agg's coverage so the four counts aren't lost when the
   density agg (which lacks them) replaces the on-screen agg.
2. **Snapshot** `_baselineCoverage` = a copy of the Generate-time coverage (with `total`), the fixed
   reference used to scale coverage on narrowing (§5).

Ordering race handled: whichever arrives first (fast insights vs slow density), the other folds it in —
insights merges into `_geoAgg` if it exists (§2e), and density merges `_insightsCov` if it exists here.

---

## 5. Narrowing: scale from the LOCKED baseline (never recompute)

On client-side subtractive filtering, the per-record sample can't reliably see the contact-fill
columns, so coverage is SCALED from the locked Generate-time baseline by the narrowed ratio:

```js
window.mergeInsightsCovIntoBaseline = function(m){ if (_baselineCoverage) Object.assign(_baselineCoverage, m); };
function patchCoverage(cov, count){
  var ref = _baselineCoverage;
  if (!ref || !(ref.total > 0)) return cov;      // no baseline → return unscaled (stays null → "—")
  var ratio = count / ref.total;
  var scale = function(v){ return v == null ? null : Math.round(v * ratio); };  // null stays null
  return Object.assign({}, cov, {
    emailPresent:    scale(ref.emailPresent),
    hasCompany:      scale(ref.hasCompany),
    businessEmail:   scale(ref.businessEmail),
    mobilePhone:     scale(ref.mobilePhone),
    linkedinPresent: scale(ref.linkedinPresent),
    uniqueCompanies: scale(ref.uniqueCompanies),
    total:           count
  });
}
```
`clientAggregate()` (the narrowing re-aggregator) sets `coverage: patchCoverage({...}, count)`, so the
four counts scale proportionally as the visitor removes people. `null` values stay `null` → `—`.
`mergeInsightsCovIntoBaseline` (called from §2f) folds a LATE insights response into the baseline so
even coverage that arrives after narrowing began still scales correctly.

---

## 6. Rendering: `coverageEntries` + `renderCoverage` (the exact read + display)

```js
function coverageEntries(A){
  var c = (A && A.coverage) || {};
  var nn = function(v){ return v == null ? null : v; };  // undefined AND null → "—"
  return [
    ["Business email",  nn(c.businessEmail)],
    ["Mobile phone",    nn(c.mobilePhone)],
    ["LinkedIn URLs",   nn(c.linkedinPresent != null ? c.linkedinPresent : c.linkedin)],
    ["Companies",       c.uniqueCompanies != null ? c.uniqueCompanies : nn(c.hasCompany)]
  ];
}
function renderCoverage(A, est){
  var cov = document.getElementById("coverageStats"); if(!cov) return;
  var D = '<span class="dots">···</span>';
  cov.innerHTML = coverageEntries(A).map(function(e){
    var v = e[1];
    var txt = est ? D : (v == null ? "—" : v.toLocaleString());          // null → em-dash
    var tip = (!est && v == null) ? ' title="Save the audience to compute contact coverage"' : '';
    return '<div class="stat"><span class="stat-ico">' + (STAT_ICONS[e[0]] || "") +
           '</span><div class="n"' + tip + '>' + txt + '</div><div class="l">' + e[0] + '</div></div>';
  }).join("");
}
```
- The **label doubles as the `STAT_ICONS` lookup key** — "Business email" / "Mobile phone" /
  "LinkedIn URLs" / "Companies" must match `STAT_ICONS` keys exactly or the icon is missing.
- `est === true` (estimate/pre-data) renders animated dots `···`; `false` renders the real number or `—`.
- Value → `.toLocaleString()` for comma grouping; `null` → `—` with a "Save to compute" tooltip.

---

## 7. Required globals / dependencies (must all exist)

| Name | Role | If missing |
|---|---|---|
| `callProxy({action,...})` | backend transport; must support `action:"insightsCoverage"` | no coverage ever fetched |
| `genSeq` (let, `++` per Generate) | monotonic race guard shared by coverage + slow pull | stale responses clobber |
| `buildSpec()` | current audience spec passed to the action | wrong/no spec |
| `window._insightsCov` | fast-result handoff to slow pull | counts lost when density lands |
| `window._geoAgg` `.coverage` | on-screen agg the card reads | nothing to repaint |
| `_baselineCoverage` (closure) | locked Generate-time coverage for scaling | narrowing can't scale |
| `window.mergeInsightsCovIntoBaseline(m)` | fold late coverage into baseline | late fetch won't scale |
| `window.specDrifted()` | did filters change since Generate | wrong repaint branch |
| `window.onFilterChange()` | re-run client narrowing (→ patchCoverage) | narrowed card not re-scaled |
| `renderCoverage(A, est)` / `coverageEntries(A)` / `STAT_ICONS` | render | card doesn't paint |
| `#coverageStats` element | the card body | render no-ops |

---

## 8. DEMO note (scripted `?script=1` only) — do NOT confuse the two paths

In the scripted homepage demo there are TWO coverage mechanisms, and they must not fight:
1. **This feature** (`fetchInsightsCoverage`) still runs at the canned Generate. The snapshot BAKES the
   `insightsCoverage` response (`responses.insightsCoverage.coverage` in `snapshot-pool.json`), and the
   canned proxy serves it with only ~350ms theatrical latency (vs the geoPoll, which is HELD until the
   final beat). So the real endpoint counts land fast, at Generate.
2. **Per-stage baked painting** (`embed-script.js` `_setStageMeta`): paints `st.coverage.*` from each
   stage so the four counts also NARROW chapter-by-chapter (e.g. 132,404 → … → 61) during the scroll.
   `_setStageMeta` builds the four `.stat` tiles once (`if(!cov.querySelector('.stat')) renderCoverage`)
   then sets `.n` textContent per tick.
- These coexist: (1) is the CORE fast-fetch (also in standalone builder); (2) is demo-only narration.
  When porting to a NON-demo builder, implement ONLY §1–§7. Do not port `_setStageMeta` coverage.
- `window.__arkScripted === true` makes the scripted funnel own reach/coverage (suppresses live re-agg
  that would stomp the baked per-stage numbers on scroll-up). Don't let §2's repaint fight the baked
  per-stage values in demo mode.

---

## 9. VERIFY (a change is DONE only when ALL pass)

1. **Fires in parallel:** In the Generate handler, `fetchInsightsCoverage(spec, seq)` is called with no
   `await`, before the slow build/poll. Network tab: the `insightsCoverage` request starts at the same
   time as Generate, not after geoPoll.
2. **Populates from the endpoint:** With a real `insightsCoverage` response, the four card numbers equal
   `has_business_email`, `has_mobile_phone`, `has_linkedin`, `unique_companies` (comma-formatted).
3. **Absent → em-dash, not 0:** Force a response missing `has_linkedin` → the LinkedIn URLs tile shows
   `—` (with the "Save to compute" tooltip), NOT `0`. A response with `has_linkedin: 0` shows `0`.
4. **Race guard:** Click Generate twice quickly; the first (slow) coverage response is dropped
   (`seq !== genSeq`) and does not overwrite the second audience's numbers.
5. **Survives density:** After the slow geoPoll lands, the four counts are unchanged (merged via
   `Object.assign(_geoAgg.coverage, _insightsCov)`), not blanked.
6. **Scales on narrowing:** Remove people via a subtractive filter → the four counts drop proportionally
   (`patchCoverage` ratio), `total` = new count, nulls stay `—`.
7. **Late coverage still scales:** If `insightsCoverage` resolves AFTER the user narrowed, the counts
   appear already scaled to the current narrowed audience (via `mergeInsightsCovIntoBaseline` + re-run).
8. **Never blocks/breaks:** Kill the `insightsCoverage` endpoint (500) → preview still generates, map +
   other charts render, coverage shows `—`. No thrown error, no hang.

---

## 10. Reference implementation
Canonical, verified: `public/builder/index.html` on `main` (`ArkDataShaw/ark-data-web`) —
functions `fetchInsightsCoverage`, `coverageEntries`, `renderCoverage`, `patchCoverage`,
`mergeInsightsCovIntoBaseline`, the Generate `onclick` call site, and the geoPoll merge/baseline
snapshot. Diff a target builder against these to see the exact deltas; this doc is the rulebook.
