# Audience Builder — Chart & View Rules (full lineage catalog + intent)

**Compiled:** 2026-07-13 (arkdata-web-opus-5)
**Scope:** Every display rule, threshold, layout decision, and visual behavior for the
**audience builder and its charts** — filter chips in the strip, the insights grid /
three-quarter charts, the state→cities swap, the coverage card, the Intent Strength chart,
chart loading/animation, and the map — **plus Shaw's intent and the *why* behind each.**
**Excludes** the website/homepage scroll-demo takeover mechanics (beat-snap, sentence-overlay
band, chip fly/morph flight) — see `docs/superpowers/specs/2026-07-12-desktop-beat-snap-scroll-design.md`.

**Sources:** mined from the four `arkdata-web-opus` session transcripts (opus-1 → opus-4) plus
git history. Where a rule evolved or reversed, the **final/current state** is marked. Generation
that made each decision is noted in brackets, with commit hashes where known. Shaw's exact words
are quoted verbatim (including his original typos) where captured.

**Related living specs:**
- `docs/builder-layout-and-chart-loading-spec.md` — `[CORE]`/`[DEMO]`-tagged layout + chart-loading rules with verify steps
- `docs/coverage-insights-fetch-spec.md` — coverage card parallel-fetch spec + exact code
- `docs/superpowers/specs/2026-07-10-desktop-deal-story-demo-design.md` — desktop deal-story design

**Ground-truth files:** `public/builder/index.html` (`[CORE]` `renderCharts`), `public/builder/embed-script.js`
(`[DEMO]` `?script=1` per-stage paint), `public/builder/stages-pool*.json` (baked per-stage data),
`public/builder/snapshot-pool.json` (baked final-audience agg).

---

## 0. Design philosophy — Shaw's guiding principles

Almost every individual rule below is an expression of one of these cross-cutting principles. When
in doubt about a new chart/view decision, reason from these — they are what Shaw actually optimizes
for.

### P1. "This is real" — real data, never mock
The demo is architecturally an honest snapshot of what the product produces: every reach number,
chart bar, coverage count, and map density is a **real DataMoon insights-API response captured ahead
of time and baked** for instant load — never fabricated. **Shaw, when the agent proposed inventing a
prettier revenue distribution:** *"I thought we're actually capturing the data by running an insights
api call on each set of filters and grabbing the counts for every single surface we display just like
we would in a real live audience pull, but doing so beforehand so that we can save it and make it all
load faster."* [opus-1] Fabricating any distribution "would undermine the whole 'this is real'
premise." This is the root principle; P2, P5, P6 all descend from it.

