// dragon.js - COMPLETE GROWTH SYSTEM (ALL ERRORS FIXED!)
import { getPlayer, updateHeader, feedDragon, savePlayer } from "./playerLoader.js";

let dragonImages = {};
let dragonsData = [];
let wyrmlingData = [];
let youngData = [];
let totalSummons = 0;

document.addEventListener("DOMContentLoaded", async () => {
  const user = getPlayer();
  if (user) updateHeader(user);

  await Promise.all([loadDragonImages(), fetchDragonsList()]);
  fetchWyrmlings();
  fetchYoungDragons();
  initOwnedDragons();
  updateDragonProgress();
  updateQuickStats();

  // ✅ FIXED: Safe event listeners
  document.getElementById("generateBtn")?.addEventListener("click", generateRandomStatBlock);
  document.getElementById("devResetLevel")?.addEventListener("click", resetPlayerLevel);
  document.getElementById("dragonFilter")?.addEventListener("change", filterDragons);
  document.getElementById("applyNameBtn")?.addEventListener("click", applyCustomName);
});

// -------------------------------------------------
// ALL REQUIRED FUNCTIONS (No more red!)
// -------------------------------------------------
async function loadDragonImages() {
  try {
    const response = await fetch("/json/dragonImages.json");
    dragonImages = await response.json();
    const normalized = {};
    for (const key in dragonImages) {
      normalized[key.toLowerCase()] = dragonImages[key];
    }
    dragonImages = normalized;
    console.log("🖼 Loaded dragonImages:", Object.keys(dragonImages));
  } catch (error) {
    console.error("❌ Failed to load dragonImages.json", error);
  }
}

async function fetchDragonsList() {
  try {
    const res = await fetch("https://www.dnd5eapi.co/api/monsters");
    const data = await res.json();
    dragonsData = data.results.filter(m => m.name.toLowerCase().includes("dragon"));
    console.log("🐉 Dragons found:", dragonsData.length);
  } catch (error) {
    console.error("❌ Monster list fetch failed", error);
  }
}

function fetchWyrmlings() {
  wyrmlingData = dragonsData.filter(m => m.name.toLowerCase().includes("wyrmling"));
  console.log("🥚 Wyrmlings found:", wyrmlingData.length);
}

function fetchYoungDragons() {
  youngData = dragonsData.filter(m =>
    m.name.toLowerCase().includes("young") && 
    !m.name.toLowerCase().includes("wyrmling")
  );
  console.log("🧒 Young dragons found:", youngData.length);
}

function initOwnedDragons() {
  const ownedContent = document.getElementById("ownedDragonContent");
  const player = getPlayer();

  if (!ownedContent) return;

  if (!player || player.dragonLevel === 0 || !player.dragonId) {
    ownedContent.innerHTML = `
      <div class="no-dragon-placeholder">
        <div class="egg-animation">🥚</div>
        <p class="no-dragon-text">No dragons owned yet.</p>
        <p><strong>Hatch your first wyrmling companion!</strong></p>
        <button id="hatchDragon" class="hatch-btn">🥚 Hatch Wyrmling</button>
      </div>
    `;
    document.getElementById("hatchDragon")?.addEventListener("click", hatchDragon);
  } else {
    showOwnedDragonStats();
  }
}

async function hatchDragon() {
  const player = getPlayer();
  if (!player || player.dragonLevel > 0) return;

  const ownedContent = document.getElementById("ownedDragonContent");
  if (!ownedContent) return;

  ownedContent.innerHTML = "<p>Hatching your wyrmling... ✨</p>";

  if (wyrmlingData.length === 0) {
    fetchWyrmlings();
    if (wyrmlingData.length === 0) {
      ownedContent.innerHTML = "<p>No wyrmlings available!</p>";
      return;
    }
  }

  const randomWyrmling = wyrmlingData[Math.floor(Math.random() * wyrmlingData.length)];

  try {
    const res = await fetch(`https://www.dnd5eapi.co${randomWyrmling.url}`);
    const wyrmling = await res.json();

    player.dragonLevel = 1;
    player.dragonId = randomWyrmling.url;
    player.dragonName = wyrmling.name;
    player.dragonExperience = 0;
    player.gems = (player.gems || 0) + 10;
    savePlayer(player);

    checkAndNameDragon(wyrmling);
    await showOwnedDragonStats();
    updateDragonProgress();

    alert(`🥚 Your ${wyrmling.name} wyrmling has hatched! Level 1\n💎 +10 bonus gems!`);
  } catch (error) {
    console.error("Hatch failed:", error);
    ownedContent.innerHTML = "<p>Error hatching. Try again!</p>";
  }
}

