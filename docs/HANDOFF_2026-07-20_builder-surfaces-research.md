# Handoff addendum: ALL audience-builder surfaces — deep-research mission (2026-07-20)

Companion to `HANDOFF_2026-07-20_Audience-Builder-Audit.md` (read that first — it covers surfaces 1–5 exhaustively). Shaw's ask: the builder family has GROWN; research EVERY instance in depth and produce a current feature-state matrix for each.

## The full surface inventory (as discovered 2026-07-20 — successor must verify + deepen)

### Known & at-parity (fully documented in the prior handoff + audit docs)
| # | Surface | Where | State |
|---|---|---|---|
| 1 | HTML standalone / proposals embed (`?embed=insights`) | `~/repos/audience-builder-mockup/index.html` + netlify fn | at parity; insights-only embed; shared resolver fixed `4bad5b7` |
| 2 | React standalone (STANDARD mode) | `~/repos/audience-builder-react` | at parity through `781b57b` |
| 3 | app.arkdata.io | `~/repos/arkdata/apps/web` | reference product |
| 4 | arkdata.io vendored | `~/repos/ark-data-web/public/builder/` | caught up `660bcf2`…`0e48df5` |
| 5 | proposal-builder native charts | `~/repos/audience-builder-mockup/proposal-builder.html` | in sync w/ mockup renderers |

### NEW / UNAUDITED — the research targets
| # | Surface | Where | What I know (shallow — 10-min probe only) |
|---|---|---|---|
| 6 | **Custom audience builder** (= #2 + custom-intent mode) | `~/repos/audience-builder-react` — store `mode:'custom'`, `customTopic`/`customThreadStarted`/ci chips; HEAVY recent commits (`fc1641a`…`a108b1e`): composer w/ OR-groups, 50-row preview over-request, email/phone masking, explore-chart legend, `ci2` namespace | Was "coming soon/disabled" during my audits — now an ACTIVE feature lineage someone else is building. My parity matrix rows for #2 predate it. UNKNOWN: which chart/popover rules apply in custom mode; whether my twin-ports (hierarchy, radius, excludes, radius-default) behave in the custom sidebar; deploy state. |
| 7 | **Proposals REACT version** | `~/repos/proposals-refactor` — research dossier + `app/` w/ `src/audience/AudienceMount.jsx`, `InsightsShell.tsx` | Status "PREP PHASE awaiting Shaw's explicit GO": React replica of proposals.arkdata.io for import INTO app.arkdata.io. Snapshot pinned at mockup `395c99d` (2026-07-19) and explicitly drift-dated — MY later commits (`4bad5b7` resolver, `85602f3` cbrow, hierarchy/radius) POSTDATE its snapshot. Reference port: `~/repos/arkdata-reports` branch `feat/reports-phase3-builder`. |
| 8+ | **Satellites to triage** | `~/repos/proposal-builder` (fresh split "from audience-builder-mockup" — is it a fork that will drift?), `~/repos/arkdata-customintent` (Meta-CA deploy runbooks — the custom-intent BACKEND), `~/repos/arkdata-proposals-foldin`, `~/repos/arkdata-reports@feat/reports-phase3-builder` (ANOTHER builder port), `SimpleAudienceMobile`, `arkdata-audiences-mobile` | Each may contain a builder copy or builder-consuming surface. Classify: live surface / prep dossier / backend / dead fork. |

## Research mission for the successor (per surface, produce)
1. **Identity**: repo+entry files, deploy target+command, owning agent/lineage (check tmux + recent git authors), live URL.
2. **Feature-state matrix row-set**: score against `docs/audience-builder-chart-view-rules.md` (P1–P10, §1–8) + the popover-parity set (hierarchy, tri-excludes, radius+default, cbrow −10px, band labels, border-leak) + resolver semantics (department field, seniority HIER) + intent-phase. Use the ✅/◑/✗/⊘ format from `docs/audience-builder-version-audit.md` and APPEND to that doc.
3. **Drift vectors**: what snapshot is it pinned to; who is actively editing it; what of my 07-17→07-20 work is missing from it.
4. **Custom-intent mode specifically**: full feature catalog (composer, OR-groups, preview masking, explore charts), which standard-mode parity items apply, and whether custom mode exists/should exist on the other surfaces.
5. **proposals-refactor specifically**: reconcile its drift-dated dossier against current mockup HEAD; list exactly which post-`395c99d` commits its eventual GO-build must incorporate (at minimum: `4bad5b7`, `85602f3`, `3cb06ff`, `563930c`, `bb640e2`, `af0db86`, embed layout commits `1e7594e`/`2a806a6`).

## Method notes
- Read-only research first; report before fixing (Shaw's explain-vs-code rule).
- Coordinate before touching: #6 has an active lineage (recent commits not mine); #7 is proposals-refactor agent's territory; #4 goes through arkdata-web-opus-5.
- Verify against CODE, measure with DOM/API probes — the prior handoff's gotchas (chrome restarts, node --check pattern, deploy traps) all apply.
