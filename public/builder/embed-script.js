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
    'body.ark-data-hidden #previewArea #map{opacity:0}',
    '#previewArea .card, #previewArea #map{transition:opacity .55s ease}',
    '#reachNum.ark-hidden{visibility:hidden}',
    '#saveBtn{display:none}', // no Save in the scripted homepage embed
    '#audname{display:none}', // no name input in the demo (Shaw 2026-07-07)
    '#viewSeg{display:none}', // no 500-row preview in the embed — Map & insights only
    // chips stay inline with the reach number — never wrap to their own row
    '.strip.wrapchips .stripchips{flex:1;margin-top:0}',
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
      { id: 'topic', apply: function () { S.topics.add('FIFA World Cup'); S.topicMeta['FIFA World Cup'] = { id: 6099, kind: 'b2c' }; }, unapply: function () { S.topics.clear(); S.topicMeta = {}; } },
      { id: 'homeowner', apply: function () { S.checks.homeowner = new Set(['Homeowner']); }, unapply: function () { delete S.checks.homeowner; } },
      { id: 'networth', apply: function () { S.checks.networth = new Set(['more than $1,000,000']); }, unapply: function () { delete S.checks.networth; } },
      { id: 'geo', apply: function () { S.loc.personal.state.add('FL'); }, unapply: function () { S.loc.personal.state.clear(); } },
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
      var tries = 0;
      var didFit = false, didFull = false;
      var iv = setInterval(function () {
        tries++;
        var m = window._fullMap;
        if (!didFit && m && (!m.loaded || m.loaded())) {
          // applyAll() ran pre-map, so its geo fit was dropped and the scope
          // cache blocks retries — clear + re-fit once the map is live (FL).
          try { _lastScopeKey = ''; updateMapScope(); didFit = true; } catch (e) { /* noop */ }
        }
        // once full density has landed, auto-select County/ZIP (Shaw 2026-07-07)
        if (!didFull && window._geoPullDone) {
          var full = document.querySelector('#mapMode input[value="full"]');
          if (full && !full.checked) { full.checked = true; full.dispatchEvent(new Event('change')); }
          didFull = true;
        }
        if ((didFit && didFull) || tries > 60) clearInterval(iv); // ~30s cap
      }, 500);
      return true;
    },

    // x: 0..1 — staggered fade of map first, then cards
    setDataReveal: function (x) {
      if (x >= 1) { document.body.classList.remove('ark-data-hidden'); return; }
      document.body.classList.add('ark-data-hidden');
      var map = document.querySelector('#previewArea #map');
      if (map) map.style.opacity = String(Math.min(1, x * 2.2));
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
