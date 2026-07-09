# Mobile native-scroll builder (sticky full-height) — implementation plan

**Goal (Shaw, 2026-07-08):** Desktop keeps the current iframe. **Mobile** gets a full, seamless,
native-momentum single scroll: map + filter strip **pinned** during the scripted story, then the
whole builder scrolls **natively** through charts/records and on into the rest of the page.

## Why the current mobile approach is wrong
`MobileSentenceDemo.frame()` currently JS-drives `iframe.contentDocument.querySelector('.main').scrollTop`
from the page-scroll position. That is NOT a native scroll — no compositor momentum, and iOS fires
scroll events sparsely during a fling, so it "snaps to the scroll percentage." Must be removed.

## The design (validated)
A **full-content-height iframe** with **`position:sticky; top:0`** gives all four properties for free:
- Sticky pins the iframe (map + strip at top) for the story region → **pinned map ✓**
- When the sticky range ends the iframe **releases and scrolls with the page natively** → native
  momentum ✓ (a non-internally-scrollable iframe lets the swipe bubble to the page)
- Sticky release is **jump-free by construction** → no "grow slowly" needed ✓
- Mobile-only; desktop path in `BuilderScrollDemo.jsx` (≥960px) is untouched ✓

Feasibility confirmed: the map has a **definite height** (`.mapwrap{height:360px}` on mobile, index.html
~L468), not a `100vh` flex-fill, and insight cards have fixed min-heights — so the builder lays out
cleanly at auto/full height. Nothing collapses.

## Changes

### 1. Builder CSS (`public/builder/index.html`) — class-gated, so desktop/standalone unaffected
Add, gated on a body class the embed sets only for the mobile full-height demo:
```css
body.ark-fullheight .shell{height:auto}
body.ark-fullheight .main{overflow:visible;height:auto}
/* html/body already height:auto; topbar(~60px)+shell(auto) = full content height */
```

### 2. `embed-script.js`
- Add a method e.g. `ArkEmbed.enableFullHeight()` → `document.body.classList.add('ark-fullheight')`.
- (Optional) expose `ArkEmbed.fullHeight()` → `document.documentElement.scrollHeight` for the parent to size the iframe.

### 3. `MobileSentenceDemo.jsx` (mobile-only, ≤960px)
- On boot: call `w.ArkEmbed.enableFullHeight()`.
- Measure builder full height `H = iframe.contentDocument.documentElement.scrollHeight`; set iframe `height:H`.
- Structure: `<section style="height:{storyPinPx + H}px">` containing the iframe as `position:sticky; top:0; height:H`.
  - Pin range (story) = section.height − H = **storyPinPx** (use ~3410px = 4.2 × `documentElement.clientHeight`, the original 420vh pacing).
  - After the pin range the iframe releases → **native** page scroll through charts/records.
- Beats: keep keying to `p = clamp(scrolled / storyPinPx, 0, 1)` (scrolled = −section.getBoundingClientRect().top).
  **DELETE** the explore-phase `main.scrollTop` driving and the `exploreH`/`maxScrollRef`/`calc(520vh + …)` height logic — the sticky release replaces it.
- Reversibility is inherent (scroll up un-pins/re-pins + beatOff). Keep the `armedRef` freeze for tap-to-explore interaction.

### 4. Pointer-events
Non-scrollable iframe → swipe bubbles to page. Keep `pointer-events:none` for scroll-through by default;
`auto` on arm (tap-to-explore) for clicking filters (scroll still bubbles since there's no internal scroll).

## Verify
- Probe: page-scroll → beats fire during the pin range (map pinned), then `section.getBoundingClientRect().top`
  keeps decreasing while the iframe visually scrolls (no JS scrollTop). Charts/records reachable; then marketing.
- **Feel (iOS momentum) is on-device only** — Shaw judges.

## Known-good fallback
Current staging (arkdata-brainstorm-761) has the working-but-snappy JS-driven continuous scroll. Don't
leave prod between states — implement + verify this fully in one session before deploying.
