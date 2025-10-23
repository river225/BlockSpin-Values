// === CONFIG ===
const SPREADSHEET_ID = "1rhptMcfWB2I-x3i9TNMwePcDD9SWWwGsaLwELqxCKzo";
const SECTION_NAMES = [
  "Home",
  "Uncommon",
  "Rare", 
  "Epic",
  "Legendary",
  "Omega",
  "Misc",
  "Vehicles",
  
  // EXTRAS
  "Trade Checker",
  "BlockSpin Map",
  "Crate Game",
  "Crew Logos",
  "Scammer List"
];


const SECTION_BANNERS = {
  // "Home": { url: "", width: "160px", top: "226px", left: "53%" },
  // "Uncommon": { url: "https://i.ibb.co/5Xfj0w2c/ttWiION.png", width: "160px", top: "226px", left: "53%" },
  // "Rare":     { url: "https://i.ibb.co/QvvLmkVq/ZShOTJY.png", width: "260px", top: "210px", left: "50%" },
  // "Epic":     { url: "https://i.ibb.co/938SzMHF/qMjGPBl.png", width: "310px", top: "200px", left: "50%" },
  // "Legendary":{ url: "https://i.ibb.co/pvsRYDn2/mdjOAS1.png", width: "217px", top: "227px", left: "53%" },
  // "Omega":    { url: "https://i.ibb.co/q3whwbx6/LT1i1kR.png", width: "140px", top: "234px", left: "56%" },
  // "Misc":     { url: "https://i.ibb.co/Dhdvg41/0WvIuZo.png", width: "200px", top: "235px", left: "53%" },
  // "Vehicles": { url: "https://i.ibb.co/MxK5B0sX/UGdzYtH.png", width: "218px", top: "228px", left: "54%" },
  // "BlockSpin Map": { url: "", width: "200px", top: "228px", left: "54%" },
  // "Crew Logos": { url: "https://i.ibb.co/Td4tMSc/SoIuFWy.png", width: "162px", top: "228px", left: "54%" },
  // "Scammer List": { url: "https://i.ibb.co/Zp7BDzzx/bQeLrpx.png", width: "140px", top: "243px", left: "56%" }
};

// ==================== GREEN LINE - BLOCKSPIN MAP SECTION START ====================

// BlockSpin Map Configuration
const BASE_MAP_IMAGE = "https://i.ibb.co/JwVD8Xpf/MrP86EC.png"; 

