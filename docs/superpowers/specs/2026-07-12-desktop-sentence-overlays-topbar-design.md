# Desktop demo — sentence bar overlays the builder top bar

**Date:** 2026-07-12
**Author:** arkdata-web-opus-3 (with Shaw)
**Repo:** `ark-data-web` (main) → arkdata.io
**Status:** Approved for planning

## 1. Goal

Reclaim the vertical space the builder's own top bar occupies during the DESKTOP scroll demo by
having the dark sentence bar **overlay** that top bar (rather than sitting in its own separate strip
above it). This moves the builder's strip / map / charts up by roughly the sentence-band height,
showing more of the audience builder during the story.

The builder's top bar ("Audiences › Create", the Standard/Custom toggle, the name input, and the
**Generate / Save** buttons) must remain a real, functional part of the app — the demo should read
as a full live application, and Generate becomes interactive once the demo ends. So the top bar is
**covered** by a parent-page overlay, never structurally hidden or removed.

**Desktop-only.** Every change lives in `src/components/home/BuilderScrollDemo.jsx` (the ≥960px
render path) and its inline `<style>`. `MobileSentenceDemo.jsx`, the `<960px` experience, and the
shared vendored builder files (`public/builder/*`) are NOT touched. The top bar lives inside the
iframe but is covered purely by a parent-page element (z-index above the iframe), so no builder file
changes are needed.

## 2. Geometry

Current desktop stack: marketing nav (70px = `NAV_PX`) → **sentence band** (54px = `SENTENCE_ZONE`,
its own strip) → builder pinned at `top: NAV_PX + SENTENCE_ZONE` (124px), whose first visible row is
its internal top bar (~44px).

New stack: the builder pins ~46px higher so its top bar tucks directly under the nav, and the dark
sentence bar overlays that top-bar row. Concretely:
- Builder sticky `top` drops from `NAV_PX + SENTENCE_ZONE` (124) → `NAV_PX + BAR_OVERLAP` (~76,
  where `BAR_OVERLAP` ≈ 5–8px breathing room so the bar's top border sits just below the nav).
- The dark sentence bar, when **seated**, rests over the builder's top-bar row: same builder width
  (`min(1240px, calc(100vw - 40px))`), full opacity (`#060D1A`, blends with the dark page section),
  a subtle drop shadow so it reads as a ribbon floating OVER the white app — not a header row inside
  it. It does NOT bleed full-page-width (kept builder-width, blends with the page as today).
- Section height (`sectionH`) adjusts by the reclaimed delta so the pin-fraction math stays
  consistent (same pattern as the current `SENTENCE_ZONE` term).

## 3. Three-phase scroll-in choreography (reversible)

**Phase 1 — Rise (before pin).** As the section scrolls up into view, the sentence bar rides in its
OWN band ABOVE the builder — today's look. The visitor sees a dark bar clearly above the white app,
establishing "this is a separate surface." Builder + bar fade in on viewport entry (current `entry`
behavior, unchanged).

**Phase 2 — Seat (at the pin, right before beat 0).** As the section reaches the top and pins, the
builder slides up ~46px so its top bar tucks under the nav, and the dark bar slots DOWN onto the
top-bar row. This is ONE coordinated CSS transition (~0.3s) triggered by a state flip at the pin
threshold — a "slots into place" motion, NOT scroll-scrubbed. Beat 0 begins after.

**Phase 3 — Seated, per-beat sweep (Option 2).** Through the story the dark bar is seated over the
top bar. Per beat: the bar sweeps over the top bar and the sentence text shows; **between beats the
bar fades away, revealing the real top bar (Generate / Save)** underneath — reinforcing "full live
app." Separateness is maintained by the dark-ribbon-over-white-app contrast + shadow.

**Anti-strobe (required).** Beats fire close together on fast scroll; naively fading the bar out/in
each beat would flash the app chrome. Guard with: (a) an idle hold — the bar does not fade back to
reveal the top bar until it has been idle ~250–300ms since the last beat; and (b) re-seat
immediately (no fade) when the next beat's pre-show/commit is imminent. Net: on a steady read you
see the top bar peek between beats; on a fast flick the bar stays seated and just swaps text.

**Reverse.** Scrolling back up above the pin un-seats: the bar lifts off the top bar and returns to
its own band above the builder as the section un-pins — preserving the "separate surface" read on
the way out.

## 4. Mechanics

- **`seated` state** (analogous to the existing `collapsed`): a boolean flipped at the pin
  threshold in `frame()`. Its class/style drive the Phase-2 transition.
- **Coordinated seat transition:** the builder's sticky `top` (124 → ~76) and the bar's rest
  position (band-above → over-topbar) + `.seated` treatment (shadow) both animate via CSS
  transition on the `seated` flip. One ~0.3s move.
- **Per-beat bar fade (Phase 3):** reuse the existing caption crossfade timing, extended to fade
  the WHOLE bar (background + text), not just the inner text. Driven by the same beat pre-show /
  commit hooks that already exist, plus the idle-hold + re-seat debounce.
- **Section height:** recompute the expanded/collapsed `sectionH` for the new reclaimed delta.
- The bar remains a centered element in the builder column (builder-width) — NOT a full-width
  `position:fixed` element — so no repositioning gymnastics; it just moves vertically from
  "above" to "over."

## 5. Non-goals / do-not-touch

- No changes to `MobileSentenceDemo.jsx` or any `<960px` behavior.
- No changes to the shared builder (`public/builder/index.html`, `embed-script.js`): the top bar is
  covered by a parent element, never hidden/removed in the iframe. Generate/Save stay functional.
- The bar is not full-page-width; it stays builder-width and blends with the dark page as today.
- Structurally hiding the top bar (display:none) is explicitly rejected — the app chrome must stay
  real (full-app impression + Generate becomes functional post-demo).

## 6. Verification

Iterate on staging (or local `dist` + headless) first, then production (arkdata.io on the unblocked
`shawcole` site). Headless (viewport ≥1100px):
- **Reclaim:** after seat, the builder's strip/map top is ~46px higher than before (measure map/
  strip top vs. a pre-change baseline).
- **Seat alignment:** the seated dark bar's top edge aligns with the builder top-bar row (± the
  BAR_OVERLAP breathing room); the bar covers the top bar at full opacity (no chrome bleed-through).
- **Phase 3 reveal:** between beats (after the idle hold) the builder top bar (Generate button) is
  visible; during a beat it is covered.
- **Anti-strobe:** a fast scroll through the beats does not flash the top bar (bar stays seated).
- **Reverse:** scrolling up un-seats the bar back to the band-above position.
- **Desktop-only:** mobile/tablet (`<960px`) demo is byte-for-byte unchanged; the standalone
  builder + `/Demo` are unaffected.
Scroll feel / seat timing judged by Shaw on-device — headless verifies mechanics only.

## 7. Risks

- **Chrome bleed-through:** the dark bar must be fully opaque so no top-bar text shows through while
  seated. Verify.
- **Seat-transition jank:** animating the builder's sticky `top` mid-pin could stutter; keep the
  transition short and on `transform`/`top` only, and gate it to the single pin flip (not per
  scroll frame).
- **Anti-strobe tuning:** the idle-hold threshold is a feel value — start ~280ms, tune on-device.
