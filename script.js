// CONFIG — blockspinvalues.com (BSV OFFICIAL): production value-list spreadsheet only.
// Local/test copy: use a different SPREADSHEET_ID in your dev project — do not overwrite this with the test ID.
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
  
  // EXTRAS
  "💰 Richest Players",
  "Crew Logos"
];

// AdSense (same publisher as index.html) — slots rendered via insertAdjacentHTML; activated by bsvActivateAdSenseSlots()
const BSV_ADSENSE_CLIENT = "ca-pub-5741402692612033";

function bsvAdSenseInsHtml(adSlot) {
  return (
    '<div class="bsv-adsense-unit bsv-adsense-unit--section" aria-label="Advertisement">' +
    '<ins class="adsbygoogle" style="display:block" data-ad-client="' +
    BSV_ADSENSE_CLIENT +
    '" data-ad-slot="' +
    adSlot +
    '" data-ad-format="auto" data-full-width-responsive="true"></ins></div>'
  );
}

const BSV_AD_THREE_PLACEHOLDER = bsvAdSenseInsHtml("6782577562");
const BSV_AD_FOUR_PLACEHOLDER = bsvAdSenseInsHtml("4197814232");

/** AdSense skips fills for hidden slots; use computed style so we match real visibility after tab change. */
function bsvAdSenseSectionVisible(ins) {
  var sec = ins.closest("section");
  if (!sec) return true;
  if (sec.style.display === "none") return false;
  var cs = window.getComputedStyle(sec);
  if (cs.display === "none" || cs.visibility === "hidden") return false;
  return true;
}

