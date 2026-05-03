const SPREADSHEET_ID = "1vAm9x7c5JPxpHxDHVcDgQifXsAvW9iW2wPVuQLENiYs";
const SECTION_NAMES = [
  "Home",
  "Common / Uncommon",
  "Rare", 
  "Epic",
  "Legendary",
  "Omega",
  "Misc",
  "Vehicles",
  "Untradable Items",
  
  "💰 Richest Players",
  "Crew Logos"
];

const GA_MEASUREMENT_ID = "G-0T25993BCC";
const ACCESSORIES_SECTION_NAME = "Untradable Items";
const BOOSTERS_API_URL = "https://bsv-bot-production.up.railway.app/api/boosters";
const GIVEAWAY_CONFIG_SPREADSHEET_ID = "1hjj8Pd21KOhI9bjUz4-UupADhJzksATcVDJfo186GFk";
const GIVEAWAYS_SHEET_NAME = "Giveaways";
const BANNERS_SHEET_NAME = "banner";
const CONTENT_SHEET_NAME = "content";
const TRUE_REGEX = /^(yes|true|1|on|y)$/i;
const FALSE_REGEX = /^(no|false|0|off|n)$/i;
const giveawayItems = new Set();
const bannerVisibility = { anaconda: false, firework: false };
const sectionContentEmbeds = new Map();
const CONTENT_SECTIONS = [
  "Common / Uncommon",
  "Rare",
  "Epic",
  "Legendary",
  "Omega",
  "Misc",
  "Vehicles"
];

function initAnalytics() {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") return;
  if (typeof window.gtag === "function") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);

  var gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(gaScript);
}

function trackEvent(name, params) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params || {});
}

function setupDiscordClickTracking() {
  if (document.documentElement.dataset.discordTrackingInit === "1") return;
  document.documentElement.dataset.discordTrackingInit = "1";
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href*="discord.gg"], a[href*="discord.com/invite"]');
    if (!link) return;
    trackEvent("discord_click", {
      link_url: link.href,
      link_text: (link.textContent || "").trim().slice(0, 80),
      page_path: window.location.pathname
    });
  });
}

const TAX_RECEIVE_RATIO = 29091 / 40000;
const TAX_MAX_DROP = 40000;
const TAX_RECEIVE_PER_40K = 29091;

function formatNetWorth(value) {
  const cleanValue = String(value).replace(/[$,]/g, '');
  const num = parseFloat(cleanValue);
  
  if (isNaN(num)) return '$0';
  
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  }
  return `$${num.toLocaleString()}`;
}

function getRankColor(rank) {
  if (rank === 1) return '#FFD700';
  if (rank === 2) return '#C0C0C0';
  if (rank === 3) return '#CD7F32';
  if (rank >= 4 && rank <= 25) return '#8B5CF6';
  if (rank >= 26 && rank <= 100) return '#EC4899';
  if (rank >= 101 && rank <= 500) return '#48BB78';
  return '#A0A0A0';
}

function getRankSize(rank) {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  if (rank >= 4 && rank <= 25) return 'rank-top25';
  return 'rank-default';
}

function createRichestPlayersSection(data) {
  if (!data || data.length === 0) {
    return '<p style="text-align: center; color: #888;">No leaderboard data available.</p>';
  }

  const intro = `
    <div class="richest-players-header">
      <h2>Top 1,000 Richest Players in BlockSpin</h2>
      <p class="richest-intro">The Official BlockSpin leaderboard showing the wealthiest players ranked by the total value of their in-game assets. Rankings go to #1000 and update hourly. To appear, verify yourself in the official BlockSpin Discord server.</p>
      <input 
        type="text" 
        class="richest-search" 
        id="richest-search-input"
        placeholder="🔍 Search players by username..."
      />
    </div>
  `;

  const cards = data.map((player, index) => {
    const rank = index + 1;
    const rankColor = getRankColor(rank);
    const formattedWorth = formatNetWorth(player['Networth'] || player['Net Worth'] || 0);
    const playerName = player['Roblox Username'] || player['Player Name'] || player.Name || 'Unknown';
    const level = player['Level'] || 'N/A';
    const rankClass = ("" + rank).length >= 3 ? "rank-long" : "";
    
    const robloxSearchUrl = `https://www.roblox.com/search/users?keyword=${encodeURIComponent(playerName)}`;

    return `
      <div class="richest-card ${getRankSize(rank)}" style="border-color: ${rankColor};" data-player-name="${playerName}">
        <div class="rank-badge ${rankClass}" style="background: ${rankColor};">
          #${rank}
        </div>
        <div class="player-info">
          <div class="player-name">${playerName}</div>
          <div class="player-level"><span style="color: #fff; font-size: 0.9em;">Level: </span><span style="color: #33cce6; font-weight: bold;">${level}</span></div>
          <div class="player-worth"><span style="color: #fff; font-size: 0.9em;">Net Worth: </span>${formattedWorth}</div>
          <a href="${robloxSearchUrl}" target="_blank" rel="noopener" class="profile-link">View Profile 🔗</a>
        </div>
      </div>
    `;
  }).join('');

  return intro + '<div class="richest-container">' + cards + '</div>';
}

function filterRichestPlayers(query) {
  const searchTerm = query.toLowerCase().trim();
  const cards = document.querySelectorAll('.richest-card');
  
  cards.forEach(card => {
    const playerName = (card.dataset.playerName || '').toLowerCase();
    if (playerName.includes(searchTerm)) {
      card.style.setProperty('display', 'flex', 'important');
    } else {
      card.style.setProperty('display', 'none', 'important');
    }
  });
}

async function fetchSheet(sheetName) {
  try {
    const base = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq`;
    const url = `${base}?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&headers=1`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));

    const cols = json.table.cols.map(c => c.label?.trim() || "");
    const rows = json.table.rows || [];
    const internalColIdx = cols.findIndex(l =>
      normalizeHeaderKey(l).includes("internalvalue")
    );

    const items = rows.map(r => {
      const obj = {};
      cols.forEach((label, i) => {
        const cell = r.c?.[i];
        obj[label] = getCellDisplayValue(cell);
      });
      if (internalColIdx >= 0) {
        obj["Internal Value"] = coerceInternalCell(r.c?.[internalColIdx]);
      }
      obj.__rowValues = (r.c || []).map(getCellDisplayValue);
      obj.__colLabels = cols.slice();
      return obj;
    });

    if (sheetName === "Website Configs") {
      return items;
    }

    return items.filter(x =>
      String(
        x["Name"] ||
        x["Header"] ||
        x["Roblox Name"] ||
        x["Player Name"] ||
        ""
      ).trim().length > 0
    );
  } catch (err) {
    console.error(`Failed to fetch sheet: ${sheetName}`, err);
    return [];
  }
}

async function fetchRichestPlayers() {
  try {
    const RICHEST_SPREADSHEET_ID = "1nfWrJcFkVCZ-Yr0mWmCCjQoQgUD3_-W2Qsy4XD4NT3k";
    const base = `https://docs.google.com/spreadsheets/d/${RICHEST_SPREADSHEET_ID}/gviz/tq`;
    const url = `${base}?tqx=out:json&headers=1`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));

    const cols = json.table.cols.map(c => c.label?.trim() || "");
    const rows = json.table.rows || [];
    const items = rows.map(r => {
      const obj = {};
      cols.forEach((label, i) => {
        const cell = r.c?.[i];
        obj[label] = getCellDisplayValue(cell);
      });
      obj.__rowValues = (r.c || []).map(getCellDisplayValue);
      obj.__colLabels = cols.slice();
      return obj;
    });

    const validItems = items.filter(x => String(x["Roblox Username"] || "").trim().length > 0);
    return validItems;
  } catch (err) {
    console.error('Failed to fetch Richest Players', err);
    return [];
  }
}

