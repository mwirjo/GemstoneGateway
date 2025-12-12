import { renderListWithTemplate } from "./utils.mjs";

function mineralCardTemplate(mineral) {
  const proxyImg = `https://corsproxy.io/?${encodeURIComponent(mineral.image)}`;
  
  return `
    <li class="mineral-card">
      <a href="/mineral/?mineral=${mineral.number}&category=${this.category}">
        <img src="${proxyImg}" alt="${mineral.name}" loading="lazy">
        <h3>${mineral.name}</h3>
        <p class="formula">${mineral.formula}</p>
        <p class="properties">${mineral.properties[0]}</p>
      </a>
    </li>
  `;
}




export default class MineralList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    
    const list = await this.dataSource.getMinerals(this.category);
    this.renderList(list);
    const titleEl = document.querySelector(".title");
    if (titleEl) titleEl.textContent = this.category;  // ✅ Safe
}



  renderList(list) {
  renderListWithTemplate((mineral) => mineralCardTemplate.call(this, mineral), this.listElement, list);
}
}
