
import { qs } from "../js/utils.mjs";

async function loadMineral() {
  try {
    // 1. Get mineral name AND category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const mineralName = urlParams.get("mineral");
    const category = urlParams.get("category") || "elements";
    
    if (!mineralName) {
      qs("#mineral-detail").innerHTML = "<h2>❌ Selecteer een mineraal</h2>";
      return;
    }
    
    // 2. Load DYNAMIC JSON - NO 'this' + CORRECT VITE PATH
    const jsonPath = `/json/${category}.json`;  // ← FIXED: /json/ NOT ./json/
    console.log("🔍 Loading:", jsonPath);
    const response = await fetch(jsonPath);
    const data = await response.json();
    
    // 3. Find mineral (URL-safe matching)
    const mineral = data.minerals.find(m => 
      m.name.toLowerCase().replace(/\s+/g, "-") === mineralName
    );
    
    if (!mineral) {
      qs("#mineral-detail").innerHTML = `<h2>❌ Mineraal "${mineralName}" niet gevonden in ${category}</h2>`;
      return;
    }
    
    // 4. Fill ALL fields
    fillMineralData(mineral);
    
  } catch (error) {
    console.error("Load error:", error);
    qs("#mineral-detail").innerHTML = "<h2>❌ Data laden mislukt</h2>";
  }
}


function fillMineralData(mineral) {
  // Header
  qs("#mineral-name").textContent = mineral.name;
  qs("#mineral-number").textContent = mineral.number;
  
  qs("#mineral-image").alt = mineral.name;
  
  // Basic properties
  qs("#formula").textContent = mineral.formula;
  qs("#color").textContent = mineral.color;
  qs("#streak").textContent = mineral.streak;
  qs("#hardness").textContent = mineral.hardness;
  qs("#habit").textContent = mineral.habit;
  qs("#luster").textContent = mineral.luster;
  qs("#cleavage").textContent = mineral.cleavage;
  qs("#fracture").textContent = mineral.fracture;
  
  // Typical properties list
  qs("#properties-list").innerHTML = mineral.properties
    .map(prop => `<li>${prop}</li>`)
    .join("");
  
  // Additional info
  qs("#crystal-system").textContent = mineral.crystalSystem;
  qs("#occurrences").textContent = mineral.occurrences;
  qs("#locations").textContent = mineral.locations.join(", ");
  qs("#associations").textContent = mineral.associations.join(", ");
  qs("#uses").textContent = mineral.uses.join(", ");
  qs("#etymology").textContent = mineral.etymology;
  
  // Mark Done button
  setupMarkDone(mineral.name);
  
  document.getElementById("mineral-title").textContent = `${mineral.name} | GemstoneGateway`;
}

function setupMarkDone(mineralName) {
  const btn = qs("#markMineralDone");
  btn.addEventListener("click", async () => {
    // Use YOUR addGems system
    const { addGems } = await import("./playerLoader.js");
    addGems(2);
    
    // Visual feedback
    btn.innerHTML = "✅ +2 GEMS!";
    btn.style.background = "#28a745";
    btn.disabled = true;
    
    // Track completed mineral
    const completed = JSON.parse(localStorage.getItem("completedMinerals") || "[]");
    if (!completed.includes(mineralName)) {
      completed.push(mineralName);
      localStorage.setItem("completedMinerals", JSON.stringify(completed));
    }
    
    setTimeout(() => {
      btn.innerHTML = "+2 GEMS EARNED";
      btn.disabled = false;
      btn.style.background = "";
    }, 2000);
  });
}

// START when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadMineral();
});