function checkAndNameDragon(dragon) {
  const player = getPlayer();
  if (!player || !dragon || player.dragonLevel === 0) return;

  const dragonTypeName = dragon.name;
  const isCustomNamed =
    player.dragonName &&
    player.dragonName !== dragonTypeName &&
    !player.dragonName.includes("Wyrmling") &&
    !player.dragonName.includes("Dragon");

  if (isCustomNamed) return;

  const dragonColor = getDragonColor(dragon.name);
  const suggestedName = dragonColor ? 
    `${dragonColor} the ${dragonColor} Wyrmling` : 
    dragonTypeName.split(" ")[0] + " the Wyrmling";

  const newName = prompt(
    `Name your ${dragonTypeName}? (Leave blank to keep "${dragonTypeName}")`,
    suggestedName
  );

  if (newName && newName.trim()) {
    player.dragonName = newName.trim();
  } else {
    player.dragonName = dragonTypeName;
  }
  savePlayer(player);
}

async function feedDragonHandler(gemCost = 5) {
  const player = getPlayer();
  if (!player) return;

  if (player.gems < gemCost) {
    alert(`💎 Not enough gems! Need ${gemCost} (have ${player.gems})`);
    return;
  }

  player.gems -= gemCost;
  player.dragonExperience = (player.dragonExperience || 0) + 25;

  const xpForNextLevel = getXpForLevel(player.dragonLevel + 1);
  if (player.dragonExperience >= xpForNextLevel) {
    await levelUpDragon(player);
  } else {
    savePlayer(player);
    updateDragonProgress();
    showOwnedDragonStats();
    alert(`🍖 Fed! +25 XP (${player.dragonExperience}/${xpForNextLevel})`);
  }
}

async function levelUpDragon(player) {
  player.dragonLevel += 1;

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
          
          savePlayer(player);
          await showOwnedDragonStats();
          updateDragonProgress();
          
          alert(`🐲 METAMORPHOSIS COMPLETE!\nYour ${currentColor} Wyrmling → ${youngDragon.name.toUpperCase()}! Level ${player.dragonLevel}`);
          return;
        } catch (e) {
          console.error("Color upgrade failed:", e);
        }
      }
    }
  }

  player.dragonExperience = 0;
  savePlayer(player);
  updateDragonProgress();
  showOwnedDragonStats();
  alert(`🎉 Level Up! ${player.dragonName} is now Level ${player.dragonLevel}!`);
}

function getXpForLevel(level) {
  const xpTable = {
    1: 100, 2: 200, 3: 350, 4: 550, 5: 800, 
    6: 1100, 7: 1500, 8: 2000, 9: 2600, 10: 3300
  };
  return xpTable[level] || (800 + (level - 5) * 400);
}

function getDragonColor(dragonName) {
  const colorKeywords = ['black', 'blue', 'green', 'red', 'white', 'brass', 'bronze', 'copper', 'gold', 'silver'];
  const lowerName = dragonName.toLowerCase();
  for (const color of colorKeywords) {
    if (lowerName.includes(color)) {
      return color.charAt(0).toUpperCase() + color.slice(1);
    }
  }
  return null;
}

