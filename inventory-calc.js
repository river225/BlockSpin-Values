/**
 * Inventory Calculator section (/inventory/).
 * Pick the items you own from the value lists; totals the Average Value of your tradeable
 * inventory, and (optional) your networth from every item's Networth Value plus cash.
 * Rendered through window.BSV_CUSTOM_SECTION_RENDERERS (script.js). Picks are kept in this
 * browser only (localStorage).
 */
(function () {
  "use strict";
  var TITLE = "Inventory Calculator";
  var STORE = "bsv-inventory-v1";
  var TRADEABLE = ["Common / Uncommon", "Rare", "Epic", "Legendary", "Omega", "Gamepass / Misc"];
  var NETWORTH_ONLY = ["Vehicles", "Untradeable Items"];
  var TAB_LABEL = { "Common / Uncommon": "Common / Uncommon", "Gamepass / Misc": "Gamepass / Misc", "Untradeable Items": "Untradeable" };

  var state = { qty: {}, cash: "", networth: false, tab: "all", q: "" };
  var items = [];      // { key, name, section, img, avg, nw, avgText }
  var byKey = {};
  var root = null;

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE) || "{}");
      if (s && typeof s === "object") {
        state.qty = s.qty && typeof s.qty === "object" ? s.qty : {};
        state.cash = s.cash ? String(s.cash) : "";
        state.networth = !!s.networth;
      }
    } catch (_) {}
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify({ qty: state.qty, cash: state.cash, networth: state.networth })); } catch (_) {}
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return "$" + Math.round(n || 0).toLocaleString("en-US"); }
  function num(v) {
    if (typeof window.parseValue === "function") { var n = window.parseValue(v); return isFinite(n) ? n : 0; }
    return parseFloat(String(v || "").replace(/[^0-9.]/g, "")) || 0;
  }
  function networthOf(it) {
    var raw = typeof window.getInternalValueFromItem === "function" ? window.getInternalValueFromItem(it) : it["Internal Value"];
    var n = typeof window.parseInternalValue === "function" ? window.parseInternalValue(String(raw == null ? "" : raw)) : num(raw);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function slug(name) {
    return typeof window.bsvSlugifyItemName === "function" ? window.bsvSlugifyItemName(name)
      : String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function sectionLabel(sec) {
    return TAB_LABEL[sec] || (typeof window.i18nSection === "function" ? window.i18nSection(sec) : sec);
  }

  function collect(results) {
    items = []; byKey = {};
    (results || []).forEach(function (r) {
      if (TRADEABLE.indexOf(r.section) < 0 && NETWORTH_ONLY.indexOf(r.section) < 0) return;
      (r.items || []).forEach(function (it) {
        var name = String(it["Name"] || "").trim();
        if (!name) return;
        var key = slug(r.section) + "/" + slug(name);
        if (byKey[key]) return;
        var avgText = String(it["Average Value"] || "").trim();
        var rec = {
          key: key, name: name, section: r.section,
          tradeable: TRADEABLE.indexOf(r.section) > -1,
          img: String(it["Image URL"] || "").trim(),
          avg: num(avgText), avgText: avgText, nw: networthOf(it)
        };
        items.push(rec); byKey[key] = rec;
      });
    });
    // Forget picks for items that no longer exist.
    Object.keys(state.qty).forEach(function (k) { if (!byKey[k] || !(state.qty[k] > 0)) delete state.qty[k]; });
  }

  function totals() {
    var t = { value: 0, count: 0, nwItems: 0, kinds: 0 };
    Object.keys(state.qty).forEach(function (k) {
      var it = byKey[k], q = state.qty[k];
      if (!it || !(q > 0)) return;
      if (it.tradeable) { t.value += it.avg * q; t.count += q; t.kinds++; }
      t.nwItems += it.nw * q;
    });
    t.cash = num(state.cash);
    t.networth = t.nwItems + t.cash;
    return t;
  }

  /* ---------- markup ---------- */
  function shell() {
    return (
      '<section class="section inv" id="inventory">' +
        '<header class="inv-hero">' +
          '<span class="inv-hero__icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2"/></svg>' +
          '</span>' +
          '<div>' +
            '<h2 class="inv-hero__title">Inventory Calculator</h2>' +
            '<p class="inv-hero__text">Add all the guns and items you own in BlockSpin to work out the total value of your <strong class="inv-em">tradeable inventory</strong>. Totals use each item\'s Average Value.</p>' +
          '</div>' +
        '</header>' +
        '<div class="inv-layout">' +
          '<aside class="inv-side">' +
            '<div class="inv-total" aria-live="polite">' +
              '<p class="inv-total__label">Tradeable inventory value</p>' +
              '<p class="inv-total__value" data-inv="value">$0</p>' +
              '<p class="inv-total__meta" data-inv="meta">No items added yet</p>' +
              '<button type="button" class="inv-nw-link" data-inv-act="networth" aria-expanded="false">Click here to see your BlockSpin networth</button>' +
              '<div class="inv-nw" data-inv="nw" hidden>' +
                '<label class="inv-nw__row"><span>Cash &amp; bank</span><input type="text" inputmode="numeric" class="inv-input" data-inv="cash" placeholder="e.g. 250k" autocomplete="off"></label>' +
                '<p class="inv-nw__row"><span>Items (Networth Value)</span><b data-inv="nwitems">$0</b></p>' +
                '<p class="inv-nw__total"><span>BlockSpin networth</span><b data-inv="networth">$0</b></p>' +
                '<p class="inv-nw__note">Counts everything you own, including vehicles and untradeable items (their tabs are now in the picker), plus your cash.</p>' +
              '</div>' +
            '</div>' +
            '<details class="inv-mine"' + (window.innerWidth > 900 ? " open" : "") + '>' +
              '<summary><span>Your items</span><span class="inv-mine__count" data-inv="kinds">0</span></summary>' +
              '<ul class="inv-mine__list" data-inv="list"></ul>' +
              '<button type="button" class="inv-clear" data-inv-act="clear" hidden>Clear all</button>' +
            '</details>' +
          '</aside>' +
          '<div class="inv-picker">' +
            '<div class="inv-minibar" aria-hidden="true"><span>Tradeable inventory</span><b data-inv="mini">$0</b></div>' +
            '<div class="inv-tabs" role="tablist" data-inv="tabs"></div>' +
            '<input type="search" class="inv-input inv-search" data-inv="search" placeholder="Search items to add…" aria-label="Search items" autocomplete="off">' +
            '<div class="inv-grid" data-inv="grid"></div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function tabsHtml() {
    var list = ["all"].concat(TRADEABLE, state.networth ? NETWORTH_ONLY : []);
    if (list.indexOf(state.tab) < 0) state.tab = "all";
    return list.map(function (t) {
      var on = t === state.tab;
      return '<button type="button" role="tab" class="inv-tab' + (NETWORTH_ONLY.indexOf(t) > -1 ? " inv-tab--nw" : "") + (on ? " is-on" : "") +
        '" aria-selected="' + on + '" data-inv-tab="' + esc(t) + '">' + esc(t === "all" ? "All" : sectionLabel(t)) + "</button>";
    }).join("");
  }

  function imgHtml(it, cls) {
    return it.img
      ? '<img class="' + cls + '" src="' + esc(it.img) + '" alt="" width="56" height="56" loading="lazy" decoding="async" onerror="this.style.visibility=\'hidden\'">'
      : '<span class="' + cls + ' inv-img--blank" aria-hidden="true">' + esc(it.name.charAt(0)) + "</span>";
  }

  function stepper(it) {
    var q = state.qty[it.key] || 0;
    if (!q) return '<button type="button" class="inv-add" data-inv-add="' + esc(it.key) + '" aria-label="Add ' + esc(it.name) + '">+ Add</button>';
    return '<span class="inv-step">' +
      '<button type="button" data-inv-dec="' + esc(it.key) + '" aria-label="One less ' + esc(it.name) + '">−</button>' +
      '<input type="number" min="0" max="999" value="' + q + '" data-inv-qty="' + esc(it.key) + '" aria-label="How many ' + esc(it.name) + '">' +
      '<button type="button" data-inv-add="' + esc(it.key) + '" aria-label="One more ' + esc(it.name) + '">+</button>' +
    "</span>";
  }

  function gridHtml() {
    var q = state.q.trim().toLowerCase();
    var shown = items.filter(function (it) {
      if (!it.tradeable && !state.networth) return false;
      if (state.tab !== "all" && it.section !== state.tab) return false;
      return !q || it.name.toLowerCase().indexOf(q) > -1;
    });
    if (!items.length) return '<p class="inv-empty">Values are still loading…</p>';
    if (!shown.length) return '<p class="inv-empty">No items match “' + esc(state.q) + '”.</p>';
    return shown.map(function (it) {
      var val = it.tradeable ? (it.avg ? money(it.avg) : esc(it.avgText || "N/A")) : (it.nw ? money(it.nw) + " NW" : "N/A");
      return '<div class="inv-tile' + (state.qty[it.key] ? " is-picked" : "") + '" data-inv-tile="' + esc(it.key) + '">' +
        imgHtml(it, "inv-tile__img") +
        '<p class="inv-tile__name">' + esc(it.name) + "</p>" +
        '<p class="inv-tile__sec">' + esc(sectionLabel(it.section)) + "</p>" +
        '<p class="inv-tile__val' + (it.tradeable ? "" : " inv-tile__val--nw") + '">' + val + "</p>" +
        '<div class="inv-tile__act">' + stepper(it) + "</div>" +
      "</div>";
    }).join("");
  }

  function listHtml() {
    var keys = Object.keys(state.qty).filter(function (k) { return byKey[k] && state.qty[k] > 0 && (byKey[k].tradeable || state.networth); });
    if (!keys.length) return '<li class="inv-mine__empty">Tap <b>+ Add</b> on any item to start.</li>';
    keys.sort(function (a, b) { var A = byKey[a], B = byKey[b]; return (B.tradeable ? B.avg : B.nw) * state.qty[b] - (A.tradeable ? A.avg : A.nw) * state.qty[a]; });
    return keys.map(function (k) {
      var it = byKey[k], q = state.qty[k];
      return '<li class="inv-mine__item">' + imgHtml(it, "inv-mine__img") +
        '<span class="inv-mine__name">' + esc(it.name) + (q > 1 ? ' <em>×' + q + "</em>" : "") +
          (it.tradeable ? "" : ' <small>networth only</small>') + "</span>" +
        '<b class="inv-mine__val">' + money((it.tradeable ? it.avg : it.nw) * q) + "</b>" +
        '<button type="button" class="inv-mine__x" data-inv-del="' + esc(k) + '" aria-label="Remove ' + esc(it.name) + '">×</button>' +
      "</li>";
    }).join("");
  }

  function $(sel) { return root.querySelector('[data-inv="' + sel + '"]'); }

  function paintTotals() {
    var t = totals();
    $("value").textContent = money(t.value);
    $("mini").textContent = money(t.value) + (t.count ? " · " + t.count + (t.count === 1 ? " item" : " items") : "");
    $("meta").textContent = t.count ? t.count + (t.count === 1 ? " item" : " items") + " · " + t.kinds + (t.kinds === 1 ? " kind" : " kinds") : "No items added yet";
    $("nwitems").textContent = money(t.nwItems);
    $("networth").textContent = money(t.networth);
    var kinds = Object.keys(state.qty).filter(function (k) { return byKey[k] && (byKey[k].tradeable || state.networth); }).length;
    $("kinds").textContent = kinds;
    $("list").innerHTML = listHtml();
    root.querySelector('[data-inv-act="clear"]').hidden = !kinds;
  }
  function paintGrid() { $("grid").innerHTML = gridHtml(); }
  function paintNw() {
    var btn = root.querySelector('[data-inv-act="networth"]');
    btn.setAttribute("aria-expanded", String(state.networth));
    btn.textContent = state.networth ? "Hide my BlockSpin networth" : "Click here to see your BlockSpin networth";
    $("nw").hidden = !state.networth;
    $("tabs").innerHTML = tabsHtml();
  }
  function paintAll() { paintNw(); paintGrid(); paintTotals(); }

  function setQty(key, q) {
    q = Math.max(0, Math.min(999, Math.floor(q) || 0));
    if (q) state.qty[key] = q; else delete state.qty[key];
    save();
    var tile = root.querySelector('[data-inv-tile="' + (window.CSS && CSS.escape ? CSS.escape(key) : key) + '"]');
    if (tile && byKey[key]) {
      tile.classList.toggle("is-picked", q > 0);
      tile.querySelector(".inv-tile__act").innerHTML = stepper(byKey[key]);
    }
    paintTotals();
  }

  function wire() {
    root.addEventListener("click", function (e) {
      var t = e.target.closest("button");
      if (!t || !root.contains(t)) return;
      var k;
      if ((k = t.getAttribute("data-inv-add"))) setQty(k, (state.qty[k] || 0) + 1);
      else if ((k = t.getAttribute("data-inv-dec"))) setQty(k, (state.qty[k] || 0) - 1);
      else if ((k = t.getAttribute("data-inv-del"))) setQty(k, 0);
      else if ((k = t.getAttribute("data-inv-tab"))) { state.tab = k; $("tabs").innerHTML = tabsHtml(); paintGrid(); }
      else if (t.getAttribute("data-inv-act") === "networth") { state.networth = !state.networth; save(); paintAll(); }
      else if (t.getAttribute("data-inv-act") === "clear") {
        Object.keys(state.qty).forEach(function (key) { if (byKey[key] && (byKey[key].tradeable || state.networth)) delete state.qty[key]; });
        save(); paintGrid(); paintTotals();
      }
    });
    root.addEventListener("change", function (e) {
      var k = e.target.getAttribute && e.target.getAttribute("data-inv-qty");
      if (k) setQty(k, parseInt(e.target.value, 10));
    });
    var timer = 0;
    root.addEventListener("input", function (e) {
      if (e.target === $("search")) {
        state.q = e.target.value;
        clearTimeout(timer);
        timer = setTimeout(paintGrid, 120);
      } else if (e.target === $("cash")) {
        state.cash = e.target.value; save(); paintTotals();
      }
    });
  }

  function render(ctx) {
    load();
    collect(ctx && ctx.results);
    ctx.container.insertAdjacentHTML("beforeend", shell());
    root = document.getElementById("inventory");
    $("cash").value = state.cash;
    wire();
    paintAll();
  }

  window.BSV_CUSTOM_SECTION_RENDERERS = window.BSV_CUSTOM_SECTION_RENDERERS || {};
  window.BSV_CUSTOM_SECTION_RENDERERS[TITLE] = render;

  // The button inside the phone tax pop-up also closes the pop-up.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".inv-calc-btn--mobile");
    if (!a) return;
    var close = document.getElementById("mobile-calc-close");
    if (close) close.click();
  });
})();
