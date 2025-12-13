// mineralDetails.mjs - FIXED VERSION
import { qs } from "./utils.mjs";
import { addGems } from "./playerLoader.js";  // ✅ FIXED: Import at top

export default class mineralDetails {
  constructor(mineralId, dataSource, category) {
    this.mineralId = mineralId;
    this.category = category || "elements";
    this.dataSource = dataSource;
    this.mineral = {};
  }

  async init() {
    try {
      this.mineral = await this.dataSource.findMineralByNumber(this.mineralId);
      if (!this.mineral) {
        qs("#mineral-detail").innerHTML = `<h2>❌ Mineral "${this.mineralId}" not found</h2>`;
        return;
      }
      this.renderMineralDetails();
    } catch (err) {
      console.error("Load error:", err);
      qs("#mineral-detail").innerHTML = "<h2>❌ Failed to load data</h2>";
    }
  }

  renderMineralDetails() {
    this.fillMineralData();
  }

  fillMineralData() {
    const mineral = this.mineral;

    // Basic info
    qs("#mineral-name").textContent = mineral.name;
    qs("#mineral-number").textContent = mineral.number || "";

    // Image with error handling
    const img = qs("#mineral-image");
    img.src = `https://corsproxy.io/?${encodeURIComponent(mineral.image)}`;
    img.alt = mineral.name;
    img.onerror = () => { img.src = "/images/placeholder-mineral.jpg"; }; // ✅ Added

    // Properties
    qs("#formula").textContent = mineral.formula || "";
    qs("#color").textContent = mineral.color || "";
    qs("#streak").textContent = mineral.streak || "";
    qs("#hardness").textContent = mineral.hardness || "";
    qs("#habit").textContent = mineral.habit || "";
    qs("#luster").textContent = mineral.luster || "";
    qs("#cleavage").textContent = mineral.cleavage || "";
    qs("#fracture").textContent = mineral.fracture || "";

    // Properties list
    const propsList = qs("#properties-list");
    propsList.innerHTML = mineral.properties?.map(p => `<li>${p}</li>`).join("") || 
                         "<li>No properties listed</li>";

    // Advanced info
    qs("#crystal-system").textContent = mineral.crystalSystem || "";
    qs("#occurrences").textContent = mineral.occurrences || "";
    qs("#locations").textContent = mineral.locations?.join(", ") || "";
    qs("#associations").textContent = mineral.associations?.join(", ") || "";
    qs("#uses").textContent = mineral.uses?.join(", ") || "";
    qs("#etymology").textContent = mineral.etymology || "";

    // Setup buttons
    this.setupMarkDone(mineral.name);
    this.setupBackButton();

    // Update title
    document.title = `${mineral.name} | GemstoneGateway`;
    const titleEl = document.getElementById("mineral-title");
    if (titleEl) titleEl.textContent = `${mineral.name} | GemstoneGateway`;
  }

  setupBackButton() {
  const backBtn = qs("#back-to-list");   // ✅ Use class selector
  if (!backBtn) return;
  
  // ✅ DYNAMIC TEXT & URL based on category
  const categoryNames = {
    "elements": "Alle Elementen",
    "oxides": "Alle Oxiden", 
    "halides": "Alle Haliden",
    "sulfides": "Alle Sulfiden",
    "carbonates": "Alle Carbonaten",
    "sulfates": "Alle Sulfaten",
    "phosphates": "Alle Fosfaten",
    "nesosilicates": "Alle Nesosilicaten",
    "sorosilicates": "Alle Sorosilicaten",
    "cyclosilicates": "Alle Cyclosilicaten",
    "inosilicates": "Alle Inosilicaten",
    "phyllosilicates": "Alle Fyllosilicaten",
    "tektosilicates": "Alle Tektosilicaten",
    "macroscopic": "Macroscopische Mineralen"
  };
  
  const categoryName = categoryNames[this.category] || "Mineralen";
  backBtn.textContent = `← Back ${categoryName}`;
  backBtn.href = `/minerallist/?category=${this.category}`;  // ✅ Dynamic URL
}


  async setupMarkDone(mineralName) {  // ✅ FIXED: async
    const btn = qs("#markMineralDone");
    if (!btn) return;

    btn.addEventListener("click", async () => {  // ✅ FIXED: async
      try {
        // ✅ FIXED: await addGems
        await addGems(2);

        // Visual feedback
        const originalText = btn.innerHTML;
        btn.innerHTML = "✅ +2 GEMS!";
        btn.style.background = "#28a745";
        btn.style.transform = "scale(0.95)";
        btn.disabled = true;

        // Track completion
        const completed = JSON.parse(localStorage.getItem("completedMinerals") || "[]");
        if (!completed.includes(mineralName)) {
          completed.push(mineralName);
          localStorage.setItem("completedMinerals", JSON.stringify(completed));
        }

        // Reset after celebration
        setTimeout(() => {
          btn.innerHTML = "+2 GEMS";  // ✅ FIXED: consistent text
          btn.disabled = false;
          btn.style.background = "";
          btn.style.transform = "";
        }, 2000);

      } catch (err) {
        console.error("Gems error:", err);
        btn.innerHTML = "❌ Try again";
        setTimeout(() => { btn.innerHTML = "+2 GEMS"; }, 1500);
      }
    });
  }
}
