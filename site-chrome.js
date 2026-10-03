(function (global) {
  "use strict";

  var CONSENT_KEY = "bsv-cookie-consent";
  var GA_ID = "G-0T25993BCC";
  var DISCORD_INVITE_BASE = "https://discord.gg/QbapryYUUx";

  function isProdAnalyticsHost() {
    try {
      var h = (location.hostname || "").toLowerCase();
      if (h !== "blockspinvalues.com" && h !== "www.blockspinvalues.com") return false;
      if (document.documentElement && document.documentElement.dataset.bsvEnv === "test") return false;
      if (document.querySelector('meta[name="bsv-env"][content="test"]')) return false;
      return true;
    } catch (_) {
      return false;
    }
  }

  function discordInviteUrl(content) {
    var base = DISCORD_INVITE_BASE;
    try {
      var u = new URL(base);
      u.searchParams.set("utm_source", "blockspinvalues");
      u.searchParams.set("utm_medium", "referral");
      u.searchParams.set("utm_campaign", "site");
      if (content) u.searchParams.set("utm_content", String(content).slice(0, 40));
      return u.toString();
    } catch (_) {
      return base;
    }
  }
  // Keep in sync with script.js THEMES_DISABLED — theme UI is not shipping.
  var THEMES_DISABLED = true;

  // Monetag fully removed. Strip any leftover tags/workers from older visits.
  var MONETAG_HOST_RE =
    /quge5\.com|5gvci\.com|omg10\.com|n6wxm\.com|nap5k\.com|tzegilo\.com|monetag|11550419|11550420|11550421|11548891|268935/i;
  var MONETAG_TAG_IDS = ["bsv-ad-vignette", "bsv-ad-ipp", "bsv-ad-push"];

  // GitHub project Pages live under /RepoName/ — root-absolute "/assets/..." would 404 at domain root.
  function siteRoot() {
    try {
      if (typeof window.BSV_SITE_ROOT === "string" && window.BSV_SITE_ROOT) {
        return window.BSV_SITE_ROOT;
      }
      var host = location.hostname || "";
      if (/\.github\.io$/i.test(host)) {
        var seg = (location.pathname || "/").split("/").filter(Boolean)[0];
        if (seg) return "/" + seg + "/";
      }
    } catch (_) {}
    return "/";
  }

  function sitePath(path) {
    var p = String(path || "");
    if (!p) return siteRoot();
    if (/^(https?:|data:|mailto:|tel:|#)/i.test(p)) return p;
    return siteRoot() + p.replace(/^\//, "");
  }

  try {
    window.BSV_SITE_ROOT = siteRoot();
    window.bsvSitePath = sitePath;
  } catch (_) {}

  function rewriteRootAbsoluteAssets(rootEl) {
    var root = siteRoot();
    if (root === "/") return;
    var scope = rootEl || document;
    // Include plain "/" and "/#..." back-links — those break on GitHub project Pages.
    var nodes = scope.querySelectorAll(
      '[src^="/"], [href^="/"]'
    );
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var attr = el.hasAttribute("src") ? "src" : "href";
      var val = el.getAttribute(attr);
      if (!val || val.charAt(0) !== "/") continue;
      // Don't rewrite protocol-relative or already-prefixed paths.
      if (val.indexOf("//") === 0) continue;
      if (val.indexOf(root) === 0) continue;
      el.setAttribute(attr, root + val.slice(1));
    }
  }

  function isSponsorsPage() {
    try {
      if (/\/sponsors(\/|$)/i.test(location.pathname || "")) return true;
      var body = document.body;
      if (!body) return false;
      return (
        body.getAttribute("data-bsv-page") === "sponsors" ||
        body.classList.contains("sponsors-body")
      );
    } catch (_) {
      return false;
    }
  }

  // Apply Colorized hue on every page that uses site chrome; keep /sponsors/ stock.
  function paintSavedBackground() {
    var root = document.documentElement;
    if (isSponsorsPage()) {
      root.style.setProperty("--bsv-hue", "217");
      root.style.setProperty("--bsv-accent-hue", "188");
      root.style.backgroundColor = "hsl(217, 41%, 10%)";
      root.removeAttribute("data-bsv-bg");
      root.setAttribute("data-bsv-sponsors-lock", "1");
      return;
    }
    root.removeAttribute("data-bsv-sponsors-lock");
    try {
      var style = localStorage.getItem("bsv-bg-style") || "standard";
      var hue = parseInt(localStorage.getItem("bsv-bg-hue") || "210", 10);
      if (style === "colorized") {
        if (isNaN(hue)) hue = 210;
        hue = Math.max(0, Math.min(360, Math.round(hue)));
        root.style.setProperty("--bsv-hue", String(hue));
        root.style.setProperty("--bsv-accent-hue", String(hue));
        root.style.backgroundColor = "hsl(" + hue + ", 41%, 10%)";
        root.setAttribute("data-bsv-bg", "colorized");
        return;
      }
      if (style === "dark") {
        root.style.setProperty("--bsv-hue", "220");
        root.style.setProperty("--bsv-accent-hue", "188");
        root.style.backgroundColor = "hsl(220, 20%, 4%)";
        root.setAttribute("data-bsv-bg", "dark");
        return;
      }
      root.style.setProperty("--bsv-hue", "217");
      root.style.setProperty("--bsv-accent-hue", "188");
      root.style.backgroundColor = "hsl(217, 41%, 10%)";
      root.removeAttribute("data-bsv-bg");
    } catch (_) {}
  }

  paintSavedBackground();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", paintSavedBackground);
  }

  function getConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (_) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (_) {}
  }

  function hasMarketingConsent() {
    return getConsent() === "accepted";
  }

  function purgeMonetagArtifacts() {
    try {
      MONETAG_TAG_IDS.forEach(function (id) {
        var byId = document.getElementById(id);
        if (byId) byId.remove();
      });
      document.querySelectorAll("script[src], iframe[src], img[src], link[href]").forEach(function (el) {
        var url = el.src || el.href || "";
        if (MONETAG_HOST_RE.test(url)) el.remove();
      });
      try {
        delete document.documentElement.dataset.bsvSoftAds;
      } catch (_) {
        document.documentElement.removeAttribute("data-bsv-soft-ads");
      }
      try {
        delete document.documentElement.dataset.bsvSponsorsNoAds;
      } catch (_) {
        document.documentElement.removeAttribute("data-bsv-sponsors-no-ads");
      }
    } catch (_) {}
    unregisterMonetagServiceWorker();
  }

  function unregisterMonetagServiceWorker() {
    try {
      if (!navigator.serviceWorker || !navigator.serviceWorker.getRegistrations) return;
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        regs.forEach(function (reg) {
          var url =
            (reg.active && reg.active.scriptURL) ||
            (reg.installing && reg.installing.scriptURL) ||
            (reg.waiting && reg.waiting.scriptURL) ||
            "";
          // Unregister leftover Monetag / Multitag workers and root sw.js.
          if (/\/sw\.js(\?|$)/.test(url) || MONETAG_HOST_RE.test(url)) {
            reg.unregister().catch(function () {});
          }
        });
      });
      if (navigator.serviceWorker.getRegistration) {
        navigator.serviceWorker.getRegistration("/").then(function (reg) {
          if (reg) reg.unregister().catch(function () {});
        });
      }
    } catch (_) {}
  }

  function ensureAnalytics() {
    try {
      if (!isProdAnalyticsHost()) return;
      if (!hasMarketingConsent()) return;
      window.dataLayer = window.dataLayer || [];
      if (typeof window.gtag !== "function") {
        window.gtag = function () {
          window.dataLayer.push(arguments);
        };
      }
      if (!document.querySelector('script[src*="googletagmanager.com/gtag/js?id=' + GA_ID + '"]')) {
        var s = document.createElement("script");
        s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
        document.head.appendChild(s);
      }
      if (document.documentElement.dataset.bsvGaConfigured !== "1") {
        document.documentElement.dataset.bsvGaConfigured = "1";
        window.gtag("js", new Date());
        var pagePath = window.location.pathname || "/";
        if (/\/index\.html$/i.test(pagePath)) {
          pagePath = pagePath.replace(/\/index\.html$/i, "/") || "/";
        }
        var ignoreReferrer = false;
        try {
          ignoreReferrer = /bsv-bot-production\.up\.railway\.app/i.test(document.referrer || "");
        } catch (_) {}
        window.gtag("config", GA_ID, {
          anonymize_ip: true,
          send_page_view: true,
          page_path: pagePath,
          page_location: window.location.origin + pagePath,
          ignore_referrer: ignoreReferrer
        });
      }
    } catch (_) {}
  }

  function applyConsent(value) {
    setConsent(value);
    var banner = document.getElementById("bsv-consent-banner");
    if (banner) banner.remove();
    purgeMonetagArtifacts();
    if (value === "accepted") {
      ensureAnalytics();
    }
  }

  function ensureConsentStyles() {
    if (document.getElementById("bsv-consent-styles")) return;
    var style = document.createElement("style");
    style.id = "bsv-consent-styles";
    style.textContent =
      "#bsv-consent-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:100000;max-width:720px;margin:0 auto;padding:18px 20px;border-radius:16px;background:rgba(12,18,30,.97);border:1px solid rgba(255,255,255,.14);box-shadow:0 16px 48px rgba(0,0,0,.5);color:#e8eef8;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;contain:layout style}" +
      "#bsv-consent-banner p{margin:0 0 14px;color:#d5deec}" +
      "#bsv-consent-banner a{color:#9ec1ff;text-decoration:underline}" +
      "#bsv-consent-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}" +
      "#bsv-consent-actions button{appearance:none;border:0;border-radius:11px;padding:11px 18px;font:600 14px/1 system-ui,-apple-system,Segoe UI,sans-serif;cursor:pointer}" +
      "#bsv-consent-accept{background:#3b82f6;color:#fff;box-shadow:0 6px 18px rgba(59,130,246,.35)}" +
      "#bsv-consent-accept:hover{background:#2563eb}" +
      "#bsv-consent-reject{background:transparent;color:#8b97a8;border:1px solid rgba(255,255,255,.1);font-weight:500}" +
      "#bsv-consent-reject:hover{color:#a8b3c4;border-color:rgba(255,255,255,.16)}" +
      "@media (max-width:520px){#bsv-consent-banner{left:10px;right:10px;bottom:10px;padding:16px}" +
      "#bsv-consent-actions{flex-direction:column;align-items:stretch}" +
      "#bsv-consent-actions button{width:100%}}";
    document.head.appendChild(style);
  }

  function showConsentBanner() {
    if (document.getElementById("bsv-consent-banner")) return;
    ensureConsentStyles();
    var el = document.createElement("div");
    el.id = "bsv-consent-banner";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", "Cookie consent");
    el.innerHTML =
      "<p>We use cookies to improve your experience and analyze site traffic. Read our <a href=\"" +
      sitePath("z-cookie.html") +
      "\">Cookie Policy</a> to learn more.</p>" +
      '<div id="bsv-consent-actions">' +
      '<button type="button" id="bsv-consent-accept">Accept</button>' +
      '<button type="button" id="bsv-consent-reject">Reject</button>' +
      "</div>";
    document.body.appendChild(el);
    document.getElementById("bsv-consent-accept").addEventListener("click", function () {
      applyConsent("accepted");
    });
    document.getElementById("bsv-consent-reject").addEventListener("click", function () {
      applyConsent("rejected");
    });
  }

  function openConsentSettings() {
    showConsentBanner();
  }

  function initConsent() {
    purgeMonetagArtifacts();
    var choice = getConsent();
    if (choice === "accepted") {
      ensureAnalytics();
      return;
    }
    if (choice === "rejected") {
      return;
    }
    showConsentBanner();
  }

  function isDevSite() {
    var html = document.documentElement;
    if (html.getAttribute("data-bsv-env") === "test") return true;
    var meta = document.querySelector('meta[name="bsv-env"]');
    return !!(meta && meta.getAttribute("content") === "test");
  }

  var SOCIAL =
    '<a href="' + discordInviteUrl("nav-icon") + '" target="_blank" rel="noopener noreferrer" class="nav-discord" data-nav-tip="Join our Discord server!" title="Join our Discord server!" aria-label="Join our Discord server!">' +
      '<svg class="nav-social-link__icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.445.865-.608 1.25-1.845-.276-3.68-.276-5.487 0-.164-.393-.406-.874-.618-1.25a.077.077 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 0 0 .031.056c2.053 1.508 4.041 2.423 5.993 3.029a.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106c-.653-.248-1.274-.55-1.872-.892a.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.007.128 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.95-1.522 6.002-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z"/>' +
      "</svg></a>" +
    '<a href="https://www.roblox.com/communities/754565168/BlockSpin-Values#!/about" target="_blank" rel="noopener noreferrer" class="nav-roblox" data-nav-tip="Join our Roblox community!" title="Join our Roblox community!" aria-label="Join our Roblox community!">' +
      '<svg class="nav-social-link__icon nav-social-link__icon--roblox" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M18.926 23.998 0 18.892 5.075.002 24 5.108ZM15.348 10.09l-5.282-1.453-1.414 5.273 5.282 1.453z"/>' +
      "</svg></a>" +
    '<a href="https://www.tiktok.com/@river1_0_?is_from_webapp=1&amp;sender_device=pc" target="_blank" rel="noopener noreferrer" class="nav-tiktok" data-nav-tip="Check out River\'s TikTok!" title="Check out River\'s TikTok!" aria-label="Check out River\'s TikTok!">' +
      '<svg class="nav-social-link__icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74a2.89 2.89 0 0 1 2.31-4.64a2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>' +
      "</svg></a>";

  function themeSwitcher() {
    return (
      '<div class="theme-switcher" id="theme-switcher" aria-label="Theme">' +
        '<button type="button" class="theme-switcher-btn active" data-theme="default" title="Original theme" aria-label="Original theme"></button>' +
        '<button type="button" class="theme-switcher-btn" data-theme="red" title="Red theme" aria-label="Red theme"></button>' +
        '<button type="button" class="theme-switcher-btn" data-theme="pink" title="Pink theme" aria-label="Pink theme"></button>' +
        '<button type="button" class="theme-switcher-btn" data-theme="purple" title="Purple theme" aria-label="Purple theme"></button>' +
      "</div>"
    );
  }

  function navLink(href, label, activeKey, key) {
    var cls = activeKey === key ? ' class="nav-link--active"' : "";
    return '<a href="' + href + '"' + cls + ">" + label + "</a>";
  }

  function navLiveTradingLink(activeKey) {
    var cls =
      "nav-live-trading-link" +
      (activeKey === "live-trading" ? " nav-link--active" : "");
    return (
      '<a href="' +
      sitePath("live-trading.html") +
      '" class="' +
      cls +
      '" aria-label="Live Trading">' +
      '<span class="nav-live-trading-link__icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3 7h13"/><path d="M13 3l4 4-4 4"/>' +
      '<path d="M21 17H8"/><path d="M11 13l-4 4 4 4"/>' +
      "</svg>" +
      "</span>" +
      '<span class="nav-live-trading-link__label">Live Trading</span>' +
      "</a>"
    );
  }

  var VALUE_LIST_SECTIONS = [
    "Common / Uncommon",
    "Rare",
    "Epic",
    "Legendary",
    "Omega",
    "Gamepass / Misc",
    "Vehicles"
  ];
  var VALUE_LIST_EXTRAS = [
    "Live Trading",
    "Money & Game Guide",
    "Untradeable Items",
    "Richest Players",
    "Crew Logos"
  ];
  var DISCORD_INVITE = discordInviteUrl("nav");

  function goToSection(title) {
    if (typeof global.showSection === "function" && document.getElementById("sections-nav")) {
      global.showSection(title);
      return;
    }
    var cfg =
      typeof global.getSectionConfig === "function" ? global.getSectionConfig(title) : null;
    if (cfg && cfg.pageHref) {
      location.href = sitePath(cfg.pageHref);
      return;
    }
    location.href = sitePath("") + "#sec=" + encodeURIComponent(title);
  }

  function navValueListMenu() {
    var items = VALUE_LIST_SECTIONS.map(function (title) {
      return (
        '<button type="button" class="nav-icon-menu__item" data-section-go="' +
        title.replace(/"/g, "&quot;") +
        '">' +
        title +
        "</button>"
      );
    }).join("");
    var extras = VALUE_LIST_EXTRAS.map(function (title) {
      return (
        '<button type="button" class="nav-icon-menu__item" data-section-go="' +
        title.replace(/"/g, "&quot;") +
        '">' +
        title +
        "</button>"
      );
    }).join("");
    return (
      '<div class="nav-icon-menu" data-nav-menu="value-list">' +
        '<button type="button" class="nav-icon-menu__btn" aria-expanded="false" aria-haspopup="true" aria-label="Value List">' +
          '<span class="nav-icon-menu__icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/>' +
              '<path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>' +
            "</svg>" +
          "</span>" +
          '<span class="nav-icon-menu__label">Value List</span>' +
        "</button>" +
        '<div class="nav-icon-menu__panel" hidden>' +
          items +
          '<p class="nav-icon-menu__group" aria-hidden="true">Extras</p>' +
          extras +
        "</div>" +
      "</div>"
    );
  }

  function navGiveawaysMenu() {
    return (
      '<div class="nav-icon-menu" data-nav-menu="giveaways">' +
        '<button type="button" class="nav-icon-menu__btn" aria-expanded="false" aria-haspopup="dialog" aria-label="Giveaways" data-open-giveaways="1">' +
          '<span class="nav-icon-menu__icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/>' +
            "</svg>" +
          "</span>" +
          '<span class="nav-icon-menu__label">Giveaways</span>' +
        "</button>" +
      "</div>"
    );
  }

  function giveawaysModalHtml() {
    return (
      '<div class="bsv-giveaways-modal" id="bsv-giveaways-modal" hidden>' +
        '<div class="bsv-giveaways-modal__backdrop" data-close-giveaways="1"></div>' +
        '<div class="bsv-giveaways-modal__card" role="dialog" aria-modal="true" aria-labelledby="bsv-giveaways-title">' +
          '<button type="button" class="bsv-giveaways-modal__close" data-close-giveaways="1" aria-label="Close">&times;</button>' +
          '<span class="bsv-giveaways-modal__badge">Active Giveaways</span>' +
          '<h2 class="bsv-giveaways-modal__title" id="bsv-giveaways-title">Win free BlockSpin items</h2>' +
          '<p class="bsv-giveaways-modal__body">We\'ve given away <strong>tons of guns, vehicles, and Robux</strong> to the community. Join our Discord for active giveaways and enter the next drop.</p>' +
          '<a class="bsv-giveaways-modal__cta" href="' +
          DISCORD_INVITE +
          '" target="_blank" rel="noopener noreferrer">Join Discord for Giveaways →</a>' +
        "</div>" +
      "</div>"
    );
  }

  function valueListModalHtml() {
    var main = VALUE_LIST_SECTIONS.map(function (title) {
      return (
        '<button type="button" class="bsv-value-list-modal__item" data-section-go="' +
        title.replace(/"/g, "&quot;") +
        '">' +
        title +
        "</button>"
      );
    }).join("");
    var extras = VALUE_LIST_EXTRAS.map(function (title) {
      return (
        '<button type="button" class="bsv-value-list-modal__item" data-section-go="' +
        title.replace(/"/g, "&quot;") +
        '">' +
        title +
        "</button>"
      );
    }).join("");
    return (
      '<div class="bsv-value-list-modal" id="bsv-value-list-modal" hidden>' +
        '<div class="bsv-value-list-modal__backdrop" data-close-value-list="1"></div>' +
        '<div class="bsv-value-list-modal__card" role="dialog" aria-modal="true" aria-labelledby="bsv-value-list-title">' +
          '<button type="button" class="bsv-value-list-modal__close" data-close-value-list="1" aria-label="Close">&times;</button>' +
          '<h2 class="bsv-value-list-modal__title" id="bsv-value-list-title">Value List</h2>' +
          '<div class="bsv-value-list-modal__list">' +
            main +
            '<p class="bsv-value-list-modal__group">Extras</p>' +
            extras +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function initHeaderIconMenus() {
    if (!document.getElementById("bsv-giveaways-modal")) {
      var wrap = document.createElement("div");
      wrap.innerHTML = giveawaysModalHtml();
      document.body.appendChild(wrap.firstElementChild);
    }
    if (!document.getElementById("bsv-value-list-modal")) {
      var vlWrap = document.createElement("div");
      vlWrap.innerHTML = valueListModalHtml();
      document.body.appendChild(vlWrap.firstElementChild);
    }

    function closeAllMenus() {
      document.querySelectorAll(".nav-icon-menu.is-open").forEach(function (menu) {
        menu.classList.remove("is-open");
        var btn = menu.querySelector(".nav-icon-menu__btn");
        var panel = menu.querySelector(".nav-icon-menu__panel");
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (panel) panel.hidden = true;
      });
    }

    function openGiveaways() {
      closeAllMenus();
      closeValueListModal();
      var modal = document.getElementById("bsv-giveaways-modal");
      if (modal) modal.hidden = false;
    }

    function closeGiveaways() {
      var modal = document.getElementById("bsv-giveaways-modal");
      if (modal) modal.hidden = true;
    }

    function openValueListModal() {
      closeAllMenus();
      closeGiveaways();
      var modal = document.getElementById("bsv-value-list-modal");
      if (modal) modal.hidden = false;
    }

    function closeValueListModal() {
      var modal = document.getElementById("bsv-value-list-modal");
      if (modal) modal.hidden = true;
    }

    global.bsvOpenValueListMenu = function () {
      if (window.matchMedia("(max-width: 900px)").matches) {
        openValueListModal();
        return;
      }
      var menu = document.querySelector('.nav-icon-menu[data-nav-menu="value-list"]');
      var btn = menu && menu.querySelector(".nav-icon-menu__btn");
      if (btn) btn.click();
    };

    document.querySelectorAll(".nav-icon-menu").forEach(function (menu) {
      if (menu._bsvBound) return;
      menu._bsvBound = true;
      var btn = menu.querySelector(".nav-icon-menu__btn");
      var panel = menu.querySelector(".nav-icon-menu__panel");
      if (!btn) return;

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (btn.getAttribute("data-open-giveaways")) {
          openGiveaways();
          return;
        }
        var open = menu.classList.contains("is-open");
        closeAllMenus();
        if (!open && panel) {
          menu.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });

      menu.querySelectorAll("[data-section-go]").forEach(function (item) {
        item.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var title = item.getAttribute("data-section-go");
          closeAllMenus();
          if (title) goToSection(title);
        });
      });
    });

    document.querySelectorAll(".nav-live-trading-link").forEach(function (link) {
      if (link._bsvCloseMenusBound) return;
      link._bsvCloseMenusBound = true;
      link.addEventListener("click", function () {
        closeAllMenus();
        closeValueListModal();
        closeGiveaways();
      });
    });

    document.querySelectorAll("[data-open-giveaways]").forEach(function (el) {
      if (el._bsvGwBound) return;
      el._bsvGwBound = true;
      if (el.closest(".nav-icon-menu")) return;
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openGiveaways();
      });
    });

    document.querySelectorAll("[data-close-giveaways]").forEach(function (el) {
      if (el._bsvGwCloseBound) return;
      el._bsvGwCloseBound = true;
      el.addEventListener("click", function () {
        closeGiveaways();
      });
    });

    document.querySelectorAll("[data-close-value-list]").forEach(function (el) {
      if (el._bsvVlCloseBound) return;
      el._bsvVlCloseBound = true;
      el.addEventListener("click", function () {
        closeValueListModal();
      });
    });

    var vlModal = document.getElementById("bsv-value-list-modal");
    if (vlModal && !vlModal._bsvBound) {
      vlModal._bsvBound = true;
      vlModal.querySelectorAll("[data-section-go]").forEach(function (item) {
        item.addEventListener("click", function (e) {
          e.preventDefault();
          var title = item.getAttribute("data-section-go");
          closeValueListModal();
          if (title) goToSection(title);
        });
      });
    }

    if (!document._bsvNavMenusDocBound) {
      document._bsvNavMenusDocBound = true;
      document.addEventListener("click", function () {
        closeAllMenus();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          closeAllMenus();
          closeGiveaways();
          closeValueListModal();
        }
      });
    }
  }

  function ensureSponsorBannerStyles() {
    var old = document.getElementById("bsv-sponsor-banner-styles-v2");
    if (old) old.remove();
    var old3 = document.getElementById("bsv-sponsor-banner-styles-v3");
    if (old3) old3.remove();
    var old4 = document.getElementById("bsv-sponsor-banner-styles-v4");
    if (old4) old4.remove();
    if (document.getElementById("bsv-sponsor-banner-styles-v5")) return;
    var style = document.createElement("style");
    style.id = "bsv-sponsor-banner-styles-v5";
    style.textContent =
      ".bsv-sponsor-promo{display:flex;justify-content:center;width:100%;margin:12px 0 8px;padding:0;box-sizing:border-box;position:relative;left:auto!important;transform:none!important}" +
      ".bsv-sponsor-promo[hidden],.bsv-sponsor-promo.is-hidden{display:none!important}" +
      ".bsv-sponsor-promo__shell{position:relative;display:block;width:100%;max-width:800px;margin:0 auto;padding:12px 0 8px;box-sizing:border-box}" +
      ".bsv-sponsor-promo__shell::before{content:'';position:absolute;pointer-events:none;z-index:0;inset:-10% -8% -12%;border-radius:50%;background:radial-gradient(ellipse 58% 52% at 50% 42%,rgba(124,58,237,.22),rgba(91,33,182,.1) 42%,transparent 72%);filter:blur(26px);opacity:.95}" +
      "@media (prefers-reduced-motion:reduce){.bsv-sponsor-promo__shell::before{opacity:.85}}" +
      ".bsv-sponsor-promo__frame{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;margin:0 auto;padding:22px 20px 18px;border-radius:18px;background:linear-gradient(165deg,#1a1630 0%,#12101f 55%,#0e0c18 100%);border:1px solid rgba(167,139,250,.28);box-shadow:0 0 0 1px rgba(124,58,237,.08),0 14px 32px rgba(0,0,0,.42);overflow:hidden;text-align:center;box-sizing:border-box}" +
      ".bsv-sponsor-promo__frame::before,.bsv-sponsor-promo__frame::after{content:'';position:absolute;width:42%;height:1px;pointer-events:none;opacity:.4}" +
      ".bsv-sponsor-promo__frame::before{top:18px;left:-6%;background:linear-gradient(90deg,transparent,rgba(167,139,250,.8),transparent);transform:rotate(-28deg)}" +
      ".bsv-sponsor-promo__frame::after{bottom:22px;right:-6%;background:linear-gradient(90deg,transparent,rgba(76,175,30,.65),transparent);transform:rotate(-28deg)}" +
      ".bsv-sponsor-promo__logo{position:relative;z-index:1;width:72px;height:72px;object-fit:contain;display:block;margin:0 auto;image-rendering:-webkit-optimize-contrast}" +
      ".bsv-sponsor-promo__title{position:relative;z-index:1;margin:2px 0 0;font:800 clamp(1.55rem,4.5vw,2.05rem)/1.1 Poppins,system-ui,sans-serif;letter-spacing:-.02em;color:#fff}" +
      ".bsv-sponsor-promo__title span{color:#4caf1e}" +
      ".bsv-sponsor-promo__sub{position:relative;z-index:1;margin:0;max-width:34rem;font:500 0.92rem/1.45 Poppins,system-ui,sans-serif;color:#c7cce0}" +
      ".bsv-sponsor-promo__cta{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;margin-top:6px;padding:11px 26px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:linear-gradient(180deg,#62d12f 0%,#3fad1a 100%);color:#fff;font:700 0.95rem/1 Poppins,system-ui,sans-serif;letter-spacing:.03em;text-decoration:none;text-shadow:0 1px 0 rgba(0,0,0,.28);transition:transform .2s ease,filter .2s ease,border-color .2s ease;white-space:nowrap}" +
      ".bsv-sponsor-promo__cta:hover{transform:translateY(-1px);filter:brightness(1.06);border-color:rgba(255,255,255,.3)}" +
      ".bsv-sponsor-promo__cta:focus-visible{outline:2px solid #a78bfa;outline-offset:3px}" +
      ".bsv-sponsor-banner-slot{display:block;width:100%;max-width:1800px;margin:0 auto;padding:0 20px;box-sizing:border-box}" +
      "#sections > .bsv-sponsor-promo{flex:0 0 auto;width:100%;max-width:100%;padding:0;margin:8px 0 12px}" +
      ".bsv-sponsor-banner-slot:empty{display:none}";
    document.head.appendChild(style);
  }

  function renderSponsorBanner() {
    return (
      '<aside class="bsv-sponsor-promo" aria-label="Sponsorship">' +
        '<div class="bsv-sponsor-promo__shell">' +
          '<div class="bsv-sponsor-promo__frame">' +
            '<img class="bsv-sponsor-promo__logo" src="' + sitePath("assets/bsv-logo.png") + '" width="72" height="72" alt="" decoding="async">' +
            '<p class="bsv-sponsor-promo__title">Work with <span>us</span></p>' +
            '<p class="bsv-sponsor-promo__sub">Sponsor slots are open. Get your brand in front of 12,700+ active traders every month.</p>' +
            '<a class="bsv-sponsor-promo__cta" href="' + sitePath("sponsors/") + '">Work with us</a>' +
          "</div>" +
        "</div>" +
      "</aside>"
    );
  }

  function ensureSectionLtPromoStyles() {
    var oldStyles = document.getElementById("bsv-section-lt-promo-styles");
    if (oldStyles) oldStyles.remove();
    var style = document.createElement("style");
    style.id = "bsv-section-lt-promo-styles";
    style.textContent =
      ".home-lt-bar.bsv-section-lt-promo{flex:0 0 auto;display:block;width:100%;max-width:min(1100px,100%)!important;margin:2px auto 10px;padding:26px 28px 22px;box-sizing:border-box}" +
      ".bsv-section-lt-promo[hidden],.bsv-section-lt-promo.is-hidden{display:none!important}" +
      ".section > .bsv-section-lt-promo{margin-top:0}" +
      ".section > h2:first-of-type + .bsv-section-lt-promo{margin-top:0}" +
      ".bsv-section-lt-promo .home-lt-bar__new{" +
        "top:-8px;right:-8px;left:auto;" +
        "padding:8px 15px 7px;border-radius:8px;" +
        "letter-spacing:.16em;font-size:.78rem;" +
        "transform:rotate(16deg);transform-origin:center;" +
        "box-shadow:0 0 0 2px #7c2d12,0 3px 0 #9a3412;" +
        "animation:bsv-lt-new-heartbeat 4.8s ease-in-out infinite" +
      "}" +
      "@keyframes bsv-lt-new-heartbeat{" +
        "0%,100%{transform:rotate(16deg) scale(1)}" +
        "50%{transform:rotate(16deg) scale(1.055)}" +
      "}" +
      "@media (prefers-reduced-motion:reduce){.bsv-section-lt-promo .home-lt-bar__new{animation:none;transform:rotate(16deg)}}";
    document.head.appendChild(style);
  }

  function renderLiveTradingSectionPromo() {
    return (
      '<aside class="home-lt-bar bsv-section-lt-promo" aria-label="Live Trading">' +
        '<span class="home-lt-bar__new">NEW</span>' +
        "<h3>BlockSpin Live Trading</h3>" +
        "<p>Post offers, browse live deals, and message traders instantly.</p>" +
        '<div class="home-lt-bar__actions">' +
          '<a class="home-lt-bar__btn" href="' +
          sitePath("live-trading.html") +
          '">Start Trading →</a>' +
        "</div>" +
      "</aside>"
    );
  }

  function ensureLiveTradingSectionPromo() {
    ensureSectionLtPromoStyles();
    var existing = document.querySelector(".bsv-section-lt-promo");
    // Refresh older Alt-C markup so sections use the home Live Trading banner.
    if (existing && !existing.classList.contains("home-lt-bar")) {
      existing.remove();
      existing = null;
    }
    if (existing) return existing;
    var wrap = document.createElement("div");
    wrap.innerHTML = renderLiveTradingSectionPromo();
    var el = wrap.firstElementChild;
    if (!el) return null;
    var sections = document.querySelector(".main-container > #sections");
    if (sections) {
      sections.appendChild(el);
      return el;
    }
    var slot = document.getElementById("bsv-sponsor-banner-slot");
    if (slot) {
      slot.appendChild(el);
      return el;
    }
    return null;
  }

  var LT_PROMO_HIDDEN_SECTION_IDS = {
    "untradeable-items": true,
    "richest-players": true,
    "crew-logos": true,
    "live-trading": true
  };

  function getActiveItemSection() {
    var active = null;
    document.querySelectorAll("#sections > .section").forEach(function (sec) {
      if (!sec || sec.id === "home") return;
      if (sec.style.display === "none") return;
      if (sec.hidden) return;
      try {
        if (window.getComputedStyle(sec).display === "none") return;
      } catch (e) {
        return;
      }
      active = sec;
    });
    return active;
  }

  function shouldShowLiveTradingSectionPromo(active) {
    if (!active || !active.id) return false;
    try {
      var page = document.body && document.body.getAttribute("data-bsv-page");
      if (page === "live-trading") return false;
    } catch (e) {}
    return !LT_PROMO_HIDDEN_SECTION_IDS[active.id];
  }

  function placeLiveTradingPromoAtSectionTop(ltPromo) {
    if (!ltPromo) return;
    var active = getActiveItemSection();
    if (!active || !shouldShowLiveTradingSectionPromo(active)) return;
    var heading = null;
    for (var i = 0; i < active.children.length; i++) {
      if (active.children[i].tagName === "H2") {
        heading = active.children[i];
        break;
      }
    }
    // Always sit above the section title (first child, or immediately before h2).
    if (heading) {
      if (ltPromo.parentElement !== active || heading.previousElementSibling !== ltPromo) {
        active.insertBefore(ltPromo, heading);
      }
      return;
    }
    if (ltPromo.parentElement !== active || active.firstElementChild !== ltPromo) {
      active.insertBefore(ltPromo, active.firstChild);
    }
  }

  function setPromoVisible(el, on) {
    if (!el) return;
    el.hidden = !on;
    el.classList.toggle("is-hidden", !on);
  }

  // Home → sponsorship. Other value sections → Live Trading at section top.
  function alignSponsorBannerToHomeContent() {
    var promo = document.querySelector(".bsv-sponsor-promo");
    var ltPromo = ensureLiveTradingSectionPromo();
    var onHome = document.body.classList.contains("is-home");
    var sections = document.querySelector(".main-container > #sections");
    var home = document.getElementById("home");

    if (promo) {
      promo.style.left = "";
      promo.style.transform = "";
    }

    if (onHome) {
      setPromoVisible(promo, true);
      setPromoVisible(ltPromo, false);
      if (promo && sections && home && home.nextSibling !== promo) {
        sections.insertBefore(promo, home.nextSibling);
      } else if (promo && !sections) {
        var slot = document.getElementById("bsv-sponsor-banner-slot");
        if (slot && promo.parentElement !== slot) slot.appendChild(promo);
      }
      return;
    }

    setPromoVisible(promo, false);
    var active = getActiveItemSection();
    var showLt = shouldShowLiveTradingSectionPromo(active);
    setPromoVisible(ltPromo, showLt);
    if (showLt) placeLiveTradingPromoAtSectionTop(ltPromo);
  }

  function placeSponsorBanner(activePage) {
    // Values list page only. Sponsors page has its own hero CTA.
    var existing = document.querySelector(".bsv-sponsor-promo");
    var existingLt = document.querySelector(".bsv-section-lt-promo");
    if (activePage !== "home") {
      if (existing) existing.remove();
      if (existingLt) existingLt.remove();
      return;
    }
    ensureSponsorBannerStyles();
    if (existing) existing.remove();

    var wrap = document.createElement("div");
    wrap.innerHTML = renderSponsorBanner();
    var el = wrap.firstElementChild;
    if (!el) return;

    var sections = document.querySelector(".main-container > #sections");
    var home = document.getElementById("home");
    if (sections && home) {
      sections.insertBefore(el, home.nextSibling);
    } else if (sections) {
      sections.appendChild(el);
    } else {
      var slot = document.getElementById("bsv-sponsor-banner-slot");
      if (slot) slot.appendChild(el);
    }

    ensureLiveTradingSectionPromo();
    alignSponsorBannerToHomeContent();
  }

  function headerSearch() {
    return (
      '<div class="search-container is-hidden" id="header-search">' +
        '<div class="search-bar">' +
          '<input id="search" type="text" placeholder="Search items…" aria-label="Search items" />' +
          '<button type="button" class="search-reset-btn" id="search-reset" hidden aria-label="Clear search and show all items" title="Clear search and show all items">' +
            '<svg class="search-reset-btn__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>' +
              '<path d="M3 3v5h5"/>' +
            "</svg>" +
          "</button>" +
        "</div>" +
      "</div>"
    );
  }

  function navTools() {
    return (
      '<div class="nav-tools" id="nav-tools">' +
        '<button type="button" class="nav-settings-btn" id="nav-settings-btn" aria-label="Settings" aria-expanded="false" title="Settings">' +
          '<svg class="nav-settings-btn__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
            '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>' +
            '<circle cx="12" cy="12" r="3"/>' +
          '</svg>' +
        '</button>' +
      '</div>'
    );
  }

  function renderHeader(activePage) {
    // Same home header on every page (login + settings) so logged-in / logged-out
    // visitors always get identical chrome HTML — auth only fills #nav-login after load.
    var isHome = activePage === "home";
    var login = '<div class="nav-login" id="nav-login"></div>';
    var brandHref = isHome ? "#" : sitePath("");
    var brandOnclick = isHome ? ' onclick="if(typeof showSection===\'function\'){showSection(\'Home\');} return false;"' : "";
    var search = isHome ? headerSearch() : "";
    return (
      '<header class="site-header-shell">' +
        '<nav class="top-navbar">' +
          '<div class="nav-container-full">' +
            '<div class="nav-left">' +
              '<a href="' + brandHref + '" class="nav-brand"' + brandOnclick + ">" +
                '<img src="' + sitePath("assets/bsv-logo.png") + '" alt="BlockSpin Values Logo" class="nav-logo-img" width="60" height="60" decoding="async">' +
                '<span class="nav-title">Block<span class="brand-spin">Spin</span> Values</span>' +
              "</a>" +
              navValueListMenu() +
              navLiveTradingLink(activePage) +
              navGiveawaysMenu() +
            "</div>" +
            search +
            '<div class="nav-right">' +
              (THEMES_DISABLED ? "" : themeSwitcher()) +
              SOCIAL +
              '<span class="nav-right-divider" aria-hidden="true"></span>' +
              navTools() +
              login +
            "</div>" +
          "</div>" +
        "</nav>" +
      "</header>" +
      '<div class="site-mobile-below-header">' +
        '<nav class="header-subnav" aria-label="Site pages">' +
          '<button type="button" class="header-subnav__btn" data-open-value-list="1">Value List</button>' +
          '<span class="header-subnav__sep" aria-hidden="true">·</span>' +
          navLink(sitePath("live-trading.html"), "Live Trading", activePage, "live-trading") +
          '<span class="header-subnav__sep" aria-hidden="true">·</span>' +
          '<button type="button" class="header-subnav__btn" data-open-giveaways="1">Giveaways</button>' +
        "</nav>" +
        '<div class="nav-mobile-toolbar is-active" aria-label="Mobile shortcuts"></div>' +
      "</div>"
    );
  }

  function settingsModalHtml() {
    return (
      '<div class="site-settings-modal" id="site-settings-modal" hidden>' +
        '<div class="site-settings-modal__backdrop" id="site-settings-backdrop"></div>' +
        '<div class="site-settings-modal__box" role="dialog" aria-modal="true" aria-labelledby="site-settings-title">' +
          '<div class="site-settings-modal__head">' +
            '<h2 class="site-settings-modal__title" id="site-settings-title" data-i18n="settings.title">Settings</h2>' +
            '<button type="button" class="site-settings-modal__close" id="site-settings-close" data-i18n-aria="settings.close" aria-label="Close settings">&times;</button>' +
          "</div>" +
          '<div class="site-settings-modal__body">' +
            '<section class="site-settings-section">' +
              '<h3 class="site-settings-section__title" data-i18n="settings.language">Language</h3>' +
              '<div class="site-settings-segmented site-settings-segmented--lang" role="group" data-i18n-aria="settings.ariaLanguage" aria-label="Language">' +
                '<button type="button" class="site-settings-segment" data-lang="en">English</button>' +
                '<button type="button" class="site-settings-segment" data-lang="fr">Français</button>' +
                '<button type="button" class="site-settings-segment" data-lang="es">Español</button>' +
              "</div>" +
            "</section>" +
            '<section class="site-settings-section">' +
              '<h3 class="site-settings-section__title" data-i18n="settings.font">Font</h3>' +
              '<div class="site-settings-font-grid" id="font-picker-grid" role="listbox" data-i18n-aria="settings.ariaFont" aria-label="Font"></div>' +
            "</section>" +
            '<section class="site-settings-section">' +
              '<h3 class="site-settings-section__title">Style</h3>' +
              '<div class="site-settings-segmented site-settings-segmented--style" role="group" aria-label="Background style">' +
                '<button type="button" class="site-settings-segment is-active" data-bg-style="standard">Standard</button>' +
                '<button type="button" class="site-settings-segment" data-bg-style="dark">Dark</button>' +
                '<button type="button" class="site-settings-segment" data-bg-style="colorized">Colorized</button>' +
              "</div>" +
            "</section>" +
            '<section class="site-settings-section site-settings-color-row" id="site-settings-color-row" hidden>' +
              '<h3 class="site-settings-section__title">Color</h3>' +
              '<label class="site-settings-visually-hidden" for="bsv-bg-hue">Background color</label>' +
              '<input type="range" id="bsv-bg-hue" class="site-settings-hue" min="0" max="360" value="210" step="1" aria-label="Background hue" />' +
            "</section>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function ensureSettingsModal() {
    if (document.getElementById("site-settings-modal")) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = settingsModalHtml();
    var modal = wrap.firstElementChild;
    if (!modal) return;
    var header = document.querySelector(".site-header-shell");
    if (header && header.parentNode) {
      header.parentNode.insertBefore(modal, header.nextSibling);
    } else {
      document.body.insertBefore(modal, document.body.firstChild);
    }
  }

  function hasScriptFile(fileName) {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute("src") || "";
      if (src.indexOf(fileName) !== -1) return true;
    }
    return false;
  }

  function loadScriptOnce(fileName, version) {
    if (hasScriptFile(fileName)) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = sitePath(fileName) + (version ? "?v=" + version : "");
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("failed_load_" + fileName)); };
      document.head.appendChild(s);
    });
  }

  // Keep chrome-injected deps on the same cache-bust as the page build id.
  var CHROME_ASSET_V =
    (typeof window !== "undefined" && window.BSV_BUILD) || "20260930-sync";

  function ensureHomeHeaderDeps() {
    ensureSettingsModal();
    // Load in order so settings/auth always attach to the same header shell.
    return loadScriptOnce("site-i18n.js", CHROME_ASSET_V)
      .then(function () { return loadScriptOnce("auth.js", CHROME_ASSET_V); })
      .then(function () { return loadScriptOnce("site-settings.js", CHROME_ASSET_V); })
      .catch(function (err) {
        try { console.warn("BSV chrome deps:", err); } catch (_) {}
      });
  }

  function footerSideNavBlock() {
    return (
      '<div class="footer-side-nav">' +
        '<div class="footer-side-nav__group" aria-label="About">' +
          '<p class="footer-side-nav__title">About</p>' +
          '<ul class="footer-side-nav__list">' +
            '<li><a class="footer-side-nav__link" href="' + sitePath("x-about.html") + '">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' +
              "<span>About Us</span></a></li>" +
            '<li><a class="footer-side-nav__link" href="' + sitePath("sponsors/") + '">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 9.2 8.6 2 9.2l5.4 4.6L5.6 22 12 18.2 18.4 22l-1.8-8.2L22 9.2l-7.2-.6L12 2z"/></svg>' +
              "<span>Sponsors</span></a></li>" +
            '<li><a class="footer-side-nav__link" href="' + sitePath("x-faq.html") + '">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>' +
              "<span>FAQ</span></a></li>" +
          "</ul>" +
        "</div>" +
        '<div class="footer-side-nav__group" aria-label="Legal">' +
          '<p class="footer-side-nav__title">Legal</p>' +
          '<ul class="footer-side-nav__list">' +
            '<li><a class="footer-side-nav__link" href="' + sitePath("z-terms.html") + '">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>' +
              "<span>Terms of Service</span></a></li>" +
            '<li><a class="footer-side-nav__link" href="' + sitePath("z-privacy.html") + '">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>' +
              "<span>Privacy Policy</span></a></li>" +
            '<li><a class="footer-side-nav__link" href="' + sitePath("z-cookie.html") + '">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm5 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>' +
              "<span>Cookie Policy</span></a></li>" +
          "</ul>" +
        "</div>" +
        '<div class="footer-side-nav__group" aria-label="Contact">' +
          '<p class="footer-side-nav__title">Contact</p>' +
          '<ul class="footer-side-nav__list">' +
            '<li><a class="footer-side-nav__link" href="' + sitePath("z-contact.html") + '">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>' +
              "<span>Contact</span></a></li>" +
            '<li><a class="footer-side-nav__link" href="https://discord.gg/blockspinvalues?utm_source=blockspinvalues&utm_medium=referral&utm_campaign=site&utm_content=footer" target="_blank" rel="noopener noreferrer">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.445.865-.608 1.25-1.845-.276-3.68-.276-5.487 0-.164-.393-.406-.874-.618-1.25a.077.077 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 0 0 .031.056c2.053 1.508 4.041 2.423 5.993 3.029a.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106c-.653-.248-1.274-.55-1.872-.892a.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.007.128 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.95-1.522 6.002-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z"/></svg>' +
              "<span>Discord</span></a></li>" +
          "</ul>" +
        "</div>" +
      "</div>"
    );
  }

  function renderFooter(activePage) {
    var copy = "© 2026 BlockSpin Values";
    // Boosters sit above the footer element so they are not on the footer background.
    return (
      '<section class="footer-boosters" id="footer-boosters" aria-label="Current Discord boosters" hidden>' +
        '<h3 class="footer-boosters-title">Special Thanks to our Discord Server Boosters</h3>' +
        '<div class="footer-boosters-viewport">' +
          '<div class="footer-boosters-track" id="footer-boosters-track"></div>' +
        "</div>" +
      "</section>" +
      '<footer class="site-footer">' +
        '<div class="footer-content">' +
          "<p>" + copy + "</p>" +
        "</div>" +
        footerSideNavBlock() +
      "</footer>"
    );
  }

  function initMobileHeaderToolbar() {
    var toolbar = document.querySelector(".nav-mobile-toolbar");
    var tools = document.getElementById("nav-tools");
    var navRight = document.querySelector(".nav-right");
    var login = document.getElementById("nav-login");
    if (!toolbar || !tools || !navRight) return;

    var mq = window.matchMedia("(max-width: 900px)");

    function apply() {
      if (mq.matches) {
        if (tools.parentElement !== toolbar) {
          toolbar.appendChild(tools);
        }
        if (login && login.parentElement !== navRight) {
          navRight.appendChild(login);
        }
        toolbar.classList.add("is-active");
      } else {
        if (tools.parentElement !== navRight) {
          navRight.insertBefore(tools, login || null);
        }
        if (login && login.parentElement !== navRight) {
          navRight.appendChild(login);
        }
        toolbar.classList.remove("is-active");
      }
      fitNavBrandTitle();
    }

    apply();
    mq.addEventListener("change", apply);
  }

  var navBrandFitTimer = null;
  var navBrandFitBound = false;

  /** Scale "BlockSpin Values" so it never ellipsizes on phones. */
  function fitNavBrandTitle() {
    var title = document.querySelector(".nav-title");
    var brand = document.querySelector(".nav-brand");
    var container = document.querySelector(".nav-container-full");
    var right = document.querySelector(".nav-right");
    if (!title || !brand || !container) return;

    if (!window.matchMedia("(max-width: 900px)").matches) {
      title.style.fontSize = "";
      if (brand.querySelector(".nav-logo-img")) {
        brand.querySelector(".nav-logo-img").style.height = "";
      }
      return;
    }

    var logo = brand.querySelector(".nav-logo-img");
    var rightW = right ? Math.ceil(right.getBoundingClientRect().width) : 0;
    var styles = window.getComputedStyle(container);
    var pad =
      (parseFloat(styles.paddingLeft) || 0) +
      (parseFloat(styles.paddingRight) || 0);
    var gap = parseFloat(styles.gap) || 8;
    var logoW = logo ? Math.ceil(logo.getBoundingClientRect().width) : 0;
    var avail = Math.floor(container.clientWidth - rightW - logoW - pad - gap - 6);
    if (!Number.isFinite(avail) || avail < 72) avail = 72;

    var maxPx = Math.min(30, Math.max(17, window.innerWidth * 0.054));
    var minPx = window.innerWidth <= 360 ? 12.5 : 13.5;
    title.style.whiteSpace = "nowrap";
    title.style.overflow = "visible";
    title.style.textOverflow = "clip";

    var lo = minPx;
    var hi = maxPx;
    var best = minPx;
    for (var i = 0; i < 14; i++) {
      var mid = (lo + hi) / 2;
      title.style.fontSize = mid + "px";
      if (title.scrollWidth <= avail + 0.5) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    title.style.fontSize = best.toFixed(2) + "px";

    // If still overflowing at the floor, shrink the logo a touch.
    if (logo && title.scrollWidth > avail + 1) {
      var logoH = Math.max(28, Math.round(logo.getBoundingClientRect().height - 4));
      logo.style.height = logoH + "px";
      logoW = Math.ceil(logo.getBoundingClientRect().width);
      avail = Math.floor(container.clientWidth - rightW - logoW - pad - gap - 6);
      title.style.fontSize = minPx + "px";
      if (title.scrollWidth > avail + 1) {
        // last resort: keep shrinking type a little more
        var tiny = minPx;
        while (tiny > 11 && title.scrollWidth > avail + 1) {
          tiny -= 0.5;
          title.style.fontSize = tiny + "px";
        }
      }
    }
  }

  function scheduleFitNavBrandTitle() {
    if (navBrandFitTimer) window.clearTimeout(navBrandFitTimer);
    navBrandFitTimer = window.setTimeout(function () {
      navBrandFitTimer = null;
      fitNavBrandTitle();
    }, 40);
  }

  function bindNavBrandTitleFit() {
    if (navBrandFitBound) {
      scheduleFitNavBrandTitle();
      return;
    }
    navBrandFitBound = true;
    window.addEventListener("resize", scheduleFitNavBrandTitle);
    window.addEventListener("orientationchange", scheduleFitNavBrandTitle);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleFitNavBrandTitle).catch(function () {});
    }
    var login = document.getElementById("nav-login");
    if (login && typeof MutationObserver !== "undefined") {
      var mo = new MutationObserver(scheduleFitNavBrandTitle);
      mo.observe(login, { childList: true, subtree: true, attributes: true });
    }
    scheduleFitNavBrandTitle();
    // Auth / layout often settles a beat later.
    window.setTimeout(scheduleFitNavBrandTitle, 120);
    window.setTimeout(scheduleFitNavBrandTitle, 400);
  }

  function mount(activePage) {
    if (THEMES_DISABLED) {
      try {
        document.body.classList.add("themes-disabled");
        document.body.removeAttribute("data-theme");
      } catch (_) {}
    }
    var headerMount = document.getElementById("bsv-site-header");
    var footerMount = document.getElementById("bsv-site-footer");
    if (headerMount) headerMount.outerHTML = renderHeader(activePage || "");
    if (footerMount) footerMount.innerHTML = renderFooter(activePage || "");
    placeSponsorBanner(activePage || "");
    var boostersSlot = document.getElementById("bsv-discord-boosters-slot");
    var boosters = document.getElementById("footer-boosters");
    if (boostersSlot && boosters) boostersSlot.appendChild(boosters);
    initMobileHeaderToolbar();
    bindNavBrandTitleFit();
    initHeaderIconMenus();
    ensureHomeHeaderDeps();
    initConsent();
    initFooterBoostersLazy();
    rewriteRootAbsoluteAssets(document);

    document.querySelectorAll("[data-open-value-list]").forEach(function (el) {
      if (el._bsvVlBound) return;
      el._bsvVlBound = true;
      el.addEventListener("click", function (e) {
        e.preventDefault();
        if (typeof global.bsvOpenValueListMenu === "function") {
          global.bsvOpenValueListMenu();
        }
      });
    });
  }

  function ensureProjectPageFavicons() {
    var root = siteRoot();
    if (root === "/") return;
    var have = document.querySelector('link[rel="icon"][href*="favicon"]');
    if (have && String(have.getAttribute("href") || "").indexOf(root) === 0) return;
    // Replace root-absolute icons that 404 on GitHub project Pages.
    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(function (el) {
      var href = el.getAttribute("href") || "";
      if (href.charAt(0) === "/" && href.indexOf(root) !== 0) {
        el.setAttribute("href", root + href.slice(1));
      }
    });
  }

  function shrinkDiscordAvatarUrl(url) {
    try {
      var u = new URL(String(url || ""), window.location.origin);
      if (!/cdn\.discordapp\.com|media\.discordapp\.net/i.test(u.hostname)) return String(url || "");
      // Animated GIF avatars are often 100–700KB; force a tiny static still.
      u.pathname = u.pathname.replace(/\.gif$/i, ".webp");
      if (/\/avatars\//i.test(u.pathname) && !/\.[a-z0-9]+$/i.test(u.pathname)) {
        u.pathname += ".webp";
      }
      u.searchParams.set("size", "32");
      return u.toString();
    } catch (_) {
      return String(url || "");
    }
  }

  function escapeBoostHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initFooterBoostersLazy() {
    var footer = document.getElementById("footer-boosters");
    var track = document.getElementById("footer-boosters-track");
    if (!footer || !track || footer.dataset.bsvBoostersInit === "1") return;
    footer.dataset.bsvBoostersInit = "1";

    var apiBase =
      (typeof window.bsvBotApiUrl === "function" && window.bsvBotApiUrl("api/boosters")) ||
      "https://bsv-bot-production.up.railway.app/api/boosters";

    function renderBoosters(boosters) {
      if (!boosters.length) return;
      var html = boosters
        .map(function (b) {
          var name = escapeBoostHtml(b && b.name ? b.name : "Unknown");
          var avatar = escapeBoostHtml(shrinkDiscordAvatarUrl(b && b.avatarUrl));
          return (
            '<article class="footer-booster-card" aria-label="' +
            name +
            '">' +
            '<img src="' +
            avatar +
            '" alt="" width="23" height="23" loading="lazy" decoding="async" fetchpriority="low" />' +
            "<span>" +
            name +
            "</span></article>"
          );
        })
        .join("");
      // Second copy for marquee; browser cache means no extra network after first paint.
      track.innerHTML = html + html;
      footer.hidden = false;
    }

    function load() {
      if (footer.dataset.bsvBoostersLoaded === "1") return;
      footer.dataset.bsvBoostersLoaded = "1";
      fetch(apiBase, { cache: "default" })
        .then(function (res) {
          if (!res.ok) throw new Error("boosters " + res.status);
          return res.json();
        })
        .then(function (data) {
          var list = Array.isArray(data && data.boosters) ? data.boosters : [];
          renderBoosters(list);
        })
        .catch(function () {
          // Allow a later retry (e.g. after nav) if the first fetch fails.
          delete footer.dataset.bsvBoostersLoaded;
        });
    }

    function scheduleLoad() {
      if (footer.dataset.bsvBoostersScheduled === "1") return;
      footer.dataset.bsvBoostersScheduled = "1";
      // Small idle defer so LCP still wins, but do not depend on intersecting a
      // [hidden] node (display:none never intersects → boosters never appeared).
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(function () { setTimeout(load, 400); }, { timeout: 2000 });
      } else {
        setTimeout(load, 1200);
      }
    }

    // Observe a visible footer sentinel — #footer-boosters starts hidden.
    var observeTarget =
      document.querySelector(".site-footer") ||
      document.getElementById("bsv-site-footer") ||
      footer.parentElement ||
      footer;

    if ("IntersectionObserver" in window && observeTarget) {
      var io = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              io.disconnect();
              scheduleLoad();
              break;
            }
          }
        },
        { rootMargin: "240px 0px" }
      );
      io.observe(observeTarget);
      // Safety net if the sentinel never intersects (short pages / odd layout).
      setTimeout(scheduleLoad, 6000);
    } else {
      scheduleLoad();
    }
  }

  function autoMount() {
    ensureProjectPageFavicons();
    rewriteRootAbsoluteAssets(document);
    var page = document.body.getAttribute("data-bsv-page") || "";
    if (document.getElementById("bsv-site-header") || document.getElementById("bsv-site-footer")) {
      mount(page);
    } else {
      initConsent();
    }
    var cookieSettings = document.getElementById("bsv-cookie-settings");
    if (cookieSettings && !cookieSettings.dataset.bsvBound) {
      cookieSettings.dataset.bsvBound = "1";
      cookieSettings.addEventListener("click", function (e) {
        e.preventDefault();
        openConsentSettings();
      });
    }
  }

  // Anonymous site presence so "Members online" can include people on the website.
  // Prefer script.js helper when available (home also combines Discord counts).
  var presenceTimer = 0;
  function botPublicBase() {
    try {
      if (typeof window.BSV_BOT_PUBLIC_BASE === "string" && window.BSV_BOT_PUBLIC_BASE) {
        return String(window.BSV_BOT_PUBLIC_BASE).replace(/\/+$/, "");
      }
    } catch (_) {}
    return "https://bsv-bot-production.up.railway.app";
  }
  function presenceVisitorId() {
    var id = "";
    try {
      id = localStorage.getItem("bsv_presence_id") || "";
    } catch (_) {}
    if (id && /^[a-zA-Z0-9_-]{8,80}$/.test(id)) return id;
    id =
      "v_" +
      Math.random().toString(36).slice(2, 10) +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8);
    try {
      localStorage.setItem("bsv_presence_id", id);
    } catch (_) {}
    return id;
  }
  function sendPresenceHeartbeat() {
    if (typeof window.bsvStartSitePresence === "function") {
      window.bsvStartSitePresence();
      return;
    }
    fetch(botPublicBase() + "/api/presence/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: presenceVisitorId() }),
      keepalive: true,
      cache: "no-store"
    })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        if (data && data.id) {
          try {
            localStorage.setItem("bsv_presence_id", String(data.id));
          } catch (_) {}
        }
      })
      .catch(function () {});
  }
  function startPresenceFromChrome() {
    if (presenceTimer) return;
    var tries = 0;
    function attempt() {
      // Prefer script.js on home (also merges Discord + site into Members online).
      if (typeof window.bsvStartSitePresence === "function") {
        window.bsvStartSitePresence();
        return;
      }
      tries += 1;
      if (tries < 25) {
        setTimeout(attempt, 80);
        return;
      }
      // Pages without script.js still count toward website presence.
      if (presenceTimer) return;
      sendPresenceHeartbeat();
      presenceTimer = setInterval(sendPresenceHeartbeat, 25000);
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) sendPresenceHeartbeat();
      });
    }
    attempt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
    document.addEventListener("DOMContentLoaded", startPresenceFromChrome);
  } else {
    autoMount();
    startPresenceFromChrome();
  }

  window.addEventListener("resize", function () {
    alignSponsorBannerToHomeContent();
    scheduleFitNavBrandTitle();
  });

  global.bsvMountSiteChrome = mount;
  global.bsvInitMobileHeaderToolbar = initMobileHeaderToolbar;
  global.initMobileHeaderToolbar = initMobileHeaderToolbar;
  global.bsvFitNavBrandTitle = fitNavBrandTitle;
  global.bsvHasMarketingConsent = hasMarketingConsent;
  global.bsvOpenCookieSettings = openConsentSettings;
  global.bsvPlaceSponsorBanner = placeSponsorBanner;
  global.bsvAlignSponsorBanner = alignSponsorBannerToHomeContent;
})(typeof window !== "undefined" ? window : globalThis);
