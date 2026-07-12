(function () {
  "use strict";

  var AUTH_TOKEN_KEY = "bsv-discord-auth";
  var LOCAL_SAVED_PREFIX = "bsv-saved-cards-local-";
  var MAX_SAVED_CARDS = 60;
  var savedCards = [];
  var savedCardsRevision = 0;
  var panelOpen = false;
  var currentUserId = null;
  var useLocalStorage = false;
  var pendingRemovalIds = Object.create(null);
  var pendingRemovalKeys = Object.create(null);
  var fetchInFlight = false;

  function bumpSavedCardsRevision() {
    savedCardsRevision += 1;
  }

  function trackPendingRemoval(id, key) {
    if (id) pendingRemovalIds[id] = true;
    if (key) pendingRemovalKeys[key] = true;
  }

  function clearPendingRemoval(id, key) {
    if (id) delete pendingRemovalIds[id];
    if (key) delete pendingRemovalKeys[key];
  }

  function hasPendingRemovals() {
    return Object.keys(pendingRemovalIds).length > 0 || Object.keys(pendingRemovalKeys).length > 0;
  }

  function isPendingRemoval(card) {
    if (!card) return false;
    if (card.id && pendingRemovalIds[card.id]) return true;
    return !!pendingRemovalKeys[cardStorageKey(card)];
  }

  function hasUnsyncedLocalCards(cards) {
    return (cards || savedCards).some(function (c) {
      return String(c.id || "").indexOf("local-") === 0;
    });
  }

  function mergeServerSavedCards(serverCards) {
    var incoming = Array.isArray(serverCards) ? serverCards : [];
    var serverByKey = Object.create(null);
    incoming.forEach(function (c) {
      serverByKey[cardStorageKey(c)] = c;
    });

    var merged = incoming.filter(function (c) {
      return !isPendingRemoval(c);
    });

    savedCards.forEach(function (local) {
      if (isPendingRemoval(local)) return;
      var key = cardStorageKey(local);
      if (!serverByKey[key]) {
        merged.unshift(local);
      }
    });

    return merged;
  }

  function applyFetchedSavedCards(cards, revisionAtStart) {
    if (revisionAtStart !== savedCardsRevision) return savedCards;
    if (hasPendingRemovals() || hasUnsyncedLocalCards()) {
      savedCards = mergeServerSavedCards(cards);
    } else {
      savedCards = Array.isArray(cards) ? cards.slice() : [];
    }
    bumpSavedCardsRevision();
    updateUi();
    syncCardSaveButtons();
    return savedCards;
  }

  function completeSavedCardRemoval(removeId, removeKey) {
    return deleteSavedCard(removeId).then(function () {
      clearPendingRemoval(removeId, removeKey);
      if (useLocalStorage) writeLocalSavedCards(savedCards);
    }).catch(function () {
      useLocalStorage = true;
      writeLocalSavedCards(savedCards);
      clearPendingRemoval(removeId, removeKey);
    });
  }

  function removeSavedCardsFromState(id, key) {
    var before = savedCards.length;
    savedCards = savedCards.filter(function (c) {
      if (id && c.id === id) return false;
      if (key && cardStorageKey(c) === key) return false;
      return true;
    });
    if (savedCards.length === before) return false;
    bumpSavedCardsRevision();
    if (useLocalStorage) writeLocalSavedCards(savedCards);
    updateUi();
    syncCardSaveButtons();
    return true;
  }

  function cardSaveButtonShowsSaved(cardEl) {
    var btn = cardEl && cardEl.querySelector(".card-save-btn");
    if (!btn) return false;
    return btn.getAttribute("aria-pressed") === "true" || btn.classList.contains("card-save-btn--saved");
  }

  function t(key, vars) {
    if (window.bsvI18n && typeof window.bsvI18n.t === "function") {
      return window.bsvI18n.t(key, vars || {});
    }
    var fallbacks = {
      "savedCards.headerBtn": "Saved items",
      "savedCards.headerBtnAria": "Open saved item cards",
      "savedCards.panelTitle": "Saved items",
      "savedCards.panelEmpty": "No saved items yet. tap the bookmark on any item card to save something here.",
      "savedCards.panelLogin": "Log in with Discord to save and sync item cards across visits.",
      "savedCards.loginBtn": "Log in with Discord",
      "savedCards.saveTitle": "Save this item",
      "savedCards.saveAria": "Save item to your saved list",
      "savedCards.unsaveTitle": "Remove from saved",
      "savedCards.unsaveAria": "Remove item from saved list",
      "savedCards.savedToast": "Saved to your list",
      "savedCards.removedToast": "Removed from saved list",
      "savedCards.loginRequired": "Log in with Discord to save items",
      "savedCards.limitReached": "Saved list is full (60 items). Remove some first.",
      "savedCards.removeBtn": "Remove",
      "savedCards.goToBtn": "Go to",
      "savedCards.goToAria": "Go to saved item",
      "savedCards.close": "Close"
    };
    return fallbacks[key] || key;
  }

  function apiBase() {
    if (typeof window.bsvBotApiUrl === "function") return window.bsvBotApiUrl("");
    if (window.BSV_BOT_PUBLIC_BASE) return String(window.BSV_BOT_PUBLIC_BASE).replace(/\/+$/, "");
    return "https://bsv-bot-production.up.railway.app";
  }

  function apiUrl(path) {
    var base = apiBase();
    var p = String(path || "").replace(/^\/+/, "");
    return p ? base + "/" + p : base;
  }

  function getAuthToken() {
    if (typeof window.bsvGetAuthToken === "function") return window.bsvGetAuthToken();
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (_) {
      return null;
    }
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

  function generateLocalId() {
    return "local-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function localStorageKey() {
    if (!currentUserId) return null;
    return LOCAL_SAVED_PREFIX + currentUserId;
  }

  function readLocalSavedCards() {
    var key = localStorageKey();
    if (!key) return [];
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed && parsed.cards) ? parsed.cards : [];
    } catch (_) {
      return [];
    }
  }

  function writeLocalSavedCards(cards) {
    var key = localStorageKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({
        cards: cards,
        updatedAt: new Date().toISOString()
      }));
    } catch (_) {}
  }

  function setCurrentUser(user) {
    currentUserId = user && user.id ? String(user.id) : null;
  }

  function resolveCurrentUser() {
    var token = getAuthToken();
    if (!token) {
      setCurrentUser(null);
      return Promise.resolve(null);
    }
    if (currentUserId) return Promise.resolve(currentUserId);
    return fetch(apiUrl("api/auth/me"), { headers: authHeaders() })
      .then(function (res) {
        if (!res.ok) throw new Error("auth_me_failed");
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.loggedIn || !data.user) {
          setCurrentUser(null);
          return null;
        }
        setCurrentUser(data.user);
        return currentUserId;
      })
      .catch(function () {
        return currentUserId;
      });
  }

  function loadSavedCardsFromLocal(revisionAtStart) {
    if (revisionAtStart != null && revisionAtStart !== savedCardsRevision) return savedCards;
    var localCards = readLocalSavedCards();
    if (hasPendingRemovals() || hasUnsyncedLocalCards()) {
      savedCards = mergeServerSavedCards(localCards);
    } else {
      savedCards = localCards;
    }
    bumpSavedCardsRevision();
    updateUi();
    syncCardSaveButtons();
    return savedCards;
  }

  function saveCardLocally(payload) {
    var key = cardStorageKey(payload);
    var existing = savedCards.find(function (c) { return cardStorageKey(c) === key; });
    if (existing) {
      return Promise.resolve({ card: existing, alreadySaved: true });
    }
    if (savedCards.length >= MAX_SAVED_CARDS) {
      return Promise.reject(new Error("limit_reached"));
    }
    var card = Object.assign({}, payload, {
      id: generateLocalId(),
      savedAt: new Date().toISOString()
    });
    savedCards.unshift(card);
    writeLocalSavedCards(savedCards);
    return Promise.resolve({ card: card, alreadySaved: false });
  }

  function deleteSavedCardLocally(id) {
    var next = savedCards.filter(function (c) { return c.id !== id; });
    if (next.length === savedCards.length) {
      return Promise.reject(new Error("not_found"));
    }
    savedCards = next;
    writeLocalSavedCards(savedCards);
    return Promise.resolve({ ok: true });
  }

  function apiUnavailableStatus(status) {
    return status === 404 || status === 502 || status === 503;
  }

  function cardStorageKey(card) {
    var type = String(card.cardType || "weapon").trim().toLowerCase();
    var section = String(card.section || "").trim().toLowerCase();
    var name = String(card.name || "").trim().toLowerCase();
    return type + "::" + section + "::" + name;
  }

  function isSavedKey(key) {
    return savedCards.some(function (c) { return cardStorageKey(c) === key; });
  }

  function findSavedCardForPayload(payload) {
    if (!payload) return null;
    var key = cardStorageKey(payload);
    var exact = savedCards.find(function (c) { return cardStorageKey(c) === key; });
    if (exact) return exact;
    var name = String(payload.name || "").trim().toLowerCase();
    var type = String(payload.cardType || "weapon").trim().toLowerCase();
    if (!name) return null;
    return savedCards.find(function (c) {
      return String(c.name || "").trim().toLowerCase() === name &&
        cardTypesMatch(c.cardType, type);
    }) || null;
  }

  function isPayloadSaved(payload) {
    return !!findSavedCardForPayload(payload);
  }

  function authHeaders() {
    var token = getAuthToken();
    var headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    return headers;
  }

  function fetchSavedCards() {
    if (fetchInFlight) return Promise.resolve(savedCards);
    fetchInFlight = true;
    var revisionAtStart = savedCardsRevision;
    var token = getAuthToken();
    if (!token) {
      savedCards = [];
      useLocalStorage = false;
      pendingRemovalIds = Object.create(null);
      pendingRemovalKeys = Object.create(null);
      bumpSavedCardsRevision();
      updateUi();
      fetchInFlight = false;
      return Promise.resolve([]);
    }
    return resolveCurrentUser().then(function () {
      if (!currentUserId) {
        if (revisionAtStart === savedCardsRevision) {
          savedCards = [];
          bumpSavedCardsRevision();
          updateUi();
        }
        return [];
      }
      return fetch(apiUrl("api/saved-cards"), { headers: authHeaders() })
        .then(function (res) {
          if (res.status === 401) {
            if (revisionAtStart === savedCardsRevision) {
              savedCards = [];
              useLocalStorage = false;
              bumpSavedCardsRevision();
              updateUi();
            }
            return null;
          }
          if (apiUnavailableStatus(res.status)) {
            useLocalStorage = true;
            return loadSavedCardsFromLocal(revisionAtStart);
          }
          if (!res.ok) throw new Error("fetch_failed");
          useLocalStorage = false;
          return res.json();
        })
        .then(function (data) {
          if (data == null) return savedCards;
          if (Array.isArray(data)) {
            return applyFetchedSavedCards(data, revisionAtStart);
          }
          var cards = Array.isArray(data && data.cards) ? data.cards : [];
          return applyFetchedSavedCards(cards, revisionAtStart);
        })
        .catch(function () {
          useLocalStorage = true;
          return loadSavedCardsFromLocal(revisionAtStart);
        });
    }).finally(function () {
      fetchInFlight = false;
    });
  }

  function saveCardPayload(payload) {
    if (useLocalStorage) {
      return saveCardLocally(payload);
    }
    return fetch(apiUrl("api/saved-cards"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ card: payload })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.status === 401) throw new Error("login_required");
        if (res.status === 409) throw new Error("limit_reached");
        if (apiUnavailableStatus(res.status)) {
          useLocalStorage = true;
          return saveCardLocally(payload);
        }
        if (!res.ok) throw new Error((data && data.error) || "save_failed");
        return data;
      });
    }).catch(function (err) {
      if (err && (err.message === "login_required" || err.message === "limit_reached")) {
        throw err;
      }
      useLocalStorage = true;
      return saveCardLocally(payload);
    });
  }

  function deleteSavedCard(id) {
    if (useLocalStorage || String(id).indexOf("local-") === 0) {
      return deleteSavedCardLocally(id);
    }
    return fetch(apiUrl("api/saved-cards/" + encodeURIComponent(id)), {
      method: "DELETE",
      headers: authHeaders()
    }).then(function (res) {
      if (res.status === 401) throw new Error("login_required");
      if (apiUnavailableStatus(res.status)) {
        useLocalStorage = true;
        return deleteSavedCardLocally(id);
      }
      if (res.status === 404) {
        return deleteSavedCardLocally(id);
      }
      if (!res.ok) throw new Error("delete_failed");
      return res.json().catch(function () { return { ok: true }; });
    }).catch(function (err) {
      if (err && err.message === "login_required") throw err;
      useLocalStorage = true;
      return deleteSavedCardLocally(id);
    });
  }

  function updateUi() {
    renderPanelContent();
  }

  function cardPayloadFromElement(cardEl) {
    if (!cardEl) return null;
    var name = cardEl.getAttribute("data-name") || "";
    if (!name) return null;
    var cardType = cardEl.getAttribute("data-card-type") || "weapon";
    return {
      name: name,
      section: cardEl.getAttribute("data-section") || "Unknown",
      cardType: cardType,
      imageUrl: cardEl.getAttribute("data-image-url") || "",
      demand: cardEl.getAttribute("data-demand") || "",
      avg: cardEl.getAttribute("data-avg") || "",
      ranged: cardEl.getAttribute("data-ranged") || "",
      durability: cardEl.getAttribute("data-durability") || "",
      internalValue: cardEl.getAttribute("data-internal-value") || "",
      rarity: cardEl.getAttribute("data-rarity") || "",
      crate: cardEl.getAttribute("data-crate") || "",
      networth: cardEl.getAttribute("data-networth") || "",
      guideTab: cardEl.getAttribute("data-guide-tab") || "",
      guidePrice: cardEl.getAttribute("data-guide-price") || "",
      guideDescription: cardEl.getAttribute("data-guide-description") || "",
      sellAmount: cardEl.getAttribute("data-sell-amount") || ""
    };
  }

  function cardTypesMatch(savedType, elType) {
    return String(savedType || "weapon").trim().toLowerCase() === String(elType || "weapon").trim().toLowerCase();
  }

  function activateGuideTabForCard(card) {
    var guideTab = String(card.guideTab || "").trim();
    if (!guideTab || typeof window.bsvActivateMoneyGuideTab !== "function") {
      return Promise.resolve();
    }
    return Promise.resolve(window.bsvActivateMoneyGuideTab(guideTab));
  }

  function sectionTitleFromSectionEl(sectionEl) {
    if (!sectionEl || !sectionEl.id) return "";
    if (typeof getSectionRegistry !== "function") return "";
    var registry = getSectionRegistry();
    var cfg = registry.find(function (entry) { return entry.id === sectionEl.id; });
    return cfg && cfg.title ? cfg.title : "";
  }

  function findCardElementForSaved(card) {
    var targetName = String(card.name || "").trim().toLowerCase();
    var cardType = String(card.cardType || "weapon").trim().toLowerCase();
    if (!targetName) return null;

    var match = null;
    document.querySelectorAll(".card[data-name]").forEach(function (el) {
      if (match) return;
      var name = (el.getAttribute("data-name") || "").trim().toLowerCase();
      if (name !== targetName) return;
      var type = (el.getAttribute("data-card-type") || "weapon").trim().toLowerCase();
      if (!cardTypesMatch(cardType, type)) return;
      match = el;
    });
    return match;
  }

  function resolveSectionName(sectionLabel) {
    var label = String(sectionLabel || "").trim();
    if (!label) return "";
    var lower = label.toLowerCase();

    if (typeof getSectionRegistry === "function") {
      var registry = getSectionRegistry();
      var byTitle = registry.find(function (cfg) {
        return String(cfg.title || "").trim().toLowerCase() === lower;
      });
      if (byTitle && byTitle.title) return byTitle.title;
      var bySheet = registry.find(function (cfg) {
        return String(cfg.sheetName || "").trim().toLowerCase() === lower;
      });
      if (bySheet && bySheet.title) return bySheet.title;
      var byId = registry.find(function (cfg) {
        return String(cfg.id || "").trim().toLowerCase() === lower;
      });
      if (byId && byId.title) return byId.title;
    }

    if (typeof getSectionTitles === "function") {
      var titles = getSectionTitles();
      var match = titles.find(function (title) {
        return String(title).trim().toLowerCase() === lower;
      });
      if (match) return match;
    }

    if (lower === "accessories" || lower === "untradable" || lower === "untradeable") {
      return typeof window.BSV_ACCESSORIES_SECTION_TITLE === "string"
        ? window.BSV_ACCESSORIES_SECTION_TITLE
        : "Untradeable Items";
    }

    return label;
  }

  function clearItemSearchFilter() {
    var searchInput = document.getElementById("search");
    if (!searchInput) return;
    searchInput.value = "";
    document.querySelectorAll(".card.hidden").forEach(function (card) {
      card.classList.remove("hidden");
    });
  }

  function scrollToSavedCard(card) {
    var match = findCardElementForSaved(card);
    if (!match) return false;

    match.classList.remove("hidden");
    match.scrollIntoView({ behavior: "smooth", block: "center" });
    match.classList.add("saved-cards-jump-highlight");
    setTimeout(function () {
      match.classList.remove("saved-cards-jump-highlight");
    }, 1800);
    return true;
  }

  function invokeShowSection(sectionName) {
    if (!sectionName) return false;
    var showFn = typeof window.showSection === "function"
      ? window.showSection
      : (typeof showSection === "function" ? showSection : null);
    if (!showFn) return false;
    showFn(sectionName);
    return true;
  }

  function navigateToSavedCard(card) {
    if (!card) return;

    closePanel();
    clearItemSearchFilter();

    var cardEl = findCardElementForSaved(card);
    var sectionName = "";

    if (cardEl) {
      var sectionEl = cardEl.closest(".section");
      sectionName = sectionTitleFromSectionEl(sectionEl);
    }

    if (!sectionName || (typeof getSectionConfig === "function" && !getSectionConfig(sectionName))) {
      sectionName = resolveSectionName(card.section) || String(card.section || "").trim();
    }

    if (!sectionName) return;
    invokeShowSection(sectionName);

    var guideTab = String(card.guideTab || "").trim();
    var delay = guideTab ? 500 : 180;
    var retryDelay = guideTab ? 1200 : 600;

    activateGuideTabForCard(card).then(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          window.setTimeout(function () {
            if (!scrollToSavedCard(card)) {
              window.setTimeout(function () {
                scrollToSavedCard(card);
              }, retryDelay);
            }
          }, delay);
        });
      });
    });
  }

  function renderPanelContent() {
    var list = document.getElementById("saved-cards-panel-list");
    var empty = document.getElementById("saved-cards-panel-empty");
    var login = document.getElementById("saved-cards-panel-login");
    var panel = document.getElementById("saved-cards-panel");
    if (!list || !empty || !login) return;

    var token = getAuthToken();
    if (panel) {
      panel.classList.toggle("saved-cards-panel--login", !token);
    }
    if (!token) {
      list.innerHTML = "";
      empty.hidden = true;
      login.hidden = false;
      return;
    }

    login.hidden = true;
    if (!savedCards.length) {
      list.innerHTML = "";
      empty.textContent = t("savedCards.panelEmpty");
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    list.innerHTML = savedCards.map(function (card) {
      var img = card.imageUrl
        ? '<img src="' + escapeAttr(card.imageUrl) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
        : "";
      return (
        '<article class="saved-cards-panel__item" data-saved-id="' + escapeAttr(card.id) + '">' +
          '<div class="saved-cards-panel__item-main">' +
            '<div class="saved-cards-panel__thumb">' + img + "</div>" +
            '<p class="saved-cards-panel__name">' + escapeHtml(card.name) + "</p>" +
          "</div>" +
          '<div class="saved-cards-panel__actions">' +
            '<button type="button" class="saved-cards-panel__goto" data-goto-saved="' + escapeAttr(card.id) + '" aria-label="' + escapeAttr(t("savedCards.goToAria")) + '">' +
              escapeHtml(t("savedCards.goToBtn")) +
            "</button>" +
            '<button type="button" class="saved-cards-panel__remove" data-remove-saved="' + escapeAttr(card.id) + '" aria-label="' + escapeAttr(t("savedCards.removeBtn")) + '">' +
              escapeHtml(t("savedCards.removeBtn")) +
            "</button>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  function syncCardSaveButtons() {
    document.querySelectorAll(".card[data-save-card]").forEach(function (cardEl) {
      var payload = cardPayloadFromElement(cardEl);
      var btn = cardEl.querySelector(".card-save-btn");
      if (!btn) return;
      var saved = isPayloadSaved(payload);
      btn.classList.toggle("card-save-btn--saved", saved);
      btn.setAttribute("aria-pressed", saved ? "true" : "false");
      btn.title = saved ? t("savedCards.unsaveTitle") : t("savedCards.saveTitle");
      btn.setAttribute("aria-label", saved ? t("savedCards.unsaveAria") : t("savedCards.saveAria"));
    });
  }

  function positionSavedPanel() {
    var btn = document.getElementById("nav-saved-cards-btn");
    var panel = document.getElementById("saved-cards-panel");
    if (!btn || !panel) return;
    var rect = btn.getBoundingClientRect();
    var panelWidth = Math.min(320, window.innerWidth - 24);
    var right = Math.max(12, window.innerWidth - rect.right);
    if (right + panelWidth > window.innerWidth - 12) {
      right = Math.max(12, window.innerWidth - panelWidth - 12);
    }
    panel.style.top = Math.round(rect.bottom + 10) + "px";
    panel.style.right = Math.round(right) + "px";
    panel.style.left = "auto";
    panel.style.width = panelWidth + "px";
  }

  function handlePanelClick(e) {
    var removeBtn = e.target.closest("[data-remove-saved]");
    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();
      var removeId = removeBtn.getAttribute("data-remove-saved");
      if (!removeId) return;
      var removedCard = savedCards.find(function (c) { return c.id === removeId; });
      var removeKey = removedCard ? cardStorageKey(removedCard) : null;
      trackPendingRemoval(removeId, removeKey);
      removeSavedCardsFromState(removeId, removeKey);
      completeSavedCardRemoval(removeId, removeKey);
      return;
    }

    var gotoBtn = e.target.closest("[data-goto-saved]");
    if (gotoBtn) {
      e.preventDefault();
      e.stopPropagation();
      var gotoId = gotoBtn.getAttribute("data-goto-saved");
      var gotoCard = savedCards.find(function (c) { return c.id === gotoId; });
      if (!gotoCard) {
        var itemEl = gotoBtn.closest(".saved-cards-panel__item");
        var nameEl = itemEl ? itemEl.querySelector(".saved-cards-panel__name") : null;
        var itemName = nameEl ? nameEl.textContent.trim() : "";
        if (itemName) {
          gotoCard = savedCards.find(function (c) {
            return String(c.name || "").trim().toLowerCase() === itemName.toLowerCase();
          });
        }
      }
      if (gotoCard) navigateToSavedCard(gotoCard);
    }
  }

  function bindPanelActions() {
    var panel = document.getElementById("saved-cards-panel");
    if (!panel || panel.dataset.bsvPanelActions === "1") return;
    panel.dataset.bsvPanelActions = "1";
    panel.addEventListener("click", handlePanelClick);
  }

  function openPanel() {
    var panel = document.getElementById("saved-cards-panel");
    var backdrop = document.getElementById("saved-cards-backdrop");
    var btn = document.getElementById("nav-saved-cards-btn");
    if (!panel || !backdrop) return;
    panelOpen = true;
    panel.hidden = false;
    backdrop.hidden = false;
    if (btn) btn.setAttribute("aria-expanded", "true");
    positionSavedPanel();
    panel.classList.add("saved-cards-panel--open");
    backdrop.classList.add("saved-cards-backdrop--open");
    renderPanelContent();
  }

  function closePanel() {
    var panel = document.getElementById("saved-cards-panel");
    var backdrop = document.getElementById("saved-cards-backdrop");
    var btn = document.getElementById("nav-saved-cards-btn");
    if (!panel || !backdrop) return;
    panelOpen = false;
    if (btn) btn.setAttribute("aria-expanded", "false");
    panel.classList.remove("saved-cards-panel--open");
    backdrop.classList.remove("saved-cards-backdrop--open");
    setTimeout(function () {
      if (!panelOpen) {
        panel.hidden = true;
        backdrop.hidden = true;
      }
    }, 220);
  }

  function ensurePanelDom() {
    var backdrop = document.getElementById("saved-cards-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "saved-cards-backdrop";
      backdrop.className = "saved-cards-backdrop";
      backdrop.hidden = true;
      backdrop.addEventListener("click", closePanel);
      document.body.appendChild(backdrop);
    }

    var panel = document.getElementById("saved-cards-panel");
    if (!panel) {
      panel = document.createElement("aside");
      panel.id = "saved-cards-panel";
      panel.className = "saved-cards-panel";
      panel.hidden = true;
      panel.setAttribute("aria-label", t("savedCards.panelTitle"));
      panel.innerHTML =
        '<div class="saved-cards-panel__head">' +
          '<h2 class="saved-cards-panel__title">' + escapeHtml(t("savedCards.panelTitle")) + "</h2>" +
          '<button type="button" class="saved-cards-panel__close" id="saved-cards-panel-close" aria-label="' + escapeAttr(t("savedCards.close")) + '">&times;</button>' +
        "</div>" +
        '<div id="saved-cards-panel-login" class="saved-cards-panel__login" hidden>' +
          '<p>' + escapeHtml(t("savedCards.panelLogin")) + "</p>" +
          '<button type="button" class="saved-cards-panel__login-btn" id="saved-cards-login-btn">' + escapeHtml(t("savedCards.loginBtn")) + "</button>" +
        "</div>" +
        '<p id="saved-cards-panel-empty" class="saved-cards-panel__empty" hidden>' + escapeHtml(t("savedCards.panelEmpty")) + "</p>" +
        '<div id="saved-cards-panel-list" class="saved-cards-panel__list"></div>';
      document.body.appendChild(panel);

      document.getElementById("saved-cards-panel-close").addEventListener("click", closePanel);
      document.getElementById("saved-cards-login-btn").addEventListener("click", function () {
        if (typeof window.startDiscordLogin === "function") window.startDiscordLogin();
      });
      bindPanelActions();
    } else if (panel.parentNode !== document.body) {
      document.body.appendChild(panel);
    }

    if (panel && panel.dataset.bsvPanelActions !== "1") {
      bindPanelActions();
    }
  }

  function ensureHeaderButton() {
    if (document.getElementById("nav-saved-cards-btn")) return;
    var tools = document.getElementById("nav-tools");
    var settingsBtn = document.getElementById("nav-settings-btn");
    if (!tools || !settingsBtn) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "nav-saved-cards-btn";
    btn.className = "nav-saved-cards-btn";
    btn.title = t("savedCards.headerBtn");
    btn.setAttribute("aria-label", t("savedCards.headerBtnAria"));
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "true");
    btn.innerHTML =
      '<svg class="nav-saved-cards-btn__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>' +
      "</svg>";

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (panelOpen) closePanel();
      else openPanel();
    });

    settingsBtn.insertAdjacentElement("beforebegin", btn);
    if (typeof initMobileHeaderToolbar === "function") initMobileHeaderToolbar();
  }

  function unsaveCardFromToggle(cardEl, payload, key) {
    var existing = findSavedCardForPayload(payload);
    if (!existing) {
      existing = savedCards.find(function (c) { return cardStorageKey(c) === key; });
    }
    if (!existing) {
      var name = String(payload.name || "").trim().toLowerCase();
      var type = String(payload.cardType || "weapon").trim().toLowerCase();
      existing = savedCards.find(function (c) {
        return String(c.name || "").trim().toLowerCase() === name &&
          cardTypesMatch(c.cardType, type);
      }) || null;
    }
    if (!existing) {
      if (!removeSavedCardsFromState(null, key)) {
        syncCardSaveButtons();
      }
      return;
    }

    var removeId = existing.id;
    trackPendingRemoval(removeId, key);
    removeSavedCardsFromState(removeId, key);

    if (!removeId) return;

    completeSavedCardRemoval(removeId, key);
  }

  function toggleSaveOnCard(cardEl) {
    if (!getAuthToken()) {
      if (typeof window.startDiscordLogin === "function") {
        setTimeout(function () { window.startDiscordLogin(); }, 600);
      }
      return;
    }

    var payload = cardPayloadFromElement(cardEl);
    if (!payload) return;
    var key = cardStorageKey(payload);
    var wantsUnsave = cardSaveButtonShowsSaved(cardEl);

    if (wantsUnsave || isPayloadSaved(payload) || isSavedKey(key)) {
      unsaveCardFromToggle(cardEl, payload, key);
      return;
    }

    resolveCurrentUser().then(function () {
      return saveCardPayload(payload);
    }).then(function (data) {
      if (data && data.card) {
        if (!data.alreadySaved) {
          savedCards = savedCards.filter(function (c) { return cardStorageKey(c) !== key; });
          savedCards.unshift(data.card);
          bumpSavedCardsRevision();
          if (useLocalStorage) writeLocalSavedCards(savedCards);
        }
        updateUi();
        syncCardSaveButtons();
      }
    }).catch(function () {});
  }

  function handleCardSaveClick(e) {
    var saveBtn = e.target.closest(".card-save-btn");
    if (!saveBtn) return;
    var cardEl = saveBtn.closest(".card[data-save-card]");
    if (!cardEl) return;
    e.preventDefault();
    e.stopPropagation();
    toggleSaveOnCard(cardEl);
  }

  function bindCardClicks() {
    if (window.__bsvSavedCardClicksBound) return;
    window.__bsvSavedCardClicksBound = true;
    document.addEventListener("click", handleCardSaveClick, true);
  }

  function initSavedCards() {
    ensureHeaderButton();
    ensurePanelDom();
    bindPanelActions();
    bindCardClicks();
    fetchSavedCards();

    window.addEventListener("resize", function () {
      if (panelOpen) positionSavedPanel();
    });

    document.addEventListener("bsv:authchange", function (e) {
      setCurrentUser(e.detail && e.detail.user);
      if (!getAuthToken()) {
        pendingRemovalIds = Object.create(null);
        pendingRemovalKeys = Object.create(null);
      }
      fetchSavedCards();
      if (panelOpen) renderPanelContent();
    });

    document.addEventListener("bsv:languagechange", function () {
      ensureHeaderButton();
      var btn = document.getElementById("nav-saved-cards-btn");
      if (btn) {
        btn.title = t("savedCards.headerBtn");
        btn.setAttribute("aria-label", t("savedCards.headerBtnAria"));
      }
      renderPanelContent();
      syncCardSaveButtons();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panelOpen) closePanel();
    });
  }

  window.bsvRefreshSavedCardButtons = syncCardSaveButtons;
  window.bsvFetchSavedCards = fetchSavedCards;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSavedCards);
  } else {
    initSavedCards();
  }
})();