### P2. Rerun-safe — no over-promise (the honesty test)
The demo must not show a value a prospect could disprove by running the same audience in the live
product. This is the governing constraint that overrode a nicer-looking chart in the Intent Strength
saga. **Shaw, catching himself mid-approval:** *"I was going to say looks good, but I realize that if
somebody actually reruns the same audience that's currently in there, then high-intent gets wiped
out."* [opus-4] The test for any designed/curated number: *would a prospect who runs this exact
audience feel over-promised by what the demo showed?* If yes, it's forbidden — even in a curated
highlight reel. The canonical operationalization: the **Intent Strength High bar is capped at ≤1%
*while in the demo*** (a token bar that can't over-promise), while the **live `[CORE]` builder always
shows real, accurate, uncapped data** — so a prospect who reruns the exact audience sees the truth,
never a demo number they can't reproduce. The cap is a `[DEMO]` presentation rule, not a change to the
product's real numbers.

### P3. No live data before the demo ends
The scripted section is hermetically sealed from live API calls — everything is canned/baked; live
calls only activate after the visitor crosses into free exploration. **Shaw:** *"I thought we weren't
using any live data before we transition out of the demo section?"* [opus-1] Both a performance
principle (consistent instant load) and an honesty one (numbers can't shift on repeat viewings).

### P4. App-parity — show the real app, not a prettier version
The demo must look and behave like the actual product so a prospect's mental model survives contact
with it. This drove: purple chips (*"That's how it works on the app itself anyway, and that's how it
should work here"* [opus-3]), the strip matching the real React app exactly, real baked numbers over
approximations, and covering (not hiding) the app's top bar so it reads as "a full application."
Corollary: **good ideas born in the demo get pushed into the product** — the state→cities swap and
the nationwide `fitBounds` fix were both explicitly designated for *all* versions of the builder,
not just the demo.

### P5. Declutter the demo — remove explanation, keep signal
During the scripted story the sentences do the explanatory work, so labels/captions that explain what
the builder shows become noise. Shaw serially removed: the map caption, the audience title bar, the
"Building full density…" pill, the ◌ Generating glyph, the "metro" suffix, "Unique"→"Companies",
"Create New"→"Create". The pattern: every piece of UI that explains or labels something the visitor
already understands is noise.

### P6. Charts must visibly change during the story — or be removed
Every visible chart should participate in the beat-to-beat narrowing; a chart that never visually
moves is dead weight. Shaw pushed to make coverage, top-states, age/gender, homeownership, and family
all live-update per stage — and when Intent Strength's distribution stayed visually static during
geo-narrowing, he **removed it from the demo maprail** rather than leave a frozen chart. This is why
real per-stage data (not one distribution scaled by reach) matters: the charts must show *what
actually changes about the audience*, not just a shrinking count.

### P7. No glitchy jumping — pixel stability to a product standard
**Shaw:** *"this looks glitchy and unprofessional"* (strip height jump) and *"We don't want any glitchy
looking jumping"* (reversibility). Any pixel-level layout shift, chart re-sweep, or fake loading state
visible during the demo is unacceptable. In-place tweens read as "data updating"; re-sweeps/jumps read
as "broken/reloading."

### P8. Surface discipline — [CORE] engine vs [DEMO] layer, container-width, tri-view tagging
The builder is a shared engine. Every change is tagged **`[CORE]`** (applies to *every* version of
the builder) or **`[DEMO]`** (only under `?script=1`), so future ports know exactly what to carry.
All builder `@media` queries are **container/iframe-width, NOT device-width** (the builder is iframed
and never sees the device viewport) — the only device-viewport query is the `<960px` React parent
switch between `BuilderScrollDemo` and `MobileSentenceDemo`. Shaw's standing instruction: **tag every
change with the view(s) it affects — DESKTOP (≥960px device) / TABLET (680–1000px iframe) / MOBILE
(<680px iframe)** — to prevent regressing shipped mobile/tablet while working on desktop.

### P9. Surface the most relevant insight to the top
**Shaw:** *"surfacing the most relevant insights to the top."* [opus-2] Chart slots adapt to what's
most informative given the current filters (states→cities), and the insights order reflects the
audience's story arc.

### P10. Full reversibility is non-negotiable
Scroll-up must be as clean as scroll-down. **Shaw:** *"if the user scrolls back up, I want full
reversibility… We don't want any glitchy looking jumping."* [opus-1] The rejected alternative — the
builder vanishing on scroll-up — is what makes this a first-class requirement, implemented via the
`__arkScripted` guard that stops live re-agg from stomping baked per-stage values.

---

## 1. Filter chips in the strip

### Layout & height
- **Strip = `flex-wrap:nowrap` + internal wrap; `wrapchips` deleted.** The reach count and chip area
  sit in ONE flex row; chips wrap *inside* the `.stripchips` cell (`flex-wrap:wrap; flex:1;
  min-width:0`). The old "drop chips to a full-width row once >3 filters / 3-row cap" behavior was
  removed. [opus-3, `f2069fc`]
  - **Why / Shaw's intent (P4):** match the real React app exactly. **Shaw:** *"Let's fix the filters
    strip… The react standalone's desktop strip is `.strip { flex-wrap:nowrap; min-height:55px }` with
    `.stripchips { flex-wrap:wrap; flex:1 }` — no max-height, no 3-row cap, no wrapchips. It grows from
    the very first wrapped row, same as the app."* Strip "thickness" is a function of **chip
    densification** (grouped states, merged ranges, K-tiers, exclusion glyphs), not a hard cap.
    Rejected: keeping the mockup's `wrapchips` count-threshold reflow, and the phantom "desktop 3-row
    cap" — confirmed to exist in no real codebase.
- **M1 strip-height floor: fixed 55px for 1–2 rows, grows only on row 3.** With chip `H≈22px`, gap
  `G≈5px`: `2H+G ≤ 55 < 3H+2G` (49 ≤ 55 < 76). Pure CSS math, no JS. **Vertical padding on `.strip`
  MUST be 0** (`box-sizing:border-box`) — leftover `padding:12px` stole the floor and made the strip
  grow at row 2. Verified 1 row=55px, 2 rows=55px, 3 rows=77px. [opus-2/3, `d9c8cc5`]
  - **Why:** Shaw wanted the strip to feel "thick" at 2 rows without growing prematurely. The 55px
    floor is emergent CSS math (floor vs chip-height), not an intentional cap — consistent with the
    "no cap" app-parity rule above.
- **Chip must be stable height on load — always `inline-block`, never `inline`.** A chip switching
  `display:inline → inline-block` during fly-in made its 1.5px vertical padding suddenly count toward
  line-height only while entering → the strip jumped ~3px on load (measured 67.9px → 70.9px). Fix:
  chips are always `inline-block; line-height:1.2`. `wrapok` (multi-word, wrap-allowed) chips stay
  `inline` because they fade rather than slide and need cross-line wrapping. [opus-1]
  - **Why / Shaw's intent (P7):** **Shaw:** *"the height of that filter chip is a bit larger than the
    others, causing the strip to jump when it loads, this looks glitchy and unprofessional. This may
    be happening with other chips on load."* Pixel-level stability is the baseline for a polished
    marketing demo; the fix was made global ("fixes every chip's load-jump, not just millionaire").

### Color & type
- **Desktop strip chips are purple (violet):** `.chip` = `background:#f5f3ff (--violet-50);
  color:#7c3aed (--violet)`; group `<b>` bold @0.75; ✕ cursor pointer. Global restyle across
  DESKTOP/TABLET/MOBILE + /Demo (mobile sentence highlights were already violet; only desktop `.chip`
  was gray/slate). [opus-1 origin, opus-3 `22a725d`]
  - **Why / Shaw's intent (P4):** three options were offered — (A) purple only in sentence/fly-in,
    (B) purple everywhere permanently, (C) two styles coexisting. **Shaw chose B:** *"B. That's how it
    works on the app itself anyway, and that's how it should work here. It should also look like that
    in mobile. Free play are purple as well."* Honesty over decoration: the chip color is the app's
    real `.pk-chip` color; divergence would break the visitor's mental model when they try the product.
- **Exclusion chips stay RED** (`.chip.excl` = `#fef2f2 / #fecaca / #dc2626`). [opus-3]
  - **Why:** red carries the "remove/reject" semantics — a pre-existing app convention Shaw did not
    override during the purple restyle.
- Chip resting padding `1.5px 5px`, radius `6px`, weight `600`, `white-space:nowrap`,
  `box-decoration-break:clone`. `.ss-reach` reach number `1.25em/800/tabular-nums`; `.ss-join`
  prepositions de-emphasized `slate-700/500`. [opus-1]

### Densification & indicators
- **K-tier chips** and **grouped-state chips** (multiple states collapsed to one chip) already ship
  in the mockup — no new porting. These *are* the "strip thickness" story (see the nowrap rule). [opus-3]
- **Presence dot (`.sub-dot`)**: a small static violet dot in a subcategory's `.sub-h` header (left of
  the `+/−`) whenever `subCount(sub) > 0` (any active filter). Presence only, no count. Visible only
  while the sidebar is open AND the parent accordion is open (structural — it lives in `.acc-body`,
  which collapses to `grid-template-rows:0fr` when closed). [opus-3, `6ec44d7`]
  - **Why / Shaw's intent (P9):** **Shaw:** *"determine the best way to implement the mentioned dot
    next to each subcategory when a filter is added. These dots are only visible while the sidebar menu
    is open and the respective category… is open."* **Presence, not count** — the exact count already
    lives at the category-level `.acc-badge`; the subcategory dot is additive navigation signal, not
    redundant counting.

### Location chip / sentence-geo rule
- **A metro/city implies its state → drop the implied state from the chip; strip "metro"; `Fort→Ft.`**
  Intended per-state logic: `impliedStates(group)` from selected cities/metros; keep a state only if
  not implied; push cities bare when their state is implied, keep `", ST"` only for cross-state
  disambiguation. Display-only — map scope/reach always read `S.loc.*.state`. Examples: FL + Miami/
  FtLaud metros → "in Miami & Ft. Lauderdale"; FL + "Miami, FL" → "in Miami"; FL + GA + "Miami, FL" →
  "in GA, Miami" (GA kept, FL dropped); FL + "Austin, TX" → "in FL, Austin, TX". [opus-2 origin,
  opus-3 spec addendum I.2]
  - **Why / Shaw's intent (P5):** narrative compression. **Shaw's rationale (spec):** *"the narrative
    sentence reads 'in Miami', not 'in Miami, FL', once FL is implied."* The sentence should read like
    natural English, not a filter enumeration — "Miami & Ft. Lauderdale" already implies Florida, so
    "FL" is redundant. (The shipped code uses a blunter metro-drops-all-states rule; the per-state
    logic above is Shaw's documented target.)

### Title / breadcrumb / button
- **Audience title bar (`.pvtop`) hidden in the scripted demo (all beats)** — the whole `.pvtop` row
  (title, "Building audience…" spinner, `#viewSeg`), not just `#pvTitle`, so its `margin-bottom:16px`
  is reclaimed and the map moves up. Scoped `?script=1` / `body.ark-fullheight`. Also hidden on the
  mobile builder (≤1000px). [opus-2, `dcf8f83`]
  - **Why / Shaw's intent (P5):** **Shaw:** *"Let's remove the title of the audience where it says 'FL
    Homeowners -- Pool Construction Intent' and any other title that exists in that location for all
    beats."* The story sentences do the explaining; the auto-title is clutter during the demo.
- **"Generating…" button — glyph removed.** The `◌` (U+25CC) wrapped to its own line on the narrow
  mobile button, looking like a stray loading spinner. Button height 52px → 36px. [opus-2]
  - **Why / Shaw's intent (P5/P7):** **Shaw:** *"There seems to be some sort of tiny loading circle
    that appears above the 'Generating' button… Let's remove that stupid little loading spinner."* A
    decoration that misreads as a broken loading state must go.
- Top-bar breadcrumb reads **"Audiences › Create"** (bold Create), not "Create New" — declutter (P5).
  [opus-3 spec A8]
- The **top bar is covered, not hidden**, during the demo. **Why / Shaw's intent (P4):** *"We want it
  to look like a full application, and that includes the non-functional part. Plus the generate button
  will be functional once the demo is finished."* [opus-3]
- **The mobile builder has NO strip chips** — the strip renders the English sentence
  (`renderSentence`/`specSentence`); each beat is one `S` mutation. [opus-1/2]

---

## 2. The three-quarter / quarter charts (insights grid, pyramid, donuts, bars)

### Grid order & the "quarter" cards
- **B2C insights order — Row 1: Age & Gender (span 6) | Homeownership (span 3) | Family Dynamics
  (span 3); Row 2: Net Worth (span 6) | Household Income (span 6).** Income was swapped off row 1 so
  the two quarter cards (Home + Family = one half card's width) keep both rows clean 12-col rows.
  Applied by `applyInsightsOrder()` in **both** `renderCharts` and per-stage `_paintStageCharts` (else
  Income sits beside Age mid-story). [opus-2/3]
  - **Why:** "two quarter cards = one half card, so both rows stay clean 12-col rows." B2B was already
    in this arrangement; B2C was brought to match it.
- **≤820px → single-column** grid; the 12-col grid applies only **≥821px**. [opus-2/3]
- **Sparse-vbar rebalance (≥821px only):** in any 2-card row, if exactly ONE card is "sparse" (its
  `.vbars` has 1–3 bars) and the other is dense, the sparse card gets `.ins-narrow` (span 3 =
  **quarter**), the dense one `.ins-wide` (span 9 = **three-quarter**); both-sparse or both-dense →
  equal halves. `balanceSparseRows()` groups cards into rows by rect.top ±6px; called after
  `renderCharts`/`prewarmInsightCharts`/resize. [opus-2/3, spec A4]
  - **Why / Shaw's intent (P6 space-use):** **Shaw (with screenshot):** *"We need some sort of system
    that can tell when a vertical bar chart only has 1-3 columns while it's neighbor has many. In cases
    like this, it makes sense to re-adjust the width of the sparse chart from half width to quarter
    width, and the width of it's neighbor to 3 quarters width. (This should only happen in a 2-column
    row. Nothing should change if both charts are sparse.)"* Motivated by Net Worth (1 bar "$1M+ 100%")
    wasting half-width space beside a cramped 9-bar Household Income. Width should reflect data density.
- **B2C hides all B2B cards** (company size, revenue, seniority, department, industry, titles).
  Visible consumer set: Top States/Cities, Age & Gender, Household Income, Net Worth, Homeownership,
  Family Dynamics. [opus-1/2/3]

### Age & Gender pyramid
- Fixed age order `["18-24","25-34","35-44","45-54","55-64","65 and older"]` (never sort by size);
  "65 and older" → "65+". [opus-4]
- **Neutral gender-coded gradients, NOT accent-derived:** male blue `#5a7aab→#a3b1d1`, female rose
  `#c07a80→#deb5b8`; legend below; bar width = % of the max gender count in any row; container `.pyr`
  needs a definite height (~176px). [opus-1 origin, opus-4]
  - **Why / Shaw's intent (P7 legibility):** data-viz colors are *semantic to the data* (they
    distinguish male/female, income bands), not to the brand. A prior commit (`981dc5e`) derived chart
    colors from `--brand-accent`; it collapsed every series toward one hue and "**broke visual
    distinction**" — reverted immediately (`0aea698`) and locked as a hard rule. `--brand-accent` may
    replace `#7c3aed` everywhere *except* chart data-viz.
- **Real per-stage age/gender baked & painted per beat** (not one distribution scaled by reach).
  Millionaires visibly skew older + 66% male (18-24 drops out). Must be in `reassert()` (something
  transiently clears `#agePyramid`). [opus-2/4]
  - **Why / Shaw's intent (P1/P6):** scaling one fixed distribution produced a **visually identical**
    pyramid every stage (bars are normalized to the per-render max) AND was **factually wrong** —
    early stages were painting the *final* millionaire skew. **Shaw:** *"The age & Gender chart is not
    updating with each new chapter."* The real endpoint returns genuinely different shapes per stage
    ("nationwide balanced/slightly-female, millionaire male-skewed and older"), so real data both fixes
    the static look and tells the truth about how the audience changes.

### Homeownership donut
- **Keep all 3 segments (Homeowner/Probable/Renter) in the ring even at 0%** — only the legend filters
  zeros. Preserves the segment signature so it tweens instead of re-sweeping. Visibly consolidates to
  100% Owner at the homeowner beat. `renderHomeDonut` must NOT pre-filter zeros. [opus-1/2/3]
  - **Why (P7):** see donut tween below — filtering zeros changes segment identity between stages,
    which forces a full clockwise re-sweep instead of a clean in-place tween.

### Family Dynamics donut legend
- **2-column legend:** "Married" header top-left, "Single" top-right; under each, "+kids"/"no kids"
  stacked with swatch + % → 3 rows (was 4). Purple pair = Married, grey = Single. Uses the builder's
  only true CSS `@container (max-width:230px)` query (keyed to the card, not the iframe). [opus-2/3]
  - **Why / Shaw's intent (P5):** **Shaw:** *"we should have Married on the top left, and Single on
    the top right, and each '+ kids', 'No kids' stacked cleanly beneath them. That will reduce the
    amount of lines required to display this data from 4 to 3."* The layout mirrors the data's semantic
    grouping (parent category as header, subcategories beneath) and cuts a line.

### Bars (hbars / vbars)
- 4–6 entries → horizontal rows; ≤3 → vertical bars (`vbars few hbars-vmode`) driven by **`flex-grow`,
  NEVER inline height%** (`min-height:4px`) — avoids the "percentage-of-nothing" flex bug. [opus-1
  origin, opus-4]
- **Bar-thickness ladder uses `:has(> .bar:nth-child(N)):not(:has(> .bar:nth-child(N+1)))`, NOT
  `:last-child`.** The `.charttip` tooltip is appended as a trailing child, so `:last-child` snapped
  the 4/5-bar rungs thinner on hover. 4 bars → 22px, 5–6 → 19px, before AND after tooltip insertion.
  [opus-1/2/3, spec F2]
  - **Why / Shaw's intent (P7):** **Shaw:** *"when I actually activate the tooltip, the bars
    immediately get thinner, which looks glitchy."*
- **Net Worth & Household Income: high-first order + compact band labels**, identical between sidebar
  checkboxes and chart bars. Net Worth: `$1M+, $750K-1M, $500-750K, … , -$20K-$2.5K`; Income: `$250K+,
  … , <$20K`. Display-only via `nwLabel`/`incLabel`; raw option string stays the state key. [opus-2/3,
  `7f5ce0c`]
  - **Why / Shaw's intent (P4 consistency):** **Shaw:** *"the options for net worth should be styled
    such that instead of '-$20,000 to -$2,500 / … / more than $1,000,000' they should follow the labels
    in the net worth bars. And '$1m+' should be at the top, decreasing… I don't want to see '$750,000
    to $999,999' I want to see '$750K-1M'… apply this same logic to all of the net worth and income
    range options."* The sidebar must speak the same visual language as the charts; high-first matches
    how wealth tiers read (most selective at top).
- Net Worth collapses to a single 100% `$1M+` bar at the millionaire beat (intentional — filter for
  millionaires, get 100% millionaires; real data behavior, P1). [opus-3/4]
- **Single-state Top States (FL only) renders as `.vbar`, not `.bar`** (adaptive full-height low-row
  mode) — selectors querying only `.bar` miss it. [opus-1/2]

### Tooltips
- **Every bar/segment gets a tooltip in BOTH estimate and live modes** via `tipBind`; estimate shows
  `···` (not NaN/blank). Native `title=` removed. `vbars` previously gated tooltips behind `if(!est)`
  so vertical charts had none during estimate — fixed. Dark tooltips. [opus-1/2, `6aacf6d`]
  - **Why:** parity/completeness — every chart type should behave identically on hover/tap regardless
    of estimate vs live.
- **Touch tap-forward in the demo:** iframe is `pointer-events:none` (scroll passes through), so the
  parent forwards genuine taps via `ArkEmbed.tapTooltipAt(x,y)` (touchend, <10px move, <500ms → tap;
  swipes bubble). Works on hbars/vbars/histograms/donut/pyramid; auto-dismiss ~2.6s. [opus-2]

---

## 3. State chart → Cities replacement

- **Core rule (ALL versions, not demo-only): when any state filter is active, the maprail geo card
  swaps Top States → Top Cities**, and the redundant insights-grid `#card-cities` is hidden. Header
  `#topStatesH` switches "Top states" ↔ "Top cities" ("Top cities (HQ)" when company basis).
  `hasStateSel()` checks personal/professional/company `state.size>0`. [opus-2, `renderCharts`]
  - **Why / Shaw's intent (P9, P4):** once a state is picked the Top States chart is trivial (one bar),
    wasting the most prominent geo slot. **Shaw:** *"When we select a state, we should swap the top
    states chart with the top cities chart… when the user… may select filters that don't include a
    state, in which case, the states chart should remain where it is. I feel this is actually a really
    good idea and should be used in all versions of the audience builder, surfacing the most relevant
    insights to the top."* Shaw introduced this himself as a novel idea and immediately made it
    universal — a demo idea pushed into the product.
- Applied per-stage in the demo too (`_paintStageCharts` mirrors `hasStateSel()`): nationwide → Top
  States (CA/FL/NY/TX/PA/IL); FL onward → Top Cities (Miami/Jacksonville/Orlando → narrowing to Ft
  Lauderdale/Miami). Real per-stage cities baked. [opus-2/3/4]
- **`#card-cities` hidden per-stage** (not just at the final reveal) and at beat 0 (no cities data) —
  prevents a "loading-then-disappear" flash (P7). [opus-2/3]
- **Seniority/Department reflow to halves when cities is promoted (≥821px):** with `#card-cities`
  removed from its 3-across row, `#card-seniority`/`#card-department` go span 4 → span 6 via a
  `.cities-promoted` class in both render paths. No reflow ≤820px. [opus-2/3, spec A3]
  - **Why / Shaw's intent:** **Shaw:** *"now we need to resurface the row that has the seniority and
    department charts (currently in a 3 column configuration) to 2 columns/charts, just like the row
    below it (only when we replace the top states with the top cities chart)."* Don't leave two
    stranded narrow thirds when the third card vanishes.
- **States→Cities bars tween positionally:** on the swap, bar 0 resizes from California's width to
  Miami's width while only the label text swaps instantly (row-index matched). [opus-4]
  - **Why / Shaw's intent (P6/P7):** **Shaw:** *"including the transition from top states to top
    cities, such that the bars are what transition in value and position, because even though the state
    names are replaced with city names, we still want a smooth transition from the previous value to
    the next value as far as each bar is concerned."*

---

## 4. Coverage card

- **Four tiles, fixed order & labels:** Business email (`has_business_email`), Mobile phone
  (`has_mobile_phone`), LinkedIn URLs (`has_linkedin`), **Companies** (`unique_companies`). The label
  doubles as the `STAT_ICONS` key — label and key MUST match or the icon disappears. LinkedIn uses the
  official "in" SVG; LinkedIn URLs masked in the records table. [opus-1 origin, opus-2 spec A7]
  - **Why / Shaw's intent (P4):** these four are the product's core contactability/reachability
    metrics. **Shaw named all four explicitly:** *"'Business Email' Mobile Phone, LinkedIn URLs, and
    Unique Companies."* "Companies" replaced "Unique Companies" as a shorter label (P5): *"let's replace
    'Unique Companies' with just 'Companies'."*
- **Golden rule: absent field → `null` → em-dash `—`, never `0`.** A real 0 stays 0; a missing key
  means "not computed" → `—` (tooltip "Save the audience to compute contact coverage"). Estimate mode
  shows `···`. [opus-1/2/3]
  - **Why / Shaw's intent (P1 honesty):** a fake 0 misrepresents; `—` honestly signals "no data." Shaw
    commissioned the coverage spec asking for it to be "impossible to fuck up," which is why this is a
    named golden rule.
- **Icons moved top-right → BOTTOM-right** (`bottom:11px; right:11px`, 15px SVG). [opus-1 origin
  top-right, opus-2 moved, spec A6]
  - **Why / Shaw's intent (P7):** **Shaw (screenshot):** *"the largest numbers are clipping over them.
    Is that the right direction for this fix?"* The number anchors top-left, the label bottom-left, so
    the bottom-right corner is the only always-clear zone.
- Tile CSS: `.statrow` 2-col grid gap 11px; `.stat` slate-50, radius 11px, padding 11px; `.stat .n`
  21px/800/tabular-nums; `.stat .l` 11px uppercase slate-500. [opus-1]
- **Parallel non-blocking fetch:** `fetchInsightsCoverage(spec, seq)` fires fire-and-forget at Generate
  (before the slow geoPoll), `genSeq`-guarded (`seq !== genSeq` drops stale). Coverage is the
  *pre-Save* source (the CSV/geoPoll can't see email/mobile/LinkedIn). Field map:
  `has_business_email→businessEmail`, `has_mobile_phone→mobilePhone`, `has_linkedin→linkedinPresent`,
  `unique_companies→uniqueCompanies`. On resolve, `Object.assign(_geoAgg.coverage, _insightsCov)`. On
  failure/topicless → null → `—`, never breaks preview. [opus-1/2/3, `d29003d`]
- **Narrowing scales from a locked Generate-time baseline** (`round(v * count/ref.total)`), never
  recomputed; nulls stay null. [opus-3]
- **Per-stage baked counts** painted from beat 0 via `_setStageMeta(idx)` inside every `beatOn`.
  `__arkScripted=true` suppresses live re-agg stomping baked numbers on scroll-up (P10). Tiles built
  once via `renderCoverage(...)`, then only `.stat .n` overwritten per tick. [opus-1/2/3/4]
- On iPad the coverage card grows (JS-measured height — inside the sticky full-height iframe `vh`/`dvh`
  resolve to the iframe's own ~4233px height, not the device) to fill the ~450px gap below the 360px
  map; font enlarged; phones unaffected. [opus-2]
  - **Why / Shaw's intent (P6):** **Shaw:** *"when we're showing the mobile view but it's on an ipad,
    we can see blank space below the map. It may be helpful to display the coverage div as we
    performatively narrow the audience, updating the 4 key numbers as the map updates."* Shaw both
    named the problem and proposed the fill solution.

---

## 5. Intent Strength chart — (evolved through 4 phases; **final state marked**)

**This chart is the single richest case study of P2 (rerun-safe / no over-promise) in the whole
lineage.** Placement first, then the full evolution and reasoning.

### Placement
- Lives in the always-visible **maprail**, id `#card-intent`, rendered by `vbars('intentBars', …)`.
- **Dropped from the mobile / full-height scripted maprail:** `body.ark-fullheight #card-intent{
  display:none}` — there the maprail is just Coverage + Top States/Cities. Still shown in standalone
  /Demo. [opus-2]
  - **Why / Shaw's intent (P6):** Intent Strength's Low/Med/High *distribution* doesn't change during
    geo-narrowing (intent quality is independent of geography), so the bars visually froze while every
    other chart moved. The agent noted this; **Shaw:** *"Let's actually remove intent strength from
    that list of three charts and just make it a two column chart."* A chart that never visibly changes
    is dead weight in the maprail — remove it rather than leave it frozen.

### The 4-phase evolution (opus-4) — each phase reversed the last
1. **Fixed 25/45/30 mock** (Low 25% / Med 45% / High 30% of reach). Nothing tweened — proportions
   never changed, so bar heights were byte-identical every beat. **Shaw:** *"Intent strength doesn't
   seem to be changing at all."*
2. **Per-beat narrative split, "High decreases, never above 9%"** (High 9→7→5→3%; `4bdb3f6`). Three
   options were weighed — A: real data (~0% High, "openly undercuts the high-intent pitch"); B: keep
   it mock but make it move; C: drop the card. **Shaw chose B, refined toward truth:** *"Option b but
   make it reflect reality, we want high intent to decrease as the audience gets smaller like it
   actually does. Never appearing aboe 9%."* The real raw High *count* does fall (1776→110→11→1), so
   the designed split honored that **direction** — narrative truth, not fabrication. Rejected A
   (damaging truthful data point) and C (Shaw wanted the chart in the story).
3. **Reversed to REAL `score_category` data** (`3e1017d`). **Shaw, mid-approval:** *"I was going to say
   looks good, but I realize that if somebody actually reruns the same audience that's currently in
   there, then high-intent gets wiped out."* The credibility gap: demo showed 9→3% High, but a live
   rerun returns ~0.4%. **P2 (rerun-safe) overrode the nicer narrative.** Real: Low 68→70→68→75%, Med
   32→29→30→24% (Medium becomes the tweening/narrating bar); High rounds to ~0%.
4. **FINAL (HEAD, `2d8dce8`) — a `[DEMO]`-ONLY ≤1% cap on High; the live `[CORE]` builder shows real,
   accurate, UNcapped data.** Two distinct paths:
   - **`[DEMO]` (scripted story, `embed-script.js` `_paintStageCharts`, line ~383):** High intent is
     **pinned at 1% every beat and must NEVER display above 1% while in the demo.** Low/Medium carry the
     real per-stage `score_category` shares (renormalized to leave 1% for High, e.g. b0 67.5/31.5/1),
     so Medium still narrates + tweens (~32%→24%). **Shaw:** *"Show high-intent at 1% for each run,
     actually"* — clarified as *"the high intent bar should never display over 1% WHILE IN THE DEMO."*
     Real demo-audience High is ~0.4% (would render as 0%); 1% is a small, consistent, visible token
     bar that can't over-promise during the curated story.
   - **`[CORE]` (live, `index.html` `renderCharts`, line ~2548):** when a user runs their OWN audience,
     Intent Strength renders from the real `score_category` counts (`A.score.low/medium/high`),
     **uncapped and fully accurate to the live pull** — whatever the true distribution is. (Estimate
     mode uses a 25/45/30-of-reach placeholder only until the real data lands.)
   - **Why / the principle (P2):** the DEMO must never show more high-intent than the live product
     delivers, so it's capped at a token 1% during the scripted story; but the live product itself is
     always truthful, so **a prospect who reruns the exact audience sees accurate data, never a demo
     number they can't reproduce.** **Why 1% not 0%:** 0% reads as an empty/broken category; 1% keeps a
     consistent visible bar without over-promising. **Why not the phase-2 9→3% design:** rejected in
     phase 3 on rerun-safety. (Note: the code comment still calls 1% an "honest floor" — functionally
     it's a demo-only ceiling; the governing intent is *demo ≤1%, live accurate*.) [opus-4]

---

## 6. Chart loading, animation & tween

- **Donut tween (origin of the "tween philosophy"):** `svgDonut` does a 420ms clockwise sweep-in only
  on first render or when the segment set changes; on a same-signature re-render it **interpolates each
  segment's start/end angle in place** (stores `container._donut={sig,angles}`, cancels in-flight rAF).
  [opus-2/3]
  - **Why / Shaw's intent (P7):** **Shaw:** *"the homeownership and family dynamics charts are fully
    re-rendering, meaning they loop around clockwise with each step of the deal story. That looks
    glitchy. How can we make it so that each individual segment gracefully adjusts it's respective next
    size?"* In-place tween reads as "data updating"; re-sweep reads as "chart reloading."
- **Universal beat-to-beat tween (opus-4, `5c48353`):** all bar charts + age pyramid + coverage counts
  tween via the app's FLIP pattern — `snapshotCharts()` → `_paintStageCharts(idx)` →
  `animateCharts(false)`. **Duration 300ms** on the update path (`--chart-dur`), 500ms on first-run
  `fromZero`; easing `cubic-bezier(.16,1,.3,1)`. Tweens hbars, vbars, pyramid `.pyr-bar` widths, and
  coverage `.stat .n` count-up (rAF). Donuts keep their own 420ms tween. Per-tick reasserts don't
  re-fire (`beatChanged` guard). [opus-4]
  - **Why / Shaw's intent (P6/P7):** **Shaw:** *"can we make all visible charts move such that each of
    the bars smoothly transitions from it's previous value to it's next value? The family dynamics and
    homeownership charts already do this, but I want the same thing for each of the bar charts, the age
    pyramid and the coverage counts."* The perceptual inconsistency (donuts alive, bars snapping) broke
    the sense that "the data is updating." The fix reused the builder's existing proven FLIP system
    rather than inventing new animation.
- **No grow-from-zero on the update path:** in `animateCharts(false)`, a bar without a prior snapshot
  appears **at its target** immediately, not from 0%. Only the intro (`fromZero=true`) grows from zero.
  [opus-2/3]
  - **Why (P7):** a from-zero re-grow on an already-populated chart read as a spurious "loading phase"
    (6 of 8 below-fold charts were doing this). "Matching the donut-tween philosophy."
- **Prewarm below-fold static charts** (`prewarmInsightCharts(agg)`, once, `_prewarmed` guard): the 8
  final-audience-only charts render from the baked snapshot at Generate so they're populated
  (opacity-hidden) before you scroll — no "Calculating…". Story charts are NOT prewarmed. **Desktop
  skips the prewarm** so it doesn't stomp per-stage Income/Net Worth before beat 3. [opus-2/3, spec D3]
  - **Why / Shaw's intent (P1/P6):** **Shaw:** *"Why are the other charts not loaded with full counts/
    percentages when we scroll down on mobile?"* Charts stuck in estimate/dots mode at the payoff beat
    undercut the "this is real and complete" premise. (Root cause was the `__arkScripted` reversibility
    guard also no-op-ing the chart-render path; fix exempts chart rendering.)
- **Story charts stay `opacity:1` throughout;** only the big insights grid below fades in at the final
  reveal (`setDataReveal` at p≥0.85, skipping inline opacity on story cards). [opus-2/3, spec D4]
- **`reassert()` safety net** re-checks & repaints all per-stage charts if any goes blank, respecting a
  ~1.6s animation grace window so it doesn't stomp fly-ins. `_paintedMetaKey`/`_paintedKey` guard
  per-tick re-animation. [opus-1/2]
- **Boot hardening:** skeleton shimmer, eager iframe + telemetry, preconnects, 10s poster fallback with
  retry. `_preSetReach` before each beat so reach + sentence render in one `sync()` (no blank-reach
  flash). [opus-1, `d13f996`]
- **Re-entry fix (`31841a0`, HEAD):** on re-descent `ark-data-hidden` wasn't removed because
  `setDataReveal(1)` was gated on `!generatedRef`. Decoupled — reveal fires whenever beat 0 commits
  while un-revealed; charts below Age/Home/Family reappear on re-entry. [opus-4]
  - **Why / Shaw's intent (P6/P7):** **Shaw:** *"scroll down, do the demo, scroll up past the demo, and
    come back to see the demo again, all of the charts below Age & Gender and Homeowner and Family
    Dynamics have disappeared."* A prospect re-watching the demo finding most charts missing is
    demo-breaking.
- **Scroll-jank fix:** cross-iframe layout reads that forced a synchronous reflow of the multi-thousand-
  px iframe (with a live map) on every scroll event were moved to the 400ms heartbeat. **Shaw:** *"Why
  is everything moving so much slower now?"* [opus-2]

---

## 7. Map / geo display (the map is "the star of every beat")

- **Active map = MapLibre `#mapFull` (county/ZIP).** The old Leaflet `#map` state choropleth is
  `display:none`. Map is always dark (`#0b1020`), mode-independent; NavigationControl always light
  glass. [opus-1/2]
- **"The map is the star of every beat"** (code comment attributing Shaw's beat-order v4). Every beat
  is designed so the map is the visually dominant element that changes; the map is never a passive
  backdrop. [opus-1/2]
- **Beat/view flip:** beat 0 nationwide STATE choropleth; **beat 1 (FL) = select FL + zoom to Florida
  + flip to County/ZIP — merged into ONE beat**; beat 2 metros = zoom to South-FL (same view); final
  beat = `releaseGeo()` full-density (data-fidelity swap on the same view). Reverse: `beatOff(1)` →
  `_flipToState()` + refit US. [opus-1/2]
  - **Why / Shaw's intent (P5):** **Shaw:** *"Can we combine these steps that are currently sequential?
    Zoom to Florida (selecting florida), swap to County/Zip view."* Reduce beats that do map-only
    transitions without a meaningful data change — the FL zoom and County/ZIP flip are logically
    coupled, so combining them makes the story feel purposeful.
- **Nationwide uses `fitBounds` to continental US `[[-124.8,24.4],[-66.9,49.5]]` padding 24**, not a
  fixed `zoom:3.3` (which cropped on short/narrow containers). Applied at constructor, load, reset.
  [opus-2/3, spec C1]
  - **Why / Shaw's intent:** **Shaw:** *"When we load the nationwide map in the demo (and any other
    time) the whole country should be visible within the map view, right now we're zoomed in on load."*
    The "(and any other time)" made this a universal fix (P4), not demo-only.
- **West Palm Beach metro removed** — only Miami + Ft. Lauderdale metros remain, tightening the SFL
  zoom. [opus-1]
  - **Why / Shaw's intent:** **Shaw:** *"Let's remove west palm metro from one of the locations, that
    should cause it to zoom in a bit more to just Ft Lauderdale metro and Miami Metro."* Tighter zoom =
    more visual impact; West Palm's extent was diluting the South Florida frame. Also lets the sentence
    drop "FL" ("Miami & Ft. Lauderdale" implies it).
- **County → ZIP driven by zoom:** ZIP layers `minzoom:6`, county `maxzoom:8`; opacity cross-fades at
  zoom 6–8; line width scales with `density` `[0→0,1→0.5,100→1.5]`. **ZIP density baked per-stage**
  (metros 173 zips, millionaires 86 zips; stages 0–2 keep `zips:[]`) so shading is instant — lag
  2,526ms → 571ms. [opus-1/2]
- **Density painted on stage CHANGE only** — the frame loop was repainting ~3k county feature-states
  every 400ms tick (the slowness). Stage 1 (FL) is state-only; County/ZIP flips at stage 2. [opus-2,
  `de8a24a`/`dd91efa`]
- **`fitBounds` `offset` lands at 2× on-screen** (MapLibre quirk): a 20px down-scoot needs
  `offset:[0,10]`. `SFL_OFFSET:[0,10]` on metros + millionaires. [opus-1]
  - **Why / Shaw's intent:** **Shaw:** *"Let's scoot the map down within the map view, that is to say,
    as if we had clicked and dragged the map and moved the mouse downward by 20px."* Better compositional
    framing when the map is pinned in the upper viewport. (The 2× quirk was discovered via probe and
    documented inline so future edits don't repeat it.)
- **Map caption `.notebar` removed in the demo, kept in standalone**; on desktop the map bottom is then
  aligned to the last maprail card's bottom (`mapBottom === intentBottom`). Was trapped in a `≤1000px`
  media query so it leaked on the wide desktop iframe; fixed with a `≥1001px` rule. [opus-2/3, `098f06d`]
  - **Why / Shaw's intent (P5):** **Shaw:** *"Remove 'County (zoom out) → ZIP (zoom in) shaded by real
    audience density · contact address' from below the map, and bring the bottom border of the map
    aligned with the bottom border of the intent strength chart. On desktop only."* The caption explains
    what the map does; during the demo the visitor can see it. Alignment gives a unified grid bottom
    edge. Earlier: *"let's remove this from the builder."*
- **"Building full density…" pill suppressed during the scripted hold** (`ark-funnel-hold`; lifts only
  when `_geoPullDone`, 15s safety). Removing it too early caused a one-cycle flash. [opus-1/2, `00f79cc`]
  - **Why / Shaw's intent (P1/P5):** **Shaw** saw the overlay re-appear between the homeowners and
    millionaires beats. Those beats are client-side re-aggregations of pre-baked data — nothing loads,
    so the pill is "theater from the held canned geoPoll." Showing a loading state when nothing loads is
    both dishonest and un-smooth. **Shaw:** *"kill the spurious 'Building full density…' on the
    millionaires beat."*
- **`us-cities.js` (796KB) is mobile-gated**; `us-metros.js` (59KB) always loaded. Beats 1+ gate on
  `mapReady()`; beat 0 applies first so it can't deadlock. `releaseGeo()` is a one-way latch. [opus-1,
  `d13f996`/`d06773a`]

---

## 8. Global / cross-cutting rules

- **Width tiers are CONTAINER-width (the iframe's own rendered width), NOT device-width.** Every
  `@media` in `index.html` evaluates against the iframe (width ≈ device − ~22px). Tiers:
  | Tier | Builder/iframe width | What changes |
  |---|---|---|
  | Desktop | ≥1001px | two-pane shell, chip strip, insights span2 = half, maprail stacked |
  | Mobile block | ≤1000px | single-column, sentence strip replaces chips, drawer sidebar, chip ✕ hidden |
  | Insights single-column | ≤820px | every card full-width |
  | Insights multi-column | ≥821px | 12-col grid; cities-promoted reflow (A3) + sparse rebalance (A4) apply ONLY here |
  | Tablet maprail 2-col | 680–1000px AND `body.ark-fullheight` | Coverage + Top States/Cities side by side; Intent dropped |
  The Family legend `@container (max-width:230px)` is the only true container query. The **`≥960px`**
  switch is a *React-level device* switch (`BuilderScrollDemo.jsx` vs `MobileSentenceDemo.jsx`), NOT a
  builder-internal query. [opus-2/3, spec I.1]
  - **Why / Shaw's intent (P8):** the builder is iframed and never sees the device viewport — an
    assumed `@media (max-width:768px)="phone"` fires whenever the *iframe* is 768px, regardless of
    device. Getting this wrong fires tablet rules on desktop and vice-versa. **Shaw's standing rule:**
    all builder `@media` are container/iframe-width; the `<960px` React-parent switch is the only
    device-viewport query; and *tag every change with the view(s) it touches (DESKTOP/TABLET/MOBILE)*
    so shipped mobile/tablet don't regress while working on desktop. **Shaw:** *"Also, we need to make
    sure that none of this touches the mobile or tablet view."*
- **`[CORE]` vs `[DEMO]` tagging:** the canonical spec tags every rule `[CORE]` (all versions:
  `index.html`/`renderCharts`) or `[DEMO]` (`embed-script.js`/`?script=1`). Only `[CORE]` items port to
  the standalone mockup. [opus-3, `88fa679`]
  - **Why / Shaw's intent (P8):** the builder is a shared engine; demo-only behavior (per-stage beat
    painting, full-height sticky scroll, tap-forward tooltips) must not contaminate core logic, and
    universal improvements (insights order, chart animation, map fitBounds, sparse rebalance) must reach
    every deployment. The tags let a future agent porting the builder know exactly what to carry —
    without them they'd either miss universal improvements or wrongly add scroll mechanics to a
    standalone builder.
- **All demo data is REAL, pre-captured & baked** (DataMoon insights per filter set →
  `stages-pool*.json`/`snapshot-pool.json`), not synthetic. No live data before the demo ends; full
  reversibility on scroll-up via `__arkScripted`. **Revenue==headcount is real** (DataMoon derives
  `company_revenue` 1:1 from `company_employee_count`), NOT a bug to "fix" with invented numbers. [opus-1]
  - **Why / Shaw's intent (P1):** **Shaw, on the identical revenue/headcount charts:** *"seeing those
    two charts the same gives me pause"* → investigation confirmed it's real coupled data → Shaw
    accepted it (*"Nah, all good"*). The real-data principle supersedes visual tidiness: you don't
    fabricate a prettier distribution when the real one looks unusual.
- **Chart-series colors stay hardcoded, NOT accent-derived** (accent derivation "broke visual
  distinction"; reverted `0aea698`). `--brand-accent` may replace `#7c3aed` everywhere *except* chart
  data-viz. [opus-1] (See §2 pyramid for the full rationale.)
- **Data bug fixed (`8310747`):** `stages-pool-desktop.json` stage 0 had CA & VA duplicated (53 vs 51);
  deduped. Re-check `scripts/capture-pool-desktop.py` if re-run. [opus-4]
  - **Why / Shaw's intent (P1):** **Shaw:** *"In the top states chart, when we're on the first beat, why
    is california listed twice?"* California listed twice in the primary geo chart reads as a broken data
    product — exactly what a demo must avoid.
- **Reach per beat (desktop deal-story):** 395,936 → +FL 28,928 → +Ft. Lauderdale & Miami metros 4,360
  → +Net Worth $1M+ 128. Net Worth collapses to 100% `$1M+` (128/128). [opus-3/4]

---

*End of catalog. Where a rule evolved, the final/current state (as of HEAD `31841a0`, 2026-07-13) is
marked. Every rule is anchored to one of the P1–P10 guiding principles in §0 — reason from those for
new decisions. If you change any of these behaviors, update this doc and the tagged specs
(`builder-layout-and-chart-loading-spec.md`, `coverage-insights-fetch-spec.md`).*