function resetWyrmling() {
  if (!confirm("🗑️ Delete your dragon and reset to level 0? (Dev only)")) return;
  const player = getPlayer();
  if (!player) return;

  player.dragonLevel = 0;
  player.dragonName = null;
  player.dragonId = null;
  player.dragonExperience = 0;

  savePlayer(player);
  initOwnedDragons();
  updateDragonProgress();
  alert("🗑️ Dragon deleted! Back to level 0. Hatch a new one!");
}

async function showOwnedDragonStats() {
  const player = getPlayer();
  const ownedContent = document.getElementById("ownedDragonContent");
  if (!ownedContent || !player?.dragonId) {
    initOwnedDragons();
    return;
  }

  ownedContent.innerHTML = "<p>Loading dragon stats...</p>";

  try {
    const res = await fetch(`https://www.dnd5eapi.co${player.dragonId}`);
    const dragon = await res.json();

    const img = getDragonImage(dragon.name);
    const ac = Array.isArray(dragon.armor_class) ? dragon.armor_class[0].value : dragon.armor_class;
    const nextLevelXp = getXpForLevel(player.dragonLevel + 1);
    const growthStage = player.dragonLevel >= 5 ? "🧒 Young Dragon" : "🥚 Wyrmling";
    const xpPercent = Math.min((player.dragonExperience / nextLevelXp) * 100, 100);

    ownedContent.innerHTML = `
      <div class="dragon-stat-bar">
        <div class="dragon-avatar">
          <img src="${img}" alt="Dragon">
          <span class="growth-badge">${growthStage}</span>
        </div>
        <h3>🐲 ${player.dragonName} (Lvl ${player.dragonLevel})</h3>
        <div class="xp-bar">
          <span>${player.dragonExperience} / ${nextLevelXp} XP</span>
          <div class="xp-progress">
            <div class="xp-fill" style="width: ${xpPercent}%"></div>
          </div>
        </div>
        <div class="dragon-stats">
          <p><strong>Size:</strong> ${dragon.size} dragon</p>
          <p><strong>AC:</strong> ${ac}</p>
          <p><strong>HP:</strong> ${dragon.hit_points} (${dragon.hit_dice})</p>
          <p><strong>Speed:</strong> ${Object.entries(dragon.speed || {}).map(([k,v])=>`${k} ${v} ft.`).join(", ")}</p>
        </div>
        <div class="abilities">
          <div><strong>STR</strong><br>${dragon.strength} (${calculateModifier(dragon.strength)})</div>
          <div><strong>DEX</strong><br>${dragon.dexterity} (${calculateModifier(dragon.dexterity)})</div>
          <div><strong>CON</strong><br>${dragon.constitution} (${calculateModifier(dragon.constitution)})</div>
          <div><strong>INT</strong><br>${dragon.intelligence} (${calculateModifier(dragon.intelligence)})</div>
          <div><strong>WIS</strong><br>${dragon.wisdom} (${calculateModifier(dragon.wisdom)})</div>
          <div><strong>CHA</strong><br>${dragon.charisma} (${calculateModifier(dragon.charisma)})</div>
        </div>
        <p class="challenge"><strong>Challenge:</strong> ${dragon.challenge_rating}</p>
        ${dragon.actions?.length ? `
          <details class="dragon-actions">
            <summary>⚔️ Actions</summary>
            <div>${dragon.actions.slice(0,3).map(a=>`<div><strong>${a.name}:</strong> ${a.desc}</div>`).join("")}</div>
          </details>
        ` : ""}
        <div class="dragon-actions">
          <button id="feed-dragon-btn" class="feed-btn">🍖 Feed (+25 XP, 5 Gems)</button>
          <button id="js-reset-dragon" class="reset-btn">🗑️ Delete (Dev)</button>
        </div>
      </div>
    `;
    
    setTimeout(() => {
      document.getElementById("feed-dragon-btn")?.addEventListener("click", () => feedDragonHandler(5));
      document.getElementById("js-reset-dragon")?.addEventListener("click", resetWyrmling);
    }, 100);
  } catch (e) {
    console.error("Failed to load dragon:", e);
    ownedContent.innerHTML = "<p>Error loading dragon.</p>";
  }
}

