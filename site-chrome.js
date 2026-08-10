(function (global) {
  "use strict";

  var CONSENT_KEY = "bsv-cookie-consent";
  var GA_ID = "G-0T25993BCC";
  var MONETAG_SRC = "https://quge5.com/88/tag.min.js";
  var MONETAG_ZONE = "268935";

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

  function ensureMonetag() {
    try {
      if (!hasMarketingConsent()) return;
      if (document.querySelector('script[src*="quge5.com/88/tag.min.js"]:not([type="text/plain"])')) {
        return;
      }
      var placeholder = document.querySelector(
        'script[type="text/plain"][data-bsv-consent="marketing"][src*="quge5.com/88/tag.min.js"]'
      );
      var s = document.createElement("script");
      s.setAttribute("data-cfasync", "false");
      s.async = true;
      s.src = (placeholder && placeholder.getAttribute("src")) || MONETAG_SRC;
      s.setAttribute(
        "data-zone",
        (placeholder && placeholder.getAttribute("data-zone")) || MONETAG_ZONE
      );
      document.head.appendChild(s);
    } catch (_) {}
  }

  function ensureAnalytics() {
    try {
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
        window.gtag("config", GA_ID, { anonymize_ip: true, send_page_view: true });
      }
    } catch (_) {}
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
          if (/\/sw\.js(\?|$)/.test(url) || /5gvci\.com|quge5\.com/.test(url)) {
            reg.unregister().catch(function () {});
          }
        });
      });
    } catch (_) {}
  }

  function applyConsent(value) {
    setConsent(value);
    var banner = document.getElementById("bsv-consent-banner");
    if (banner) banner.remove();
    if (value === "accepted") {
      ensureAnalytics();
      ensureMonetag();
    } else {
      unregisterMonetagServiceWorker();
    }
  }

  function ensureConsentStyles() {
    if (document.getElementById("bsv-consent-styles")) return;
    var style = document.createElement("style");
    style.id = "bsv-consent-styles";
    style.textContent =
      "#bsv-consent-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:100000;max-width:720px;margin:0 auto;padding:18px 20px;border-radius:16px;background:rgba(12,18,30,.97);border:1px solid rgba(255,255,255,.14);box-shadow:0 16px 48px rgba(0,0,0,.5);color:#e8eef8;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}" +
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
    el.setAttribute("aria-label", "Cookie and advertising consent");
    el.innerHTML =
      "<p>We use cookies for site analytics and ads (Monetag). The values list still works if you say no. Details in our <a href=\"z-privacy.html\">Privacy Policy</a>.</p>" +
      '<div id="bsv-consent-actions">' +
      '<button type="button" id="bsv-consent-accept">Accept</button>' +
      '<button type="button" id="bsv-consent-reject">Reject non-essential</button>' +
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
    var choice = getConsent();
    if (choice === "accepted") {
      ensureAnalytics();
      ensureMonetag();
      return;
    }
    if (choice === "rejected") {
      unregisterMonetagServiceWorker();
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
    '<a href="https://discord.gg/QbapryYUUx" target="_blank" rel="noopener noreferrer" class="nav-discord" data-nav-tip="Join our Discord server!" title="Join our Discord server!" aria-label="Join our Discord server!">' +
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
    var dev = isDevSite();
    var isHome = activePage === "home";
    var login = (dev || isHome) ? '<div class="nav-login" id="nav-login"></div>' : "";
    var brandHref = isHome ? "#" : "/";
    var brandOnclick = isHome ? ' onclick="showSection(\'Home\'); return false;"' : "";
    var search = isHome ? headerSearch() : "";
    return (
      '<header class="site-header-shell">' +
        '<nav class="top-navbar">' +
          '<div class="nav-container-full">' +
            '<div class="nav-left">' +
              '<a href="' + brandHref + '" class="nav-brand"' + brandOnclick + ">" +
                '<img src="https://i.ibb.co/VYjk9L14/Block-Spin-Values-Logo.png" alt="BlockSpin Values Logo" class="nav-logo-img">' +
                '<span class="nav-title">Block<span class="brand-spin">Spin</span> Values</span>' +
              "</a>" +
              navLink("x-about.html", "About Us", activePage, "about") +
              navLink("x-faq.html", "FAQ", activePage, "faq") +
            "</div>" +
            search +
            '<div class="nav-right">' +
              themeSwitcher() +
              SOCIAL +
              (isHome ? '<span class="nav-right-divider" aria-hidden="true"></span>' + navTools() : '') +
              login +
            "</div>" +
          "</div>" +
        "</nav>" +
      "</header>" +
      '<div class="site-mobile-below-header">' +
        '<nav class="header-subnav" aria-label="Site pages">' +
          navLink("x-about.html", "About Us", activePage, "about") +
          '<span class="header-subnav__sep" aria-hidden="true">·</span>' +
          navLink("x-faq.html", "FAQ", activePage, "faq") +
        "</nav>" +
        '<div class="nav-mobile-toolbar' + (isHome ? ' is-active' : '') + '" aria-label="Mobile shortcuts"></div>' +
      "</div>"
    );
  }

  function footerSideNavBlock() {
    return (
      '<div class="footer-side-nav">' +
        '<div class="footer-side-nav__group" aria-label="Contact">' +
          '<p class="footer-side-nav__title">Contact</p>' +
          '<ul class="footer-side-nav__list">' +
            '<li><a class="footer-side-nav__link" href="mailto:riverytacc11@gmail.com">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>' +
              "<span>Email</span></a></li>" +
            '<li><a class="footer-side-nav__link" href="https://discord.gg/blockspinvalues" target="_blank" rel="noopener noreferrer">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.445.865-.608 1.25-1.845-.276-3.68-.276-5.487 0-.164-.393-.406-.874-.618-1.25a.077.077 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 0 0 .031.056c2.053 1.508 4.041 2.423 5.993 3.029a.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106c-.653-.248-1.274-.55-1.872-.892a.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.007.128 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.95-1.522 6.002-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z"/></svg>' +
              "<span>Discord</span></a></li>" +
          "</ul>" +
        "</div>" +
        '<div class="footer-side-nav__group" aria-label="Legal">' +
          '<p class="footer-side-nav__title">Legal</p>' +
          '<ul class="footer-side-nav__list">' +
            '<li><a class="footer-side-nav__link" href="z-terms.html">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>' +
              "<span>Terms of Service</span></a></li>" +
            '<li><a class="footer-side-nav__link" href="z-privacy.html">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>' +
              "<span>Privacy Policy</span></a></li>" +
            '<li><a class="footer-side-nav__link" href="#" id="bsv-cookie-settings">' +
              '<svg class="footer-side-nav__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>' +
              "<span>Cookie settings</span></a></li>" +
          "</ul>" +
        "</div>" +
      "</div>"
    );
  }

  function renderFooter() {
    var copy = "© 2026 BlockSpin Values";
    return (
      '<footer class="site-footer">' +
        '<section class="footer-boosters" id="footer-boosters" aria-label="Current Discord boosters" hidden>' +
          '<h3 class="footer-boosters-title">Special Thanks to our Discord Server Boosters</h3>' +
          '<div class="footer-boosters-viewport">' +
            '<div class="footer-boosters-track" id="footer-boosters-track"></div>' +
          "</div>" +
        "</section>" +
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
    }

    apply();
    mq.addEventListener("change", apply);
  }

  function mount(activePage) {
    var headerMount = document.getElementById("bsv-site-header");
    var footerMount = document.getElementById("bsv-site-footer");
    if (headerMount) headerMount.outerHTML = renderHeader(activePage || "");
    if (footerMount) footerMount.innerHTML = renderFooter();
    var boostersSlot = document.getElementById("bsv-discord-boosters-slot");
    var boosters = document.getElementById("footer-boosters");
    if (boostersSlot && boosters) boostersSlot.appendChild(boosters);
    initMobileHeaderToolbar();
    var cookieSettings = document.getElementById("bsv-cookie-settings");
    if (cookieSettings) {
      cookieSettings.addEventListener("click", function (e) {
        e.preventDefault();
        openConsentSettings();
      });
    }
    initConsent();
  }

  function autoMount() {
    var page = document.body.getAttribute("data-bsv-page") || "";
    if (document.getElementById("bsv-site-header") || document.getElementById("bsv-site-footer")) {
      mount(page);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }

  global.bsvMountSiteChrome = mount;
  global.bsvInitMobileHeaderToolbar = initMobileHeaderToolbar;
  global.initMobileHeaderToolbar = initMobileHeaderToolbar;
  global.bsvHasMarketingConsent = hasMarketingConsent;
  global.bsvOpenCookieSettings = openConsentSettings;
})(typeof window !== "undefined" ? window : globalThis);
