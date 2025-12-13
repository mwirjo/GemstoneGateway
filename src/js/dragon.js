// 🐉 dragon.js - 100% COMPLETE WITH COLLECTION STATS!
import { getPlayer, addGems, initPlayerHeader } from "./playerLoader.js";

let dragonImages = {};
let dragonsData = [];
let wyrmlingData = [];
let youngData = [];
let ownedDragons = JSON.parse(localStorage.getItem("ownedDragons")) || [];
let totalSummons = 0;
let hasHatchedFree = localStorage.getItem("hasHatchedFree") === "true";

document.addEventListener("DOMContentLoaded", async () => {
  initPlayerHeader();
  await Promise.all([loadDragonImages(), fetchDragonsList()]);
  fetchWyrmlings();
  fetchYoungDragons();
  initOwnedDragons();
  updateDragonProgress();
  updateQuickStats();

  document.getElementById("generateBtn")?.addEventListener("click", generateRandomStatBlock);
  document.getElementById("devResetLevel")?.addEventListener("click", resetPlayerLevel);
  document.getElementById("dragonFilter")?.addEventListener("change", filterDragons);
  document.getElementById("applyNameBtn")?.addEventListener("click", applyCustomName);
  document.getElementById("resetAllBtn")?.addEventListener("click", resetAllDragonData);

});

// DATA LOADING
async function loadDragonImages() {
  try {
    const response = await fetch("/json/dragonImages.json");
    dragonImages = await response.json();
    const normalized = {};
    for (const key in dragonImages) normalized[key.toLowerCase()] = dragonImages[key];
    dragonImages = normalized;
  } catch (error) {
    console.error("❌ Failed to load dragonImages.json", error);
  }
}

async function fetchDragonsList() {
  try {
    const res = await fetch("https://www.dnd5eapi.co/api/monsters");
    const data = await res.json();
    dragonsData = data.results.filter(m => m.name.toLowerCase().includes("dragon"));
  } catch (error) {
    console.error("❌ Monster list fetch failed", error);
  }
}

function fetchWyrmlings() {
  wyrmlingData = dragonsData.filter(m => m.name.toLowerCase().includes("wyrmling"));
}

function fetchYoungDragons() {
  youngData = dragonsData.filter(m => m.name.toLowerCase().includes("young") && !m.name.toLowerCase().includes("wyrmling"));
}

// COLLECTION SYSTEM - FULL STATS FOR ALL!
function initOwnedDragons() {
  showOwnedCollection();
}

async function showOwnedCollection() {
  const player = getPlayer();
  const ownedContent = document.getElementById("ownedDragonContent");
  if (!ownedContent) return;

  if (player?.dragonLevel > 0 && player.dragonId) {
    await showOwnedDragonStats();
    return;
  }

  ownedContent.innerHTML = `
    <div class="owned-dragons-section">
      <h3>🐉 Dragon Collection (${ownedDragons.length})</h3>
      <div class="collection-grid" id="dragonGrid">
        ${ownedDragons.map((dragon, index) => `
          <div class="collection-dragon" data-dragon-id="${dragon.id}" data-index="${index}">
            <img src="${getDragonImage(dragon.name)}" alt="${dragon.name}">
            <div class="dragon-info">
              <strong>${dragon.name}</strong><br>
              <small>Lvl ${dragon.level} | ${dragon.date}</small>
            </div>
            <button class="stats-btn" data-dragon-id="${dragon.id}">📊 Stats</button>
          </div>
        `).join("")}
      </div>
      
      <div class="dragon-actions">
        <button id="hatchBtn" class="hatch-btn">
          🥚 Hatch Wyrmling ${hasHatchedFree ? "(10 Gems)" : "(FREE FIRST!)"}
        </button>
      </div>
      <button id="resetAllBtn" class="reset-all-btn" style="margin-left:10px;">💥 Reset All</button>
    </div>
  `;

  // ADD STATS BUTTON EVENT LISTENERS
  document.querySelectorAll(".stats-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const dragonId = e.target.dataset.dragonId;
      await showDragonStats(dragonId);
    });
  });

  document.getElementById("hatchBtn")?.addEventListener("click", hatchDragon);
}

