/**
 * Inventory Calculator section (/inventory/).
 * Add the items you own (each copy can have its own durability, which changes its value the same
 * way the item cards do). Totals Average Value for the tradeable inventory; the networth view adds
 * every item's Networth Value plus cash. Rendered via window.BSV_CUSTOM_SECTION_RENDERERS.
 * Kept in this browser only (localStorage).
 */
(function () {
  "use strict";
  var TITLE = "Inventory Calculator";
  var STORE = "bsv-inventory-v2";
  var TRADEABLE = ["Common / Uncommon", "Rare", "Epic", "Legendary", "Omega", "Gamepass / Misc", "Vehicles"];
  var NETWORTH_ONLY = ["Untradeable Items"];
  var SHORT = { "Common / Uncommon": "Common", "Gamepass / Misc": "Gamepass", "Untradeable Items": "Untradeable" };

  var state = { entries: [], cash: "", networth: false, tab: "all", q: "" };
  var items = [], byKey = {}, root = null, nextId = 1;

  /* ---------- storage ---------- */
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE) || "{}") || {};
      state.entries = Array.isArray(s.entries) ? s.entries : [];
      state.cash = s.cash ? String(s.cash) : "";
      state.networth = !!s.networth;
    } catch (_) {}
    state.entries.forEach(function (e) { nextId = Math.max(nextId, (e.id || 0) + 1); });
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify({ entries: state.entries, cash: state.cash, networth: state.networth })); } catch (_) {}
  }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return "$" + Math.round(n || 0).toLocaleString("en-US"); }
  function num(v) {
    var n = typeof window.parseValue === "function" ? window.parseValue(v) : parseFloat(String(v || "").replace(/[^0-9.]/g, ""));
    return isFinite(n) && n > 0 ? n : 0;
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
  function label(sec) { return SHORT[sec] || sec; }
  // Same rule as the item cards (script.js calculateDurabilityValue): 20% floor + 80% by durability.
  function durMult(it, dur) {
    if (!it.maxDur) return 1;
    var d = Math.max(0, Math.min(it.maxDur, dur == null ? it.maxDur : dur));
    return 0.2 + 0.8 * (d / it.maxDur);
  }
  function entryValue(e) {
    var it = byKey[e.key];
    if (!it) return 0;
    return (it.tradeable ? it.avg * durMult(it, e.dur) : it.nw) * e.qty;
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
        var d = String(it["Durability"] || "");
        var hidden = /^(yes|true|1|ticked|checked|on|y)$/i.test(String(it["Durability Invisible"] || "").trim());
        var maxDur = d.indexOf("/") > -1 && !hidden ? parseInt(d.split("/")[1], 10) || 0 : 0;
        var rec = {
          key: key, name: name, section: r.section, tradeable: TRADEABLE.indexOf(r.section) > -1,
          img: String(it["Image URL"] || "").trim(), avgText: String(it["Average Value"] || "").trim(),
          avg: num(it["Average Value"]), nw: networthOf(it), maxDur: maxDur
        };
        items.push(rec); byKey[key] = rec;
      });
    });
    state.entries = state.entries.filter(function (e) { return byKey[e.key] && e.qty > 0; });
  }

  function visibleEntries() {
    return state.entries.filter(function (e) { return byKey[e.key] && (byKey[e.key].tradeable || state.networth); });
  }
  function totals() {
    var t = { value: 0, count: 0, nwItems: 0 };
    state.entries.forEach(function (e) {
      var it = byKey[e.key];
      if (!it) return;
      if (it.tradeable) { t.value += entryValue(e); t.count += e.qty; }
      t.nwItems += it.nw * e.qty;
    });
    t.cash = num(state.cash);
    t.networth = t.nwItems + t.cash;
    return t;
  }

  /* ---------- markup ---------- */
  function shell() {
    return (
      '<section class="section inv" id="inventory">' +
        '<h2>Inventory Calculator</h2>' +
        '<p class="inv-intro">Add every gun and item you own in BlockSpin to get the total value of your ' +
          '<strong class="inv-em">tradeable inventory</strong>. Set each item\'s durability, as damaged items are worth less. ' +
          '<button type="button" class="inv-nw-link" data-inv-act="networth" aria-expanded="false">See your BlockSpin networth</button></p>' +
        '<div class="inv-summary">' +
          '<div class="inv-sum"><span class="inv-sum__label">Tradeable inventory</span><b class="inv-sum__value" data-inv="value">$0</b><span class="inv-sum__meta" data-inv="meta">No items yet</span></div>' +
          '<div class="inv-sum inv-sum--nw" data-inv="nw" hidden>' +
            '<span class="inv-sum__label">BlockSpin networth</span><b class="inv-sum__value" data-inv="networth">$0</b>' +
            '<label class="inv-sum__cash">+ cash <input type="text" inputmode="numeric" class="inv-input" data-inv="cash" placeholder="0" autocomplete="off" aria-label="Cash and bank"></label>' +
          '</div>' +
        '</div>' +
        '<div class="inv-layout">' +
          '<div class="inv-picker">' +
            '<div class="inv-tabs" role="tablist" data-inv="tabs"></div>' +
            '<input type="search" class="inv-input inv-search" data-inv="search" placeholder="Search items…" aria-label="Search items" autocomplete="off">' +
            '<div class="inv-grid" data-inv="grid"></div>' +
          '</div>' +
          '<aside class="inv-mine">' +
            '<div class="inv-mine__head"><h3>Your inventory</h3><button type="button" class="inv-clear" data-inv-act="clear" hidden>Clear</button></div>' +
            '<ul class="inv-mine__list" data-inv="list"></ul>' +
          '</aside>' +
        '</div>' +
      '</section>'
    );
  }

  function tabsHtml() {
    var list = ["all"].concat(TRADEABLE, state.networth ? NETWORTH_ONLY : []);
    if (list.indexOf(state.tab) < 0) state.tab = "all";
    return list.map(function (t) {
      var on = t === state.tab;
      return '<button type="button" role="tab" class="inv-tab' + (on ? " is-on" : "") + '" aria-selected="' + on + '" data-inv-tab="' + esc(t) + '">' + esc(t === "all" ? "All" : label(t)) + "</button>";
    }).join("");
  }
  function imgHtml(it, cls) {
    return it.img
      ? '<img class="' + cls + '" src="' + esc(it.img) + '" alt="" loading="lazy" decoding="async" onerror="this.style.visibility=\'hidden\'">'
      : '<span class="' + cls + '"></span>';
  }
  function gridHtml() {
    if (!items.length) return '<p class="inv-empty">Values are still loading…</p>';
    var q = state.q.trim().toLowerCase();
    var shown = items.filter(function (it) {
      if (!it.tradeable && !state.networth) return false;
      if (state.tab !== "all" && it.section !== state.tab) return false;
      return !q || it.name.toLowerCase().indexOf(q) > -1;
    });
    if (!shown.length) return '<p class="inv-empty">No items match “' + esc(state.q) + '”.</p>';
    var owned = {};
    state.entries.forEach(function (e) { owned[e.key] = (owned[e.key] || 0) + e.qty; });
    return shown.map(function (it) {
      var val = it.tradeable ? (it.avg ? money(it.avg) : esc(it.avgText || "N/A")) : (it.nw ? money(it.nw) : "N/A");
      return '<button type="button" class="inv-tile" data-inv-add="' + esc(it.key) + '" aria-label="Add ' + esc(it.name) + '">' +
        '<span class="inv-tile__pic">' + imgHtml(it, "inv-tile__img") + (owned[it.key] ? '<span class="inv-tile__owned">×' + owned[it.key] + "</span>" : "") + "</span>" +
        '<span class="inv-tile__name">' + esc(it.name) + "</span>" +
        '<span class="inv-tile__val' + (it.tradeable ? "" : " is-nw") + '">' + val + "</span>" +
        '<span class="inv-tile__plus" aria-hidden="true">+</span>' +
      "</button>";
    }).join("");
  }
  function listHtml() {
    var list = visibleEntries();
    if (!list.length) return '<li class="inv-mine__empty">Click any item on the left to add it.</li>';
    return list.map(function (e) {
      var it = byKey[e.key];
      var dur = it.maxDur
        ? '<label class="inv-row__dur">Durability <input type="number" min="0" max="' + it.maxDur + '" value="' + (e.dur == null ? it.maxDur : e.dur) + '" data-inv-dur="' + e.id + '"><span>/' + it.maxDur + "</span></label>"
        : "";
      return '<li class="inv-row">' +
        '<span class="inv-row__pic">' + imgHtml(it, "inv-row__img") + "</span>" +
        '<div class="inv-row__main">' +
          '<p class="inv-row__name">' + esc(it.name) + (it.tradeable ? "" : ' <small>networth only</small>') + "</p>" +
          dur +
          (it.maxDur ? '<button type="button" class="inv-row__again" data-inv-again="' + e.id + '">+ Add another copy</button>' : "") +
        "</div>" +
        '<div class="inv-row__side">' +
          '<b class="inv-row__val">' + money(entryValue(e)) + "</b>" +
          '<span class="inv-qty">' +
            '<button type="button" data-inv-dec="' + e.id + '" aria-label="One less">−</button>' +
            "<span>" + e.qty + "</span>" +
            '<button type="button" data-inv-inc="' + e.id + '" aria-label="One more">+</button>' +
          "</span>" +
        "</div>" +
        '<button type="button" class="inv-row__x" data-inv-del="' + e.id + '" aria-label="Remove ' + esc(it.name) + '">×</button>' +
      "</li>";
    }).join("");
  }

  function $(sel) { return root.querySelector('[data-inv="' + sel + '"]'); }
  function find(id) { id = +id; for (var i = 0; i < state.entries.length; i++) if (state.entries[i].id === id) return state.entries[i]; return null; }

  function paintTotals() {
    var t = totals();
    $("value").textContent = money(t.value);
    $("meta").textContent = t.count ? t.count + (t.count === 1 ? " item" : " items") : "No items yet";
    $("networth").textContent = money(t.networth);
    var any = visibleEntries().length > 0;
    root.querySelector('[data-inv-act="clear"]').hidden = !any;
  }
  function paintList() { $("list").innerHTML = listHtml(); paintTotals(); }
  function paintGrid() { $("grid").innerHTML = gridHtml(); }
  function paintNw() {
    var btn = root.querySelector('[data-inv-act="networth"]');
    btn.setAttribute("aria-expanded", String(state.networth));
    btn.textContent = state.networth ? "Hide networth" : "See your BlockSpin networth";
    $("nw").hidden = !state.networth;
    $("tabs").innerHTML = tabsHtml();
  }
  function paintAll() { paintNw(); paintGrid(); paintList(); }

  function addItem(key, newCopy) {
    var it = byKey[key];
    if (!it) return;
    var full = null;
    if (!newCopy) state.entries.forEach(function (e) { if (e.key === key && (e.dur == null || e.dur === it.maxDur)) full = e; });
    if (full) full.qty = Math.min(999, full.qty + 1);
    else state.entries.push({ id: nextId++, key: key, qty: 1, dur: it.maxDur ? it.maxDur : null });
    save(); paintGrid(); paintList();
  }

  function wire() {
    root.addEventListener("click", function (ev) {
      var t = ev.target.closest("button");
      if (!t || !root.contains(t)) return;
      var v, e;
      if ((v = t.getAttribute("data-inv-add"))) addItem(v, false);
      else if ((v = t.getAttribute("data-inv-again")) && (e = find(v))) addItem(e.key, true);
      else if ((v = t.getAttribute("data-inv-inc")) && (e = find(v))) { e.qty = Math.min(999, e.qty + 1); save(); paintGrid(); paintList(); }
      else if ((v = t.getAttribute("data-inv-dec")) && (e = find(v))) {
        e.qty -= 1;
        if (e.qty <= 0) state.entries.splice(state.entries.indexOf(e), 1);
        save(); paintGrid(); paintList();
      }
      else if ((v = t.getAttribute("data-inv-del")) && (e = find(v))) { state.entries.splice(state.entries.indexOf(e), 1); save(); paintGrid(); paintList(); }
      else if ((v = t.getAttribute("data-inv-tab"))) { state.tab = v; $("tabs").innerHTML = tabsHtml(); paintGrid(); }
      else if (t.getAttribute("data-inv-act") === "networth") { state.networth = !state.networth; save(); paintAll(); }
      else if (t.getAttribute("data-inv-act") === "clear") {
        state.entries = state.entries.filter(function (x) { return !(byKey[x.key].tradeable || state.networth); });
        save(); paintGrid(); paintList();
      }
    });
    root.addEventListener("change", function (ev) {
      var id = ev.target.getAttribute && ev.target.getAttribute("data-inv-dur"), e = id && find(id);
      if (!e) return;
      var it = byKey[e.key];
      e.dur = Math.max(0, Math.min(it.maxDur, parseInt(ev.target.value, 10) || 0));
      ev.target.value = e.dur;
      save(); paintList();
    });
    var timer = 0;
    root.addEventListener("input", function (ev) {
      if (ev.target === $("search")) { state.q = ev.target.value; clearTimeout(timer); timer = setTimeout(paintGrid, 120); }
      else if (ev.target === $("cash")) { state.cash = ev.target.value; save(); paintTotals(); }
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
    if (e.target.closest && e.target.closest(".inv-calc-btn--mobile")) {
      var close = document.getElementById("mobile-calc-close");
      if (close) close.click();
    }
  });
})();