const MAP_SECTIONS = {
  "Player Spawn Points": {
    images: [
      {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "29%",
        left: "65%",
        detailImage: ""
      },
       {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "30%",
        left: "17%",
        detailImage: ""
      },
       {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "12%",
        left: "28%",
        detailImage: ""
      },
      {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "68%",
        left: "26%",
        detailImage: ""
      },
      {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "80%",
        left: "55%",
        detailImage: ""
      },
      {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "68%",
        left: "26%",
        detailImage: ""
      },
      {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "55%",
        left: "40%",
        detailImage: ""
      },
      {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "79%",
        left: "38%",
        detailImage: ""
      },
      {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "16%",
        left: "67%",
        detailImage: ""
      },
        {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "38%",
        left: "47%",
        detailImage: ""
      },
         {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "53%",
        left: "57.5%",
        detailImage: ""
      },
       {
        image: "https://i.ibb.co/1tzS0dJX/n4PnOKI.png",
        width: "27px",
        top: "25%",
        left: "37.5%",
        detailImage: ""
      }
    ]
  },

  "Crate Spawn Points": {
    images: [
      {
        image: "https://i.ibb.co/zhnBxTPv/Screenshot-2025-10-12-at-23-34-55-removebg-preview.png",
        width: "25px",
        top: "9%",
        left: "28%",
        detailImage: ""
      },
       {
        image: "https://i.ibb.co/zhnBxTPv/Screenshot-2025-10-12-at-23-34-55-removebg-preview.png",
        width: "25px",
        top: "8%",
        left: "60%",
        detailImage: ""
      },
       {
        image: "https://i.ibb.co/zhnBxTPv/Screenshot-2025-10-12-at-23-34-55-removebg-preview.png",
        width: "25px",
        top: "12.5%",
        left: "46%",
        detailImage: ""
      }
    ]
  },
  "NPCS": {
    images: [
      {
        image: "https://i.ibb.co/849Y0wJB/OJCriKp.png", // Rick
        width: "40px",
        top: "89%",
        left: "68%",
        detailImage: ""
      },
      {
        image: "https://i.ibb.co/twh4PVBm/Dz3MnwZ.png", // Rodrigo
        width: "43px",
        top: "89%",
        left: "56%",
        detailImage: ""
      },
      {
        image: "https://i.ibb.co/Kx3Cm8yW/4AYwFbt.png", // James
        width: "56px",
        top: "69%",
        left: "53%",
        detailImage: ""
      },
       {
        image: "https://i.ibb.co/s9k0SKps/KYtfyd9.png", // Urban
        width: "65px",
        top: "47%",
        left: "55%",
        detailImage: ""
      },
       {
        image: "https://i.ibb.co/gb54dgXn/hCv69fQ.png", // gas station
        width: "39px",
        top: "43%",
        left: "32.5%",
        detailImage: ""
      },
       {
        image: "https://i.ibb.co/vCSv411N/Rq1vj0r.png", // gun store
        width: "55px",
        top: "24.5%",
        left: "51%",
        detailImage: ""
      },
       {
        image: "https://i.ibb.co/DH2vqhcD/j3Lf34B.png", // Daniella
        width: "36px",
        top: "26.5%",
        left: "62%",
        detailImage: ""
      },
      {
        image: "https://i.ibb.co/VcQfLY56/1UjfGH2.png", // Barbershop 
        width: "39px",
        top: "21%",
        left: "37%",
        detailImage: ""
      },
       {
        image: "https://i.ibb.co/YFZ275hP/rRvRlw1.png", // Jewl shop
        width: "32px",
        top: "21%",
        left: "30%",
        detailImage: ""
      },
       {
        image: "https://i.ibb.co/yBZtSyM9/pFrqAWq.png", // restaurant
        width: "33px",
        top: "21%",
        left: "25%",
        detailImage: ""
      },
      {
        image: "https://i.ibb.co/F4FZSP4y/u4gmHx2.png", // clothes shop
        width: "33px",
        top: "23%",
        left: "18%",
        detailImage: ""
      },
      {
        image: "https://i.ibb.co/x8fdW3WL/5mn4Ync.png", // clothes shop
        width: "34px",
        top: "8%",
        left: "52%",
        detailImage: ""
      },
    ]
  },
 
  "Structures": {
    images: [
      {
        image: "",
        width: "40px",
        top: "25%",
        left: "30%",
        detailImage: ""
      }
    ]
  }
};

// ==================== BLOCKSPIN MAP SECTION END ====================

// ==================== TRADE CHECKER SECTION START ====================

// Global storage for all items data (loaded from sheets)
let ALL_ITEMS_DATA = [];

// Trade Checker state
const tradeState = {
  yourSide: [],
  theirSide: [],
  yourMoney: 0,
  theirMoney: 0
};

// Load all items into memory for Trade Checker search
async function loadAllItemsForTradeChecker() {
  if (ALL_ITEMS_DATA.length > 0) return; // Already loaded
  
  const sheets = ["Uncommon", "Rare", "Epic", "Legendary", "Omega", "Misc", "Vehicles"];
  for (const sheet of sheets) {
    const items = await fetchSheet(sheet);
    ALL_ITEMS_DATA.push(...items);
  }
}