// SHOW STATS FOR ANY COLLECTION DRAGON
async function showDragonStats(dragonId) {
  const ownedContent = document.getElementById("ownedDragonContent");
  if (!ownedContent) return;

  ownedContent.innerHTML = "<p>📊 Loading dragon stats...</p>";

  try {
    const res = await fetch(`https://www.dnd5eapi.co${dragonId}`);
    const dragon = await res.json();

    const img = getDragonImage(dragon.name);
    const ac = Array.isArray(dragon.armor_class) ? dragon.armor_class[0].value : dragon.armor_class;
    const player = getPlayer();

    ownedContent.innerHTML = `
      <div class="dragon-stat-bar">
        <div class="dragon-avatar">
          <img src="${img}" alt="Dragon">
          <span class="collection-badge">📜 Collection Dragon</span>
        </div>
        <h3>🐲 ${dragon.name}</h3>
        <div class="dragon-stats">
          <p><strong>Size:</strong> ${dragon.size}</p>
          <p><strong>AC:</strong> ${ac}</p>
          <p><strong>HP:</strong> ${dragon.hit_points}</p>
          <p><strong>Speed:</strong> ${Object.entries(dragon.speed || {}).map(([k,v])=>`${k} ${v}ft.`).join(", ")}</p>
        </div>
        <div class="abilities">
          <div>STR ${dragon.strength} (${calculateModifier(dragon.strength)})</div>
          <div>DEX ${dragon.dexterity} (${calculateModifier(dragon.dexterity)})</div>
          <div>CON ${dragon.constitution} (${calculateModifier(dragon.constitution)})</div>
          <div>INT ${dragon.intelligence} (${calculateModifier(dragon.intelligence)})</div>
          <div>WIS ${dragon.wisdom} (${calculateModifier(dragon.wisdom)})</div>
          <div>CHA ${dragon.charisma} (${calculateModifier(dragon.charisma)})</div>
        </div>
        <div class="dragon-actions">
          <button id="backBtn" class="back-btn">⬅️ Back to Collection</button>
          ${player?.dragonId === dragonId ? `
            <button id="feedBtn" class="feed-btn">🍖 Feed (5 Gems)</button>
            <button id="resetBtn" class="reset-btn">🗑️ Reset Active</button>
          ` : ""}
        </div>
      </div>
    `;

    document.getElementById("backBtn")?.addEventListener("click", showOwnedCollection);
    if (player?.dragonId === dragonId) {
      document.getElementById("feedBtn")?.addEventListener("click", () => feedDragonHandler(5));
      document.getElementById("resetBtn")?.addEventListener("click", resetWyrmling);
    }
  } catch (e) {
    ownedContent.innerHTML = "<p>Error loading stats</p>";
  }
}

