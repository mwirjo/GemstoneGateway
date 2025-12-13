// playerLoader.js - COMPLETE with dragonId & dragonName SUPPORT!
import { qs, getLocalStorage, setLocalStorage } from "./utils.mjs";

let currentPlayer = null;

// -----------------------------
// PLAYER CLASS - FULL DRAGON SUPPORT
// -----------------------------
export class Player {
  constructor(username, data = {}) {
    this.username = username;
    this.gems = data.gems || 0;
    this.dragonLevel = data.dragonLevel || 0;
    this.dragonExperience = data.dragonExperience || 0;
    this.dragonId = data.dragonId || null;           // 🐉 ACTIVE DRAGON ID
    this.dragonName = data.dragonName || null;       // 🐉 ACTIVE DRAGON NAME
    this.dragonMood = data.dragonMood || "Happy";
    this.icon = data.icon || null;
    
    this._autoSave();
    this._autoUpdateHeader();
  }

  addGems(amount = 1) {
    this.gems = Math.max(0, this.gems + amount);
    console.log(`💎 ${this.username}: +${amount} gems = ${this.gems}`);
    this._autoSave();
    this._autoUpdateHeader();
    return this.gems;
  }

  // 🐉 DRAGON METHODS - AUTO-SAVE!
  setActiveDragon(id, name, level = 1, xp = 0) {
    this.dragonId = id;
    this.dragonName = name;
    this.dragonLevel = level;
    this.dragonExperience = xp;
    this._autoSave();
    this._autoUpdateHeader();
    console.log(`🐉 Active: ${name} (Lvl ${level})`);
  }

  addDragonXP(amount) {
    this.dragonExperience = Math.max(0, (this.dragonExperience || 0) + amount);
    this._autoSave();
    this._autoUpdateHeader();
  }

  levelUpDragon() {
    this.dragonLevel += 1;
    this.dragonExperience = 0;
    this._autoSave();
    this._autoUpdateHeader();
    console.log(`🎉 ${this.dragonName} leveled to ${this.dragonLevel}!`);
  }

  resetDragon() {
    this.dragonLevel = 0;
    this.dragonExperience = 0;
    this.dragonId = null;
    this.dragonName = null;
    this._autoSave();
    this._autoUpdateHeader();
  }

  spendGems(amount) {
    if (this.gems >= amount) {
      this.gems -= amount;
      this._autoSave();
      this._autoUpdateHeader();
      return true;
    }
    return false;
  }

  _autoSave() {
    const allPlayers = getLocalStorage("allPlayers") || {};
    allPlayers[this.username] = {
      gems: this.gems,
      dragonLevel: this.dragonLevel,
      dragonExperience: this.dragonExperience,
      dragonId: this.dragonId,
      dragonName: this.dragonName,
      dragonMood: this.dragonMood,
      icon: this.icon
    };
    setLocalStorage("allPlayers", allPlayers);
    console.log("💾 SAVED:", allPlayers[this.username]);
  }

  _autoUpdateHeader() {
    updateHeader(this);
  }
}

// -----------------------------
// LOAD/SAVE FUNCTIONS
// -----------------------------
export async function loadPlayerFromUsername(username, payload = {}) {
  const allPlayers = getLocalStorage("allPlayers") || {};
  
  const playerData = allPlayers[username] || {
    gems: 0,
    dragonLevel: 0,
    dragonExperience: 0,
    dragonId: null,
    dragonName: null,
    dragonMood: "Happy",
    icon: payload.picture || null
  };
  
  currentPlayer = new Player(username, playerData);
  setLocalStorage("currentUser", username);
  
  console.log("✅ LOADED:", currentPlayer.username, playerData.gems, "gems");
  return currentPlayer;
}

export function getPlayer() {
  if (!currentPlayer) {
    const username = getLocalStorage("currentUser");
    if (username) {
      const allPlayers = getLocalStorage("allPlayers") || {};
      if (allPlayers[username]) {
        currentPlayer = new Player(username, allPlayers[username]);
      }
    }
  }
  return currentPlayer;
}

export function logoutPlayer() {
  localStorage.removeItem("currentUser");
  currentPlayer = null;
  updateHeader(null);
  window.location.href = "/";
}

export function addGems(amount = 1) {
  const player = getPlayer();
  return player ? player.addGems(amount) : 0;
}

// -----------------------------
// Header Display
// -----------------------------
function updateHeader(player) {
  const nameEl = qs("#player-name");
  const gemEl = qs("#gem-amount");
  const levelEl = qs("#dragon-level");
  const logoutBtn = qs("#logout-btn");

  if (player && player.username) {
    if (nameEl) nameEl.textContent = player.username;
    if (gemEl) gemEl.textContent = `${player.gems} `;
    if (levelEl) {
      const dragonDisplay = player.dragonLevel > 0 
        ? `Lvl ${player.dragonLevel}`  // ✅ ONLY NUMBER!
        : "No Dragon";
      levelEl.textContent = dragonDisplay;
    }
    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.onclick = logoutPlayer;
    }
  } else {
    if (nameEl) nameEl.textContent = "Guest";
    if (gemEl) gemEl.textContent = "0 💎";
    if (levelEl) levelEl.textContent = "🐲 No Dragon";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}


export function initPlayerHeader() {
  getPlayer();
  updateHeader(getPlayer());
}
