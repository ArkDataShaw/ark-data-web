# Handoff: arkdata.io `/voters/*` Pages — What Happened, Where Things Live, What We Want

**Date:** 2026-07-15
**Status:** Production incident RESOLVED (rolled back). California page still live standalone. Getting it
onto `arkdata.io` cleanly is the open task.

---

## 1. What we were trying to do (intention)

Add **unlisted static pages** to `arkdata.io` under the path `/voters/california` (and eventually
`/voters/map`, `/voters/new-york`, etc.) that are:

- **Not linked** from anywhere on the main marketing site
- Only reachable via **direct URL**
- **Self-contained static HTML** (NOT part of the React SPA in this repo)
- Per-state political / voter data overviews (for the DataMoon political pitch)

---

## 2. Where the California page assets live

- **Source repo:** `~/repos/datamoon-political-pitch/`
  - GitHub: `git@github.com:ShawCole/datamoon-political-pitch.git`
  - Files: `california.html`, `candidates.html`, `data-provenance.html`, `index.html`, `logos/`,
    `arkdata-logo.png`, `netlify.toml`
- **Deployed standalone site (unaffected by the incident):**
  - Netlify **site ID `8a03c5da-899f-44b9-9577-7112928d08d8`**
  - Live URL: **https://arkdata-political.netlify.app/california.html** (verified `200`, still serving)
- These assets are **completely separate** from the marketing site in `~/repos/ark-data-web`. Nothing
  about the California page belongs in this repo's build.

---

## 3. What actually happened (the incident)

To try to get the California page onto `arkdata.io`, a **full `dist/` / site was pushed to the arkdata
production Netlify site with `netlify deploy --prod` from local.** That deploy **replaced the entire
production `arkdata.io` site.** The replacement build failed its base44 auth bootstrap, so every
visitor to `arkdata.io` was **redirected to the app login (`app.arkdata.io`)** instead of seeing the
marketing site.

`arkdata.io` is supposed to be the public marketing site; `app.arkdata.io` is the product/login. The
bad deploy collapsed the two.

### The production domain vs. this repo — IMPORTANT mismatch
- **`arkdata.io` (production) is served by Netlify site `d38e2137-d97d-42ae-b719-d6581902f5a2`**
  (the "arkdata-prod" site).
- **This repo (`~/repos/ark-data-web`) is linked to a DIFFERENT site:**
  `f646b925-ec7e-4bfc-9c60-40321d68d09b` (see `.netlify/state.json`).
- So `netlify deploy --prod` **from this repo does not even target the live domain** — and a manual
  `--prod` deploy of a local `dist/` straight to `d38e2137` overwrites the whole production site. This
  mismatch is the core footgun that made the incident possible.

---

## 4. The rollback (fix that was applied)

Restored the last-known-good production deploy on the arkdata-prod site:

```
netlify api restoreSiteDeploy --data '{
  "site_id": "d38e2137-d97d-42ae-b719-d6581902f5a2",
  "deploy_id": "6a545ca1b63d0890a7f70b91"
}'
# → Restored: 6a545ca1b63d0890a7f70b91 | state=ready | 2026-07-13T03:33:53.721Z
```

**Verified after rollback:** `arkdata.io` serves the marketing SPA again (`<title>ArkData</title>`,
`<div id="root">`, bundle `/assets/index-DYIBadQ3.js`), and no longer redirects to the app login.

The California standalone page (`arkdata-political.netlify.app/california.html`) was never touched and
is still live.

---

## 5. Root-cause correction (read this before "fixing" code)

An earlier pass in this session mis-diagnosed the cause as **code in this repo** — specifically the
`public/_redirects` `/api/*` catch-all (commit `b2537ff`) feeding the base44 auth gate in
`src/App.jsx` → `src/lib/AuthContext.jsx`. **That diagnosis was wrong for this incident.**

- Commit `b2537ff` is an **ancestor of the July-13 deploy `6a545ca` that we rolled back _to_** — and
  that deploy works correctly. If the `/api/*` redirect were the cause, the restored deploy would
  redirect to login too. It doesn't. Therefore the `/api/*` rule is **not** what broke production.
- The operative cause was **a bad full-site production deploy overwriting the domain's site**, not any
  code path on `main`. **No code change is warranted as a fix for this incident**, and `App.jsx` /
  `_redirects` should **not** be edited reactively. (App.jsx / AuthContext are unchanged since the
  initial base44 scaffold.)

> Separate, lower-priority note: the `/api/*` catch-all in `public/_redirects` does proxy base44's
> `/api/apps/*` calls to the audience-builder-demo functions site, which is untidy. It is a latent
> cleanup candidate, NOT the cause of this outage. If ever touched, narrow it to only the builder's
> real path (`/api/audience`) and verify against the live domain's site — do not conflate it with this
> incident.

---

## 6. What we'd like to have happen (options to get `/voters/california` onto arkdata.io safely)

All three keep the marketing site's own deploy pipeline untouched.

### Option A — Netlify proxy/rewrite on the production site (best UX)
Add a rewrite to the **arkdata-prod site (`d38e2137`)** config so the URL stays on `arkdata.io`:
```
/voters/*  https://arkdata-political.netlify.app/:splat  200
```
- Pros: clean `arkdata.io/voters/california` URL; assets stay in the political-pitch repo.
- Cons: must be applied to the **production site's** own config and shipped through its proper
  pipeline — **never** by pushing a local `dist/` with `netlify deploy --prod`.

### Option B — Subdomain `voters.arkdata.io` (safest, zero risk to the main site)
Point a `voters.arkdata.io` domain alias / CNAME at the **arkdata-political** Netlify site
(`8a03c5da`).
- Pros: fully isolated from the marketing site; impossible to clobber `arkdata.io`; no shared deploy.
- Cons: URL is a subdomain, not a path under the apex.

### Option C — Use the standalone URL as-is
Share `https://arkdata-political.netlify.app/california.html` directly, or attach a custom domain to
that standalone site.
- Pros: nothing to change; already live.
- Cons: not an `arkdata.io` URL.

---

## 7. Guardrails / core lessons

1. **Never `netlify deploy --prod` a full `dist/` to the arkdata production site (`d38e2137`) from
   local.** It replaces the entire production site.
2. **Reconcile the repo's Netlify link vs. the live domain's site before any deploy.** This repo is
   linked to `f646b925`, but `arkdata.io` is on `d38e2137` — they are not the same site.
3. **Unlisted add-on pages should be isolated** from the marketing site — prefer a proxy rewrite
   (Option A) or a subdomain (Option B), and keep their source in the political-pitch repo, never
   bundled into `ark-data-web`.
4. **Fix incidents by rolling back the bad deploy**, not by editing unrelated code on `main`.

---

## Reference — key IDs

| Thing | Netlify site ID | URL |
|---|---|---|
| arkdata.io production ("arkdata-prod") | `d38e2137-d97d-42ae-b719-d6581902f5a2` | https://arkdata.io |
| This marketing repo's linked site | `f646b925-ec7e-4bfc-9c60-40321d68d09b` | (not the live apex) |
| Political pitch / California page | `8a03c5da-899f-44b9-9577-7112928d08d8` | https://arkdata-political.netlify.app |
| Last-known-good prod deploy (restored) | deploy `6a545ca1b63d0890a7f70b91` | 2026-07-13T03:33:53Z |

- California page source: `~/repos/datamoon-political-pitch/california.html`
  (GitHub `ShawCole/datamoon-political-pitch`)