// Create Trade Checker section HTML
function createTradeCheckerSection() {
  return `
    <div class="trade-checker-container">
      <!-- Trade Sides -->
      <div class="trade-sides">
        <!-- Your Side -->
        <div class="trade-side">
          <h3 class="trade-side-title" style="color: #33cce6;">Your Side</h3>
          
          <input 
            type="text" 
            class="trade-side-search" 
            placeholder="Search items to add..."
            data-side="your"
            autocomplete="off"
          />
          
          <div class="trade-items-container" id="your-items">
            <div class="trade-empty-state">No items added yet</div>
          </div>
          
          <div class="trade-money-input">
            <label>Money:</label>
            <input 
              type="number" 
              id="your-money" 
              value="0" 
              min="0"
              oninput="updateTradeMoney('your', this.value)"
            />
          </div>
        </div>

        <!-- Their Side -->
        <div class="trade-side">
          <h3 class="trade-side-title" style="color: #ff6b6b;">Their Side</h3>
          
          <input 
            type="text" 
            class="trade-side-search" 
            placeholder="Search items to add..."
            data-side="their"
            autocomplete="off"
          />
          
          <div class="trade-items-container" id="their-items">
            <div class="trade-empty-state">No items added yet</div>
          </div>
          
          <div class="trade-money-input">
            <label>Money:</label>
            <input 
              type="number" 
              id="their-money" 
              value="0" 
              min="0"
              oninput="updateTradeMoney('their', this.value)"
            />
          </div>
        </div>
      </div>

      <!-- Analysis Section -->
      <div class="trade-analysis" id="trade-analysis">
        <div class="analysis-row">
          <div class="analysis-item">
            <span class="analysis-label">Your Total:</span>
            <span class="analysis-value" id="your-total">$0</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">Their Total:</span>
            <span class="analysis-value" id="their-total">$0</span>
          </div>
        </div>
        <div class="trade-verdict" id="trade-verdict">
          Enter items to analyze the trade
        </div>
        <div class="demand-insight" id="demand-insight"></div>
      </div>
    </div>
  `;
}

// Search handler for trade checker
function setupTradeSearch() {
  const searchInputs = document.querySelectorAll('.trade-side-search');
  
  searchInputs.forEach(input => {
    let resultsDiv = null;
    
    input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const side = e.target.dataset.side;
      
      // Remove old results
      if (resultsDiv) resultsDiv.remove();
      
      if (query.length < 2) return;
      
      const matches = ALL_ITEMS_DATA.filter(item => 
        item.Name.toLowerCase().includes(query)
      ).slice(0, 8);
      
      if (matches.length === 0) return;
      
      // Create dropdown results
      resultsDiv = document.createElement('div');
      resultsDiv.className = 'trade-search-results';
      resultsDiv.innerHTML = matches.map(item => `
        <div class="trade-search-result" data-name="${escapeAttr(item.Name)}" data-side="${side}">
          <img src="${item['Image URL']}" onerror="this.style.display='none'" />
          <span>${item.Name}</span>
        </div>
      `).join('');
      
      // Create wrapper with relative positioning
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.width = '100%';
      
      // Insert wrapper after the input
      input.parentNode.insertBefore(wrapper, input.nextSibling);
      wrapper.appendChild(resultsDiv);
      
      // Add click handlers to results
      resultsDiv.querySelectorAll('.trade-search-result').forEach(result => {
        result.addEventListener('click', () => {
          const itemName = result.dataset.name;
          const itemSide = result.dataset.side;
          addItemToTrade(itemName, itemSide);
          input.value = '';
          if (resultsDiv) resultsDiv.remove();
          if (wrapper) wrapper.remove();
        });
      });
    });
    
    // Close results when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.trade-side') && resultsDiv) {
        resultsDiv.remove();
      }
    });
  });
}

