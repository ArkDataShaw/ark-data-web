# Desktop demo — gesture-driven beat snapping (scroll takeover)

**Date:** 2026-07-12
**Author:** arkdata-web-opus-3 (with Shaw)
**Repo:** `ark-data-web` (main) → arkdata.io
**Status:** Design captured — approved approach (Option B), NOT yet implemented. Build with fresh context.

## Problem

The desktop demo (`src/components/home/BuilderScrollDemo.jsx`) currently wires beats to fixed
scroll-depth thresholds `BEATS = [0.10, 0.32, 0.54, 0.74]` over the pinned range, with linear
pacing (story progress == scroll pixels, 1:1). So story legibility is hostage to the user's scroll
velocity: scroll steadily and the sentences flash by with no dwell; stop between thresholds and
nothing happens. People don't self-regulate scroll speed to read a story — the timing must be done
FOR them.

Shaw's mental model: a ball rolling over a series of valleys. Crest-to-crest = one beat. Today a
constant scroll speed = constant ball velocity (no dwell at valleys). We want designed rest points
("valleys") where the story parks, and a small scroll nudge should roll the ball cleanly through the
FULL transition to the next valley — not "a little bit of story."

## Approved approach: B — gesture-driven takeover

Resting on a beat, the demo "captures." A scroll-down INTENT (any nudge past a small threshold)
triggers a FIXED-DURATION scripted animation that plays the entire transition to the next beat
(sentence fades in → chips fly → land → expand → data/map/charts update → brief moment of the dark
bar gone), then releases/settles at the next rest point. The transition pace is decoupled from how
far/fast the user scrolled — identical every time, guaranteeing "enough time to read." This is the
"these things are done for them" model Shaw asked for (chosen over Option A magnetic-snap).

## Requirements

1. **Rest points (one per beat + a pre-beat-0 rest + an end/explore rest).** Exact scroll depths
   where the story parks. When the user's scroll settles near a rest point, the page EASES itself to
   that exact depth (the ball rolls into the valley and stays).
2. **One gesture = one full beat.** A scroll-down nudge past a small intent threshold while parked
   → play the COMPLETE next-beat transition at its own deliberate, legible duration (independent of
   scroll distance/velocity), then park at the next rest point. A tiny scroll must NOT produce a
   tiny slice of story.
3. **Transition duration budget.** Long enough to read the sentence, watch chips fly + land +
   expand, see the data update, plus a short beat where the dark bar is gone (per the overlay
   feature). Tunable constant. Fast flicks do NOT shorten it (queue/ignore extra intent during a
   transition, or play one beat then settle and require a new gesture).
4. **Reversibility.** Scroll-up intent plays the transition BACKWARD to the previous rest point,
   same guarantees. The whole story stays fully reversible (existing hard requirement).
5. **Escape hatches (critical).** The takeover must NOT trap the user:
   - A determined/large scroll (e.g. fast repeated flicks, or scroll past the whole section) must
     be able to exit the demo downward (into the charts / next page section) and upward (back above
     the demo) without fighting the user.
   - Once the visitor clicks "explore" (LIVE), the takeover releases entirely — normal scroll.
   - Consider a max number of queued beats, and honoring a hard scroll that clearly means "leave."
6. **Desktop-only.** All changes in `BuilderScrollDemo.jsx` (≥960px path). `MobileSentenceDemo.jsx`,
   the `<960px` path, and `public/builder/*` are NOT touched.
7. **Preserve everything already shipped.** The seat/overlay (builder slides behind the dark bar,
   per-beat bar fade), the elegant chip land+expand morph, sidebar open/select/close choreography,
   check-at-launch, snap-stray-chips orphan guard (now anchored on the builder's on-screen top),
   and the full deal-story data (reach 395,936→28,928→4,360→128) must all keep working, now driven
   by the rest-point state machine instead of raw `p`.

## Architecture sketch (for the implementer to validate)

The current `frame()` computes `p = scrolled / storyPinPx` and drives beats off `p` thresholds.
Replace the DRIVER while keeping the per-beat EFFECTS (beatOnDesktop/flyChips/preshowCaption/
setSidebarStage/etc.) intact:

- **State machine:** `PARKED(atBeat k)` ↔ `TRANSITIONING(k → k±1, startTime)`. `topBeatRef` already
  tracks the committed beat; add a transition-in-progress ref + target.
- **Rest points:** an array of scroll depths (absolute page Y or pin fractions) — one per state.
  Derive from the existing pin range; keep them as tunable constants.
- **Settle-to-rest:** on scroll idle (debounced ~120ms after the last scroll event) while PARKED,
  animate `window.scrollTo` (eased) to the current beat's rest depth. This is the "park in the
  valley."
- **Intent → transition:** while PARKED, accumulate scroll delta; once it crosses INTENT_PX (small,
  e.g. 40-60px) in a direction, enter TRANSITIONING toward that neighbor: run the beat's effect
  (beatOnDesktop(k) forward, or beatOffDesktop backward) and simultaneously ease the page scroll to
  the neighbor's rest depth over TRANSITION_MS. Ignore/queue further intent until settled.
- **Effects timeline:** the beat effects (chip fly ~700ms, morph, data paint) already have their own
  timing; TRANSITION_MS must be ≥ that so the transition reads fully. The dark-bar per-beat fade
  (Option 2) should show its "revealed" gap during the PARKED dwell.
- **Escape:** if scroll delta in one gesture exceeds a large EXIT_PX (or the user reaches the
  section's true top/bottom), abandon takeover for that gesture and let native scroll carry them out.

Key risk the implementer must solve: driving `window.scrollTo` while ALSO reading scroll events
creates feedback loops (the programmatic scroll fires scroll events that look like user intent).
Standard fix: a `programmaticScroll` guard flag set during eased scrolls, cleared on completion, so
self-generated scroll events are ignored.

## Verification

Headless can verify MECHANICS (rest depths settle correctly; one intent nudge advances exactly one
beat and plays the full effect; reach/sidebar/chips update per beat; reverse; escape past the
section works; mobile untouched). The FEEL — dwell length, transition pace, whether it reads as
"guided" vs "hijacked" — is Shaw's on-device call. Expect to tune TRANSITION_MS, the PARKED dwell,
INTENT_PX, and EXIT_PX on a real desktop.

## Why this is deferred to a fresh session

This replaces the core scroll driver — a substantial, high-blast-radius change to a file that also
holds the (delicate, just-restored) chip morph and the seat/overlay choreography. It should be built
with clean context to avoid the timing-drift failure mode seen when patching this file under low
context. Recommend: brainstorm/confirm this spec → writing-plans → subagent-driven execution with
per-task headless verification, exactly as the overlay feature was built.
