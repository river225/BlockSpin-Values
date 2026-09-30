(function () {
  function removeWrongSiteBanner() {
    var el = document.getElementById("auth-wrong-site-banner");
    if (el) el.remove();
  }
  removeWrongSiteBanner();
  document.addEventListener("DOMContentLoaded", removeWrongSiteBanner);
  window.addEventListener("pageshow", removeWrongSiteBanner);

  var AUTH_TOKEN_KEY = "bsv-discord-auth";
  var ROBLOX_LINK_KEY = "bsv-roblox-link";
  var ROBLOX_TOKEN_KEY = "bsv-roblox-auth";
  var OAUTH_RETURN_KEY = "bsv-oauth-return-to";
  var RESUME_LOGIN_KEY = "bsv-resume-login-modal";
  var LOGIN_PURPOSE_KEY = "bsv-login-purpose";
  var DEFAULT_AVATAR = "https://i.ibb.co/Tq7DLCJt/dsfbvbvxcxbvn.png";
  var DISCORD_INVITE_FALLBACK = "https://discord.gg/QbapryYUUx";
  var logoutTestObserver = null;
  var cachedDiscordUser = null;
  var cachedRobloxLink = null;
  var logoutChoicesOpen = false;
  var loginModalOpts = { requireGuild: false };
  var guildCheckInFlight = null;

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

  function t(key, fallback, vars) {
    if (window.bsvI18n && typeof window.bsvI18n.t === "function") {
      var out = window.bsvI18n.t(key, vars || {});
      if (out && out !== key) return out;
    }
    var text = fallback || key;
    if (vars && vars.name != null) text = String(text).replace(/\{name\}/g, String(vars.name));
    return text;
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

  function getRobloxToken() {
    try {
      return localStorage.getItem(ROBLOX_TOKEN_KEY);
    } catch (_) {
      return null;
    }
  }

  function setRobloxToken(token) {
    try {
      if (token) localStorage.setItem(ROBLOX_TOKEN_KEY, token);
      else localStorage.removeItem(ROBLOX_TOKEN_KEY);
    } catch (_) {}
  }

  function readRobloxLink() {
    try {
      var raw = localStorage.getItem(ROBLOX_LINK_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.username) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function writeRobloxLink(link) {
    try {
      if (link) localStorage.setItem(ROBLOX_LINK_KEY, JSON.stringify(link));
      else localStorage.removeItem(ROBLOX_LINK_KEY);
    } catch (_) {}
    cachedRobloxLink = link || null;
  }

  function clearRobloxLink() {
    setRobloxToken(null);
    writeRobloxLink(null);
  }

  function currentSession() {
    return {
      user: cachedDiscordUser,
      discord: cachedDiscordUser,
      roblox: null,
      ready: !!cachedDiscordUser
    };
  }

  function emitAuthChange() {
    document.dispatchEvent(new CustomEvent("bsv:authchange", { detail: currentSession() }));
  }

  function markResumeLoginModal() {
    try {
      sessionStorage.setItem(RESUME_LOGIN_KEY, "1");
    } catch (_) {}
  }

  function shouldResumeLoginModal() {
    try {
      return sessionStorage.getItem(RESUME_LOGIN_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function clearResumeLoginModal() {
    try {
      sessionStorage.removeItem(RESUME_LOGIN_KEY);
    } catch (_) {}
  }

  function setLoginPurpose(purpose) {
    try {
      if (purpose) {
        sessionStorage.setItem(LOGIN_PURPOSE_KEY, String(purpose));
        localStorage.setItem(LOGIN_PURPOSE_KEY, String(purpose));
      } else {
        sessionStorage.removeItem(LOGIN_PURPOSE_KEY);
        localStorage.removeItem(LOGIN_PURPOSE_KEY);
      }
    } catch (_) {}
  }

  function getLoginPurpose() {
    try {
      return (
        sessionStorage.getItem(LOGIN_PURPOSE_KEY) ||
        localStorage.getItem(LOGIN_PURPOSE_KEY) ||
        ""
      );
    } catch (_) {
      return "";
    }
  }

  function loginRequiresGuild() {
    return !!(loginModalOpts && loginModalOpts.requireGuild) || getLoginPurpose() === "live-trading";
  }

  /** Restore live-trading login purpose from ?bsv_lt_login=1 after Discord OAuth. */
  function consumeLiveTradingLoginFlag() {
    try {
      var u = new URL(window.location.href);
      if (u.searchParams.get("bsv_lt_login") !== "1") return false;
      setLoginPurpose("live-trading");
      markResumeLoginModal();
      u.searchParams.delete("bsv_lt_login");
      history.replaceState(
        null,
        "",
        u.pathname + (u.search || "") + (u.hash || "")
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  function fetchGuildMembership() {
    var token = getAuthToken();
    if (!token) {
      return Promise.resolve({
        loggedIn: false,
        inGuild: false,
        inviteUrl: DISCORD_INVITE_FALLBACK
      });
    }
    if (guildCheckInFlight) return guildCheckInFlight;
    guildCheckInFlight = fetch(authUrl("api/auth/guild-member"), {
      headers: { Authorization: "Bearer " + token }
    })
      .then(function (res) {
        return res.json().catch(function () {
          return null;
        });
      })
      .then(function (data) {
        data = data || {};
        return {
          loggedIn: !!data.loggedIn,
          inGuild: !!data.inGuild,
          inviteUrl: data.inviteUrl || DISCORD_INVITE_FALLBACK,
          error: data.error || null
        };
      })
      .catch(function () {
        return {
          loggedIn: true,
          inGuild: false,
          inviteUrl: DISCORD_INVITE_FALLBACK,
          error: "check_failed"
        };
      })
      .then(function (result) {
        guildCheckInFlight = null;
        return result;
      });
    return guildCheckInFlight;
  }

  function parseAuthHash() {
    var hash = window.location.hash || "";
    var justLoggedIn = false;

    if (hash.indexOf("bsv_auth_error=") !== -1 || hash.indexOf("bsv_roblox_error=") !== -1) {
      clearOAuthReturnTo();
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return false;
    }

    // Roblox login removed — drop any leftover Roblox OAuth hash.
    if (hash.indexOf("bsv_roblox_auth=") !== -1) {
      clearRobloxLink();
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
    }

    if (hash.indexOf("bsv_auth=") !== -1 || hash.indexOf("bsv_roblox_auth=") !== -1) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    if (justLoggedIn) clearOAuthReturnTo();
    return justLoggedIn;
  }

  function startDiscordLogin() {
    markResumeLoginModal();
    if (loginRequiresGuild()) setLoginPurpose("live-trading");
    saveOAuthReturnTo();
    var returnTo = window.location.href.split("#")[0];
    if (loginRequiresGuild()) {
      try {
        var u = new URL(returnTo);
        u.searchParams.set("bsv_lt_login", "1");
        returnTo = u.toString();
      } catch (_) {}
    }
    window.location.href = authUrl("api/auth/discord?return_to=" + encodeURIComponent(returnTo));
  }

  function startRobloxLogin() {
    // Roblox login removed site-wide.
    startDiscordLogin();
  }

  function refreshAfterLogout() {
    dismissWelcomeBanner();
    closeLoginMenu();
    logoutChoicesOpen = false;
    renderNavLogin(currentSession());
    syncLoginModal(currentSession());
    emitAuthChange();
  }

  function logoutDiscordOnly() {
    setAuthToken(null);
    cachedDiscordUser = null;
    clearOAuthReturnTo();
    fetch(authUrl("api/auth/logout"), { method: "POST" }).catch(function () {});
    refreshAfterLogout();
  }

  function logoutRobloxOnly() {
    clearRobloxLink();
    refreshAfterLogout();
  }

  function logoutAll() {
    setAuthToken(null);
    cachedDiscordUser = null;
    clearRobloxLink();
    clearOAuthReturnTo();
    dismissWelcomeBanner();
    fetch(authUrl("api/auth/logout"), { method: "POST" }).catch(function () {});
    closeLoginMenu();
    logoutChoicesOpen = false;
    renderNavLogin(currentSession());
    syncLoginModal(currentSession());
    emitAuthChange();
  }

  // Back-compat alias used by older callers.
  function logoutDiscord() {
    logoutAll();
  }

  function fetchAuthUser() {
    var token = getAuthToken();
    if (!token) return Promise.resolve(null);
    return fetch(authUrl("api/auth/me"), {
      headers: { Authorization: "Bearer " + token }
    })
      .then(function (res) {
        // Only drop the session on explicit auth rejection — never on network/CORS blips.
        if (res.status === 401 || res.status === 403) {
          setAuthToken(null);
          return null;
        }
        if (!res.ok) return null;
        return res.json().then(function (data) {
          if (!data || !data.loggedIn || !data.user) {
            setAuthToken(null);
            return null;
          }
          return data.user;
        });
      })
      .catch(function () {
        // Keep token so a temporary API failure does not log the user out.
        return null;
      });
  }

  function clearLoginMenuFixedPosition(menu) {
    if (!menu) return;
    menu.style.position = "";
    menu.style.top = "";
    menu.style.right = "";
    menu.style.left = "";
    menu.style.bottom = "";
    menu.style.width = "";
    menu.style.maxHeight = "";
    menu.style.zIndex = "";
  }

  function positionLoginMenuFixed(menu, btn) {
    if (!menu || !btn || typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(max-width: 900px)").matches) {
      clearLoginMenuFixedPosition(menu);
      return;
    }
    var rect = btn.getBoundingClientRect();
    var gutter = 10;
    var width = Math.min(300, window.innerWidth - gutter * 2);
    var top = Math.round(rect.bottom + 8);
    var maxHeight = Math.max(160, Math.floor(window.innerHeight - top - gutter));
    menu.style.position = "fixed";
    menu.style.top = top + "px";
    menu.style.right = gutter + "px";
    menu.style.left = "auto";
    menu.style.bottom = "auto";
    menu.style.width = width + "px";
    menu.style.maxHeight = maxHeight + "px";
    menu.style.zIndex = "2000";
  }

  function closeLoginMenu() {
    var menu = document.getElementById("nav-login-menu");
    var btn = document.getElementById("nav-login-btn");
    if (menu) {
      menu.hidden = true;
      clearLoginMenuFixedPosition(menu);
    }
    if (btn) btn.setAttribute("aria-expanded", "false");
    logoutChoicesOpen = false;
    var choices = document.getElementById("nav-login-logout-choices");
    if (choices) choices.hidden = true;
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
      '<span class="auth-welcome-banner__text">' +
      escapeHtml(t("auth.welcome", "Welcome {name}", { name: displayName })) +
      "</span>";
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

  function ensureLoginModal() {
    var existing = document.getElementById("bsv-login-modal");
    if (existing && existing.getAttribute("data-bsv-login-v") === "6") return;
    if (existing) existing.remove();

    var wrap = document.createElement("div");
    wrap.className = "bsv-login-modal";
    wrap.id = "bsv-login-modal";
    wrap.setAttribute("data-bsv-login-v", "6");
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="bsv-login-modal__backdrop" id="bsv-login-backdrop"></div>' +
      '<div class="bsv-login-modal__box" role="dialog" aria-modal="true" aria-labelledby="bsv-login-title">' +
        '<button type="button" class="bsv-login-modal__close" id="bsv-login-close" aria-label="' +
          escapeAttr(t("auth.close", "Close")) +
        '">&times;</button>' +
        '<h2 class="bsv-login-modal__title" id="bsv-login-title">' +
          escapeHtml(t("auth.login", "Log In")) +
        "</h2>" +
        '<div class="bsv-login-steps bsv-login-steps--single" id="bsv-login-steps">' +
          '<div class="bsv-login-step" id="bsv-login-step-discord" data-step="discord">' +
            '<div class="bsv-login-step__body">' +
              '<p class="bsv-login-step__eyebrow" id="bsv-login-discord-eyebrow">Step 1</p>' +
              '<h3 class="bsv-login-step__title">' + escapeHtml(t("auth.discordTitle", "Log in with Discord")) + "</h3>" +
              '<p class="bsv-login-step__status" id="bsv-login-discord-status"></p>' +
              '<button type="button" class="bsv-login-step__btn bsv-login-step__btn--discord" id="bsv-login-discord-btn">' +
                escapeHtml(t("auth.discordBtn", "Log in with Discord")) +
              "</button>" +
            "</div>" +
          "</div>" +
          '<div class="bsv-login-step" id="bsv-login-step-guild" data-step="guild" hidden>' +
            '<div class="bsv-login-step__body">' +
              '<p class="bsv-login-step__eyebrow">Step 2</p>' +
              '<h3 class="bsv-login-step__title">Join our Discord</h3>' +
              '<p class="bsv-login-step__copy" id="bsv-login-guild-copy">Required to create and interact with trades.</p>' +
              '<p class="bsv-login-step__status" id="bsv-login-guild-status"></p>' +
              '<a class="bsv-login-step__btn bsv-login-step__btn--discord" id="bsv-login-guild-join" href="' +
                escapeAttr(DISCORD_INVITE_FALLBACK) +
                '" target="_blank" rel="noopener noreferrer">Join Discord server</a>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";
    document.body.appendChild(wrap);

    var closeBtn = document.getElementById("bsv-login-close");
    var backdrop = document.getElementById("bsv-login-backdrop");
    var discordBtn = document.getElementById("bsv-login-discord-btn");

    if (closeBtn) closeBtn.addEventListener("click", closeLoginModal);
    if (backdrop) backdrop.addEventListener("click", closeLoginModal);
    if (discordBtn) discordBtn.addEventListener("click", startDiscordLogin);

    if (!window.__bsvLoginEscBound) {
      window.__bsvLoginEscBound = true;
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeLoginModal();
      });
      // After they join in Discord and return to this tab, re-check membership.
      window.addEventListener("focus", function () {
        var modal = document.getElementById("bsv-login-modal");
        if (!modal || modal.hidden || !loginRequiresGuild() || !currentSession().ready) return;
        syncLoginModal(currentSession(), { forceGuildCheck: true });
      });
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState !== "visible") return;
        var modal = document.getElementById("bsv-login-modal");
        if (!modal || modal.hidden || !loginRequiresGuild() || !currentSession().ready) return;
        syncLoginModal(currentSession(), { forceGuildCheck: true });
      });
    }
  }

  function syncLoginModal(session, syncOpts) {
    ensureLoginModal();
    session = session || currentSession();
    syncOpts = syncOpts || {};
    var discord = session.discord || session.user || null;
    var requireGuild = loginRequiresGuild();
    var steps = document.getElementById("bsv-login-steps");
    var stepDiscord = document.getElementById("bsv-login-step-discord");
    var stepGuild = document.getElementById("bsv-login-step-guild");
    var discordStatus = document.getElementById("bsv-login-discord-status");
    var discordBtn = document.getElementById("bsv-login-discord-btn");
    var discordEyebrow = document.getElementById("bsv-login-discord-eyebrow");
    var guildStatus = document.getElementById("bsv-login-guild-status");
    var guildJoin = document.getElementById("bsv-login-guild-join");
    var title = document.getElementById("bsv-login-title");
    var modal = document.getElementById("bsv-login-modal");

    if (title) {
      title.textContent = requireGuild
        ? t("auth.liveTradingLogin", "Log in to trade")
        : t("auth.login", "Log In");
    }
    if (steps) {
      steps.classList.toggle("bsv-login-steps--single", !requireGuild);
      steps.classList.toggle("bsv-login-steps--dual", requireGuild);
    }
    if (discordEyebrow) discordEyebrow.hidden = !requireGuild;
    if (stepGuild) stepGuild.hidden = !requireGuild;
    if (stepDiscord) {
      stepDiscord.classList.toggle("is-complete", !!discord);
      stepDiscord.classList.remove("is-locked");
    }
    if (discordStatus) {
      discordStatus.textContent = discord
        ? t("auth.discordDone", "Connected") +
          (discord.displayName || discord.username ? " · " + (discord.displayName || discord.username) : "")
        : "";
    }
    if (discordBtn) {
      discordBtn.hidden = !!discord;
      discordBtn.disabled = !!discord;
      discordBtn.textContent = t("auth.discordBtn", "Log in with Discord");
    }

    if (!requireGuild) {
      if (stepGuild) stepGuild.classList.remove("is-complete", "is-locked");
      // Only auto-close if the modal is already open — never wipe resume flags on page load.
      if (session.ready && modal && !modal.hidden) closeLoginModal();
      return;
    }

    if (!discord) {
      if (stepGuild) {
        stepGuild.classList.add("is-locked");
        stepGuild.classList.remove("is-complete");
      }
      if (guildStatus) guildStatus.textContent = "";
      return;
    }

    if (stepGuild) stepGuild.classList.remove("is-locked");
    if (guildStatus) guildStatus.textContent = "Checking server membership…";

    fetchGuildMembership().then(function (membership) {
      if (guildJoin && membership.inviteUrl) guildJoin.href = membership.inviteUrl;
      if (!loginRequiresGuild()) return;
      if (!currentSession().ready) return;
      if (membership.inGuild) {
        if (stepGuild) stepGuild.classList.add("is-complete");
        if (guildStatus) guildStatus.textContent = "You’re in the server — you’re all set.";
        setLoginPurpose("");
        // Small delay so users see the completed step after OAuth return.
        if (syncOpts.forceGuildCheck || (modal && !modal.hidden)) {
          setTimeout(closeLoginModal, syncOpts.forceGuildCheck ? 350 : 500);
        } else {
          closeLoginModal();
        }
        return;
      }
      if (stepGuild) stepGuild.classList.remove("is-complete");
      if (guildStatus) {
        guildStatus.textContent =
          membership.error === "check_failed" || membership.error === "checker_unavailable"
            ? "Couldn’t verify yet — join, then come back here."
            : "";
      }
      // Keep / reopen the login modal on the join step (header login never sets this purpose).
      if (modal) {
        modal.hidden = false;
        document.body.classList.add("bsv-login-open");
      }
    });
  }

  function openLoginModal(opts) {
    opts = opts || {};
    loginModalOpts = {
      requireGuild: !!(opts.requireGuild || opts.purpose === "live-trading")
    };
    if (loginModalOpts.requireGuild) setLoginPurpose("live-trading");
    else if (!opts.resume) setLoginPurpose("");

    ensureLoginModal();
    var modal = document.getElementById("bsv-login-modal");
    if (!modal) return;
    // Keep the dialog centered in the viewport (never anchored under the header button).
    if (modal.parentNode !== document.body) document.body.appendChild(modal);
    modal.hidden = false;
    document.body.classList.add("bsv-login-open");
    syncLoginModal(currentSession(), { forceGuildCheck: !!opts.forceGuildCheck });
  }

  function closeLoginModal() {
    var modal = document.getElementById("bsv-login-modal");
    if (modal) modal.hidden = true;
    document.body.classList.remove("bsv-login-open");
    clearResumeLoginModal();
    setLoginPurpose("");
    loginModalOpts = { requireGuild: false };
  }

  function robloxAvatar(roblox) {
    if (roblox && roblox.imageUrl) return roblox.imageUrl;
    if (roblox && roblox.userId) {
      return (
        "https://www.roblox.com/headshot-thumbnail/image?userId=" +
        encodeURIComponent(String(roblox.userId)) +
        "&width=150&height=150&format=png"
      );
    }
    return DEFAULT_AVATAR;
  }

  function bindProfileMenu(session) {
    var btn = document.getElementById("nav-login-btn");
    var menu = document.getElementById("nav-login-menu");
    var logoutBtn = document.getElementById("nav-login-logout");

    if (btn && menu) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = menu.hidden;
        menu.hidden = !open;
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) {
          positionLoginMenuFixed(menu, btn);
        } else {
          clearLoginMenuFixedPosition(menu);
        }
      });
    }

    if (logoutBtn) logoutBtn.addEventListener("click", logoutAll);
  }

  function statusRowHtml(avatarUrl, statusText) {
    return (
      '<div class="nav-login-menu__status-row">' +
        '<span class="nav-login-menu__pfp-wrap">' +
          '<img class="nav-login-menu__pfp" src="' +
          escapeAttr(avatarUrl || DEFAULT_AVATAR) +
          '" alt="" width="32" height="32" decoding="async">' +
        "</span>" +
        '<p class="nav-login-menu__status nav-login-menu__status--ok">' +
        escapeHtml(statusText) +
        "</p>" +
      "</div>"
    );
  }

  function renderNavLogin(session) {
    removeLogoutTestButton();
    var slot = document.getElementById("nav-login");
    if (!slot) return;

    session = session || currentSession();
    cachedDiscordUser = session.discord || session.user || null;
    cachedRobloxLink = null;
    emitAuthChange();
    syncLoginModal(session);

    var discord = session.discord || null;
    var hasAny = !!discord;

    if (!hasAny) {
      var loginLabel = t("auth.login", "Log In");
      var loginTitle = t("auth.loginTitle", "Log in");
      var loginAria = t("auth.loginAria", "Log in");
      slot.innerHTML =
        '<button type="button" class="nav-login-btn nav-login-btn--signin" id="nav-login-btn" title="' +
        escapeAttr(loginTitle) +
        '" aria-label="' +
        escapeAttr(loginAria) +
        '">' +
        '<span class="nav-login-btn__label">' +
        escapeHtml(loginLabel) +
        "</span>" +
        "</button>";
      var loginBtn = document.getElementById("nav-login-btn");
      if (loginBtn) {
        loginBtn.addEventListener("click", function () {
          openLoginModal();
        });
      }
      if (typeof initMobileHeaderToolbar === "function") initMobileHeaderToolbar();
      return;
    }

    var discordName = discord ? discord.displayName || discord.username || "Discord" : "";
    var chipName = discordName || t("auth.accountChip", "Account");
    var chipAvatar = discord && discord.avatarUrl ? discord.avatarUrl : DEFAULT_AVATAR;
    var accountMenuLabel = t("auth.accountMenu", "Profile menu");
    var discordStatusHtml = statusRowHtml(
      chipAvatar,
      t("auth.statusConnected", "Logged in") + (discordName ? " · " + discordName : "")
    );

    slot.innerHTML =
      '<div class="nav-login-user">' +
        '<button type="button" class="nav-login-btn nav-login-btn--signedin" id="nav-login-btn" title="' +
          escapeAttr(chipName) +
          '" aria-label="' +
          escapeAttr(accountMenuLabel) +
          '" aria-expanded="false" aria-haspopup="true">' +
          '<span class="nav-login-btn__name">' +
          escapeHtml(chipName) +
          "</span>" +
          '<span class="nav-login-btn__avatar-wrap">' +
            '<img src="' +
            escapeAttr(chipAvatar) +
            '" alt="" width="44" height="44" class="nav-login-btn__avatar" decoding="async">' +
          "</span>" +
        "</button>" +
        '<div class="nav-login-menu" id="nav-login-menu" hidden role="menu">' +
          '<p class="nav-login-menu__title">' +
          escapeHtml(t("auth.profileTitle", "Profile")) +
          "</p>" +
          '<section class="nav-login-menu__section" aria-label="Discord">' +
            '<p class="nav-login-menu__section-label">' +
            escapeHtml(t("auth.discordSection", "Discord")) +
            "</p>" +
            discordStatusHtml +
          "</section>" +
          '<div class="nav-login-menu__logout-wrap">' +
            '<button type="button" class="nav-login-menu__logout" id="nav-login-logout">' +
            escapeHtml(t("auth.logout", "Log out")) +
            "</button>" +
            '<p class="nav-login-menu__trading-note">' +
            escapeHtml(t("auth.liveTradingRequired", "Login is required for live trading")) +
            "</p>" +
          "</div>" +
        "</div>" +
      "</div>";

    bindProfileMenu(session);
    if (typeof initMobileHeaderToolbar === "function") initMobileHeaderToolbar();
  }

  function fetchRobloxSession() {
    var token = getRobloxToken();
    if (!token) {
      clearRobloxLink();
      return Promise.resolve(null);
    }
    return fetch(authUrl("api/auth/roblox/me"), {
      headers: { Authorization: "Bearer " + token }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("roblox_me_failed");
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.loggedIn || !data.user) {
          clearRobloxLink();
          return null;
        }
        var link = {
          username: data.user.username || data.user.name || "Roblox",
          userId: data.user.id || data.user.userId,
          imageUrl: data.user.avatarUrl || data.user.imageUrl || "",
          profileUrl: data.user.profileUrl || "",
          oauth: true,
          linkedAt: Date.now()
        };
        writeRobloxLink(link);
        return link;
      })
      .catch(function () {
        setRobloxToken(null);
        writeRobloxLink(null);
        return null;
      });
  }

  function getAuthSession() {
    clearRobloxLink();
    return fetchAuthUser().then(function (user) {
      cachedDiscordUser = user || null;
      cachedRobloxLink = null;
      return currentSession();
    });
  }

  function initDiscordAuth() {
    removeLogoutTestButton();
    watchForLogoutTestButton();
    ensureLoginModal();
    consumeLiveTradingLoginFlag();
    var justLoggedIn = parseAuthHash();
    clearRobloxLink();
    getAuthSession().then(function (session) {
      var needsGuildSteps = getLoginPurpose() === "live-trading";

      renderNavLogin(session);
      removeLogoutTestButton();

      if (session.ready && needsGuildSteps) {
        // After Discord (step 1), reopen the steps popup on join-server (step 2).
        clearResumeLoginModal();
        openLoginModal({ requireGuild: true, forceGuildCheck: true });
      } else if (shouldResumeLoginModal() && !session.ready) {
        clearResumeLoginModal();
        openLoginModal(needsGuildSteps ? { requireGuild: true } : {});
      } else if (session.ready) {
        clearResumeLoginModal();
      }

      if (justLoggedIn && !needsGuildSteps) {
        var welcomeName =
          (session.user && (session.user.displayName || session.user.username)) ||
          "back";
        showWelcomeBanner(welcomeName);
      }
      if (justLoggedIn) setTimeout(removeLogoutTestButton, 0);
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-login-user")) closeLoginMenu();
    });
    document.addEventListener("bsv:languagechange", function () {
      getAuthSession().then(function (session) {
        renderNavLogin(session);
      });
    });
    window.addEventListener("pageshow", function () {
      removeLogoutTestButton();
      watchForLogoutTestButton();
    });
  }

  if (!window.__bsvAuthInited) {
    window.__bsvAuthInited = true;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initDiscordAuth);
    } else {
      initDiscordAuth();
    }
  }

  window.initDiscordAuth = initDiscordAuth;
  window.startDiscordLogin = startDiscordLogin;
  window.startRobloxLogin = startRobloxLogin;
  window.bsvGetAuthToken = getAuthToken;
  window.bsvGetAuthSession = getAuthSession;
  window.bsvClearRobloxLink = clearRobloxLink;
  window.bsvOpenLoginModal = openLoginModal;
  window.bsvCloseLoginModal = closeLoginModal;
  window.bsvLogoutAll = logoutAll;
  window.bsvLogoutDiscord = logoutDiscordOnly;
  window.bsvLogoutRoblox = logoutRobloxOnly;
})();
