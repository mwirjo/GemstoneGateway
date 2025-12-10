/* window.onload = function() {
  google.accounts.id.initialize({
    client_id: "1031057805656-uord657egn0hlei92g9ubtm3pur4u5mg.apps.googleusercontent.com",
      callback: handleGoogleLogin
  });

  google.accounts.id.renderButton(
    document.getElementById("google-login"),
    { theme: "outline", size: "large" }
  );
};

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
  }, 30); // adjust speed

  // When user clicks login button, show options
  showLoginBtn.addEventListener("click", () => {
    loginOptions.style.display = "flex"; // or block
    showLoginBtn.style.display = "none";
  });

  // Guest login (skip)
  document.getElementById("guest-login").addEventListener("click", () => {
    preloader.style.display = "none";
    mainContent.style.display = "block";
  });

  // Google login (real implementation)
  google.accounts.id.initialize({
    client_id: "1031057805656-uord657egn0hlei92g9ubtm3pur4u5mg.apps.googleusercontent.com",
    callback: handleGoogleLogin
  });

  google.accounts.id.renderButton(
    document.getElementById("google-login"),
    { theme: "outline", size: "large" }
  );

  function handleGoogleLogin(response) {
    console.log("JWT token:", response.credential);
    preloader.style.display = "none";
    mainContent.style.display = "block";
  }

  // Email login (optional placeholder)
  document.getElementById("email-login").addEventListener("click", () => {
    alert("Email login not implemented yet");
  });
});
 */