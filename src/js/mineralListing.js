
import { qs } from "./utils.mjs";

async function loadElements() {
  const response = await fetch("/json/elements.json");
  const data = await response.json();
  
  const grid = qs("#minerals-grid");
  data.minerals.forEach(mineral => {
    const card = createMineralCard(mineral);
    grid.appendChild(card);
  });
}

function createMineralCard(mineral) {
  const div = document.createElement("div");
  div.className = "mineral-card";
  div.dataset.mineral = mineral.name.toLowerCase();
  div.innerHTML = `
    <div class="mineral-image">
      <img src="images/${mineral.image}" alt="${mineral.name}" loading="lazy">
    </div>
    <h3>${mineral.name}</h3>
    <p class="formula">${mineral.formula}</p>
    <p class="properties">${mineral.properties[0]}</p>
  `;
  
  div.addEventListener("click", () => {
    window.location.href = `/mineral_pages/index.html?mineral=${mineral.name.toLowerCase()}`;
  });
  
  return div;
}

loadElements();