// Show side selector (Your Side / Their Side)
function showSideSelector(itemName) {
  const item = ALL_ITEMS_DATA.find(i => i.Name === itemName);
  if (!item) return;
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'trade-side-modal';
  modal.innerHTML = `
    <div class="trade-side-modal-content">
      <h3>Add "${item.Name}" to which side?</h3>
      <div class="trade-side-buttons">
        <button onclick="addItemToTrade('${escapeAttr(itemName)}', 'your')">Your Side</button>
        <button onclick="addItemToTrade('${escapeAttr(itemName)}', 'their')">Their Side</button>
        <button onclick="closeSideModal()">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

window.closeSideModal = function() {
  const modal = document.querySelector('.trade-side-modal');
  if (modal) modal.remove();
};

// Add item to trade side
window.addItemToTrade = async function(itemName, side) {
  closeSideModal();
  
  const item = ALL_ITEMS_DATA.find(i => i.Name === itemName);
  if (!item) return;
  
  // Set durability to max by default (no popup)
  let durability = item.Durability;
  if (durability && durability.includes('/')) {
    const maxDur = durability.split('/')[1];
    durability = `${maxDur}/${maxDur}`; // Full durability
  }
  
  const tradeItem = {
    ...item,
    Durability: durability,
    id: Date.now() + Math.random() // Unique ID
  };
  
  if (side === 'your') {
    tradeState.yourSide.push(tradeItem);
  } else {
    tradeState.theirSide.push(tradeItem);
  }
  
  renderTradeSides();
  updateTradeAnalysis();
  
  // Clear search
  document.getElementById('trade-search').value = '';
  document.getElementById('trade-search-results').style.display = 'none';
};

// Remove item from trade
window.removeTradeItem = function(side, itemId) {
  if (side === 'your') {
    tradeState.yourSide = tradeState.yourSide.filter(i => i.id !== itemId);
  } else {
    tradeState.theirSide = tradeState.theirSide.filter(i => i.id !== itemId);
  }
  
  renderTradeSides();
  updateTradeAnalysis();
};

// Update money values
window.updateTradeMoney = function(side, value) {
  if (side === 'your') {
    tradeState.yourMoney = parseFloat(value) || 0;
  } else {
    tradeState.theirMoney = parseFloat(value) || 0;
  }
  updateTradeAnalysis();
};

// Update item durability in trade
window.updateTradeDurability = function(side, itemId, newDur) {
  const items = side === 'your' ? tradeState.yourSide : tradeState.theirSide;
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  const maxDur = item.Durability.split('/')[1];
  item.Durability = `${newDur}/${maxDur}`;
  
  renderTradeSides();
  updateTradeAnalysis();
};

// Adjust trade durability with arrows
window.adjustTradeDurability = function(side, itemId, direction) {
  const items = side === 'your' ? tradeState.yourSide : tradeState.theirSide;
  const item = items.find(i => i.id === itemId);
  if (!item || !item.Durability) return;
  
  const [current, max] = item.Durability.split('/').map(Number);
  let newValue = current + direction;
  
  if (newValue < 0) newValue = 0;
  if (newValue > max) newValue = max;
  
  item.Durability = `${newValue}/${max}`;
  
  renderTradeSides();
  updateTradeAnalysis();
};

// Render trade sides
function renderTradeSides() {
  renderSide('your', tradeState.yourSide);
  renderSide('their', tradeState.theirSide);
}

function renderSide(side, items) {
  const container = document.getElementById(`${side}-items`);
  
  if (items.length === 0) {
    container.innerHTML = '<div class="trade-empty-state">No items added yet</div>';
    return;
  }
  
  container.innerHTML = items.map(item => createTradeItemCard(item, side)).join('');
}

// Create trade item card (FULL version)
function createTradeItemCard(item, side) {
  const hasDurability = item.Durability && item.Durability.includes('/');
  const currentDur = hasDurability ? item.Durability.split('/')[0] : null;
  const maxDur = hasDurability ? item.Durability.split('/')[1] : null;
  
  let displayValue = item["Average Value"];
  if (hasDurability && currentDur && maxDur) {
    let valueStr = item["Average Value"];
    let baseValue = parseFloat(valueStr.replace(/[^0-9.]/g, '')) || 0;
    
    // Handle "k" suffix (250k = 250,000)
    if (valueStr.toLowerCase().includes('k')) {
      baseValue *= 1000;
    }
    
    const adjustedValue = (parseFloat(currentDur) / parseFloat(maxDur)) * baseValue;
    displayValue = `$${Math.round(adjustedValue).toLocaleString()}`;
  }
  
  let durabilityHTML = '';
  if (hasDurability) {
    durabilityHTML = `
      <div class="trade-durability-control">
        <label>Durability:</label>
        <div class="trade-durability-row">
          <input type="number" class="trade-durability-input" 
                 value="${currentDur}" 
                 max="${maxDur}" 
                 min="0" 
                 onchange="updateTradeDurability('${side}', ${item.id}, this.value)">
          <span class="trade-durability-max">/${maxDur}</span>
          <div class="trade-durability-arrows">
            <button onclick="adjustTradeDurability('${side}', ${item.id}, 1)">▲</button>
            <button onclick="adjustTradeDurability('${side}', ${item.id}, -1)">▼</button>
          </div>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="trade-item-card">
      <button class="trade-item-remove" onclick="removeTradeItem('${side}', ${item.id})">×</button>
      <div class="trade-card-image">
        <img src="${item['Image URL']}" onerror="this.style.display='none'" />
      </div>
      <div class="trade-item-info">
        <div class="trade-item-name">${item.Name}</div>
        ${item.Demand ? `<div class="trade-item-demand">Demand: ${item.Demand}</div>` : ''}
        <div class="trade-item-value">${displayValue}</div>
        ${durabilityHTML}
      </div>
    </div>
  `;
}

// Calculate total value for a side
function calculateSideValue(items) {
  return items.reduce((total, item) => {
    let valueStr = item["Average Value"];
    let value = parseFloat(valueStr.replace(/[^0-9.]/g, '')) || 0;
    
    // Handle "k" suffix (250k = 250,000)
    if (valueStr.toLowerCase().includes('k')) {
      value *= 1000;
    }
    
    // Adjust for durability
    if (item.Durability && item.Durability.includes('/')) {
      const [current, max] = item.Durability.split('/').map(Number);
      value = (current / max) * value;
    }
    
    return total + value;
  }, 0);
}

// Update trade analysis
function updateTradeAnalysis() {
  const yourValue = calculateSideValue(tradeState.yourSide) + tradeState.yourMoney;
  const theirValue = calculateSideValue(tradeState.theirSide) + tradeState.theirMoney;
  
  // Update totals
  document.getElementById('your-total').textContent = `$${Math.round(yourValue).toLocaleString()}`;
  document.getElementById('their-total').textContent = `$${Math.round(theirValue).toLocaleString()}`;
  
  // Calculate verdict
  const verdictEl = document.getElementById('trade-verdict');
  const diff = Math.abs(yourValue - theirValue);
  const diffPercent = theirValue > 0 ? (diff / theirValue) * 100 : 0;
  
  if (yourValue === 0 && theirValue === 0) {
    verdictEl.innerHTML = 'Enter items to analyze the trade';
    verdictEl.className = 'trade-verdict';
  } else if (yourValue === 0 && theirValue > 0) {
    verdictEl.innerHTML = `🎉 You Win! They're giving you $${Math.round(theirValue).toLocaleString()}`;
    verdictEl.className = 'trade-verdict trade-win';
  } else if (theirValue === 0 && yourValue > 0) {
    verdictEl.innerHTML = `❌ You're giving them $${Math.round(yourValue).toLocaleString()} for free`;
    verdictEl.className = 'trade-verdict trade-loss';
  } else if (diffPercent < 5) {
    verdictEl.innerHTML = '✅ Fair Trade';
    verdictEl.className = 'trade-verdict trade-fair';
  } else if (yourValue > theirValue) {
    verdictEl.innerHTML = `❌ You Lose $${Math.round(diff).toLocaleString()}`;
    verdictEl.className = 'trade-verdict trade-loss';
  } else {
    verdictEl.innerHTML = `🎉 You Win by $${Math.round(diff).toLocaleString()}`;
    verdictEl.className = 'trade-verdict trade-win';
  }
  
  // Demand insight
  updateDemandInsight();
}

