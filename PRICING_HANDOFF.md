# Pricing Model Handoff — locked 2026-05-07

> **For:** the `arkdata-web-dev` agent (or any developer touching the marketing site Pricing experience)
> **From:** `arkdata-dev6` session, 2026-05-07
> **Status:** Pricing model is LOCKED. Marketing site needs to be updated to match.

## TL;DR

The old exponential formula (`900 × (1 - e^(-0.000138629 × EV))` with $900 asymptote) used in `src/components/pricing/EnrichedVisitsCalculator.jsx` and `src/components/pricing/PricingCalculatorTour.jsx` is **OUT**. Replace with the new piecewise formula below.

The canonical JS implementation is already vendored at `src/lib/billingPricing.js` — import from there. Don't reimplement.

## The locked formula

```
n ≤ 200             → $0
200 < n ≤ 12,500    → 6.5 × √(n − 200)
n > 12,500          → ANCHOR + 0.025·m + (50000/3)·ln(1 + 1.2×10⁻⁶·m)

where m = n − 12,500
      ANCHOR = 6.5 × √12,300 ≈ $720.885
```

`n` is monthly identified resolutions for the customer (sum across all their pixels). Free tier covers the first 200 each month.

## Constants exported by `src/lib/billingPricing.js`

```js
import {
  FREE_TIER,             // 200
  SQRT_COEFFICIENT,      // 6.5
  SQRT_BAND_END,         // 12,500
  LINEAR_RATE,           // 0.025  ($/res floor in linear+log band)
  LOG_DECAY_C,           // 50000/3 ≈ 16,666.67
  LOG_DECAY_ALPHA,       // 1.2e-6
  ANCHOR_DOLLARS,        // ≈ 720.885
  ENTERPRISE_THRESHOLD,  // 250,000
  computeCost,           // (n) => { total_cents, breakdown[], marginal_rate_per_res }
  computeMarginalRate,   // (n) => $/res slope at n
  isEnterprise,          // (n) => bool, true at or above 250K
  formatCents,           // (cents) => "$1,234.56"
  formatRatePerRes,      // (rate) => "$0.0457"
} from '@/lib/billingPricing';
```

These constants must NEVER be hardcoded anywhere else. If you need to change pricing, edit `src/lib/billingPricing.js`, but be aware it is mirrored from the backend at `infra/functions/src/billing-pricing.ts` in the main `arkdata` repo (the SaaS app, not this marketing site). **A change here without a matching change there means customers see a different price on the marketing site than on the in-app billing page** — that's a trust-destroying bug. Always change both.

Canonical authority: `~/.claude/projects/-home-shaw-repos-arkdata/memory/project_arkdata_pricing_formula.md`.

## Bills + margins at key checkpoints

| n | Bill | $/res | Marginal | Margin (worst case) |
|---:|---:|---:|---:|---:|
| 300 | $65.00 | $0.2167 | $0.3250 | 95.8% |
| 1,000 | $183.85 | $0.1839 | $0.1149 | 95.1% |
| 5,000 | $450.33 | $0.0901 | $0.0469 | 90.0% |
| 12,500 (seam) | $720.88 | $0.0577 | $0.0293 → $0.0450 ⚠ | 84.4% |
| 25,000 | $1,281.53 | $0.0513 | $0.0447 | 82.4% |
| 100,000 | $4,572.47 | $0.0457 | $0.0431 | 80.3% |
| 250,000 (enterprise threshold) | $10,837.70 | $0.0434 | $0.0406 | 79.2% |
| 1,000,000 | $38,435.32 | $0.0384 | $0.0342 | 76.6% |
| 10,000,000 | $293,138.30 | $0.0293 | $0.0265 | 73.9% |
| 35,000,000 | $938,089.24 | $0.0268 | $0.0255 | 76.1% |

⚠ Marginal **steps up** at n=12,501 from $0.0293 to $0.0450. Bill is value-continuous (no jump), only the slope changes. This is intentional. Don't try to smooth it; Shaw locked the trade for ~$3K-$15K extra revenue per customer in the 25K-100K band on 2026-05-07.

## Competitive positioning vs RB2B (the headline)

| n | RB2B published | ArkData (new formula) | Undercut |
|---:|---:|---:|---:|
| 300 | $79 | $65 | 18% |
| 600 | $149 | $130 | 13% |
| 1,250 | $249 | $211 | 15% |
| 2,500 | $349 | $312 | 11% |
| 5,000 | $499 | $450 | 10% |
| 7,500 | $649 | $555 | 14% |
| 10,000 | $799 | $643 | 20% |
| 12,500 | $849 | $721 | 15% |
| > 12,500 | "Contact Sales" | published curve to 250K | wide open |

The 12.5K-250K band is where ArkData is uniquely positioned — RB2B and most competitors hide pricing past 12.5K. ArkData publishes the curve openly until 250K. **This is the messaging hook.** Lead with transparency.

## Self-serve vs Contact Us

