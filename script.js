// === CONFIG ===
const SPREADSHEET_ID = "1vAm9x7c5JPxpHxDHVcDgQifXsAvW9iW2wPVuQLENiYs";
const SECTION_NAMES = [
  "Uncommon",
  "Rare", 
  "Epic",
  "Legendary",
  "Omega",
  "Misc",
  "Vehicles",
  "Crew Logos",
  "Scammer List"
];

const SECTION_BANNERS = {
  "Uncommon": { url: "https://i.imgur.com/ttWiION.png", width: "160px", top: "226px", left: "53%" },
  "Rare":     { url: "https://i.imgur.com/ZShOTJY.png", width: "260px", top: "210px", left: "50%" },
  "Epic":     { url: "https://i.imgur.com/qMjGPBl.png", width: "310px", top: "200px", left: "50%" },
  "Legendary":{ url: "https://i.imgur.com/mdjOAS1.png", width: "217px", top: "227px", left: "53%" },
  "Omega":    { url: "https://i.imgur.com/LT1i1kR.png", width: "140px", top: "234px", left: "56%" },
  "Misc":     { url: "https://i.imgur.com/0WvIuZo.png", width: "200px", top: "235px", left: "53%" },
  "Vehicles": { url: "https://i.imgur.com/UGdzYtH.png", width: "218px", top: "228px", left: "54%" },
  "Crew Logos": { url: "https://i.imgur.com/SoIuFWy.png", width: "162px", top: "228px", left: "54%" },
  "Scammer List": { url: "https://i.imgur.com/bQeLrpx.png", width: "140px", top: "243px", left: "56%" }
};

// === FETCH HELPERS ===
async function fetchSheet(sheetName) {
  try {
    const base = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq`;
    const url = `${base}?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&headers=1&tq=`;
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

    return items.filter(x => String(x["Name"] || x["Header"] || x["Roblox Name"] || "").trim().length > 0);
  } catch (err) {
    console.error(`Failed to fetch sheet: ${sheetName}`, err);
    return [];
  }
}

// === RENDERING ===
function createCard(item) {
  const name = safe(item["Name"]);
  const img = safe(item["Image URL"]);
  const demand = safe(item["Demand"]);
  const avg = safe(item["Average Value"]);
  const ranged = safe(item["Ranged Value"]);
  const afterTax = safe(item["After Tax Value"]);

  const imgTag = img
    ? `<img src="${img}" alt="${name}" onerror="this.style.display='none'">`
    : "";

  return `
    <div class="card" data-name="${escapeAttr(name)}">
      ${imgTag}
      <div class="card-info">
        <h3>${name}</h3>
        ${demand ? `<span class="badge">Demand: ${demand}</span>` : ""}
        ${avg ? `<div>Average Value: ${avg}</div>` : ""}
        ${ranged ? `<div>Ranged Value: ${ranged}</div>` : ""}
        ${afterTax ? `<div>After Tax Value: ${afterTax}</div>` : ""}
      </div>
    </div>
  `;
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
  const submittedDate = item["Submitted Date"] || item["Submitted Date"] || "";

    // Handle Roblox name - detect and replace multiple URLs with "User Profile" links
  const robloxNameWithLinks = robloxName.replace(/https?:\/\/\S+/g, match => `<a href="${match}" target="_blank" rel="noopener" class="scammer-link">User Profile</a>`);

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
        <div class="scammer-field"><strong>Roblox Name:</strong> ${robloxNameWithLinks}</div>
        <div class="scammer-field"><strong>Discord:</strong> ${discordUser}</div>
        <div class="scammer-field"><strong>Reason:</strong> ${reasonWithLinks}</div>
        ${evidenceHtml ? `<div class="scammer-field"><strong>Evidence:</strong> ${evidenceHtml}</div>` : ""}
                       <div>Reported: DEBUG COLUMNS: ${Object.keys(item).join(' | ')}</div>
      </div>
    </div>
  `;
}
function renderSection(title, items) {
  if (!items || items.length === 0) return;

  if (title === "Crew Logos") {
    renderCrewLogosSection(items);
  } else if (title === "Scammer List") {
    renderScammerSection(items);
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

// === SECTION NAVIGATION ===
function initSectionsNav() {
  const nav = document.getElementById("sections-nav");
  
  SECTION_NAMES.forEach((name, index) => {
    // Add gap and "Extras" header before Crew Logos
    if (name === "Crew Logos") {
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

function showSection(name) {
  // Show/hide sections
  SECTION_NAMES.forEach(sec => {
    const el = document.getElementById(slugify(sec));
    if (el) el.style.display = sec === name ? "block" : "none";
  });

  // Highlight active nav button
  document.querySelectorAll("#sections-nav button").forEach(b => {
    b.classList.toggle("active", b.textContent === name);
  });

  // Banner logic
  const bannerImg = document.getElementById("banner-img");
  const bannerContainer = bannerImg.parentElement;
  const banner = SECTION_BANNERS[name];

  if (banner && banner.url) {
    bannerImg.classList.remove("show");
    setTimeout(() => {
      bannerImg.src = banner.url;
      bannerImg.style.display = "block";
      bannerImg.style.maxWidth = banner.width || "190px";
      bannerContainer.style.top = banner.top || "228px";
      bannerContainer.style.left = banner.left || "50%";
      bannerContainer.style.transform = "translateX(-50%)";
      bannerContainer.style.position = "absolute";
      requestAnimationFrame(() => {
        bannerImg.classList.add("show");
      });
    }, 300);
  } else {
    bannerImg.style.display = "none";
  }
}

// === SEARCH ===
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

// === TAX CALCULATOR ===
function initTaxCalculator() {
  const taxInput = document.getElementById("taxInput");
  const taxResult = document.getElementById("taxResult");
  if (!taxInput || !taxResult) return;

  taxInput.addEventListener("input", () => {
    const val = parseFloat(taxInput.value) || 0;
    const withdraw = Math.round(val / 0.72);
    taxResult.innerHTML = `Amount to withdraw: <span class="calc-amount">${withdraw}</span>`;
  });
}

// === COPY TO CLIPBOARD ===
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

// === HELPERS ===
function safe(str) { return str ?? ""; }
function escapeAttr(str) { return (str+"").replace(/"/g, "&quot;"); }
function slugify(str) { return str.toLowerCase().replace(/\s+/g, "-"); }

// === INIT ===
document.addEventListener("DOMContentLoaded", async () => {
  initSectionsNav();
  initSearch();
  initTaxCalculator();

  for (const sec of SECTION_NAMES) {
    const items = await fetchSheet(sec);
    renderSection(sec, items);
  }

  if (SECTION_NAMES.length > 0) showSection(SECTION_NAMES[0]);
});