// Update demand insight
function updateDemandInsight() {
  const yourItems = tradeState.yourSide;
  const theirItems = tradeState.theirSide;
  
  if (yourItems.length === 0 && theirItems.length === 0) {
    document.getElementById('demand-insight').innerHTML = '';
    return;
  }
  
  const demandScore = {
    'Very High': 5,
    'High': 4,
    'Medium': 3,
    'Standard': 2,
    'Low': 1
  };
  
  const yourDemandTotal = yourItems.reduce((sum, item) => {
    const demand = item.Demand || 'Standard';
    return sum + (demandScore[demand] || 2);
  }, 0);
  
  const theirDemandTotal = theirItems.reduce((sum, item) => {
    const demand = item.Demand || 'Standard';
    return sum + (demandScore[demand] || 2);
  }, 0);
  
  const highYours = yourItems.filter(i => {
    const d = i.Demand || '';
    return d === 'Very High' || d === 'High';
  }).length;
  
  const highTheirs = theirItems.filter(i => {
    const d = i.Demand || '';
    return d === 'Very High' || d === 'High';
  }).length;
  
  let insight = '';
  
  if (yourDemandTotal > theirDemandTotal + 3) {
    insight = `📊 Your items have much better demand (${highYours} high-demand vs ${highTheirs})`;
  } else if (theirDemandTotal > yourDemandTotal + 3) {
    insight = `📊 Their items have much better demand (${highTheirs} high-demand vs ${highYours})`;
  } else if (yourDemandTotal > theirDemandTotal) {
    insight = `📊 Your items have slightly better demand`;
  } else if (theirDemandTotal > yourDemandTotal) {
    insight = `📊 Their items have slightly better demand`;
  } else {
    insight = `📊 Both sides have equal demand levels`;
  }
  
  document.getElementById('demand-insight').innerHTML = insight;
}

