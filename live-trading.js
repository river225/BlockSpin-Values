(function () {
  "use strict";

  var SPREADSHEET_ID = "18s5ZK-b256navTEfZQFF1TxICwQ3xLjhiSJH4X97Ji4";
  var POSTS_KEY = "bsv-live-trades-v1";
  var HIDDEN_AUTHORS_KEY = "bsv-lt-hidden-authors-v1";
  var GUIDELINES_ACK_KEY = "bsv-lt-guidelines-ack-v1";
  var GUIDELINES_ACK_MS = 24 * 60 * 60 * 1000;
  /* Only show real items + Add; no filler empties crowding the grid. */
  var EMPTY_SLOT_COUNT = 0;
  var profileOpenDiscordId = "";
  var pendingOpenComposerAfterGuidelines = false;
  var postsCache = [];
  var postsFetchInFlight = null;
  var postsFetchGen = 0;
  var postsPollTimer = null;
  var lastRenderedPostIds = "";
  var POSTS_POLL_MS = 2000;
  var POSTS_POLL_HIDDEN_MS = 15000;
  var TRADE_SHEETS = [
    { sheet: "Uncommon", rarity: "Common / Uncommon", color: "#4caf50" },
    { sheet: "Rare", rarity: "Rare", color: "#4a90e2" },
    { sheet: "Epic", rarity: "Epic", color: "#8e63ce" },
    { sheet: "Legendary", rarity: "Legendary", color: "#f39c12" },
    { sheet: "Omega", rarity: "Omega", color: "#e74c3c" },
    { sheet: "Misc", rarity: "Misc", color: "#ec407a" },
    { sheet: "Vehicles", rarity: "Vehicles", color: "#718096" }
  ];
  var FISH_TRADE_NAMES = {
    tuna: true,
    sailfish: true,
    marlin: true
  };
  var FISH_WEIGHT_MAX = 3.6;
  var FISH_WEIGHT_STEP = 0.1;
  var FISH_SHEET_NAME = "Fishing Types of fishing ";
  var FISH_RARITY_COLORS = {
    common: "#4caf50",
    uncommon: "#66bb6a",
    rare: "#4a90e2",
    epic: "#8e63ce",
    legendary: "#f39c12",
    omega: "#e74c3c"
  };

  var catalog = [];
  var catalogReady = false;
  var catalogPromise = null;
  var draft = {
    giving: [],
    wanting: [],
    givingCash: 0,
    wantingCash: 0,
    lookingForOffers: false,
    notLookingForOffers: false
  };
  var editingPostId = null;
  var pickerSide = "giving";
  var searchScope = "all";
  var LT_OWNER_DISCORD_ID = "1163614455616245780";
  var discordAppLaunchTimer = null;
  var searchQuery = "";
  var pickerRarity = "all";
  var currentSession = { ready: false, discord: null, roblox: null, user: null };

  function t(key, fallback) {
    if (window.bsvI18n && typeof window.bsvI18n.t === "function") {
      var out = window.bsvI18n.t(key);
      if (out && out !== key) return out;
    }
    return fallback || key;
  }

  function sitePath(path) {
    if (typeof window.bsvSitePath === "function") return window.bsvSitePath(path);
    return String(path || "").replace(/^\//, "");
  }

  function i18nSection(name) {
    if (window.bsvI18n && typeof window.bsvI18n.tSection === "function") {
      return window.bsvI18n.tSection(name);
    }
    return name;
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

  function formatCash(n) {
    var num = Math.max(0, Math.round(Number(n) || 0));
    if (!num) return "";
    return "$" + num.toLocaleString("en-US");
  }

  function parseCash(raw) {
    var n = parseInt(String(raw || "").replace(/[^0-9]/g, ""), 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }

  function uid() {
    return "lt_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function getCellDisplayValue(cell) {
    if (!cell) return "";
    if (cell.f != null && String(cell.f).trim() !== "") return String(cell.f).trim();
    if (cell.v == null) return "";
    return String(cell.v).trim();
  }

  function fetchSheet(sheetName) {
    var base = "https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID + "/gviz/tq";
    var url = base + "?tqx=out:json&sheet=" + encodeURIComponent(sheetName) + "&headers=1";
    return fetch(url)
      .then(function (res) {
        return res.text();
      })
      .then(function (text) {
        var json = JSON.parse(text.substring(47, text.length - 2));
        var cols = (json.table.cols || []).map(function (c) {
          return (c.label || "").trim();
        });
        return (json.table.rows || [])
          .map(function (r) {
            var obj = {};
            cols.forEach(function (label, i) {
              obj[label] = getCellDisplayValue(r.c && r.c[i]);
            });
            return obj;
          })
          .filter(function (x) {
            return (
              String(
                x.Name ||
                  x["Fishing Item Name"] ||
                  x["Item Name"] ||
                  x["Fishing Name"] ||
                  ""
              ).trim().length > 0
            );
          });
      })
      .catch(function () {
        return [];
      });
  }

  function loadFishCatalog() {
    return fetchSheet(FISH_SHEET_NAME)
      .then(function (rows) {
        var out = [];
        (rows || []).forEach(function (row) {
          var name = String(
            row["Fishing Item Name"] || row["Item Name"] || row.Name || ""
          ).trim();
          if (!name || !FISH_TRADE_NAMES[name.toLowerCase()]) return;
          var rarity = String(row["Fishing Rarity"] || row.Rarity || "Misc").trim();
          var color =
            FISH_RARITY_COLORS[rarity.toLowerCase()] || FISH_RARITY_COLORS.epic;
          out.push({
            id: "fish::" + name.toLowerCase(),
            name: name,
            image: String(
              row["Fishing Image"] || row["Image URL"] || row.Image || ""
            ).trim(),
            rarity: rarity,
            sheet: "Fish",
            color: color,
            value: "",
            maxDurability: 0,
            internalValue: 0,
            metric: "weight",
            maxWeight: FISH_WEIGHT_MAX,
            weightStep: FISH_WEIGHT_STEP
          });
        });
        return out;
      })
      .catch(function () {
        return [];
      });
  }

  function loadCatalog() {
    if (catalogPromise) return catalogPromise;
    catalogPromise = Promise.all(
      TRADE_SHEETS.map(function (meta) {
        return fetchSheet(meta.sheet).then(function (rows) {
          return rows.map(function (row) {
            var name = String(row.Name || "").trim();
            var duraRaw = String(row.Durability || "").trim();
            var inv = String(row["Durability Invisible"] || "")
              .trim()
              .toLowerCase();
            var duraInvisible = /^(yes|true|1|ticked|checked|on|y)$/i.test(inv);
            var maxDurability = 0;
            if (!duraInvisible && duraRaw.indexOf("/") !== -1) {
              maxDurability = parseInt(duraRaw.split("/")[1], 10) || 0;
              if (maxDurability < 1) maxDurability = 0;
            }
            var internalRaw = String(row["Internal Value"] || "").trim().replace(/,/g, "");
            var internalValue = parseFloat(internalRaw);
            if (!Number.isFinite(internalValue) || internalValue < 0) internalValue = 0;
            return {
              id: meta.sheet + "::" + name.toLowerCase(),
              name: name,
              image: String(row["Image URL"] || row.Image || "").trim(),
              rarity: meta.rarity,
              sheet: meta.sheet,
              color: meta.color,
              value: String(row["Average Value"] || row["Ranged Value"] || "").trim(),
              maxDurability: maxDurability,
              internalValue: internalValue
            };
          });
        });
      }).concat([loadFishCatalog()])
    ).then(function (groups) {
      catalog = [];
      groups.forEach(function (g) {
        catalog = catalog.concat(g);
      });
      catalogReady = true;
      return catalog;
    });
    return catalogPromise;
  }

  function readLocalPostsFallback() {
    try {
      var raw = localStorage.getItem(POSTS_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  function readPosts() {
    return Array.isArray(postsCache) ? postsCache.slice() : [];
  }

  function authHeaders() {
    var token =
      typeof window.bsvGetAuthToken === "function" ? window.bsvGetAuthToken() : null;
    var headers = { Accept: "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    return headers;
  }

  function fetchPosts(opts) {
    opts = opts || {};
    if (postsFetchInFlight && !opts.force) return postsFetchInFlight;
    var gen = ++postsFetchGen;
    postsFetchInFlight = fetch(authApiUrl("api/live-trading/posts"), {
      headers: { Accept: "application/json" },
      cache: "no-store"
    })
      .then(function (res) {
        return res.json().catch(function () {
          return null;
        });
      })
      .then(function (data) {
        if (gen !== postsFetchGen) return postsCache;
        if (data && Array.isArray(data.posts)) {
          postsCache = data.posts;
        } else if (!postsCache.length) {
          postsCache = readLocalPostsFallback();
        }
        syncPastePreviousButton();
        renderFeed();
        return postsCache;
      })
      .catch(function () {
        if (gen !== postsFetchGen) return postsCache;
        if (!postsCache.length) postsCache = readLocalPostsFallback();
        syncPastePreviousButton();
        renderFeed();
        return postsCache;
      })
      .then(function (list) {
        if (gen === postsFetchGen) postsFetchInFlight = null;
        return list;
      });
    return postsFetchInFlight;
  }

  function currentPollMs() {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return POSTS_POLL_HIDDEN_MS;
    }
    return POSTS_POLL_MS;
  }

  function schedulePostsPoll() {
    if (postsPollTimer) clearTimeout(postsPollTimer);
    postsPollTimer = setTimeout(function () {
      fetchPosts({ force: true }).finally(function () {
        schedulePostsPoll();
      });
    }, currentPollMs());
  }

  function startPostsPolling() {
    schedulePostsPoll();
    if (window.__bsvLtPollVisBound) return;
    window.__bsvLtPollVisBound = true;
    document.addEventListener("visibilitychange", function () {
      schedulePostsPoll();
      if (document.visibilityState === "visible") fetchPosts({ force: true });
    });
  }

  function authorFromSession() {
    var discord = currentSession.discord || currentSession.user || null;
    return {
      discordId: discord && discord.id ? String(discord.id) : "",
      discordUsername: discord && discord.username ? String(discord.username) : "",
      discordDisplayName: discord
        ? discord.displayName || discord.username || "Trader"
        : "Trader",
      discordAvatar: (discord && discord.avatarUrl) || ""
    };
  }

  function sessionDiscordId() {
    var discord = currentSession.discord || currentSession.user || null;
    if (!discord) return "";
    return String(discord.id || discord.userId || discord.discordId || "").trim();
  }

  function isOwnPost(post) {
    if (!post || !post.author) return false;
    var myId = sessionDiscordId();
    var postId = String(post.author.discordId || post.author.id || "").trim();
    if (myId && postId && myId === postId) return true;
    var a = authorFromSession();
    return (
      !!a.discordUsername &&
      !!post.author.discordUsername &&
      a.discordUsername.toLowerCase() ===
        String(post.author.discordUsername).toLowerCase()
    );
  }

  function isLiveTradingAdmin() {
    return sessionDiscordId() === LT_OWNER_DISCORD_ID;
  }

  var viewerFlags = { communityStaff: false, checkedAt: 0 };
  var VIEWER_FLAGS_CACHE_MS = 30 * 1000;

  function isCommunityStaffViewer() {
    return !!viewerFlags.communityStaff;
  }

  function refreshViewerFlags(force) {
    if (!isLoggedIn()) {
      viewerFlags = { communityStaff: false, checkedAt: 0 };
      return Promise.resolve(viewerFlags);
    }
    if (
      !force &&
      viewerFlags.checkedAt &&
      Date.now() - viewerFlags.checkedAt < VIEWER_FLAGS_CACHE_MS
    ) {
      return Promise.resolve(viewerFlags);
    }
    return fetch(authApiUrl("api/live-trading/me"), {
      headers: authHeaders()
    })
      .then(function (res) {
        return res.json().catch(function () {
          return null;
        });
      })
      .then(function (data) {
        data = data || {};
        viewerFlags = {
          communityStaff: !!data.communityStaff,
          checkedAt: Date.now()
        };
        return viewerFlags;
      })
      .catch(function () {
        viewerFlags = { communityStaff: false, checkedAt: Date.now() };
        return viewerFlags;
      });
  }

  function canDeletePost(post) {
    if (isOwnPost(post)) return true;
    if (isLiveTradingAdmin()) return true;
    if (isCommunityStaffViewer() && !isSiteOwnerAuthor(post && post.author)) {
      return true;
    }
    return false;
  }

  function canEditPost(post) {
    return isOwnPost(post);
  }

  function isSiteOwnerAuthor(author) {
    author = author || {};
    return String(author.discordId || author.id || "").trim() === LT_OWNER_DISCORD_ID;
  }

  function ownerBadgeHtml() {
    return (
      '<span class="lt-post__owner-tag" data-lt-tip="Owner of BlockSpin Values">' +
      '<span class="lt-post__owner-mark" aria-hidden="true">' +
      '<svg class="lt-post__owner-icon" viewBox="0 0 24 24" width="14" height="14">' +
      '<path fill="currentColor" d="M5 16.5l-1.8-9.2 4.1 3.1L12 4.2l4.7 6.2 4.1-3.1L19 16.5H5zm-.5 1.8h15v2.2h-15v-2.2z"/>' +
      "</svg>" +
      "</span>" +
      '<span class="lt-post__owner-text">Owner</span>' +
      "</span>"
    );
  }

  function isScammerAuthor(author) {
    return !!(author && author.scammer);
  }

  function scammerBadgeHtml() {
    return (
      '<span class="lt-post__scammer-tag" data-lt-tip="This user has previously been caught scamming. Trade with caution">' +
      '<span class="lt-post__scammer-mark" aria-hidden="true">' +
      '<svg class="lt-post__scammer-icon" viewBox="0 0 24 24" width="14" height="14">' +
      '<path fill="currentColor" d="M12 2.4L1.6 20.6c-.25.44.07 1 .58 1h19.64c.51 0 .83-.56.58-1L12 2.4zm0 5.4c.55 0 1 .4 1 .95v5.7c0 .55-.45 1-1 1s-1-.45-1-1v-5.7c0-.55.45-.95 1-.95zm0 10.7a1.15 1.15 0 100-2.3 1.15 1.15 0 000 2.3z"/>' +
      "</svg>" +
      "</span>" +
      '<span class="lt-post__scammer-text">Scammer</span>' +
      "</span>"
    );
  }

  function isTrustedTraderAuthor(author) {
    return !!(author && author.trustedTrader);
  }

  function trustedTraderBadgeHtml() {
    return (
      '<span class="lt-post__trusted-tag" data-lt-tip="This user has 200+ vouches proving they’re trusted in trades. For bigger trades, we still recommend using a Middleman to keep things safe.">' +
      '<span class="lt-post__trusted-mark" aria-hidden="true">' +
      '<svg class="lt-post__trusted-icon" viewBox="0 0 24 24" width="14" height="14">' +
      '<path fill="currentColor" d="M12 2.2l7.2 3.1v6.2c0 4.7-3.1 8.9-7.2 10.1-4.1-1.2-7.2-5.4-7.2-10.1V5.3L12 2.2zm0 2.3L6.8 6.6v4.9c0 3.5 2.3 6.7 5.2 7.8 2.9-1.1 5.2-4.3 5.2-7.8V6.6L12 4.5zm-.1 10.9l-3.3-3.3 1.3-1.3 2 2 4.1-4.1 1.3 1.3-5.4 5.4z"/>' +
      "</svg>" +
      "</span>" +
      '<span class="lt-post__trusted-text">Trusted Trader</span>' +
      "</span>"
    );
  }

  function authorDisplayName(author) {
    author = author || {};
    return (
      author.discordDisplayName ||
      author.discordName ||
      author.discordUsername ||
      author.robloxUsername ||
      "Trader"
    );
  }

  function authorHandle(author) {
    author = author || {};
    var u = author.discordUsername || "";
    return u ? "@" + u : "";
  }

  function authorDiscordProfileUrl(author) {
    author = author || {};
    var id = String(author.discordId || author.id || "").trim();
    if (!id || !/^\d{5,32}$/.test(id)) return "";
    return "https://discord.com/users/" + encodeURIComponent(id);
  }

  function authorAvatar(author) {
    author = author || {};
    if (author.discordAvatar) return author.discordAvatar;
    if (author.robloxAvatar) return author.robloxAvatar;
    if (author.robloxUserId) {
      return (
        "https://www.roblox.com/headshot-thumbnail/image?userId=" +
        encodeURIComponent(author.robloxUserId) +
        "&width=150&height=150&format=png"
      );
    }
    return "";
  }

  function timeAgo(ts) {
    var sec = Math.max(0, Math.floor((Date.now() - Number(ts || 0)) / 1000));
    if (sec < 60) return "just now";
    if (sec < 3600) return Math.floor(sec / 60) + "m ago";
    if (sec < 86400) return Math.floor(sec / 3600) + "h ago";
    return Math.floor(sec / 86400) + "d ago";
  }

  /* —— Sections nav (unchanged behavior) —— */
  function closeSectionsMenu() {
    document.body.classList.remove("sections-menu-open");
    var toggle = document.getElementById("sections-menu-toggle");
    var overlay = document.getElementById("sections-menu-overlay");
    if (toggle) {
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open sections menu");
    }
    if (overlay) {
      overlay.classList.remove("active");
      overlay.hidden = true;
    }
    document.body.style.overflow = "";
  }

  function openSectionsMenu() {
    document.body.classList.add("sections-menu-open");
    var toggle = document.getElementById("sections-menu-toggle");
    var overlay = document.getElementById("sections-menu-overlay");
    if (toggle) {
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close sections menu");
    }
    if (overlay) {
      overlay.hidden = false;
      overlay.classList.add("active");
    }
    document.body.style.overflow = "hidden";
  }

  function initMobileSectionsMenu() {
    var toggle = document.getElementById("sections-menu-toggle");
    var overlay = document.getElementById("sections-menu-overlay");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      if (document.body.classList.contains("sections-menu-open")) closeSectionsMenu();
      else openSectionsMenu();
    });
    if (overlay) overlay.addEventListener("click", closeSectionsMenu);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var msgCheck = document.getElementById("lt-msgcheck-modal");
        if (msgCheck && !msgCheck.hidden) {
          if (msgCheckResolver) {
            var resolveMsg = msgCheckResolver;
            msgCheckResolver = null;
            resolveMsg(false);
          }
          closeMessageCheckModal();
          return;
        }
        var guidelines = document.getElementById("lt-guidelines-modal");
        if (guidelines && !guidelines.hidden) {
          if (guidelinesAckResolver) {
            var resolve = guidelinesAckResolver;
            guidelinesAckResolver = null;
            resolve(false);
          }
          closeTradeGuidelines();
          return;
        }
        closeSectionsMenu();
        closePicker();
        closeHiddenAuthorsModal();
        setComposerOpen(false);
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeSectionsMenu();
    });
  }

  function buildSectionsNav() {
    var nav = document.getElementById("sections-nav");
    if (!nav || typeof getSectionRegistry !== "function") return;
    nav.innerHTML = "";
    var extrasHeaderShown = false;
    getSectionRegistry().forEach(function (cfg) {
      if (cfg.navGroup === "extras" && !extrasHeaderShown) {
        var gap = document.createElement("div");
        gap.className = "nav-gap";
        nav.appendChild(gap);
        var extrasHeader = document.createElement("div");
        extrasHeader.className = "nav-extras-header";
        extrasHeader.setAttribute("data-i18n", "nav.extras");
        extrasHeader.textContent = t("nav.extras", "Extras");
        nav.appendChild(extrasHeader);
        extrasHeaderShown = true;
      }

      var btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.section = cfg.title;
      if (typeof appendSectionNavIcon === "function") {
        appendSectionNavIcon(btn, cfg.title);
      }
      if (cfg.id === "live-trading") {
        btn.classList.add("nav-live-trading", "active");
        var ltLabel = document.createElement("span");
        ltLabel.className = "nav-section-label nav-live-trading__label";
        ltLabel.textContent = i18nSection(cfg.title);
        var ltNew = document.createElement("span");
        ltNew.className = "nav-live-trading__new";
        ltNew.setAttribute("aria-hidden", "true");
        ltNew.textContent = "NEW";
        btn.appendChild(ltLabel);
        btn.appendChild(ltNew);
      } else {
        var label = document.createElement("span");
        label.className = "nav-section-label";
        label.textContent = i18nSection(cfg.title);
        btn.appendChild(label);
      }
      btn.addEventListener("click", function () {
        closeSectionsMenu();
        if (cfg.id === "live-trading") return;
        if (cfg.pageHref) {
          window.location.href = sitePath(cfg.pageHref);
          return;
        }
        var hash = "#sec=" + encodeURIComponent(cfg.title);
        window.location.href = sitePath("") + hash;
      });
      nav.appendChild(btn);
    });
  }

  function openSharedLogin() {
    var opts = { requireGuild: true, purpose: "live-trading" };
    if (typeof window.bsvOpenLoginModal === "function") {
      window.bsvOpenLoginModal(opts);
      return;
    }
    setTimeout(function () {
      if (typeof window.bsvOpenLoginModal === "function") window.bsvOpenLoginModal(opts);
    }, 50);
  }

  var DISCORD_INVITE_FALLBACK = "https://discord.gg/QbapryYUUx";
  // Optional direct Apps Script URL. Prefer Railway env LT_REPORT_APPS_SCRIPT_URL via bot proxy.
  var LT_REPORT_APPS_SCRIPT_URL = "";
  var LT_REPORT_SHEET_ID = "1FEwl6yfOIVm79d1OlNMy8olYVngcdrVocWi462DXWRk";
  var guildMemberCache = {
    checkedAt: 0,
    inGuild: false,
    inviteUrl: DISCORD_INVITE_FALLBACK
  };
  var GUILD_CACHE_MS = 30 * 1000;

  function isLoggedIn() {
    return !!(currentSession && currentSession.ready);
  }

  function authApiUrl(path) {
    var p = String(path || "").replace(/^\/+/, "");
    if (typeof window.bsvBotApiUrl === "function") return window.bsvBotApiUrl(p);
    var base =
      window.BSV_BOT_PUBLIC_BASE || "https://bsv-bot-production.up.railway.app";
    return String(base).replace(/\/+$/, "") + "/" + p;
  }

  function showJoinDiscordPrompt(inviteUrl, message) {
    var modal = document.getElementById("lt-join-discord");
    var link = document.getElementById("lt-join-discord-link");
    var body = modal ? modal.querySelector(".lt-join__body") : null;
    var url = inviteUrl || guildMemberCache.inviteUrl || DISCORD_INVITE_FALLBACK;
    if (link) link.href = url;
    if (body) {
      body.textContent = message || "Required to create and interact with trades.";
    }
    if (modal) {
      modal.hidden = false;
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function hideJoinDiscordPrompt() {
    var modal = document.getElementById("lt-join-discord");
    if (modal) modal.hidden = true;
  }

  function checkGuildMembership(force) {
    var token =
      typeof window.bsvGetAuthToken === "function" ? window.bsvGetAuthToken() : null;
    if (!token) {
      return Promise.resolve({
        loggedIn: false,
        inGuild: false,
        inviteUrl: DISCORD_INVITE_FALLBACK
      });
    }
    if (
      !force &&
      guildMemberCache.checkedAt &&
      Date.now() - guildMemberCache.checkedAt < GUILD_CACHE_MS
    ) {
      return Promise.resolve({
        loggedIn: true,
        inGuild: guildMemberCache.inGuild,
        inviteUrl: guildMemberCache.inviteUrl
      });
    }
    return fetch(authApiUrl("api/auth/guild-member"), {
      headers: { Authorization: "Bearer " + token }
    })
      .then(function (res) {
        return res.json().catch(function () {
          return null;
        });
      })
      .then(function (data) {
        data = data || {};
        guildMemberCache = {
          checkedAt: Date.now(),
          inGuild: !!data.inGuild,
          inviteUrl: data.inviteUrl || DISCORD_INVITE_FALLBACK
        };
        return {
          loggedIn: !!data.loggedIn,
          inGuild: !!data.inGuild,
          inviteUrl: guildMemberCache.inviteUrl,
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
      });
  }

  /**
   * Browse is public. Create / interact need Discord login AND server membership.
   * Returns a Promise<boolean>.
   */
  function requireLoginForAction() {
    if (!isLoggedIn()) {
      openSharedLogin();
      return Promise.resolve(false);
    }
    return checkGuildMembership(false).then(function (data) {
      if (data.inGuild) return true;
      // Already logged in but not in server — reopen the trading login modal on step 2.
      openSharedLogin();
      return false;
    });
  }

  function readGuidelinesAckAt() {
    try {
      var n = Number(localStorage.getItem(GUIDELINES_ACK_KEY) || 0);
      return Number.isFinite(n) ? n : 0;
    } catch (_) {
      return 0;
    }
  }

  function needsTradeGuidelines() {
    var last = readGuidelinesAckAt();
    if (!last) return true;
    return Date.now() - last >= GUIDELINES_ACK_MS;
  }

  function closeTradeGuidelines() {
    var modal = document.getElementById("lt-guidelines-modal");
    if (modal) modal.hidden = true;
    pendingOpenComposerAfterGuidelines = false;
  }

  var guidelinesAckResolver = null;

  function acknowledgeTradeGuidelines() {
    try {
      localStorage.setItem(GUIDELINES_ACK_KEY, String(Date.now()));
    } catch (_) {}
    var modal = document.getElementById("lt-guidelines-modal");
    if (modal) modal.hidden = true;
    pendingOpenComposerAfterGuidelines = false;
    if (guidelinesAckResolver) {
      var resolve = guidelinesAckResolver;
      guidelinesAckResolver = null;
      resolve(true);
    }
  }

  function ensureTradeGuidelines() {
    if (!needsTradeGuidelines()) return Promise.resolve(true);
    return new Promise(function (resolve) {
      var modal = document.getElementById("lt-guidelines-modal");
      if (!modal) {
        resolve(true);
        return;
      }
      if (guidelinesAckResolver) {
        guidelinesAckResolver(false);
        guidelinesAckResolver = null;
      }
      guidelinesAckResolver = resolve;
      pendingOpenComposerAfterGuidelines = true;
      modal.hidden = false;
    });
  }

  function applySession(session) {
    session = session || {};
    var discord = session.discord || session.user || null;
    currentSession = {
      ready: !!(session.ready || discord),
      discord: discord,
      user: discord,
      roblox: null
    };
    guildMemberCache.checkedAt = 0;
    guildMemberCache.inGuild = false;
    viewerFlags = { communityStaff: false, checkedAt: 0 };
    var gate = document.getElementById("live-trading-gate");
    var workspace = document.getElementById("live-trading-workspace");
    // Board is always visible; gate stays unused (login modal handles prompts).
    if (gate) gate.hidden = true;
    if (workspace) workspace.hidden = false;
    loadCatalog();
    // Session can arrive after the first posts paint — force a redraw so Delete / owner UI appear.
    lastRenderedPostIds = "";
    refreshViewerFlags(true).then(function () {
      lastRenderedPostIds = "";
      if (postsCache.length) renderFeed({ force: true });
    });
    if (postsCache.length) renderFeed({ force: true });
    fetchPosts({ force: true });
    startPostsPolling();
    syncLiveTradingBoardHeight();
    syncReportFormState();
    return currentSession;
  }

  function refreshSession() {
    if (typeof window.bsvGetAuthSession === "function") {
      return window.bsvGetAuthSession().then(function (session) {
        return applySession(session || {});
      });
    }
    return Promise.resolve(applySession({ ready: false }));
  }

  function bindLoginUi() {
    var openBtn = document.getElementById("live-trading-open-login");
    if (openBtn) {
      openBtn.addEventListener("click", function () {
        openSharedLogin();
        refreshSession();
      });
    }
    document.addEventListener("bsv:authchange", function (e) {
      applySession(e.detail || {});
    });
    document.addEventListener("bsv:languagechange", function () {
      buildSectionsNav();
      refreshSession();
    });
  }

  /* —— Composer / picker / feed —— */
  function syncComposerModeUi() {
    var title = document.querySelector(".lt-composer__title");
    var submit = document.getElementById("lt-submit-post");
    var editing = !!editingPostId;
    if (title) title.textContent = editing ? "Edit trade post" : "New trade post";
    if (submit) submit.textContent = editing ? "Save changes" : "Post trade";
  }

  function setComposerOpen(open) {
    var composer = document.getElementById("lt-composer");
    if (!composer) return;
    composer.hidden = !open;
    if (open) {
      syncComposerModeUi();
      syncPastePreviousButton();
      renderDraftGrids();
      clearComposerError();
    } else {
      editingPostId = null;
      syncComposerModeUi();
      syncPastePreviousButton();
    }
    // Wait two frames so composer layout (incl. open guidelines) is measured correctly.
    requestAnimationFrame(function () {
      requestAnimationFrame(syncLiveTradingBoardHeight);
    });
  }

  function clearComposerError() {
    var err = document.getElementById("lt-composer-error");
    if (!err) return;
    err.hidden = true;
    err.textContent = "";
  }

  function showComposerError(msg) {
    var err = document.getElementById("lt-composer-error");
    if (!err) return;
    err.hidden = false;
    err.textContent = msg;
  }

  function setTagRequiredHint(on) {
    var tags = document.getElementById("lt-want-tags");
    var hint = document.getElementById("lt-want-tags-hint");
    if (!tags) return;
    if (!on) {
      tags.classList.remove("lt-side__tags--required", "is-flicker");
      if (hint) {
        hint.hidden = true;
        hint.classList.remove("is-loud");
      }
      return;
    }
    var already = tags.classList.contains("lt-side__tags--required");
    tags.classList.add("lt-side__tags--required");
    if (hint) {
      hint.hidden = false;
      hint.classList.add("is-loud");
    }
    if (already) {
      tags.classList.remove("is-flicker");
      void tags.offsetWidth;
      tags.classList.add("is-flicker");
      window.clearTimeout(tags._ltFlickerTimer);
      tags._ltFlickerTimer = window.setTimeout(function () {
        tags.classList.remove("is-flicker");
      }, 420);
    }
  }

  function itemHasDurability(entry) {
    if (itemHasWeight(entry)) return false;
    return Math.max(0, Number(entry && entry.maxDurability) || 0) > 0;
  }

  function itemHasWeight(entry) {
    if (!entry) return false;
    if (entry.metric === "weight") return true;
    if (String(entry.id || "").indexOf("fish::") === 0) return true;
    return Math.max(0, Number(entry.maxWeight) || 0) > 0;
  }

  function roundFishWeight(n) {
    var step = FISH_WEIGHT_STEP;
    var max = FISH_WEIGHT_MAX;
    var raw = Number(n);
    if (!Number.isFinite(raw)) raw = max;
    var stepped = Math.round(raw / step) * step;
    return Math.max(0, Math.min(max, Math.round(stepped * 10) / 10));
  }

  function formatWeight(entry) {
    if (!itemHasWeight(entry)) return "";
    var max = roundFishWeight(entry.maxWeight || FISH_WEIGHT_MAX);
    var cur = roundFishWeight(
      entry.weight != null ? entry.weight : max
    );
    return cur.toFixed(1) + "/" + max.toFixed(1);
  }

  function formatWeightForSummary(entry) {
    if (!itemHasWeight(entry)) return "";
    var max = roundFishWeight(entry.maxWeight || FISH_WEIGHT_MAX);
    var cur = roundFishWeight(
      entry.weight != null ? entry.weight : max
    );
    if (cur >= max) return "";
    return cur.toFixed(1) + "/" + max.toFixed(1);
  }

  function formatDurability(entry) {
    if (!itemHasDurability(entry)) return "";
    var max = Math.max(1, Number(entry.maxDurability) || 1);
    var cur = Math.max(0, Math.min(max, Number(entry.durability) || max));
    return cur + "/" + max;
  }

  /** Summary text: only show dura when it's below full. */
  function formatDurabilityForSummary(entry) {
    if (!itemHasDurability(entry)) return "";
    var max = Math.max(1, Number(entry.maxDurability) || 1);
    var cur = Math.max(0, Math.min(max, Number(entry.durability) || max));
    if (cur >= max) return "";
    return cur + "/" + max;
  }

  function formatMetricLabel(entry) {
    return formatWeightForSummary(entry) || formatDurabilityForSummary(entry);
  }

  function formatMetricFull(entry) {
    return formatWeight(entry) || formatDurability(entry);
  }

  var MAX_DRAFT_QTY = 99;

  function itemSlotHtml(entry, side, index) {
    var qty = Math.max(1, Math.min(MAX_DRAFT_QTY, Number(entry.qty) || 1));
    var hasDura = itemHasDurability(entry);
    var hasWeight = itemHasWeight(entry);
    var metricLabel = formatMetricFull(entry);
    var idx = escapeAttr(String(index));
    var sideAttr = escapeAttr(side);
    var metricControls = "";
    if (hasWeight) {
      var wMax = roundFishWeight(entry.maxWeight || FISH_WEIGHT_MAX);
      var wCur = roundFishWeight(entry.weight != null ? entry.weight : wMax);
      metricControls =
        '<div class="lt-slot__dura lt-slot__weight" role="group" aria-label="Weight">' +
        '<span class="lt-slot__dura-label">Weight</span>' +
        '<div class="lt-slot__dura-row">' +
        '<button type="button" class="lt-slot__dura-btn lt-slot__weight-btn" data-side="' +
        sideAttr +
        '" data-index="' +
        idx +
        '" data-delta="-0.1" aria-label="Lower weight">−</button>' +
        '<input type="text" inputmode="decimal" class="lt-slot__dura-val lt-slot__weight-val" data-side="' +
        sideAttr +
        '" data-index="' +
        idx +
        '" value="' +
        escapeAttr(wCur.toFixed(1)) +
        '" aria-label="Weight value" autocomplete="off" spellcheck="false">' +
        '<span class="lt-slot__dura-max">/' +
        escapeHtml(wMax.toFixed(1)) +
        "</span>" +
        '<button type="button" class="lt-slot__dura-btn lt-slot__weight-btn" data-side="' +
        sideAttr +
        '" data-index="' +
        idx +
        '" data-delta="0.1" aria-label="Raise weight">+</button>' +
        "</div>" +
        "</div>";
    } else if (hasDura) {
      var dMax = Math.max(1, Number(entry.maxDurability) || 1);
      var dCur = Math.max(0, Math.min(dMax, Number(entry.durability) || dMax));
      metricControls =
        '<div class="lt-slot__dura" role="group" aria-label="Durability">' +
        '<span class="lt-slot__dura-label">Durability</span>' +
        '<div class="lt-slot__dura-row">' +
        '<button type="button" class="lt-slot__dura-btn" data-side="' +
        sideAttr +
        '" data-index="' +
        idx +
        '" data-delta="-1" aria-label="Lower durability">−</button>' +
        '<input type="text" inputmode="numeric" class="lt-slot__dura-val" data-side="' +
        sideAttr +
        '" data-index="' +
        idx +
        '" value="' +
        escapeAttr(String(dCur)) +
        '" aria-label="Durability value" autocomplete="off" spellcheck="false">' +
        '<span class="lt-slot__dura-max">/' +
        escapeHtml(String(dMax)) +
        "</span>" +
        '<button type="button" class="lt-slot__dura-btn" data-side="' +
        sideAttr +
        '" data-index="' +
        idx +
        '" data-delta="1" aria-label="Raise durability">+</button>' +
        "</div>" +
        "</div>";
    }
    return (
      '<div class="lt-slot lt-slot--item lt-slot--qty' +
      (hasDura || hasWeight ? " lt-slot--dura" : "") +
      '" data-id="' +
      escapeAttr(entry.id) +
      '" data-lt-tip="' +
      escapeAttr(
        entry.name +
          " · Qty " +
          qty +
          (metricLabel ? " · " + metricLabel : "")
      ) +
      '">' +
      '<button type="button" class="lt-slot__remove" data-side="' +
      sideAttr +
      '" data-index="' +
      idx +
      '" aria-label="Remove item">&times;</button>' +
      (entry.image
        ? '<img class="lt-slot__img" src="' +
          escapeAttr(entry.image) +
          '" alt="" width="88" height="88" loading="lazy" decoding="async">'
        : '<span class="lt-slot__ph" aria-hidden="true"></span>') +
      '<div class="lt-slot__meta">' +
      metricControls +
      '<div class="lt-slot__qty-ctrl" role="group" aria-label="Quantity">' +
      '<span class="lt-slot__qty-label">Quantity</span>' +
      '<div class="lt-slot__qty-row">' +
      '<button type="button" class="lt-slot__qty-btn" data-side="' +
      sideAttr +
      '" data-index="' +
      idx +
      '" data-delta="-1" aria-label="Decrease quantity">−</button>' +
      '<input type="text" inputmode="numeric" class="lt-slot__qty-val" data-side="' +
      sideAttr +
      '" data-index="' +
      idx +
      '" value="' +
      escapeAttr(String(qty)) +
      '" aria-label="Quantity value" autocomplete="off" spellcheck="false">' +
      '<button type="button" class="lt-slot__qty-btn" data-side="' +
      sideAttr +
      '" data-index="' +
      idx +
      '" data-delta="1" aria-label="Increase quantity">+</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function renderSideGrid(side) {
    var el = document.getElementById(
      side === "giving" ? "lt-giving-grid" : "lt-wanting-grid"
    );
    if (!el) return;
    var list = draft[side] || [];
    var html = [];
    html.push(
      '<button type="button" class="lt-slot lt-slot--add" data-add="' +
        side +
        '">' +
        '<span class="lt-slot__add-plus" aria-hidden="true">+</span>' +
        '<span class="lt-slot__add-label">Add Item</span>' +
        "</button>"
    );
    list.forEach(function (entry, index) {
      html.push(itemSlotHtml(entry, side, index));
    });
    var empties = Math.max(0, EMPTY_SLOT_COUNT - list.length);
    for (var i = 0; i < empties; i++) {
      html.push('<div class="lt-slot lt-slot--empty" aria-hidden="true"></div>');
    }
    el.innerHTML = html.join("");
  }

  function renderDraftGrids() {
    renderSideGrid("giving");
    renderSideGrid("wanting");
    var lfoBtn = document.getElementById("lt-add-lfo");
    var nlfoBtn = document.getElementById("lt-add-nlfo");
    if (lfoBtn) lfoBtn.classList.toggle("is-on", !!draft.lookingForOffers);
    if (nlfoBtn) nlfoBtn.classList.toggle("is-on", !!draft.notLookingForOffers);
  }

  function removeDraftItem(side, index) {
    var list = draft[side] || [];
    var i = Number(index);
    if (!Number.isFinite(i) || i < 0 || i >= list.length) return;
    list.splice(i, 1);
    draft[side] = list;
    renderDraftGrids();
  }

  function draftSlotEl(side, index) {
    var grid = document.getElementById(
      side === "giving" ? "lt-giving-grid" : "lt-wanting-grid"
    );
    if (!grid) return null;
    return grid.querySelectorAll(".lt-slot--item")[index] || null;
  }

  function syncDraftSlotTitle(side, index) {
    var list = draft[side] || [];
    var i = Number(index);
    if (!Number.isFinite(i) || i < 0 || i >= list.length) return;
    var slot = draftSlotEl(side, i);
    if (!slot) return;
    var entry = list[i];
    var qty = Math.max(1, Math.min(MAX_DRAFT_QTY, Number(entry.qty) || 1));
    var label = formatMetricFull(entry);
    slot.setAttribute(
      "data-lt-tip",
      entry.name + " · Qty " + qty + (label ? " · " + label : "")
    );
  }

  function syncDraftDuraLabel(side, index) {
    var list = draft[side] || [];
    var i = Number(index);
    if (!Number.isFinite(i) || i < 0 || i >= list.length) return;
    var slot = draftSlotEl(side, i);
    if (!slot) return;
    var entry = list[i];
    var val = slot.querySelector(".lt-slot__dura-val");
    var maxEl = slot.querySelector(".lt-slot__dura-max");
    if (val) {
      if (itemHasWeight(entry)) {
        var wMax = roundFishWeight(entry.maxWeight || FISH_WEIGHT_MAX);
        var wCur = roundFishWeight(entry.weight != null ? entry.weight : wMax);
        if (document.activeElement !== val) val.value = wCur.toFixed(1);
        if (maxEl) maxEl.textContent = "/" + wMax.toFixed(1);
      } else if (itemHasDurability(entry)) {
        var dMax = Math.max(1, Number(entry.maxDurability) || 1);
        var dCur = Math.max(0, Math.min(dMax, Number(entry.durability) || dMax));
        if (document.activeElement !== val) val.value = String(dCur);
        if (maxEl) maxEl.textContent = "/" + dMax;
      }
    }
    syncDraftSlotTitle(side, i);
  }

  function syncDraftQtyLabel(side, index) {
    var list = draft[side] || [];
    var i = Number(index);
    if (!Number.isFinite(i) || i < 0 || i >= list.length) return;
    var slot = draftSlotEl(side, i);
    if (!slot) return;
    var qty = Math.max(1, Math.min(MAX_DRAFT_QTY, Number(list[i].qty) || 1));
    var val = slot.querySelector(".lt-slot__qty-val");
    if (val && document.activeElement !== val) val.value = String(qty);
    syncDraftSlotTitle(side, i);
  }

  function commitDraftQtyInput(side, index, raw) {
    var list = draft[side] || [];
    var i = Number(index);
    if (!Number.isFinite(i) || i < 0 || i >= list.length) return;
    var parsed = parseInt(String(raw == null ? "" : raw).replace(/[^\d]/g, ""), 10);
    if (!Number.isFinite(parsed)) {
      syncDraftQtyLabel(side, i);
      return;
    }
    list[i].qty = Math.max(1, Math.min(MAX_DRAFT_QTY, parsed));
    draft[side] = list;
    syncDraftQtyLabel(side, i);
  }

  function commitDraftMetricInput(side, index, raw) {
    var list = draft[side] || [];
    var i = Number(index);
    if (!Number.isFinite(i) || i < 0 || i >= list.length) return;
    var entry = list[i];
    if (itemHasWeight(entry)) {
      var parsedW = parseFloat(String(raw == null ? "" : raw).replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(parsedW)) {
        syncDraftDuraLabel(side, i);
        return;
      }
      entry.weight = roundFishWeight(parsedW);
      entry.maxWeight = roundFishWeight(entry.maxWeight || FISH_WEIGHT_MAX);
      entry.metric = "weight";
      draft[side] = list;
      syncDraftDuraLabel(side, i);
      return;
    }
    if (!itemHasDurability(entry)) return;
    var max = Math.max(1, Number(entry.maxDurability) || 1);
    var parsedD = parseInt(String(raw == null ? "" : raw).replace(/[^\d]/g, ""), 10);
    if (!Number.isFinite(parsedD)) {
      syncDraftDuraLabel(side, i);
      return;
    }
    entry.durability = Math.max(0, Math.min(max, parsedD));
    draft[side] = list;
    syncDraftDuraLabel(side, i);
  }

  function adjustDraftQty(side, index, delta, soft) {
    var list = draft[side] || [];
    var i = Number(index);
    if (!Number.isFinite(i) || i < 0 || i >= list.length) return false;
    var entry = list[i];
    var cur = Math.max(1, Math.min(MAX_DRAFT_QTY, Number(entry.qty) || 1));
    var next = Math.max(1, Math.min(MAX_DRAFT_QTY, cur + (Number(delta) || 0)));
    if (next === cur) return false;
    entry.qty = next;
    draft[side] = list;
    if (soft) syncDraftQtyLabel(side, i);
    else renderDraftGrids();
    return true;
  }

  function adjustDraftDurability(side, index, delta, soft) {
    var list = draft[side] || [];
    var i = Number(index);
    if (!Number.isFinite(i) || i < 0 || i >= list.length) return false;
    var entry = list[i];
    if (!itemHasDurability(entry)) return false;
    var max = Math.max(1, Number(entry.maxDurability) || 1);
    var cur = Math.max(0, Math.min(max, Number(entry.durability) || max));
    var next = Math.max(0, Math.min(max, cur + (Number(delta) || 0)));
    if (next === cur) return false;
    entry.durability = next;
    draft[side] = list;
    if (soft) syncDraftDuraLabel(side, i);
    else renderDraftGrids();
    return true;
  }

  function adjustDraftWeight(side, index, delta, soft) {
    var list = draft[side] || [];
    var i = Number(index);
    if (!Number.isFinite(i) || i < 0 || i >= list.length) return false;
    var entry = list[i];
    if (!itemHasWeight(entry)) return false;
    var max = roundFishWeight(entry.maxWeight || FISH_WEIGHT_MAX);
    var cur = roundFishWeight(entry.weight != null ? entry.weight : max);
    var next = roundFishWeight(cur + (Number(delta) || 0));
    if (next === cur) return false;
    entry.weight = next;
    entry.maxWeight = max;
    entry.metric = "weight";
    draft[side] = list;
    if (soft) syncDraftDuraLabel(side, i);
    else renderDraftGrids();
    return true;
  }

  var slotHoldTimer = null;
  var slotHoldInterval = null;

  function stopSlotHold() {
    if (slotHoldTimer) {
      window.clearTimeout(slotHoldTimer);
      slotHoldTimer = null;
    }
    if (slotHoldInterval) {
      window.clearInterval(slotHoldInterval);
      slotHoldInterval = null;
    }
  }

  function startSlotHold(btn) {
    stopSlotHold();
    if (!btn) return;
    var side = btn.getAttribute("data-side");
    var index = btn.getAttribute("data-index");
    var delta = btn.getAttribute("data-delta");
    var isQty = btn.classList.contains("lt-slot__qty-btn");
    var isWeight = btn.classList.contains("lt-slot__weight-btn");
    var tick = function () {
      if (isQty) return adjustDraftQty(side, index, delta, true);
      if (isWeight) return adjustDraftWeight(side, index, delta, true);
      return adjustDraftDurability(side, index, delta, true);
    };
    tick();
    slotHoldTimer = window.setTimeout(function () {
      slotHoldInterval = window.setInterval(function () {
        if (!tick()) stopSlotHold();
      }, 55);
    }, 220);
  }

  function addDraftItem(side, item) {
    var list = draft[side] || [];
    var hasWeight = itemHasWeight(item);
    var maxDura = hasWeight ? 0 : Math.max(0, Number(item.maxDurability) || 0);
    var defaultDura = maxDura > 0 ? maxDura : null;
    var defaultWeight = hasWeight
      ? roundFishWeight(item.maxWeight || FISH_WEIGHT_MAX)
      : null;
    var existing = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== item.id) continue;
      var sameMetric = false;
      if (hasWeight) {
        sameMetric =
          itemHasWeight(list[i]) &&
          roundFishWeight(list[i].weight) === defaultWeight;
      } else if (maxDura <= 0) {
        sameMetric = !itemHasDurability(list[i]) && !itemHasWeight(list[i]);
      } else {
        sameMetric = Number(list[i].durability) === defaultDura;
      }
      if (sameMetric) {
        existing = list[i];
        break;
      }
    }
    if (existing) {
      existing.qty = Math.min(
        MAX_DRAFT_QTY,
        Math.max(1, Number(existing.qty) || 1) + 1
      );
    } else {
      var entry = {
        id: item.id,
        name: item.name,
        rarity: item.rarity,
        color: item.color,
        image: item.image || "",
        qty: 1
      };
      if (hasWeight) {
        entry.metric = "weight";
        entry.maxWeight = roundFishWeight(item.maxWeight || FISH_WEIGHT_MAX);
        entry.weight = defaultWeight;
      } else if (maxDura > 0) {
        entry.maxDurability = maxDura;
        entry.durability = defaultDura;
      }
      list.push(entry);
    }
    draft[side] = list;
    renderDraftGrids();
  }

  function toggleLfo() {
    draft.lookingForOffers = !draft.lookingForOffers;
    if (draft.lookingForOffers) draft.notLookingForOffers = false;
    if (draft.lookingForOffers || draft.notLookingForOffers) {
      setTagRequiredHint(false);
      clearComposerError();
    }
    renderDraftGrids();
  }

  function toggleNlfo() {
    draft.notLookingForOffers = !draft.notLookingForOffers;
    if (draft.notLookingForOffers) draft.lookingForOffers = false;
    if (draft.lookingForOffers || draft.notLookingForOffers) {
      setTagRequiredHint(false);
      clearComposerError();
    }
    renderDraftGrids();
  }

  function resetDraft() {
    draft = {
      giving: [],
      wanting: [],
      givingCash: 0,
      wantingCash: 0,
      lookingForOffers: false,
      notLookingForOffers: false
    };
    editingPostId = null;
    var gc = document.getElementById("lt-giving-cash");
    var wc = document.getElementById("lt-wanting-cash");
    if (gc) gc.value = "";
    if (wc) wc.value = "";
    syncComposerModeUi();
    renderDraftGrids();
    clearComposerError();
    setTagRequiredHint(false);
  }

  function cloneDraftItems(side) {
    var items = side && Array.isArray(side.items) ? side.items : [];
    return items.map(function (it) {
      var entry = {
        id: it.id,
        name: it.name,
        rarity: it.rarity,
        color: it.color,
        image: it.image || "",
        qty: Math.max(1, Math.min(MAX_DRAFT_QTY, Number(it.qty) || 1))
      };
      if (itemHasWeight(it)) {
        entry.metric = "weight";
        entry.maxWeight = roundFishWeight(it.maxWeight || FISH_WEIGHT_MAX);
        entry.weight = roundFishWeight(
          it.weight != null ? it.weight : entry.maxWeight
        );
      } else if (itemHasDurability(it)) {
        var max = Math.max(1, Number(it.maxDurability) || 1);
        entry.maxDurability = max;
        entry.durability = Math.max(
          0,
          Math.min(max, Number(it.durability) || max)
        );
      }
      return entry;
    });
  }

  function loadDraftFromPost(post) {
    var giving = post && post.giving ? post.giving : {};
    var wanting = post && post.wanting ? post.wanting : {};
    draft = {
      giving: cloneDraftItems(giving),
      wanting: cloneDraftItems(wanting),
      givingCash: Math.max(0, Math.floor(Number(giving.cash) || 0)),
      wantingCash: Math.max(0, Math.floor(Number(wanting.cash) || 0)),
      lookingForOffers: !!wanting.lookingForOffers,
      notLookingForOffers: !!wanting.notLookingForOffers
    };
    var gc = document.getElementById("lt-giving-cash");
    var wc = document.getElementById("lt-wanting-cash");
    if (gc) gc.value = draft.givingCash ? String(draft.givingCash) : "";
    if (wc) wc.value = draft.wantingCash ? String(draft.wantingCash) : "";
    setTagRequiredHint(false);
    clearComposerError();
    renderDraftGrids();
  }

  function findLatestOwnPost() {
    if (!sessionDiscordId()) return null;
    var latest = null;
    var latestAt = -1;
    var fallback = null;
    var fallbackAt = -1;
    for (var i = 0; i < postsCache.length; i++) {
      var post = postsCache[i];
      if (!post || !isOwnPost(post)) continue;
      var at = Number(post.createdAt) || 0;
      // Prefer a different post when editing; fall back to the edited one.
      if (editingPostId && String(post.id) === String(editingPostId)) {
        if (at >= fallbackAt) {
          fallbackAt = at;
          fallback = post;
        }
        continue;
      }
      if (at >= latestAt) {
        latestAt = at;
        latest = post;
      }
    }
    return latest || fallback;
  }

  function syncPastePreviousButton() {
    var btn = document.getElementById("lt-paste-previous");
    if (!btn) return;
    var hasPrev = !!findLatestOwnPost();
    btn.hidden = !hasPrev;
  }

  function pastePreviousPost() {
    var post = findLatestOwnPost();
    if (!post) {
      showComposerError("No previous post to paste.");
      syncPastePreviousButton();
      return;
    }
    loadDraftFromPost(post);
    clearComposerError();
  }

  function startEditPost(id) {
    var postId = String(id || "").trim();
    if (!postId) return;
    var post = null;
    for (var i = 0; i < postsCache.length; i++) {
      if (postsCache[i] && String(postsCache[i].id) === postId) {
        post = postsCache[i];
        break;
      }
    }
    if (!post || !canEditPost(post)) return;
    editingPostId = post.id;
    loadDraftFromPost(post);
    setComposerOpen(true);
    loadCatalog();
    var composer = document.getElementById("lt-composer");
    if (composer && typeof composer.scrollIntoView === "function") {
      composer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openPicker(side) {
    pickerSide = side;
    pickerRarity = "all";
    var picker = document.getElementById("lt-picker");
    var search = document.getElementById("lt-picker-search");
    if (search) search.value = "";
    if (picker) {
      picker.hidden = false;
      document.body.classList.add("lt-picker-open");
    }
    var title = document.getElementById("lt-picker-title");
    if (title) {
      title.textContent = side === "giving" ? "Add to I have" : "Add to I want";
    }
    loadCatalog().then(function () {
      renderPickerRarities();
      renderPickerGrid();
    });
  }

  function closePicker() {
    var picker = document.getElementById("lt-picker");
    if (picker) picker.hidden = true;
    document.body.classList.remove("lt-picker-open");
  }

  function rarityColor(rarity) {
    if (rarity === "all") return "#94a3b8";
    for (var i = 0; i < TRADE_SHEETS.length; i++) {
      if (TRADE_SHEETS[i].rarity === rarity) return TRADE_SHEETS[i].color;
    }
    return "#94a3b8";
  }

  function renderPickerRarities() {
    var el = document.getElementById("lt-picker-rarities");
    if (!el) return;
    var labels = ["all"].concat(
      TRADE_SHEETS.map(function (s) {
        return s.rarity;
      })
    );
    el.innerHTML = labels
      .map(function (r) {
        var label = r === "all" ? "All" : r;
        var color = rarityColor(r);
        var active = pickerRarity === r;
        return (
          '<button type="button" class="lt-picker__rarity' +
          (active ? " is-active" : "") +
          '" data-rarity="' +
          escapeAttr(r) +
          '" style="--lt-rarity:' +
          escapeAttr(color) +
          '">' +
          escapeHtml(label) +
          "</button>"
        );
      })
      .join("");
  }

  function renderPickerGrid() {
    var grid = document.getElementById("lt-picker-grid");
    var status = document.getElementById("lt-picker-status");
    if (!grid) return;
    if (!catalogReady) {
      if (status) status.textContent = "Loading items…";
      grid.innerHTML = "";
      return;
    }
    var q = String(
      (document.getElementById("lt-picker-search") || {}).value || ""
    )
      .trim()
      .toLowerCase();
    var items = catalog.filter(function (item) {
      if (pickerRarity !== "all" && item.rarity !== pickerRarity) return false;
      if (!q) return true;
      return item.name.toLowerCase().indexOf(q) !== -1;
    });
    if (status) {
      status.textContent = items.length
        ? items.length + " items"
        : "No items match";
    }
    grid.innerHTML = items
      .slice(0, 180)
      .map(function (item) {
        return (
          '<button type="button" class="lt-picker__item" data-id="' +
          escapeAttr(item.id) +
          '">' +
          (item.image
            ? '<img src="' +
              escapeAttr(item.image) +
              '" alt="" width="56" height="56" loading="lazy" decoding="async">'
            : '<span class="lt-picker__ph"></span>') +
          '<span class="lt-picker__item-name">' +
          escapeHtml(item.name) +
          "</span>" +
          '<span class="lt-picker__item-rarity" style="color:' +
          escapeAttr(item.color) +
          '">' +
          escapeHtml(item.rarity) +
          "</span>" +
          "</button>"
        );
      })
      .join("");
  }

  function findCatalogItem(id) {
    for (var i = 0; i < catalog.length; i++) {
      if (catalog[i].id === id) return catalog[i];
    }
    return null;
  }

  function submitPost() {
    requireLoginForAction().then(function (ok) {
      if (!ok) return;
      submitPostAfterAuth();
    });
  }

  var msgCheckResolver = null;

  function closeMessageCheckModal() {
    var modal = document.getElementById("lt-msgcheck-modal");
    if (modal) modal.hidden = true;
  }

  function showMessageCheckModal() {
    return new Promise(function (resolve) {
      var modal = document.getElementById("lt-msgcheck-modal");
      var okBtn = document.getElementById("lt-msgcheck-ok");
      var cancelBtn = document.getElementById("lt-msgcheck-cancel");
      var backdrop = document.getElementById("lt-msgcheck-backdrop");
      if (!modal || !okBtn || !cancelBtn) {
        resolve(true);
        return;
      }
      if (msgCheckResolver) {
        msgCheckResolver(false);
        msgCheckResolver = null;
      }
      msgCheckResolver = resolve;
      function finish(ok) {
        closeMessageCheckModal();
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
        if (backdrop) backdrop.removeEventListener("click", onCancel);
        if (msgCheckResolver === resolve) msgCheckResolver = null;
        resolve(ok);
      }
      function onOk() {
        finish(true);
      }
      function onCancel() {
        finish(false);
      }
      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
      if (backdrop) backdrop.addEventListener("click", onCancel);
      var submitBtn = document.getElementById("lt-submit-post");
      if (submitBtn) {
        okBtn.textContent = editingPostId ? "Got it — save changes" : "Got it — post trade";
      }
      modal.hidden = false;
    });
  }

  function submitPostAfterAuth() {
    clearComposerError();
    draft.givingCash = parseCash(
      (document.getElementById("lt-giving-cash") || {}).value
    );
    draft.wantingCash = parseCash(
      (document.getElementById("lt-wanting-cash") || {}).value
    );

    if (!draft.giving.length && !draft.givingCash) {
      showComposerError("Add at least one item or cash on I have.");
      return;
    }
    if (!draft.lookingForOffers && !draft.notLookingForOffers) {
      setTagRequiredHint(true);
      clearComposerError();
      return;
    }
    setTagRequiredHint(false);

    function mapDraftItem(e) {
      var out = {
        id: e.id,
        name: e.name,
        rarity: e.rarity,
        color: e.color,
        image: e.image || "",
        qty: Math.max(1, Number(e.qty) || 1)
      };
      if (itemHasWeight(e)) {
        out.metric = "weight";
        out.maxWeight = roundFishWeight(e.maxWeight || FISH_WEIGHT_MAX);
        out.weight = roundFishWeight(
          e.weight != null ? e.weight : out.maxWeight
        );
      } else if (itemHasDurability(e)) {
        var max = Math.max(1, Number(e.maxDurability) || 1);
        out.maxDurability = max;
        out.durability = Math.max(0, Math.min(max, Number(e.durability) || max));
      }
      return out;
    }

    var payload = {
      giving: {
        items: draft.giving.map(mapDraftItem),
        cash: draft.givingCash
      },
      wanting: {
        items: draft.wanting.map(mapDraftItem),
        cash: draft.wantingCash,
        lookingForOffers: !!draft.lookingForOffers,
        notLookingForOffers: !!draft.notLookingForOffers
      }
    };

    showMessageCheckModal().then(function (ok) {
      if (!ok) return;
      sendTradePost(payload);
    });
  }

  function sendTradePost(payload) {
    var headers = authHeaders();
    headers["Content-Type"] = "application/json";
    var editingId = editingPostId ? String(editingPostId) : "";
    var url = editingId
      ? authApiUrl(
          "api/live-trading/posts/" + encodeURIComponent(editingId)
        )
      : authApiUrl("api/live-trading/posts");
    fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: headers,
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().catch(function () {
          return null;
        }).then(function (data) {
          return { res: res, data: data };
        });
      })
      .then(function (out) {
        if (!out.res.ok) {
          var err = (out.data && out.data.error) || "post_failed";
          if (err === "guild_required") {
            openSharedLogin();
            return;
          }
          if (err === "user_limit_reached") {
            showComposerError("You already have the maximum number of active posts.");
            return;
          }
          if (err === "rate_limited") {
            var waitMs = Number(out.data && out.data.retryAfterMs) || 0;
            var mins = Math.max(1, Math.ceil(waitMs / 60000));
            showComposerError(
              mins === 1
                ? "You can only create a new post every 5 minutes. Try again in about 1 minute."
                : "You can only create a new post every 5 minutes. Try again in about " +
                    mins +
                    " minutes."
            );
            return;
          }
          if (err === "tag_required") {
            setTagRequiredHint(true);
            clearComposerError();
            return;
          }
          if (err === "not_owner" || err === "not_found") {
            showComposerError("Couldn’t save that post. Try again.");
            return;
          }
          showComposerError(
            editingId
              ? "Couldn’t save changes right now. Try again."
              : "Couldn’t post right now. Try again."
          );
          return;
        }
        if (out.data && out.data.post) {
          if (editingId) {
            postsCache = postsCache.map(function (p) {
              return p && p.id === out.data.post.id ? out.data.post : p;
            });
          } else {
            postsCache = [out.data.post].concat(
              postsCache.filter(function (p) {
                return p && p.id !== out.data.post.id;
              })
            );
          }
        }
        resetDraft();
        setComposerOpen(false);
        renderFeed({ preferTop: !editingId, force: true });
        // Refresh from server shortly after so other clients stay in sync;
        // generation guard prevents a slower in-flight fetch from wiping this post.
        setTimeout(function () {
          fetchPosts({ force: true });
        }, 400);
      })
      .catch(function () {
        showComposerError("Couldn’t reach the server. Try again.");
      });
  }

  function showLtConfirm(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var modal = document.getElementById("lt-delete-confirm");
      var titleEl = document.getElementById("lt-delete-confirm-title");
      var bodyEl = document.getElementById("lt-delete-confirm-body");
      var okBtn = document.getElementById("lt-delete-confirm-yes");
      var cancelBtn = document.getElementById("lt-delete-confirm-no");
      var backdrop = document.getElementById("lt-delete-confirm-backdrop");
      if (!modal || !okBtn || !cancelBtn) {
        resolve(window.confirm(opts.title || "Are you sure?"));
        return;
      }
      function finish(ok) {
        modal.hidden = true;
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
        if (backdrop) backdrop.removeEventListener("click", onCancel);
        resolve(ok);
      }
      function onOk() {
        finish(true);
      }
      function onCancel() {
        finish(false);
      }
      if (titleEl) titleEl.textContent = opts.title || "Are you sure?";
      if (bodyEl) bodyEl.textContent = opts.body || "";
      okBtn.textContent = opts.okLabel || "Confirm";
      okBtn.className =
        "lt-confirm__btn " +
        (opts.danger === false
          ? "lt-confirm__btn--primary"
          : "lt-confirm__btn--danger");
      cancelBtn.textContent = opts.cancelLabel || "Cancel";
      cancelBtn.className = "lt-confirm__btn lt-confirm__btn--ghost";
      modal.hidden = false;
      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
      if (backdrop) backdrop.addEventListener("click", onCancel);
    });
  }

  function confirmTwice(first, second) {
    return showLtConfirm(first).then(function (ok) {
      if (!ok) return false;
      return showLtConfirm(second);
    });
  }

  function readHiddenAuthors() {
    try {
      var raw = localStorage.getItem(HIDDEN_AUTHORS_KEY);
      var list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      return list
        .map(function (entry) {
          if (!entry || typeof entry !== "object") return null;
          var id = String(entry.id || "").trim();
          if (!id) return null;
          return {
            id: id,
            name: String(entry.name || "Trader").trim() || "Trader",
            handle: String(entry.handle || "").trim()
          };
        })
        .filter(Boolean);
    } catch (_) {
      return [];
    }
  }

  function writeHiddenAuthors(list) {
    try {
      localStorage.setItem(HIDDEN_AUTHORS_KEY, JSON.stringify(list || []));
    } catch (_) {}
  }

  function isAuthorHidden(discordId) {
    var id = String(discordId || "").trim();
    if (!id) return false;
    return readHiddenAuthors().some(function (entry) {
      return entry.id === id;
    });
  }

  function hideAuthorEntry(entry) {
    if (!entry || !entry.id) return;
    var list = readHiddenAuthors().filter(function (e) {
      return e.id !== entry.id;
    });
    list.push({
      id: entry.id,
      name: entry.name || "Trader",
      handle: entry.handle || ""
    });
    writeHiddenAuthors(list);
  }

  function unhideAuthorEntry(discordId) {
    var id = String(discordId || "").trim();
    if (!id) return;
    writeHiddenAuthors(
      readHiddenAuthors().filter(function (entry) {
        return entry.id !== id;
      })
    );
  }

  function hiddenAuthorsKey() {
    return readHiddenAuthors()
      .map(function (e) {
        return e.id;
      })
      .sort()
      .join(",");
  }

  function syncProfileHideButton() {
    var btn = document.getElementById("lt-profile-hide");
    if (!btn) return;
    var id = profileOpenDiscordId;
    var ownId = sessionDiscordId();
    if (!id || (ownId && id === ownId)) {
      btn.hidden = true;
      return;
    }
    var hidden = isAuthorHidden(id);
    btn.hidden = false;
    btn.classList.toggle("is-hidden", hidden);
    var tip = hidden
      ? "Unhide posts from this person"
      : "Hide posts from this person";
    btn.setAttribute("data-lt-tip", tip);
    btn.setAttribute("aria-label", tip);
    btn.innerHTML = hidden
      ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4"/><path d="M9.4 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18.4 18.4 0 0 1-4.2 4.8"/><path d="M6.1 6.1C3.7 7.9 2 12 2 12s3.5 7 10 7a10.5 10.5 0 0 0 4.4-.9"/></svg>'
      : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  }

  function renderHiddenAuthorsList() {
    var listEl = document.getElementById("lt-hidden-list");
    var emptyEl = document.getElementById("lt-hidden-empty");
    if (!listEl) return;
    var list = readHiddenAuthors().sort(function (a, b) {
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
    if (!list.length) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    listEl.innerHTML = list
      .map(function (entry) {
        return (
          '<li class="lt-hidden__item" data-hidden-id="' +
          escapeAttr(entry.id) +
          '">' +
          '<div class="lt-hidden__meta">' +
          '<span class="lt-hidden__name">' +
          escapeHtml(entry.name || "Trader") +
          "</span>" +
          (entry.handle
            ? '<span class="lt-hidden__handle">' + escapeHtml(entry.handle) + "</span>"
            : "") +
          "</div>" +
          '<button type="button" class="lt-hidden__unhide" data-lt-unhide="' +
          escapeAttr(entry.id) +
          '">Unhide</button>' +
          "</li>"
        );
      })
      .join("");
  }

  function openHiddenAuthorsModal() {
    var modal = document.getElementById("lt-hidden-modal");
    if (!modal) return;
    renderHiddenAuthorsList();
    modal.hidden = false;
  }

  function closeHiddenAuthorsModal() {
    var modal = document.getElementById("lt-hidden-modal");
    if (modal) modal.hidden = true;
  }

  function requestHideAuthor(discordId) {
    var id = String(discordId || "").trim();
    if (!id) return Promise.resolve(false);
    var author = findAuthorByDiscordId(id) || {};
    var name = authorDisplayName(author) || "this trader";
    var handle = authorHandle(author) || "";
    return confirmTwice(
      {
        title: "Hide posts from " + name + "?",
        body:
          "Their Live Trading posts will be hidden from your feed. You can unhide them anytime from the Hidden tab.",
        okLabel: "Hide posts",
        danger: true
      },
      {
        title: "Are you sure?",
        body:
          "Confirm you want to hide posts from " +
          name +
          ". You can unhide them anytime from the Hidden tab.",
        okLabel: "Yes, hide",
        danger: true
      }
    ).then(function (ok) {
      if (!ok) return false;
      hideAuthorEntry({ id: id, name: name, handle: handle });
      syncProfileHideButton();
      lastRenderedPostIds = "";
      renderFeed({ force: true });
      return true;
    });
  }

  function requestUnhideAuthor(discordId) {
    var id = String(discordId || "").trim();
    if (!id) return Promise.resolve(false);
    var entry =
      readHiddenAuthors().find(function (e) {
        return e.id === id;
      }) || {};
    var author = findAuthorByDiscordId(id) || {};
    var name =
      entry.name || authorDisplayName(author) || "this trader";
    return confirmTwice(
      {
        title: "Unhide posts from " + name + "?",
        body: "Their Live Trading posts will show in your feed again.",
        okLabel: "Unhide posts",
        danger: false
      },
      {
        title: "Are you sure?",
        body: "Confirm you want to unhide posts from " + name + ".",
        okLabel: "Yes, unhide",
        danger: false
      }
    ).then(function (ok) {
      if (!ok) return false;
      unhideAuthorEntry(id);
      syncProfileHideButton();
      renderHiddenAuthorsList();
      lastRenderedPostIds = "";
      renderFeed({ force: true });
      return true;
    });
  }

  function deletePost(id) {
    requireLoginForAction().then(function (ok) {
      if (!ok) return;
      return showLtConfirm({
        title: "Delete this post?",
        body: "This can’t be undone.",
        okLabel: "Delete",
        danger: true
      }).then(function (confirmed) {
        if (!confirmed) return;
        return fetch(authApiUrl("api/live-trading/posts/" + encodeURIComponent(id)), {
          method: "DELETE",
          headers: authHeaders()
        })
          .then(function (res) {
            return res.json().catch(function () {
              return null;
            }).then(function (data) {
              return { res: res, data: data };
            });
          })
          .then(function (out) {
            if (!out.res.ok) {
              var err = (out.data && out.data.error) || "delete_failed";
              if (err === "guild_required" || err === "login_required") {
                openSharedLogin();
                return;
              }
              if (err === "not_owner" || err === "owner_protected") {
                window.alert(
                  err === "owner_protected"
                    ? "Community Staff can’t delete the site owner’s posts."
                    : "You don’t have permission to delete that post."
                );
                fetchPosts({ force: true });
                return;
              }
              window.alert("Couldn’t delete that post. Try again.");
              fetchPosts({ force: true });
              return;
            }
            postsCache = postsCache.filter(function (p) {
              return p && p.id !== id;
            });
            lastRenderedPostIds = "";
            renderFeed();
            fetchPosts({ force: true });
          })
          .catch(function () {
            window.alert("Couldn’t delete that post. Try again.");
            fetchPosts({ force: true });
          });
      });
    });
  }

  function sideSearchTerms(side) {
    var terms = ((side && side.items) || []).map(function (i) {
      return String(i.name || "");
    });
    var cash = side && side.cash ? Number(side.cash) : 0;
    if (cash > 0) {
      terms.push("cash");
      terms.push("$");
      terms.push(String(Math.floor(cash)));
      terms.push(formatCash(cash));
    }
    return terms;
  }

  function postMatchesFilters(post) {
    if (searchScope === "mine" && !isOwnPost(post)) return false;
    var authorId =
      post && post.author
        ? String(post.author.discordId || post.author.id || "").trim()
        : "";
    if (authorId && isAuthorHidden(authorId) && !isOwnPost(post)) return false;
    var q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    var offering = sideSearchTerms(post.giving);
    var requesting = sideSearchTerms(post.wanting);
    var hay =
      searchScope === "offering"
        ? offering
        : searchScope === "requesting"
          ? requesting
          : offering.concat(requesting);
    return hay.some(function (name) {
      return String(name || "")
        .toLowerCase()
        .indexOf(q) !== -1;
    });
  }

  var TIP_LFO =
    "This user is open to offers that may be different from their trade post";
  var TIP_NLFO =
    "This user only wants what is listed and is not open to other offers";

  function itemPhrase(item) {
    var qty = Math.max(1, Number(item.qty) || 1);
    var name = String(item.name || "Item");
    var metric = formatMetricLabel(item);
    if (metric) name += " (" + metric + ")";
    if (qty > 1) return qty + "× " + name;
    return name;
  }

  function joinPhrases(parts) {
    var list = (parts || []).filter(Boolean);
    if (!list.length) return "";
    if (list.length === 1) return list[0];
    if (list.length === 2) return list[0] + " and " + list[1];
    return list.slice(0, -1).join(", ") + " and " + list[list.length - 1];
  }

  function sideTradePhrase(side, emptyLabel) {
    var parts = [];
    ((side && side.items) || []).forEach(function (item) {
      parts.push(itemPhrase(item));
    });
    if (side && side.cash) parts.push(formatCash(side.cash));
    return joinPhrases(parts) || emptyLabel || "nothing";
  }

  function sideTradePhraseCompact(side, emptyLabel) {
    side = side || {};
    var items = Array.isArray(side.items) ? side.items : [];
    var parts = [];
    var i;
    for (i = 0; i < items.length; i++) {
      var it = items[i];
      var label = String((it && it.name) || "Item").trim() || "Item";
      var metric = formatMetricLabel(it);
      if (metric) label += " (" + metric + ")";
      var qty = Math.max(1, Number(it && it.qty) || 1);
      parts.push(qty > 1 ? qty + "× " + label : label);
    }
    if (side.cash) parts.push(formatCash(side.cash));
    return joinPhrases(parts) || emptyLabel || "nothing";
  }

  function postSummaryHtml(post) {
    return (
      '<div class="lt-post__summary-text">' +
      '<p class="lt-post__summary-line"><span class="lt-post__summary-k">Offering</span> ' +
      escapeHtml(sideTradePhraseCompact(post.giving, "nothing")) +
      "</p>" +
      '<p class="lt-post__summary-line"><span class="lt-post__summary-k">Requesting</span> ' +
      escapeHtml(sideTradePhraseCompact(post.wanting, "nothing")) +
      "</p>" +
      "</div>"
    );
  }

  function resolveItemDisplay(item) {
    var cat = findCatalogItem(item.id);
    var isWeight = itemHasWeight(item) || itemHasWeight(cat);
    var maxFromItem = Math.max(0, Number(item.maxDurability) || 0);
    var maxFromCat = Math.max(0, Number(cat && cat.maxDurability) || 0);
    var maxDurability = isWeight ? 0 : maxFromItem || maxFromCat;
    var durability = null;
    if (maxDurability > 0) {
      durability = Math.max(
        0,
        Math.min(maxDurability, Number(item.durability) || maxDurability)
      );
    }
    var maxWeight = isWeight
      ? roundFishWeight(
          item.maxWeight || (cat && cat.maxWeight) || FISH_WEIGHT_MAX
        )
      : 0;
    var weight = isWeight
      ? roundFishWeight(item.weight != null ? item.weight : maxWeight)
      : null;
    return {
      id: item.id,
      name: item.name || (cat && cat.name) || "Item",
      image: item.image || (cat && cat.image) || "",
      color: item.color || (cat && cat.color) || "#334155",
      rarity: item.rarity || (cat && cat.rarity) || "",
      value: (cat && cat.value) || item.value || "",
      qty: Math.max(1, Number(item.qty) || 1),
      durability: durability,
      maxDurability: maxDurability,
      metric: isWeight ? "weight" : "",
      weight: weight,
      maxWeight: maxWeight,
      internalValue: Math.max(
        0,
        Number(item.internalValue) || Number(cat && cat.internalValue) || 0
      )
    };
  }

  function repairPriceFor(item) {
    var d = resolveItemDisplay(item);
    if (!d.maxDurability || !d.internalValue) return null;
    var cur =
      d.durability == null ? d.maxDurability : Number(d.durability);
    var missing = Math.max(0, d.maxDurability - cur);
    if (missing <= 0) return 0;
    return Math.round(
      missing * (d.internalValue / d.maxDurability / 1.43)
    );
  }

  function itemCardHtml(item) {
    var d = resolveItemDisplay(item);
    var metricLabel = formatMetricFull(d);
    var repair = repairPriceFor(d);
    return (
      '<button type="button" class="lt-icard' +
      (metricLabel ? " lt-icard--dura" : "") +
      '" style="--lt-card:' +
      escapeAttr(d.color) +
      ";background:radial-gradient(120% 90% at 50% 18%," +
      escapeAttr(d.color) +
      "99,transparent 70%),linear-gradient(180deg," +
      escapeAttr(d.color) +
      '88,#000 100%)" data-lt-item="1" data-name="' +
      escapeAttr(d.name) +
      '" data-image="' +
      escapeAttr(d.image) +
      '" data-color="' +
      escapeAttr(d.color) +
      '" data-dura="' +
      escapeAttr(metricLabel) +
      '" data-repair="' +
      escapeAttr(repair == null ? "" : String(repair)) +
      '" data-lt-tip="' +
      escapeAttr(d.name + (metricLabel ? " · " + metricLabel : "")) +
      '">' +
      (d.qty > 1
        ? '<span class="lt-icard__qty">' + escapeHtml(String(d.qty) + "×") + "</span>"
        : "") +
      '<div class="lt-icard__art">' +
      (d.image
        ? '<img src="' +
          escapeAttr(d.image) +
          '" alt="' +
          escapeAttr(d.name) +
          '" loading="lazy" decoding="async">'
        : '<span class="lt-icard__ph" aria-hidden="true"></span>') +
      "</div>" +
      '<div class="lt-icard__bar">' +
      (metricLabel
        ? '<span class="lt-icard__dura">' + escapeHtml(metricLabel) + "</span>"
        : "") +
      '<span class="lt-icard__name">' +
      escapeHtml(d.name) +
      "</span>" +
      "</div>" +
      "</button>"
    );
  }

  function cashCardHtml(cash) {
    return (
      '<div class="lt-icard lt-icard--cash" data-lt-tip="' +
      escapeAttr(formatCash(cash)) +
      '">' +
      '<div class="lt-icard__art lt-icard__art--cash">' +
      '<span class="lt-icard__cash-sign">$</span>' +
      "</div>" +
      '<div class="lt-icard__bar lt-icard__bar--cash">' +
      '<span class="lt-icard__name">Cash</span>' +
      '<span class="lt-icard__cash-amt">' +
      escapeHtml(formatCash(cash)) +
      "</span>" +
      "</div>" +
      "</div>"
    );
  }

  function offersBadgeCircleHtml(kind, extraClass, withTip) {
    var isLfo = kind === "lfo";
    var tip = isLfo ? TIP_LFO : TIP_NLFO;
    var label = isLfo ? "Accepting offers" : "Not accepting offers";
    return (
      '<span class="lt-offers-badge' +
      (isLfo ? "" : " lt-offers-badge--no") +
      (extraClass ? " " + extraClass : "") +
      '"' +
      (withTip
        ? ' data-lt-tip="' +
          escapeAttr(tip) +
          '" aria-label="' +
          escapeAttr(label) +
          '"'
        : ' aria-hidden="true"') +
      ">" +
      '<span class="lt-offers-badge__hit" aria-hidden="true"></span>' +
      '<span class="lt-offers-badge__icon">' +
      (isLfo ? "✓" : "✕") +
      "</span>" +
      '<span class="lt-offers-badge__text">' +
      (isLfo
        ? '<span class="lt-offers-badge__line">Accepting</span><span class="lt-offers-badge__line lt-offers-badge__line--em">offers</span>'
        : '<span class="lt-offers-badge__line">Not accepting</span><span class="lt-offers-badge__line lt-offers-badge__line--em">offers</span>') +
      "</span>" +
      "</span>"
    );
  }

  function offersBadgeCardHtml(kind) {
    var isLfo = kind === "lfo";
    var label = isLfo ? "Accepting offers" : "Not accepting offers";
    var tip = isLfo ? TIP_LFO : TIP_NLFO;
    return (
      '<div class="lt-icard lt-icard--offers lt-icard--' +
      (isLfo ? "lfo" : "nlfo") +
      '" tabindex="0" data-lt-tip="' +
      escapeAttr(tip) +
      '" aria-label="' +
      escapeAttr(label) +
      '">' +
      '<div class="lt-icard__art lt-icard__art--offers">' +
      offersBadgeCircleHtml(kind, "", false) +
      "</div>" +
      "</div>"
    );
  }

  function railHtml(side) {
    var items = (side && side.items) || [];
    var cash = side && side.cash ? Number(side.cash) : 0;
    var parts = [];
    items.forEach(function (item) {
      parts.push(itemCardHtml(item));
    });
    if (cash > 0) parts.push(cashCardHtml(cash));
    if (side && side.lookingForOffers) parts.push(offersBadgeCardHtml("lfo"));
    if (side && side.notLookingForOffers) parts.push(offersBadgeCardHtml("nlfo"));
    if (!parts.length) {
      parts.push('<div class="lt-rail__empty">—</div>');
    }
    return parts.join("");
  }

  function postCardHtml(post, isNew) {
    var author = post.author || {};
    var avatar = authorAvatar(author);
    var displayName = authorDisplayName(author);
    var handle = authorHandle(author);
    var own = isOwnPost(post);
    var wanting = post.wanting || {};
    var offerCorner = "";
    if (wanting.lookingForOffers) {
      offerCorner = offersBadgeCircleHtml("lfo", "lt-offers-badge--corner", true);
    } else if (wanting.notLookingForOffers) {
      offerCorner = offersBadgeCircleHtml("nlfo", "lt-offers-badge--corner", true);
    }
    return (
      '<article class="lt-post' +
      (isNew ? " lt-post--enter" : "") +
      '" data-id="' +
      escapeAttr(post.id) +
      '" role="article">' +
      '<header class="lt-post__head">' +
      '<div class="lt-post__author">' +
      (function () {
        var discordId = String(author.discordId || author.id || "").trim();
        var profileAttrs =
          discordId && /^\d{5,32}$/.test(discordId)
            ? ' data-lt-profile="' +
              escapeAttr(discordId) +
              '" tabindex="0" role="button" aria-label="View trader profile"'
            : "";
        if (avatar) {
          return (
            '<img class="lt-post__avatar' +
            (profileAttrs ? " lt-post__avatar--click" : "") +
            '" src="' +
            escapeAttr(avatar) +
            '" alt="" width="40" height="40" loading="lazy" decoding="async"' +
            profileAttrs +
            ">"
          );
        }
        return (
          '<span class="lt-post__avatar lt-post__avatar--ph' +
          (profileAttrs ? " lt-post__avatar--click" : "") +
          '"' +
          profileAttrs +
          "></span>"
        );
      })() +
      '<div class="lt-post__who">' +
      '<p class="lt-post__name">' +
      '<span class="lt-post__name-main' +
      (String(author.discordId || author.id || "").trim()
        ? " lt-post__name-main--click"
        : "") +
      '"' +
      (function () {
        var discordId = String(author.discordId || author.id || "").trim();
        if (!discordId || !/^\d{5,32}$/.test(discordId)) return "";
        return (
          ' data-lt-profile="' +
          escapeAttr(discordId) +
          '" tabindex="0" role="button" aria-label="View trader profile"'
        );
      })() +
      ">" +
      escapeHtml(displayName) +
      (handle
        ? ' <span class="lt-post__handle">' + escapeHtml(handle) + "</span>"
        : "") +
      "</span>" +
      "</p>" +
      (function () {
        var badgesHtml = authorBadgesHtml(author);
        if (!badgesHtml) return "";
        return '<div class="lt-post__badges">' + badgesHtml + "</div>";
      })() +
      '<p class="lt-post__time">' +
      escapeHtml(timeAgo(post.createdAt)) +
      "</p>" +
      "</div></div>" +
      (offerCorner || "") +
      "</header>" +
      '<div class="lt-post__trade">' +
      '<div class="lt-post__panel">' +
      '<span class="lt-post__side-pill lt-post__side-pill--offer">Offering</span>' +
      '<div class="lt-rail">' +
      railHtml(post.giving) +
      "</div></div>" +
      '<div class="lt-post__divider" aria-hidden="true">' +
      '<span class="lt-post__divider-line"></span>' +
      '<span class="lt-post__swap" data-lt-tip="Trade exchange">' +
      '<svg class="lt-post__swap-arrow" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M5 12h12M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>" +
      "</span>" +
      "</div>" +
      '<div class="lt-post__panel">' +
      '<span class="lt-post__side-pill lt-post__side-pill--request">Requesting</span>' +
      '<div class="lt-rail">' +
      railHtml(post.wanting) +
      "</div></div>" +
      "</div>" +
      postMetaHtml(post) +
      postFootHtml(post) +
      "</article>"
    );
  }

  function discordUserWebUrl(discordId) {
    var id = String(discordId || "").trim();
    if (!id || !/^\d{5,32}$/.test(id)) return "";
    return "https://discord.com/users/" + encodeURIComponent(id);
  }

  function tryOpenDiscordAppProfile(discordId) {
    var id = String(discordId || "").trim();
    if (!id || !/^\d{5,32}$/.test(id)) return;
    var appUrl = "discord://-/users/" + encodeURIComponent(id);
    try {
      var iframe = document.createElement("iframe");
      iframe.setAttribute("aria-hidden", "true");
      iframe.tabIndex = -1;
      iframe.style.cssText =
        "position:absolute;width:0;height:0;border:0;overflow:hidden;visibility:hidden";
      iframe.src = appUrl;
      document.body.appendChild(iframe);
      window.setTimeout(function () {
        if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 2000);
    } catch (_) {
      /* ignore — web profile link is the reliable path */
    }
  }

  /**
   * Open a trader's Discord profile without popup-blocker nonsense.
   * Prefer a real <a target=_blank> navigation; never window.open after timeouts.
   */
  function openDiscordProfile(discordId, opts) {
    opts = opts || {};
    var id = String(discordId || "").trim();
    var webUrl = discordUserWebUrl(id);
    if (!webUrl) return;
    tryOpenDiscordAppProfile(id);
    if (opts.skipWeb) return;
    // Same-gesture navigation via a temporary anchor (not delayed window.open).
    var a = document.createElement("a");
    a.href = webUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function canAcceptOfferSync() {
    return (
      isLoggedIn() &&
      !!guildMemberCache.inGuild &&
      !!guildMemberCache.checkedAt &&
      Date.now() - guildMemberCache.checkedAt < GUILD_CACHE_MS
    );
  }

  function acceptOfferLabelHtml() {
    return (
      'Accept offer / ' +
      '<span class="lt-post__accept-chat">' +
      '<svg class="lt-post__accept-chat-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 3.2c-4.7 0-8.5 3.1-8.5 6.9 0 2.3 1.4 4.3 3.6 5.6-.15.7-.55 1.7-1.35 2.85-.2.28 0 .68.35.68 1.85-.15 3.2-.85 4.1-1.55.6.12 1.2.17 1.8.17 4.7 0 8.5-3.1 8.5-6.9S16.7 3.2 12 3.2z"/>' +
      "</svg>" +
      "<span>Chat</span>" +
      "</span>"
    );
  }

  function postActionsHtml(post) {
    if (isOwnPost(post)) return "";
    var id = String((post.author && (post.author.discordId || post.author.id)) || "").trim();
    if (id && /^\d{5,32}$/.test(id)) {
      return (
        '<div class="lt-post__actions">' +
        '<a class="lt-post__accept" href="' +
        escapeAttr(discordUserWebUrl(id)) +
        '" target="_blank" rel="noopener noreferrer" data-accept-discord="' +
        escapeAttr(id) +
        '">' +
        acceptOfferLabelHtml() +
        "</a>" +
        "</div>"
      );
    }
    return (
      '<div class="lt-post__actions">' +
      '<span class="lt-post__accept lt-post__accept--disabled" data-lt-tip="Discord profile unavailable">' +
      acceptOfferLabelHtml() +
      "</span>" +
      "</div>"
    );
  }

  function postMetaHtml(post) {
    var actions = postActionsHtml(post);
    return (
      '<div class="lt-post__meta">' +
      '<div class="lt-post__summary">' +
      '<p class="lt-post__summary-label">Post Summary</p>' +
      postSummaryHtml(post) +
      "</div>" +
      (actions || "") +
      "</div>"
    );
  }

  function postFootHtml(post) {
    var own = canEditPost(post);
    var canDel = canDeletePost(post);
    var author = post.author || {};
    var discordId = String(author.discordId || author.id || "").trim();
    var ownId = sessionDiscordId();
    var canHide =
      !!discordId &&
      /^\d{5,32}$/.test(discordId) &&
      !isOwnPost(post) &&
      (!ownId || discordId !== ownId);
    if (!own && !canDel && !canHide) return "";
    return (
      '<div class="lt-post__foot">' +
      (own
        ? '<button type="button" class="lt-post__edit" data-edit="' +
          escapeAttr(post.id) +
          '">Edit</button>'
        : "") +
      (canDel
        ? '<button type="button" class="lt-post__delete" data-delete="' +
          escapeAttr(post.id) +
          '">Delete</button>'
        : "") +
      (canHide
        ? '<button type="button" class="lt-post__hide" data-lt-hide="' +
          escapeAttr(discordId) +
          '" aria-label="Hide posts from this person">' +
          '<svg class="lt-post__hide-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path>' +
          '<circle cx="12" cy="12" r="3"></circle>' +
          "</svg>" +
          "<span>Hide</span>" +
          "</button>"
        : "") +
      "</div>"
    );
  }

  function openItemPop(data) {
    var pop = document.getElementById("lt-item-pop");
    var card = document.getElementById("lt-item-pop-card");
    if (!pop || !card) return;
    var name = data.name || "Item";
    var color = data.color || "#334155";
    var duraLabel = data.dura || "";
    var repairHtml = "";
    if (data.repair !== "" && data.repair != null) {
      var n = Number(data.repair);
      repairHtml =
        '<span class="lt-icard__repair">Repair $' +
        escapeHtml(
          Number.isFinite(n) ? n.toLocaleString() : String(data.repair)
        ) +
        "</span>";
    }
    card.style.setProperty("--lt-card", color);
    card.style.background =
      "radial-gradient(120% 90% at 50% 18%," +
      color +
      "99,transparent 70%),linear-gradient(180deg," +
      color +
      "88,#000 100%)";
    card.innerHTML =
      '<div class="lt-icard__art">' +
      (data.image
        ? '<img src="' +
          escapeAttr(data.image) +
          '" alt="' +
          escapeAttr(name) +
          '" decoding="async">'
        : '<span class="lt-icard__ph" aria-hidden="true"></span>') +
      "</div>" +
      '<div class="lt-icard__bar">' +
      (duraLabel
        ? '<span class="lt-icard__dura">' + escapeHtml(duraLabel) + "</span>"
        : "") +
      '<span class="lt-icard__name" id="lt-item-pop-title">' +
      escapeHtml(name) +
      "</span>" +
      repairHtml +
      "</div>";
    pop.hidden = false;
  }

  function closeItemPop() {
    var pop = document.getElementById("lt-item-pop");
    if (pop) pop.hidden = true;
  }

  function discordCreatedAtFromId(id) {
    var s = String(id || "").trim();
    if (!/^\d{5,32}$/.test(s)) return null;
    try {
      var ms;
      if (typeof BigInt === "function") {
        ms = Number((BigInt(s) >> 22n) + 1420070400000n);
      } else {
        ms = Math.floor(Number(s) / 4194304) + 1420070400000;
      }
      if (!Number.isFinite(ms)) return null;
      var d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    } catch (_) {
      return null;
    }
  }

  function countPostsByDiscordId(discordId) {
    var id = String(discordId || "").trim();
    if (!id) return 0;
    var n = 0;
    for (var i = 0; i < postsCache.length; i++) {
      var a = postsCache[i] && postsCache[i].author;
      if (!a) continue;
      if (String(a.discordId || a.id || "").trim() === id) n += 1;
    }
    return n;
  }

  function findAuthorByDiscordId(discordId) {
    var id = String(discordId || "").trim();
    if (!id) return null;
    for (var i = 0; i < postsCache.length; i++) {
      var a = postsCache[i] && postsCache[i].author;
      if (!a) continue;
      if (String(a.discordId || a.id || "").trim() === id) return a;
    }
    return null;
  }

  function authorBadgesHtml(author) {
    var badges = [];
    if (isSiteOwnerAuthor(author)) badges.push(ownerBadgeHtml());
    if (isTrustedTraderAuthor(author)) badges.push(trustedTraderBadgeHtml());
    if (isScammerAuthor(author)) badges.push(scammerBadgeHtml());
    return badges.join("");
  }

  function openAuthorProfile(discordId) {
    var id = String(discordId || "").trim();
    if (!id || !/^\d{5,32}$/.test(id)) return;
    var author = findAuthorByDiscordId(id) || {};
    var avatar = authorAvatar(author);
    var name = authorDisplayName(author);
    var handle = authorHandle(author);
    var created = discordCreatedAtFromId(id);
    var posts = countPostsByDiscordId(id);
    var badgesHtml = authorBadgesHtml(author);

    var pop = document.getElementById("lt-profile");
    var avatarEl = document.getElementById("lt-profile-avatar");
    var avatarPh = document.getElementById("lt-profile-avatar-ph");
    var nameEl = document.getElementById("lt-profile-name");
    var handleEl = document.getElementById("lt-profile-handle");
    var badgesEl = document.getElementById("lt-profile-badges");
    var idEl = document.getElementById("lt-profile-id");
    var createdEl = document.getElementById("lt-profile-created");
    var postsEl = document.getElementById("lt-profile-posts");
    if (!pop) return;
    profileOpenDiscordId = id;

    if (avatarEl && avatarPh) {
      if (avatar) {
        avatarEl.src = avatar;
        avatarEl.alt = name || "Avatar";
        avatarEl.hidden = false;
        avatarPh.hidden = true;
      } else {
        avatarEl.removeAttribute("src");
        avatarEl.alt = "";
        avatarEl.hidden = true;
        avatarPh.hidden = false;
      }
    }
    if (nameEl) nameEl.textContent = name;
    if (handleEl) {
      if (handle) {
        handleEl.textContent = handle;
        handleEl.hidden = false;
      } else {
        handleEl.textContent = "";
        handleEl.hidden = true;
      }
    }
    if (badgesEl) {
      if (badgesHtml) {
        badgesEl.innerHTML = badgesHtml;
        badgesEl.hidden = false;
      } else {
        badgesEl.innerHTML = "";
        badgesEl.hidden = true;
      }
    }
    if (idEl) idEl.textContent = id;
    if (createdEl) {
      createdEl.textContent = created
        ? created.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
          })
        : "—";
    }
    if (postsEl) postsEl.textContent = String(posts);
    syncProfileHideButton();
    pop.hidden = false;
  }

  function closeAuthorProfile() {
    var pop = document.getElementById("lt-profile");
    if (pop) pop.hidden = true;
    profileOpenDiscordId = "";
  }

  function feedRenderKey(posts) {
    var ids = (posts || [])
      .map(function (p) {
        if (!p || !p.id) return "";
        // Include role badges so grant/removal refreshes without a hard reload.
        return (
          String(p.id) +
          (p.author && p.author.scammer ? ":s" : "") +
          (p.author && p.author.trustedTrader ? ":t" : "")
        );
      })
      .join(",");
    // Include viewer identity so Delete/owner UI re-render when login finishes after posts load.
    return (
      sessionDiscordId() +
      "|" +
      (isLiveTradingAdmin() ? "a" : "") +
      (isCommunityStaffViewer() ? "s" : "") +
      "|h:" +
      hiddenAuthorsKey() +
      "|" +
      ids
    );
  }

  function renderFeed(opts) {
    opts = opts || {};
    var feed = document.getElementById("lt-feed");
    if (!feed) return;
    var posts = readPosts().filter(postMatchesFilters);
    var key = feedRenderKey(posts);
    var ids = posts
      .map(function (p) {
        return p && p.id ? String(p.id) : "";
      })
      .join(",");
    feed.setAttribute("aria-busy", "false");
    if (!posts.length) {
      lastRenderedPostIds = "";
      feed.innerHTML =
        '<p class="lt-feed__empty" id="lt-feed-empty">' +
        (readPosts().length
          ? "No trades match your filters."
          : "No trade posts yet. Create the first one.") +
        "</p>";
      return;
    }
    if (!opts.force && key === lastRenderedPostIds && feed.querySelector(".lt-post")) {
      if (opts.preferTop) scrollLiveTradingFeedTop();
      return;
    }
    var prevKey = lastRenderedPostIds || "";
    var prevIds = prevKey.indexOf("|") !== -1 ? prevKey.split("|").pop().split(",") : [];
    var hadPosts = prevIds.length > 0 && prevIds[0] !== "";
    lastRenderedPostIds = key;
    feed.innerHTML = posts
      .map(function (post) {
        var isNew = hadPosts && prevIds.indexOf(String(post.id)) === -1;
        return postCardHtml(post, isNew);
      })
      .join("");
    if (opts.preferTop) scrollLiveTradingFeedTop();
  }

  function isLiveTradingMobile() {
    return !!(window.matchMedia && window.matchMedia("(max-width: 900px)").matches);
  }

  function liveTradingScrollY() {
    var se = document.scrollingElement;
    return Math.max(
      window.scrollY || 0,
      (se && se.scrollTop) || 0,
      document.documentElement.scrollTop || 0,
      document.body.scrollTop || 0
    );
  }

  function scrollLiveTradingPageTop(smooth) {
    var behavior = smooth ? "smooth" : "auto";
    try {
      window.scrollTo({ top: 0, behavior: behavior });
    } catch (e) {
      window.scrollTo(0, 0);
    }
    try {
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    } catch (e2) {}
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  function scrollLiveTradingFeedTop() {
    var feed = document.getElementById("lt-feed");
    if (feed) feed.scrollTop = 0;
    if (isLiveTradingMobile()) scrollLiveTradingPageTop(false);
  }

  function bindBackToTop() {
    var btn = document.getElementById("lt-back-to-top");
    if (!btn || btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    function sync() {
      if (!isLiveTradingMobile()) {
        btn.hidden = true;
        return;
      }
      btn.hidden = liveTradingScrollY() < 280;
    }
    btn.addEventListener("click", function () {
      scrollLiveTradingPageTop(true);
    });
    window.addEventListener("scroll", sync, { passive: true });
    document.addEventListener("scroll", sync, { passive: true, capture: true });
    window.addEventListener("resize", sync);
    sync();
  }

  function ensureFloatTip() {
    var el = document.getElementById("lt-float-tip");
    if (el) return el;
    el = document.createElement("div");
    el.id = "lt-float-tip";
    el.className = "lt-float-tip";
    el.hidden = true;
    document.body.appendChild(el);
    return el;
  }

  function hideFloatTip() {
    var el = document.getElementById("lt-float-tip");
    if (el) el.hidden = true;
  }

  function showFloatTip(anchor, text) {
    text = String(text || "").trim();
    if (!anchor || !text) {
      hideFloatTip();
      return;
    }
    var el = ensureFloatTip();
    el.textContent = text;
    el.hidden = false;
    var r = anchor.getBoundingClientRect();
    var tipW = el.offsetWidth || 200;
    var tipH = el.offsetHeight || 40;
    var left = r.left + r.width / 2 - tipW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));
    var top = r.top - tipH - 10;
    if (top < 8) top = r.bottom + 10;
    el.style.left = Math.round(left) + "px";
    el.style.top = Math.round(top) + "px";
  }

  function bindFloatTips() {
    document.addEventListener(
      "pointerover",
      function (e) {
        var tipHost = e.target.closest && e.target.closest("[data-lt-tip]");
        if (!tipHost) return;
        showFloatTip(tipHost, tipHost.getAttribute("data-lt-tip"));
      },
      true
    );
    document.addEventListener(
      "pointerout",
      function (e) {
        var tipHost = e.target.closest && e.target.closest("[data-lt-tip]");
        if (!tipHost) return;
        var related = e.relatedTarget;
        if (related && tipHost.contains(related)) return;
        hideFloatTip();
      },
      true
    );
    document.addEventListener("scroll", hideFloatTip, true);
  }

  function bindBoardUi() {
    var openCreate = document.getElementById("lt-open-create");
    var closeCreate = document.getElementById("lt-close-create");
    var submit = document.getElementById("lt-submit-post");
    var pastePrev = document.getElementById("lt-paste-previous");
    var lfo = document.getElementById("lt-add-lfo");
    var nlfo = document.getElementById("lt-add-nlfo");
    var search = document.getElementById("lt-search");
    var pickerClose = document.getElementById("lt-picker-close");
    var pickerBackdrop = document.getElementById("lt-picker-backdrop");
    var pickerSearch = document.getElementById("lt-picker-search");

    if (openCreate) {
      openCreate.addEventListener("click", function () {
        requireLoginForAction().then(function (ok) {
          if (!ok) return;
          ensureTradeGuidelines().then(function (accepted) {
            if (!accepted) return;
            resetDraft();
            setComposerOpen(true);
            loadCatalog();
          });
        });
      });
    }
    var guidelinesOk = document.getElementById("lt-guidelines-ok");
    if (guidelinesOk) {
      guidelinesOk.addEventListener("click", function () {
        acknowledgeTradeGuidelines();
      });
    }
    var guidePanel = document.querySelector(".lt-guide-panel");
    if (guidePanel) {
      guidePanel.addEventListener("toggle", function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(syncLiveTradingBoardHeight);
        });
      });
    }
    if (pastePrev) {
      pastePrev.addEventListener("click", function () {
        pastePreviousPost();
      });
    }
    var joinClose = document.getElementById("lt-join-discord-close");
    var joinBackdrop = document.getElementById("lt-join-discord-backdrop");
    if (joinClose) joinClose.addEventListener("click", hideJoinDiscordPrompt);
    if (joinBackdrop) joinBackdrop.addEventListener("click", hideJoinDiscordPrompt);
    var itemPopBackdrop = document.getElementById("lt-item-pop-backdrop");
    if (itemPopBackdrop) itemPopBackdrop.addEventListener("click", closeItemPop);
    var profileClose = document.getElementById("lt-profile-close");
    var profileBackdrop = document.getElementById("lt-profile-backdrop");
    if (profileClose) profileClose.addEventListener("click", closeAuthorProfile);
    if (profileBackdrop) profileBackdrop.addEventListener("click", closeAuthorProfile);
    bindFloatTips();
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && discordAppLaunchTimer) {
        window.clearTimeout(discordAppLaunchTimer);
        discordAppLaunchTimer = null;
      }
    });
    if (closeCreate) {
      closeCreate.addEventListener("click", function () {
        resetDraft();
        setComposerOpen(false);
      });
    }
    if (submit) submit.addEventListener("click", submitPost);
    if (lfo) lfo.addEventListener("click", toggleLfo);
    if (nlfo) nlfo.addEventListener("click", toggleNlfo);

    document.addEventListener("pointerdown", function (e) {
      var holdBtn =
        e.target.closest &&
        e.target.closest(".lt-slot__dura-btn, .lt-slot__qty-btn");
      if (!holdBtn) return;
      e.preventDefault();
      startSlotHold(holdBtn);
    });
    document.addEventListener("pointerup", stopSlotHold);
    document.addEventListener("pointercancel", stopSlotHold);
    document.addEventListener("pointerleave", function (e) {
      if (
        e.target &&
        e.target.closest &&
        e.target.closest(".lt-slot__dura-btn, .lt-slot__qty-btn")
      ) {
        stopSlotHold();
      }
    });
    window.addEventListener("blur", stopSlotHold);

    document.addEventListener("focusin", function (e) {
      var inp =
        e.target &&
        e.target.classList &&
        (e.target.classList.contains("lt-slot__qty-val") ||
          e.target.classList.contains("lt-slot__dura-val"))
          ? e.target
          : null;
      if (inp) {
        try {
          inp.select();
        } catch (_) {}
      }
    });
    document.addEventListener("change", function (e) {
      var t = e.target;
      if (!t || !t.classList) return;
      if (t.classList.contains("lt-slot__qty-val")) {
        commitDraftQtyInput(
          t.getAttribute("data-side"),
          t.getAttribute("data-index"),
          t.value
        );
        return;
      }
      if (t.classList.contains("lt-slot__dura-val")) {
        commitDraftMetricInput(
          t.getAttribute("data-side"),
          t.getAttribute("data-index"),
          t.value
        );
      }
    });
    document.addEventListener("keydown", function (e) {
      var t = e.target;
      if (!t || !t.classList) return;
      if (
        !t.classList.contains("lt-slot__qty-val") &&
        !t.classList.contains("lt-slot__dura-val")
      ) {
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        t.blur();
      }
    });

    document.addEventListener("click", function (e) {
      var profileBtn = e.target.closest && e.target.closest("[data-lt-profile]");
      if (profileBtn) {
        e.preventDefault();
        openAuthorProfile(profileBtn.getAttribute("data-lt-profile"));
        return;
      }
      var addBtn = e.target.closest && e.target.closest(".lt-slot--add");
      if (addBtn) {
        openPicker(addBtn.getAttribute("data-add") || "giving");
        return;
      }
      var remove = e.target.closest && e.target.closest(".lt-slot__remove");
      if (remove) {
        removeDraftItem(
          remove.getAttribute("data-side"),
          remove.getAttribute("data-index")
        );
        return;
      }
      var acceptBtn = e.target.closest && e.target.closest("[data-accept-discord]");
      if (acceptBtn) {
        var acceptId = acceptBtn.getAttribute("data-accept-discord");
        // Already verified this session — let the real <a> open Discord (no popup).
        if (canAcceptOfferSync()) {
          tryOpenDiscordAppProfile(acceptId);
          // Do not preventDefault: native target=_blank is never "blocked".
          return;
        }
        e.preventDefault();
        requireLoginForAction().then(function (ok) {
          if (!ok) return;
          // After login, open via a fresh clickable path; user may need one more click
          // if the browser still blocks — but prefer immediate open when allowed.
          openDiscordProfile(acceptId);
        });
        return;
      }
      var itemCard = e.target.closest && e.target.closest("[data-lt-item]");
      if (itemCard) {
        e.preventDefault();
        openItemPop({
          name: itemCard.getAttribute("data-name") || "Item",
          image: itemCard.getAttribute("data-image") || "",
          color: itemCard.getAttribute("data-color") || "",
          dura: itemCard.getAttribute("data-dura") || "",
          repair: itemCard.getAttribute("data-repair")
        });
        return;
      }
      var edit = e.target.closest && e.target.closest("[data-edit]");
      if (edit) {
        startEditPost(edit.getAttribute("data-edit"));
        return;
      }
      var del = e.target.closest && e.target.closest("[data-delete]");
      if (del) {
        deletePost(del.getAttribute("data-delete"));
        return;
      }
      var pick = e.target.closest && e.target.closest(".lt-picker__item");
      if (pick) {
        var item = findCatalogItem(pick.getAttribute("data-id"));
        if (item) addDraftItem(pickerSide, item);
        closePicker();
        return;
      }
      var rarity = e.target.closest && e.target.closest(".lt-picker__rarity");
      if (rarity) {
        pickerRarity = rarity.getAttribute("data-rarity") || "all";
        renderPickerRarities();
        renderPickerGrid();
        return;
      }
      var hideBtn = e.target.closest && e.target.closest("[data-lt-hide]");
      if (hideBtn) {
        e.preventDefault();
        requestHideAuthor(hideBtn.getAttribute("data-lt-hide"));
        return;
      }
      var unhideBtn = e.target.closest && e.target.closest("[data-lt-unhide]");
      if (unhideBtn) {
        e.preventDefault();
        requestUnhideAuthor(unhideBtn.getAttribute("data-lt-unhide"));
        return;
      }
      var scope = e.target.closest && e.target.closest(".lt-search__scope");
      if (scope) {
        var nextScope = scope.getAttribute("data-scope") || "all";
        if (nextScope === "hidden") {
          e.preventDefault();
          openHiddenAuthorsModal();
          return;
        }
        searchScope = nextScope;
        document.querySelectorAll(".lt-search__scope").forEach(function (b) {
          b.classList.toggle(
            "is-active",
            b.getAttribute("data-scope") === searchScope
          );
        });
        renderFeed();
      }
    });

    var hiddenClose = document.getElementById("lt-hidden-close");
    var hiddenBackdrop = document.getElementById("lt-hidden-backdrop");
    if (hiddenClose) hiddenClose.addEventListener("click", closeHiddenAuthorsModal);
    if (hiddenBackdrop) {
      hiddenBackdrop.addEventListener("click", closeHiddenAuthorsModal);
    }

    if (pickerClose) pickerClose.addEventListener("click", closePicker);
    if (pickerBackdrop) pickerBackdrop.addEventListener("click", closePicker);
    if (pickerSearch) {
      pickerSearch.addEventListener("input", function () {
        renderPickerGrid();
      });
    }
    if (search) {
      search.addEventListener("input", function () {
        searchQuery = search.value || "";
        renderFeed();
      });
    }

    window.addEventListener("focus", function () {
      fetchPosts({ force: true });
    });
  }

  function syncLiveTradingBoardHeight() {
    var nav = document.getElementById("sections-nav");
    var feedWrap = document.querySelector(".lt-feed-wrap");
    if (!nav || !feedWrap) return;
    if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) {
      feedWrap.style.removeProperty("height");
      feedWrap.style.removeProperty("min-height");
      return;
    }
    // Stretch well past the sections column so the trade feed feels taller.
    // When the create/edit composer is open it pushes the feed down — add that
    // height back so the posts box stays the same size as before Create post.
    var EXTRA_BELOW_SECTIONS = 480;
    var navBottom = nav.getBoundingClientRect().bottom;
    var wrapTop = feedWrap.getBoundingClientRect().top;
    var composer = document.getElementById("lt-composer");
    var composerExtra = 0;
    if (composer && !composer.hidden) {
      var cStyle = window.getComputedStyle(composer);
      composerExtra =
        Math.ceil(composer.getBoundingClientRect().height) +
        (parseFloat(cStyle.marginTop) || 0) +
        (parseFloat(cStyle.marginBottom) || 0);
    }
    var h = Math.round(navBottom - wrapTop + EXTRA_BELOW_SECTIONS + composerExtra);
    if (h < 220) h = 220;
    feedWrap.style.setProperty("height", h + "px", "important");
    feedWrap.style.setProperty("min-height", h + "px", "important");
  }

  function clearLiveTradingSidebarLocks(sidebar, sections) {
    [sidebar, sections].forEach(function (el) {
      if (!el) return;
      el.style.removeProperty("flex");
      el.style.removeProperty("width");
      el.style.removeProperty("max-width");
      el.style.removeProperty("min-width");
    });
  }

  function lockLiveTradingSidebarWidths() {
    var sidebar = document.querySelector(".sections-sidebar");
    var sections = document.querySelector(".live-trading-main");
    var workspace = document.querySelector(".live-trading-workspace");
    if (!sidebar || !sections) return;

    if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) {
      clearLiveTradingSidebarLocks(sidebar, sections);
      return;
    }

    if (workspace) {
      workspace.style.setProperty("width", "100%", "important");
      workspace.style.setProperty("max-width", "none", "important");
    }

    clearLiveTradingSidebarLocks(sidebar, sections);
    // Narrow fit-content nav; main column takes all remaining room (no right spacer).
    sidebar.style.setProperty("flex", "0 0 auto", "important");
    sidebar.style.setProperty("width", "max-content", "important");
    sidebar.style.setProperty("max-width", "none", "important");
    sidebar.style.setProperty("min-width", "0", "important");
    sections.style.setProperty("flex", "1 1 0%", "important");
    sections.style.setProperty("width", "auto", "important");
    sections.style.setProperty("max-width", "none", "important");
    sections.style.setProperty("min-width", "0", "important");

    void sidebar.offsetWidth;
    var sideW = Math.ceil(sidebar.getBoundingClientRect().width);

    sidebar.style.setProperty("flex", "0 0 " + sideW + "px", "important");
    sidebar.style.setProperty("width", sideW + "px", "important");
    sidebar.style.setProperty("max-width", sideW + "px", "important");
    sidebar.style.setProperty("min-width", sideW + "px", "important");

    if (workspace) {
      workspace.style.setProperty("width", "100%", "important");
      workspace.style.setProperty("max-width", "none", "important");
    }
    syncLiveTradingBoardHeight();
  }

  function reportApiUrl() {
    if (LT_REPORT_APPS_SCRIPT_URL) return LT_REPORT_APPS_SCRIPT_URL;
    return authApiUrl("api/live-trading/report");
  }

  function setReportStatus(message, kind) {
    var el = document.getElementById("lt-report-status");
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.textContent = "";
      el.className = "lt-report__status";
      return;
    }
    el.hidden = false;
    el.textContent = message;
    el.className =
      "lt-report__status" +
      (kind === "ok" ? " is-ok" : kind === "err" ? " is-err" : "");
  }

  function syncReportFormState() {
    var form = document.getElementById("lt-report-form");
    var loginNote = document.getElementById("lt-report-login-note");
    var loginBtn = document.getElementById("lt-report-login");
    var identity = document.getElementById("lt-report-identity");
    var loggedIn = isLoggedIn();
    if (form) form.hidden = !loggedIn;
    if (loginNote) loginNote.hidden = loggedIn;
    if (loginBtn) {
      loginBtn.hidden = loggedIn;
      loginBtn.style.display = loggedIn ? "none" : "";
    }
    if (identity) {
      if (!loggedIn) {
        identity.textContent = "";
      } else {
        var a = authorFromSession();
        identity.textContent =
          "Reporting as " +
          (a.discordDisplayName || a.discordUsername || "Discord user") +
          (a.discordUsername ? " (@" + a.discordUsername + ")" : "") +
          (a.discordId ? " · ID " + a.discordId : "");
      }
    }
  }

  function openReportModal() {
    var modal = document.getElementById("lt-report-modal");
    if (!modal) return;
    setReportStatus("", "");
    var issue = document.getElementById("lt-report-issue");
    if (issue) issue.value = "";
    syncReportFormState();
    modal.hidden = false;
    document.body.classList.add("lt-report-open");
  }

  function closeReportModal() {
    var modal = document.getElementById("lt-report-modal");
    if (modal) modal.hidden = true;
    document.body.classList.remove("lt-report-open");
    setReportStatus("", "");
  }

  async function submitReportIssue(issueText) {
    var a = authorFromSession();
    var payload = {
      displayName: a.discordDisplayName || "",
      username: a.discordUsername || "",
      discordId: a.discordId || sessionDiscordId() || "",
      issue: String(issueText || "").trim(),
      sheetId: LT_REPORT_SHEET_ID
    };
    var unknownErr = new Error(
      "Unknown Error, please report your issue in our discord"
    );
    if (!payload.issue) throw unknownErr;
    if (!payload.discordId && !isLoggedIn()) throw unknownErr;

    var url = reportApiUrl();
    var headers = authHeaders();
    headers["Content-Type"] = LT_REPORT_APPS_SCRIPT_URL
      ? "text/plain;charset=utf-8"
      : "application/json";
    var res;
    try {
      res = await fetch(url, {
        method: "POST",
        credentials: "omit",
        headers: headers,
        body: JSON.stringify(payload)
      });
    } catch (_) {
      throw unknownErr;
    }
    var data = null;
    try {
      data = await res.json();
    } catch (_) {}
    if (!res.ok || (data && data.ok === false)) {
      throw unknownErr;
    }
  }

  function bindReportUi() {
    var openBtn = document.getElementById("lt-open-report");
    var closeBtn = document.getElementById("lt-report-close");
    var backdrop = document.getElementById("lt-report-backdrop");
    var loginBtn = document.getElementById("lt-report-login");
    var form = document.getElementById("lt-report-form");
    var submitBtn = document.getElementById("lt-report-submit");

    if (openBtn) openBtn.addEventListener("click", openReportModal);
    if (closeBtn) closeBtn.addEventListener("click", closeReportModal);
    if (backdrop) backdrop.addEventListener("click", closeReportModal);
    if (loginBtn) {
      loginBtn.addEventListener("click", function () {
        openSharedLogin();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var modal = document.getElementById("lt-report-modal");
      if (modal && !modal.hidden) closeReportModal();
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var issueEl = document.getElementById("lt-report-issue");
        var text = issueEl ? issueEl.value : "";
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending…";
        }
        setReportStatus("Sending your report…", "");
        submitReportIssue(text)
          .then(function () {
            setReportStatus("Thanks — your report was sent.", "ok");
            if (issueEl) issueEl.value = "";
          })
          .catch(function () {
            setReportStatus(
              "Unknown Error, please report your issue in our discord",
              "err"
            );
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Send report";
            }
          });
      });
    }

  }

  function init() {
    buildSectionsNav();
    initMobileSectionsMenu();
    bindLoginUi();
    bindBoardUi();
    bindReportUi();
    bindBackToTop();
    lockLiveTradingSidebarWidths();
    window.addEventListener("resize", function () {
      lockLiveTradingSidebarWidths();
      syncLiveTradingBoardHeight();
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", function () {
        lockLiveTradingSidebarWidths();
        syncLiveTradingBoardHeight();
      });
    }
    fetchPosts({ force: true });
    startPostsPolling();
    refreshSession();
    requestAnimationFrame(syncLiveTradingBoardHeight);
  }

  // Expose for upcoming post interactions (chat, etc.).
  window.bsvLiveTradingRequireLogin = requireLoginForAction;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