// ACTIVE DRAGON STATS
async function showOwnedDragonStats() {
  const player = getPlayer();
  const ownedContent = document.getElementById("ownedDragonContent");
  if (!ownedContent || !player?.dragonId) return;

  ownedContent.innerHTML = "<p>Loading stats...</p>";

  try {
    const res = await fetch(`https://www.dnd5eapi.co${player.dragonId}`);
    const dragon = await res.json();

    const img = getDragonImage(dragon.name);
    const ac = Array.isArray(dragon.armor_class) ? dragon.armor_class[0].value : dragon.armor_class;
    const nextLevelXp = getXpForLevel(player.dragonLevel + 1);
    const xpPercent = Math.min((player.dragonExperience / nextLevelXp) * 100, 100);

    ownedContent.innerHTML = `
      <div class="dragon-stat-bar">
        <div class="dragon-avatar">
          <img src="${img}" alt="Dragon">
          <span class="growth-badge">${player.dragonLevel >= 5 ? "🧒 Young" : "🥚 Wyrmling"}</span>
        </div>
        <h3>🐲 ${player.dragonName} (Lvl ${player.dragonLevel})</h3>
        <div class="xp-bar">
          <span>${player.dragonExperience}/${nextLevelXp} XP</span>
          <div class="xp-progress"><div class="xp-fill" style="width: ${xpPercent}%"></div></div>
        </div>
        <div class="dragon-stats">
          <p><strong>Size:</strong> ${dragon.size}</p>
          <p><strong>AC:</strong> ${ac}</p>
          <p><strong>HP:</strong> ${dragon.hit_points}</p>
          <p><strong>Speed:</strong> ${Object.entries(dragon.speed || {}).map(([k,v])=>`${k} ${v}ft.`).join(", ")}</p>
        </div>
        <div class="abilities">
          <div>STR ${dragon.strength} (${calculateModifier(dragon.strength)})</div>
          <div>DEX ${dragon.dexterity} (${calculateModifier(dragon.dexterity)})</div>
          <div>CON ${dragon.constitution} (${calculateModifier(dragon.constitution)})</div>
          <div>INT ${dragon.intelligence} (${calculateModifier(dragon.intelligence)})</div>
          <div>WIS ${dragon.wisdom} (${calculateModifier(dragon.wisdom)})</div>
          <div>CHA ${dragon.charisma} (${calculateModifier(dragon.charisma)})</div>
        </div>
        <div class="dragon-actions">
          <button id="feedBtn" class="feed-btn">🍖 Feed (5 Gems)</button>
          <button id="resetBtn" class="reset-btn">🗑️ Reset</button>
          <button id="collectionBtn" class="collection-btn">📜 Collection</button>
        </div>
      </div>
    `;

    setTimeout(() => {
      document.getElementById("feedBtn")?.addEventListener("click", () => feedDragonHandler(5));
      document.getElementById("resetBtn")?.addEventListener("click", resetWyrmling);
      document.getElementById("collectionBtn")?.addEventListener("click", showOwnedCollection);
    }, 100);
  } catch (e) {
    ownedContent.innerHTML = "<p>Error loading stats</p>";
  }
}

// HATCHING SYSTEM
async function hatchDragon() {
  const player = getPlayer();
  if (!player || player.dragonLevel > 0) {
    alert("Already have active dragon!");
    return;
  }

  const cost = hasHatchedFree ? 10 : 0;
  if (cost > 0 && player.gems < cost) {
    alert(`Need ${cost} gems! (have ${player.gems})`);
    return;
  }

  const ownedContent = document.getElementById("ownedDragonContent");
  ownedContent.innerHTML = "<p>🥚 Hatching...</p>";

  if (wyrmlingData.length === 0) {
    fetchWyrmlings();
    if (wyrmlingData.length === 0) return ownedContent.innerHTML = "<p>No wyrmlings!</p>";
  }

  const randomWyrmling = wyrmlingData[Math.floor(Math.random() * wyrmlingData.length)];
  try {
    const res = await fetch(`https://www.dnd5eapi.co${randomWyrmling.url}`);
    const wyrmling = await res.json();

    // ✅ FIXED - Use Player class methods (AUTO-SAVES!)
    if (cost > 0 && !player.spendGems(cost)) {
      return alert("Not enough gems!");
    }
    
    player.setActiveDragon(randomWyrmling.url, wyrmling.name, 1, 0);

    ownedDragons.push({
      id: randomWyrmling.url,
      name: wyrmling.name,
      level: 1,
      date: new Date().toISOString().split("T")[0]
    });
    localStorage.setItem("ownedDragons", JSON.stringify(ownedDragons));

    if (!hasHatchedFree) {
      hasHatchedFree = true;
      localStorage.setItem("hasHatchedFree", "true");
    }

    checkAndNameDragon(wyrmling);
    showOwnedDragonStats();
    updateDragonProgress();

    const costText = cost > 0 ? `(-${cost} gems)` : "(FREE!)";
    alert(`🥚 ${wyrmling.name} hatched! ${costText}\n📜 Added to collection!`);
  } catch (error) {
    console.error("Hatch failed:", error);
    ownedContent.innerHTML = "<p>Error hatching. Try again!</p>";
  }
}

