(function () {
  var AUTH_TOKEN_KEY = "bsv-discord-auth";
  var OAUTH_RETURN_KEY = "bsv-oauth-return-to";
  var logoutTestObserver = null;

  function apiBase() {
    if (typeof window.bsvBotApiUrl === "function") return window.bsvBotApiUrl("");
    if (window.BSV_BOT_PUBLIC_BASE) return String(window.BSV_BOT_PUBLIC_BASE).replace(/\/+$/, "");
    return "https://bsv-bot-production.up.railway.app";
  }

  function authUrl(path) {
    var base = apiBase();
    var p = String(path || "").replace(/^\/+/, "");
    return p ? base + "/" + p : base;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  function getAuthToken() {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (_) {
      return null;
    }
  }

  function setAuthToken(token) {
    try {
      if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
      else localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (_) {}
  }

  function saveOAuthReturnTo() {
    var url = window.location.href.split("#")[0];
    try {
      sessionStorage.setItem(OAUTH_RETURN_KEY, url);
      if (!isTestSite()) {
        localStorage.setItem(OAUTH_RETURN_KEY, url);
      }
    } catch (_) {}
  }

  function clearOAuthReturnTo() {
    try {
      sessionStorage.removeItem(OAUTH_RETURN_KEY);
      localStorage.removeItem(OAUTH_RETURN_KEY);
    } catch (_) {}
  }

  function isDevSite() {
    if (document.documentElement && document.documentElement.dataset.bsvEnv === "test") return true;
    return !!document.querySelector('meta[name="bsv-env"][content="test"]');
  }

  function isTestSite() {
    if (isDevSite()) return true;
    var host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    return /\.github\.io$/i.test(host);
  }

  var MAIN_SITE_ORIGINS = {
    "https://blockspinvalues.com": true,
    "https://www.blockspinvalues.com": true
  };

  function isMainLiveSite() {
    var host = window.location.hostname;
    return host === "blockspinvalues.com" || host === "www.blockspinvalues.com";
  }

  function purgeStaleMainReturnUrl() {
    if (!isTestSite()) return;
    try {
      var stored = localStorage.getItem(OAUTH_RETURN_KEY);
      if (!stored) return;
      if (MAIN_SITE_ORIGINS[new URL(stored).origin]) {
        localStorage.removeItem(OAUTH_RETURN_KEY);
      }
    } catch (_) {}
  }

  purgeStaleMainReturnUrl();

  function warnIfLoggedInOnWrongSite() {
    if (isTestSite()) return;
    var token = getAuthToken();
    if (!token) return;
    var banner = document.getElementById("auth-wrong-site-banner");
    if (banner) return;
    banner = document.createElement("div");
    banner.id = "auth-wrong-site-banner";
    banner.setAttribute("role", "alert");
    banner.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:100000;padding:14px 18px;background:#7a1f1f;color:#fff;text-align:center;font:600 0.95rem/1.4 system-ui,sans-serif;border-bottom:2px solid #ff6b6b;";
    banner.textContent =
      "You are on the live site, not the dev copy. Open http://localhost:5500 for your latest changes.";
    document.documentElement.appendChild(banner);
  }

  function parseAuthHash() {
    var hash = window.location.hash || "";
    var justLoggedIn = false;

    if (hash.indexOf("bsv_auth_error=") !== -1) {
      clearOAuthReturnTo();
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return false;
    }

    if (hash.indexOf("bsv_auth=") !== -1) {
      var match = hash.match(/bsv_auth=([^&]+)/);
      if (match && match[1]) {
        var token = decodeURIComponent(match[1]);
        var savedReturn = null;
        try {
          savedReturn = sessionStorage.getItem(OAUTH_RETURN_KEY);
        } catch (_) {}
        if (isMainLiveSite() && savedReturn) {
          try {
            var savedUrl = new URL(savedReturn.split("#")[0]);
            var savedHost = savedUrl.hostname;
            var isSavedTest =
              savedHost === "localhost" ||
              savedHost === "127.0.0.1" ||
              /\.github\.io$/i.test(savedHost);
            if (isSavedTest && savedUrl.origin !== window.location.origin) {
              window.location.replace(savedReturn.split("#")[0] + "#bsv_auth=" + encodeURIComponent(token));
              return false;
            }
          } catch (_) {}
        }
        setAuthToken(token);
        justLoggedIn = true;
      }
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    if (justLoggedIn) clearOAuthReturnTo();
    return justLoggedIn;
  }

  function startDiscordLogin() {
    saveOAuthReturnTo();
    var returnTo = window.location.href.split("#")[0];
    window.location.href = authUrl("api/auth/discord?return_to=" + encodeURIComponent(returnTo));
  }

  function logoutDiscord() {
    setAuthToken(null);
    clearOAuthReturnTo();
    dismissWelcomeBanner();
    fetch(authUrl("api/auth/logout"), { method: "POST" }).catch(function () {});
    renderNavLogin(null);
  }

  function fetchAuthUser() {
    var token = getAuthToken();
    if (!token) return Promise.resolve(null);
    return fetch(authUrl("api/auth/me"), {
      headers: { Authorization: "Bearer " + token }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("auth_me_failed");
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.loggedIn || !data.user) {
          setAuthToken(null);
          return null;
        }
        return data.user;
      })
      .catch(function () {
        setAuthToken(null);
        return null;
      });
  }

  function closeLoginMenu() {
    var menu = document.getElementById("nav-login-menu");
    if (menu) menu.hidden = true;
  }

  function removeLogoutTestButton() {
    document.querySelectorAll("#nav-logout-test, .nav-logout-test").forEach(function (el) {
      el.remove();
    });
    document.querySelectorAll(".top-navbar .nav-container-full button").forEach(function (btn) {
      if (/^\s*logout\s+test\s*$/i.test(String(btn.textContent || ""))) btn.remove();
    });
  }

  function watchForLogoutTestButton() {
    if (logoutTestObserver || typeof MutationObserver === "undefined") return;
    var container = document.querySelector(".top-navbar .nav-container-full");
    if (!container) return;
    logoutTestObserver = new MutationObserver(removeLogoutTestButton);
    logoutTestObserver.observe(container, { childList: true, subtree: true });
  }

  function dismissWelcomeBanner() {
    var banner = document.getElementById("auth-welcome-banner");
    if (!banner) return;
    banner.classList.remove("auth-welcome-banner--visible");
    banner.classList.add("auth-welcome-banner--hide");
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 500);
  }

  function showWelcomeBanner(displayName) {
    dismissWelcomeBanner();
    var banner = document.createElement("div");
    banner.id = "auth-welcome-banner";
    banner.className = "auth-welcome-banner";
    banner.setAttribute("role", "status");
    banner.innerHTML =
      '<span class="auth-welcome-banner__text">' + escapeHtml(window.bsvI18n ? window.bsvI18n.t("auth.welcome", { name: displayName }) : ("Welcome " + displayName)) + "</span>";
    document.body.appendChild(banner);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add("auth-welcome-banner--visible");
      });
    });
    setTimeout(function () {
      dismissWelcomeBanner();
    }, 4000);
  }

  function renderNavLogin(user) {
    removeLogoutTestButton();
    var slot = document.getElementById("nav-login");
    if (!slot) return;

    document.dispatchEvent(new CustomEvent("bsv:authchange", { detail: { user: user || null } }));

    if (!user) {
      var loginLabel = window.bsvI18n ? window.bsvI18n.t("auth.login") : "Log In";
      var loginTitle = window.bsvI18n ? window.bsvI18n.t("auth.loginTitle") : "Log in with Discord";
      var loginAria = window.bsvI18n ? window.bsvI18n.t("auth.loginAria") : "Log in with Discord";
      slot.innerHTML =
        '<button type="button" class="nav-login-btn nav-login-btn--signin" id="nav-login-btn" title="' + escapeAttr(loginTitle) + '" aria-label="' + escapeAttr(loginAria) + '">' +
          '<span class="nav-login-btn__label">' + escapeHtml(loginLabel) + '</span>' +
        "</button>";
      var loginBtn = document.getElementById("nav-login-btn");
      if (loginBtn) loginBtn.addEventListener("click", startDiscordLogin);
      if (typeof initMobileHeaderToolbar === "function") initMobileHeaderToolbar();
      return;
    }

    var name = user.displayName || user.username || "Discord user";
    var avatar = user.avatarUrl || "https://i.ibb.co/Tq7DLCJt/dsfbvbvxcxbvn.png";
    var accountMenuLabel = window.bsvI18n ? window.bsvI18n.t("auth.accountMenu") : "Account menu";
    var logoutLabel = window.bsvI18n ? window.bsvI18n.t("auth.logout") : "Log out";
    slot.innerHTML =
      '<div class="nav-login-user">' +
        '<button type="button" class="nav-login-btn nav-login-btn--signedin" id="nav-login-btn" title="' + escapeAttr(name) + '" aria-label="' + escapeAttr(accountMenuLabel) + '" aria-expanded="false">' +
          '<span class="nav-login-btn__name">' + escapeHtml(name) + "</span>" +
          '<span class="nav-login-btn__avatar-wrap">' +
            '<img src="' + escapeAttr(avatar) + '" alt="" width="44" height="44" class="nav-login-btn__avatar" decoding="async">' +
          "</span>" +
        "</button>" +
        '<div class="nav-login-menu" id="nav-login-menu" hidden>' +
          '<p class="nav-login-menu__name">' + escapeHtml(name) + "</p>" +
          '<button type="button" class="nav-login-menu__logout" id="nav-login-logout">' + escapeHtml(logoutLabel) + '</button>' +
        "</div>" +
      "</div>";

    var btn = document.getElementById("nav-login-btn");
    var menu = document.getElementById("nav-login-menu");
    var logoutBtn = document.getElementById("nav-login-logout");

    if (btn && menu) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = !menu.hidden;
        menu.hidden = open;
        btn.setAttribute("aria-expanded", open ? "false" : "true");
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        closeLoginMenu();
        logoutDiscord();
      });
    }
    if (typeof initMobileHeaderToolbar === "function") initMobileHeaderToolbar();
  }

  function initDiscordAuth() {
    removeLogoutTestButton();
    watchForLogoutTestButton();
    var justLoggedIn = parseAuthHash();
    fetchAuthUser().then(function (user) {
      renderNavLogin(user);
      removeLogoutTestButton();
      warnIfLoggedInOnWrongSite();
      if (justLoggedIn && user) {
        showWelcomeBanner(user.displayName || user.username || "back");
        setTimeout(removeLogoutTestButton, 0);
      }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-login-user")) closeLoginMenu();
    });
    document.addEventListener("bsv:languagechange", function () {
      fetchAuthUser().then(function (user) {
        renderNavLogin(user);
      });
    });
    window.addEventListener("pageshow", function () {
      removeLogoutTestButton();
      watchForLogoutTestButton();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDiscordAuth);
  } else {
    initDiscordAuth();
  }

  window.initDiscordAuth = initDiscordAuth;
  window.startDiscordLogin = startDiscordLogin;
  window.bsvGetAuthToken = getAuthToken;
})();