function bsvActivateAdSenseSlots() {
  try {
    /* Undo mistaken marks from older builds that pushed while sections were still hidden */
    document.querySelectorAll("ins.adsbygoogle[data-bsv-pushed]").forEach(function (ins) {
      if (!bsvAdSenseSectionVisible(ins)) ins.removeAttribute("data-bsv-pushed");
    });
    document.querySelectorAll("ins.adsbygoogle:not([data-bsv-pushed])").forEach(function (ins) {
      if (!bsvAdSenseSectionVisible(ins)) return;
      ins.setAttribute("data-bsv-pushed", "1");
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  } catch (e) {
    /* ignore */
  }
}

var _bsvAdSenseScheduleTimer = null;
/** Section ads often race layout after show/hide; extra passes are idempotent (data-bsv-pushed). */
function bsvScheduleAdSenseActivation() {
  bsvActivateAdSenseSlots();
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(function () {
      bsvActivateAdSenseSlots();
      requestAnimationFrame(function () {
        bsvActivateAdSenseSlots();
      });
    });
  }
  clearTimeout(_bsvAdSenseScheduleTimer);
  _bsvAdSenseScheduleTimer = setTimeout(function () {
    _bsvAdSenseScheduleTimer = null;
    bsvActivateAdSenseSlots();
  }, 400);
}

// Tax calculator: 40k drop → 29,091 received (confirmed). Above 40k (e.g. 41,250) still gives 29,091. MAX 40K PER DROP.
const TAX_RECEIVE_RATIO = 29091 / 40000;
const TAX_MAX_DROP = 40000;
const TAX_RECEIVE_PER_40K = 29091;

// RICHEST PLAYERS SECTION START

function formatNetWorth(value) {
  // Remove dollar signs, commas, and any other non-numeric characters except decimal point
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
  if (rank === 1) return '#FFD700';        // 🥇 Gold
  if (rank === 2) return '#C0C0C0';        // 🥈 Silver
  if (rank === 3) return '#CD7F32';        // 🥉 Bronze
  if (rank >= 4 && rank <= 25) return '#8B5CF6';   // 🟣 Purple (4-25)
  if (rank >= 26 && rank <= 100) return '#EC4899'; // 💖 Pink (26-100)
  if (rank >= 101 && rank <= 500) return '#48BB78'; // 🟢 Green (101-500)
  return '#A0A0A0'; // ⚪ Gray (501-1000)
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
      ${BSV_AD_FOUR_PLACEHOLDER}
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
    
    // Create Roblox search URL
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
// RICHEST PLAYERS SECTION END 

// === FETCH HELPERS ===
async function fetchSheet(sheetName) {
  try {
    const base = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq`;
    const url = `${base}?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&headers=1`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));

    const cols = json.table.cols.map(c => c.label?.trim() || "");
    const rows = json.table.rows || [];
    const items = rows.map(r => {
      const obj = {};
      cols.forEach((label, i) => {
        const cell = r.c?.[i];
        obj[label] = cell ? (cell.f ?? cell.v ?? "") : "";
      });
      return obj;
    });

    // For most sheets we filter out blank rows using the Name/Header-style columns.
    // For "Website Configs" (value changes) we want ALL rows and will filter separately.
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

// Special fetch for Richest Players from different spreadsheet
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
        obj[label] = cell ? (cell.f ?? cell.v ?? "") : "";
      });
      return obj;
    });

    // Filter out empty rows and return rows 2-1000 (index 1-999)
    const validItems = items.filter(x => String(x["Roblox Username"] || "").trim().length > 0);
    return validItems;
  } catch (err) {
    console.error('Failed to fetch Richest Players', err);
    return [];
  }
}

function createCard(item) {
  const name = safe(item["Name"]);
  const img = safe(item["Image URL"]);
  const demand = safe(item["Demand"]);
  const avg = safe(item["Average Value"]);
  const ranged = safe(item["Ranged Value"]);
  const durability = safe(item["Durability"]);
  const internalValue = safe(item["Internal Value"]);
  const giveawayFlag = safe(item["Giveaway"]);


  // Simple image tag (no broken overlay handling)
  let imgTag = "";
  if (img) {
    imgTag = `<img src="${img}" alt="${name}" onerror="this.style.display='none'">`;
  }

  let durabilityHTML = '';
  
  // Check if "Durability Invisible" is set to "Yes"
  const durabilityInvisible = safe(item["Durability Invisible"]);
  const invisibleStyle = (durabilityInvisible && durabilityInvisible.toLowerCase() === 'yes') ? 'style="opacity: 0;"' : '';
  
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

  // Calculate exact repair price (numeric; format later in template)
let repairPrice = 0;
if (durability && durability.includes('/') && internalValue) {
  const [currentDurability, maxDurability] = durability.split('/').map(v => parseInt(v) || 0);
  const missingDurability = maxDurability - currentDurability;

  // Convert internal value (handles "$" and "k")
  const internalVal = parseFloat(internalValue.replace(/[$,k]/gi, '')) *
                      (internalValue.toLowerCase().includes('k') ? 1000 : 1);

  // Use tested divisor (1.43) for accuracy
  const rawRepair = missingDurability * (internalVal / maxDurability / 1.43);
  repairPrice = Math.round(rawRepair);
}

  // Calculate exact pawn amount (money formatted)
let pawnAmount = 0;
if (durability && durability.includes('/') && internalValue) {
  const [currentDurability, maxDurability] = durability.split('/').map(v => parseInt(v) || 0);

  // Convert internal value (handles "$" and "k")
  const internalVal = parseFloat(internalValue.replace(/[$,k]/gi, '')) *
                      (internalValue.toLowerCase().includes('k') ? 1000 : 1);

  // Pawn formula: (internalValue * 0.3) - ((maxDurability - currentDurability) * ((internalValue * 0.3) / maxDurability / 1.43))
  const baseValue = internalVal * 0.3;
  const missingDurability = maxDurability - currentDurability;
  const deduction = missingDurability * ((internalVal * 0.3) / maxDurability / 1.43);
  
  const rawPawn = baseValue - deduction;
  pawnAmount = Math.round(rawPawn);

  // Format as money
  pawnAmount = `$${pawnAmount.toLocaleString()}`;
}
  
  const hasGiveaway = giveawayFlag && giveawayFlag.toString().trim().toLowerCase() === 'yes';
  
  return `
    <div class="card" data-name="${escapeAttr(name)}" 
         data-avg="${escapeAttr(avg)}" 
         data-ranged="${escapeAttr(ranged)}" 
         data-max-durability="${durability ? durability.split('/')[1] : '100'}"
         data-internal-value="${escapeAttr(internalValue)}">
      <div class="card-left">
        ${imgTag}
        ${durabilityHTML}
      </div>
      <div class="card-info">
        <h3>${name}</h3>
        ${demand ? `<span class="badge">Demand: ${demand}</span>` : ""}
        <div class="card-avg">Average Value: <span class="avg-value">${avg}</span></div>
        <div class="card-ranged">Ranged Value: <span class="ranged-value">${ranged}</span></div>
        ${durability && internalValue ? `<div class="card-pawn">Pawn Amount: <span class="pawn-value">${pawnAmount}</span></div>` : ''}
        ${durability && internalValue ? `
          <div class="card-repair">
            Repair Price: <span class="repair-value">$${repairPrice.toLocaleString()}</span>
          </div>
        ` : ''}
      </div>
      ${hasGiveaway ? `
        <button class="card-giveaway-trigger" type="button" aria-label="This item has an active giveaway" data-item-name="${escapeAttr(name)}"></button>
      ` : ''}
    </div>
  `;
}

// Global giveaway modal (created once on demand)
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

  // Handle Roblox name - check if it contains a URL and extract both parts
  let robloxNameHtml;
  if (robloxName.includes('http')) {
    // Extract the URL and the text before it
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

  // Handle evidence links
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

function renderSection(title, items) {
  // Always render BlockSpin Map even if no items
  if (title === "BlockSpin Map") {
    renderBlockSpinMapSection();
    return;
  }

  // Always render Home section even if no items
  if (title === "Home") {
    const html = `
      <section class="section" id="${slugify(title)}">
        <h2>${title}</h2>
        <div class="home-content">
          <!-- Add your home page content here -->
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
        ${BSV_AD_THREE_PLACEHOLDER}
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
        ${BSV_AD_THREE_PLACEHOLDER}
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
        ${BSV_AD_THREE_PLACEHOLDER}
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
      <div class="legendary-banner">
        <p class="legendary-banner-text">We <strong>giveaway</strong> a <strong>Legendary gun</strong> in our Discord server every day!</p>
        <div class="legendary-banner-right">
          <a href="https://discord.gg/scgqMpPAC6" target="_blank" rel="noopener" class="legendary-banner-btn">Join our Discord server</a>
          <p class="legendary-banner-members"><span class="discord-member-count">—</span> members</p>
        </div>
      </div>
      ${BSV_AD_THREE_PLACEHOLDER}
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
  
  html += BSV_AD_FOUR_PLACEHOLDER + `</section>`;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
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
  
  // Add event listeners after HTML is inserted
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

// SECTION NAVIGATION 
function initSectionsNav() {
  const nav = document.getElementById("sections-nav");
  if (!nav) return;

  SECTION_NAMES.forEach((name, index) => {
    // Add gap and "Extras" header before first Extra
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

/** ≤1024px (phones + iPads): put search under the section title; wider: keep search before #home */
function syncItemSectionSearchPlacement(name) {
  const sectionsEl = document.getElementById("sections");
  const searchContainer = document.querySelector(".search-container");
  if (!sectionsEl || !searchContainer) return;

  const hiddenSearchSections = ["Home", "Crew Logos", "Crate Game", "💰 Richest Players"];

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

//  BANNER LOGIC FROM MAIN SITE
function showSection(name) {
  console.log(`Showing section: ${name}`);
  
    // Reset durability when switching sections
  document.querySelectorAll('.durability-input').forEach(input => {
    const card = input.closest('.card');
    const maxDurability = card.dataset.maxDurability;
    input.value = maxDurability;
    updateCardValues(input);
  });
  
   // Tax sidebar slot: show Value Changes on Home, Tax Calculator elsewhere
  const taxSidebarColumn = document.getElementById('tax-sidebar-column');
  const homeValueChanges = document.getElementById('home-value-changes');
  const taxCalc = taxSidebarColumn ? taxSidebarColumn.querySelector('.tax-calculator') : null;
  const hiddenSections = ['Crew Logos', 'Crate Game', '💰 Richest Players'];
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
    taxCalc.style.display = isHome ? 'none' : 'block';
  }
  if (homeValueChanges) {
    homeValueChanges.style.visibility = isHome ? 'visible' : 'hidden';
    homeValueChanges.style.opacity = isHome ? '1' : '0';
    homeValueChanges.style.display = isHome ? 'block' : 'none';
  }

    
  // Hide/show search bar based on section
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer) {
    const hiddenSearchSections = ['Home', 'Crew Logos', 'Crate Game', '💰 Richest Players'];
    if (hiddenSearchSections.includes(name)) {
      searchContainer.style.cssText = 'visibility: hidden; height: 0; margin: 0; overflow: hidden;';
    } else {
      searchContainer.style.cssText = 'visibility: visible; height: auto; overflow: visible; width: 100%; display: flex; justify-content: center; align-items: center;';
    }
  }
  
  // Show/hide sections
  SECTION_NAMES.forEach(sec => {
    const el = document.getElementById(slugify(sec));
    if (el) el.style.display = sec === name ? "block" : "none";
  });

  // Highlight active nav button
  document.querySelectorAll("#sections-nav button").forEach(b => {
    b.classList.toggle("active", b.textContent === name);
  });

  syncItemSectionSearchPlacement(name);
  bsvScheduleAdSenseActivation();
}

// SEARCH 
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
    ' you need to drop ' +
    formatDollar(breakdown.totalWithdraw) +
    '. Heres how to do it!</span><br>' +
    breakdown.lines.map(function(line) { return line + '<br>'; }).join('');
}

// TAX CALCULATOR (40k max per drop, multi-drop breakdown)
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

// COPY TO CLIPBOARD
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

// DURABILITY FUNCTIONS 
let durabilityInterval = null;
let durabilityTimeout = null;

// Prevent typing numbers higher than max
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
  if (evt) evt.preventDefault(); // Prevent both touch and mouse events firing
  
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
  const currentDurability = parseInt(input.value) || 0; // Fixed: Default to 0 if empty
  const maxDurability = parseInt(card.dataset.maxDurability);
  
  const durabilityPercent = currentDurability / maxDurability;
  
  const originalAvg = card.dataset.avg;
  const originalRanged = card.dataset.ranged;
  
  card.querySelector('.avg-value').textContent = calculateDurabilityValue(originalAvg, durabilityPercent);
  card.querySelector('.ranged-value').textContent = calculateDurabilityValue(originalRanged, durabilityPercent);
  
  // Update repair price
  const internalValue = card.dataset.internalValue;
  const repairValueElement = card.querySelector('.repair-value');
  
  if (repairValueElement && internalValue) {
    const missingDurability = maxDurability - currentDurability;
    const internalVal = parseFloat(internalValue.replace(/[$,k]/gi, '')) * (internalValue.toLowerCase().includes('k') ? 1000 : 1);
    const repairPrice = Math.round(missingDurability * (internalVal / maxDurability / 1.43));
    repairValueElement.textContent = '$' + (isNaN(repairPrice) ? 0 : repairPrice).toLocaleString(); // Fixed: Shows $0 instead of NaN
  }
  
  // Update pawn amount
  const pawnValueElement = card.querySelector('.pawn-value');
  
  if (pawnValueElement && internalValue) {
    const missingDurability = maxDurability - currentDurability;
    const internalVal = parseFloat(internalValue.replace(/[$,k]/gi, '')) * (internalValue.toLowerCase().includes('k') ? 1000 : 1);
    
    // Pawn formula
    const baseValue = internalVal * 0.3;
    const deduction = missingDurability * ((internalVal * 0.3) / maxDurability / 1.43);
    const pawnPrice = Math.round(baseValue - deduction);
    
    pawnValueElement.textContent = '$' + (isNaN(pawnPrice) ? 0 : pawnPrice).toLocaleString(); // Fixed: Shows $0 instead of NaN
  }
}

function calculateDurabilityValue(originalValue, durabilityPercent) {
  if (!originalValue || originalValue === '' || originalValue === 'N/A' || originalValue === '-') {
    return originalValue || 'N/A';
  }
  
  // New formula: 20% floor + 80% scaled by durability
  const valueMultiplier = 0.20 + (0.80 * durabilityPercent);
  
  // Handle range format (works for "Ranged Value")
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
  
  // Handle single value
  const value = parseValue(originalValue) * valueMultiplier;
  
  if (!isNaN(value) && value > 0) {
    return formatLikeOriginal(value, originalValue);
  }
  
  return originalValue;
}

function parseValue(str) {
  if (!str) return 0;
  
  str = str.toString().trim().toLowerCase();
  str = str.replace(/[$,]/g, ''); // Remove $ and commas
  
  if (str.includes('k')) {
    return parseFloat(str.replace('k', '')) * 1000;
  }
  
  if (str.includes('m')) {
    return parseFloat(str.replace('m', '')) * 1000000;
  }
  
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}



function formatLikeOriginal(num, original) {
  num = Math.round(num);
  
  // Check what format the original was in
  const wasK = original.toLowerCase().includes('k');
  const wasM = original.toLowerCase().includes('m');
  const hadCommas = original.includes(',');
  
  if (wasM) {
    // Original was in millions — round to whole number
    const m = Math.round(num / 1000000);
    return '$' + m + 'm';
  } else if (wasK) {
    // Original was in thousands — round to whole number
    const k = Math.round(num / 1000);
    return '$' + k + 'k';
  } else if (hadCommas || num >= 1000) {
    // Original had commas or number is big enough
    return '$' + num.toLocaleString();
  } else {
    // Simple number
    return '$' + num;
  }
}

document.addEventListener('mouseup', stopDurabilityAdjust);
document.addEventListener('touchend', stopDurabilityAdjust);
document.addEventListener('touchcancel', stopDurabilityAdjust);

// HELPERS 
function safe(str) { return str ?? ""; }
function escapeAttr(str) { return (str+"").replace(/"/g, "&quot;"); }
/** Google Sheet tab name when it differs from the sidebar label */
function getSheetNameForSection(displayName) {
  if (displayName === "Common / Uncommon") return "Uncommon";
  return displayName;
}

function slugify(str) {
  if (str === "Common / Uncommon") return "uncommon";
  return str.toLowerCase().replace(/\s+/g, "-");
}

// INIT - PARALLEL LOADING FOR SPEED 
document.addEventListener("DOMContentLoaded", async () => {
  console.log('DOM loaded, initializing...');

  // Safety timeout - force hide loading screen after 15 seconds
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
  bsvActivateAdSenseSlots();

  const totalSections = SECTION_NAMES.length;
  let loadedSections = 0;

  // Fetch all sections at once (parallel)
  const fetchPromises = SECTION_NAMES.map(async (sec) => {
   
    console.log(`Fetching data for: ${sec}`);
    
    let items;
    try {
      // Use NEW spreadsheet for Richest Players, OLD spreadsheet for everything else
      if (sec === "💰 Richest Players") {
        items = await fetchRichestPlayers(); // NEW spreadsheet
        console.log(`Got ${items.length} items for ${sec} from NEW spreadsheet`);
      } else {
        items = await fetchSheet(getSheetNameForSection(sec)); // OLD spreadsheet (sheet tab may differ from nav label)
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

  // Wait for all to finish
  const results = await Promise.all(fetchPromises);

  // Render in order
  results.forEach(({ section, items }) => {
    renderSection(section, items);
  });

  // Decide which section to show first.
  // If URL has a hash like #sec=Legendary, honor that; otherwise default to Home.
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

// Giveaway card click handling
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

// Show/hide Epic/Omega giveaway banners from Website Configs.
// Your sheet: row 1 = column headers "Anaconda GW" and "Firework GW", row 2 = "Yes" under each to show that banner.
// Using "GW" avoids clashing with item names like Anaconda/Firework in other sheets.
function applyBannerConfig(rows) {
  if (!rows || !rows.length) return;
  var showAnaconda = false;
  var showFirework = false;
  var first = rows[0];
  if (first && ("Anaconda GW" in first || "Firework GW" in first)) {
    var anacondaVal = (first["Anaconda GW"] || "").toString().trim().toLowerCase();
    var fireworkVal = (first["Firework GW"] || "").toString().trim().toLowerCase();
    showAnaconda = /^(yes|1|true|on)$/.test(anacondaVal);
    showFirework = /^(yes|1|true|on)$/.test(fireworkVal);
  } else {
    rows.forEach(function (r) {
      var name = (r.Title || r.Name || '').toString().trim();
      var show = (r.Show || r.Enabled || '').toString().trim().toLowerCase();
      if (name === "Anaconda GW") showAnaconda = /^(yes|1|true|on)$/.test(show);
      if (name === "Firework GW") showFirework = /^(yes|1|true|on)$/.test(show);
    });
  }
  var anacondaEl = document.getElementById('omega-anaconda-banner');
  var fireworkEl = document.getElementById('epic-firework-banner');
  if (anacondaEl) anacondaEl.style.display = showAnaconda ? 'flex' : 'none';
  if (fireworkEl) fireworkEl.style.display = showFirework ? 'flex' : 'none';
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
    applyBannerConfig(rows);
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
    // cloneNode does not copy JS listeners; wire cloned buttons manually
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
    
    const calcSections = ['home', 'uncommon', 'rare', 'epic', 'legendary', 'omega', 'vehicle', 'misc'];
    
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
      if (mobileTaxContent) mobileTaxContent.style.display = isHome ? 'none' : 'block';
      if (mobileRecentChanges) mobileRecentChanges.style.display = isHome ? 'block' : 'none';
      if (mobilePromo) mobilePromo.style.display = isHome ? 'none' : 'block';

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