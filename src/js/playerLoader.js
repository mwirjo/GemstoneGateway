// playerLoader.js - Render/Vite Production Safe
import { qs, getLocalStorage, setLocalStorage } from "./utils.mjs";

// -----------------------------
// Player Loading & Header Update (SAFE)
// -----------------------------
export function loadPlayer(playerObj) {
    if (!playerObj) return;
    setLocalStorage("player", playerObj);
    updateHeader(playerObj);
}

export function getPlayer() {
    try {
        return getLocalStorage("player");
    } catch {
        return null;
    }
}

export function loadPlayerFromUsername(username, payload = {}) {
    if (!username) return;
    
    let player = getPlayer();
    
    if (!player || player.name !== username) {
        player = {
            name: username,
            email: payload.email || "",
            gems: 0,
            dragonLevel: 0,
            dragonExperience: 0,
            dragonMood: "Happy",
            icon: payload.picture || null
        };
        setLocalStorage("player", player);
    }
    updateHeader(player);
}

// -----------------------------
// Header Rendering (FULLY NULL-SAFE)
// -----------------------------
export function updateHeader(player) {
    if (!player) return;
    
    // Safe null checks for ALL DOM elements
    const nameEl = qs("#player-name");
    const gemEl = qs("#gem-amount");
    const levelEl = qs("#dragon-level");
    const profileContainer = qs(".player-profile");
    const profileIcon = qs(".player-profile .profile-icon");

    if (nameEl) nameEl.textContent = player.name;
    if (gemEl) gemEl.textContent = player.gems;
    if (levelEl) levelEl.textContent = "Lvl " + player.dragonLevel;

    // Safe profile icon/letter handling
    if (profileContainer) {
        const existingLetter = qs(".profile-letter", profileContainer);
        if (existingLetter) existingLetter.remove();

        if (player.icon && profileIcon) {
            profileIcon.src = player.icon;
            profileIcon.style.display = "inline-block";
        } else if (profileIcon) {
            profileIcon.style.display = "none";
            const letterEl = document.createElement("span");
            letterEl.textContent = player.name.charAt(0).toUpperCase() || "M";
            letterEl.classList.add("profile-letter");
            profileContainer.appendChild(letterEl);
        }
    }
}

// -----------------------------
// Player Actions (SAFE)
// -----------------------------
export function savePlayer(player) {
    if (!player) return;
    setLocalStorage("player", player);
    updateHeader(player);
}

export function addGems(amount = 1) {
    const player = getPlayer();
    if (!player) return;
    player.gems = Math.max(0, (player.gems || 0) + amount);
    savePlayer(player);
}

export function feedDragon(cost = 5) {
    const player = getPlayer();
    if (!player || (player.gems || 0) < cost) {
        return alert("Not enough gems!");
    }
    
    player.gems -= cost;
    player.dragonExperience = (player.dragonExperience || 0) + 5;

    if (player.dragonExperience >= 10) {
        player.dragonLevel = (player.dragonLevel || 0) + 1;
        player.dragonExperience = 0;
        alert("Your dragon leveled up!");
    }

    savePlayer(player);
}

export function dragonEvent() {
    const player = getPlayer();
    if (!player) return;

    const events = ["Found a shiny gem!", "Dragon is sleepy", "Dragon learned a trick"];
    const event = events[Math.floor(Math.random() * events.length)];
    alert("Event: " + event);

    if (event === "Found a shiny gem!") addGems(3);
}

// -----------------------------
// INIT - Safe initialization for Render
// -----------------------------
export function initPlayerHeader() {
    const player = getPlayer();
    if (player) {
        // Delay DOM check for Render/Vite
        requestAnimationFrame(() => updateHeader(player));
    }
}
