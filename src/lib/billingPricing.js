/**
 * ArkData pricing formula — frontend mirror of infra/functions/src/billing-pricing.ts.
 *
 *   n ≤ 200             → $0
 *   200 < n ≤ 12,500    → 6.5 × √(n − 200)
 *   n > 12,500          → ANCHOR + 0.025·m + 16,666.67·ln(1 + 1.2×10⁻⁶·m)
 *
 * Used by the public Pricing calculator and the in-app Billing page so the
 * UI can show live computed bills without a network round-trip per slider tick.
 *
 * CONSTANTS MUST STAY IN SYNC with infra/functions/src/billing-pricing.ts.
 * Canonical source: memory/project_arkdata_pricing_formula.md.
 *
 * Returns integer-cent totals so JS and TS sides agree to the cent.
 */

export const FREE_TIER = 200;
export const SQRT_COEFFICIENT = 6.5;
export const SQRT_BAND_END = 12_500;
export const LINEAR_RATE = 0.025;
export const LOG_DECAY_C = 50_000 / 3;            // = 0.020 / LOG_DECAY_ALPHA
export const LOG_DECAY_ALPHA = 1.2e-6;
export const ANCHOR_DOLLARS = SQRT_COEFFICIENT * Math.sqrt(SQRT_BAND_END - FREE_TIER);
export const ENTERPRISE_THRESHOLD = 250_000;

const round = (dollars) => Math.round(dollars * 100);

/** Total bill in integer cents for n billable resolutions in a calendar month.
 *  Returns { total_cents, breakdown[], marginal_rate_per_res }.  */
export function computeCost(resolutions) {
  const n = Math.max(0, Math.floor(resolutions || 0));
  const breakdown = [];

  if (n === 0) {
    breakdown.push({ band: 'free', records_in_band: 0, band_cost_cents: 0 });
    return { total_cents: 0, breakdown, marginal_rate_per_res: 0 };
  }

  if (n <= FREE_TIER) {
    breakdown.push({ band: 'free', records_in_band: n, band_cost_cents: 0 });
    return { total_cents: 0, breakdown, marginal_rate_per_res: 0 };
  }

  breakdown.push({ band: 'free', records_in_band: FREE_TIER, band_cost_cents: 0 });

  const sqrtRecords = Math.min(n, SQRT_BAND_END) - FREE_TIER;
  const sqrtBillDollars = SQRT_COEFFICIENT * Math.sqrt(sqrtRecords);
  breakdown.push({
    band: 'sqrt',
    records_in_band: sqrtRecords,
    band_cost_cents: round(sqrtBillDollars),
  });

  if (n <= SQRT_BAND_END) {
    return {
      total_cents: round(sqrtBillDollars),
      breakdown,
      marginal_rate_per_res: computeMarginalRate(n),
    };
  }

  const m = n - SQRT_BAND_END;
  const linearDollars = LINEAR_RATE * m;
  const logDollars = LOG_DECAY_C * Math.log(1 + LOG_DECAY_ALPHA * m);

  breakdown.push({ band: 'linear_floor', records_in_band: m, band_cost_cents: round(linearDollars) });
  breakdown.push({ band: 'log_decay', records_in_band: m, band_cost_cents: round(logDollars) });

  return {
    total_cents: round(ANCHOR_DOLLARS + linearDollars + logDollars),
    breakdown,
    marginal_rate_per_res: computeMarginalRate(n),
  };
}

/** Marginal rate ($/res) at exactly n. Right-side value at the seam. */
export function computeMarginalRate(resolutions) {
  const n = Math.max(0, Math.floor(resolutions || 0));
  if (n <= FREE_TIER) return 0;
  if (n < SQRT_BAND_END) {
    return SQRT_COEFFICIENT / (2 * Math.sqrt(n - FREE_TIER));
  }
  const m = Math.max(0, n - SQRT_BAND_END);
  return LINEAR_RATE + (LOG_DECAY_C * LOG_DECAY_ALPHA) / (1 + LOG_DECAY_ALPHA * m);
}

/** True at or above the Contact-Sales threshold. */
export function isEnterprise(resolutions) {
  return (resolutions || 0) >= ENTERPRISE_THRESHOLD;
}

/** UI helper: integer cents → "$1,234.56" formatted string. */
export function formatCents(cents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format((cents || 0) / 100);
}

/** UI helper: a $/res value (decimal dollars) → "$0.0457" formatted string with 4 decimals. */
export function formatRatePerRes(rate) {
  return `$${(rate || 0).toFixed(4)}`;
}
