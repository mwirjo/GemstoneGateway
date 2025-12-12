// dragon.js - Wyrmling system with stable saving
import { getPlayer, updateHeader, feedDragon, savePlayer } from "./player_loader.js";

let dragonImages = {};
let dragonsData = [];
let wyrmlingData = [];

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Load player FIRST
  const user = getPlayer();
  if (user) updateHeader(user);

  // 2. Initialize everything
  await Promise.all([loadDragonImages(), fetchDragonsList()]);
  fetchWyrmlings();
  initOwnedDragons();

  // 3. Setup generate button
  const genBtn = document.getElementById("generateBtn");
    if (genBtn) genBtn.addEventListener("click", generateRandomStatBlock);
  const devResetBtn = document.getElementById("devResetLevel");
  if (devResetBtn) {
    devResetBtn.addEventListener("click", resetPlayerLevel);
  }
});

// -------------------------------------------------
// 1. Load dragon images
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

// -------------------------------------------------
// 2. Fetch ALL dragons
// -------------------------------------------------
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

// -------------------------------------------------
// 3. Filter WYRLINGS from dragonsData
// -------------------------------------------------
function fetchWyrmlings() {
  wyrmlingData = dragonsData.filter(m =>
    m.name.toLowerCase().includes("wyrmling")
  );
  console.log("🥚 Wyrmlings found:", wyrmlingData.length);
}

// -------------------------------------------------
// 4. Owned Dragons Section
// -------------------------------------------------
function initOwnedDragons() {
  const ownedContent = document.getElementById("ownedDragonContent");
  const player = getPlayer();

  if (!ownedContent) return;

  if (!player || player.dragonLevel === 0 || !player.dragonId) {
    ownedContent.innerHTML = `
      <p>You don't own any dragons yet!</p>
      <button id="hatchDragon" class="hatch-btn">🥚 Hatch a Dragon</button>
    `;
    const hatchBtn = document.getElementById("hatchDragon");
    if (hatchBtn) hatchBtn.addEventListener("click", hatchDragon);
  } else {
    showOwnedDragonStats();
  }
}

// -------------------------------------------------
// 5. HATCH DRAGON - Gets random WYRMILING
// -------------------------------------------------
async function hatchDragon() {
  const player = getPlayer();
  if (!player || player.dragonLevel > 0) return;

  const ownedContent = document.getElementById("ownedDragonContent");
  if (!ownedContent) return;

  ownedContent.innerHTML = "<p>Hatching your wyrmling...</p>";

  if (wyrmlingData.length === 0) {
    fetchWyrmlings();
    if (wyrmlingData.length === 0) {
      ownedContent.innerHTML = "<p>No wyrmlings available!</p>";
      return;
    }
  }

  const randomWyrmling = wyrmlingData[Math.floor(Math.random() * wyrmlingData.length)];

  try {
    // Fetch full wyrmling once to get display data
    const res = await fetch(`https://www.dnd5eapi.co${randomWyrmling.url}`);
    const wyrmling = await res.json();

    // Update player and SAVE
    player.dragonLevel = 1;
    player.dragonId = randomWyrmling.url;      // store ONLY the relative url
    player.dragonName = wyrmling.name;        // default = type name ("Black Dragon Wyrmling")
    savePlayer(player);                       // Updates header + localStorage

    // Update UI
    await showOwnedDragonStats();
    await generateRandomStatBlock(); // optional: show some dragon

    alert(`🥚 Your ${wyrmling.name} wyrmling has hatched! Dragon level: 1`);
  } catch (error) {
    console.error("Hatch failed:", error);
    ownedContent.innerHTML = "<p>Error hatching. Try again!</p>";
  }
}

