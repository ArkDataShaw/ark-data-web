/* ArkEmbed — scripted homepage mode for the vendored Audience Builder.
 * Active only with ?script=1. Exposes window.ArkEmbed for the parent page
 * (same origin) to drive the scroll story:
 *   - applyAll(): apply the solar example filters; strip chips are tagged by
 *     group and hidden (visibility) so their layout/rects stay measurable.
 *   - chipInfo(): [{group, rect, html}] for pixel-perfect clones.
 *   - reveal(group)/hideGroup(group): flip real chips as ghosts land.
 *   - generate(): clicks the REAL Generate; proxy calls are served from the
 *     baked snapshot (deterministic, instant-ish, zero upstream cost).
 *     After the snapshot flow completes, canned mode disarms — the user's own
 *     Generate runs live against /api/audience.
 *   - setDataReveal(x): scroll-driven fade-in of map + insight cards.
 */
(function () {
  var qp = new URLSearchParams(location.search);
  if (qp.get('script') == null) return;

  // ---- reveal CSS (chips hidden until landed; data hidden until revealed) --
  var css = document.createElement('style');
  css.textContent = [
    '#chips .chip.ark-hidden{visibility:hidden}',
    'body.ark-data-hidden #previewArea .card{opacity:0}',
    // funnel: the MAP and the COVERAGE card are visible from stage 1 — they
    // ARE the per-beat story; remaining cards fade in at the end.
    'body.ark-data-hidden #previewArea .maprail .card:first-child{opacity:1}',
    // full-height mobile demo: the ENTIRE maprail triple chart (Coverage + Top states +
    // Intent) is the live narration — visible the whole story, updating per stage. Only the
    // insights grid below fades in at the reveal. Desktop (no ark-fullheight) keeps the
    // coverage-only rule above. Shaw 2026-07-08.
    'body.ark-fullheight.ark-data-hidden #previewArea .maprail .card{opacity:1}',
    // full-height demo: Age & Gender + Homeownership + Family Dynamics are all live per-stage —
    // show them in their normal insights-grid slots the whole story (Shaw 2026-07-08 / -07-09).
    'body.ark-fullheight.ark-data-hidden #previewArea #card-age{opacity:1}',
    'body.ark-fullheight.ark-data-hidden #previewArea #card-home{opacity:1}',
    'body.ark-fullheight.ark-data-hidden #previewArea #card-family{opacity:1}',
    '#previewArea .card, #previewArea #map{transition:opacity .55s ease}',
    '#reachNum.ark-hidden{visibility:hidden}',
    '#saveBtn{display:none}', // no Save in the scripted homepage embed
    '#audname{display:none}', // no name input in the demo (Shaw 2026-07-07)
    '#viewSeg{display:none}', // no 500-row preview in the embed — Map & insights only
    // chips stay inline with the reach number — never wrap to their own row
    '.strip.wrapchips .stripchips{flex:1;margin-top:0}',
    // funnel hold: everything is pre-baked — never show "Building full density"
    'body.ark-funnel-hold #mapLoading{display:none!important}',
  ].join('\n');
  document.head.appendChild(css);

  // generic: group = the chip's <b>Label:</b> slug — works for ANY filter the
  // user selects, not just the scripted solar set
  var GROUP_OF = function (chipEl) {
    var b = chipEl.querySelector('b');
    var g = (b ? b.textContent : '').replace(/:\s*$/, '').trim().toLowerCase();
    if (!g) g = (chipEl.textContent || '').replace(/\u2715\s*$/, '').trim().toLowerCase(); // prefix-less chips (e.g. "Homeowners")
    return g ? g.replace(/\s+/g, '-') : 'other';
  };

  var canned = null;       // snapshot, once loaded
  var cannedArmed = false; // serve canned responses while true
  var origCallProxy = null;

  function armCanned() {
    if (origCallProxy) { cannedArmed = true; return; }
    origCallProxy = window.callProxy;
    window.callProxy = async function (payload) {
      if (cannedArmed && canned && canned.responses) {
        var r = canned.responses[payload.action];
        if (payload.action === 'cleanup') return { status: 200, body: { ok: true } };
        // funnel mode: hold full density until the final stage releases it
        if (payload.action === 'geoPoll' && window.ArkEmbed.holdGeo && !window.ArkEmbed._geoReleased) {
          document.body.classList.add('ark-funnel-hold'); // all data is baked — suppress loading theater
          await new Promise(function (res) { setTimeout(res, 300); });
          return { status: 200, body: { ready: false, status: 'building' } };
        }
        if (r) {
          // small latency so the generating theater is visible but snappy
          await new Promise(function (res) { setTimeout(res, payload.action === 'build' ? 500 : 350); });
          if (payload.action === 'geoPoll') cannedArmed = false; // final canned step → go live after
          return { status: r.status, body: r.body };
        }
      }
      return origCallProxy(payload);
    };
    cannedArmed = true;
  }

  function tagChips() {
    var els = document.querySelectorAll('#chips .chip');
    els.forEach(function (el) {
      el.dataset.arkGroup = GROUP_OF(el);
      el.classList.add('ark-hidden');
    });
  }

  window.ArkEmbed = {
    // NOTE: the app's state is `let S` — a global *lexical* binding, not a
    // window property. This script shares the iframe's global scope, so bare
    // identifiers resolve it; window.S does NOT.
    get ready() {
      try { return !!(S && typeof sync === 'function' && typeof renderSidebar === 'function'); }
      catch (e) { return false; }
    },

    // The scripted audience as ORDERED STEPS. Each step is one S mutation;
    // apply via applyStep(i)+sync() so the builder's own renderer decides the
    // surface — chips on desktop, sentence fragments at ≤1000px (mobile has
    // NO chips; never touch chip DOM as a beat).
    STEPS: [
      { id: 'topic', apply: function () { S.topics.add('Pool Construction'); S.topicMeta['Pool Construction'] = { id: 7676, kind: 'b2c' }; }, unapply: function () { S.topics.clear(); S.topicMeta = {}; } },
      { id: 'geo', apply: function () { S.loc.personal.state.add('FL'); }, unapply: function () { S.loc.personal.state.clear(); } },
      { id: 'homeowner', apply: function () { S.checks.homeowner = new Set(['Homeowner']); }, unapply: function () { delete S.checks.homeowner; } },
      { id: 'metros', apply: function () { ['Miami Metro', 'Fort Lauderdale Metro'].forEach(function (m) { S.loc.personal.metro.add(m); }); }, unapply: function () { S.loc.personal.metro.clear(); } },
      { id: 'networth', apply: function () { S.checks.networth = new Set(['more than $1,000,000']); }, unapply: function () { delete S.checks.networth; } },
    ],
    applyStep: function (i) { this.STEPS[i].apply(); renderSidebar(); sync(); tagChips(); },
    unapplyStep: function (i) { this.STEPS[i].unapply(); renderSidebar(); sync(); tagChips(); },
    setReach: function (n) { try { setReach(n); if (window.renderSentence) renderSentence(); } catch (e) { /* noop */ } },
    isMobile: function () { return window.innerWidth <= 1000; },

    applyAll: function () {
      var self = this;
      this.STEPS.forEach(function (st) { st.apply(); });
      renderSidebar(); sync();
      tagChips();
      var rn = document.getElementById('reachNum');
      if (rn) rn.classList.add('ark-hidden');
      document.body.classList.add('ark-data-hidden');
    },

    chipInfo: function () {
      var out = [];
      document.querySelectorAll('#chips .chip').forEach(function (el) {
        var r = el.getBoundingClientRect();
        var b = el.querySelector('b');
        var label = b ? b.textContent : '';
        // chip text = "<b>Group:</b> value ✕" — value is everything after the label, minus the ✕
        var value = (el.textContent || '').replace(label, '').replace(/✕\s*$/, '').trim();
        out.push({ group: el.dataset.arkGroup, rect: { x: r.left, y: r.top, w: r.width, h: r.height }, label: label, value: value, exclude: el.classList.contains('excl') });
      });
      return out;
    },

    reveal: function (group) {
      document.querySelectorAll('#chips .chip').forEach(function (el) {
        if (el.dataset.arkGroup === group) el.classList.remove('ark-hidden');
      });
    },
    hideGroup: function (group) {
      document.querySelectorAll('#chips .chip').forEach(function (el) {
        if (el.dataset.arkGroup === group) el.classList.add('ark-hidden');
      });
    },

    // re-tag + hide the CURRENT chips (whatever the user selected) so the
    // story can replay with them after a scroll-back-up
    retag: function () { tagChips(); },

    // ── mobile native-scroll demo ───────────────────────────────────────────
    // enableFullHeight: drop the shell/main internal scrollers (body class,
    //   CSS in index.html) so the builder lays out at full content height. The
    //   parent then hosts a full-height, position:sticky iframe: the map+strip
    //   pin through the scripted story, then the whole builder scrolls with the
    //   page natively (real momentum) through the charts/records.
    // fullHeight: the builder's full content height, for the parent to size the iframe.
    enableFullHeight: function () { document.body.classList.add('ark-fullheight'); },
    fullHeight: function () { return document.documentElement.scrollHeight; },
    // Per-bar tooltip on TAP, forwarded from the parent (the demo iframe is pointer-events:none
    // so page scroll passes through — direct touch never reaches the bars). x,y are in THIS
    // iframe's viewport space. Walk up from the hit element to a bar carrying _tapTip (stashed
    // by tipBind) and fire it. Returns true if a bar tooltip was shown. Shaw 2026-07-08.
    tapTooltipAt: function (x, y) {
      try {
        var el = document.elementFromPoint(x, y);
        for (var i = 0; el && i < 5; i++) { if (el._tapTip) { el._tapTip(); return true; } el = el.parentElement; }
      } catch (e) { /* noop */ }
      if (typeof ChartTip !== 'undefined' && ChartTip._open) ChartTip._open.leave(); // tapped empty space → dismiss
      return false;
    },
    dismissTip: function () { try { if (typeof ChartTip !== 'undefined' && ChartTip._open) ChartTip._open.leave(); } catch (e) { /* noop */ } },

    loadSnapshot: function (url) {
      return fetch(url).then(function (r) { return r.json(); }).then(function (j) { canned = j; });
    },

    // ── funnel drill-down (mobile story) ────────────────────────────────────
    // Each sentence stage repaints the map (state choropleth) + coverage card
    // + reach from a baked per-stage insights snapshot, so the audience
    // visibly narrows beat by beat. The canned geoPoll is HELD until the final
    // stage so full FL density/charts don't paint early.
    _stages: null,
    _stageIdx: -1,
    holdGeo: false,      // parent sets true BEFORE generate() on mobile
    _geoReleased: false,
    loadStages: function (url) {
      var self = this;
      return fetch(url).then(function (r) { return r.json(); }).then(function (j) { self._stages = j.stages; });
    },
    _fullFlipped: false,
    _flipToFull: function () {
      if (this._fullFlipped) return;
      var full = document.querySelector('#mapMode input[value="full"]');
      if (full && !full.checked) { full.checked = true; full.dispatchEvent(new Event('change')); }
      this._fullFlipped = true;
    },
    _flipToState: function () {
      if (!this._fullFlipped) return;
      var st = document.querySelector('#mapMode input[value="state"]');
      if (st && !st.checked) { st.checked = true; st.dispatchEvent(new Event('change')); }
      this._fullFlipped = false;
    },
    FL_BBOX: [-87.633, 25.121, -80.031, 31.003],
    SFL_BBOX: [-80.491, 25.558, -80.091, 26.315], // Miami+FtLaud metro zips union (WPB dropped 2026-07-08 → tighter zoom)
    SFL_OFFSET: [0, 10], // scoot the framed area ~20px DOWN in the view. NOTE: MapLibre's fitBounds `offset` lands at 2× on-screen (measured), so 10 → 20px. Shaw 2026-07-08
    // The exact key updateMapScope() computes once the metros are on S (states
    // {FL} + the metros' resolved zips). Pinning _lastScopeKey to this BEFORE the
    // metro beat's sync() makes updateMapScope a no-op, so the ONLY fit that runs
    // is our explicit SFL_BBOX one — no all-FL bounce (ZIP_LOOKUP is absent on
    // mobile, so updateMapScope would otherwise fall back to the FL state bbox).
    _metroScopeKey: function () {
      var z = new Set();
      if (typeof US_METROS !== 'undefined') {
        ['Miami Metro', 'Fort Lauderdale Metro'].forEach(function (n) {
          var mm = US_METROS.find(function (x) { return x.n === n; });
          if (mm && mm.z) mm.z.forEach(function (zz) { z.add(zz); });
        });
      }
      return 'FL|' + [...z].sort().join(',');
    },
    mapReady: function () { var m = window._fullMap; return !!(m && (!m.loaded || m.loaded())); },
    _paintedKey: '',
    _paintStage: function (idx, counties) {
      // paint only when the (stage, layer) actually changes, or the builder
      // nulled _geoData (startPull does at Generate) — county repaints are
      // expensive (~3k feature-states) and froze phones when done per-tick
      var key = idx + (counties ? 'c' : 's');
      if (this._paintedKey === key && window._geoData) return;
      var st = this._stages && this._stages[idx];
      if (!st) return;
      var g = { people: { states: st.states, counties: counties ? (st.counties || []) : [], zips: st.zips || [] }, professional: null, company: null };
      try {
        if (window._setEmbedGeoData) window._setEmbedGeoData(g); else window._geoData = g;
        if (window.applyStateWithPhase1Anim) window.applyStateWithPhase1Anim();
        this._paintedKey = key;
      } catch (e) { /* map not up — heartbeat retries */ }
    },
    _lastBeatT: 0,
    // reach BEFORE the beat's S mutation — so applyStep's sync() renders ONCE
    // with new reach + new fragments together. A second renderSentence right
    // after the beat rebuilt innerHTML with all keys already seen and
    // DESTROYED the fly-in animation (fable-5 regression 2026-07-08).
    _preSetReach: function (idx) {
      var st = this._stages && this._stages[idx];
      if (!st) return;
      try { if (window._reach !== st.reach) setReach(st.reach); } catch (e) { /* noop */ }
    },
    _setStageMeta: function (idx) {
      var st = this._stages && this._stages[idx];
      if (!st) return;
      // reach only re-rendered OUTSIDE the animation grace window (reassert path)
      try {
        if (window._reach !== st.reach) {
          setReach(st.reach);
          if (window.renderSentence && (performance.now() - this._lastBeatT) > 1600) renderSentence();
        }
      } catch (e) { /* noop */ }
      var cov = document.getElementById('coverageStats');
      if (cov) {
        // build the 4 stat tiles ONCE (the estimate-mode renderCharts that used to build them
        // is now skipped during the scripted funnel), then update values per tick idempotently.
        if (!cov.querySelector('.stat') && typeof renderCoverage === 'function') renderCoverage({ coverage: st.coverage }, false);
        var vals = [st.coverage.businessEmail, st.coverage.mobilePhone, st.coverage.linkedinPresent, st.coverage.uniqueCompanies];
        var ns = cov.querySelectorAll('.stat .n');
        for (var k = 0; k < ns.length && k < vals.length; k++) ns[k].textContent = vals[k] == null ? '\u2014' : Number(vals[k]).toLocaleString();
      }
      this._paintStageCharts(idx);
    },
    _paintedMetaKey: -1,
    // Scale an age/gender split to a target reach (keeps the real per-stage SHAPE, makes the
    // absolute counts consistent with the stage's reach). Falls back to the snapshot's final
    // split if a stage has no baked ageGender.
    _snapAgeGender: function () {
      try { return canned && canned.responses && canned.responses.geoPoll && canned.responses.geoPoll.body && canned.responses.geoPoll.body.agg && canned.responses.geoPoll.body.agg.ageGender; }
      catch (e) { return null; }
    },
    _scaledAgeGender: function (base, reach) {
      if (!base) return null;
      var tot = 0, kk;
      for (kk in base) { if (base[kk]) tot += (base[kk].m || 0) + (base[kk].f || 0) + (base[kk].u || 0); }
      if (!tot) return null;
      var s = (reach || tot) / tot, out = {};
      for (kk in base) { if (base[kk]) out[kk] = { m: Math.round((base[kk].m || 0) * s), f: Math.round((base[kk].f || 0) * s), u: Math.round((base[kk].u || 0) * s) }; }
      return out;
    },
    // Paint the maprail's Top States AND the Age & Gender pyramid for a stage so both are LIVE
    // the entire story (not just at the final geo release) — Top states = the stage's baked
    // per-state counts; Age & Gender = the snapshot's real split scaled to the stage's reach,
    // rendered into its normal insights-grid slot (#card-age). (Intent Strength was dropped
    // per Shaw 2026-07-08.) Guarded by _paintedMetaKey so per-tick reasserts don't re-trigger
    // the bar-grow animation.
    _paintStageCharts: function (idx) {
      if (this._paintedMetaKey === idx) return;
      var st = this._stages && this._stages[idx];
      if (!st) return;
      try {
        if (typeof hbars === 'function') {
          // Mirror the live logic: applyStep already mutated S, so hasStateSel() reflects this
          // stage's filters. State selected → Top CITIES (this stage's baked cities); else Top
          // STATES. Keeps the maprail geo card the most relevant breakdown (Shaw 2026-07-08).
          var h = document.getElementById('topStatesH');
          var citiesPromoted = typeof hasStateSel === 'function' && hasStateSel() && st.cities && st.cities.length;
          if (citiesPromoted) {
            hbars('topStates', st.cities, { mode: 'count' });
            if (h) h.textContent = 'Top cities';
          } else {
            var ts = (st.states || []).map(function (s) { return [s.state, s.total]; }).sort(function (a, b) { return b[1] - a[1]; });
            hbars('topStates', ts, { mode: 'count', fmt: function (c) { return (typeof CODE2NAME !== 'undefined' && CODE2NAME[c]) || c; } });
            if (h) h.textContent = 'Top states';
          }
          // Hide the insights-grid Top Cities card during the story unless it's promoted-free AND
          // actually has data — else it sat below the map empty/loading, then vanished at the
          // reveal (the loading-then-disappear flash). Promoted (state selected) → maprail owns it,
          // hide the grid card. Nationwide (stage 0) → no grid cities data, so also hide (never a
          // blank card). Keep the cities-promoted reflow (seniority/dept → halves) in sync too.
          var citiesBars = document.getElementById('citiesBars');
          var citiesHasData = citiesBars && citiesBars.children.length > 0 && !citiesBars.querySelector('.pk-empty');
          if (typeof SHOW === 'function') SHOW('card-cities', !citiesPromoted && citiesHasData);
          var grid = document.getElementById('insightsGrid');
          if (grid) grid.classList.toggle('cities-promoted', !!citiesPromoted);
        }
        if (typeof renderPyramid === 'function') {
          // real per-stage age/gender shape (baked into the stage) scaled to its reach — so
          // the pyramid genuinely CHANGES per chapter (e.g. millionaires skew older + more
          // male), not just a re-scaled copy of one distribution. Snapshot is the fallback.
          var ag = this._scaledAgeGender(st.ageGender || this._snapAgeGender(), st.reach);
          if (ag) renderPyramid({ ageGender: ag }, false);
        }
        // Homeownership + Family Dynamics — real per-stage shapes so they update every chapter
        // like Age & Gender (Shaw 2026-07-09). Both render as % distributions, so raw baked
        // counts are fine (no reach-scaling needed). The homeowner donut visibly flips to 100%
        // owners at the homeowner beat; family mix shifts each stage.
        if (typeof renderHomeDonut === 'function' && st.homeowner) renderHomeDonut({ homeowner: st.homeowner }, false);
        if (typeof renderFamily === 'function' && st.family) renderFamily({ family: st.family }, false);
        // DESKTOP: Household Income + Net Worth are per-stage story charts too (mobile omits them
        // and reveals them via prewarm). Guarded on baked data presence, so mobile stages (no
        // income/networth keys) are unaffected. Net worth collapses to 100% >$1M at the final stage.
        if (st.income && typeof vbars === 'function' && typeof incRank === 'function') {
          var incEntries = Object.entries(st.income).filter(function (e) { return e[1] > 0; }).sort(function (a, b) { return incRank(a[0]) - incRank(b[0]); });
          if (typeof SHOW === 'function') SHOW('card-income', vbars('incomeBars', incEntries, { fmt: typeof incLabel === 'function' ? incLabel : undefined }));
        }
        if (st.networth && typeof vbars === 'function' && typeof nwRank === 'function') {
          var nwEntries = Object.entries(st.networth).filter(function (e) { return e[1] > 0; }).sort(function (a, b) { return nwRank(a[0]) - nwRank(b[0]); });
          if (typeof SHOW === 'function') SHOW('card-networth', vbars('networthBars', nwEntries, { fmt: typeof nwLabel === 'function' ? nwLabel : undefined }));
        }
        // DESKTOP: Intent Strength lives in the always-visible maprail, so it must narrate per beat
        // too. It's a mock proportional of reach (same split renderCharts uses: 25/45/30) — the
        // scripted story never picks a score filter, so drive it straight off the stage's reach.
        if (st.income && typeof vbars === 'function' && st.reach != null) {
          var _r = st.reach;
          var mockIntent = [['Low', Math.round(_r * 0.25)], ['Medium', Math.round(_r * 0.45)], ['High', Math.round(_r * 0.30)]];
          if (typeof SHOW === 'function') SHOW('card-intent', vbars('intentBars', mockIntent, {}));
        }
        // apply the insights grid order NOW (the story skips renderCharts) so Home/Family sit in
        // their row-1 slots beside Age from the start — not Household Income (Shaw 2026-07-09).
        if (typeof applyInsightsOrder === 'function') applyInsightsOrder();
        this._paintedMetaKey = idx;
      } catch (e) { /* charts not ready — reassert retries */ }
    },
    // ── Shaw's beat order v4 (2026-07-08): the map is the star of every beat ──
    //  b0 topic       → nationwide STATE choropleth (reach visible)
    //  b1 FL          → select FL + zoom to Florida + flip to County/ZIP view (one beat)
    //  b2 homeowners  → counties narrow
    //  b3 METROS      → Miami/FtLaud filters + map zooms to South-FL
    //  b4 millionaires→ narrows within South-FL + full density release (stays framed on SFL)
    BEAT_COUNT: 5,
    _stageOfBeat: function (k) { return k; }, // beat index == stage index (FL zoom + County/ZIP flip merged into b1)
    beatOn: function (k) {
      this._lastBeatT = performance.now();
      if (k === 0) { this._preSetReach(0); this.applyStep(0); this._setStageMeta(0); this._paintStage(0, false); }
      if (k === 1) {
        // combined: select FL + zoom to Florida + flip to County/ZIP view, one beat.
        // paint the FL STATE choropleth first so the zoom + the state→County/ZIP
        // cross-fade (flipToFull) both animate from a proper FL source, then land on counties.
        this._preSetReach(1); this.applyStep(1); this._setStageMeta(1); this._paintStage(1, false);
        try { if (window.fitMapToScope) window.fitMapToScope(this.FL_BBOX, 7); _lastScopeKey = 'FL|'; /* exact updateMapScope key for FL-only */ } catch (e) { /* noop */ }
        this._flipToFull(); this._paintStage(1, true);
      }
      if (k === 2) { this._preSetReach(2); this.applyStep(2); this._setStageMeta(2); this._paintStage(2, true); }
      if (k === 3) {
        this._preSetReach(3);
        _lastScopeKey = this._metroScopeKey(); // pin BEFORE applyStep's sync() so updateMapScope no-ops (only our SFL fit runs)
        this.applyStep(3); this._setStageMeta(3); this._paintStage(3, true);
        try { if (window.fitMapToScope) window.fitMapToScope(this.SFL_BBOX, 9, this.SFL_OFFSET); } catch (e) { /* noop */ }
      }
      if (k === 4) { this._preSetReach(4); this.applyStep(4); this._setStageMeta(4); this._paintStage(4, true); this.releaseGeo(); }
      this._stageIdx = k;
    },
    beatOff: function (k) {
      this._lastBeatT = performance.now();
      if (k === 4) { this._preSetReach(3); this.unapplyStep(4); this._setStageMeta(3); this._paintStage(3, true); }
      if (k === 3) {
        this._preSetReach(2); this.unapplyStep(3); this._setStageMeta(2); this._paintStage(2, true);
        try { if (window.fitMapToScope) window.fitMapToScope(this.FL_BBOX, 7); } catch (e) { /* noop */ }
      }
      if (k === 2) { this._preSetReach(1); this.unapplyStep(2); this._setStageMeta(1); this._paintStage(1, true); }
      if (k === 1) {
        // combined reverse: flip back to State view + deselect FL + zoom back out to US
        this._flipToState();
        this._preSetReach(0); this.unapplyStep(1); this._setStageMeta(0); this._paintStage(0, false);
        try { if (window.fitMapToScope) window.fitMapToScope(null); _lastScopeKey = ''; } catch (e) { /* noop */ }
      }
      if (k === 0) { this.unapplyStep(0); }
      this._stageIdx = k - 1;
    },

    // ── DESKTOP deal-story beats (Shaw 2026-07-10) ───────────────────────────
    // Additive: mobile beatOn/beatOff above are untouched. Desktop and mobile never co-exist
    // (device-viewport switch), and each iframe loads its OWN stages file, so this._stages is
    // independent per iframe — desktop loads stages-pool-desktop.json (4 stages). Beat index ==
    // stage index; STEP indices differ (b0 composes topic+homeowner). Set by the parent, which
    // also sets _desktopStory=true so generate() skips the (final-audience) chart prewarm.
    //  b0 homeowners+pool nationwide → US state choropleth
    //  b1 + Florida                  → zoom FL + flip to County/ZIP
    //  b2 + Miami/FtLaud metros      → zoom South-FL
    //  b3 + Net Worth $1M+           → narrows within SFL + full-density release
    _desktopStory: false,
    beatOnDesktop: function (k) {
      this._lastBeatT = performance.now();
      if (k === 0) {
        // hero: apply topic + homeowner together, one sync (the fly-in is a PARENT overlay on
        // desktop — not the mobile sentence renderer — so a double sync can't destroy it).
        this._preSetReach(0);
        this.STEPS[0].apply(); this.STEPS[2].apply();
        renderSidebar(); sync(); tagChips();
        this._setStageMeta(0); this._paintStage(0, false);
      }
      if (k === 1) {
        // + Florida: paint FL state choropleth, zoom to FL, then flip to County/ZIP.
        this._preSetReach(1); this.applyStep(1); this._setStageMeta(1); this._paintStage(1, false);
        try { if (window.fitMapToScope) window.fitMapToScope(this.FL_BBOX, 7); _lastScopeKey = 'FL|'; } catch (e) { /* noop */ }
        this._flipToFull(); this._paintStage(1, true);
      }
      if (k === 2) {
        // + metros: pin the exact updateMapScope key BEFORE sync so only our SFL fit runs.
        this._preSetReach(2);
        _lastScopeKey = this._metroScopeKey();
        this.applyStep(3); this._setStageMeta(2); this._paintStage(2, true);
        try { if (window.fitMapToScope) window.fitMapToScope(this.SFL_BBOX, 9, this.SFL_OFFSET); } catch (e) { /* noop */ }
      }
      if (k === 3) {
        // + net worth $1M+: narrows within SFL, release the held real geoPoll density.
        this._preSetReach(3); this.applyStep(4); this._setStageMeta(3); this._paintStage(3, true); this.releaseGeo();
      }
      this._stageIdx = k;
    },
    beatOffDesktop: function (k) {
      this._lastBeatT = performance.now();
      // reversing must fully repaint from BAKED stage data — after the final-stage release the real
      // geoPoll's final-audience coverage/charts can bleed into earlier stages. Clear the paint
      // caches so _setStageMeta/_paintStage repaint fresh on the way back up.
      this._paintedMetaKey = -1; this._paintedKey = '';
      if (k === 3) {
        // un-release: earlier stages own the data again (reassert re-enables; a lingering final poll
        // can no longer stomp them). Re-descending to b3 re-runs releaseGeo for the density money-shot.
        this._geoReleased = false; window._geoData = null; window._geoPullDone = false;
        try { document.body.classList.add('ark-funnel-hold'); } catch (e) { /* noop */ }
        this._preSetReach(2); this.unapplyStep(4); this._setStageMeta(2); this._paintStage(2, true);
      }
      if (k === 2) {
        this._preSetReach(1); this.unapplyStep(3); this._setStageMeta(1); this._paintStage(1, true);
        try { if (window.fitMapToScope) window.fitMapToScope(this.FL_BBOX, 7); } catch (e) { /* noop */ }
      }
      if (k === 1) {
        this._flipToState();
        this._preSetReach(0); this.unapplyStep(1); this._setStageMeta(0); this._paintStage(0, false);
        try { if (window.fitMapToScope) window.fitMapToScope(null); _lastScopeKey = ''; } catch (e) { /* noop */ }
      }
      if (k === 0) {
        this.STEPS[2].unapply(); this.STEPS[0].unapply();
        renderSidebar(); sync(); tagChips();
      }
      this._stageIdx = k - 1;
    },
    // per-tick cheap re-asserts (late canned poll stomps reach / nulls geo)
    reassert: function () {
      if (this._stageIdx < 0 || this._geoReleased) return;
      var si = Math.min(this._stageOfBeat(this._stageIdx), 4);
      this._setStageMeta(si);
      if (!window._geoData) { this._paintedKey = ''; this._paintStage(si, this._stageIdx >= 1); } // County/ZIP view from b1 (FL+flip merged)
      // keep the per-stage charts alive if a stray render (generate/poll) blanked any of them
      // mid-story. Check Top States, Age pyramid, Homeownership donut AND Family donut — a clear
      // that hits one must repaint all (they're painted together in _paintStageCharts), else one
      // goes stale while the others update ("age doesn't update", Shaw 2026-07-08 / -07-09).
      var tsEl = document.getElementById('topStates');
      var agEl = document.getElementById('agePyramid');
      var hoEl = document.getElementById('homeownerBars');
      var faEl = document.getElementById('familyDonut');
      var tsBlank = tsEl && (tsEl.querySelector('.pk-empty') || !tsEl.children.length);
      var agBlank = agEl && (agEl.querySelector('.pk-empty') || !agEl.querySelector('.pyrow'));
      var hoBlank = hoEl && (hoEl.querySelector('.pk-empty') || !hoEl.querySelector('svg'));
      var faBlank = faEl && (faEl.querySelector('.pk-empty') || !faEl.querySelector('svg'));
      // Intent Strength (desktop maprail) — blank if the loading placeholder is still there or no bars.
      var inEl = document.getElementById('intentBars');
      var inBlank = inEl && (inEl.querySelector('.pk-empty') || !inEl.querySelector('.vb'));
      if (tsBlank || agBlank || hoBlank || faBlank || inBlank) { this._paintedMetaKey = -1; this._paintStageCharts(si); }
    },
    releaseGeo: function () {
      // final stage: let the held canned geoPoll resolve → full FL density,
      // county/ZIP flip + FL fit handled by the poll below.
      if (this._geoReleased) return;
      this._geoReleased = true;
      // keep the loading-overlay suppressor until the pull actually lands —
      // removing it at release start let the poll loop flash "Building full
      // density..." for one cycle (Shaw, 2026-07-08)
      var unhide = setInterval(function () {
        if (window._geoPullDone) { document.body.classList.remove('ark-funnel-hold'); clearInterval(unhide); }
      }, 200);
      setTimeout(function () { clearInterval(unhide); document.body.classList.remove('ark-funnel-hold'); }, 15000);
      // the final audience is South-FL (metros + millionaires), so frame SFL —
      // NOT all of Florida — when the live density lands. captured out here since
      // `this` is unavailable inside the interval closure.
      var SFL_BBOX = this.SFL_BBOX, sflScopeKey = this._metroScopeKey(), sflOffset = this.SFL_OFFSET;
      var tries = 0; var didFit = false, didFull = false;
      var iv = setInterval(function () {
        tries++;
        var m = window._fullMap;
        if (!didFit && m && (!m.loaded || m.loaded()) && window._geoPullDone) {
          try { if (window.fitMapToScope) { window.fitMapToScope(SFL_BBOX, 9, sflOffset); didFit = true; } _lastScopeKey = sflScopeKey; /* exact updateMapScope key for FL + the 2 metros — later live syncs no-op (avoids the SE-corner→all-FL bounce) */ } catch (e) { /* retry */ }
        }
        if (!didFull && window._geoPullDone) {
          var full = document.querySelector('#mapMode input[value="full"]');
          if (full && !full.checked) { full.checked = true; full.dispatchEvent(new Event('change')); }
          didFull = true;
        }
        if ((didFit && didFull) || tries > 80) clearInterval(iv);
      }, 400);
    },

    generate: function () {
      if (!canned) return false;
      armCanned();
      var rn = document.getElementById('reachNum');
      if (rn) rn.classList.remove('ark-hidden');
      var btn = document.getElementById('generateBtn');
      if (!btn) return false;
      btn.click();
      // Pre-warm the static below-the-fold insight charts from the baked snapshot agg now, so
      // they're already rendered (just hidden by opacity) before the visitor scrolls past the
      // story — no "Calculating…" flash then load (Shaw 2026-07-09). Retry until the chart
      // helpers + snapshot are ready; guarded to run once.
      var self = this;
      // DESKTOP: income/net worth are painted PER-STAGE by _paintStageCharts, so prewarming them
      // from the FINAL snapshot agg here would stomp the beat-0 stage values. Skip on desktop.
      if (!self._prewarmed && !self._desktopStory) {
        var pw = setInterval(function () {
          var agg = null;
          try { agg = canned && canned.responses && canned.responses.geoPoll && canned.responses.geoPoll.body && canned.responses.geoPoll.body.agg; } catch (e) {}
          if (agg && typeof window.prewarmInsightCharts === 'function') {
            window.prewarmInsightCharts(agg); self._prewarmed = true; clearInterval(pw);
          }
        }, 120);
        setTimeout(function () { clearInterval(pw); }, 8000);
      }
      // applyAll() ran before the map existed, so its geo fit was silently
      // dropped (fitMapToScope guards !map||!ready) and _lastScopeKey now
      // blocks a retry. Once the map is live, clear the cache and re-fit so
      // the view frames the scripted geo (FL).
      // Funnel mode (holdGeo): releaseGeo() owns the FL fit + mode flip at the
      // FINAL stage — fitting here caused the premature FL zoom Shaw saw
      // (fit-on-map-load → nationwide stage pulled it back → FL again).
      if (!this.holdGeo) {
        var tries = 0;
        var didFit = false, didFull = false;
        var iv = setInterval(function () {
          tries++;
          var m = window._fullMap;
          if (!didFit && m && (!m.loaded || m.loaded())) {
            var FL_BBOX = [-87.633, 25.121, -80.031, 31.003]; // from us-states.js geometry (no ZIP_LOOKUP needed on mobile)
            try {
              if (window.fitMapToScope) { window.fitMapToScope(FL_BBOX, 7); didFit = true; }
              _lastScopeKey = 'FL|'; /* exact updateMapScope key for FL-only — later syncs no-op (sentinel key caused US-view bounce) */
            } catch (e) { /* retry next tick */ }
          }
          if (!didFull && window._geoPullDone) {
            var full = document.querySelector('#mapMode input[value="full"]');
            if (full && !full.checked) { full.checked = true; full.dispatchEvent(new Event('change')); }
            didFull = true;
          }
          if ((didFit && didFull) || tries > 60) clearInterval(iv);
        }, 500);
      }
      return true;
    },

    // x: 0..1 — staggered fade of map first, then cards
    setDataReveal: function (x) {
      if (x >= 1) { document.body.classList.remove('ark-data-hidden'); return; }
      document.body.classList.add('ark-data-hidden');
      var map = document.querySelector('#previewArea #map');
      if (map) map.style.opacity = '1'; // funnel: map visible from stage 1
      var full = document.body.classList.contains('ark-fullheight');
      var cards = document.querySelectorAll('#previewArea .card');
      var n = cards.length || 1;
      cards.forEach(function (el, i) {
        // full-height mobile demo: the maprail chart (Coverage/Top states) AND Age & Gender +
        // Homeownership + Family Dynamics are the live narration — leave them to CSS (opacity:1
        // the whole story). Clearing the inline opacity is required because inline style wins
        // over the reveal stylesheet.
        if (full && (el.closest('.maprail') || el.id === 'card-age' || el.id === 'card-home' || el.id === 'card-family')) { el.style.opacity = ''; return; }
        var start = 0.15 + (i / n) * 0.7;
        var o = Math.min(1, Math.max(0, (x - start) / 0.18));
        el.style.opacity = String(o);
      });
    },

    generated: function () { return !!window._gotMap; },
  };
})();
