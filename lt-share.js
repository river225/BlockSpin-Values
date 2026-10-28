/**
 * Share button on Live Trading posts.
 * The link points at the bot's share page, which shows a rich preview (items, values, image)
 * in Discord/TikTok and then forwards to this post on the test site.
 */
(function () {
  "use strict";
  // Short share links. Switch SHARE_HOST to "https://share.blockspinvalues.com" once its DNS is live.
  var SHARE_HOST = "https://share.blockspinvalues.com";
  var IS_TEST = document.documentElement.getAttribute("data-bsv-env") === "test";
  var SHARE_PATH = IS_TEST ? "/tt/" : "/t/"; // test site links use /tt/

  function shareUrl(id) {
    return SHARE_HOST + SHARE_PATH + String(id).replace(/-/g, "").slice(0, 10).toLowerCase();
  }

  function flash(btn, text) {
    var label = btn.querySelector(".lt-share__label");
    var old = label.textContent;
    label.textContent = text;
    btn.classList.add("is-done");
    setTimeout(function () { label.textContent = old; btn.classList.remove("is-done"); }, 1800);
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      ta.remove();
    });
  }

  function onShare(e) {
    var btn = e.currentTarget;
    var id = btn.getAttribute("data-share-id");
    var url = shareUrl(id);
    var touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && navigator.share) {
      navigator.share({ title: "BlockSpin trade", url: url }).catch(function () {});
      return;
    }
    copy(url).then(function () { flash(btn, "Link copied!"); }, function () { window.prompt("Copy this link:", url); });
  }

  var ICON =
    '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 3v13"/><path d="M7.5 7.5 12 3l4.5 4.5"/></svg>';

  function addButtons(root) {
    (root || document).querySelectorAll("article.lt-post[data-id]").forEach(function (post) {
      if (post.querySelector(".lt-share")) return;
      var id = post.getAttribute("data-id");
      if (!id) return;
      // Sit right next to Hide in the post footer (create the footer if this post has none).
      var foot = post.querySelector(".lt-post__foot");
      if (!foot) {
        foot = document.createElement("div");
        foot.className = "lt-post__foot";
        post.appendChild(foot);
      }
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lt-share";
      btn.setAttribute("data-share-id", id);
      btn.setAttribute("aria-label", "Share this trade");
      btn.innerHTML = ICON + '<span class="lt-share__label">Share</span>';
      btn.addEventListener("click", onShare);
      var hide = foot.querySelector(".lt-post__hide");
      if (hide) foot.insertBefore(btn, hide);
      else foot.appendChild(btn);
    });
  }

  // Opened from a shared link: bring that post into view and highlight it.
  var wanted = new URLSearchParams(location.search).get("post");
  var highlighted = false;
  function highlight() {
    if (!wanted || highlighted) return;
    var el = document.querySelector('article.lt-post[data-id="' + wanted.replace(/["\\]/g, "") + '"]');
    if (!el) return;
    highlighted = true;
    el.classList.add("lt-post--shared");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(function () { el.classList.remove("lt-post--shared"); }, 4000);
  }

  var queued = false;
  new MutationObserver(function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; addButtons(); highlight(); });
  }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", function () { addButtons(); highlight(); });
})();