// ==================== TRADE CHECKER SECTION END ====================

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

    return items.filter(x => String(x["Name"] || x["Header"] || x["Roblox Name"] || "").trim().length > 0);
  } catch (err) {
    console.error(`Failed to fetch sheet: ${sheetName}`, err);
    return [];
  }
}

function createCard(item) {
  const name = safe(item["Name"]);
  const img = safe(item["Image URL"]);
  const demand = safe(item["Demand"]);
  const avg = safe(item["Average Value"]);
  const ranged = safe(item["Ranged Value"]);
  const afterTax = safe(item["After Tax Value"]);
  const durability = safe(item["Durability"]);

  // Check if durability is 0 to add broken overlay
  let imgTag = "";
  if (img) {
    const hasBrokenOverlay = durability && durability.includes('/') && parseInt(durability.split('/')[0]) === 0;
    
    if (hasBrokenOverlay) {
      imgTag = `
        <div class="img-container">
          <img src="${img}" alt="${name}" onerror="this.style.display='none'">
          <div class="broken-overlay"></div>
        </div>
      `;
    } else {
      imgTag = `<img src="${img}" alt="${name}" onerror="this.style.display='none'">`;
    }
  }

  let durabilityHTML = '';
  if (durability && durability.includes('/')) {
    const maxDurability = durability.split('/')[1] || "100";
    const currentDurability = durability.split('/')[0] || maxDurability;
    
    durabilityHTML = `
      <div class="durability-control">
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
            <button onmousedown="adjustDurability(this, 1)">▲</button>
            <button onmousedown="adjustDurability(this, -1)">▼</button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="card" data-name="${escapeAttr(name)}" 
         data-avg="${escapeAttr(avg)}" 
         data-ranged="${escapeAttr(ranged)}" 
         data-aftertax="${escapeAttr(afterTax)}"
         data-max-durability="${durability ? durability.split('/')[1] : '100'}">
      <div class="card-left">
        ${imgTag}
        ${durabilityHTML}
      </div>
      <div class="card-info">
        <h3>${name}</h3>
        ${demand ? `<span class="badge">Demand: ${demand}</span>` : ""}
        <div class="card-avg">Average Value: <span class="avg-value">${avg}</span></div>
        <div class="card-ranged">Ranged Value: <span class="ranged-value">${ranged}</span></div>
        <div class="card-aftertax">After Tax Value: <span class="aftertax-value">${afterTax}</span></div>
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

// ==================== GREEN LINE - BLOCKSPIN MAP FUNCTIONS START ====================

function renderBlockSpinMapSection() {
  const html = `
    <section class="section map-section" id="${slugify("BlockSpin Map")}">
      <h2>BlockSpin Map</h2>
      <p class="map-info-text">✨ Interactive map, some icons reveal more information when clicked !</p>
      <div class="map-container">
        <div class="map-image-container">
          <img id="base-map" src="${BASE_MAP_IMAGE}" alt="BlockSpin Map" />
          <div id="map-overlays"></div>
        </div>
      </div>
    </section>
  `;
  document.getElementById("sections").insertAdjacentHTML("beforeend", html);
}

function createMapControlsPanel() {
  const taxCalculator = document.querySelector('.tax-calculator');
  
  // Hide the tax calculator for map section
  if (taxCalculator) {
    taxCalculator.style.display = 'none';
  }
  
  // Remove existing map controls if any
  const existingMapControls = document.querySelector('.map-controls-panel');
  if (existingMapControls) {
    existingMapControls.remove();
  }
  
  // Create new map controls panel in the same position as tax calculator
  const controlsPanel = document.createElement('div');
  controlsPanel.className = 'map-controls-panel';
  controlsPanel.innerHTML = `
    <h2>Map Layers</h2>
    ${Object.keys(MAP_SECTIONS).map(section => 
      `<button class="map-control-btn" data-section="${section}">${section}</button>`
    ).join('')}
  `;
  
  // Insert where the tax calculator is
  const mainContainer = document.querySelector('.main-container');
  mainContainer.appendChild(controlsPanel);
  
  // Add event listeners
  document.querySelectorAll('.map-control-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleMapSection(btn.dataset.section, btn));
  });
}

function removeMapControlsPanel() {
  const mapControls = document.querySelector('.map-controls-panel');
  if (mapControls) {
    // Clear all overlays when leaving map section
    const overlaysContainer = document.getElementById('map-overlays');
    if (overlaysContainer) {
      overlaysContainer.innerHTML = '';
    }
    
    mapControls.remove();
  }
  
  // Show the tax calculator again
  const taxCalculator = document.querySelector('.tax-calculator');
  if (taxCalculator) {
    taxCalculator.style.display = 'block';
  }
}

function toggleMapSection(sectionName, button) {
  const overlaysContainer = document.getElementById('map-overlays');
  if (!overlaysContainer) {
    console.error('Map overlays container not found');
    return;
  }
  
  const existingItems = overlaysContainer.querySelectorAll(`[data-section="${sectionName}"]`);
  
  if (existingItems.length > 0) {
    // Hide section
    existingItems.forEach(item => item.remove());
    button.classList.remove('active');
  } else {
    // Show section
    showMapSection(sectionName);
    button.classList.add('active');
  }
}

function showMapSection(sectionName) {
  const overlaysContainer = document.getElementById('map-overlays');
  if (!overlaysContainer) {
    console.error('Map overlays container not found');
    return;
  }
  
  const sectionData = MAP_SECTIONS[sectionName];
  
  if (!sectionData || !sectionData.images) {
    console.error(`No data found for section: ${sectionName}`);
    return;
  }
  
  console.log(`Adding ${sectionData.images.length} images for ${sectionName}`);
  
  // Add images only (no text)
  sectionData.images.forEach(imageData => {
    const imageElement = document.createElement('img');
    imageElement.src = imageData.image;
    imageElement.className = 'map-image-overlay';
    imageElement.dataset.section = sectionName;
    imageElement.style.position = 'absolute';
    imageElement.style.top = imageData.top;
    imageElement.style.left = imageData.left;
    imageElement.style.width = imageData.width;
    imageElement.style.transform = 'translate(-50%, -50%)';
    
    if (imageData.detailImage) {
      imageElement.style.cursor = 'pointer';
      imageElement.addEventListener('click', () => showDetailModal(imageData.detailImage));
    }
    
    overlaysContainer.appendChild(imageElement);
  });
}

function showDetailModal(imageUrl) {
  const modal = document.createElement('div');
  modal.className = 'map-detail-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <img src="${imageUrl}" alt="Detail" />
      <button class="modal-back-btn" onclick="closeDetailModal()">← Back</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeDetailModal() {
  const modal = document.querySelector('.map-detail-modal');
  if (modal) modal.remove();
}

// ==================== GREEN LINE - BLOCKSPIN MAP FUNCTIONS END ====================

// === SECTION NAVIGATION ===
function initSectionsNav() {
  const nav = document.getElementById("sections-nav");
  
  SECTION_NAMES.forEach((name, index) => {
    // Add gap and "Extras" header before BlockSpin Map
    if (name === "Trade Checker") {
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

// === EXACT WORKING BANNER LOGIC FROM MAIN SITE ===
function showSection(name) {
  console.log(`Showing section: ${name}`);
  
    // Reset durability when switching sections
  document.querySelectorAll('.durability-input').forEach(input => {
    const card = input.closest('.card');
    const maxDurability = card.dataset.maxDurability;
    input.value = maxDurability;
    updateCardValues(input);
  });
  
    // Hide/show tax calculator based on section
  const taxCalc = document.querySelector('.tax-calculator');
  if (taxCalc) {
    const hiddenSections = ['Home', 'Crew Logos', 'Scammer List', 'Trade Checker', 'Crate Game'];
    if (hiddenSections.includes(name)) {
      taxCalc.style.visibility = 'hidden';
      taxCalc.style.opacity = '0';
    } else {
      taxCalc.style.visibility = 'visible';
      taxCalc.style.opacity = '1';
    }
  }

    
  // Hide/show search bar based on section
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer) {
    const hiddenSearchSections = ['Home', 'Trade Checker', 'BlockSpin Map', 'Crew Logos', 'Scammer List', 'Crate Game'];
    if (hiddenSearchSections.includes(name)) {
      searchContainer.style.cssText = 'visibility: hidden; height: 0; margin: 0;';
    } else {
      searchContainer.style.cssText = 'visibility: visible; height: auto; margin: 20px 0 !important; width: 100%; display: flex; justify-content: center; align-items: center;';
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

   // Handle Trade Checker
  if (name === "Trade Checker") {
    const tradeSection = document.getElementById(slugify("Trade Checker"));
    if (tradeSection && !tradeSection.querySelector('.trade-checker-container')) {
      tradeSection.innerHTML = '<div style="text-align: center; padding: 50px; color: #33cce6;">Loading Trade Checker...</div>';
      loadAllItemsForTradeChecker().then(() => {
        tradeSection.innerHTML = createTradeCheckerSection();
        setupTradeSearch();
      });
    }
  }

  // Banner logic - EXACT COPY FROM YOUR WORKING SITE
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
  const taxAmount = document.getElementById("tax-amount");
  
  if (!taxInput || !taxAmount) {
    console.log("Tax calculator elements not found");
    return;
  }

  taxInput.addEventListener("input", () => {
    const val = parseFloat(taxInput.value) || 0;
    const withdraw = Math.round(val / 0.72);
    taxAmount.textContent = withdraw.toLocaleString();
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

// === DURABILITY FUNCTIONS ===
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

function adjustDurability(btn, direction) {
  event.preventDefault(); // FIX: Prevent both touch and mouse events firing
  
  const card = btn.closest('.card');
  const input = card.querySelector('.durability-input');
  const maxDurability = parseInt(card.dataset.maxDurability);
  
  function adjust() {
    let newValue = parseInt(input.value) + direction;
    newValue = Math.max(0, Math.min(newValue, maxDurability));
    input.value = newValue;
    updateCardValues(input);
  }
  
  adjust();
  
  durabilityTimeout = setTimeout(() => {
    durabilityInterval = setInterval(adjust, 50);
  }, 200);
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
  const currentDurability = parseInt(input.value);
  const maxDurability = parseInt(card.dataset.maxDurability);
  
  const durabilityPercent = currentDurability / maxDurability;
  
  const originalAvg = card.dataset.avg;
  const originalRanged = card.dataset.ranged;
  const originalAfterTax = card.dataset.aftertax;
  
  card.querySelector('.avg-value').textContent = calculateDurabilityValue(originalAvg, durabilityPercent);
  card.querySelector('.ranged-value').textContent = calculateDurabilityValue(originalRanged, durabilityPercent);
  card.querySelector('.aftertax-value').textContent = calculateDurabilityValue(originalAfterTax, durabilityPercent);
}

function calculateDurabilityValue(originalValue, durabilityPercent) {
  if (!originalValue || originalValue === '' || originalValue === 'N/A' || originalValue === '-') {
    return originalValue || 'N/A';
  }
  
  // New formula: 20% floor + 80% scaled by durability
  const valueMultiplier = 0.20 + (0.80 * durabilityPercent);
  
  // Handle range format (works for both "Ranged Value" AND "After Tax Value")
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
    // Original was in millions
    const m = num / 1000000;
    return '$' + m.toFixed(1).replace('.0', '') + 'm';
  } else if (wasK) {
    // Original was in thousands
    const k = num / 1000;
    return '$' + k.toFixed(1).replace('.0', '') + 'k';
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

// === HELPERS ===
function safe(str) { return str ?? ""; }
function escapeAttr(str) { return (str+"").replace(/"/g, "&quot;"); }
function slugify(str) { return str.toLowerCase().replace(/\s+/g, "-"); }

// === INIT - PARALLEL LOADING FOR SPEED ===
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

  
 
  
  initSectionsNav();
  initSearch();
  initTaxCalculator();

  const totalSections = SECTION_NAMES.length;
  let loadedSections = 0;

  // Fetch all sections at once (parallel)
  const fetchPromises = SECTION_NAMES.map(async (sec) => {
   
    console.log(`Fetching data for: ${sec}`);
    const items = await fetchSheet(sec);
    console.log(`Got ${items.length} items for ${sec}`);
    
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

  
  showSection("Home");
  sectionsContainer.classList.add("loaded");
  
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
  }, 300);

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