`ENTERPRISE_THRESHOLD = 250,000` resolutions/month. Above this, the calculator should:
- **Hide the dollar amount** and replace it with a "Contact Sales" CTA + button
- Show helper text: *"For volumes above 250,000 resolutions/month, contact our team for custom pricing including annual prepay, SLA, and dedicated support."*

Below 250K: regular self-serve, "Start Free Trial" or equivalent CTA.

A `isEnterprise(n)` helper is exported from `src/lib/billingPricing.js` for this exact gate.

## UI principle (Shaw locked 2026-05-07)

**Customer-facing UI never exposes the band structure.** No "first 200 free, next 12,300 sqrt curve, then linear+log decay" breakdown. The customer sees:
- A numeric input for resolutions
- A live computed dollar output

That's it. The formula is implementation detail; the bill is the product. Charts of the curve, threshold tier visualizations, formula explainers — all out. The same principle applies to the in-app billing page in the SaaS dashboard repo.

## Files in this repo that need updating

| File | Current state | Action |
|---|---|---|
| `src/pages/Pricing.jsx` | Uses old exponential formula | Rewrite calculator block to use `computeCost` from `src/lib/billingPricing.js`. Replace any references to `ASYMPTOTE = 900` / `DECAY = 0.000138629`. |
| `src/components/pricing/EnrichedVisitsCalculator.jsx` | 334 lines, uses `900 × (1 - e^(-0.000138629 × EV))` | **Delete this file OR rewrite top-to-bottom.** The exponential model is wrong. New calculator: numeric input + live dollar, no band breakdown, no chart. Use `computeCost` from `src/lib/billingPricing.js`. Add 250K cap with Contact Sales CTA. |
| `src/components/pricing/PricingCalculatorTour.jsx` | 327 lines, references the same exponential | Same — rewrite or delete. If keeping a guided-tour pattern, redirect every formula reference to `computeCost`. |
| `src/lib/billingPricing.js` | **Already vendored** ✓ | Don't modify; this is the canonical source. If pricing changes, sync from the SaaS repo (`apps/web/src/lib/billingPricing.js`). |
| Any RB2B comparison tables | Currently show old ArkData numbers | Recompute against the new formula at every comparison row. The undercut narrative is now 10-20% (vs 30-50% in the old model) — still a clear win, but the headline numbers are different. |

## Acceptance criteria for the marketing site update

The agent's work is done when:

1. The Pricing page calculator takes a numeric input for monthly resolutions and shows a live computed dollar amount via `computeCost` from `src/lib/billingPricing.js`.
2. At and above 250,000 resolutions, the dollar output is replaced by "Contact Sales" + a CTA button (`isEnterprise(n) === true`).
3. No references to `ASYMPTOTE = 900` or `DECAY = 0.000138629` remain in the codebase (`grep -r 'ASYMPTOTE\\|0.000138629' src/` returns 0 results).
4. RB2B comparison data — if displayed — uses the new ArkData numbers from the table above.
5. Build passes (`npm run build`) clean.
6. The Pricing page renders without console errors at every screen width.

## How to verify the JS module is correct

After importing:
```js
import { computeCost, isEnterprise } from '@/lib/billingPricing';

// Should return total_cents = 6500
console.log(computeCost(300).total_cents);

// Should return total_cents ≈ 72088
console.log(computeCost(12500).total_cents);

// Should return false
console.log(isEnterprise(249_999));

// Should return true
console.log(isEnterprise(250_000));
```

If any of those values are off, the module is broken — stop and escalate. Don't try to "fix" the formula; the module is byte-identical to the SaaS-app backend (verified across 28 checkpoints with 0 mismatches on 2026-05-07).

## Non-goals for this handoff

- Don't change the RB2B comparison structure on the page; just update the numbers.
- Don't add new pricing tiers or features; the model is single-curve self-serve up to 250K, Contact Sales above. No "Starter / Pro / Enterprise" plans on this site.
- Don't write a backend on this repo for billing — billing happens in the SaaS dashboard (`apps/web` in the `arkdata` repo). This site is marketing only.
- Don't expose the band structure (no "tier breakdown" tables, no curve chart with threshold annotations). Keep it: input → dollar.

## Handoff complete

The pricing module is vendored, the formula is locked, and the action items are explicit. When you next spawn, your first move on the Pricing page is rewriting the calculator. Telegram Shaw with `[arkdata-web-dev]` prefix when the rewrite is deployed.

Sources of authority (in order):
1. `~/.claude/projects/-home-shaw-repos-arkdata/memory/project_arkdata_pricing_formula.md` (canonical constants)
2. `~/repos/arkdata/docs/superpowers/specs/2026-05-05-usage-based-billing-page-design.md` (full design)
3. `~/repos/arkdata/infra/functions/src/billing-pricing.ts` (backend implementation, single source of truth)
4. `~/repos/arkdata/apps/web/src/lib/billingPricing.js` (frontend mirror — same as `src/lib/billingPricing.js` here)
5. This file.
