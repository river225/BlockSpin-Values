/**
 * BlockSpin Values — per-section parent rules (test site only).
 * Add or edit one registry entry when you need a new section layout.
 * Render functions keep the same HTML/classes; this only drives nav, sidebar, search, and data.
 */
(function (global) {
  /** @typedef {'main'|'extras'} NavGroup */
  /** @typedef {'show'|'hide'|'ghost'} VisibilityMode */
  /** @typedef {'none'|'sheet'|'richest'} DataSource */

  const ACCESSORIES_SECTION_TITLE = "Untradeable Items";

  /** @type {Array<object>} */
  const BSV_SECTION_REGISTRY = [
    {
      title: "Home",
      id: "home",
      navGroup: "main",
      dataSource: "none",
      search: "hide",
      mobileSearchInSection: false,
      sidebarColumn: "hide",
      taxCalc: "hide",
      middlemanPromo: "hide",
      mobileTaxArrow: true,
      homeValueChanges: false,
      accessoriesFastNav: false,
      crewFastNav: false,
    },
    {
      title: "Common / Uncommon",
      id: "uncommon",
      navGroup: "main",
      dataSource: "sheet",
      sheetName: "Uncommon",
      search: "show",
      mobileSearchInSection: true,
      sidebarColumn: "show",
      taxCalc: "show",
      middlemanPromo: "show",
      mobileTaxArrow: true,
      homeValueChanges: false,
      accessoriesFastNav: false,
    },
    {
      title: "Rare",
      id: "rare",
      navGroup: "main",
      dataSource: "sheet",
      sheetName: "Rare",
      search: "show",
      mobileSearchInSection: true,
      sidebarColumn: "show",
      taxCalc: "show",
      middlemanPromo: "show",
      mobileTaxArrow: true,
      homeValueChanges: false,
      accessoriesFastNav: false,
    },
    {
      title: "Epic",
      id: "epic",
      navGroup: "main",
      dataSource: "sheet",
      sheetName: "Epic",
      search: "show",
      mobileSearchInSection: true,
      sidebarColumn: "show",
      taxCalc: "show",
      middlemanPromo: "show",
      mobileTaxArrow: true,
      homeValueChanges: false,
      accessoriesFastNav: false,
    },
    {
      title: "Legendary",
      id: "legendary",
      navGroup: "main",
      dataSource: "sheet",
      sheetName: "Legendary",
      search: "show",
      mobileSearchInSection: true,
      sidebarColumn: "show",
      taxCalc: "show",
      middlemanPromo: "show",
      mobileTaxArrow: true,
      homeValueChanges: false,
      accessoriesFastNav: false,
    },
    {
      title: "Omega",
      id: "omega",
      navGroup: "main",
      dataSource: "sheet",
      sheetName: "Omega",
      search: "show",
      mobileSearchInSection: true,
      sidebarColumn: "show",
      taxCalc: "show",
      middlemanPromo: "show",
      mobileTaxArrow: true,
      homeValueChanges: false,
      accessoriesFastNav: false,
    },
    {
      title: "Gamepass / Misc",
      id: "misc",
      navGroup: "main",
      dataSource: "sheet",
      sheetName: "Misc",
      search: "show",
      mobileSearchInSection: true,
      sidebarColumn: "show",
      taxCalc: "show",
      middlemanPromo: "show",
      mobileTaxArrow: true,
      homeValueChanges: false,
      accessoriesFastNav: false,
    },
    {
      title: "Vehicles",
      id: "vehicles",
      navGroup: "main",
      dataSource: "sheet",
      sheetName: "Vehicles",
      search: "show",
      mobileSearchInSection: true,
      sidebarColumn: "show",
      taxCalc: "show",
      middlemanPromo: "show",
      mobileTaxArrow: true,
      homeValueChanges: false,
      accessoriesFastNav: false,
      moneyGuideFastNav: false,
    },
    {
      title: "Live Trading",
      id: "live-trading",
      navGroup: "extras",
      pageHref: "live-trading.html",
      dataSource: "none",
      search: "hide",
      mobileSearchInSection: false,
      sidebarColumn: "show",
      taxCalc: "ghost",
      middlemanPromo: "ghost",
      mobileTaxArrow: false,
      homeValueChanges: false,
      accessoriesFastNav: false,
      moneyGuideFastNav: false,
      crewFastNav: false,
    },
    {
      title: "Money & Game Guide",
      id: "money-game-guide",
      navGroup: "extras",
      dataSource: "none",
      search: "hide",
      mobileSearchInSection: false,
      sidebarColumn: "show",
      taxCalc: "ghost",
      middlemanPromo: "ghost",
      mobileTaxArrow: false,
      homeValueChanges: false,
      accessoriesFastNav: false,
      moneyGuideFastNav: true,
    },
    {
      title: ACCESSORIES_SECTION_TITLE,
      id: "untradeable-items",
      navGroup: "extras",
      dataSource: "sheet",
      sheetName: "Accessories",
      search: "hide",
      mobileSearchInSection: true,
      sidebarColumn: "show",
      taxCalc: "ghost",
      middlemanPromo: "ghost",
      mobileTaxArrow: false,
      homeValueChanges: false,
      accessoriesFastNav: true,
      crewFastNav: false,
      moneyGuideFastNav: false,
    },
    {
      title: "Richest Players",
      id: "richest-players",
      navGroup: "extras",
      dataSource: "richest",
      search: "hide",
      mobileSearchInSection: false,
      sidebarColumn: "show",
      taxCalc: "ghost",
      middlemanPromo: "ghost",
      mobileTaxArrow: false,
      homeValueChanges: false,
      accessoriesFastNav: false,
      moneyGuideFastNav: false,
    },
    {
      title: "Crew Logos",
      id: "crew-logos",
      navGroup: "extras",
      dataSource: "sheet",
      sheetName: "Crew Logos",
      search: "hide",
      mobileSearchInSection: false,
      sidebarColumn: "show",
      taxCalc: "ghost",
      middlemanPromo: "ghost",
      mobileTaxArrow: false,
      homeValueChanges: false,
      accessoriesFastNav: false,
      crewFastNav: true,
      moneyGuideFastNav: false,
    }
  ];

  const registryByTitle = Object.create(null);
  const registryById = Object.create(null);
  BSV_SECTION_REGISTRY.forEach(function (entry) {
    registryByTitle[entry.title] = entry;
    registryById[entry.id] = entry;
  });

  function getSectionRegistry() {
    return BSV_SECTION_REGISTRY.slice();
  }

  function getSectionTitles() {
    return BSV_SECTION_REGISTRY.map(function (entry) { return entry.title; });
  }

  function getSectionConfig(title) {
    return registryByTitle[title] || null;
  }

  function getSectionConfigById(id) {
    return registryById[id] || null;
  }

  function applyVisibilityMode(el, mode, displayWhenShown) {
    if (!el) return;
    if (mode === "hide") {
      el.style.display = "none";
      el.style.visibility = "hidden";
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      return;
    }
    if (mode === "ghost") {
      el.style.display = displayWhenShown || "block";
      el.style.visibility = "hidden";
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      return;
    }
    el.style.display = displayWhenShown || "block";
    el.style.visibility = "visible";
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";
  }

  /** Shared section-nav icons — used by index (script.js) and live-trading.js. */
  function getSectionNavIconHtml(name) {
    var paths = {
      Home:
        '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>',
      "Common / Uncommon":
        '<circle cx="12" cy="12" r="7"/><path d="M12 8v8M8.5 12h7"/>',
      Rare:
        '<path d="M12 3.5 14.8 9l6.2.6-4.7 4.1 1.4 6.1L12 16.8 6.3 19.8l1.4-6.1L3 9.6 9.2 9z"/>',
      Epic:
        '<path d="M12 3v4M12 17v4M4.9 6.5l2.8 2.8M16.3 14.7l2.8 2.8M3 12h4M17 12h4M4.9 17.5l2.8-2.8M16.3 9.3l2.8-2.8"/>',
      Legendary:
        '<path d="M5 9.5 7.5 7l2.2 2.2L12 5.5l2.3 3.7L16.5 7 19 9.5l-1 8H6z"/><path d="M8 17.5h8"/>',
      Omega:
        '<path d="M13 3 7.5 12.5H12l-1 8.5L17.5 11H13z"/>',
      "Gamepass / Misc":
        '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
      Misc:
        '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
      Vehicles:
        '<path d="M4 14h16l-1.4-4.2A2 2 0 0 0 16.7 8H7.3a2 2 0 0 0-1.9 1.8z"/><path d="M6.5 17.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/><path d="M17.5 17.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/><path d="M8 14.5h8"/>',
      "Live Trading":
        '<path d="M6 8h12"/><path d="M15 5l3 3-3 3"/><path d="M18 16H6"/><path d="M9 13l-3 3 3 3"/>',
      "Money & Game Guide":
        '<path d="M6 5.5h9.5A2.5 2.5 0 0 1 18 8v11.5H8A2 2 0 0 1 6 17.5z"/><path d="M6 5.5V17.5"/><path d="M10 10h5M10 13.5h4"/>',
      "Untradeable Items":
        '<rect x="6" y="10" width="12" height="9" rx="1.5"/><path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2"/><path d="M12 13.5v2.5"/>',
      "Richest Players":
        '<path d="M12 4v16"/><path d="M16 8c0-1.8-1.8-3-4-3s-4 1.2-4 3 1.6 2.6 4 3.2 4 1.5 4 3.3-1.8 3.5-4 3.5-4-1.3-4-3.2"/>',
      "Crew Logos":
        '<circle cx="9" cy="9" r="2.4"/><circle cx="16" cy="10" r="2.1"/><path d="M4.8 17.5c.6-2.2 2.4-3.5 4.2-3.5s3.6 1.3 4.2 3.5"/><path d="M13.2 17.5c.4-1.4 1.5-2.4 2.8-2.4 1.2 0 2.2.8 2.7 2"/>'
    };
    var inner = paths[name] || paths.Misc;
    var large = name === "Live Trading" || name === "Crew Logos";
    var sizeClass = large ? " nav-section-icon__svg--lg" : "";
    var stroke = large ? "1.85" : "1.9";
    return (
      '<svg class="nav-section-icon__svg' +
        sizeClass +
        '" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="' +
        stroke +
        '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        inner +
      "</svg>"
    );
  }

  function appendSectionNavIcon(btn, name) {
    if (!btn) return;
    var icon = document.createElement("span");
    icon.className = "nav-section-icon";
    if (name === "Live Trading" || name === "Crew Logos") {
      icon.classList.add("nav-section-icon--lg");
    }
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = getSectionNavIconHtml(name);
    btn.appendChild(icon);
  }

  global.BSV_ACCESSORIES_SECTION_TITLE = ACCESSORIES_SECTION_TITLE;
  global.BSV_SECTION_REGISTRY = BSV_SECTION_REGISTRY;
  global.getSectionRegistry = getSectionRegistry;
  global.getSectionTitles = getSectionTitles;
  global.getSectionConfig = getSectionConfig;
  global.getSectionConfigById = getSectionConfigById;
  global.applyVisibilityMode = applyVisibilityMode;
  global.getSectionNavIconHtml = getSectionNavIconHtml;
  global.appendSectionNavIcon = appendSectionNavIcon;
})(typeof window !== "undefined" ? window : globalThis);