async function fetchExternalSheet(spreadsheetId, sheetName) {
  try {
    const base = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`;
    const url = `${base}?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&headers=1`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));
    const cols = json.table.cols.map((c) => c.label?.trim() || "");
    const rows = json.table.rows || [];
    return rows.map((r) => {
      const obj = {};
      cols.forEach((label, i) => {
        obj[label] = getCellDisplayValue(r.c?.[i]);
      });
      return obj;
    });
  } catch (err) {
    console.error(`Failed to fetch external sheet: ${sheetName}`, err);
    return [];
  }
}

function parseBooleanCell(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (TRUE_REGEX.test(raw)) return true;
  if (FALSE_REGEX.test(raw)) return false;
  return null;
}

function normalizeItemName(name) {
  return String(name || "").trim().toLowerCase();
}

function extractCellValueByIncludes(row, keyword) {
  const keys = Object.keys(row || {});
  for (const key of keys) {
    if (key.toLowerCase().includes(keyword)) return row[key];
  }
  return "";
}

function rowHasKeyword(row, keyword) {
  const needle = String(keyword || "").toLowerCase();
  if (!needle) return false;
  const keys = Object.keys(row || {});
  for (const key of keys) {
    const keyLower = String(key || "").toLowerCase();
    const valueLower = String(row[key] || "").toLowerCase();
    if (keyLower.includes(needle) || valueLower.includes(needle)) return true;
  }
  return false;
}

function parseBannerDecisionForKeyword(row, keyword) {
  const keys = Object.keys(row || {});
  const keywordLower = String(keyword || "").toLowerCase();
  if (!keywordLower) return null;

  // If a yes/no is directly under a keyword-like header (e.g. "Firework Launcher Giveawat")
  for (const key of keys) {
    const keyLower = String(key || "").toLowerCase();
    if (!keyLower.includes(keywordLower)) continue;
    const parsed = parseBooleanCell(row[key]);
    if (parsed !== null) return parsed;
  }

  // If keyword appears in a value cell and yes/no is in another cell on the same row.
  if (rowHasKeyword(row, keywordLower)) {
    for (const key of keys) {
      const parsed = parseBooleanCell(row[key]);
      if (parsed !== null) return parsed;
    }
  }
  return null;
}

function applyExternalBannerVisibility() {
  var anacondaEl = document.getElementById("omega-anaconda-banner");
  var fireworkEl = document.getElementById("epic-firework-banner");
  if (anacondaEl) anacondaEl.style.display = bannerVisibility.anaconda ? "flex" : "none";
  if (fireworkEl) fireworkEl.style.display = bannerVisibility.firework ? "flex" : "none";
}

function normalizeContentSectionName(name) {
  const raw = String(name || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw.includes("uncommon") || raw === "common") return "Common / Uncommon";
  if (raw.includes("rare")) return "Rare";
  if (raw.includes("epic")) return "Epic";
  if (raw.includes("legendary")) return "Legendary";
  if (raw.includes("omega")) return "Omega";
  if (raw.includes("misc")) return "Misc";
  if (raw.includes("vehicle")) return "Vehicles";
  return "";
}

/** Short column headers: Video C, Video R, … Video V (letter = first letter of section). */
function sectionFromVideoColumnHeader(header) {
  const compact = String(header || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  const m = compact.match(/^video([crelomv])$/);
  if (!m) return "";
  const byLetter = {
    c: "Common / Uncommon",
    r: "Rare",
    e: "Epic",
    l: "Legendary",
    o: "Omega",
    m: "Misc",
    v: "Vehicles"
  };
  return byLetter[m[1]] || "";
}

function resolveContentSectionLabel(label) {
  return sectionFromVideoColumnHeader(label) || normalizeContentSectionName(label);
}

function extractVideoEmbedUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (_) {
    return "";
  }
  const host = parsed.hostname.toLowerCase();
  if (host.includes("youtube.com")) {
    const videoId = parsed.searchParams.get("v");
    if (videoId) return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const maybeEmbed = parts[0] === "embed" && parts[1] ? parts[1] : "";
    if (maybeEmbed) return `https://www.youtube.com/embed/${encodeURIComponent(maybeEmbed)}`;
  }
  if (host.includes("youtu.be")) {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
  }
  if (host.includes("tiktok.com")) {
    const parts = parsed.pathname.split("/").filter(Boolean);
    const videoIdx = parts.indexOf("video");
    if (videoIdx >= 0 && parts[videoIdx + 1]) {
      return `https://www.tiktok.com/embed/v2/${encodeURIComponent(parts[videoIdx + 1])}`;
    }
  }
  return "";
}

function extractSectionContentFields(row) {
  const sectionValue =
    row.Section ||
    row.section ||
    row["Section Name"] ||
    row["section name"] ||
    extractCellValueByIncludes(row, "section");
  const linkValue =
    row.Link ||
    row.link ||
    row.URL ||
    row.url ||
    row.Video ||
    row.video ||
    extractCellValueByIncludes(row, "http");

  return {
    section: String(sectionValue || "").trim(),
    link: String(linkValue || "").trim()
  };
}

async function loadSectionContentConfig() {
  sectionContentEmbeds.clear();
  const rows = await fetchExternalSheet(GIVEAWAY_CONFIG_SPREADSHEET_ID, CONTENT_SHEET_NAME);
  const grouped = new Map();

  function pushEmbed(sectionName, rawUrl) {
    const normalizedSection = resolveContentSectionLabel(sectionName);
    if (!normalizedSection) return;
    const embedUrl = extractVideoEmbedUrl(rawUrl);
    if (!embedUrl) return;
    if (!grouped.has(normalizedSection)) grouped.set(normalizedSection, []);
    grouped.get(normalizedSection).push(embedUrl);
  }

  // Format C (horizontal): Google GViz with headers=1 puts spreadsheet row 1 into **column keys**,
  // not into rows[0]. rows[] are data rows only — each object is keyed by section names.
  let usedColumnLayout = false;
  if (rows.length > 0) {
    const columnKeys = Object.keys(rows[0] || {});
    const sectionByColumnKey = new Map();
    columnKeys.forEach((colKey) => {
      const normalized = resolveContentSectionLabel(colKey);
      if (normalized) sectionByColumnKey.set(colKey, normalized);
    });
    if (sectionByColumnKey.size > 0) {
      usedColumnLayout = true;
      rows.forEach((row) => {
        sectionByColumnKey.forEach((sectionName, colKey) => {
          const cellValue = String((row && row[colKey]) || "").trim();
          if (!cellValue || !/^https?:\/\//i.test(cellValue)) return;
          pushEmbed(sectionName, cellValue);
        });
      });
    }
  }

  if (!usedColumnLayout) {
    // Format A support: headers like Section + Link (existing behavior).
    rows.forEach((row) => {
      const fields = extractSectionContentFields(row);
      if (!fields.section || !fields.link) return;
      pushEmbed(fields.section, fields.link);
    });

    // Format B support: section name rows, with links listed beneath.
    let activeSection = "";
    rows.forEach((row) => {
      const cells = Object.values(row || {})
        .map((v) => String(v || "").trim())
        .filter(Boolean);
      if (!cells.length) return;

      const detectedSection = cells
        .map((v) => resolveContentSectionLabel(v))
        .find(Boolean) || "";

      const rawUrls = cells.filter((v) => /^https?:\/\//i.test(v));

      if (detectedSection) {
        activeSection = detectedSection;
        if (rawUrls.length) {
          rawUrls.forEach((url) => pushEmbed(activeSection, url));
        }
        return;
      }

      if (activeSection && rawUrls.length) {
        rawUrls.forEach((url) => pushEmbed(activeSection, url));
      }
    });
  }

  grouped.forEach((links, section) => {
    if (!links.length) return;
    const selected = links[Math.floor(Math.random() * links.length)];
    sectionContentEmbeds.set(section, selected);
  });
}

function renderSectionContentEmbeds() {
  CONTENT_SECTIONS.forEach((sectionName) => {
    const embedUrl = sectionContentEmbeds.get(sectionName);
    if (!embedUrl) return;
    const sectionEl = document.getElementById(slugify(sectionName));
    if (!sectionEl) return;

    const existing = sectionEl.querySelector(".section-content-embed");
    if (existing) existing.remove();

    const isTikTok = /tiktok\.com/i.test(embedUrl);
    const embedKindClass = isTikTok ? "section-content-embed--tiktok" : "section-content-embed--youtube";
    const frameRatioClass = isTikTok
      ? "section-content-embed-frame-wrap--portrait"
      : "section-content-embed-frame-wrap--landscape";

    const wrapper = document.createElement("div");
    wrapper.className = `section-content-embed ${embedKindClass}`;
    wrapper.innerHTML = `
      <h3 class="section-content-embed-title">You might like this BlockSpin Video!</h3>
      <div class="section-content-embed-frame-wrap ${frameRatioClass}">
        <iframe
          src="${escapeAttr(embedUrl)}"
          title="${escapeAttr(sectionName)} featured video"
          loading="lazy"
          allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share">
        </iframe>
      </div>
    `;
    sectionEl.appendChild(wrapper);
  });
}

async function loadExternalGiveawayConfig() {
  giveawayItems.clear();
  bannerVisibility.anaconda = false;
  bannerVisibility.firework = false;

  const [giveawayRows, bannerRows] = await Promise.all([
    fetchExternalSheet(GIVEAWAY_CONFIG_SPREADSHEET_ID, GIVEAWAYS_SHEET_NAME),
    fetchExternalSheet(GIVEAWAY_CONFIG_SPREADSHEET_ID, BANNERS_SHEET_NAME)
  ]);

  giveawayRows.forEach((row) => {
    const item = String(row.Item || row.item || extractCellValueByIncludes(row, "item") || "").trim();
    const giveawayValue = row.Giveaway || row.giveaway || extractCellValueByIncludes(row, "giveaway");
    if (!item) return;
    if (parseBooleanCell(giveawayValue) === true) {
      giveawayItems.add(normalizeItemName(item));
    }
  });

  bannerRows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => {
      const keyLower = String(key || "").toLowerCase();
      const valueParsed = parseBooleanCell(row[key]);
      if (valueParsed === null) return;
      if (keyLower.includes("anaconda")) bannerVisibility.anaconda = valueParsed;
      if (keyLower.includes("firework")) bannerVisibility.firework = valueParsed;
    });

    const rawName = String(
      row.Name ||
      row.name ||
      row.Item ||
      row.item ||
      row.Title ||
      row.title ||
      extractCellValueByIncludes(row, "giveaway")
    ).trim();
    if (!rawName) return;
    const lowerName = rawName.toLowerCase();
    const rawValue = row.Enabled || row.enabled || row.Value || row.value || row.Show || row.show || extractCellValueByIncludes(row, "show");
    const parsed = parseBooleanCell(rawValue);
    if (parsed === null) return;
    if (lowerName.includes("anaconda")) bannerVisibility.anaconda = parsed;
    if (lowerName.includes("firework")) bannerVisibility.firework = parsed;
  });

  // Fallback parser: supports typos/alternate layouts like "Giveawat"/different columns.
  bannerRows.forEach((row) => {
    const fireworkDecision = parseBannerDecisionForKeyword(row, "firework");
    if (fireworkDecision !== null) bannerVisibility.firework = fireworkDecision;
    const anacondaDecision = parseBannerDecisionForKeyword(row, "anaconda");
    if (anacondaDecision !== null) bannerVisibility.anaconda = anacondaDecision;
  });

  applyExternalBannerVisibility();
}