function calculateModifier(score) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function getDragonImage(name) {
  const key = name.toLowerCase().trim();
  return dragonImages[key] || "https://via.placeholder.com/120x120/666666/ffffff?text=🐲";
}

async function generateRandomStatBlock() {
  const container = document.getElementById("statBlockDetails");
  if (!container || dragonsData.length === 0) {
    await fetchDragonsList();
    return;
  }

  container.innerHTML = "<p>Summoning dragon...</p>";
  const random = dragonsData[Math.floor(Math.random() * dragonsData.length)];

  try {
    const res = await fetch(`https://www.dnd5eapi.co${random.url}`);
    const monster = await res.json();
    const givenInput = document.getElementById("givename");
    const customName = (givenInput?.value.trim()) || monster.name;
    const img = getDragonImage(monster.name);
    
    container.innerHTML = renderStatBlock(monster, customName, monster.name, img);
    totalSummons++;
    localStorage.setItem("dragonSummons", totalSummons);
    updateQuickStats();
  } catch (error) {
    console.error("Failed to fetch:", error);
    container.innerHTML = "<p>Error summoning dragon.</p>";
  }
}

function renderStatBlock(m, name, type, imageUrl) {
  const renderActions = arr => (arr || []).slice(0,5).map(a => `<div><strong>${a.name}:</strong> ${a.desc}</div>`).join("");
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
          <p class="dragon-type-line">Type: ${type}</p>
        </div>
      </div>
      <div class="stat-block-stats">
        <p><strong>AC:</strong> ${Array.isArray(m.armor_class)?m.armor_class[0].value:m.armor_class}</p>
        <p><strong>HP:</strong> ${m.hit_points} (${m.hit_dice})</p>
        <p><strong>Speed:</strong> ${Object.entries(m.speed||{}).map(([k,v])=>`${k} ${v}`).join(", ")}</p>
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

function filterDragons() {
  const filter = document.getElementById("dragonFilter")?.value;
  let filteredData = dragonsData;
  
  if (filter === "wyrmling") filteredData = wyrmlingData;
  else if (filter === "adult") filteredData = dragonsData.filter(m => m.name.toLowerCase().includes("adult") && !m.name.toLowerCase().includes("wyrmling"));
  else if (filter === "ancient") filteredData = dragonsData.filter(m => m.name.toLowerCase().includes("ancient"));
  
  dragonsData = filteredData;
  console.log(`🔍 Filtered: ${filter} (${filteredData.length})`);
}

function applyCustomName() {
  const input = document.getElementById("givename");
  if (!input?.value.trim()) return;
  generateRandomStatBlock(); // Uses input name automatically
}

function updateDragonProgress() {
  const player = getPlayer();
  const progressBar = document.getElementById("dragon-progress-bar");
  const xpText = document.getElementById("dragon-xp");
  
  if (!progressBar || !xpText || !player) return;
  
  const currentXP = player.dragonExperience || 0;
  const nextLevelXP = getXpForLevel(player.dragonLevel + 1);
  const percent = Math.min((currentXP / nextLevelXP) * 100, 100);
  
  progressBar.style.width = percent + "%";
  xpText.textContent = `${currentXP} / ${nextLevelXP} XP`;
}

function updateQuickStats() {
  const totalSummonsEl = document.getElementById("totalSummons");
  if (totalSummonsEl) {
    totalSummons = parseInt(localStorage.getItem("dragonSummons")) || 0;
    totalSummonsEl.textContent = totalSummons;
  }
}

function resetPlayerLevel() {
  if (!confirm("🔄 Reset dragon level to 0? (Dev only)")) return;
  const player = getPlayer();
  if (!player) return;

  player.dragonLevel = 0;
  player.dragonName = null;
  player.dragonId = null;
  player.dragonExperience = 0;

  savePlayer(player);
  initOwnedDragons();
  updateDragonProgress();
  alert("✅ Reset complete!");
}
