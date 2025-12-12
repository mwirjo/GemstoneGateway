
/*global google */

import { loadPlayer, loadPlayerFromUsername } from "./playerLoader.js";
import { qs, getLocalStorage } from "./utils.mjs";
import { googleClientId } from "./externalServices.js";

document.addEventListener("DOMContentLoaded", () => {
    const progressBar = qs("#progress-bar");
    const mainButtons = qs(".auth-main-buttons");
    const preloader = qs("#preloader");
    const mainContent = qs("#main-content");
    const googleUsernameForm = qs("#google-username-form");
    const googleUsernameInput = qs("#google-username-input");
    const googleSaveBtn = qs("#google-save-username");
    // -----------------------------
    // If player is already logged in

    // -----------------------------
    // Progress bar animation
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
    // Guest login
    // -----------------------------
    qs("#guest-login").addEventListener("click", () => {
        loadPlayer({ name: "Guest", gems: 0, dragonLevel: 0, dragonExperience: 0, dragonMood: "Happy", icon: null });
        preloader.style.display = "none";
        mainContent.style.display = "block";
    });

    // -----------------------------
    // Google login
    // -----------------------------
    function renderGoogleButton() {
        if (!window.google) return console.error("Google Identity Services not loaded yet.");
        google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleLogin
        });
        google.accounts.id.renderButton(qs("#google-login"), { theme: "outline", size: "large" });
    }

    function parseJwt(token) {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    }

    async function handleGoogleLogin(response) {
        const payload = parseJwt(response.credential);
        const googleId = payload.sub;
        const savedUsers = JSON.parse(localStorage.getItem("googleUsers") || "{}");
        const username = savedUsers[googleId];

        if (username) {
            loadPlayerFromUsername(username, payload);
            preloader.style.display = "none";
            mainContent.style.display = "block";
        } else {
            mainButtons.style.display = "none";
            googleUsernameForm.style.display = "flex";
            googleUsernameForm.dataset.googleId = googleId;
        }
    }

    googleSaveBtn.addEventListener("click", () => {
        const username = googleUsernameInput.value.trim();
        if (!username) return alert("Enter a username.");
        const googleId = googleUsernameForm.dataset.googleId;
        const savedUsers = JSON.parse(localStorage.getItem("googleUsers") || "{}");
        if (Object.values(savedUsers).includes(username)) return alert("Username already taken.");
        savedUsers[googleId] = username;
        localStorage.setItem("googleUsers", JSON.stringify(savedUsers));

        loadPlayer({ name: username, gems: 0, dragonLevel: 0, dragonExperience: 0, dragonMood: "Happy", icon: null });
        googleUsernameForm.style.display = "none";
        preloader.style.display = "none";
        mainContent.style.display = "block";
    });

    // Load GIS script
    const gisScript = document.createElement("script");
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = () => console.log("GIS script loaded.");
    document.head.appendChild(gisScript);
});