function createCard(item) {
  const name = safe(item["Name"]);
  const img = safe(item["Image URL"]);
  const demand = safe(item["Demand"]);
  const avg = safe(item["Average Value"]);
  const ranged = safe(item["Ranged Value"]);
  const sectionName = String(item.__sheet || "").trim().toLowerCase();
  const isMiscSection = sectionName.includes("misc");
  const durability = safe(item["Durability"]);
  const internalRawDirect = String(item["Internal Value"] || "").trim();
  const internalRaw = String(getInternalValueFromItem(item) ?? "").trim();
  const internalNum = parseInternalValue(internalRaw);
  const hasInternalValue =
    Number.isFinite(internalNum) && internalNum > 0;
  const internalValueForAttr = hasInternalValue
    ? String(internalNum)
    : internalRaw;
  const networthDisplay = hasInternalValue
    ? "$" + Math.round(internalNum).toLocaleString("en-US")
    : internalRaw !== ""
      ? internalRaw
      : "N/A";

  let imgTag = "";
  if (img) {
    imgTag = `<img src="${img}" alt="${name}" onerror="this.style.display='none'">`;
  }

  let durabilityHTML = '';
  
  const durabilityInvisible = safe(item["Durability Invisible"]);
  const durabilityInvisibleNormalized = String(durabilityInvisible).trim().toLowerCase();
  const isDurabilityInvisible =
    /^(yes|true|1|ticked|checked|on|y)$/i.test(durabilityInvisibleNormalized);
  const invisibleStyle = isDurabilityInvisible ? 'style="opacity: 0;"' : '';
  const showPawn = !isMiscSection && durability && durability.includes('/') && hasInternalValue;
  const showRepair = showPawn && !isDurabilityInvisible;
  const showNetworth = !isMiscSection || (internalRawDirect !== "" && internalRawDirect !== "-");
  
  if (durability && durability.includes('/')) {
    const maxDurability = durability.split('/')[1] || "100";
    const currentDurability = durability.split('/')[0] || maxDurability;
    
    durabilityHTML = `
      <div class="durability-control" ${invisibleStyle}>
        <label>Durability:</label>
        <div class="durability-input-row">
          <input type="number" class="durability-input" 
                 value="${currentDurability}" 
                 max="${maxDurability}" 
                 min="0" 
                 oninput="enforceMaxDurability(this)"
                 onchange="updateCardValues(this)">
          <span class="durability-max">/${maxDurability}</span>
          <div class="durability-arrows">
            <button onmousedown="adjustDurability(this, 1, event)" ontouchstart="adjustDurability(this, 1, event)">▲</button>
            <button onmousedown="adjustDurability(this, -1, event)" ontouchstart="adjustDurability(this, -1, event)">▼</button>
          </div>
        </div>
      </div>
    `;
    
  }

let repairPrice = 0;
if (showPawn) {
  const [currentDurability, maxDurability] = durability.split('/').map(v => parseInt(v) || 0);
  const missingDurability = maxDurability - currentDurability;
  const internalVal = internalNum;

  const rawRepair = missingDurability * (internalVal / maxDurability / 1.43);
  repairPrice = Math.round(rawRepair);
}

let pawnAmount = 0;
if (showPawn) {
  const [currentDurability, maxDurability] = durability.split('/').map(v => parseInt(v) || 0);
  const internalVal = internalNum;

  const baseValue = internalVal * 0.3;
  const missingDurability = maxDurability - currentDurability;
  const deduction = missingDurability * ((internalVal * 0.3) / maxDurability / 1.43);
  
  const rawPawn = baseValue - deduction;
  pawnAmount = Math.round(rawPawn);

  pawnAmount = `$${pawnAmount.toLocaleString()}`;
}
  
  const hasGiveaway = giveawayItems.has(normalizeItemName(name));
  
  return `
    <div class="card" data-name="${escapeAttr(name)}" 
         data-avg="${escapeAttr(avg)}" 
         data-ranged="${escapeAttr(ranged)}" 
         data-max-durability="${durability ? durability.split('/')[1] : '100'}"
         data-internal-value="${escapeAttr(internalValueForAttr)}">
      <div class="card-left">
        ${imgTag}
        ${durabilityHTML}
      </div>
      <div class="card-info">
        <h3>${name}</h3>
        ${demand ? `<span class="badge">Demand: ${demand}</span>` : ""}
        <div class="card-avg">Average Value: <span class="avg-value">${avg}</span></div>
        <div class="card-ranged">Ranged Value: <span class="ranged-value">${ranged}</span></div>
        <div class="card-value-separator"></div>
        <div class="card-secondary-values">
          ${showNetworth ? `<div class="card-networth">Networth Value: <span class="networth-value">${escapeHtml(String(networthDisplay))}</span></div>` : ""}
          ${showPawn ? `<div class="card-pawn">Pawn Amount: <span class="pawn-value">${pawnAmount}</span></div>` : ''}
          ${showRepair ? `
            <div class="card-repair">
              Repair Price: <span class="repair-value">$${repairPrice.toLocaleString()}</span>
            </div>
          ` : ''}
        </div>
      </div>
      ${hasGiveaway ? `
        <button class="card-giveaway-trigger" type="button" aria-label="This item has an active giveaway" data-item-name="${escapeAttr(name)}"></button>
      ` : ''}
    </div>
  `;
}

function ensureGiveawayModal() {
  if (document.getElementById('giveaway-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'giveaway-modal';
  modal.className = 'giveaway-modal';
  modal.innerHTML = `
    <div class="giveaway-modal-backdrop" data-giveaway-close></div>
    <div class="giveaway-modal-content">
      <button class="giveaway-modal-close" type="button" aria-label="Close giveaway info" data-giveaway-close>&times;</button>
      <h2 class="giveaway-modal-title">Giveaway Active!</h2>
      <p class="giveaway-modal-text">
        We are currently doing a giveaway for this item in our Discord server, Join Now!
      </p>
      <a href="https://discord.gg/QbapryYUUx" target="_blank" rel="noopener" class="giveaway-modal-button">
        Enter this Giveaway
      </a>
    </div>
  `;
  document.body.appendChild(modal);
}

function createCrewLogoCard(item) {
  const name = safe(item["Name"]);
  const img = safe(item["Image"]);
  const id = safe(item["ID"]);

  const imgTag = img
    ? `<img src="${img}" alt="${name}" onerror="this.style.display='none'">`
    : "";
  return `
    <div class="card crew-logo-card" data-name="${escapeAttr(name)}">
      <div class="crew-card-content">
        <h3>${name}</h3>
        ${imgTag}
        <div class="crew-id-container">
          <div class="crew-id">ID: ${id}</div>
          <button class="copy-btn" onclick="copyToClipboard('${escapeAttr(id)}')" title="Copy ID">📋</button>
        </div>
      </div>
    </div>
  `;
}

function createScammerCard(item) {
  const robloxName = safe(item["Roblox Name"]);
  const discordUser = safe(item["Discord User"]);
  const reason = safe(item["Reason"]);
    const reasonWithLinks = reason.replace(/https?:\/\/\S+/g, match => `<a href="${match}" target="_blank" rel="noopener" class="scammer-link">User Profile</a>`);
  const evidence = safe(item["Evidence"]);
  const submittedDate = item["Date"] || item["Submitted Date"] || "";

  let robloxNameHtml;
  if (robloxName.includes('http')) {
    const urlMatch = robloxName.match(/(.*?)(https?:\/\/\S+)/);
    if (urlMatch) {
      const textPart = urlMatch[1].trim();
      const urlPart = urlMatch[2];
      robloxNameHtml = `${textPart} <a href="${urlPart}" target="_blank" rel="noopener" class="scammer-link">User Profile</a>`;
    } else {
      robloxNameHtml = robloxName;
    }
  } else {
    robloxNameHtml = robloxName;
  }

  const evidenceLinks = evidence.split(",").map(link => link.trim()).filter(link => link.length > 0);
  let evidenceHtml = "";
  if (evidenceLinks.length > 0) {
    evidenceHtml = evidenceLinks.map((link, index) => 
      `<a href="${link}" target="_blank" rel="noopener" class="scammer-link">Evidence ${index + 1}</a>`
    ).join(" | ");
  }

  return `
    <div class="card scammer-card" data-name="${escapeAttr(robloxName)}">
      <div class="card-info">
        <div class="scammer-field"><strong>Roblox Name:</strong> ${robloxNameHtml}</div>
        <div class="scammer-field"><strong>Discord:</strong> ${discordUser}</div>
                <div class="scammer-field"><strong>Reason:</strong> ${reasonWithLinks}</div>
        ${evidenceHtml ? `<div class="scammer-field"><strong>Evidence:</strong> ${evidenceHtml}</div>` : ""}
        <div>Reported: ${submittedDate}</div>
      </div>
    </div>
  `;
}

function createAccessoryCard(item) {
  const name = safe(item["Name"]);
  const img = safe(item["Image URL"] || item["Image"]);
  const rarity = safe(item["Rarity"]);
  const networthValue = safe(item["Networth Value"]);
  const crate = safe(item["Crate"]);
  const networthNum = parseInternalValue(networthValue);
  const networthDisplay = networthNum > 0
    ? "$" + Math.round(networthNum).toLocaleString("en-US")
    : "N/A";
  const pawnDisplay = networthNum > 0
    ? "$" + Math.round(networthNum * 0.3).toLocaleString("en-US")
    : "N/A";
  const rarityNorm = String(rarity || "").trim().toLowerCase();
  const rarityClass =
    rarityNorm === "omega" ? "rarity-omega" :
    rarityNorm === "legendary" ? "rarity-legendary" :
    rarityNorm === "epic" ? "rarity-epic" :
    rarityNorm === "rare" ? "rarity-rare" :
    rarityNorm === "uncommon" ? "rarity-uncommon" :
    rarityNorm === "common" ? "rarity-common" :
    "rarity-default";
  const imgTag = img
    ? `<img src="${img}" alt="${name}" onerror="this.style.display='none'">`
    : "";

  return `
    <div class="card accessory-item-card" data-name="${escapeAttr(name)}">
      <div class="card-left">
        ${imgTag}
      </div>
      <div class="card-info">
        <h3>${escapeHtml(name)}</h3>
        ${rarity ? `<span class="badge accessory-rarity-badge ${rarityClass}">${escapeHtml(rarity)}</span>` : ""}
        <div class="card-networth"><span class="accessory-label">Networth Value:</span> <span class="networth-value">${escapeHtml(networthDisplay)}</span></div>
        <div class="card-pawn"><span class="accessory-label">Pawn Value:</span> <span class="pawn-value">${escapeHtml(pawnDisplay)}</span></div>
        <div class="card-ranged"><span class="accessory-label">Crate:</span> <span>${escapeHtml(crate || "N/A")}</span></div>
      </div>
    </div>
  `;
}

function renderSection(title, items) {
  if (title === "BlockSpin Map") {
    renderBlockSpinMapSection();
    return;
  }

  if (title === "Home") {
    const html = `
      <section class="section" id="${slugify(title)}">
        <h2>${title}</h2>
        <div class="home-content">
        </div>
      </section>
    `;
    document.getElementById("sections").insertAdjacentHTML("beforeend", html);
    return;
  }
  if (!items || items.length === 0) return;

  if (title === "💰 Richest Players") {
    renderRichestPlayersSection(items);
  } else if (title === "Crew Logos") {
    renderCrewLogosSection(items);
  } else if (title === ACCESSORIES_SECTION_NAME) {
    renderAccessoriesSection(items);
  } else if (title === "Legendary") {
    renderLegendarySectionWithBanner(items);
  } else if (title === "Omega") {
    const html = `
      <section class="section" id="${slugify("Omega")}">
        <h2>Omega</h2>
        <div class="cards">
          ${items.map(createCard).join("")}
        </div>
        <div class="legendary-banner giveaway-banner--red" id="omega-anaconda-banner" style="display: none;">
          <p class="legendary-banner-text">Join our <strong>Anaconda giveaway</strong> in our Discord server!</p>
          <div class="legendary-banner-right">
            <a href="https://discord.gg/nKKkXyqCsv" target="_blank" rel="noopener" class="legendary-banner-btn">Join our Discord server</a>
            <p class="legendary-banner-members"><span class="discord-member-count">—</span> members</p>
          </div>
        </div>
      </section>
    `;
    document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  } else if (title === "Epic") {
    const html = `
      <section class="section" id="${slugify("Epic")}">
        <h2>Epic</h2>
        <div class="cards">
          ${items.map(createCard).join("")}
        </div>
        <div class="legendary-banner giveaway-banner--purple" id="epic-firework-banner" style="display: none;">
          <p class="legendary-banner-text">Join our <strong>Firework Launcher giveaway</strong> in our Discord server!</p>
          <div class="legendary-banner-right">
            <a href="https://discord.gg/8AUjJu9jnr" target="_blank" rel="noopener" class="legendary-banner-btn">Join our Discord server</a>
            <p class="legendary-banner-members"><span class="discord-member-count">—</span> members</p>
          </div>
        </div>
      </section>
    `;
    document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  } else {
    const html = `
      <section class="section" id="${slugify(title)}">
        <h2>${title}</h2>
        <div class="cards">
          ${items.map(createCard).join("")}
        </div>
      </section>
    `;
    document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  }
}


function renderLegendarySectionWithBanner(items) {
  const html = `
    <section class="section" id="${slugify("Legendary")}">
      <h2>Legendary</h2>
      <div class="cards">
        ${items.map(createCard).join("")}
      </div>
    </section>
  `;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
}

function fetchDiscordMemberCount() {
  fetch("https://discord.com/api/v10/invites/QbapryYUUx?with_counts=true")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var n = data.approximate_member_count;
      if (typeof n === "number" && !isNaN(n)) {
        var els = document.querySelectorAll(".discord-member-count");
        els.forEach(function (el) { el.textContent = n.toLocaleString(); });
      }
    })
    .catch(function () {});
}

