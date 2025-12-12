// mineralDetails.mjs
import { qs } from "./utils.mjs";

export default class mineralDetails {
  constructor(mineralId, dataSource, category) {
    this.mineralId = mineralId;       // number from URL
    this.category = category || "elements";
    this.dataSource = dataSource;
    this.mineral = {};
  }

  async init() {
    try {
      this.mineral = await this.dataSource.findMineralByNumber(this.mineralId);
      if (!this.mineral) {
        qs("#mineral-detail").innerHTML =
          `<h2>❌ Mineraal "${this.mineralId}" niet gevonden</h2>`;
        return;
      }
      this.renderMineralDetails();
    } catch (err) {
      console.error("Load error:", err);
      qs("#mineral-detail").innerHTML = "<h2>❌ Data laden mislukt</h2>";
    }
  }

  renderMineralDetails() {
    this.fillMineralData();
  }

  fillMineralData() {
    const mineral = this.mineral;

    qs("#mineral-name").textContent = mineral.name;
    qs("#mineral-number").textContent = mineral.number || "";

    const img = qs("#mineral-image");
    img.src = `https://corsproxy.io/?${encodeURIComponent(mineral.image)}`;
    img.alt = mineral.name;

    qs("#formula").textContent = mineral.formula || "";
    qs("#color").textContent = mineral.color || "";
    qs("#streak").textContent = mineral.streak || "";
    qs("#hardness").textContent = mineral.hardness || "";
    qs("#habit").textContent = mineral.habit || "";
    qs("#luster").textContent = mineral.luster || "";
    qs("#cleavage").textContent = mineral.cleavage || "";
    qs("#fracture").textContent = mineral.fracture || "";

    const propsList = qs("#properties-list");
    propsList.innerHTML =
      mineral.properties?.map(p => `<li>${p}</li>`).join("") ||
      "<li>Geen eigenschappen</li>";

    qs("#crystal-system").textContent = mineral.crystalSystem || "";
    qs("#occurrences").textContent = mineral.occurrences || "";
    qs("#locations").textContent = mineral.locations?.join(", ") || "";
    qs("#associations").textContent = mineral.associations?.join(", ") || "";
    qs("#uses").textContent = mineral.uses?.join(", ") || "";
    qs("#etymology").textContent = mineral.etymology || "";

    this.setupMarkDone(mineral.name);
    this.setupBackButton();

    document.title = `${mineral.name} | GemstoneGateway`;
    const titleEl = document.getElementById("mineral-title");
    if (titleEl) titleEl.textContent = `${mineral.name} | GemstoneGateway`;
  }

  setupBackButton() {
    const backBtn = qs("#back-to-list");
    if (!backBtn) return;
    backBtn.onclick = () => {
      window.location.href = `/mineral-listing.html?category=${this.category}`;
    };
  }

  setupMarkDone(mineralName) {
    const btn = qs("#markMineralDone");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      try {
        const { addGems } = await import("./playerLoader.js");
        addGems(2);

        btn.innerHTML = "✅ +2 GEMS!";
        btn.style.background = "#28a745";
        btn.disabled = true;

        const completed = JSON.parse(
          localStorage.getItem("completedMinerals") || "[]"
        );
        if (!completed.includes(mineralName)) {
          completed.push(mineralName);
          localStorage.setItem(
            "completedMinerals",
            JSON.stringify(completed)
          );
        }

        setTimeout(() => {
          btn.innerHTML = "+2 GEMS EARNED";
          btn.disabled = false;
          btn.style.background = "";
        }, 2000);
      } catch (err) {
        console.error("Gems error:", err);
      }
    });
  }
}
