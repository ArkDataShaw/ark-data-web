# Desktop demo — gesture-driven beat snapping (scroll takeover) — IMPLEMENTATION DESIGN

**Date:** 2026-07-12
**Author:** arkdata-web-opus-4 (with Shaw)
**Repo:** `ark-data-web` (main) → arkdata.io
**Status:** Approved. Ready for implementation plan.
**History:** Refines the opus-3 design-capture of this file (preserved in git commit `69faad4`); this
version is the concrete, approved build design. Architecture = **Option B** (gesture triggers a fixed
scripted transition), locked by Shaw.

## Problem (recap)

The desktop demo (`src/components/home/BuilderScrollDemo.jsx`, `≥960px` path) wires beats to fixed
scroll-depth thresholds `BEATS = [0.10, 0.32, 0.54, 0.74]` over a pinned range, linear 1:1 pacing
(story progress == scroll pixels). Story legibility is hostage to scroll velocity: scroll steadily and
the sentences flash by; stop between thresholds and nothing happens. The timing must be done FOR the
user — Shaw's model: a ball rolling over valleys, crest-to-crest = one beat, with dwell at each valley.

## Core insight — thin controller over the existing engine (do NOT rewrite `frame()`)

The builder is **sticky-pinned**, so moving `window.scrollY` within the pin range advances `p =
scrolled / (4.2·cssVh)` while the builder stays **visually stationary**. Therefore we do NOT rewrite the
beat commit/reverse logic. We keep `frame()`'s existing `p`-threshold engine **100% intact** and add a
**scroll controller** that decides *when* and *how fast* `scrollY` moves. As an eased programmatic
scroll sweeps `p` across exactly one `BEATS[]` threshold, the existing engine fires
`beatOnDesktop`/`flipChips`/`flyChips`/`preshowCaption`/`beatOffDesktop`/`reverseTo` exactly as it does
today. The delicate chip morph, seat/overlay (Option 2 bar fade), sidebar open/select/close
choreography, the snap-stray-chips orphan guard, and full reversibility are all **untouched** — they
continue to key off `p`.

This is a deliberately minimal-blast-radius realization of the approved Option B: "ease the page scroll
to the neighbor's rest depth over TRANSITION_MS," where the sweep of `p` IS the transition.

## Valleys (rest points)

Absolute page-Y per valley: `restY[k] = A + REST_P[k] · storyPinPx`, where `storyPinPx = 4.2·cssVh` and
`A = track.getBoundingClientRect().top + window.scrollY` (the page-Y at which `track.top == 0`, i.e.
`scrolled == 0`). Each valley is placed **between** two `BEATS[]` thresholds so that a transition sweeps
`p` across exactly one threshold → exactly one beat commit/reverse.

| Valley | REST_P (seed) | Committed state |
|--------|---------------|-----------------|
| 0 hero | 0.05 | seated, NO beat (`topBeatRef = -1`), hero sentence readable, builder un-filtered |
| 1      | 0.18 | beat 0 applied — reach 395,936 (generate fires here) |
| 2      | 0.42 | beat 1 applied — reach 28,928 |
| 3      | 0.64 | beat 2 applied — reach 4,360 |
| 4      | 0.85 | beat 3 applied — reach 128, explore CTA visible, sentence still shown (<0.90 hide) |

Valley 0 at `p=0.05`: seat triggers at `r.top ≤ 1` (`scrolled ≈ 0`, `p ≈ 0`), so `p=0.05` is safely
seated with beat 0 (`p≥0.10`) not yet committed. Valley 4 at `p=0.85`: `complete` is true (`p≥0.74` &
generated) so the explore CTA shows, but `< 0.90` so the caption stays readable.

`REST_P[]` is a tunable constant array; Shaw fine-tunes on-device.

## State machine

`PARKED(k)` ↔ `TRANSITIONING(k → k±1, startTime)`. `topBeatRef` already tracks the committed beat;
valley index `k == topBeatRef + 1`. Add: `engagedRef` (takeover active), `progRef` (programmatic
scroll in progress), `transitionRef` (`{from, to, t0}` or null), `queuedDirRef` (−1/0/+1),
`intentAccumRef` (accumulated user wheel delta for the current gesture).

### Intent = `wheel` events, NOT `scroll` (feedback-loop fix)

`wheel` fires only on real user input; `window.scrollTo` never fires `wheel`. So `scroll` continues to
drive `frame()` only (beats commit as `p` sweeps), and `wheel` is the sole intent/escape signal. This
sidesteps the `programmaticScroll` feedback loop cleanly. The `progRef` flag still exists, but only to
suppress settle-to-rest while an ease is running — not to filter intent.