function createFooterBoosterCard(booster) {
  const name = escapeHtml(String(booster?.name || "Unknown"));
  const avatarUrl = escapeAttr(String(booster?.avatarUrl || ""));
  return `
    <article class="footer-booster-card" aria-label="${name}">
      <img src="${avatarUrl}" alt="${name}" loading="lazy" decoding="async" />
      <span>${name}</span>
    </article>
  `;
}

async function loadFooterBoosters() {
  const footer = document.getElementById("footer-boosters");
  const track = document.getElementById("footer-boosters-track");
  if (!footer || !track) return;

  if (!BOOSTERS_API_URL || BOOSTERS_API_URL.includes("YOUR-RAILWAY-URL")) {
    return;
  }

  try {
    const res = await fetch(BOOSTERS_API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Boosters endpoint failed: ${res.status}`);
    const data = await res.json();
    const boosters = Array.isArray(data?.boosters) ? data.boosters : [];
    if (boosters.length === 0) return;

    const cardsHtml = boosters.map(createFooterBoosterCard).join("");
    track.innerHTML = cardsHtml + cardsHtml;
    footer.hidden = false;
  } catch (err) {
    console.error("Failed to load footer boosters:", err);
  }
}

function renderCrewLogosSection(items) {
  const grouped = {};
  
  items.forEach(item => {
    const header = safe(item["Header"]) || "Uncategorized";
    if (!grouped[header]) {
      grouped[header] = [];
    }
    if (item["Name"]) {
      grouped[header].push(item);
    }
  });

  let html = `<section class="section" id="${slugify("Crew Logos")}"><h2>Crew Logos</h2>`;
  
  Object.keys(grouped).forEach(header => {
    if (grouped[header].length > 0) {
      html += `
        <div class="crew-header">${header}</div>
        <div class="cards">
          ${grouped[header].map(createCrewLogoCard).join("")}
        </div>
      `;
    }
  });
  
  html += `</section>`;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
}

function renderAccessoriesSection(items) {
  const miniToBig = {};

  // Pass 1: build mini-header -> big-header map from any row that defines both.
  items.forEach(item => {
    const big = safe(item["Big Header"]).trim();
    const mini = safe(item["Mini Header"]).trim();
    if (big && mini) miniToBig[mini] = big;
  });

  const structure = {};

  function ensureGroup(bigHeader, miniHeader) {
    const big = bigHeader || "Uncategorized";
    const mini = miniHeader || "General";
    if (!structure[big]) structure[big] = {};
    if (!structure[big][mini]) structure[big][mini] = [];
  }

  // Pass 2: add explicit mini-header rows to structure even without items.
  items.forEach(item => {
    const big = safe(item["Big Header"]).trim();
    const mini = safe(item["Mini Header"]).trim();
    const hasName = safe(item["Name"]).trim() !== "";
    if (big && mini && !hasName) ensureGroup(big, mini);
  });

  // Pass 3: place item cards by mini-header, then inferred big-header.
  items.forEach(item => {
    const name = safe(item["Name"]).trim();
    if (!name) return;

    const mini = safe(item["Mini Header"]).trim() || "General";
    const explicitBig = safe(item["Big Header"]).trim();
    const big = explicitBig || miniToBig[mini] || "Uncategorized";
    ensureGroup(big, mini);
    structure[big][mini].push(item);
  });

  let html = `<section class="section accessories-section" id="${slugify(ACCESSORIES_SECTION_NAME)}"><h2>${ACCESSORIES_SECTION_NAME}</h2>`;
  const navData = [];
  let bigCounter = 0;
  let miniCounter = 0;

  Object.keys(structure).forEach(bigHeader => {
    const bigAnchor = `acc-big-${bigCounter++}`;
    html += `<div class="accessories-big-header" id="${bigAnchor}">${escapeHtml(bigHeader)}</div>`;
    const miniGroups = structure[bigHeader];
    const miniEntries = [];
    Object.keys(miniGroups).forEach(miniHeader => {
      const miniAnchor = `acc-mini-${miniCounter++}`;
      html += `
        <div class="accessories-mini-header" id="${miniAnchor}">${escapeHtml(miniHeader)}</div>
        <div class="cards">
          ${miniGroups[miniHeader].map(createAccessoryCard).join("")}
        </div>
      `;
      miniEntries.push({ title: miniHeader, anchor: miniAnchor });
    });
    navData.push({ title: bigHeader, anchor: bigAnchor, minis: miniEntries });
  });

  html += `</section>`;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  renderAccessoriesFastNav(navData);
}

function renderAccessoriesFastNav(navData) {
  const sidebar = document.getElementById("tax-sidebar-column");
  if (!sidebar) return;

  let box = document.getElementById("accessories-fast-nav");
  if (!box) {
    box = document.createElement("aside");
    box.id = "accessories-fast-nav";
    box.style.display = "none";
    box.style.background = "#141d28";
    box.style.border = "1px solid #2f3f52";
    box.style.borderRadius = "12px";
    box.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.28)";
    box.style.padding = "8px 9px";
    box.style.marginTop = "0";
    box.style.marginBottom = "10px";
    box.style.maxHeight = "none";
    box.style.overflowY = "visible";
    box.style.position = "sticky";
    box.style.top = "12px";
    sidebar.insertBefore(box, sidebar.firstChild);
  }

  const rows = [];
  rows.push('<h2 style="margin:0 0 7px 0; color:#dbeafe; font-size:0.9rem; text-align:center; font-weight:700;">Fast Navigation</h2>');

  navData.forEach(group => {
    rows.push(
      `<button type="button" data-target="${escapeAttr(group.anchor)}" style="display:block;width:100%;text-align:left;background:transparent;border:none;color:#e5efff;font-weight:700;padding:5px 4px;cursor:pointer;border-radius:0;margin-bottom:2px;font-size:0.79rem;">${escapeHtml(group.title)}</button>`
    );
    (group.minis || []).forEach(mini => {
      rows.push(
        `<button type="button" data-target="${escapeAttr(mini.anchor)}" style="display:block;width:100%;text-align:left;background:transparent;border:none;color:#9ec3dd;padding:4px 4px 4px 14px;cursor:pointer;border-radius:0;margin:0 0 1px 0;font-size:0.74rem;">${escapeHtml(mini.title)}</button>`
      );
    });
  });

  rows.push('<div style="height:6px"></div>');
  rows.push('<button type="button" id="acc-fast-nav-top" style="width:100%;padding:6px 8px;background:#203047;color:#cfe6ff;border:1px solid #355274;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.75rem;">Back to Top</button>');
  box.innerHTML = rows.join("");

  box.querySelectorAll("button[data-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const el = targetId ? document.getElementById(targetId) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const topBtn = document.getElementById("acc-fast-nav-top");
  if (topBtn) {
    topBtn.addEventListener("click", () => {
      const sec = document.getElementById(slugify(ACCESSORIES_SECTION_NAME));
      if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}


function renderScammerSection(items) {
  let html = `
    <section class="section" id="${slugify("Scammer List")}">
      <h2>Scammer List</h2>
      <p class="scammer-warning">⚠️ WARNING: These clowns have been reported in our discord server for scamming. Please trade with extreme caution! Report scammers in our discord server to have them placed here!</p>
      <div class="cards">
        ${items.map(createScammerCard).join("")}
      </div>
    </section>
  `;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
}


 function renderRichestPlayersSection(items) {
  const sectionId = slugify("💰 Richest Players");
  const html = `
    <section class="section richest-players-section" id="${sectionId}">
      <a href="#" class="richest-back-to-top" id="richest-back-to-top" aria-label="Back to top">
        <img src="https://i.ibb.co/N2kY994q/undo.png" alt="" class="richest-back-to-top-icon" />
        <span class="richest-back-to-top-text">Back to top</span>
      </a>
      ${createRichestPlayersSection(items)}
    </section>
  `;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
  
  setTimeout(() => {
    const searchInput = document.getElementById('richest-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        filterRichestPlayers(e.target.value);
      });
    }
    const backToTop = document.getElementById('richest-back-to-top');
    const section = document.querySelector('.richest-players-section');
    if (backToTop && section) {
      backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, 100);
}

function initSectionsNav() {
  const nav = document.getElementById("sections-nav");
  if (!nav) return;

  SECTION_NAMES.forEach((name, index) => {
    if (name === "💰 Richest Players") {
      const gap = document.createElement("div");
      gap.className = "nav-gap";
      nav.appendChild(gap);
      
      const extrasHeader = document.createElement("div");
      extrasHeader.className = "nav-extras-header";
      extrasHeader.textContent = "Extras";
      nav.appendChild(extrasHeader);
    }

    const btn = document.createElement("button");
    btn.textContent = name;
    btn.addEventListener("click", () => showSection(name));
    nav.appendChild(btn);
  });
}

function syncItemSectionSearchPlacement(name) {
  const sectionsEl = document.getElementById("sections");
  const searchContainer = document.querySelector(".search-container");
  if (!sectionsEl || !searchContainer) return;

  const hiddenSearchSections = ["Home", "Crew Logos", "Crate Game", "💰 Richest Players", ACCESSORIES_SECTION_NAME];

  function restoreSearchBeforeHome() {
    const homeSec = document.getElementById("home");
    if (
      searchContainer.parentNode === sectionsEl &&
      homeSec &&
      searchContainer.nextElementSibling === homeSec
    ) {
      return;
    }
    if (homeSec) {
      sectionsEl.insertBefore(searchContainer, homeSec);
    } else {
      sectionsEl.prepend(searchContainer);
    }
  }

  if (!window.matchMedia("(max-width: 1024px)").matches || hiddenSearchSections.includes(name)) {
    restoreSearchBeforeHome();
    return;
  }

  const activeSec = document.getElementById(slugify(name));
  if (!activeSec || !activeSec.classList.contains("section")) {
    restoreSearchBeforeHome();
    return;
  }

  const cards = activeSec.querySelector(".cards");
  if (cards) {
    activeSec.insertBefore(searchContainer, cards);
  } else {
    const h2 = activeSec.querySelector("h2");
    if (h2) {
      h2.insertAdjacentElement("afterend", searchContainer);
    } else {
      activeSec.prepend(searchContainer);
    }
  }
}

function showSection(name) {
  console.log(`Showing section: ${name}`);
  
  document.querySelectorAll('.durability-input').forEach(input => {
    const card = input.closest('.card');
    const maxDurability = card.dataset.maxDurability;
    input.value = maxDurability;
    updateCardValues(input);
  });
  
  const taxSidebarColumn = document.getElementById('tax-sidebar-column');
  const homeValueChanges = document.getElementById('home-value-changes');
  const taxCalc = taxSidebarColumn ? taxSidebarColumn.querySelector('.tax-calculator') : null;
  const middlemanPromo = taxSidebarColumn ? taxSidebarColumn.querySelector('.discord-mm-promo--sidebar') : null;
  const accessoriesFastNav = document.getElementById('accessories-fast-nav');
  const hiddenSections = ['Crew Logos', 'Crate Game', '💰 Richest Players'];
  // Keep sidebar layout space, but make tax/middleman boxes invisible + non-interactive for this section.
  const ghostSidebarSections = [ACCESSORIES_SECTION_NAME];
  const shouldGhostSidebarBoxes = ghostSidebarSections.includes(name);
  const isAccessoriesSection = name === ACCESSORIES_SECTION_NAME;
  const isHome = name === 'Home';
  document.body.classList.toggle('is-home', isHome);
  if (taxSidebarColumn) {
    if (hiddenSections.includes(name)) {
      taxSidebarColumn.style.visibility = 'hidden';
      taxSidebarColumn.style.opacity = '0';
      taxSidebarColumn.style.display = 'none';
    } else {
      taxSidebarColumn.style.visibility = 'visible';
      taxSidebarColumn.style.opacity = '1';
      taxSidebarColumn.style.display = 'flex';
    }
  }
  if (taxCalc) {
    if (shouldGhostSidebarBoxes) {
      taxCalc.style.display = 'block';
      taxCalc.style.visibility = 'hidden';
      taxCalc.style.opacity = '0';
      taxCalc.style.pointerEvents = 'none';
    } else {
      taxCalc.style.display = isHome ? 'none' : 'block';
      taxCalc.style.visibility = 'visible';
      taxCalc.style.opacity = '1';
      taxCalc.style.pointerEvents = 'auto';
    }
  }
  if (middlemanPromo) {
    if (shouldGhostSidebarBoxes) {
      middlemanPromo.style.visibility = 'hidden';
      middlemanPromo.style.opacity = '0';
      middlemanPromo.style.pointerEvents = 'none';
    } else {
      middlemanPromo.style.visibility = 'visible';
      middlemanPromo.style.opacity = '1';
      middlemanPromo.style.pointerEvents = 'auto';
    }
  }
  if (accessoriesFastNav) {
    if (isAccessoriesSection) {
      accessoriesFastNav.style.display = 'block';
      accessoriesFastNav.style.visibility = 'visible';
      accessoriesFastNav.style.opacity = '1';
      accessoriesFastNav.style.pointerEvents = 'auto';
    } else {
      accessoriesFastNav.style.display = 'none';
      accessoriesFastNav.style.visibility = 'hidden';
      accessoriesFastNav.style.opacity = '0';
      accessoriesFastNav.style.pointerEvents = 'none';
    }
  }
  if (homeValueChanges) {
    homeValueChanges.style.visibility = isHome ? 'visible' : 'hidden';
    homeValueChanges.style.opacity = isHome ? '1' : '0';
    homeValueChanges.style.display = isHome ? 'block' : 'none';
  }

    
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer) {
    const hiddenSearchSections = ['Home', 'Crew Logos', 'Crate Game', '💰 Richest Players', ACCESSORIES_SECTION_NAME];
    if (hiddenSearchSections.includes(name)) {
      searchContainer.style.cssText = 'visibility: hidden; height: 0; margin: 0; overflow: hidden;';
    } else {
      searchContainer.style.cssText = 'visibility: visible; height: auto; overflow: visible; width: 100%; display: flex; justify-content: center; align-items: center;';
    }
  }
  
  SECTION_NAMES.forEach(sec => {
    const el = document.getElementById(slugify(sec));
    if (el) el.style.display = sec === name ? "block" : "none";
  });

  document.querySelectorAll("#sections-nav button").forEach(b => {
    b.classList.toggle("active", b.textContent === name);
  });

  syncItemSectionSearchPlacement(name);
  trackEvent("view_section", { section_name: name });
}

function initSearch() {
  const input = document.getElementById("search");
  if (!input) return;

  input.addEventListener("input", () => {
    const val = input.value.toLowerCase();
    document.querySelectorAll(".card").forEach(card => {
      const name = card.dataset.name.toLowerCase();
      card.classList.toggle("hidden", !name.includes(val));
    });
  });
}

function getTaxBreakdown(amountWant) {
  const want = Math.round(Number(amountWant) || 0);
  if (want <= 0) return { totalWithdraw: 0, lines: [], singleDrop: true };
  const totalWithdraw = Math.round(want / TAX_RECEIVE_RATIO);
  if (totalWithdraw <= TAX_MAX_DROP) {
    return {
      totalWithdraw,
      lines: ['Drop $' + totalWithdraw.toLocaleString()],
      singleDrop: true
    };
  }
  const full40kCount = Math.floor(totalWithdraw / TAX_MAX_DROP);
  const receivedFromFull = full40kCount * TAX_RECEIVE_PER_40K;
  const lastReceive = want - receivedFromFull;
  const lastWithdraw = Math.round(lastReceive / TAX_RECEIVE_RATIO);
  const lines = [];

  if (full40kCount === 1 && lastWithdraw > 0) {
    lines.push('Drop $40,000 once');
    lines.push('then Drop $' + lastWithdraw.toLocaleString() + '.');
  } else if (lastWithdraw > 0) {
    lines.push('Drop $40,000 ' + full40kCount.toLocaleString() + ' times');
    lines.push('then Drop $' + lastWithdraw.toLocaleString() + '.');
  } else {
    lines.push('Drop $40,000 ' + full40kCount.toLocaleString() + ' times.');
  }
  return { totalWithdraw, lines, singleDrop: false };
}

function formatDollar(amount) {
  return '$' + (Math.round(Number(amount) || 0)).toLocaleString();
}

function buildTaxBreakdownHtml(want, breakdown) {
  return '<span class="tax-how-label">To drop ' +
    formatDollar(want) +
    ' in game you drop ' +
    formatDollar(breakdown.totalWithdraw) +
    '. Steps:</span><br>' +
    breakdown.lines.map(function(line) { return line + '<br>'; }).join('');
}

function initTaxCalculator() {
  const taxInput = document.getElementById("taxInput");
  const taxAmount = document.getElementById("tax-amount");
  const taxBreakdown = document.getElementById("tax-breakdown");

  if (!taxInput || !taxAmount) {
    console.log("Tax calculator elements not found");
    return;
  }

  function update() {
    const raw = taxInput.value.replace(/[^\d]/g, '');
    const want = parseInt(raw, 10) || 0;
    const b = getTaxBreakdown(want);
    taxAmount.innerHTML = b.totalWithdraw.toLocaleString() + ' <span class="tax-after-label">After Tax</span>';
    if (taxBreakdown) {
      if (b.totalWithdraw <= 0) {
        taxBreakdown.innerHTML = '';
        return;
      }
      taxBreakdown.innerHTML = buildTaxBreakdownHtml(want, b);
    }
  }

  taxInput.addEventListener("input", function(e) {
    const cursorPos = e.target.selectionStart;
    const oldValue = e.target.value;
    const newValue = oldValue.replace(/[^\d]/g, '');
    if (oldValue !== newValue) {
      e.target.value = newValue;
      e.target.setSelectionRange(Math.max(0, cursorPos - 1), Math.max(0, cursorPos - 1));
    }
    update();
  });

  taxInput.addEventListener('paste', function(e) {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const cleaned = (paste || '').replace(/[^\d]/g, '');
    document.execCommand('insertText', false, cleaned);
  });

  update();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓';
    btn.style.backgroundColor = '#28a745';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = '';
    }, 1500);
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓';
    btn.style.backgroundColor = '#28a745';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = '';
    }, 1500);
  });
}

let durabilityInterval = null;
let durabilityTimeout = null;

function enforceMaxDurability(input) {
  const card = input.closest('.card');
  const maxDurability = parseInt(card.dataset.maxDurability);
  let value = parseInt(input.value);
  
  if (value > maxDurability) {
    input.value = maxDurability;
  } else if (value < 0) {
    input.value = 0;
  }
  
  updateCardValues(input);
}

function adjustDurability(btn, direction, evt) {
  if (evt) evt.preventDefault();
  
  const card = btn.closest('.card');
  const input = card.querySelector('.durability-input');
  const maxDurability = parseInt(card.dataset.maxDurability);
  const isTouch =
    !!evt && (
      evt.type === 'touchstart' ||
      (evt.pointerType && evt.pointerType === 'touch')
    );
  const holdDelayMs = isTouch ? 120 : 200;
  const repeatEveryMs = isTouch ? 30 : 50;
  
  function adjust() {
    let newValue = (parseInt(input.value) || 0) + direction;
    newValue = Math.max(0, Math.min(newValue, maxDurability));
    input.value = newValue;
    updateCardValues(input);
  }
  
  adjust();
  
  durabilityTimeout = setTimeout(() => {
    durabilityInterval = setInterval(adjust, repeatEveryMs);
  }, holdDelayMs);
}

function stopDurabilityAdjust() {
  if (durabilityInterval) {
    clearInterval(durabilityInterval);
    durabilityInterval = null;
  }
  if (durabilityTimeout) {
    clearTimeout(durabilityTimeout);
    durabilityTimeout = null;
  }
}

function updateCardValues(input) {
  const card = input.closest('.card');
  const currentDurability = parseInt(input.value) || 0;
  const maxDurability = parseInt(card.dataset.maxDurability);
  
  const durabilityPercent = currentDurability / maxDurability;
  
  const originalAvg = card.dataset.avg;
  const originalRanged = card.dataset.ranged;
  
  card.querySelector('.avg-value').textContent = calculateDurabilityValue(originalAvg, durabilityPercent);
  card.querySelector('.ranged-value').textContent = calculateDurabilityValue(originalRanged, durabilityPercent);
  
  const internalValue = card.dataset.internalValue;
  const repairValueElement = card.querySelector('.repair-value');
  
  if (repairValueElement && internalValue) {
    const missingDurability = maxDurability - currentDurability;
    const internalVal = parseInternalValue(internalValue);
    const repairPrice = Math.round(missingDurability * (internalVal / maxDurability / 1.43));
    repairValueElement.textContent = '$' + (isNaN(repairPrice) ? 0 : repairPrice).toLocaleString();
  }
  
  const pawnValueElement = card.querySelector('.pawn-value');
  
  if (pawnValueElement && internalValue) {
    const missingDurability = maxDurability - currentDurability;
    const internalVal = parseInternalValue(internalValue);
    
    const baseValue = internalVal * 0.3;
    const deduction = missingDurability * ((internalVal * 0.3) / maxDurability / 1.43);
    const pawnPrice = Math.round(baseValue - deduction);
    
    pawnValueElement.textContent = '$' + (isNaN(pawnPrice) ? 0 : pawnPrice).toLocaleString();
  }
}

function calculateDurabilityValue(originalValue, durabilityPercent) {
  if (!originalValue || originalValue === '' || originalValue === 'N/A' || originalValue === '-') {
    return originalValue || 'N/A';
  }
  
  const valueMultiplier = 0.20 + (0.80 * durabilityPercent);
  
  if (originalValue.includes(' to ')) {
    const parts = originalValue.split(' to ');
    const low = parseValue(parts[0]) * valueMultiplier;
    const high = parseValue(parts[1]) * valueMultiplier;
    
    if (!isNaN(low) && !isNaN(high)) {
      const lowFormatted = formatLikeOriginal(low, parts[0]);
      const highFormatted = formatLikeOriginal(high, parts[1]);
      return lowFormatted + ' to ' + highFormatted;
    }
  }
  
  const value = parseValue(originalValue) * valueMultiplier;
  
  if (!isNaN(value) && value > 0) {
    return formatLikeOriginal(value, originalValue);
  }
  
  return originalValue;
}

function parseValue(str) {
  if (!str) return 0;
  
  str = str.toString().trim().toLowerCase();
  str = str.replace(/[$,]/g, '');
  
  if (/\bmillion\b/.test(str)) {
    return parseFloat(str.replace(/[^0-9.]/g, '')) * 1000000;
  }
  
  if (str.includes('k')) {
    return parseFloat(str.replace(/k/g, '')) * 1000;
  }
  
  if (str.includes('m')) {
    return parseFloat(str.replace(/m/g, '')) * 1000000;
  }
  
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}



function formatLikeOriginal(num, original) {
  num = Math.round(num);
  
  const lower = original.toLowerCase();
  // "1 Million" contains "m" but must not use abbreviated $Xm styling
  const wasK = lower.includes('k') && !/\bthousand\b/.test(lower);
  const wasM = lower.includes('m') && !/\bmillion\b/.test(lower);
  const hadCommas = original.includes(',');
  
  if (wasM) {
    const m = Math.round(num / 1000000);
    return '$' + m + 'm';
  } else if (wasK) {
    const k = Math.round(num / 1000);
    return '$' + k + 'k';
  } else if (hadCommas || num >= 1000) {
    return '$' + num.toLocaleString();
  } else {
    return '$' + num;
  }
}

document.addEventListener('mouseup', stopDurabilityAdjust);
document.addEventListener('touchend', stopDurabilityAdjust);
document.addEventListener('touchcancel', stopDurabilityAdjust);

function safe(str) { return str ?? ""; }
function escapeAttr(str) {
  return (str + "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeHtml(str) {
  return (str + "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function parseInternalValue(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return 0;
  const numeric = raw.replace(/[^0-9.]/g, "");
  if (!numeric) return 0;
  let n = parseFloat(numeric);
  if (!isFinite(n)) return 0;
  if (/\bbillion\b/.test(raw) || raw.includes("b")) n *= 1e9;
  else if (/\bmillion\b/.test(raw) || raw.includes("m")) n *= 1e6;
  else if (/\bthousand\b/.test(raw) || raw.includes("k")) n *= 1e3;
  return n;
}
function normalizeHeaderKey(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function getInternalValueFromItem(item) {
  if (!item || typeof item !== "object") return "";
  const direct = item["Internal Value"];
  if (direct !== undefined && direct !== null && String(direct).trim() !== "") return direct;

  const preferredKeys = ["internalvalue", "networthvalue", "internal", "networth"];
  for (const key of Object.keys(item)) {
    const norm = normalizeHeaderKey(key);
    if (!norm) continue;
    if (preferredKeys.includes(norm) || norm.includes("internalvalue") || norm.includes("networthvalue")) {
      const v = item[key];
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
  }

  // Fallback: recover by sheet column position when labels are inconsistent.
  const rowValues = Array.isArray(item.__rowValues) ? item.__rowValues : [];
  const colLabels = Array.isArray(item.__colLabels) ? item.__colLabels : [];
  if (rowValues.length) {
    let internalIdx = -1;
    for (let i = 0; i < colLabels.length; i++) {
      if (normalizeHeaderKey(colLabels[i]).includes("internalvalue")) {
        internalIdx = i;
        break;
      }
    }
    if (internalIdx >= 0 && internalIdx < rowValues.length) {
      const byHeaderIndex = rowValues[internalIdx];
      if (byHeaderIndex !== undefined && byHeaderIndex !== null && String(byHeaderIndex).trim() !== "") {
        return byHeaderIndex;
      }
    }
    // Known schema fallback: Name, Image URL, Demand, Average, Ranged, Quantum, Durability, Internal, Durability Invisible
    if (rowValues.length >= 8) {
      const byKnownIndex = rowValues[7];
      if (byKnownIndex !== undefined && byKnownIndex !== null && String(byKnownIndex).trim() !== "") {
        return byKnownIndex;
      }
    }
  }
  return "";
}
/** Prefer numeric cell.v from Sheets (reliable); else formatted f; else string v. */
function coerceInternalCell(cell) {
  if (!cell) return "";
  if (typeof cell.v === "number" && Number.isFinite(cell.v)) {
    return String(cell.v);
  }
  if (cell.v !== null && cell.v !== undefined) {
    const vs = String(cell.v).trim();
    if (vs !== "") return vs;
  }
  if (cell.f !== undefined && cell.f !== null && String(cell.f).trim() !== "") {
    return String(cell.f);
  }
  return "";
}
function getCellDisplayValue(cell) {
  if (!cell) return "";
  if (cell.f !== undefined && cell.f !== null && String(cell.f).trim() !== "") {
    return cell.f;
  }
  if (cell.v !== undefined && cell.v !== null) {
    return cell.v;
  }
  return "";
}
function getSheetNameForSection(displayName) {
  if (displayName === "Common / Uncommon") return "Uncommon";
  if (displayName === ACCESSORIES_SECTION_NAME) return "Accessories";
  return displayName;
}

function slugify(str) {
  if (str === "Common / Uncommon") return "uncommon";
  return str.toLowerCase().replace(/\s+/g, "-");
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log('DOM loaded, initializing...');
  initAnalytics();
  setupDiscordClickTracking();

  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && loadingScreen.style.display !== 'none') {
      console.warn('Loading timeout - forcing hide');
      loadingScreen.style.display = 'none';
    }
  }, 15000);
  
  const sectionsContainer = document.getElementById("sections");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");

  if (!sectionsContainer || !progressBar || !progressText) {
    return;
  }

  initSectionsNav();
  initSearch();
  initTaxCalculator();
  await loadExternalGiveawayConfig();
  await loadSectionContentConfig();

  const totalSections = SECTION_NAMES.length;
  let loadedSections = 0;

  const fetchPromises = SECTION_NAMES.map(async (sec) => {
   
    console.log(`Fetching data for: ${sec}`);
    
    let items;
    try {
      if (sec === "💰 Richest Players") {
        items = await fetchRichestPlayers();
        console.log(`Got ${items.length} items for ${sec} from NEW spreadsheet`);
      } else {
        items = await fetchSheet(getSheetNameForSection(sec));
        console.log(`Got ${items.length} items for ${sec} from OLD spreadsheet`);
      }
    } catch (error) {
      console.error(`Failed to load ${sec}:`, error);
      items = [];
    }
    
    loadedSections++;
    const progress = Math.round((loadedSections / totalSections) * 100);
    progressBar.style.width = progress + '%';
    progressText.textContent = progress + '%';
    
    return { section: sec, items };
  });

  const results = await Promise.all(fetchPromises);

  results.forEach(({ section, items }) => {
    renderSection(section, items);
  });
  applyExternalBannerVisibility();
  renderSectionContentEmbeds();

  let initialSection = "Home";
  if (window.location.hash && window.location.hash.startsWith('#sec=')) {
    let requested = decodeURIComponent(window.location.hash.substring(5));
    if (requested === "Uncommon") requested = "Common / Uncommon";
    if (SECTION_NAMES.includes(requested)) {
      initialSection = requested;
    }
  }

  showSection(initialSection);
  loadTopDonators();
  loadValueChanges();
  fetchDiscordMemberCount();
  loadFooterBoosters();

  sectionsContainer.classList.add("loaded");
  
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
  }, 300);

});

var _searchPlacementResizeTimer;
window.addEventListener("resize", function () {
  clearTimeout(_searchPlacementResizeTimer);
  _searchPlacementResizeTimer = setTimeout(function () {
    var active = document.querySelector("#sections-nav button.active");
    if (active && typeof syncItemSectionSearchPlacement === "function") {
      syncItemSectionSearchPlacement(active.textContent.trim());
    }
  }, 120);
});

document.addEventListener('click', function(e) {
  const trigger = e.target.closest('.card-giveaway-trigger');
  if (!trigger) return;
  ensureGiveawayModal();
  const modal = document.getElementById('giveaway-modal');
  if (!modal) return;
  modal.classList.add('visible');
});

document.addEventListener('click', function(e) {
  if (e.target.matches('[data-giveaway-close]') || e.target.closest('[data-giveaway-close]')) {
    const modal = document.getElementById('giveaway-modal');
    if (modal) modal.classList.remove('visible');
  }
});

function openRiverLinks(e) {
  e.preventDefault();
  const modal = document.createElement('div');
  modal.className = 'river-links-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>River's Contact</h2>
      <div class="links-list">
        <a href="https://www.roblox.com/users/2361072897/profile" target="_blank">
          <span class="link-icon">🎮</span>
          <span class="link-text">Roblox Profile</span>
        </a>
        <div class="copy-link" onclick="copyToClipboard('_.riverr')">
          <svg class="link-icon discord-svg" viewBox="0 0 24 24" width="20" height="20" fill="#5865F2">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.29a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span class="link-text">Discord: _.riverr</span>
          <span class="copy-icon">📋</span>
        </div>
        <div class="copy-link" onclick="copyToClipboard('riverytacc11@gmail.com')">
          <span class="link-icon">📧</span>
          <span class="link-text">Email: riverytacc11@gmail.com</span>
          <span class="copy-icon">📋</span>
        </div>
      </div>
      <button class="close-modal-btn" onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Fetch and display top donators
async function loadTopDonators() {
  try {
    const donators = await fetchSheet("Top Donate");
    const donatorList = document.getElementById('donator-list');
    
    if (!donators || donators.length === 0) {
      const noDonatorsHTML = '<div class="donator-loading">No donators yet</div>';
      if (donatorList) donatorList.innerHTML = noDonatorsHTML;
      return;
    }
    
    const top10 = donators.slice(0, 10);
    
    const donatorsHTML = top10.map((donator, index) => {
      const rank = index + 1;
      const name = donator.Name || 'Anonymous';
      const donation = donator.Donation || '0';
      const profile = donator['User Profile'] || '#';
      
      const formattedDonation = donation;
      
      return `
        <div class="donator-item">
          <div class="donator-rank">${rank}</div>
          <div class="donator-info">
            <div class="donator-name">${name}</div>
            <div class="donator-amount">${formattedDonation}</div>
            ${profile !== '#' ? `<a href="${profile}" target="_blank" class="donator-profile">View Profile 🔗</a>` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    if (donatorList) donatorList.innerHTML = donatorsHTML;
    
  } catch (error) {
    console.error('Error loading donators:', error);
    const errorHTML = '<div class="donator-loading">Failed to load donators</div>';
    const donatorList = document.getElementById('donator-list');
    if (donatorList) donatorList.innerHTML = errorHTML;
  }
}

// Fetch and display recent value changes from spreadsheet (sheet: "Website Configs", columns: Title, Date, Text, Color)
async function loadValueChanges() {
  var listEl = document.getElementById('value-changes-list');
  var mobileListEl = document.getElementById('mobile-value-changes-list');
  if (!listEl && !mobileListEl) return;
  function setValueChangesHtml(html) {
    if (listEl) listEl.innerHTML = html;
    if (mobileListEl) mobileListEl.innerHTML = html;
  }
  try {
    var rows = await fetchSheet("Website Configs");
    if (!rows || rows.length === 0) {
      setValueChangesHtml('<div class="value-changes-loading">No value changes yet.</div>');
      return;
    }
    var filtered = rows.filter(function (r) {
      var name = (r.Title || r.Name || '').toString().trim();
      if (name === "Anaconda GW" || name === "Firework GW") return false;
      var t = (r.Title || r.Date || r.Text || '').toString().trim();
      return t.length > 0;
    });
    if (filtered.length === 0) {
      setValueChangesHtml('<div class="value-changes-loading">No value changes yet.</div>');
      return;
    }
    var colorMap = { green: 'green', orange: 'orange', red: 'red', blue: 'blue' };
    var html = filtered.map(function (r) {
      var title = (r.Title || '').toString().trim();
      var date = (r.Date || '').toString().trim();
      var text = (r.Text || '').toString().trim();
      var color = (r.Color || '').toString().trim().toLowerCase();
      var colorClass = colorMap[color] ? ' value-change-item--' + colorMap[color] : '';
      var titleEsc = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      var dateEsc = date.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      var textEsc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
      return '<div class="value-change-item' + colorClass + '">' +
        '<div class="value-change-icon' + colorClass + '"></div>' +
        (titleEsc ? '<p class="value-change-title">' + titleEsc + '</p>' : '') +
        (dateEsc ? '<p class="value-change-date">' + dateEsc + '</p>' : '') +
        (textEsc ? '<p class="value-change-text">' + textEsc + '</p>' : '') +
        '</div>';
    }).join('');
    setValueChangesHtml(html);
  } catch (err) {
    console.error('Error loading value changes:', err);
    setValueChangesHtml('<div class="value-changes-loading">Failed to load value changes.</div>');
  }
}


/* MOBILE MENU FUNCTIONALITY — index clones #sections-nav; other pages get link list */
function setupMobileHamburgerMenu() {
  if (!window.matchMedia("(max-width: 1024px)").matches) return;
  var hamburgerBtn = document.getElementById('hamburger-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  if (!hamburgerBtn || !mobileMenu || mobileMenu.dataset.bsvMobileInit === '1') return;
  mobileMenu.dataset.bsvMobileInit = '1';

  var sectionsNav = document.getElementById('sections-nav');
  if (sectionsNav) {
    var navClone = sectionsNav.cloneNode(true);
    mobileMenu.appendChild(navClone);
    var drawerPromo = document.createElement('div');
    drawerPromo.className = 'mobile-menu-drawer-promo';
    drawerPromo.innerHTML =
      '<p class="mobile-menu-sponsored-label">Sponsored</p>' +
      '<div class="mobile-menu-shark-promo">' +
      '<a href="https://attackshark.com/?ref=RIVER" target="_blank" rel="noopener noreferrer sponsored" class="mobile-menu-shark-promo-link">' +
      '<p class="mobile-menu-shark-promo-text">CLICK HERE TO GET THE BEST GAMING MICE!</p>' +
      '<img src="https://i.ibb.co/0pM24HZ9/ph-11134207-7rasi-m9tr2cfmioxw1c.jpg" alt="Attack Shark gaming mice" class="mobile-menu-shark-promo-img" loading="lazy" />' +
      '</a></div>';
    mobileMenu.appendChild(drawerPromo);
    navClone.querySelectorAll('button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var sectionName = (btn.textContent || '').trim();
        showSection(sectionName);
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
      });
    });
    hamburgerBtn.addEventListener('click', function() {
      hamburgerBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
    mobileMenu.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON') {
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
      if (e.target.closest && e.target.closest('.mobile-menu-drawer-promo a')) {
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });
    return;
  }

  var inner = document.createElement('div');
  inner.className = 'mobile-menu-satellite-inner';
  inner.innerHTML =
    '<a href="index.html">Home</a>' +
    '<a href="x-about.html">About Us</a>' +
    '<a href="x-faq.html">FAQ</a>' +
    '<a href="z-contact.html">Contact Us</a>';
  mobileMenu.appendChild(inner);
  hamburgerBtn.addEventListener('click', function() {
    hamburgerBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  });
  mobileMenu.addEventListener('click', function(e) {
    if (e.target.tagName === 'A') {
      hamburgerBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
    }
  });
}
document.addEventListener('DOMContentLoaded', setupMobileHamburgerMenu);

// MOBILE TAX CALCULATOR

document.addEventListener('DOMContentLoaded', function() {
    if (!window.matchMedia("(max-width: 1024px)").matches) return;

    const arrow = document.getElementById('mobile-calc-arrow');
    const calc = document.getElementById('mobile-tax-calc');
    const backdrop = document.getElementById('mobile-calc-backdrop');
    const closeBtn = document.getElementById('mobile-calc-close');
    const input = document.getElementById('mobile-tax-input');
    const amount = document.getElementById('mobile-tax-amount');
    const mobileTaxContent = document.getElementById('mobile-tax-content');
    const mobileRecentChanges = document.getElementById('mobile-recent-changes');
    const mobilePromo = calc.querySelector('.discord-mm-promo--mobile-panel');
    const accessoriesSectionId = slugify(ACCESSORIES_SECTION_NAME);
    const originalMobileTaxContentHtml = mobileTaxContent ? mobileTaxContent.innerHTML : '';
    
    if (!arrow || !calc || !closeBtn || !input || !amount) {
      return;
    }

    function openCalc() {
      calc.classList.add('active');
      document.body.classList.add('mobile-panel-open');
      if (backdrop) {
        backdrop.classList.add('active');
        backdrop.setAttribute('aria-hidden', 'false');
      }
    }

    function closeCalc() {
      calc.classList.remove('active');
      document.body.classList.remove('mobile-panel-open');
      if (backdrop) {
        backdrop.classList.remove('active');
        backdrop.setAttribute('aria-hidden', 'true');
      }
    }
    
    const calcSections = ['home', 'uncommon', 'rare', 'epic', 'legendary', 'omega', 'vehicles', 'misc', slugify(ACCESSORIES_SECTION_NAME)];
    
    arrow.addEventListener('click', openCalc);
    closeBtn.addEventListener('click', closeCalc);
    if (backdrop) {
      backdrop.addEventListener('click', closeCalc);
    }
    
    const breakdownEl = document.getElementById('mobile-tax-breakdown');

    function updateMobileTax() {
      const want = parseInt((input.value || '').replace(/[^\d]/g, ''), 10) || 0;
      const b = getTaxBreakdown(want);
      amount.innerHTML = b.totalWithdraw.toLocaleString() + ' <span class="tax-after-label">After Tax</span>';
      if (breakdownEl) {
        if (b.totalWithdraw <= 0) {
          breakdownEl.innerHTML = '';
          return;
        }
        breakdownEl.innerHTML = buildTaxBreakdownHtml(want, b);
      }
    }
    input.addEventListener('input', updateMobileTax);
    updateMobileTax();

    function renderMobileAccessoriesFastNav() {
      if (!mobileTaxContent) return;
      const section = document.getElementById(accessoriesSectionId);
      if (!section) return;

      const bigHeaders = Array.from(section.querySelectorAll('.accessories-big-header'));
      const miniHeaders = Array.from(section.querySelectorAll('.accessories-mini-header'));

      if (bigHeaders.length === 0 && miniHeaders.length === 0) return;

      const rows = [];
      rows.push('<h2 style="margin:0 0 8px 0; color:#dbeafe; font-size:0.95rem; text-align:center; font-weight:700;">Fast Navigation</h2>');

      bigHeaders.forEach(function(el) {
        const id = el.id || '';
        const title = escapeHtml((el.textContent || '').trim());
        if (!id || !title) return;
        rows.push(`<button type="button" data-target="${escapeAttr(id)}" style="display:block;width:100%;text-align:left;background:transparent;border:none;color:#e5efff;font-weight:700;padding:6px 4px;cursor:pointer;border-radius:0;margin-bottom:2px;font-size:0.82rem;">${title}</button>`);
      });

      miniHeaders.forEach(function(el) {
        const id = el.id || '';
        const title = escapeHtml((el.textContent || '').trim());
        if (!id || !title) return;
        rows.push(`<button type="button" data-target="${escapeAttr(id)}" style="display:block;width:100%;text-align:left;background:transparent;border:none;color:#9ec3dd;padding:5px 4px 5px 14px;cursor:pointer;border-radius:0;margin:0 0 1px 0;font-size:0.76rem;">${title}</button>`);
      });

      rows.push('<div style="height:8px"></div>');
      rows.push('<button type="button" id="mobile-acc-fast-nav-top" style="width:100%;padding:7px 9px;background:#203047;color:#cfe6ff;border:1px solid #355274;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.78rem;">Back to Top</button>');

      mobileTaxContent.innerHTML = rows.join('');

      mobileTaxContent.querySelectorAll('button[data-target]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const targetId = btn.getAttribute('data-target');
          const target = targetId ? document.getElementById(targetId) : null;
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          closeCalc();
        });
      });

      const topBtn = document.getElementById('mobile-acc-fast-nav-top');
      if (topBtn) {
        topBtn.addEventListener('click', function() {
          const sec = document.getElementById(accessoriesSectionId);
          if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          closeCalc();
        });
      }
    }

    function restoreMobileTaxContent() {
      if (!mobileTaxContent) return;
      if (mobileTaxContent.dataset.navMode === 'accessories') {
        mobileTaxContent.innerHTML = originalMobileTaxContentHtml;
        mobileTaxContent.dataset.navMode = '';
      }
    }

    // Show/hide arrow based on active section
    function updateArrowVisibility() {
      const sections = document.querySelectorAll('.sections > section');
      let activeSection = null;
      
      sections.forEach(section => {
        const computedStyle = window.getComputedStyle(section);
        if (computedStyle.display === 'block') {
          activeSection = section.id;
        }
      });
      
      const isHome = activeSection === 'home';
      const isAccessories = activeSection === accessoriesSectionId;

      if (isAccessories) {
        renderMobileAccessoriesFastNav();
        if (mobileTaxContent) {
          mobileTaxContent.dataset.navMode = 'accessories';
          mobileTaxContent.style.display = 'block';
        }
        if (mobileRecentChanges) mobileRecentChanges.style.display = 'none';
        if (mobilePromo) mobilePromo.style.display = 'none';
      } else {
        restoreMobileTaxContent();
        if (mobileTaxContent) mobileTaxContent.style.display = isHome ? 'none' : 'block';
        if (mobileRecentChanges) mobileRecentChanges.style.display = isHome ? 'block' : 'none';
        if (mobilePromo) mobilePromo.style.display = isHome ? 'none' : 'block';
      }

      if (calcSections.includes(activeSection)) {
        arrow.style.display = 'flex';
      } else {
        arrow.style.display = 'none';
        closeCalc();
      }
    }
    
    updateArrowVisibility();
    
    // Check when sections change
    const observer = new MutationObserver(updateArrowVisibility);
    const sectionsContainer = document.querySelector('.sections');
    if (sectionsContainer) {
      observer.observe(sectionsContainer, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['style'] 
      });
    }
  });

