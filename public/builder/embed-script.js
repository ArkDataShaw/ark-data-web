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
    _setStageMeta: function (idx) {
      var st = this._stages && this._stages[idx];
      if (!st) return;
      try { if (window._reach !== st.reach) { setReach(st.reach); if (window.renderSentence) renderSentence(); } } catch (e) { /* noop */ }
      var cov = document.getElementById('coverageStats');
      if (cov) {
        var vals = [st.coverage.businessEmail, st.coverage.mobilePhone, st.coverage.linkedinPresent, st.coverage.uniqueCompanies];
        var ns = cov.querySelectorAll('.stat .n');
        for (var k = 0; k < ns.length && k < vals.length; k++) ns[k].textContent = vals[k] == null ? '\u2014' : Number(vals[k]).toLocaleString();
      }
    },
    // ── Shaw's beat order (2026-07-07): the map is the star of beats 0-2 ──
    //  b0 topic  → nationwide STATE choropleth (reach visible)
    //  b1 FL     → map auto-zooms Florida (still state view)
    //  b2 flip   → County/ZIP mode (no filter change, same FL stage)
    //  b3 homeowners  → counties narrow
    //  b4 millionaires → counties narrow to 48 + full density release
    BEAT_COUNT: 5,
    beatOn: function (k) {
      var self = this;
      if (k === 0) { this.applyStep(0); this._setStageMeta(0); this._paintStage(0, false); }
      if (k === 1) {
        this.applyStep(1); this._setStageMeta(1); this._paintStage(1, false);
        try { if (window.fitMapToScope) window.fitMapToScope(this.FL_BBOX, 7); _lastScopeKey = 'embed:FL'; } catch (e) { /* noop */ }
      }
      if (k === 2) { this._flipToFull(); this._paintStage(1, true); this._setStageMeta(1); }
      if (k === 3) { this.applyStep(2); this._setStageMeta(2); this._paintStage(2, true); }
      if (k === 4) { this.applyStep(3); this._setStageMeta(3); this._paintStage(3, true); this.releaseGeo(); }
      this._stageIdx = k;
    },
    beatOff: function (k) {
      if (k === 4) { this.unapplyStep(3); this._setStageMeta(2); this._paintStage(2, true); }
      if (k === 3) { this.unapplyStep(2); this._setStageMeta(1); this._paintStage(1, true); }
      if (k === 2) { this._flipToState(); this._paintStage(1, false); }
      if (k === 1) {
        this.unapplyStep(1); this._setStageMeta(0); this._paintStage(0, false);
        try { if (window.fitMapToScope) window.fitMapToScope(null); _lastScopeKey = ''; } catch (e) { /* noop */ }
      }
      if (k === 0) { this.unapplyStep(0); }
      this._stageIdx = k - 1;
    },
    // per-tick cheap re-asserts (late canned poll stomps reach / nulls geo)
    reassert: function () {
      if (this._stageIdx < 0 || this._geoReleased) return;
      var stageIdx = this._stageIdx >= 2 ? this._stageIdx - 1 : this._stageIdx; // beats 2+ share stage idx-1
      this._setStageMeta(Math.min(stageIdx, 3));
      if (!window._geoData) { this._paintedKey = ''; this._paintStage(Math.min(stageIdx, 3), this._stageIdx >= 2); }
    },
    releaseGeo: function () {
      // final stage: let the held canned geoPoll resolve → full FL density,
      // county/ZIP flip + FL fit handled by the poll below.
      if (this._geoReleased) return;
      this._geoReleased = true;
      document.body.classList.remove('ark-funnel-hold');
      var tries = 0; var didFit = false, didFull = false;
      var iv = setInterval(function () {
        tries++;
        var m = window._fullMap;
        if (!didFit && m && (!m.loaded || m.loaded()) && window._geoPullDone) {
          var FL_BBOX = [-87.633, 25.121, -80.031, 31.003];
          try { if (window.fitMapToScope) { window.fitMapToScope(FL_BBOX, 7); didFit = true; } _lastScopeKey = 'embed:FL'; } catch (e) { /* retry */ }
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
              _lastScopeKey = 'embed:FL';
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
      var cards = document.querySelectorAll('#previewArea .card');
      var n = cards.length || 1;
      cards.forEach(function (el, i) {
        var start = 0.15 + (i / n) * 0.7;
        var o = Math.min(1, Math.max(0, (x - start) / 0.18));
        el.style.opacity = String(o);
      });
    },

    generated: function () { return !!window._gotMap; },
  };
})();
