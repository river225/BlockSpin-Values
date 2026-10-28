/**
 * Staff page: value feedback from the item cards.
 * The page itself holds no data. Votes come from the bot only after it checks, on the server, that
 * the signed-in Discord account owns or administers the BSV server.
 */
(function () {
  "use strict";
  var API = "https://bsv-bot-production.up.railway.app/api/value-feedback";
  var root = document.getElementById("fb-root");
  var data = null, allItems = [], current = null, from = "", to = "", q = "", sort = "bad";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function token() { return typeof window.bsvGetAuthToken === "function" ? window.bsvGetAuthToken() : ""; }
  function when(t) { if (!t) return "the start"; var d = new Date(t); return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + ", " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); }
  function toInput(t) { var d = new Date(t - new Date().getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); }
  function msg(html) { root.innerHTML = '<div class="fb__msg">' + html + "</div>"; }
  function inRange(v) {
    var t = v.updated || v.t;
    if (from && t < new Date(from).getTime()) return false;
    if (to && t > new Date(to).getTime()) return false;
    return true;
  }
  function k(s) { return String(s || "").trim().toLowerCase(); }

  function load() {
    var t = token();
    if (!t) { msg("Log in with Discord (top right) with your BSV admin account to see feedback."); return; }
    Promise.all([
      fetch(API + "/list", { headers: { Authorization: "Bearer " + t } }).then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j }; }); }),
      fetch((window.bsvSitePath ? window.bsvSitePath("tools/items.json") : "tools/items.json")).then(function (r) { return r.json(); }).catch(function () { return []; })
    ]).then(function (res) {
      if (res[0].status === 403) { msg("This page is only for the BSV server owner and admins."); return; }
      if (!res[0].j || !res[0].j.ok) { msg("Couldn't load feedback. Try again in a minute."); return; }
      data = res[0].j;
      var seen = {};
      allItems = [];
      (res[1] || []).forEach(function (it) { if (!seen[k(it.name)]) { seen[k(it.name)] = 1; allItems.push({ name: it.name, section: it.section }); } });
      data.votes.forEach(function (v) { if (!seen[k(v.item)]) { seen[k(v.item)] = 1; allItems.push({ name: v.item, section: v.section }); } });
      paint();
    }).catch(function () { msg("Couldn't reach the bot. Try again in a minute."); });
  }

  function counts(list) {
    var c = { total: 0, up: 0, down: 0 };
    list.forEach(function (v) { c.total++; c[v.vote === "down" ? "down" : "up"]++; });
    return c;
  }
  function statBoxes(c) {
    return '<div class="fb-stats">' +
      '<div class="fb-stat"><span>Total votes</span><b>' + c.total + "</b></div>" +
      '<div class="fb-stat fb-stat--up"><span>👍 Accurate</span><b>' + c.up + "</b></div>" +
      '<div class="fb-stat fb-stat--down"><span>👎 Not accurate</span><b>' + c.down + "</b></div>" +
      '<div class="fb-stat"><span>Agree</span><b>' + (c.total ? Math.round((c.up / c.total) * 100) + "%" : "–") + "</b></div></div>";
  }
  function dateBar() {
    return '<div class="fb__bar">' +
      '<label>From <input type="datetime-local" id="fb-from" value="' + esc(from) + '"></label>' +
      '<label>To <input type="datetime-local" id="fb-to" value="' + esc(to) + '"></label>' +
      '<button type="button" class="fb-btn" data-act="clear-dates">All time</button></div>';
  }

  function paint() {
    var html = '<div class="fb__bar fb__bar--search"><input type="search" id="fb-q" placeholder="Search any item…" value="' + esc(q) + '" autocomplete="off"></div>';
    if (current) html += itemView(); else html += overview();
    root.innerHTML = html;
  }

  function overview() {
    var votes = data.votes.filter(inRange);
    var by = {};
    votes.forEach(function (v) { var r = (by[k(v.item)] ||= { name: v.item, up: 0, down: 0 }); r[v.vote === "down" ? "down" : "up"]++; });
    var ql = k(q);
    var list = allItems.filter(function (i) { return !ql || k(i.name).indexOf(ql) > -1; }).map(function (i) {
      var r = by[k(i.name)] || { up: 0, down: 0 };
      return { name: i.name, section: i.section, up: r.up, down: r.down };
    });
    if (!ql) list = list.filter(function (i) { return i.up + i.down > 0; });
    list.sort(function (a, b) { return sort === "bad" ? b.down - a.down || b.up - a.up : (b.up + b.down) - (a.up + a.down); });
    return statBoxes(counts(votes)) + dateBar() +
      '<div class="fb__bar"><span class="fb-muted">Sort:</span>' +
        '<button type="button" class="fb-btn' + (sort === "bad" ? " is-on" : "") + '" data-sort="bad">Most 👎</button>' +
        '<button type="button" class="fb-btn' + (sort === "all" ? " is-on" : "") + '" data-sort="all">Most votes</button></div>' +
      (list.length
        ? '<table class="fb-table"><thead><tr><th>Item</th><th>👍</th><th>👎</th><th>Agree</th></tr></thead><tbody>' +
          list.slice(0, 300).map(function (i) {
            var t = i.up + i.down;
            return '<tr class="fb-row" data-item="' + esc(i.name) + '"><td><b>' + esc(i.name) + "</b><br><small>" + esc(i.section || "") + '</small></td><td class="fb-up">' + i.up + '</td><td class="fb-down">' + i.down + "</td><td>" + (t ? Math.round((i.up / t) * 100) + "%" : "–") + "</td></tr>";
          }).join("") + "</tbody></table>"
        : '<div class="fb__msg">' + (ql ? "No item matches “" + esc(q) + "”." : "No votes in this period yet.") + "</div>");
  }

  function itemView() {
    var all = data.votes.filter(function (v) { return k(v.item) === k(current); });
    var list = all.filter(inRange).sort(function (a, b) { return (b.updated || b.t) - (a.updated || a.t); });
    var val = data.values[current] || Object.keys(data.values).reduce(function (f, n) { return f || (k(n) === k(current) ? data.values[n] : null); }, null);
    var hist = val && val.history ? val.history.slice().reverse() : [];
    var row = function (v) {
      return '<div class="fb-vote fb-vote--' + v.vote + '">' +
        (v.user.avatar ? '<img src="' + esc(v.user.avatar) + '" alt="" width="34" height="34">' : '<span class="fb-vote__av"></span>') +
        '<div class="fb-vote__main"><p><b>' + esc(v.user.name) + "</b> " + (v.user.username ? '<span class="fb-muted">@' + esc(v.user.username) + "</span>" : "") +
        ' <span class="fb-muted">· ' + when(v.updated || v.t) + " · value then " + esc(v.value || "?") + "</span></p>" +
        (v.vote === "down" && (v.reason || v.suggested) ? '<p class="fb-vote__why">' + (v.suggested ? "<i>Thinks it's worth " + esc(v.suggested) + "</i><br>" : "") + esc(v.reason) + "</p>" : "") +
        "</div><span class=\"fb-vote__thumb\">" + (v.vote === "down" ? "👎" : "👍") + "</span></div>";
    };
    var ups = list.filter(function (v) { return v.vote !== "down"; }), downs = list.filter(function (v) { return v.vote === "down"; });
    return '<button type="button" class="fb-btn" data-act="back">← All items</button>' +
      '<h2 class="fb-item-title">' + esc(current) + "</h2>" +
      '<p class="fb-muted">' + (val ? esc(val.section) + " · current value <b class=\"fb-up\">" + esc(val.value) + "</b>" : "") + "</p>" +
      statBoxes(counts(list)) + dateBar() +
      (hist.length ? '<div class="fb-hist"><p class="fb-muted">Value changes — click one to only count votes since then:</p>' +
        hist.map(function (h) { return '<button type="button" class="fb-btn" data-since="' + h.from + '">' + esc(h.value) + " · since " + when(h.from) + "</button>"; }).join("") + "</div>" : "") +
      '<div class="fb-cols"><section><h3>👎 Not accurate (' + downs.length + ")</h3>" + (downs.map(row).join("") || '<p class="fb-muted">None</p>') + "</section>" +
      "<section><h3>👍 Accurate (" + ups.length + ")</h3>" + (ups.map(row).join("") || '<p class="fb-muted">None</p>') + "</section></div>";
  }

  root.addEventListener("click", function (e) {
    var el = e.target.closest("[data-item], [data-act], [data-sort], [data-since]");
    if (!el) return;
    if (el.hasAttribute("data-item")) { current = el.getAttribute("data-item"); q = ""; paint(); window.scrollTo(0, 0); }
    else if (el.hasAttribute("data-sort")) { sort = el.getAttribute("data-sort"); paint(); }
    else if (el.hasAttribute("data-since")) { from = +el.getAttribute("data-since") ? toInput(+el.getAttribute("data-since")) : ""; to = ""; paint(); }
    else if (el.getAttribute("data-act") === "back") { current = null; paint(); }
    else if (el.getAttribute("data-act") === "clear-dates") { from = ""; to = ""; paint(); }
  });
  root.addEventListener("change", function (e) {
    if (e.target.id === "fb-from") { from = e.target.value; paint(); }
    if (e.target.id === "fb-to") { to = e.target.value; paint(); }
  });
  root.addEventListener("input", function (e) {
    if (e.target.id !== "fb-q") return;
    q = e.target.value; current = null;
    var pos = e.target.selectionStart; paint();
    var inp = document.getElementById("fb-q"); inp.focus(); inp.setSelectionRange(pos, pos);
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(load, 300); });
  else setTimeout(load, 300);
})();