Keyboard scroll keys (PageDown/Space/ArrowDown, and up variants) are ALSO treated as a one-beat nudge
in the corresponding direction, via a `keydown` handler that `preventDefault`s and triggers a
transition while engaged+parked. Scrollbar-drag (rare) is not special-cased; it falls through to native
scroll + settle-to-rest on idle.

### Behavior by state (while `engagedRef` is true)

- **PARKED(k):** `wheel` listener (`{passive:false}`) calls `preventDefault()` (takes over scroll) and
  accumulates `intentAccumRef += e.deltaY`.
  - `|intentAccumRef| ≥ EXIT_PX` → **ESCAPE** (see below).
  - else `|intentAccumRef| ≥ INTENT_PX` → start `TRANSITIONING(k → k + sign)`, reset `intentAccumRef`.
    Clamp at the ends: forward from valley 4 or backward from valley 0 → treat as ESCAPE (let native
    scroll leave the section) rather than a no-op.
- **TRANSITIONING(k → k±1):** keep `preventDefault()`. Accumulate a separate gesture delta:
  - `≥ EXIT_PX` in the burst → **ESCAPE** (abandon takeover mid-transition; native scroll carries out).
  - else `≥ INTENT_PX` in the SAME direction as the transition and nothing queued → set
    `queuedDirRef = dir` (queue exactly ONE). Opposite-direction or additional input is ignored.
  - The ease: `progRef = true`; rAF animates `scrollTo(0, y)` from `restY[from]` → `restY[to]` over
    **TRANSITION_MS**, easeInOut. `frame()` runs each scroll tick and commits/reverses the single beat
    the sweep crosses (existing engine, incl. `CAPTION_LEAD` pre-show and `BEAT_MIN_GAP_MS` throttle —
    only one threshold is crossed, so the throttle never blocks it).
  - On completion: `progRef = false`, `transitionRef = null`, PARKED(to). If `queuedDirRef` set →
    immediately start the next transition in that direction; else clear `queuedDirRef`.
- **Settle-to-rest:** engaged + PARKED + idle for `IDLE_MS` since the last wheel + not `progRef` +
  `scrollY` not already at the current valley → ease `scrollTo` to `restY[current]` over **SETTLE_MS**
  (short). This is the "ball rolls into the valley." Debounced off the scroll/wheel path (e.g. a timer
  reset on each wheel, or checked in the existing 400ms heartbeat).

### Escape

`ESCAPE`: set `engagedRef = false` and STOP calling `preventDefault()`, so this wheel and subsequent
scroll run natively and carry the user out (up above the hero, or down past valley 4 into the charts
section). During the disengaged native scroll, `frame()`'s existing `p`-engine drives beats live, so
nothing looks frozen. **Re-arm:** on scroll-idle (`IDLE_MS`) while the section is still seated
(`r.top ≤ 1` and in view) → `engagedRef = true` and settle to the **nearest** valley by current
`scrollY`. If the user scrolled fully out (section left the viewport), stay disengaged until the section
re-enters and re-seats.

Clicking explore / going LIVE (existing `onExplore` → `armedRef`/`collapsedRef`) releases takeover
entirely and permanently for that visit — the existing `if (collapsedRef.current || armedRef.current)
return;` short-circuits keep `frame()` frozen, and the controller checks `armedRef`/`collapsedRef` and
never engages once armed.

## Reversibility

An up-nudge starts `TRANSITIONING(k → k-1)`; the eased scroll sweeps `p` back below one `BEATS[]`
threshold and the existing `for (i = BEATS.length-1 …) if (p < BEATS[i] && applied)` block fires
`beatOffDesktop(i)` + `reverseTo(w, i-1)`. Fully reversible to the previous valley, unchanged from
today. Scroll-up from valley 0 escapes above the hero (beats already all off).

## Constants (new; all desktop-only, top of `BuilderScrollDemo.jsx` near the existing block)

```
REST_P        = [0.05, 0.18, 0.42, 0.64, 0.85]  // valley scroll fractions of storyPinPx
TRANSITION_MS = 1100   // fixed, scroll-speed-independent duration of one beat transition
INTENT_PX     = 50     // accumulated wheel delta that triggers a nudge
EXIT_PX       = 300    // accumulated wheel delta in one burst that escapes the takeover
SETTLE_MS     = 250    // ease duration for settle-to-rest / re-park
IDLE_MS       = 150    // idle after last wheel before settling / re-arming
```

Existing constants (`NAV_PX`, `SENTENCE_ZONE`, `BAR_OVERLAP`, `SEAT_HOLD_MS`, `BEATS`, `CAPTION_LEAD`,
`BEAT_MIN_GAP_MS`, `SNAP_PX`) are **unchanged**.

