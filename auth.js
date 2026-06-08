(function () {
  var AUTH_TOKEN_KEY = "bsv-discord-auth";

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

  function parseAuthHash() {
    var hash = window.location.hash || "";
    if (hash.indexOf("bsv_auth=") !== -1) {
      var match = hash.match(/bsv_auth=([^&]+)/);
      if (match && match[1]) setAuthToken(decodeURIComponent(match[1]));
    }
    if (hash.indexOf("bsv_auth") !== -1) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  function startDiscordLogin() {
    var returnTo = window.location.href.split("#")[0];
    window.location.href = authUrl("api/auth/discord?return_to=" + encodeURIComponent(returnTo));
  }

  function logoutDiscord() {
    setAuthToken(null);
    var token = getAuthToken();
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

  function renderNavLogin(user) {
    var slot = document.getElementById("nav-login");
    if (!slot) return;

    if (!user) {
      slot.innerHTML =
        '<button type="button" class="nav-login-btn" id="nav-login-btn" title="Login with Discord" aria-label="Login with Discord">' +
          '<img src="https://i.ibb.co/Tq7DLCJt/dsfbvbvxcxbvn.png" alt="" width="22" height="22" class="nav-login-btn__icon" decoding="async">' +
        "</button>";
      var loginBtn = document.getElementById("nav-login-btn");
      if (loginBtn) loginBtn.addEventListener("click", startDiscordLogin);
      return;
    }

    var name = user.displayName || user.username || "Discord user";
    var avatar = user.avatarUrl || "https://i.ibb.co/Tq7DLCJt/dsfbvbvxcxbvn.png";
    slot.innerHTML =
      '<div class="nav-login-user">' +
        '<button type="button" class="nav-login-btn nav-login-btn--avatar" id="nav-login-btn" title="' + escapeAttr(name) + '" aria-label="Account menu" aria-expanded="false">' +
          '<img src="' + escapeAttr(avatar) + '" alt="" width="36" height="36" class="nav-login-btn__avatar" decoding="async">' +
        "</button>" +
        '<div class="nav-login-menu" id="nav-login-menu" hidden>' +
          '<p class="nav-login-menu__name">' + escapeHtml(name) + "</p>" +
          '<button type="button" class="nav-login-menu__logout" id="nav-login-logout">Log out</button>' +
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
  }

  function initDiscordAuth() {
    parseAuthHash();
    fetchAuthUser().then(renderNavLogin);
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-login-user")) closeLoginMenu();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDiscordAuth);
  } else {
    initDiscordAuth();
  }

  window.initDiscordAuth = initDiscordAuth;
  window.startDiscordLogin = startDiscordLogin;
})();
