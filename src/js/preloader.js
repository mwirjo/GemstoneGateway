// src/js/preloader.js
/* global google */
import { googleClientId } from "./externalServices.js";


document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.getElementById("progress-bar");
  const showLoginBtn = document.getElementById("show-login-btn");
  const loginOptions = document.getElementById("login-options");
  const preloader = document.getElementById("preloader");
  const mainContent = document.getElementById("main-content");

  // Animate progress bar 0-100%
  let width = 0;
  const interval = setInterval(() => {
    width++;
    progressBar.style.width = width + "%";
    if (width >= 100) {
      clearInterval(interval);
      showLoginBtn.style.display = "block"; // Show login button
    }
  }, 30);

  // Show login options
  showLoginBtn.addEventListener("click", () => {
    loginOptions.style.display = "flex";
    showLoginBtn.style.display = "none";
  });

  // Guest login
  document.getElementById("guest-login").addEventListener("click", () => {
    preloader.style.display = "none";
    mainContent.style.display = "block";
  });

  // Email login placeholder
  document.getElementById("email-login").addEventListener("click", () => {
    alert("Email login not implemented yet");
  });

  // Initialize Google login only after GIS script loads
  function initGoogleLogin() {
    if (!window.google) {
      console.error("Google Identity Services not loaded yet.");
      return;
    }

    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
      document.getElementById("google-login"),
      { theme: "outline", size: "large" }
    );
  }

  function handleGoogleLogin(response) {
    console.log("JWT token:", response.credential);
    preloader.style.display = "none";
    mainContent.style.display = "block";
  }

  // Wait for the GIS script to load
  const gisScript = document.createElement("script");
  gisScript.src = "https://accounts.google.com/gsi/client";
  gisScript.async = true;
  gisScript.defer = true;
  gisScript.onload = initGoogleLogin;
  document.head.appendChild(gisScript);
});