## What does NOT change

- `frame()`'s beat commit/reverse loops, `beatOnDesktop`/`beatOffDesktop`, `flipChips`/`flyChips`, the
  chip morph (`morph`), `preshowCaption`/`buildCaption`, `setSidebarStage`/`landSel`/`_supp`,
  `snapStrayChips` (anchored on the builder's on-screen top — must stay that way), `reverseTo`, the
  seat/overlay + Option-2 per-beat bar fade, the explore/collapse flow, `measure`, the heartbeat.
- `MobileSentenceDemo.jsx`, the `<960px` React path, and `public/builder/*`. Mobile/tablet untouched.
- All deal-story data: reach 395,936 → 28,928 → 4,360 → 128; filters accumulate
  (Homeowner → +FL → +Miami/FtLaud metros → +$1M net worth), fully reversible.

## Edge cases / gotchas

- **mapReady gate:** the existing engine won't commit beat ≥1 until `generatedRef && mapReady()`
  (`if (i >= 1 && (!generatedRef.current || !w.ArkEmbed.mapReady())) break;`). If a transition to
  valley 2 starts before the map is ready, the eased scroll lands at `restY[2]` but beat 1 commits a
  frame later when the heartbeat drains it. Acceptable; if it reads poorly on-device, hold the
  transition start until `mapReady()`.
- **`A` recompute:** recompute `A` and `storyPinPx` at the start of each gesture/transition (viewport
  resizes change `cssVh`). Never cache across resizes.
- **`getBoundingClientRect().top` staleness:** the first sticky rect read of a post-scroll frame is
  stale; the existing `frame()` reads the track rect first (flushes layout) before the iframe rect.
  The controller must read `A` from the TRACK rect, consistent with `frame()`.
- **`preventDefault` requires `{passive:false}`** on the `wheel` listener.
- **`progRef` guard on settle:** never start a settle ease while `progRef` (a transition ease) is
  running, or the two `scrollTo` animations fight.
- **snap-stray-chips:** unchanged, but re-verify the morph still plays fully under programmatic
  scrolling — the snap guard aborts a chip if the builder's on-screen top moves > `SNAP_PX`. During a
  transition the builder is pinned (its rect top is stable), so the guard should NOT fire. VERIFY this
  headlessly (this exact regression broke the morph before, when the guard keyed off `scrollY`).

## Verification (headless verifies MECHANICS; Shaw judges FEEL on-device)

Headless (Chrome :9222 + puppeteer-core, viewport 1280×1000, reach the desktop demo per the init):
1. One `wheel` nudge (deltaY just > INTENT_PX) while parked advances **exactly one** beat and plays the
   full effect; a second identical nudge advances exactly one more (never a partial slice).
2. reach/sidebar/chips update per beat to the correct values; `topBeatRef`/`appliedRef` step by one.
3. An up-nudge reverses exactly one beat (reach goes back up; filter removed).
4. A single big `wheel` burst (> EXIT_PX) escapes: past valley 4 the section un-pins and the charts
   section scrolls into view; above valley 0 the page scrolls above the demo. No fight-back.
5. Valleys settle: after a nudge completes, `scrollY ≈ restY[k]`; after a stray small scroll, settle
   re-parks to the current valley.
6. The chip morph still plays fully during a programmatic transition (snap guard not regressed).
7. `.bsd-cap` is ABSENT at `<960px` (mobile path unchanged), and `MobileSentenceDemo.jsx` /
   `public/builder/*` are byte-for-byte unchanged.

FEEL to tune on-device: `TRANSITION_MS`, `REST_P` spacing, `INTENT_PX`, `EXIT_PX`, `SETTLE_MS`,
`IDLE_MS` — whether it reads as "guided" vs "hijacked."

## Behavioral decisions locked with Shaw (2026-07-12)

- **Input during a transition:** queue exactly ONE more beat (not ignore-until-parked). Eager scrollers
  chain two beats; further input is ignored until settled.
- **Escape:** a single big accumulated `wheel` burst (> EXIT_PX) abandons takeover for that gesture and
  lets native scroll carry the user out; takeover re-arms on re-entry/re-seat.
- **Hero valley:** valley 0 is its own rest — pin/seat shows the un-filtered builder + hero sentence,
  the user parks to read it, and a nudge STARTS the story (fires beat 0 / generate).
- **TRANSITION_MS seed:** ~1100ms (clears the ~700–800ms chip fly+morph with a readable tail).

## View impact

**DESKTOP only** (`≥960px` → `BuilderScrollDemo.jsx`). TABLET and MOBILE (the `<960px` React path →
`MobileSentenceDemo.jsx`, and all `public/builder/*`) are NOT touched and must be verified unchanged.
