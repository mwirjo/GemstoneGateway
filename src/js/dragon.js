import { qs, getLocalStorage, setLocalStorage, setClick } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", () => {
  // Retrieve player data or create default
  let player = getLocalStorage("player") || {
    name: "Mimi",
    gems: 2,
    dragonLevel: 1,
    dragonExperience: 0,
    dragonMood: "Happy",
    icon: null // null means no custom icon chosen
  };

  // Save player data
  function savePlayer() {
    setLocalStorage("player", player);
  }

  // Update header elements
  function updateHeader() {
    // Player name
    qs("#player-name").textContent = player.name;

    // Gems and dragon level
    qs("#gem-amount").textContent = player.gems;
    qs("#dragon-level").textContent = "Lvl " + player.dragonLevel;

    // Profile icon or default letter
    const profileContainer = qs(".player-profile");
    const profileIcon = qs(".player-profile .profile-icon");

    // Remove any existing letter element
    const existingLetter = qs(".profile-letter", profileContainer);
    if (existingLetter) existingLetter.remove();

    if (player.icon) {
      profileIcon.src = player.icon;
      profileIcon.style.display = "inline-block";
    } else {
      profileIcon.style.display = "none";

      // Create default letter element
      const letterEl = document.createElement("span");
      letterEl.textContent = player.name.charAt(0).toUpperCase() || "M";
      letterEl.classList.add("profile-letter");
      profileContainer.appendChild(letterEl);
    }
  }

  // Add gems
  function addGems(amount = 1) {
    player.gems += amount;
    savePlayer();
    updateHeader();
  }

  // Feed dragon
  function feedDragon(cost = 5) {
    if (player.gems >= cost) {
      player.gems -= cost;
      player.dragonExperience += 5;

      // Level up every 10 exp
      if (player.dragonExperience >= 10) {
        player.dragonLevel += 1;
        player.dragonExperience = 0;
        alert("Your dragon leveled up!");
      }

      savePlayer();
      updateHeader();
    } else {
      alert("Not enough gems to feed your dragon!");
    }
  }

  // Optional random dragon event
  function dragonEvent() {
    const events = [
      "Found a shiny gem!",
      "Dragon is sleepy",
      "Dragon learned a trick"
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    alert("Event: " + event);

    if (event === "Found a shiny gem!") addGems(3);
  }

  // Initialize header
  updateHeader();

  // Expose globally
  window.addGems = addGems;
  window.feedDragon = feedDragon;
  window.dragonEvent = dragonEvent;

  // Attach feed dragon button if exists
  const feedBtn = qs("#feed-dragon-btn");
  if (feedBtn) setClick("#feed-dragon-btn", () => feedDragon(5));
});