// GROWTH SYSTEM
async function feedDragonHandler(gemCost = 5) {
  const player = getPlayer();
  if (!player || player.gems < gemCost) {
    alert(`Need ${gemCost} gems! (have ${player?.gems || 0})`);
    return;
  }

  if (player.spendGems(gemCost)) {
    player.addDragonXP(25);
  }

  const xpForNextLevel = getXpForLevel(player.dragonLevel + 1);
  if (player.dragonExperience >= xpForNextLevel) {
    await levelUpDragon(player);
  } else {
    const ownedIndex = ownedDragons.findIndex(d => d.id === player.dragonId);
    if (ownedIndex !== -1) {
      ownedDragons[ownedIndex].level = player.dragonLevel;
      localStorage.setItem("ownedDragons", JSON.stringify(ownedDragons));
    }
    showOwnedDragonStats();
    updateDragonProgress();
    alert(`🍖 +25 XP (${player.dragonExperience}/${xpForNextLevel})`);
  }
}

async function levelUpDragon(player) {
  player.dragonLevel += 1;
  
  const ownedIndex = ownedDragons.findIndex(d => d.id === player.dragonId);
  if (ownedIndex !== -1) {
    ownedDragons[ownedIndex].level = player.dragonLevel;
    localStorage.setItem("ownedDragons", JSON.stringify(ownedDragons));
  }

  if (player.dragonLevel === 5 && youngData.length > 0) {
    const currentColor = getDragonColor(player.dragonName);
    if (currentColor) {
      const matchingYoung = youngData.find(d => 
        d.name.toLowerCase().includes(currentColor.toLowerCase()) && 
        d.name.toLowerCase().includes("young")
      );
      if (matchingYoung) {
        try {
          const res = await fetch(`https://www.dnd5eapi.co${matchingYoung.url}`);
          const youngDragon = await res.json();
          
          player.dragonId = matchingYoung.url;
          player.dragonName = youngDragon.name;
          player.dragonExperience = 0;
          
          if (ownedIndex !== -1) {
            ownedDragons[ownedIndex].id = matchingYoung.url;
            ownedDragons[ownedIndex].name = youngDragon.name;
            ownedDragons[ownedIndex].level = player.dragonLevel;
            localStorage.setItem("ownedDragons", JSON.stringify(ownedDragons));
          }
          
          showOwnedDragonStats();
          alert(`🐲 METAMORPHOSIS! ${youngDragon.name.toUpperCase()}!`);
          return;
        } catch (e) {
          console.error("Metamorphosis failed:", e);
        }
      }
    }
  }

  player.dragonExperience = 0;
  showOwnedDragonStats();
  updateDragonProgress();
  alert(`🎉 Level ${player.dragonLevel}!`);
}

// SUMMONING
async function generateRandomStatBlock() {
  const container = document.getElementById("statBlockDetails");
  if (!container || dragonsData.length === 0) {
    await fetchDragonsList();
    return;
  }

  container.innerHTML = "<p>Summoning...</p>";
  const random = dragonsData[Math.floor(Math.random() * dragonsData.length)];

  try {
    const res = await fetch(`https://www.dnd5eapi.co${random.url}`);
    const monster = await res.json();
    const givenInput = document.getElementById("givename");
    const customName = (givenInput?.value.trim()) || monster.name;
    const img = getDragonImage(monster.name);
    
    ownedDragons.push({
      id: random.url,
      name: customName,
      level: 0,
      date: new Date().toISOString().split("T")[0]
    });
    localStorage.setItem("ownedDragons", JSON.stringify(ownedDragons));

    container.innerHTML = renderStatBlock(monster, customName, monster.name, img);
    totalSummons++;
    localStorage.setItem("dragonSummons", totalSummons);
    updateQuickStats();
    showOwnedCollection();
    
    alert(`🐉 ${customName} summoned!\n📜 Added to collection (${ownedDragons.length} total)`);
  } catch (error) {
    console.error("Summon failed:", error);
    container.innerHTML = "<p>Error summoning dragon.</p>";
  }
}

