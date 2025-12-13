// playerLoader.js - localStorage ONLY - UPDATES EVERY TIME!
import { qs, getLocalStorage, setLocalStorage } from "./utils.mjs";

let currentPlayer = null;

// -----------------------------
// PLAYER CLASS - SAVES TO localStorage
// -----------------------------
export class Player {
  constructor(username, data = {}) {
    this.username = username;
    this.gems = data.gems || 0;
    this.dragonLevel = data.dragonLevel || 0;
    this.dragonExperience = data.dragonExperience || 0;
    this.dragonMood = data.dragonMood || "Happy";
    this.icon = data.icon || null;
    
    this._autoSave();
    this._autoUpdateHeader();
  }

  addGems(amount = 1) {
    this.gems = Math.max(0, this.gems + amount);
    console.log(`💎 ${this.username}: +${amount} gems = ${this.gems}`); // DEBUG
    this._autoSave();
    this._autoUpdateHeader();
    return this.gems;
  }

  _autoSave() {
    // SAVES TO localStorage - WORKS EVERY TIME!
    const allPlayers = getLocalStorage("allPlayers") || {};
    allPlayers[this.username] = {
      gems: this.gems,
      dragonLevel: this.dragonLevel,
      dragonExperience: this.dragonExperience,
      dragonMood: this.dragonMood,
      icon: this.icon
    };
    setLocalStorage("allPlayers", allPlayers);
    console.log("💾 SAVED:", allPlayers[this.username]); // DEBUG
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
  
  // Get existing stats or start fresh
  const playerData = allPlayers[username] || {
    gems: 0,
    dragonLevel: 0,
    dragonExperience: 0,
    dragonMood: "Happy",
    icon: payload.picture || null
  };
  
  currentPlayer = new Player(username, playerData);
  setLocalStorage("currentUser", username);
  
  console.log("✅ LOADED:", currentPlayer.username, playerData.gems, "gems"); // DEBUG
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
// Header
// -----------------------------
function updateHeader(player) {
  const nameEl = qs("#player-name");
  const gemEl = qs("#gem-amount");
  const levelEl = qs("#dragon-level");
  const logoutBtn = qs("#logout-btn");

  if (player && player.username) {
    if (nameEl) nameEl.textContent = player.username;
    if (gemEl) gemEl.textContent = `${player.gems} `;
    if (levelEl) levelEl.textContent = `Lvl ${player.dragonLevel}`;
    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.onclick = logoutPlayer;
    }
  } else {
    if (nameEl) nameEl.textContent = "";
    if (gemEl) gemEl.textContent = "";
    if (levelEl) levelEl.textContent = "";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

export function initPlayerHeader() {
  getPlayer();
}
