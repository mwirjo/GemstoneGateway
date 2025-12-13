// 🐉 COMPLETE SIMPLE DRAGON.JS - ONE HATCH ONLY!
import { initPlayerHeader } from "./playerLoader.js";

let ownedDragons = JSON.parse(localStorage.getItem("ownedDragons")) || [];
let playerGems = parseInt(localStorage.getItem("playerGems")) || 100;

// 🔥 COMPLETE EVENT HANDLERS + ALL FEATURES
document.addEventListener("DOMContentLoaded", () => {
  initPlayerHeader();  // YOUR login system
  updateDisplay();
  showDragonSection();
  bindAllEvents();
  updateQuickStats();
});

function bindAllEvents() {
  document.addEventListener("click", (e) => {
    if(e.target.id === "hatchDragon" || e.target.id === "hatchBtn") hatchDragon();
    if(e.target.id === "feedBtn") feedDragon();
    if(e.target.id === "resetBtn" || e.target.id === "collectionBtn") resetGame();
    if(e.target.id === "devResetLevel") devReset();
    if(e.target.id === "generateBtn") generateRandomDragon();
    if(e.target.id === "applyNameBtn") applyCustomName();
  });

  const filterEl = document.getElementById("dragonFilter");
  if(filterEl) {
    filterEl.addEventListener("change", (e) => {
      document.getElementById("dragonFilter").value = e.target.value;
    });
  }
}

function updateDisplay() {
  // Header
  document.getElementById("gem-amount").textContent = playerGems;
  document.getElementById("owned-count").textContent = ownedDragons.length;
  
  // Quick stats
  updateQuickStats();
}

function updateQuickStats() {
  document.getElementById("collection-count") ? 
    document.getElementById("collection-count").textContent = ownedDragons.length : null;
  document.getElementById("totalSummons") ? 
    document.getElementById("totalSummons").textContent = 1 : null;
  document.getElementById("active-level") ? 
    document.getElementById("active-level").textContent = ownedDragons[0]?.level || 0 : null;
}

function showDragonSection() {
  const content = document.getElementById("ownedDragonContent");
  
  if(ownedDragons.length === 0) {
    content.innerHTML = `
      <div style="text-align: center; padding: 40px; background: linear-gradient(145deg, #1a1a2e, #16213e); border-radius: 20px; max-width: 500px; margin: 0 auto;">
        <div style="font-size: 6em; margin: 20px 0;">🥚</div>
        <h2 style="color: gold; margin: 0;">Your First Dragon Awaits!</h2>
        <p style="color: #ccc; font-size: 18px;">Click to hatch your ONE FREE wyrmling companion!</p>
        <button id="hatchDragon" style="padding: 20px 40px; font-size: 24px; background: linear-gradient(45deg, gold, orange); border: none; border-radius: 50px; cursor: pointer; font-weight: bold; box-shadow: 0 10px 30px rgba(255,215,0,0.4);">
          🐉 HATCH MY WYRLING (FREE!)
        </button>
        <p style="color: #888; font-size: 14px; margin-top: 20px;">💎 ${playerGems} Gems Available</p>
      </div>
    `;
  } else {
    const dragon = ownedDragons[0];
    const xpPercent = Math.min((dragon.xp / dragon.maxXp) * 100, 100);
    
    content.innerHTML = `
      <div style="text-align: center; padding: 30px; background: linear-gradient(145deg, #2d1b69, #1e0f3d); border-radius: 20px; border: 3px solid gold; max-width: 500px; margin: 0 auto;">
        <h2 style="color: gold; margin: 0 0 10px 0;">🐲 ${dragon.name}</h2>
        <div style="font-size: 4em; margin: 20px 0;">${getDragonEmoji(dragon.name)}</div>
        <p style="color: white; font-size: 20px; margin: 5px 0;"><strong>Lvl ${dragon.level} Wyrmling</strong></p>
        <p style="color: #ccc;">HP: 25 | AC: 15</p>
        
        <div style="margin: 25px 0; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: white;">${dragon.xp} / ${dragon.maxXp} XP</span>
            <span style="color: gold;">Lvl ${dragon.level + 1} in ${Math.ceil((dragon.maxXp - dragon.xp)/25)} feeds</span>
          </div>
          <div style="background: #333; height: 25px; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, gold, orange); height: 100%; width: ${xpPercent}%; transition: width 0.5s ease;"></div>
          </div>
        </div>
        
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
          <button id="feedBtn" style="padding: 15px 30px; background: linear-gradient(45deg, #4ade80, #22c55e); color: white; border: none; border-radius: 25px; font-size: 18px; font-weight: bold; cursor: pointer; box-shadow: 0 8px 25px rgba(74,222,128,0.4);">
            🍖 Feed (${dragon.level * 5} Gems)
          </button>
          <button id="resetBtn" style="padding: 15px 30px; background: linear-gradient(45deg, #ef4444, #dc2626); color: white; border: none; border-radius: 25px; font-size: 18px; font-weight: bold; cursor: pointer; box-shadow: 0 8px 25px rgba(239,68,68,0.4);">
            🔄 New Dragon
          </button>
        </div>
        <p style="color: #888; font-size: 14px; margin-top: 20px;">💎 ${playerGems} Gems Remaining</p>
      </div>
    `;
  }
}

