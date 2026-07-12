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
      homeValueChanges: false,
      accessoriesFastNav: false,
    },
    {
      title: "Misc",
      id: "misc",
      navGroup: "main",
      dataSource: "sheet",
      sheetName: "Misc",
      search: "show",
      mobileSearchInSection: true,
      sidebarColumn: "show",
      taxCalc: "show",
      middlemanPromo: "show",
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
      homeValueChanges: false,
      accessoriesFastNav: false,
      moneyGuideFastNav: false,
    },
    {
      title: ACCESSORIES_SECTION_TITLE,
      id: "untradeable-items",
      navGroup: "main",
      dataSource: "sheet",
      sheetName: "Accessories",
      search: "hide",
      mobileSearchInSection: true,
      sidebarColumn: "show",
      taxCalc: "ghost",
      middlemanPromo: "ghost",
      homeValueChanges: false,
      accessoriesFastNav: true,
      crewFastNav: false,
      moneyGuideFastNav: false,
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
      homeValueChanges: false,
      accessoriesFastNav: false,
      moneyGuideFastNav: true,
    },
    {
      title: "💰 Richest Players",
      id: "richest-players",
      navGroup: "extras",
      dataSource: "richest",
      search: "hide",
      mobileSearchInSection: false,
      sidebarColumn: "show",
      taxCalc: "ghost",
      middlemanPromo: "ghost",
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

  global.BSV_ACCESSORIES_SECTION_TITLE = ACCESSORIES_SECTION_TITLE;
  global.BSV_SECTION_REGISTRY = BSV_SECTION_REGISTRY;
  global.getSectionRegistry = getSectionRegistry;
  global.getSectionTitles = getSectionTitles;
  global.getSectionConfig = getSectionConfig;
  global.getSectionConfigById = getSectionConfigById;
  global.applyVisibilityMode = applyVisibilityMode;
})(typeof window !== "undefined" ? window : globalThis);