// -------------------------------------------------
// Name check: keeps type name, offers custom
// -------------------------------------------------
function checkAndNameDragon(dragon) {
  const player = getPlayer();
  if (!player || !dragon || player.dragonLevel === 0) return;

  const dragonTypeName = dragon.name; // e.g. "Black Dragon Wyrmling"

  const isCustomNamed =
    player.dragonName &&
    player.dragonName !== dragonTypeName &&
    !player.dragonName.includes("Wyrmling") &&
    !player.dragonName.includes("Dragon");

  if (isCustomNamed) return;

  const suggestedName =
    dragonTypeName.split(" ")[0] + " the " + ((dragon.color && dragon.color[0]?.toUpperCase() + dragon.color.slice(1)) || "Wyrmling");

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

// -------------------------------------------------
// Dev reset
// -------------------------------------------------
function resetWyrmling() {
  if (!confirm("🗑️ Delete your wyrmling and reset to level 0? (Dev only)")) return;

  const player = getPlayer();
  if (!player) return;

  player.dragonLevel = 0;
  player.dragonName = null;
  player.dragonId = null;
  player.dragonExperience = 0;

  savePlayer(player);
  initOwnedDragons();

  alert("🗑️ Wyrmling deleted! Back to level 0. Hatch a new one!");
}

// -------------------------------------------------
// 6. Show Owned Dragon Stats
// -------------------------------------------------
async function showOwnedDragonStats() {
  const player = getPlayer();
  const ownedContent = document.getElementById("ownedDragonContent");
  if (!ownedContent) return;

  if (!player?.dragonId) {
      ownedContent.innerHTML = "<p>No dragon data found.</p>";
    return;
  }

  ownedContent.innerHTML = "<p>Loading dragon...</p>";

  try {
    const res = await fetch(`https://www.dnd5eapi.co${player.dragonId}`);
    const dragon = await res.json();

    const img = getDragonImage(dragon.name);
    const ac = Array.isArray(dragon.armor_class)
      ? dragon.armor_class[0].value
      : dragon.armor_class;

    

    const refreshedPlayer = getPlayer(); // after savePlayer
    ownedContent.innerHTML = `
      <div class="dragon-stat-bar" style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px;">
        <div style="text-align:center;">
          <img src="${img}" style="width:120px;height:120px;border-radius:50%;object-fit:cover; border: 3px solid #f39c12;">
        </div>
        <h3 style="color: #f39c12; margin: 10px 0;">🐲 ${refreshedPlayer.dragonName} (Lvl ${refreshedPlayer.dragonLevel})</h3>

        <p><strong>Size:</strong> ${dragon.size} dragon ${dragon.type?.type || "chromatic"}</p>
        <p><strong>Armor Class:</strong> ${ac} (natural armor)</p>
        <p><strong>Hit Points:</strong> ${dragon.hit_points} (${dragon.hit_dice})</p>
        <p><strong>Speed:</strong> ${Object.entries(dragon.speed || {})
          .map(([k, v]) => `${k} ${v} ft.`)
          .join(", ")}</p>

        <div class="abilities" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0; font-size: 14px;">
          <div><strong>STR</strong><br>${dragon.strength} (${calculateModifier(dragon.strength)})</div>
          <div><strong>DEX</strong><br>${dragon.dexterity} (${calculateModifier(dragon.dexterity)})</div>
          <div><strong>CON</strong><br>${dragon.constitution} (${calculateModifier(dragon.constitution)})</div>
          <div><strong>INT</strong><br>${dragon.intelligence} (${calculateModifier(dragon.intelligence)})</div>
          <div><strong>WIS</strong><br>${dragon.wisdom} (${calculateModifier(dragon.wisdom)})</div>
          <div><strong>CHA</strong><br>${dragon.charisma} (${calculateModifier(dragon.charisma)})</div>
        </div>

        <p><strong>Challenge:</strong> ${dragon.challenge_rating} (${Math.round(dragon.challenge_rating * 450)} XP)</p>

        ${dragon.actions && dragon.actions.length > 0
          ? `
            <details style="margin-top: 15px;">
              <summary style="cursor: pointer; color: #f39c12;">Actions</summary>
              <div style="margin-top: 10px; font-size: 13px;">
                ${dragon.actions
                  .slice(0, 3)
                  .map(a => `<div><strong>${a.name}:</strong> ${a.desc}</div>`)
                  .join("")}
              </div>
            </details>
          `
          : ""}

        <div style="display:flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
          <button id="feed-dragon-btn" style="flex: 1; min-width: 160px; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
            🍖 Feed Dragon (5 Gems)
          </button>
          <button id="reset-dragon-btn" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
            🗑️ Delete Wyrmling (Dev)
          </button>
        </div>
      </div>
    `;
                    
   
    setTimeout(() => {
      const feedBtn = document.getElementById("feed-dragon-btn");
      if (feedBtn) feedBtn.addEventListener("click", () => feedDragon(5));

      const resetBtn = document.getElementById("reset-dragon-btn");
      if (resetBtn) resetBtn.addEventListener("click", resetWyrmling);
    }, 0);
  } catch (e) {
    console.error("Failed to load owned dragon", e);
    ownedContent.innerHTML = "<p>Error loading your dragon.</p>";
    }
    
}

// -------------------------------------------------
// 7. Helpers
// -------------------------------------------------
function calculateModifier(score) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function getDragonImage(name) {
  const key = name.toLowerCase().trim();
  return dragonImages[key] || "https://via.placeholder.com/100x100/666666/ffffff?text=🐲";
}

// -------------------------------------------------
// 8. Generate Random Stat Block (Summon - ALL dragons)
// -------------------------------------------------
async function generateRandomStatBlock() {
  const container = document.getElementById("statBlockDetails");
  if (!container) return;

  if (dragonsData.length === 0) await fetchDragonsList();

  container.innerHTML = "<p>Loading dragon...</p>";
  const random = dragonsData[Math.floor(Math.random() * dragonsData.length)];

  try {
    const res = await fetch(`https://www.dnd5eapi.co${random.url}`);
    const monster = await res.json();
    const givenInput = document.getElementById("givename");
    const customName = (givenInput?.value.trim()) || monster.name;
    const img = getDragonImage(monster.name);
    container.innerHTML = renderStatBlock(monster, customName, monster.name, img);
  } catch (error) {
    console.error("❌ Failed to fetch monster details", error);
    container.innerHTML = "<p>Error fetching dragon.</p>";
  }
}

// -------------------------------------------------
// 9. Render Stat Block (unchanged)
// -------------------------------------------------
function renderStatBlock(m, name, type, imageUrl) {
  const renderActions = arr =>
    (arr || []).map(a => `<div><strong>${a.name}.</strong> ${a.desc}</div>`).join("");

  const formatProficiencies = (prof, t) =>
    (prof || [])
      .filter(p => p.proficiency.name.includes(t))
      .map(p => `${p.proficiency.name.split(": ")[1]} ${calculateModifier(p.value)}`)
      .join(", ") || "—";

  return `
    <div class="stat-block">
      <div style="text-align:center;margin-bottom:15px;">
        <img src="${imageUrl}" class="dragon-image">
      </div>
      <h1>${name}</h1>
      <p class="dragon-type-line">Dragon Type: ${type}</p>
      <p><strong>Armor Class:</strong> ${Array.isArray(m.armor_class) ? m.armor_class[0].value : m.armor_class}</p>
      <p><strong>HP:</strong> ${m.hit_points} (${m.hit_dice})</p>
      <p><strong>Speed:</strong> ${Object.entries(m.speed || {}).map(([k, v]) => `${k} ${v}`).join(", ")}</p>
      <div class="abilities">
        <div><strong>STR</strong> ${m.strength} (${calculateModifier(m.strength)})</div>
        <div><strong>DEX</strong> ${m.dexterity} (${calculateModifier(m.dexterity)})</div>
        <div><strong>CON</strong> ${m.constitution} (${calculateModifier(m.constitution)})</div>
        <div><strong>INT</strong> ${m.intelligence} (${calculateModifier(m.intelligence)})</div>
        <div><strong>WIS</strong> ${m.wisdom} (${calculateModifier(m.wisdom)})</div>
        <div><strong>CHA</strong> ${m.charisma} (${calculateModifier(m.charisma)})</div>
      </div>
      <p><strong>Saving Throws:</strong> ${formatProficiencies(m.proficiencies, "Saving Throw")}</p>
      <p><strong>Skills:</strong> ${formatProficiencies(m.proficiencies, "Skill")}</p>
      <h2>Actions</h2>${renderActions(m.actions)}
      ${m.legendary_actions ? `<h2>Legendary Actions</h2>${renderActions(m.legendary_actions)}` : ""}
    </div>
  `;
}

function resetPlayerLevel() {
  if (!confirm("🔄 Reset dragon level to 0? (Dev only)\n\nThis will:\n• Set level to 0\n• Clear dragon data\n• Keep your gems & name")) return;

  const player = getPlayer();
  if (!player) return;

  player.dragonLevel = 0;
  player.dragonName = null;
  player.dragonId = null;
  player.dragonExperience = 0;

  savePlayer(player);
  initOwnedDragons();
  
  alert("✅ Level reset to 0! Ready to hatch a new wyrmling! 🥚");
}