// UTILITIES
function getXpForLevel(level) {
  const xpTable = {1:100,2:200,3:350,4:550,5:800,6:1100,7:1500,8:2000,9:2600,10:3300};
  return xpTable[level] || (800 + (level - 5) * 400);
}

function getDragonColor(name) {
  const colors = ["black","blue","green","red","white","brass","bronze","copper","gold","silver"];
  return colors.find(c => name.toLowerCase().includes(c))?.toUpperCase() || null;
}

function getDragonImage(name) {
  return dragonImages[name.toLowerCase().trim()] || "https://via.placeholder.com/120x120/666/fff?text=🐲";
}

function calculateModifier(score) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function checkAndNameDragon(dragon) {
  const player = getPlayer();
  if (!player || player.dragonLevel === 0) return;

  const dragonColor = getDragonColor(dragon.name);
  const suggestedName = dragonColor ? `${dragonColor} the ${dragonColor} Wyrmling` : dragon.name;

  const newName = prompt(`Name your ${dragon.name}?`, suggestedName);
  if (newName?.trim()) {
    player.dragonName = newName.trim();
  player._autoSave();  // Force save
    const ownedIndex = ownedDragons.findIndex(d => d.id === player.dragonId);
    if (ownedIndex !== -1) {
      ownedDragons[ownedIndex].name = player.dragonName;
      localStorage.setItem("ownedDragons", JSON.stringify(ownedDragons));
    }
    showOwnedDragonStats();
  }
}

function resetWyrmling() {
  if (!confirm("Delete active dragon?")) return;
  const player = getPlayer();
  if (!player) return;
  
  player.resetDragon();  // ✅ AUTO-SAVES!
  updateQuickStats();
  showOwnedCollection();
  updateDragonProgress();
  alert("Active dragon reset!");
}

function updateDragonProgress() {
  const player = getPlayer();
  const progressBar = document.querySelector(".dragon-progress-bar");  // ✅ CLASS SELECTOR
  const xpText = document.getElementById("dragon-xp");
  
  if (!progressBar || !xpText || !player?.dragonLevel) return;
  
  const currentXP = player.dragonExperience || 0;
  const nextLevelXP = getXpForLevel(player.dragonLevel + 1);
  const percent = Math.min((currentXP / nextLevelXP) * 100, 100);
  
  // ✅ TRIPLE UPDATE for Netlify
  progressBar.style.width = `${percent}%`;
  progressBar.style.setProperty("width", `${percent}%`, "important");
  
  xpText.textContent = `${currentXP}/${nextLevelXP} XP`;
}


function updateQuickStats() {
  const totalSummonsEl = document.getElementById("totalSummons");
  const ownedDragonsEl = document.getElementById("ownedDragonsCount");  // ✅ NEW
  const activeLevelEl = document.getElementById("activeDragonLevel");    // ✅ NEW
  
  // Total Summons
  if (totalSummonsEl) {
    totalSummons = parseInt(localStorage.getItem("dragonSummons")) || 0;
    totalSummonsEl.textContent = totalSummons;
  }
  
  // Owned Dragons Count
  if (ownedDragonsEl) {
    const owned = JSON.parse(localStorage.getItem("ownedDragons") || "[]");
    ownedDragonsEl.textContent = owned.length;
  }
  
  // Active Dragon Level
  if (activeLevelEl) {
    const player = getPlayer();
    activeLevelEl.textContent = player?.dragonLevel > 0 ? player.dragonLevel : 0;
  }
}


function filterDragons() {
  const filter = document.getElementById("dragonFilter")?.value;
  let filteredData = dragonsData;
  
  if (filter === "wyrmling") filteredData = wyrmlingData;
  else if (filter === "adult") filteredData = dragonsData.filter(m => 
    m.name.toLowerCase().includes("adult") && !m.name.toLowerCase().includes("wyrmling"));
  else if (filter === "ancient") filteredData = dragonsData.filter(m => 
    m.name.toLowerCase().includes("ancient"));
  
  dragonsData = filteredData;
}

