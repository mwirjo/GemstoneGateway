// playerLoader.js
import { qs, getLocalStorage, setLocalStorage } from "./utils.mjs";

// -----------------------------
// Player Loading & Header Update
// -----------------------------
export function loadPlayer(playerObj) {
    setLocalStorage("player", playerObj);
    updateHeader(playerObj);
}

export function getPlayer() {
    return getLocalStorage("player");
}

export function loadPlayerFromUsername(username, payload = {}) {
    let player = getLocalStorage("player");
    
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
// Header Rendering
// -----------------------------
export function updateHeader(player) {
    const nameEl = qs("#player-name");
    const gemEl = qs("#gem-amount");
    const levelEl = qs("#dragon-level");
    const profileContainer = qs(".player-profile");
    const profileIcon = qs(".player-profile .profile-icon");

    if (nameEl) nameEl.textContent = player.name;
    if (gemEl) gemEl.textContent = player.gems;
    if (levelEl) levelEl.textContent = "Lvl " + player.dragonLevel;

    const existingLetter = qs(".profile-letter", profileContainer);
    if (existingLetter) existingLetter.remove();

    if (player.icon) {
        profileIcon.src = player.icon;
        profileIcon.style.display = "inline-block";
    } else {
        profileIcon.style.display = "none";
        const letterEl = document.createElement("span");
        letterEl.textContent = player.name.charAt(0).toUpperCase() || "M";
        letterEl.classList.add("profile-letter");
        profileContainer.appendChild(letterEl);
    }
}

// -----------------------------
// Player Actions
// -----------------------------
export function savePlayer(player) {
    setLocalStorage("player", player);
    updateHeader(player);
}

export function addGems(amount = 1) {
    const player = getPlayer();
    if (!player) return;
    player.gems += amount;
    savePlayer(player);
}

export function feedDragon(cost = 5) {
    const player = getPlayer();
    if (!player) return;

    if (player.gems < cost) return alert("Not enough gems!");
    player.gems -= cost;
    player.dragonExperience += 5;

    if (player.dragonExperience >= 10) {
        player.dragonLevel += 1;
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
