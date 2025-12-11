// ---------------------------
// 1. Load your dragonImages.json
// ---------------------------
let dragonImages = {};

async function loadDragonImages() {
  const res = await fetch("/data/dragonImages.json");
  const json = await res.json();

  // normalize keys
  const normalized = {};
  for (const k in json) {
    normalized[k.toLowerCase()] = json[k];
  }
  dragonImages = normalized;

  console.log("✔ Loaded dragonImages:", Object.keys(dragonImages).length);
}

// Helper to match image
function getDragonImage(name) {
  const key = name.toLowerCase();
  if (dragonImages[key]) return dragonImages[key];

  // Fuzzy match by color words
  const colors = ["red", "black", "blue", "green", "white", "gold", "silver", "bronze", "brass", "copper", "wyrmling"];
  for (const c of colors) {
    if (key.includes(c)) {
      const match = Object.keys(dragonImages).find(k => k.includes(c));
      if (match) return dragonImages[match];
    }
  }

  return null; // missing
}

// ---------------------------
// 2. Load Dragons from D&D API
// ---------------------------
async function loadAllDragons() {
  console.log("Loading monster index...");
  const res = await fetch("https://www.dnd5eapi.co/api/monsters");
  const list = await res.json();

  // Only dragons
  const dragonEntries = list.results.filter(m => m.index.includes("dragon"));
  console.log("Found dragons:", dragonEntries.length);

  const container = document.getElementById("dragon-list");
  container.innerHTML = `<h1>Dragon Image Test</h1>`;

  for (const entry of dragonEntries) {
    const monsterRes = await fetch(`https://www.dnd5eapi.co${entry.url}`);
    const monster = await monsterRes.json();

    const displayName = monster.name.toLowerCase();
    const img = getDragonImage(displayName);

    container.innerHTML += `
      <div style="border:1px solid #333;padding:10px;margin:10px;border-radius:10px;background:#111;color:white;">
        <h2>${monster.name}</h2>
        <p><strong>CR:</strong> ${monster.challenge_rating}</p>
        <p><strong>Type:</strong> ${monster.type}</p>

        ${img ? `<img src="${img}" style="width:180px;border-radius:10px;">`
              : `<p style="color:red;font-weight:bold;">❌ Missing image</p>`}
      </div>
    `;
  }
}

// ---------------------------
// 3. Run Everything
// ---------------------------
(async function () {
  await loadDragonImages();
  await loadAllDragons();
})();