function applyCustomName() {
  const input = document.getElementById("givename");
  if (!input?.value.trim()) return;
  generateRandomStatBlock();
}

function getArmorClass(armor_class) {
  if (Array.isArray(armor_class)) return armor_class[0]?.value || "—";
  return armor_class || "—";
}

function getSpeedString(speed) {
  if (!speed) return "—";
  return Object.entries(speed).map(([k,v]) => `${k} ${v} ft.`).join(", ");
}

function renderStatBlock(m, name, type, imageUrl) {
  const renderActions = arr => (arr || []).slice(0,5).map(a => 
    `<div><strong>${a.name}:</strong> ${a.desc}</div>`).join("");
  const formatProficiencies = (prof, t) => (prof || [])
    .filter(p => p.proficiency.name.includes(t))
    .map(p => `${p.proficiency.name.split(": ")[1]} ${calculateModifier(p.value)}`)
    .join(", ") || "—";

  return `
    <div class="stat-block">
      <div class="stat-block-header">
        <img src="${imageUrl}" class="dragon-image" alt="Dragon">
        <div class="stat-block-title">
          <h1>${name}</h1>
          <p>Type: ${type}</p>
        </div>
      </div>
      <div class="stat-block-stats">
        <p><strong>AC:</strong> ${getArmorClass(m.armor_class)}</p>
        <p><strong>HP:</strong> ${m.hit_points || "—"} (${m.hit_dice || "—"})</p>
        <p><strong>Speed:</strong> ${getSpeedString(m.speed)}</p>
      </div>
      <div class="abilities">
        <div><strong>STR</strong> ${m.strength} (${calculateModifier(m.strength)})</div>
        <div><strong>DEX</strong> ${m.dexterity} (${calculateModifier(m.dexterity)})</div>
        <div><strong>CON</strong> ${m.constitution} (${calculateModifier(m.constitution)})</div>
        <div><strong>INT</strong> ${m.intelligence} (${calculateModifier(m.intelligence)})</div>
        <div><strong>WIS</strong> ${m.wisdom} (${calculateModifier(m.wisdom)})</div>
        <div><strong>CHA</strong> ${m.charisma} (${calculateModifier(m.charisma)})</div>
      </div>
      <div class="stat-block-proficiencies">
        <p><strong>Saving Throws:</strong> ${formatProficiencies(m.proficiencies,"Saving Throw")}</p>
        <p><strong>Skills:</strong> ${formatProficiencies(m.proficiencies,"Skill")}</p>
      </div>
      ${m.actions?.length ? `<h2>Actions</h2><div class="actions">${renderActions(m.actions)}</div>` : ""}
      ${m.legendary_actions ? `<h2>Legendary Actions</h2><div class="actions">${renderActions(m.legendary_actions)}</div>` : ""}
    </div>
  `;
}

function resetPlayerLevel() {
  if (!confirm("Reset dragon level?")) return;
  const player = getPlayer();
  if (!player) return;

  player.resetDragon();  // ✅ Use Player method!

  showOwnedCollection();
  updateDragonProgress();
}

function resetAllDragonData() {
  if (!confirm("⚠️ DELETE ALL DRAGON DATA?\n\n• Collection dragons\n• Active dragon\n• Summon count\n• Free hatch\n\nGems/username preserved")) return;

  const player = getPlayer();
  if (player) {
    player.dragonLevel = 0;
    player.dragonName = null;
    player.dragonId = null;
    player.dragonExperience = 0;
  }

  ownedDragons = [];
  localStorage.removeItem("ownedDragons");
  localStorage.removeItem("dragonSummons");
  localStorage.removeItem("hasHatchedFree");
  hasHatchedFree = false;
  totalSummons = 0;

  showOwnedCollection();
  updateDragonProgress();
  updateQuickStats();
  alert("✅ ALL DRAGON DATA DELETED!");
}

