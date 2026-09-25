(function () {
  var FONT_KEY = "bsv-font";
  var BG_STYLE_KEY = "bsv-bg-style";
  var BG_HUE_KEY = "bsv-bg-hue";
  var DEFAULT_HUE = 210;

  var FONTS = [
    {
      id: "default",
      name: "Default",
      family: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    },
    {
      id: "paytone",
      name: "Paytone One",
      family: "'Paytone One', sans-serif"
    },
    {
      id: "nunito",
      name: "Nunito Sans",
      family: "'Nunito Sans', sans-serif"
    },
    {
      id: "bebas",
      name: "Bebas Neue",
      family: "'Bebas Neue', sans-serif"
    },
    {
      id: "inter",
      name: "Inter",
      family: "'Inter', sans-serif"
    },
    {
      id: "roboto",
      name: "Roboto",
      family: "'Roboto', sans-serif"
    },
    {
      id: "poppins",
      name: "Poppins",
      family: "'Poppins', sans-serif"
    },
    {
      id: "oswald",
      name: "Oswald",
      family: "'Oswald', sans-serif"
    }
  ];

  function getFontDef(id) {
    return (
      FONTS.find(function (f) {
        return f.id === id;
      }) || FONTS[0]
    );
  }

  function getSavedFont() {
    try {
      return localStorage.getItem(FONT_KEY) || "default";
    } catch (_) {
      return "default";
    }
  }

  function getSavedBgStyle() {
    try {
      var s = localStorage.getItem(BG_STYLE_KEY);
      if (s === "colorized" || s === "dark") return s;
      return "standard";
    } catch (_) {
      return "standard";
    }
  }

  function normalizeBgStyle(style) {
    if (style === "colorized" || style === "dark") return style;
    return "standard";
  }

  function getSavedBgHue() {
    try {
      var h = parseInt(localStorage.getItem(BG_HUE_KEY) || String(DEFAULT_HUE), 10);
      if (isNaN(h)) return DEFAULT_HUE;
      return Math.max(0, Math.min(360, h));
    } catch (_) {
      return DEFAULT_HUE;
    }
  }

  function ensureThemeFontsLoaded() {
    if (document.getElementById("bsv-theme-fonts")) return;
    var link = document.createElement("link");
    link.id = "bsv-theme-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700&family=Nunito+Sans:ital,wght@0,600;0,700;1,600&family=Oswald:wght@500;600;700&family=Poppins:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }

  function applyFont(fontId) {
    var def = getFontDef(fontId);
    if (fontId && fontId !== "default" && fontId !== "paytone") {
      ensureThemeFontsLoaded();
    }
    document.documentElement.style.setProperty("--bsv-site-font", def.family);
    if (fontId === "default") {
      document.documentElement.removeAttribute("data-bsv-font");
    } else {
      document.documentElement.setAttribute("data-bsv-font", fontId);
    }
    try {
      localStorage.setItem(FONT_KEY, fontId);
    } catch (_) {}
    document.querySelectorAll(".site-settings-font-chip").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.font === fontId);
    });
  }

  function isSponsorsPage() {
    try {
      if (/\/sponsors(\/|$)/i.test(location.pathname || "")) return true;
      var body = document.body;
      return !!(
        body &&
        (body.getAttribute("data-bsv-page") === "sponsors" ||
          body.classList.contains("sponsors-body"))
      );
    } catch (_) {
      return false;
    }
  }

  // One hue drives the whole navy surface ladder (shade/lightness stays fixed in CSS).
  function applyBackground(style, hue) {
    var root = document.documentElement;
    var mode = normalizeBgStyle(style);
    var h = typeof hue === "number" && !isNaN(hue) ? hue : getSavedBgHue();
    h = Math.max(0, Math.min(360, Math.round(h)));

    // Sponsorship pages always stay stock navy (still save preference for other pages).
    if (isSponsorsPage()) {
      root.style.setProperty("--bsv-hue", "217");
      root.style.setProperty("--bsv-accent-hue", "188");
      root.style.backgroundColor = "hsl(217, 41%, 10%)";
      root.removeAttribute("data-bsv-bg");
      root.setAttribute("data-bsv-sponsors-lock", "1");
      try {
        localStorage.setItem(BG_STYLE_KEY, mode);
        localStorage.setItem(BG_HUE_KEY, String(h));
      } catch (_) {}
      syncBgControls(mode, h);
      return;
    }

    root.removeAttribute("data-bsv-sponsors-lock");
    if (mode === "colorized") {
      root.style.setProperty("--bsv-hue", String(h));
      root.style.setProperty("--bsv-accent-hue", String(h));
      root.style.backgroundColor = "hsl(" + h + ", 41%, 10%)";
      root.setAttribute("data-bsv-bg", "colorized");
    } else if (mode === "dark") {
      root.style.setProperty("--bsv-hue", "220");
      root.style.setProperty("--bsv-accent-hue", "188");
      root.style.backgroundColor = "hsl(220, 20%, 4%)";
      root.setAttribute("data-bsv-bg", "dark");
    } else {
      root.style.setProperty("--bsv-hue", "217");
      root.style.setProperty("--bsv-accent-hue", "188");
      root.style.backgroundColor = "hsl(217, 41%, 10%)";
      root.removeAttribute("data-bsv-bg");
    }

    try {
      localStorage.setItem(BG_STYLE_KEY, mode);
      localStorage.setItem(BG_HUE_KEY, String(h));
    } catch (_) {}

    syncBgControls(mode, h);
  }

  function syncBgControls(style, hue) {
    document.querySelectorAll("[data-bg-style]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-bg-style") === style);
    });
    var row = document.getElementById("site-settings-color-row");
    var slider = document.getElementById("bsv-bg-hue");
    if (row) row.hidden = style !== "colorized";
    if (slider) {
      slider.disabled = style !== "colorized";
      if (typeof hue === "number") slider.value = String(hue);
    }
  }

  function closeSettingsModal() {
    var modal = document.getElementById("site-settings-modal");
    var btn = document.getElementById("nav-settings-btn");
    if (modal) modal.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("site-settings-open");
  }

  function openSettingsModal() {
    var modal = document.getElementById("site-settings-modal");
    var btn = document.getElementById("nav-settings-btn");
    if (!modal || !btn) return;
    ensureThemeFontsLoaded();
    modal.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("site-settings-open");
    var closeBtn = document.getElementById("site-settings-close");
    if (closeBtn) closeBtn.focus();
  }

  function toggleSettingsModal() {
    var modal = document.getElementById("site-settings-modal");
    if (!modal) return;
    if (modal.hidden) openSettingsModal();
    else closeSettingsModal();
  }

  function buildFontGrid() {
    var grid = document.getElementById("font-picker-grid");
    if (!grid || grid.dataset.built === "1") return;
    grid.dataset.built = "1";
    grid.innerHTML = FONTS.map(function (def) {
      return (
        '<button type="button" class="site-settings-font-chip" data-font="' +
        def.id +
        '" style="font-family:' +
        def.family +
        '">' +
        def.name +
        "</button>"
      );
    }).join("");
    grid.querySelectorAll(".site-settings-font-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyFont(btn.dataset.font);
      });
    });
  }

  function initBackgroundControls() {
    var style = getSavedBgStyle();
    var hue = getSavedBgHue();
    applyBackground(style, hue);

    document.querySelectorAll("[data-bg-style]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyBackground(btn.getAttribute("data-bg-style"), getSavedBgHue());
      });
    });

    var slider = document.getElementById("bsv-bg-hue");
    if (slider) {
      slider.addEventListener("input", function () {
        applyBackground("colorized", parseInt(slider.value, 10));
      });
    }
  }

  function initSiteSettings() {
    document.documentElement.classList.remove("bsv-card-effects-off");
    applyFont(getSavedFont());
    buildFontGrid();
    initBackgroundControls();

    var settingsBtn = document.getElementById("nav-settings-btn");
    var modal = document.getElementById("site-settings-modal");
    var backdrop = document.getElementById("site-settings-backdrop");
    var closeBtn = document.getElementById("site-settings-close");

    if (settingsBtn) {
      settingsBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleSettingsModal();
      });
    }

    if (backdrop) backdrop.addEventListener("click", closeSettingsModal);
    if (closeBtn) closeBtn.addEventListener("click", closeSettingsModal);

    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.bsvI18n) window.bsvI18n.applyLanguage(btn.getAttribute("data-lang"));
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSettingsModal();
    });

    if (modal) modal.hidden = true;
  }

  window.bsvApplySiteFont = applyFont;
  window.bsvApplySiteBackground = applyBackground;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteSettings);
  } else {
    initSiteSettings();
  }
})();