function hatchDragon() {
  if(ownedDragons.length > 0) {
    alert("You already have a dragon!");
    return;
  }
  
  const wyrmlingNames = ["Brass Wyrmling", "Bronze Wyrmling", "Copper Wyrmling", "Silver Wyrmling"];
  const name = wyrmlingNames[Math.floor(Math.random() * wyrmlingNames.length)];
  
  ownedDragons = [{
    name: name,
    level: 1,
    xp: 0,
    maxXp: 100
  }];
  
  localStorage.setItem("ownedDragons", JSON.stringify(ownedDragons));
  showDragonSection();
  updateDisplay();
  alert(`🥚 ${name} hatched successfully!\n\nFeed it gems to level up!`);
}

function feedDragon() {
  if(ownedDragons.length === 0) {
    alert("Hatch your dragon first!");
    return;
  }
  
  const cost = ownedDragons[0].level * 5;
  if(playerGems < cost) {
    alert(`❌ Need ${cost} gems to feed!\nYou have ${playerGems} gems`);
    return;
  }
  
  playerGems -= cost;
  const dragon = ownedDragons[0];
  dragon.xp += 25 * dragon.level;
  
  if(dragon.xp >= dragon.maxXp) {
    dragon.level++;
    dragon.xp = 0;
    dragon.maxXp = Math.floor(dragon.maxXp * 1.5);
    alert(`🎉 LEVEL UP!\n${dragon.name} reached Lvl ${dragon.level}!\nNext level needs ${dragon.maxXp} XP`);
  } else {
    alert(`🍖 Fed! +${25 * dragon.level} XP\n${dragon.xp}/${dragon.maxXp} until next level`);
  }
  
  localStorage.setItem("playerGems", playerGems);
  localStorage.setItem("ownedDragons", JSON.stringify(ownedDragons));
  updateDisplay();
  showDragonSection();
}

function resetGame() {
  if(confirm("Start over with a new dragon?")) {
    ownedDragons = [];
    localStorage.setItem("ownedDragons", "[]");
    showDragonSection();
  }
}

function devReset() {
  if(confirm("Delete ALL data and restart?")) {
    localStorage.clear();
    location.reload();
  }
}

function generateRandomDragon() {
  // Stat block generator
  document.getElementById("statBlockDetails").innerHTML = `
    <div style="background: linear-gradient(145deg, #1e3a8a, #1e40af); padding: 20px; border-radius: 15px; color: white;">
      <h3>🧙‍♂️ Ancient Red Dragon</h3>
      <p><strong>Huge Dragon, Chaotic Evil</strong></p>
      <p>AC 22 | HP 546 | Speed 40ft, fly 80ft, swim 40ft</p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px;">
        <div>STR 30 (+10)</div><div>DEX 10 (+0)</div><div>CON 29 (+9)</div>
        <div>INT 16 (+3)</div><div>WIS 15 (+2)</div><div>CHA 23 (+6)</div>
      </div>
    </div>
  `;
}

function applyCustomName() {
  const input = document.getElementById("givename");
  if(input && input.value.trim()) {
    if(ownedDragons.length > 0) {
      ownedDragons[0].name = input.value.trim();
      localStorage.setItem("ownedDragons", JSON.stringify(ownedDragons));
      showDragonSection();
    }
    input.value = "";
  }
}

function getDragonEmoji(name) {
  const emojis = {
    "Brass": "🟡", "Bronze": "🟤", "Copper": "🟠", "Silver": "⚪"
  };
  for(let color in emojis) {
    if(name.includes(color)) return emojis[color];
  }
  return "🐲";
}