/* ========== PINK WEBSITE THEME - theme switcher (remove with theme section in style.css) ========== */
var THEMES_DISABLED = true; /* Set to false to re-enable theme switcher */

function applyPinkThemeDividers() {
  if (THEMES_DISABLED) {
    document.querySelectorAll('.home-divider').forEach(function(el) {
      el.style.removeProperty('background');
    });
    return;
  }
  var theme = document.body.getAttribute('data-theme');
  var gradient = theme === 'pink'
    ? 'linear-gradient(90deg, transparent, #d0a8b8, transparent)'
    : null;
  document.querySelectorAll('.home-divider').forEach(function(el) {
    if (gradient) {
      el.style.setProperty('background', gradient, 'important');
    } else {
      el.style.removeProperty('background');
    }
  });
}
function initThemeSwitcher() {
  if (THEMES_DISABLED) {
    document.body.removeAttribute('data-theme');
    document.body.classList.add('themes-disabled');
    applyPinkThemeDividers();
    return;
  }
  document.body.classList.remove('themes-disabled');
  var saved = localStorage.getItem('bsv-theme') || 'default';
  // Apply saved theme: '' for default, or specific theme name (e.g. 'red', 'pink', 'purple')
  if (saved === 'pink' || saved === 'red' || saved === 'purple') {
    document.body.setAttribute('data-theme', saved);
  } else {
    document.body.removeAttribute('data-theme');
    saved = 'default';
  }
  applyPinkThemeDividers();
  var wrap = document.getElementById('theme-switcher');
  if (!wrap) return;
  var btns = wrap.querySelectorAll('.theme-switcher-btn');
  btns.forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === saved);
    btn.addEventListener('click', function() {
      var theme = this.getAttribute('data-theme');
      if (theme === 'default') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', theme);
      }
      localStorage.setItem('bsv-theme', theme);
      btns.forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-theme') === theme); });
      applyPinkThemeDividers();
    });
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initThemeSwitcher();
    applyPinkThemeDividers();
  });
} else {
  initThemeSwitcher();
  applyPinkThemeDividers();
}