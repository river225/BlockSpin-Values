(function () {
  var FONT_KEY = "bsv-font";

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

  function applyFont(fontId) {
    var def = getFontDef(fontId);
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

  function initSiteSettings() {
    document.documentElement.classList.remove("bsv-card-effects-off");
    applyFont(getSavedFont());
    buildFontGrid();

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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteSettings);
  } else {
    initSiteSettings();
  }
})();
