/*global google */
import { loadPlayerFromUsername, getPlayer, initPlayerHeader } from "./playerLoader.js";
import { qs, getLocalStorage, setLocalStorage } from "./utils.mjs";
import { googleClientId } from "./mineralServices.mjs";

let currentGooglePayload = null;

document.addEventListener("DOMContentLoaded", () => {
    
    const progressBar = qs("#progress-bar");
    const mainButtons = qs(".auth-main-buttons");
    const preloader = qs("#preloader");
    const mainContent = qs("#main-content");
    const googleUsernameForm = qs("#google-username-form");
    const googleUsernameInput = qs("#google-username-input");
    const googleSaveBtn = qs("#google-save-username");
 
    // -----------------------------
    // If player already logged in - SKIP LOGIN!
    // -----------------------------
    const player = getPlayer();
    if (player) {
        preloader.style.display = "none";
        mainContent.style.display = "block";
        return;
    }

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
    // HELPER: Hide preloader, show main
    // -----------------------------
    function hidePreloaderShowMain() {
        preloader.style.display = "none";
        mainContent.style.display = "block";
    }

    // -----------------------------
    // GUEST LOGIN - JSON SAFE!
    // -----------------------------
    qs("#guest-login").addEventListener("click", async () => {
        try {
            await loadPlayerFromUsername("Guest");
            hidePreloaderShowMain();
        } catch (error) {
            console.error("Guest login failed:", error);
            alert("Guest login failed. Try again.");
        }
    });

    // -----------------------------
    // Google login
    // -----------------------------
    function renderGoogleButton() {
        if (!window.google) {
            return console.error("Google Identity Services not loaded yet.");
        }
        google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleLogin
        });
        google.accounts.id.renderButton(qs("#google-login"), { 
            theme: "outline", 
            size: "large",
            width: "100%"
        });
    }

    function parseJwt(token) {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    }

    async function handleGoogleLogin(response) {
        try {
            const payload = parseJwt(response.credential);
            currentGooglePayload = payload;
            
            const googleId = payload.sub;
            const savedUsers = JSON.parse(localStorage.getItem("googleUsers") || "{}");
            const username = savedUsers[googleId];

            if (username) {
                // Existing Google user - load with preserved stats!
                await loadPlayerFromUsername(username, payload);
                hidePreloaderShowMain();
            } else {
                // New Google user - show username form
                mainButtons.style.display = "none";
                googleUsernameForm.style.display = "flex";
                googleUsernameForm.dataset.googleId = googleId;
            }
        } catch (error) {
            console.error("Google login failed:", error);
            alert("Google login failed. Try guest mode.");
        }
    }

    // -----------------------------
    // SAVE GOOGLE USERNAME - PRESERVES STATS!
    // -----------------------------
    googleSaveBtn.addEventListener("click", async () => {
        const username = googleUsernameInput.value.trim();
        if (!username) {
            return alert("Enter a username!");
        }
        
        const googleId = googleUsernameForm.dataset.googleId;
        const savedUsers = JSON.parse(localStorage.getItem("googleUsers") || "{}");
        
        if (Object.values(savedUsers).includes(username)) {
            return alert("Username already taken!");
        }
        
        // Save Google ID → Username mapping
        savedUsers[googleId] = username;
        localStorage.setItem("googleUsers", JSON.stringify(savedUsers));

        try {
            // ✅ Load player with Google data + preserved stats!
            await loadPlayerFromUsername(username, {
                email: currentGooglePayload?.email || "",
                icon: currentGooglePayload?.picture || null
            });
            googleUsernameForm.style.display = "none";
            hidePreloaderShowMain();
        } catch (error) {
            console.error("Google save failed:", error);
            alert("Login failed. Try again.");
        }
    });

    // -----------------------------
    // Enter key support for username input
    // -----------------------------
    googleUsernameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            googleSaveBtn.click();
        }
    });

    // -----------------------------
    // Load Google Identity Services
    // -----------------------------
    // Load GIS script - NO inner quotes problem!
if (!document.querySelector(`script[src="https://accounts.google.com/gsi/client"]`)) {
    const gisScript = document.createElement("script");
    gisScript.src = `https://accounts.google.com/gsi/client`;
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = () => console.log("✅ Google Identity Services loaded!");
    document.head.appendChild(gisScript);
    }
    
});
