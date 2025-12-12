export default class MineralList {
  constructor(category, dataSource, element) {
    this.category = category || "elements";
    this.dataSource = dataSource;
    this.element = element;
  }

  async init() {
    try {
      const minerals = await this.dataSource.getMinerals(this.category);
      this.renderList(minerals);
    } catch (error) {
      console.error("Minerals load failed:", error);
      this.element.innerHTML = `<p>❌ ${error.message}</p>`;
    }
  }

  renderList(minerals) {
    this.element.innerHTML = "";
    minerals.forEach((mineral) => {
      const card = this.createMineralCard(mineral);
      this.element.appendChild(card);
    });
  }

  createMineralCard(mineral) {
    const div = document.createElement("div");
    div.className = "mineral-card";
    div.dataset.mineral = mineral.name.toLowerCase().replace(/\s+/g, "-");
    div.innerHTML = `
      <div class="mineral-image">
        <img src="/images/${mineral.image}" alt="${mineral.name}" loading="lazy">
      </div>
      <h3>${mineral.name}</h3>
      <p class="formula">${mineral.formula}</p>
      <p class="properties">${mineral.properties[0]}</p>
    `;
    
        // In mineralList.mjs createMineralCard()
    div.addEventListener("click", () => {
      window.location.href = `/mineral/index.html?mineral=${mineral.name.toLowerCase().replace(/\s+/g, "-")}&category=${this.category}`;
    });

    
    return div;
  }
}

