/*  global google 
import { googleClientId } from "./externalServices.js";

document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.getElementById("progress-bar");
  const mainButtons = document.querySelector(".auth-main-buttons");
  const loginOptions = document.getElementById("login-section");
  const preloader = document.getElementById("preloader");
  const mainContent = document.getElementById("main-content");

  // -----------------------------
  // Progress Bar Animation
  // -----------------------------
  let width = 0;
  const interval = setInterval(() => {
    width++;
    progressBar.style.width = width + "%";

    if (width >= 100) {
      clearInterval(interval);

      // Show Login and Sign Up buttons
      mainButtons.style.display = "flex";
      mainButtons.style.opacity = "1";
    }
  }, 30);

  // -----------------------------
  // Login (shows login options)
  // -----------------------------
  document.getElementById("show-login-btn").addEventListener("click", () => {
    loginOptions.style.display = "flex";
    mainButtons.style.display = "none";
  });

  // -----------------------------
  // SIGN UP button
  // -----------------------------
  document.getElementById("show-signup-btn").addEventListener("click", () => {
    alert("Signup screen not implemented yet");
  });

  // -----------------------------
  // Guest Login
  // -----------------------------
  document.getElementById("guest-login").addEventListener("click", () => {
    preloader.style.display = "none";
    mainContent.style.display = "block";
  });

  // -----------------------------
  // Email Login (placeholder)
  // -----------------------------
  document.getElementById("email-login").addEventListener("click", () => {
    alert("Email login not implemented yet");
  });

  // -----------------------------
  // Google Login Initialization
  // -----------------------------
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

  // Load GIS script
  const gisScript = document.createElement("script");
  gisScript.src = "https://accounts.google.com/gsi/client";
  gisScript.async = true;
  gisScript.defer = true;
  gisScript.onload = initGoogleLogin;
  document.head.appendChild(gisScript);
});
 */

/* global google */
import { googleClientId, baseURL } from "./externalServices.js";

document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.getElementById("progress-bar");
  const mainButtons = document.querySelector(".auth-main-buttons");
  const loginSection = document.getElementById("login-section");
  const signupSection = document.getElementById("signup-section");
  const preloader = document.getElementById("preloader");
  const mainContent = document.getElementById("main-content");

  const loginMessage = document.getElementById("login-message");
  const signupMessage = document.getElementById("signup-message");

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
      mainButtons.style.opacity = "1";
    }
  }, 30);

  // -----------------------------
  // Show Login Section
  // -----------------------------
  document.getElementById("show-login-btn").addEventListener("click", () => {
    loginSection.style.display = "flex";
    mainButtons.style.display = "none";
  });

  // -----------------------------
  // Show Sign Up Section
  // -----------------------------
  document.getElementById("show-signup-btn").addEventListener("click", () => {
    signupSection.style.display = "flex";
    mainButtons.style.display = "none";
  });

  // -----------------------------
  // Back buttons
  // -----------------------------
  document.querySelectorAll(".back-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      loginSection.style.display = "none";
      signupSection.style.display = "none";
      mainButtons.style.display = "flex";
      loginMessage.textContent = "";
      signupMessage.textContent = "";
    });
  });

  // -----------------------------
  // Guest Login
  // -----------------------------
  document.getElementById("guest-login").addEventListener("click", () => {
    preloader.style.display = "none";
    mainContent.style.display = "block";
  });

  // -----------------------------
  // Email Login (placeholder)
  // -----------------------------
  document.getElementById("email-login").addEventListener("click", async () => {
    const username = document.getElementById("username-input").value.trim();
    if (!username) return loginMessage.textContent = "Enter a username.";

    // Check user with server
    const res = await fetch(`${baseURL}users/check?username=${username}`);
    const data = await res.json();

    if (data.exists) {
      loginMessage.textContent = "";
      preloader.style.display = "none";
      mainContent.style.display = "block";
      console.log("User logged in:", username);
    } else {
      loginMessage.textContent = "Username not found. Please sign up or go back.";
    }
  });

  // -----------------------------
  // Sign Up
  // -----------------------------
  document.getElementById("signup-confirm-btn").addEventListener("click", async () => {
    const username = document.getElementById("signup-username").value.trim();
    if (!username) return signupMessage.textContent = "Enter a username.";

    // Save user to server
    const res = await fetch(`${baseURL}users/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    const data = await res.json();

    if (data.success) {
      signupMessage.textContent = "Account created! Logging in...";
      setTimeout(() => {
        preloader.style.display = "none";
        mainContent.style.display = "block";
      }, 1000);
    } else {
      signupMessage.textContent = "Username already taken.";
    }
  });

  // -----------------------------
  // Google Login Initialization
  // -----------------------------
  function initGoogleLogin() {
    if (!window.google) return console.error("Google Identity Services not loaded yet.");

    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleLogin
    });

    // Render button when login section is visible
    document.getElementById("show-login-btn").addEventListener("click", () => {
      google.accounts.id.renderButton(
        document.getElementById("google-login"),
        { theme: "outline", size: "large" }
      );
    });
  }

  async function handleGoogleLogin(response) {
    const jwtToken = response.credential;

    // Send token to backend for verification & user lookup
    const res = await fetch(`${baseURL}auth/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: jwtToken })
    });
    const data = await res.json();

    if (data.exists) {
      preloader.style.display = "none";
      mainContent.style.display = "block";
      console.log("Google user logged in:", data.username);
    } else {
      loginMessage.textContent = "Google account not registered. Please sign up.";
      loginSection.style.display = "none";
      signupSection.style.display = "flex";
    }
  }

  // -----------------------------
  // Load GIS script
  // -----------------------------
  const gisScript = document.createElement("script");
  gisScript.src = "https://accounts.google.com/gsi/client";
  gisScript.async = true;
  gisScript.defer = true;
  gisScript.onload = initGoogleLogin;
  document.head.appendChild(gisScript);
});
