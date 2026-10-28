/**
 * Save / "Item page" / "Share" buttons along the bottom-left of item cards, and an
 * "Value accurate?" thumbs up/down at the bottom-right (feedback goes to the bot, staff read it on feedback.html).
 * Linked via tools/site.json "extras" (index.html, so every generated page gets it too).
 */
(function () {
  "use strict";
  var OPEN_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>';
  var THUMB_UP = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3z"/><path d="M7 10l4-7a2 2 0 0 1 3 1.7V9h5.2a2 2 0 0 1 2 2.3l-1.3 8A2 2 0 0 1 17.9 21H7"/></svg>';
  var SHARE_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3"/></svg>';

  function addTo(card) {
    var link = card.querySelector("h3 a.card-item-link");
    if (!link || card.querySelector(".card-item-actions")) return;
    var box = document.createElement("div");
    box.className = "card-item-actions";
    box.innerHTML =
      '<button type="button" class="card-action-btn card-open-btn" aria-label="Open item page">' + OPEN_ICON + "<span>Item page</span></button>" +
      '<button type="button" class="card-action-btn card-share-btn" aria-label="Share item">' + SHARE_ICON + "<span>Share</span></button>";
    // Save sits first, then Item page and Share, along the bottom-left.
    var save = card.querySelector(".card-save-btn");
    if (save) box.insertBefore(save, box.firstChild);
    // Giveaway gift sits after Share (it used to be under the vote thumbs).
    var gift = card.querySelector(".card-giveaway-trigger");
    if (gift) box.appendChild(gift);
    card.appendChild(box);
    // "Is this value accurate?" at the bottom-right.
    if (!card.querySelector(".card-vote")) {
      var vote = document.createElement("div");
      vote.className = "card-vote";
      vote.innerHTML = '<span class="card-vote__q">Accurate value?</span>' +
        '<span class="card-vote__btns">' +
          '<button type="button" class="card-vote__btn" data-vote="up" aria-label="Yes, this value is accurate">' + THUMB_UP + "</button>" +
          '<button type="button" class="card-vote__btn card-vote__btn--down" data-vote="down" aria-label="No, this value is not accurate">' + THUMB_UP + "</button>" +
        "</span>";
      card.appendChild(vote);
    }
  }

  /* ---------- value feedback (login + BSV server members, one vote per item) ---------- */
  var API = "https://bsv-bot-production.up.railway.app/api/value-feedback";
  var mine = null, mineLoading = false;
  function token() { return typeof window.bsvGetAuthToken === "function" ? window.bsvGetAuthToken() : ""; }
  function cardInfo(card) {
    var link = card.querySelector("h3 a.card-item-link");
    var name = (link ? link.getAttribute("data-bsv-route-item") : "") || (card.getAttribute("data-name") || "").trim() || ((card.querySelector("h3") || {}).textContent || "");
    return { item: String(name).trim(), section: link ? link.getAttribute("data-bsv-route-section") || "" : "", value: (card.getAttribute("data-avg") || "").trim() };
  }
  function api(path, body) {
    var t = token();
    var opt = { method: body ? "POST" : "GET", headers: {} };
    if (t) opt.headers.Authorization = "Bearer " + t;
    if (body) { opt.headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
    return fetch(API + path, opt).then(function (r) { return r.json().catch(function () { return {}; }); }).catch(function () { return { ok: false }; });
  }
  function paintCard(card) {
    var box = card.querySelector(".card-vote");
    if (!box || !mine) return;
    var v = mine[cardInfo(card).item] || "";
    box.querySelectorAll(".card-vote__btn").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-vote") === v); b.setAttribute("aria-pressed", String(b.getAttribute("data-vote") === v)); });
  }
  function loadMine() {
    if (mineLoading || mine || !token()) return;
    mineLoading = true;
    api("/mine").then(function (r) { mine = (r && r.votes) || {}; mineLoading = false; document.querySelectorAll(".card").forEach(paintCard); });
  }
  function toast(card, text) {
    var box = card.querySelector(".card-vote"); if (!box) return;
    box.setAttribute("data-tip", text);
    clearTimeout(box._t); box._t = setTimeout(function () { box.removeAttribute("data-tip"); }, 2200);
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function openReport(card, info) {
    var pop = document.createElement("div");
    pop.className = "vote-pop";
    pop.innerHTML =
      '<form class="vote-pop__box" role="dialog" aria-modal="true" aria-labelledby="vote-pop-t">' +
        '<button type="button" class="vote-pop__x" data-act="close" aria-label="Close">×</button>' +
        '<h3 id="vote-pop-t">Thanks — your thumbs down on ' + esc(info.item) + " counts.</h3>" +
        '<p class="vote-pop__now">Want to tell us more? (optional)</p>' +
        '<label class="vote-pop__lbl">Why do you think the value isn\'t accurate?<textarea name="reason" maxlength="600" rows="4" placeholder="e.g. People are only paying 900k for it in trades right now"></textarea></label>' +
        '<label class="vote-pop__lbl">What do you think it\'s worth?<input type="text" name="suggested" maxlength="40" placeholder="e.g. 1.2M" autocomplete="off"></label>' +
        '<button type="submit" class="vote-pop__send">Send</button>' +
      "</form>";
    document.body.appendChild(pop);
    var form = pop.querySelector("form");
    function close() { pop.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    pop.addEventListener("click", function (e) { if (e.target === pop || (e.target.closest && e.target.closest("[data-act=close]"))) close(); });
    form.querySelector("textarea").focus();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var reason = form.reason.value.trim(), suggested = form.suggested.value.trim();
      if (!reason && !suggested) { close(); return; }
      var btn = form.querySelector(".vote-pop__send"); btn.disabled = true; btn.textContent = "Sending…";
      api("", { item: info.item, section: info.section, value: info.value, vote: "down", reason: reason, suggested: suggested }).then(function () {
        form.innerHTML = '<h3>Thanks for the feedback!</h3><p class="vote-pop__now">Our value team will look at ' + esc(info.item) + '.</p><button type="button" class="vote-pop__send" data-act="close">Close</button>';
      });
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".card-vote__btn");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var card = b.closest(".card"); if (!card) return;
    if (!token()) {
      toast(card, "Log in to vote");
      if (typeof window.bsvOpenLoginModal === "function") window.bsvOpenLoginModal({ requireGuild: true });
      return;
    }
    var info = cardInfo(card), want = b.getAttribute("data-vote");
    mine = mine || {};
    var prev = mine[info.item] || "";
    var vote = prev === want ? "none" : want; // tap the same thumb again to take it back
    if (vote === "none") delete mine[info.item]; else mine[info.item] = vote;
    paintCard(card);
    api("", { item: info.item, section: info.section, value: info.value, vote: vote }).then(function (r) {
      if (r && r.ok) { if (vote === "down") openReport(card, info); return; }
      if (prev) mine[info.item] = prev; else delete mine[info.item];
      paintCard(card);
      toast(card, r && r.error === "join_server" ? "Join our Discord server to vote" : r && r.error === "login" ? "Log in to vote" : r && r.error === "slow" ? "Slow down a little" : "Couldn't save your vote");
    });
  }, true);
  function restoreVotes(root) {
    loadMine();
    if (mine) (root || document).querySelectorAll(".card").forEach(paintCard);
  }

  function scan(root) { (root || document).querySelectorAll(".card").forEach(addTo); restoreVotes(root); }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, fail) {
      var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? ok() : fail(); } catch (e) { fail(e); } ta.remove();
    });
  }
  function flash(btn) {
    btn.classList.add("is-copied"); btn.setAttribute("data-tip", "Link copied!");
    setTimeout(function () { btn.classList.remove("is-copied"); btn.removeAttribute("data-tip"); }, 1600);
  }

  // One listener for all cards (also works on the spotlight copy of a card).
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".card-open-btn, .card-share-btn");
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    var card = btn.closest(".card");
    var link = card && card.querySelector("h3 a.card-item-link");
    if (!link) return;
    if (btn.classList.contains("card-open-btn")) {
      if (typeof window.bsvNavigate === "function" && link.getAttribute("data-bsv-route-section")) {
        window.bsvNavigate({ section: link.getAttribute("data-bsv-route-section"), item: link.getAttribute("data-bsv-route-item") }, "push");
      } else {
        location.href = link.href;
      }
      return;
    }
    // Short branded share link (preview card + forwards to this item page on the test site).
    var slugMatch = /\/items\/([^/]+)\/?$/.exec(link.getAttribute("href") || "");
    var url = slugMatch ? "https://share.blockspinvalues.com/" + (document.documentElement.getAttribute("data-bsv-env") === "test" ? "ti/" : "i/") + slugMatch[1] : new URL(link.getAttribute("href"), location.href).href;
    var name = (card.getAttribute("data-name") || "").trim();
    if (window.matchMedia("(pointer: coarse)").matches && navigator.share) {
      navigator.share({ title: name + " value | BlockSpin Values", url: url }).catch(function () {});
      return;
    }
    copy(url).then(function () { flash(btn); }, function () { window.prompt("Copy this link:", url); });
  }, true);

  var queued = false;
  new MutationObserver(function () {
    if (queued) return; queued = true;
    requestAnimationFrame(function () { queued = false; scan(); });
  }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", function () { scan(); });
})();
