// guess.js - 13 Mineral Categories → Pick 5 Random!
import { addGems, initPlayerHeader } from "./playerLoader.js";
import MineralServices from "./mineralServices.mjs";

let mineralService;
let categoryData = {};  // { "elements": [...], "oxides": [...], etc. }
let currentChallenge = [];
let currentIndex = 0;
let answeredCount = 0;
let correctCount = 0;

const VALID_CATEGORIES = [
  "elements", "oxides", "halides", "sulfides", 
  "carbonates", "sulfates", "phosphates",
  "nesosilicates", "sorosilicates", "cyclosilicates", 
  "inosilicates", "phyllosilicates", "tektosilicates"
];

document.addEventListener("DOMContentLoaded", async () => {
  initPlayerHeader();
  await loadAllCategories();
});

async function loadAllCategories() {
  try {
    // Load ALL categories
    for (const category of VALID_CATEGORIES) {
      try {
        mineralService = new MineralServices(category);
        const minerals = await mineralService.getMinerals(category);
        if (minerals && minerals.length > 0) {
          categoryData[category] = minerals;
          console.log(`✅ ${category}: ${minerals.length} minerals`);
        }
      } catch (e) {
        console.log(`⚠️ ${category} failed to load`);
      }
    }
    console.log("🧠 Loaded categories:", Object.keys(categoryData));
    setupGuessGame();
  } catch (error) {
    console.error("❌ Load failed:", error);
  }
}

function setupGuessGame() {
  if (Object.keys(categoryData).length === 0) {
    document.getElementById("minerals-grid").innerHTML = "<p>Loading categories...</p>";
    return;
  }

  const checkBtn = document.getElementById("check-formula");
  const input = document.getElementById("formula-input");
  
  if (checkBtn) checkBtn.addEventListener("click", checkGuess);
  if (input) input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkGuess();
  });
  
  generateNewChallenge();
}

function generateNewChallenge() {
  const availableCategories = Object.keys(categoryData).filter(cat => categoryData[cat].length > 0);
  
  if (availableCategories.length === 0) {
    console.error("No categories available!");
    return;
  }
  
  // ✅ PICK 5 RANDOM CATEGORIES
  const shuffledCats = [...availableCategories].sort(() => 0.5 - Math.random());
  const selectedCats = shuffledCats.slice(0, 5);
  
  currentChallenge = [];
  answeredCount = 0;
  correctCount = 0;
  currentIndex = 0;
  
  // 1 mineral from EACH selected category
  selectedCats.forEach(category => {
    const minerals = categoryData[category];
    const randomMineral = minerals[Math.floor(Math.random() * minerals.length)];
    currentChallenge.push({ 
      ...randomMineral, 
      category: category.replace(/([A-Z])/g, " $1").trim() 
    });
  });
  
  console.log("🧠 5-Category Challenge:", 
    currentChallenge.map(m => ({cat: m.category, name: m.name, formula: m.formula}))
  );
  
  showCurrentMineral();
  updateProgress();
}

function showCurrentMineral() {
  const grid = document.getElementById("minerals-grid");
  if (!grid) return;
  
  if (!currentChallenge || currentIndex >= currentChallenge.length) {
    grid.innerHTML = `<div class="mineral-card">Loading...</div>`;
    return;
  }
  
  const mineral = currentChallenge[currentIndex];
  const proxyImg = getProxyImageUrl(mineral.image);
  const categoryName = mineral.category || "Unknown";
  
  grid.innerHTML = `
    <div class="mineral-card single" style="background: linear-gradient(145deg, ${mineral.color || "#f0f8ff"}, ${adjustColorBrightness(mineral.color || "#f0f8ff", -20)})">
      <div class="mineral-image">
        <img src="${proxyImg}" alt="${mineral.name}" onerror="this.src="/images/mineral-placeholder.png"" />
      </div>
      <h2>Formula: ${mineral.formula}</h2>
      <div class="mode-badge">🧠 ${categoryName.toUpperCase()}</div>
      <div class="progress-badge">${answeredCount + 1}/5</div>
    </div>
  `;
}

function getProxyImageUrl(imageUrl) {
  return imageUrl ? `https://corsproxy.io/?${encodeURIComponent(imageUrl)}` : "/images/mineral-placeholder.png";
}

function updateProgress() {
  const progressEl = document.getElementById("progress-display");
  if (progressEl) progressEl.textContent = `${answeredCount}/5 answered`;
}

function checkGuess() {
  const input = document.getElementById("formula-input");
  const guess = (input?.value || "").trim().toUpperCase();
  
  if (!guess) {
    showFeedback("Enter the mineral name!", "error");
    return;
  }
  
  const mineral = currentChallenge[currentIndex];
  const isCorrect = mineral.name?.toUpperCase() === guess;
  
  if (isCorrect) correctCount++;
  
  const gemChange = isCorrect ? 2 : -2;
  addGems(gemChange);
  
  showFeedback(
    isCorrect ? 
      `✅ CORRECT! ${mineral.name} (${mineral.category})` :
      `❌ Wrong! It"s ${mineral.name} (${mineral.category})`,
    isCorrect ? "success" : "error",
    gemChange
  );
  
  answeredCount++;
  if (input) input.value = "";
  
  setTimeout(() => {
    if (answeredCount < 5) {
      currentIndex++;
      showCurrentMineral();
      updateProgress();
    } else {
      showGameComplete();
    }
  }, 2000);
}

function showFeedback(message, type, gems = 0) {
  const feedback = document.getElementById("feedback");
  if (!feedback) return;
  
  feedback.innerHTML = `
    <div class="feedback-result ${type}">
      <div>${message}</div>
      <div>Gems: ${gems > 0 ? "+" : ""}${gems} 💎</div>
    </div>
  `;
}

function showGameComplete() {
  const feedback = document.getElementById("feedback");
  const grid = document.getElementById("minerals-grid");
  
  const totalGems = correctCount * 2 - (5 - correctCount) * 2;
  
  if (feedback) {
    feedback.innerHTML = `
      <div class="feedback-result success">
        <h3>🎉 5-CATEGORY GUESS COMPLETE!</h3>
        <div>${correctCount}/5 Correct</div>
        <div><strong>Total Gems: ${totalGems} 💎</strong></div>
        <button id="new-challenge" class="new-challenge-btn">🔄 New 5-Category Challenge</button>
      </div>
    `;
  }
  
  if (grid) grid.innerHTML = "";
  
  setTimeout(() => {
    const newBtn = document.getElementById("new-challenge");
    if (newBtn) {
      newBtn.addEventListener("click", () => {
        if (feedback) feedback.innerHTML = "";
        generateNewChallenge();
      });
    }
  }, 100);
}

function adjustColorBrightness(color, amount) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + 
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
}
