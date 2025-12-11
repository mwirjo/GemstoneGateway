
import { getPlayer, updateHeader, feedDragon, addGems, } from "./playerLoader.js";

document.addEventListener("DOMContentLoaded", () => {
    const user = getPlayer();
    if (user) updateHeader(user);

    // Example: feed button
    const feedBtn = document.getElementById("feed-dragon-btn");
    if (feedBtn) feedBtn.addEventListener("click", () => feedDragon(5));
});

// -------------------------------------------------
// 1. Load your image JSON
// -------------------------------------------------
let dragonImages = {};

async function loadDragonImages() {
  try {
    const response = await fetch("/json/dragonImages.json");
    dragonImages = await response.json();

    // Normalize keys
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
// 2. Fetch all dragons from D&D 5e API
// -------------------------------------------------
let dragonsData = [];

async function fetchDragonsList() {
  try {
    const res = await fetch("https://www.dnd5eapi.co/api/monsters");
    const data = await res.json();

    dragonsData = data.results.filter(m =>
      m.name.toLowerCase().includes("dragon")
    );

    console.log("🐉 Dragons found:", dragonsData.length);
  } catch (error) {
    console.error("❌ Monster list fetch failed", error);
  }
}

// -------------------------------------------------
// 3. Helpers
// -------------------------------------------------
function calculateModifier(score) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function getDragonImage(name) {
  const key = name.toLowerCase().trim();

  if (dragonImages[key]) {
    return dragonImages[key];
  }

  console.warn("❌ No image found for:", name);
  return "https://via.placeholder.com/400x150/aaaaaa/000000?text=No+Image";
}

// -------------------------------------------------
// 4. Generate Random Dragon
// -------------------------------------------------
async function generateRandomStatBlock() {
  const container = document.getElementById("statBlockDetails");

  if (dragonsData.length === 0) {
    await fetchDragonsList();
  }

  container.innerHTML = "<p>Loading dragon...</p>";

  const random = dragonsData[Math.floor(Math.random() * dragonsData.length)];

  try {
    const res = await fetch(`https://www.dnd5eapi.co${random.url}`);
    const monster = await res.json();

    const customName =
      document.getElementById("givename").value.trim() || monster.name;

    const img = getDragonImage(monster.name);

    container.innerHTML = renderStatBlock(monster, customName, monster.name, img);

  } catch (error) {
    console.error("❌ Failed to fetch monster details", error);
    container.innerHTML = "<p>Error fetching dragon.</p>";
  }
}

// -------------------------------------------------
// 5. Render Stat Block HTML
// -------------------------------------------------
function renderStatBlock(m, name, type, imageUrl) {

  const renderActions = arr =>
    (arr || [])
      .map(a => `<div><strong>${a.name}.</strong> ${a.desc}</div>`)
      .join("");

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

      <p><strong>Armor Class:</strong> ${
        Array.isArray(m.armor_class) ? m.armor_class[0].value : m.armor_class
      }</p>

      <p><strong>HP:</strong> ${m.hit_points} (${m.hit_dice})</p>

      <p><strong>Speed:</strong> ${Object.entries(m.speed || {})
        .map(([k, v]) => `${k} ${v}`)
        .join(", ")}</p>

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

      <h2>Actions</h2>
      ${renderActions(m.actions)}

      ${
        m.legendary_actions
          ? `<h2>Legendary Actions</h2>${renderActions(m.legendary_actions)}`
          : ""
      }
    </div>
  `;
}

// -------------------------------------------------
// 6. Init
// -------------------------------------------------
document.getElementById("generateBtn").addEventListener("click", generateRandomStatBlock);
loadDragonImages();
fetchDragonsList();

