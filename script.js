// === CONFIG ===
const SPREADSHEET_ID = "1vAm9x7c5JPxpHxDHVcDgQifXsAvW9iW2wPVuQLENiYs";
const SECTION_NAMES = [
  "Common",
  "Rare",
  "Epic",
  "Legendary",
  "Omega",
  "Misc",
  "Cars",
  // "Car Customisation"
];

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

    return items.filter(x => String(x["Name"] || "").trim().length > 0);
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

function renderSection(title, items) {
  if (!items || items.length === 0) return;

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

// === SECTION NAVIGATION ===
function initSectionsNav() {
  const nav = document.getElementById("sections-nav");
  SECTION_NAMES.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.addEventListener("click", () => showSection(name));
    nav.appendChild(btn);
  });
}

function showSection(name) {
  SECTION_NAMES.forEach(sec => {
    const el = document.getElementById(slugify(sec));
    if (el) el.style.display = sec === name ? "block" : "none";
  });
  document.querySelectorAll("#sections-nav button").forEach(b => {
    b.classList.toggle("active", b.textContent === name);
  });
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
    taxResult.textContent = `Amount to withdraw: ${withdraw}`;
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

  // Show first section by default
if (SECTION_NAMES.length > 0) showSection(SECTION_NAMES[0]);
})

// === BANNER CONFIG ===
const BANNER_SHEET_NAME = "Banner"; // Name of your spreadsheet page for the banner
const BANNER_CONTAINER_ID = "banner"; // ID of the div in HTML for banner

// === FETCH BANNER DATA ===
async function fetchBanner() {
  try {
    const base = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq`;
    const url = `${base}?tqx=out:json&sheet=${encodeURIComponent(BANNER_SHEET_NAME)}&headers=1`;
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

    return items.length > 0 ? items[0] : null; // Only use the first row
  } catch (err) {
    console.error("Failed to fetch banner", err);
    return null;
  }
}

// === RENDER BANNER ===
async function renderBanner() {
  const data = await fetchBanner();
  if (!data) return;

  let container = document.getElementById(BANNER_CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = BANNER_CONTAINER_ID;
    document.body.appendChild(container);
  }

  container.textContent = data["Banner Text"] || "Your Banner!";
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.transform = "rotate(-20deg)";
  container.style.fontSize = data["Font Size"] || "48px";
  container.style.fontFamily = data["Font"] || "Arial, sans-serif";
  container.style.color = data["Color"] || "#ff0000";
  container.style.textShadow = data["Glow"] || "2px 2px 8px #000";
  container.style.zIndex = "9999";
  container.style.pointerEvents = "none"; // So it doesn't block clicks
}

// === INIT BANNER ===
document.addEventListener("DOMContentLoaded", () => {
  renderBanner();
});
