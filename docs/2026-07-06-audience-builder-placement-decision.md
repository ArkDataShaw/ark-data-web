# Audience Builder + Intent Showcase — Placement Decision Doc

**Date:** 2026-07-06 · **Author:** arkdata-redesign-2 · **Status:** awaiting Shaw's decisions

**Sandbox with all prototypes live:** https://arkdata-brainstorm-761.netlify.app (red banner = not production; production arkdata.io untouched). Branch: `sandbox/showcase-prototypes`.

---

## 1. The asset

The demo (`arkdata-audience-builder-demo.netlify.app`) is a zero-backend single-file app at full parity with the in-app builder. Verified properties:

- **Iframe-able:** no `X-Frame-Options`/`frame-ancestors` headers; embeds cleanly.
- **No deep-link params or postMessage:** landing state is fixed (empty builder). Pre-loading an example audience or signaling "Save clicked" to the parent page would require changes in the mockup repo (api-14's territory).
- **Load weight:** ~220KB HTML + ~3MB baked data/vendors + CDN maplibre/leaflet/pmtiles. Must never load with the homepage.
- **Masked 500-row preview** is part of the story — shown, not hidden.

## 2. Candidate surfaces (scored 1–5)

| Surface | Funnel fit | Wow | Load isolation | Effort | Verdict |
|---|---|---|---|---|---|
| **A. Homepage teaser (click-to-load iframe) after DataPipeline** | 5 — first-touch | 5 | 5 (nothing loads until click) | low | **build** |
| **B. Dedicated `/demo` page, full-bleed iframe, in main nav ("Live Demo")** | 5 — consideration | 5 | 5 | low | **build** |
| Product page embed | 3 — redundant w/ B | 3 | 4 | low | skip |
| Standalone subdomain (demo.arkdata.io) | 2 — leaves the site | 4 | 5 | med | skip |
| Vendored into site build (no iframe) | — | — | 2 (drags 3MB + vendor conflicts into site bundle) | high | skip |

**Recommendation: A + B (the standard data-platform pattern).** Homepage teaser in a browser-chrome frame with a play button → loads the live demo inline; "Open full-screen demo" → `/Demo` page (nav item "Live Demo") with intro band, full-height iframe, exit CTA into Start free / Book a walkthrough. Iframe-to-Netlify wins over vendoring: demo updates ship by redeploying the demo site, zero site-build coupling. (Demo site isn't git-linked — manual `netlify deploy` remains its update path; acceptable.)

## 3. Intent use-case showcase ("live data")

Prototype B on the sandbox homepage: **"Live signal feed"** — industry tabs (Solar/Home Services, Mortgage, Med Spas, B2B SaaS, Auto), each showing trending topics w/ weekly counts + WoW deltas + sparklines, an audience-sentence preview in the builder's grammar ("38,412 homeowners in TX, FL & AZ searched for *solar installation cost* this week"), a "the play" line, and **Build this audience → /Demo**. Currently baked illustrative numbers labeled as such.

- Placement: homepage after the feature grid; same component reusable on Solutions per-industry.
- **Path to genuinely live:** a daily job publishing an aggregate non-PII JSON (topic → count, WoW) the site fetches. Needs a data source decision (Q4 below).

## 4. Industry insights → newsletter ("Intent Pulse")

Prototype C: weekly industry briefs (stat + headline + 3-sentence take) + email capture ("One email a week. The signals moving in your industry, and the play to run on them."). On the sandbox it sits pre-FAQ on the homepage; real home would be a `/insights` (or Resources-merged) page with the homepage showing the 3 latest cards. Form is non-functional — needs an ESP decision (Q5).

## 5. Recommended visitor flow (builder demo)

1. Homepage teaser → click play → live demo loads inline (free-play).
2. `/Demo` full-screen for engaged visitors (also the nav's "Live Demo" — a high-signal CTA in itself).
3. Landing state today = empty builder. Better: pre-loaded example audience mid-flow (requires demo-repo change — Q2).
4. Save in the demo currently completes with canned data. Better: Save → signup gate ("Make it real — create your free account") (also demo-repo change — Q2).

## 6. Open questions for Shaw

1. **Approve A+B placement?** (homepage click-to-load teaser + `/Demo` page + "Live Demo" nav item)
2. **Demo-repo asks (for api-14):** (a) `?example=` param to land pre-loaded mid-flow; (b) Save → signup CTA instead of canned save; (c) optional postMessage so the site can react to demo events. Want me to write that request up?
3. **Use-case showcase placement:** homepage only, Solutions only, or both?
4. **Live data source for the signal feed:** keep "illustrative sample" label for launch, or wire a daily aggregate JSON export (needs a pipeline owner)?
5. **Intent Pulse:** which ESP/newsletter stack (Klaviyo? Beehiiv? HighLevel?) and does `/insights` become a top-level page or live under Resources?
6. **Nav label:** "Live Demo" vs "Try the Builder" vs putting it inside "Platform"?
