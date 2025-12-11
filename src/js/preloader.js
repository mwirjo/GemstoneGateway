/* global google */
import { googleClientId } from "./externalServices.js";
import { qs, getLocalStorage, setLocalStorage, setClick } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // Elements
  // -----------------------------
  const progressBar = qs("#progress-bar");
  const mainButtons = qs(".auth-main-buttons");
  const preloader = qs("#preloader");
  const mainContent = qs("#main-content");
  const googleUsernameForm = qs("#google-username-form");

  const googleUsernameInput = qs("#google-username-input");
  const googleSaveBtn = qs("#google-save-username");

  const feedBtn = qs("#feed-dragon-btn");

  // -----------------------------
  // Progress Bar Animation
  // -----------------------------
  let width = 0;
  const interval = setInterval(() => {
    width++;
    progressBar.style.width = width + "%";
    if (width >= 100) {
      clearInterval(interval);
      mainButtons.style.display = "flex";
      renderGoogleButton();
    }
  }, 30);

  // -----------------------------
  // Guest Login
  // -----------------------------
  qs("#guest-login").addEventListener("click", () => {
    loadPlayer({ name: "Guest", gems: 0, dragonLevel: 0, dragonExperience: 0, dragonMood: "Happy", icon: null });
    preloader.style.display = "none";
    mainContent.style.display = "block";
  });

  // -----------------------------
  // Google Login
  // -----------------------------
  function renderGoogleButton() {
    if (!window.google) return console.error("Google Identity Services not loaded yet.");

    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
      qs("#google-login"),
      { theme: "outline", size: "large" }
    );
  }
    function parseJwt(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
    }

    async function handleGoogleLogin(response) {
        /* localStorage.removeItem("googleUsers");

        console.log("All Google users cleared from localStorage."); */

       
        
        const jwtToken = response.credential;
        const payload = parseJwt(jwtToken);
        const googleId = payload.sub; // persistent user ID

        const savedUsers = getLocalStorage("googleUsers") || {};
        const username = savedUsers[googleId];

        if (username) {
            console.log("Returning Google user:", username);
            loadPlayerFromUsername(username);
            preloader.style.display = "none";
            mainContent.style.display = "block";
        } else {
            console.log("New Google user. Show username form.");
            mainButtons.style.display = "none";
            googleUsernameForm.style.display = "flex";
            googleUsernameForm.dataset.googleId = googleId;
        }
    }


  // -----------------------------
  // Username creation for Google users
  // -----------------------------
  googleSaveBtn.addEventListener("click", () => {
        const username = googleUsernameInput.value.trim();
        if (!username) return alert("Enter a username.");

        const googleId = googleUsernameForm.dataset.googleId;
        const savedUsers = getLocalStorage("googleUsers") || {};

        // Check if username already exists
        const usernames = Object.values(savedUsers);
        if (usernames.includes(username)) return alert("Username already taken.");

        savedUsers[googleId] = username;
        setLocalStorage("googleUsers", savedUsers);

        loadPlayer({ name: username, gems: 0, dragonLevel: 0, dragonExperience: 0, dragonMood: "Happy", icon: null });

        googleUsernameForm.style.display = "none";
        preloader.style.display = "none";
        mainContent.style.display = "block";
        });

  // -----------------------------
  // Player Data
  // -----------------------------
  function loadPlayer(playerObj) {
    setLocalStorage("player", playerObj);
    updateHeader(playerObj);
  }

  function loadPlayerFromUsername(username, payload = null) {
    let player = getLocalStorage("player");
    
    if (!player || player.name !== username) {
        player = {
            name: username,
            email: payload?.email || "",
            gems: 0,
            dragonLevel: 0,
            dragonExperience: 0,
            dragonMood: "Happy",
            icon: payload?.picture || null
        };
        setLocalStorage("player", player);
    }
    updateHeader(player);
}


  function updateHeader(player) {
    qs("#player-name").textContent = player.name;
    qs("#gem-amount").textContent = player.gems;
    qs("#dragon-level").textContent = "Lvl " + player.dragonLevel;

    const profileContainer = qs(".player-profile");
    const profileIcon = qs(".player-profile .profile-icon");

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
  // Dragon Actions
  // -----------------------------
  function savePlayer(player) {
    setLocalStorage("player", player);
    updateHeader(player);
  }

  function addGems(amount = 1) {
    const player = getLocalStorage("player");
    player.gems += amount;
    savePlayer(player);
  }

  function feedDragon(cost = 5) {
    const player = getLocalStorage("player");
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

  function dragonEvent() {
    const player = getLocalStorage("player");
    const events = ["Found a shiny gem!", "Dragon is sleepy", "Dragon learned a trick"];
    const event = events[Math.floor(Math.random() * events.length)];
    alert("Event: " + event);

    if (event === "Found a shiny gem!") addGems(3);
  }

  if (feedBtn) setClick("#feed-dragon-btn", () => feedDragon(5));

  // -----------------------------
  // Load Google Identity Services
  // -----------------------------
  const gisScript = document.createElement("script");
  gisScript.src = "https://accounts.google.com/gsi/client";
  gisScript.async = true;
  gisScript.defer = true;
  gisScript.onload = () => console.log("GIS script loaded.");
  document.head.appendChild(gisScript);
});
